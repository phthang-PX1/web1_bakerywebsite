import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const image = (seed: string, width = 800, height = 600) =>
  `https://picsum.photos/seed/webee-${seed}/${width}/${height}`;

const optionGroups = () => [
  {
    name: "Kích cỡ",
    isRequired: true,
    isMultiple: false,
    sortOrder: 1,
    items: {
      create: [
        { name: "16cm", extraPrice: "0", sortOrder: 1 },
        { name: "20cm", extraPrice: "80000", sortOrder: 2 },
        { name: "24cm", extraPrice: "150000", sortOrder: 3 }
      ]
    }
  },
  {
    name: "Kem phủ",
    isRequired: true,
    isMultiple: false,
    sortOrder: 2,
    items: {
      create: [
        { name: "Kem tươi", extraPrice: "0", sortOrder: 1 },
        { name: "Chocolate ganache", extraPrice: "35000", sortOrder: 2 },
        { name: "Cream cheese", extraPrice: "45000", sortOrder: 3 }
      ]
    }
  },
  {
    name: "Topping",
    isRequired: false,
    isMultiple: true,
    sortOrder: 3,
    items: {
      create: [
        { name: "Dâu tây", extraPrice: "25000", imageUrl: image("topping-strawberry", 300, 300), sortOrder: 1 },
        { name: "Việt quất", extraPrice: "30000", imageUrl: image("topping-blueberry", 300, 300), sortOrder: 2 },
        { name: "Hạnh nhân", extraPrice: "20000", imageUrl: image("topping-almond", 300, 300), sortOrder: 3 },
        { name: "Socola chip", extraPrice: "18000", imageUrl: image("topping-choco-chip", 300, 300), sortOrder: 4 }
      ]
    }
  }
];

const products = [
  {
    categorySlug: "banh-kem",
    name: "Bánh kem dâu vanilla",
    slug: "banh-kem-dau-vanilla",
    description: "Bánh kem vanilla mềm mịn, phủ dâu tươi và kem nhẹ.",
    basePrice: "320000",
    isCustomizable: true
  },
  {
    categorySlug: "banh-kem",
    name: "Bánh kem chocolate dream",
    slug: "banh-kem-chocolate-dream",
    description: "Cốt bánh cacao đậm vị, phù hợp sinh nhật và tiệc nhỏ.",
    basePrice: "350000",
    isCustomizable: true
  },
  {
    categorySlug: "banh-kem",
    name: "Bánh tiramisu mini",
    slug: "banh-tiramisu-mini",
    description: "Tiramisu vị cà phê, mascarpone béo nhẹ.",
    basePrice: "180000",
    isCustomizable: false
  },
  {
    categorySlug: "banh-mi",
    name: "Bánh mì bơ tỏi phô mai",
    slug: "banh-mi-bo-toi-pho-mai",
    description: "Bánh mì nướng bơ tỏi, nhân phô mai kéo sợi.",
    basePrice: "45000",
    isCustomizable: false
  },
  {
    categorySlug: "banh-mi",
    name: "Bánh mì hoa cúc",
    slug: "banh-mi-hoa-cuc",
    description: "Brioche mềm thơm bơ, ngọt nhẹ.",
    basePrice: "85000",
    isCustomizable: false
  },
  {
    categorySlug: "cupcake",
    name: "Cupcake red velvet",
    slug: "cupcake-red-velvet",
    description: "Cupcake red velvet phủ cream cheese.",
    basePrice: "39000",
    isCustomizable: true
  },
  {
    categorySlug: "cupcake",
    name: "Cupcake matcha",
    slug: "cupcake-matcha",
    description: "Cupcake trà xanh Nhật, vị thanh và ít ngọt.",
    basePrice: "42000",
    isCustomizable: true
  },
  {
    categorySlug: "cookies",
    name: "Cookie chocolate chip",
    slug: "cookie-chocolate-chip",
    description: "Cookie giòn rìa, mềm giữa, nhiều chocolate chip.",
    basePrice: "28000",
    isCustomizable: false
  },
  {
    categorySlug: "cookies",
    name: "Cookie yến mạch nho khô",
    slug: "cookie-yen-mach-nho-kho",
    description: "Cookie yến mạch giàu chất xơ, vị ngọt tự nhiên.",
    basePrice: "26000",
    isCustomizable: false
  },
  {
    categorySlug: "pastry",
    name: "Croissant bơ Pháp",
    slug: "croissant-bo-phap",
    description: "Croissant nhiều lớp, thơm bơ, nướng mới mỗi ngày.",
    basePrice: "55000",
    isCustomizable: false
  },
  {
    categorySlug: "pastry",
    name: "Danish đào",
    slug: "danish-dao",
    description: "Pastry giòn xốp cùng đào vàng và kem custard.",
    basePrice: "62000",
    isCustomizable: false
  },
  {
    categorySlug: "banh-kem",
    name: "Bánh mousse xoài",
    slug: "banh-mousse-xoai",
    description: "Mousse xoài chua ngọt, kết cấu mịn và nhẹ.",
    basePrice: "290000",
    isCustomizable: true
  }
];

async function clearDatabase() {
  await prisma.analyticsEvent.deleteMany();
  await prisma.loyaltyLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.optionItem.deleteMany();
  await prisma.optionGroup.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  const memberPasswordHash = await bcrypt.hash("Member@123", 12);

  await prisma.user.createMany({
    data: [
      {
        email: "admin@webee.vn",
        phone: "0900000001",
        passwordHash,
        fullName: "WeBee Admin",
        authProvider: "local",
        role: "admin",
        isActive: true,
        loyaltyPoints: 0,
        membershipTier: "bronze"
      },
      {
        email: "member.active@webee.vn",
        phone: "0900000002",
        passwordHash: memberPasswordHash,
        fullName: "Nguyễn Minh Anh",
        authProvider: "local",
        role: "member",
        isActive: true,
        loyaltyPoints: 320,
        membershipTier: "bronze"
      },
      {
        email: "member.inactive@webee.vn",
        phone: "0900000003",
        passwordHash: memberPasswordHash,
        fullName: "Trần Gia Bảo",
        authProvider: "local",
        role: "member",
        isActive: false,
        loyaltyPoints: 0,
        membershipTier: "bronze"
      }
    ]
  });
}

async function seedCategories() {
  const categories = [
    {
      name: "Bánh kem",
      slug: "banh-kem",
      description: "Bánh kem sinh nhật, bánh mousse và bánh tùy chỉnh.",
      imageUrl: image("category-cake")
    },
    {
      name: "Bánh mì",
      slug: "banh-mi",
      description: "Bánh mì nướng mới mỗi ngày.",
      imageUrl: image("category-bread")
    },
    {
      name: "Cupcake",
      slug: "cupcake",
      description: "Cupcake nhỏ xinh cho tiệc và quà tặng.",
      imageUrl: image("category-cupcake")
    },
    {
      name: "Cookies",
      slug: "cookies",
      description: "Cookie giòn thơm, đóng gói tiện lợi.",
      imageUrl: image("category-cookies")
    },
    {
      name: "Pastry",
      slug: "pastry",
      description: "Croissant, danish và các loại pastry bơ.",
      imageUrl: image("category-pastry")
    }
  ];

  await prisma.category.createMany({ data: categories });

  const createdCategories = await prisma.category.findMany();
  return new Map(createdCategories.map((category) => [category.slug, category.categoryId]));
}

async function seedProducts(categoryIdsBySlug: Map<string, string>) {
  for (const product of products) {
    const categoryId = categoryIdsBySlug.get(product.categorySlug);

    if (!categoryId) {
      throw new Error(`Missing category for slug: ${product.categorySlug}`);
    }

    await prisma.product.create({
      data: {
        categoryId,
        name: product.name,
        slug: product.slug,
        description: product.description,
        basePrice: product.basePrice,
        thumbnailUrl: image(product.slug),
        isCustomizable: product.isCustomizable,
        images: {
          create: [
            { imageUrl: image(`${product.slug}-1`), sortOrder: 1 },
            { imageUrl: image(`${product.slug}-2`), sortOrder: 2 }
          ]
        },
        optionGroups: product.isCustomizable ? { create: optionGroups() } : undefined
      }
    });
  }
}

async function seedCoupons() {
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(now.getFullYear() + 1);

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: "percent",
        discountValue: "10",
        minOrderValue: "0",
        maxDiscountAmount: "100000",
        usageLimit: 500,
        startDate: now,
        endDate: nextYear,
        isActive: true
      },
      {
        code: "SAVE50K",
        discountType: "fixed",
        discountValue: "50000",
        minOrderValue: "200000",
        usageLimit: 300,
        startDate: now,
        endDate: nextYear,
        isActive: true
      }
    ]
  });
}

async function main() {
  await clearDatabase();
  await seedUsers();
  const categoryIdsBySlug = await seedCategories();
  await seedProducts(categoryIdsBySlug);
  await seedCoupons();

  const [categoryCount, productCount, userCount, couponCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.coupon.count()
  ]);

  console.log("Seed completed", {
    categories: categoryCount,
    products: productCount,
    users: userCount,
    coupons: couponCount
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
