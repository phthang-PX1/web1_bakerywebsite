import type { HomeCategoryItem, HomeFaqItem, HomeProductCard } from './home.models';

export const HOME_CATEGORIES: readonly HomeCategoryItem[] = [
  { id: 'gato', name: 'Bánh Gato', icon: '🎂', slug: 'banh-gato' },
  { id: 'entremet', name: 'Bánh Entremet', icon: '🍰', slug: 'banh-entremet' },
  { id: 'mousse', name: 'Bánh Mousse', icon: '🍨', slug: 'banh-mousse' },
  { id: 'tiramisu', name: 'Tiramisu', icon: '☕', slug: 'tiramisu' },
  { id: 'mini-cakes', name: 'Mini Cakes', icon: '🧁', slug: 'mini-cakes' },
  { id: 'baked', name: 'Bánh Nướng', icon: '🍞', slug: 'banh-nuong' }
];

export const FEATURED_PRODUCT_FALLBACK: readonly HomeProductCard[] = [
  {
    id: '7a395945-b0cb-559d-b4f5-57cd1bf4e3bb',
    name: 'Bánh Kem Dâu Tây',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492927/product-image/mousse/Mousse_StrawberryDream.png',
    price: 429000,
    rating: 4.9,
    reviewCount: 48,
    slug: 'strawberry-dream',
    badge: 'Mới'
  },
  {
    id: '6a18bde5-440f-5300-a224-25a7379511a1',
    name: 'Bánh Tiramisu Chocolate',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492958/product-image/tiramisu/tiramisu-tiramisuclassic%281%29.png',
    price: 222000,
    rating: 4.8,
    reviewCount: 36,
    slug: 'tiramisu-classic'
  },
  {
    id: 'd0cd67de-90a2-53dc-852f-ff2198122cfc',
    name: 'Bánh Kem Bắp',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492860/product-image/gato/bapphomai/gato-bapphomai%281%29.png',
    price: 140000,
    rating: 4.7,
    reviewCount: 29,
    slug: 'banh-bap-pho-mai'
  },
  {
    id: '35d8ca52-87ee-546b-a3ff-39dec9154309',
    name: 'Bánh Mousse Nhãn',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492916/product-image/mousse/Mousse_LycheeGarden.png',
    price: 429000,
    rating: 4.9,
    reviewCount: 42,
    slug: 'lychee-garden'
  }
];

export const BEST_SELLER_FALLBACK: readonly HomeProductCard[] = [
  {
    id: 'fd824b97-76d8-5409-b3af-45924860887c',
    name: 'Bánh Sakura Entremet',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492845/product-image/entremet/Entremet_s12_BerryBlush.png',
    price: 300000,
    rating: 4.9,
    reviewCount: 64,
    slug: 'berry-blush',
    badge: 'Phổ biến'
  },
  {
    id: '99e36f3c-6d04-59b0-9ad1-7a80203e5d16',
    name: 'Bánh Chocolate',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492876/product-image/gato/socola/gato-socola%281%29.png',
    price: 120000,
    rating: 4.8,
    reviewCount: 57,
    slug: 'banh-kem-socola',
    badge: 'Phổ biến'
  },
  {
    id: '47b73c21-7e3d-5a33-8edf-55f3b5ed8bcd',
    name: 'Mousse Xoài',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492919/product-image/mousse/Mousse_MangoDelight.png',
    price: 419000,
    rating: 4.7,
    reviewCount: 45,
    slug: 'mango-delight'
  },
  {
    id: '7690844b-0ab7-5e65-88e3-8c90ac98f6e0',
    name: 'Bánh Dưa Lưới',
    imageUrl: 'https://res.cloudinary.com/dhw56qppe/image/upload/v1782492865/product-image/gato/dualuoi/gato-dualuoi%281%29.png',
    price: 120000,
    rating: 4.8,
    reviewCount: 53,
    slug: 'banh-kem-dua-luoi'
  }
];

export const HOME_FAQS: readonly HomeFaqItem[] = [
  {
    id: 'join',
    question: 'Làm sao để trở thành thành viên?',
    answer: 'Bạn chỉ cần đăng ký tài khoản WeBee bằng email hoặc số điện thoại, sau đó kích hoạt tài khoản để bắt đầu nhận ưu đãi.'
  },
  {
    id: 'earn',
    question: 'Cách tích điểm như thế nào?',
    answer: 'Điểm thưởng được cộng khi đơn hàng hoàn tất. Số điểm phụ thuộc vào giá trị đơn hàng và hạng thành viên hiện tại.'
  },
  {
    id: 'expire',
    question: 'Điểm thưởng có thời hạn không?',
    answer: 'Điểm được lưu trong tài khoản thành viên. Chính sách thời hạn sẽ được hiển thị rõ trong trang thành viên khi backend chốt quy tắc.'
  },
  {
    id: 'redeem',
    question: 'Tôi có thể đổi điểm thành gì?',
    answer: 'Điểm có thể dùng cho ưu đãi đơn hàng, quà sinh nhật hoặc các chiến dịch riêng của WeBee.'
  },
  {
    id: 'tier',
    question: 'Làm sao để lên hạng thành viên?',
    answer: 'Hạng thành viên tăng theo lịch sử mua hàng và điểm tích lũy sau mỗi chu kỳ xét hạng.'
  }
];
