/**
 * Seed dữ liệu blog ban đầu (KHÔNG xóa dữ liệu khác — an toàn chạy độc lập).
 * Dùng: npx tsx prisma/seed-blog.ts
 * Idempotent: bỏ qua bài đã tồn tại theo slug.
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { cloudinary } from "../src/config/cloudinary";

const prisma = new PrismaClient();
const frontendPublicDir = path.resolve(__dirname, "../../frontend/public");

const POSTS = [
  {
    slug: "chon-topping-cho-banh-kem",
    title: "Chọn topping cho bánh kem: đẹp mắt mà vẫn cân vị",
    excerpt:
      "Gợi ý phối dâu, cam, cookie và socola để chiếc bánh có điểm nhấn nhưng không bị quá ngọt.",
    coverImage: "/assets/images/toppping-dau.png",
    category: "Mẹo chọn bánh",
    readingTime: "4 phút đọc",
    galleryImages: [
      "/assets/images/topping-cam.png",
      "/assets/images/topping-cookie.png",
      "/assets/images/topping-socola.png"
    ],
    content: [
      "Một chiếc bánh kem ngon thường bắt đầu từ phần nền cân bằng: cốt bánh mềm, lớp kem vừa đủ béo và topping tạo điểm nhấn ở cuối vị. Nếu chọn topping theo màu sắc thôi, bánh rất dễ đẹp ảnh nhưng khi ăn lại bị rời rạc.",
      "Với các vị trái cây như dâu và cam, hãy dùng chúng để làm sáng tổng thể. Dâu hợp với kem phô mai, kem bơ nhẹ và phần nhân chua ngọt. Cam hợp với socola, caramel hoặc các mẫu bánh có tông nâu ấm.",
      "Cookie và socola nên được dùng như lớp tạo độ giòn hoặc vị đậm. Khi bánh đã có nhân caramel hay kem phủ socola, chỉ cần thêm một lượng nhỏ topping cùng nhóm vị để bánh thơm hơn mà không bị nặng."
    ]
  },
  {
    slug: "kem-phu-va-nhan-banh",
    title: "Kem phủ và nhân bánh: phối sao cho chiếc bánh không bị ngấy",
    excerpt:
      "Từ kem bơ, kem dâu đến nhân caramel, mỗi lựa chọn đều thay đổi cảm giác khi thưởng thức.",
    coverImage: "/assets/images/kemphu-dau.png",
    category: "Tùy chỉnh bánh",
    readingTime: "5 phút đọc",
    galleryImages: [
      "/assets/images/kemphu-bo.png",
      "/assets/images/nhan-caramel.png",
      "/assets/images/nhan-kemphomai.png"
    ],
    content: [
      "Kem phủ quyết định ấn tượng đầu tiên của chiếc bánh, còn phần nhân giữ vai trò tạo bất ngờ khi cắt bánh. Hai lớp này nên bổ trợ cho nhau thay vì cùng đẩy một vị lên quá cao.",
      "Nếu chọn kem phủ dâu, phần nhân kem phô mai hoặc mứt dâu mỏng sẽ giúp bánh có độ chua nhẹ. Nếu thích vị béo hơn, kem bơ nên đi với nhân caramel vừa phải để tránh cảm giác quá ngọt.",
      "Với những dịp có nhiều người ăn, công thức an toàn là một lớp kem phủ dịu, một phần nhân có điểm nhấn và topping tiết chế. Bánh sẽ dễ ăn hơn, đặc biệt khi dùng sau bữa chính."
    ]
  },
  {
    slug: "xu-huong-banh-ca-nhan-2026",
    title: "Xu hướng bánh cá nhân 2026: nhỏ gọn, rõ vị, nhiều lựa chọn",
    excerpt:
      "Các mẫu bánh mini và bánh đặt riêng đang được yêu thích vì dễ chia sẻ và linh hoạt hương vị.",
    coverImage: "/assets/images/banner2.png",
    category: "Xu hướng",
    readingTime: "3 phút đọc",
    galleryImages: [
      "/assets/images/mutdau.png",
      "/assets/images/mut-socola.png",
      "/assets/images/topping-whipcream.png"
    ],
    content: [
      "Bánh cá nhân tiếp tục được yêu thích trong năm 2026 vì phù hợp với những buổi tiệc nhỏ, sinh nhật tại văn phòng hoặc món quà bất ngờ trong ngày thường.",
      "Điểm hấp dẫn của dòng bánh này là khách có thể chọn rõ từng lớp vị: cốt bánh, kem phủ, nhân bên trong và topping. Kích thước nhỏ khiến mỗi chi tiết hương vị trở nên quan trọng hơn.",
      "Những lựa chọn dễ dùng nhất vẫn là mứt dâu, socola, kem phô mai và whipped cream. Khi cần bánh nổi bật hơn, hãy thêm một màu trái cây hoặc topping giòn để tạo cảm giác tươi mới."
    ]
  }
];

const uploadAssetImage = async (assetPath: string) => {
  if (!assetPath.startsWith("/assets/")) return assetPath;

  const localPath = path.join(frontendPublicDir, assetPath.replace(/^\//, ""));
  if (!fs.existsSync(localPath)) {
    throw new Error(`Missing blog seed asset: ${localPath}`);
  }

  const publicId = assetPath
    .replace(/^\/assets\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-");

  const result = await cloudinary.uploader.upload(localPath, {
    folder: "webee/blog/seed",
    public_id: publicId,
    overwrite: true,
    resource_type: "image"
  });

  return result.secure_url;
};

const resolvePostImages = async (post: (typeof POSTS)[number]) => ({
  ...post,
  coverImage: await uploadAssetImage(post.coverImage),
  galleryImages: await Promise.all(post.galleryImages.map(uploadAssetImage))
});

async function main() {
  let created = 0;
  let updated = 0;
  for (const post of POSTS) {
    const data = await resolvePostImages(post);
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      await prisma.blogPost.update({
        where: { slug: post.slug },
        data: { ...data, isActive: true }
      });
      updated += 1;
      console.log(`~ updated: ${post.slug}`);
      continue;
    }
    await prisma.blogPost.create({ data: { ...data, isActive: true } });
    created += 1;
    console.log(`+ created: ${post.slug}`);
  }
  const total = await prisma.blogPost.count();
  console.log(`Blog seed done. Created: ${created}. Updated: ${updated}. Total: ${total}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
