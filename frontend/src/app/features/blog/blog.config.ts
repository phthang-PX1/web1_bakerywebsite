export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  content: string;
  isActive?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'bia-hoa-tu-tu-ky-thuat-baking',
    title: 'Bí ẩn sau những chiếc bánh hoàn hảo — Kỹ thuật baking cơ bản',
    excerpt: 'Từ việc chọn nguyên liệu đến kỹ thuật trộn bột, WeBee chia sẻ bí quyết làm bánh ngon tại nhà.',
    coverImage: 'https://res.cloudinary.com/webee/image/upload/v1/blog/baking-tips.jpg',
    publishedAt: '2026-06-01',
    content: `Làm bánh không chỉ là nghệ thuật mà còn là khoa học. Mỗi nguyên liệu đóng một vai trò quan trọng trong cấu trúc và hương vị của bánh...`,
  },
  {
    slug: 'banh-sinh-nhat-tu-chon-huong-vi',
    title: 'Cách chọn hương vị bánh sinh nhật phù hợp với từng sở thích',
    excerpt: 'Bánh kem dâu tây, chocolate đậm hay tiramisu thanh lịch? Hướng dẫn chọn bánh phù hợp nhất.',
    coverImage: 'https://res.cloudinary.com/webee/image/upload/v1/blog/birthday-cake.jpg',
    publishedAt: '2026-06-10',
    content: `Một chiếc bánh sinh nhật hoàn hảo bắt đầu từ việc hiểu rõ sở thích của người được tặng...`,
  },
  {
    slug: 'xu-huong-banh-2026',
    title: 'Xu hướng bánh ngọt nổi bật năm 2026',
    excerpt: 'Khám phá những xu hướng bánh đang làm mưa làm gió trong cộng đồng yêu bánh năm nay.',
    coverImage: 'https://res.cloudinary.com/webee/image/upload/v1/blog/trends-2026.jpg',
    publishedAt: '2026-06-20',
    content: `Năm 2026, thế giới bánh ngọt chứng kiến nhiều xu hướng mới thú vị từ bánh hoa matcha đến mousse vị trái cây nhiệt đới...`,
  },
];
