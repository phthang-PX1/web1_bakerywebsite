/**
 * Sanitizer HTML tối giản (không phụ thuộc thư viện ngoài) dùng ở tầng GHI cho
 * nội dung rich-text do admin nhập (vd mô tả sản phẩm). Đây là lớp phòng thủ
 * chiều sâu bổ sung cho việc Angular tự sanitize khi render [innerHTML]:
 * loại bỏ các vector XSS phổ biến trước khi lưu vào DB.
 *
 * Lưu ý: đây KHÔNG phải sanitizer đầy đủ như DOMPurify. Nó chặn các vector
 * nguy hiểm nhất (script/style/iframe, event handler inline, javascript: URI)
 * chứ không allowlist toàn bộ tag. Nếu cần bảo đảm mạnh hơn, cân nhắc thêm
 * thư viện `sanitize-html` ở đợt hardening sau.
 */
export const sanitizeRichText = (input: string): string => {
  let output = input;

  // 1) Bỏ hẳn nội dung các thẻ thực thi/nhúng nguy hiểm.
  output = output.replace(
    /<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ""
  );
  // Thẻ tự đóng / không có thẻ đóng của cùng nhóm.
  output = output.replace(
    /<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi,
    ""
  );

  // 2) Bỏ mọi event handler inline: onclick=, onerror=, onload=, ...
  output = output.replace(/\son\w+\s*=\s*"[^"]*"/gi, "");
  output = output.replace(/\son\w+\s*=\s*'[^']*'/gi, "");
  output = output.replace(/\son\w+\s*=\s*[^\s>]+/gi, "");

  // 3) Vô hiệu hóa javascript:/data: trong href/src.
  output = output.replace(
    /(href|src)\s*=\s*"(\s*(javascript|data|vbscript):[^"]*)"/gi,
    '$1="#"'
  );
  output = output.replace(
    /(href|src)\s*=\s*'(\s*(javascript|data|vbscript):[^']*)'/gi,
    "$1='#'"
  );

  return output.trim();
};
