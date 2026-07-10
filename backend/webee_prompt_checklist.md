# ðŸ“‹ WeBee â€” Checklist HÆ°á»›ng dáº«n Flow & Prompt cho tá»«ng Phase

> **Tá»•ng quan dá»± Ã¡n:** WeBee lÃ  website thÆ°Æ¡ng máº¡i Ä‘iá»‡n tá»­ bÃ¡n bÃ¡nh vá»›i tÃ­nh nÄƒng customize bÃ¡nh cho khÃ¡ch hÃ ng (chá»n kÃ­ch cá»¡, kem phá»§, topping, v.v.). Má»¥c tiÃªu: triá»ƒn khai MVP.
>
> **Tech Stack:** Node.js + TypeScript + Express + Prisma + PostgreSQL (Supabase) + Redis + Zod | Frontend: Angular
>
> **Quy táº¯c vÃ ng khi lÃ m viá»‡c vá»›i AI:**
> - LuÃ´n Ä‘Ã­nh kÃ¨m tÃ i liá»‡u tham chiáº¿u vÃ o Ä‘áº§u prompt (ERD, API spec, implementation-plan)
> - KhÃ´ng Ä‘á»ƒ AI tá»± Ã½ cháº¡y `npm install`, `prisma migrate`, `git commit`
> - Náº¿u AI Ä‘á» xuáº¥t thay Ä‘á»•i ERD/API spec â†’ há»i láº¡i vÃ  cáº­p nháº­t tÃ i liá»‡u trÆ°á»›c
> - Sau má»—i milestone â†’ test thá»§ cÃ´ng báº±ng Swagger trÆ°á»›c khi commit

---

## ðŸ—‚ï¸ Má»¤C Lá»¤C NHANH

| Phase | Ná»™i dung | Sá»‘ lÆ°á»£ng task |
|-------|----------|---------------|
| [Phase 0](#phase-0--setup-mÃ´i-trÆ°á»ng--káº¿t-ná»‘i-bÃªn-thá»©-ba) | Setup mÃ´i trÆ°á»ng & API keys | 10 tasks |
| [Phase 1](#phase-1--project-scaffolding) | Táº¡o khung project backend | 12 tasks |
| [Phase 2](#phase-2--database--seed-data) | Prisma schema + Seed data | 6 tasks |
| [Phase 3](#phase-3--xÃ¢y-dá»±ng-api-theo-milestone) | XÃ¢y dá»±ng 11 module API | 11 milestones |
| [Phase 4](#phase-4--tÃ­ch-há»£p-bÃªn-thá»©-ba) | Google OAuth, Cloudinary, Email, SMS, QR tÄ©nh | 5 háº¡ng má»¥c |
| [Phase 5](#phase-5--testing) | Testing toÃ n bá»™ API | 4 loáº¡i |
| [Phase 6](#phase-6--deployment) | Deploy lÃªn production | 10 tasks |

---

## PHASE 0 â€” Setup MÃ´i TrÆ°á»ng & Káº¿t Ná»‘i BÃªn Thá»© Ba

> **Má»¥c tiÃªu:** CÃ³ Ä‘áº§y Ä‘á»§ tÃ i khoáº£n, API key, connection string trÆ°á»›c khi code dÃ²ng nÃ o.
> **Skill:** `skill-setup-env.md`

### âœ… Checklist thá»§ cÃ´ng (báº¡n tá»± lÃ m, khÃ´ng cáº§n AI):

- [âœ…] **1. Táº¡o repo Git** â€” Táº¡o repo trÃªn GitHub/GitLab, táº¡o 2 nhÃ¡nh: `main` vÃ  `dev`. Báº­t branch protection cho `main`.
- [âœ…] **2. CÃ i Node.js LTS** â€” Táº£i tá»« nodejs.org, cÃ i thÃªm pnpm: `npm install -g pnpm`
- [ ] **3. ÄÄƒng kÃ½ Supabase** â€” VÃ o supabase.com â†’ New project â†’ Láº¥y connection string (Settings â†’ Database â†’ Connection string â†’ URI mode)
- [ ] **4. ÄÄƒng kÃ½ Upstash Redis** â€” VÃ o upstash.com â†’ Create Database â†’ Láº¥y `UPSTASH_REDIS_REST_URL` vÃ  `REDIS_URL`
- [ ] **5. ÄÄƒng kÃ½ Cloudinary** â€” VÃ o cloudinary.com â†’ Dashboard â†’ Láº¥y `cloud_name`, `api_key`, `api_secret`
- [ ] **6. Táº¡o Google Cloud Project** â€” console.cloud.google.com â†’ APIs & Services â†’ Credentials â†’ OAuth 2.0 Client ID â†’ Khai bÃ¡o redirect URI: `http://localhost:3000/auth/google/callback`
- [ ] **7. Táº¡o Gmail App Password** â€” Báº­t 2FA trÃªn tÃ i khoáº£n Gmail â†’ Security â†’ App Passwords â†’ Táº¡o má»›i â†’ Copy password
- [ ] **8. ÄÄƒng kÃ½ Twilio** â€” twilio.com â†’ Láº¥y `Account SID`, `Auth Token`, sá»‘ Ä‘iá»‡n thoáº¡i trial (báº¯t Ä‘áº§u báº±ng +1...)
- [ ] **9. Chuáº©n bá»‹ QR chuyá»ƒn khoáº£n tÄ©nh** â€” Táº¡o hoáº·c táº£i áº£nh QR ngÃ¢n hÃ ng cá»‘ Ä‘á»‹nh, upload lÃªn Cloudinary hoáº·c nÆ¡i lÆ°u trá»¯ á»•n Ä‘á»‹nh, láº¥y URL Ä‘iá»n vÃ o `STATIC_QR_URL`
- [ ] **10. Táº¡o file `.env`** â€” Copy tá»« `.env.example`, Ä‘iá»n táº¥t cáº£ giÃ¡ trá»‹ tháº­t vÃ o

### ðŸ¤– Prompt gá»£i Ã½ cho Phase 0:

```
Ngá»¯ cáº£nh: Dá»± Ã¡n backend WeBee (Node.js + TypeScript + Express + Prisma + PostgreSQL + Redis).
Tham kháº£o: skill/skill-setup-env.md, document/tech-stack.md

Nhiá»‡m vá»¥: Äá»c skill-setup-env.md vÃ  liá»‡t kÃª CHECKLIST CHI TIáº¾T tá»«ng bÆ°á»›c Ä‘á»ƒ tÃ´i cÃ³ Ä‘Æ°á»£c
toÃ n bá»™ cÃ¡c biáº¿n mÃ´i trÆ°á»ng trong .env.example (Supabase, Upstash, Cloudinary, 
Google OAuth, Gmail App Password, Twilio, QR tÄ©nh, JWT secrets).

Äáº§u ra mong Ä‘á»£i:
- Checklist dáº¡ng Ä‘Ã¡nh dáº¥u Ä‘Æ°á»£c (checkbox)
- Má»—i bÆ°á»›c cÃ³ link Ä‘Äƒng kÃ½ + mÃ´ táº£ ngáº¯n nÆ¡i tÃ¬m thÃ´ng tin
- KHÃ”NG há»i tÃ´i vá» secret, chá»‰ hÆ°á»›ng dáº«n cÃ¡ch láº¥y
```

---

## PHASE 1 â€” Project Scaffolding

> **Má»¥c tiÃªu:** Server cháº¡y Ä‘Æ°á»£c, káº¿t ná»‘i DB + Redis thÃ nh cÃ´ng, Swagger UI hiá»ƒn thá»‹ táº¡i `/api-docs`
> **Skill:** `skill-scaffolding.md`

### âœ… Checklist:

- [ ] **1.** npm init + cÃ i TypeScript, ts-node-dev, Express
- [ ] **2.** Cáº¥u hÃ¬nh `tsconfig.json` (strict mode báº­t)
- [ ] **3.** Táº¡o cáº¥u trÃºc thÆ° má»¥c chuáº©n (11 module trong `src/modules/`)
- [ ] **4.** CÃ i Prisma, cháº¡y `prisma init`
- [ ] **5.** Setup Redis client (`ioredis`)
- [ ] **6.** Setup Cloudinary SDK
- [ ] **7.** Setup middleware: `errorHandler`, `validate` (Zod), `auth` (JWT), `role`
- [ ] **8.** Setup CORS (cho phÃ©p `localhost:4200` + production domain)
- [ ] **9.** Setup Swagger táº¡i route `/api-docs`
- [ ] **10.** Setup logging (`morgan` cho dev)
- [ ] **11.** Viáº¿t `app.ts` + `server.ts`
- [ ] **12.** Test endpoint `GET /health` tráº£ vá» 200

### ðŸ¤– Prompt cho Phase 1:

```
Ngá»¯ cáº£nh: Dá»± Ã¡n backend WeBee â€” Node.js + TypeScript + Express + Prisma + Zod + Redis.
Tham kháº£o: skill/skill-scaffolding.md, document/backend/project-structure.md, document/tech-stack.md

Nhiá»‡m vá»¥: Táº¡o toÃ n bá»™ khung project theo skill-scaffolding.md:
- package.json vá»›i Ä‘á»§ dependencies (Express, TypeScript, Prisma, Zod, JWT, bcrypt, ioredis, 
  cloudinary, multer, nodemailer, swagger-ui-express, swagger-jsdoc, cors, morgan, 
  passport, passport-google-oauth20)
- tsconfig.json strict mode
- Cáº¥u trÃºc thÆ° má»¥c theo project-structure.md
- src/app.ts + src/server.ts cÃ³ GET /health tráº£ {status: "ok"}
- src/config/env.ts dÃ¹ng Zod validate biáº¿n mÃ´i trÆ°á»ng
- src/middlewares/errorHandler.ts (class AppError)
- CORS cho localhost:4200

Äáº§u ra: Liá»‡t kÃª file Ä‘Ã£ táº¡o + cÃ¡c lá»‡nh thá»§ cÃ´ng TÃ”I cáº§n cháº¡y (npm install, táº¡o .env, dev server).
KhÃ´ng tá»± cháº¡y lá»‡nh nÃ o.
```

### ðŸ”– Checkpoint Phase 1:
> Server cháº¡y, `GET /health` â†’ 200, má»Ÿ `http://localhost:3000/api-docs` tháº¥y Swagger UI

---

## PHASE 2 â€” Database & Seed Data

> **Má»¥c tiÃªu:** Má»Ÿ Prisma Studio tháº¥y Ä‘á»§ dá»¯ liá»‡u máº«u, sáºµn sÃ ng test API ngay.

### âœ… Checklist:

- [ ] **1.** Táº¡o file `prisma/schema.prisma` tá»« ERD
- [ ] **2.** Cháº¡y `prisma migrate dev` táº¡o schema láº§n Ä‘áº§u *(tá»± lÃ m)*
- [ ] **3.** Viáº¿t `prisma/seed.ts`: 3-5 categories, 10-15 products, má»—i product 2-3 option_groups + option_items
- [ ] **4.** Seed 1 admin account (`role=admin`, `is_active=true`)
- [ ] **5.** Seed 2-3 user máº«u (1 active, 1 inactive)
- [ ] **6.** Seed 1-2 coupon máº«u (1 percent, 1 fixed)
- [ ] **Cháº¡y:** `npx prisma db seed` *(tá»± lÃ m)*, má»Ÿ `npx prisma studio` kiá»ƒm tra

### ðŸ¤– Prompt A â€” Táº¡o Prisma Schema:

```
Ngá»¯ cáº£nh: Dá»± Ã¡n backend WeBee.
Tham kháº£o: document/erd.md (15 báº£ng, relations, enums).

Nhiá»‡m vá»¥ theo skill-prisma-schema.md:
1. Äá»c erd.md vÃ  táº¡o prisma/schema.prisma Ä‘áº§y Ä‘á»§:
   - ÄÃºng tÃªn báº£ng, kiá»ƒu dá»¯ liá»‡u, PK (UUID dÃ¹ng @default(uuid()))
   - Chuyá»ƒn ENUM sang enum Prisma
   - Äá»‹nh nghÄ©a Ä‘Ãºng relations 1-N, 0-1 vá»›i @relation
   - ThÃªm @@index cho: email, phone, slug
   - ThÃªm @updatedAt cho trÆ°á»ng updatedAt
2. Sau Ä‘Ã³ Ä‘á»‘i chiáº¿u láº¡i vá»›i ERD: kiá»ƒm tra Ä‘á»§ 17 relations chÆ°a

Äáº§u ra: Ná»™i dung schema.prisma. Giáº£i thÃ­ch cÃ¡c relation Ä‘Ã£ map Ä‘Ãºng ERD chÆ°a.
LÆ°u Ã½: TÃ´i sáº½ tá»± cháº¡y `npx prisma migrate dev`. KhÃ´ng tá»± Ä‘á»™ng cháº¡y lá»‡nh.
```

### ðŸ¤– Prompt B â€” Táº¡o Seed Data:

```
Ngá»¯ cáº£nh: ÄÃ£ cÃ³ prisma/schema.prisma hoÃ n chá»‰nh cho dá»± Ã¡n WeBee.
Tham kháº£o: document/erd.md, document/backend/implementation-plan.md (Phase 2).

Nhiá»‡m vá»¥: Táº¡o file prisma/seed.ts vá»›i dá»¯ liá»‡u máº«u:
- 3-5 categories (bÃ¡nh kem, bÃ¡nh mÃ¬, cupcake...)
- 10-15 products má»—i cÃ¡i cÃ³ thumbnail_url dÃ¹ng picsum.photos, cÃ³ is_customizable=true cho Ã­t nháº¥t 5 sáº£n pháº©m
- Má»—i customizable product: 2-3 option_groups (KÃ­ch cá»¡, Kem phá»§, Topping) + option_items tÆ°Æ¡ng á»©ng
- 1 admin user: role=admin, is_active=true, email: admin@webee.vn, password: Admin@123
- 2 user máº«u: 1 active (member), 1 inactive (Ä‘á»ƒ test flow kÃ­ch hoáº¡t)
- 1 coupon percent (WELCOME10 = 10%) + 1 coupon fixed (SAVE50K = giáº£m 50.000Ä‘, Ä‘Æ¡n tá»‘i thiá»ƒu 200k)

Äáº§u ra: Ná»™i dung seed.ts hoÃ n chá»‰nh, cÃ³ thá»ƒ cháº¡y báº±ng `npx prisma db seed`.
```

### ðŸ”– Checkpoint Phase 2:
> `npx prisma studio` â†’ tháº¥y Ä‘á»§ data, Ä‘áº·c biá»‡t kiá»ƒm tra báº£ng `option_groups` vÃ  `option_items`

---

## PHASE 3 â€” XÃ¢y dá»±ng API theo Milestone

> **Quy trÃ¬nh báº¯t buá»™c cho má»—i milestone:**
> 1. Copy Ä‘Ãºng pháº§n API spec cá»§a module vÃ o prompt
> 2. YÃªu cáº§u táº¡o Ä‘á»§ 5 file theo chuáº©n module
> 3. Review code trÆ°á»›c khi cháº¡y
> 4. Test tá»«ng endpoint qua Swagger
> 5. Commit riÃªng tá»«ng milestone

### ðŸ¤– Template prompt chung cho má»i module:

```
Ngá»¯ cáº£nh: Dá»± Ã¡n backend WeBee. ÄÃ£ cÃ³ scaffold, Prisma schema, seed data.
Tham kháº£o: skill/skill-module.md, document/backend/api.md (pháº§n MODULE: [TÃŠN MODULE])
Quy táº¯c code: backend/skill-agent-rules.md

Nhiá»‡m vá»¥: Táº¡o module [TÃŠN MODULE] theo skill-module.md.
[DÃN Ná»˜I DUNG PHáº¦N API SPEC Cá»¦A MODULE ÄÃ“ Tá»ª api.md VÃ€O ÄÃ‚Y]

Táº¡o 5 file trong src/modules/[tÃªn-module]/:
- [tÃªn].routes.ts (gÃ¡n middleware auth, role, validate Ä‘Ãºng theo Auth column trong API spec)
- [tÃªn].controller.ts (chá»‰ gá»i service, khÃ´ng business logic)
- [tÃªn].service.ts (implement logic theo cá»™t "Logic end-to-end" trong API spec)
- [tÃªn].schema.ts (Zod schema cho body, params, query)
- [tÃªn].types.ts (interface export)

Äáº§u ra:
- Ná»™i dung 5 file
- Danh sÃ¡ch endpoint Ä‘Ã£ táº¡o (method + path)
- Giáº£i thÃ­ch ngáº¯n logic end-to-end má»—i endpoint
- Request máº«u test qua Swagger
LÆ°u Ã½: KhÃ´ng thÃªm endpoint ngoÃ i API spec. Náº¿u chÆ°a rÃµ, há»i trÆ°á»›c.
```

---

### M1 â€” Module: AUTH

**Phá»¥ thuá»™c:** Users table Ä‘Ã£ cÃ³ trong DB
**Endpoints:** register, login, activate, forgot/reset password, refresh, logout, Google OAuth

#### ðŸ¤– Prompt Ä‘áº·c biá»‡t M1:

```
[DÃ¹ng template chung á»Ÿ trÃªn]

ThÃªm lÆ°u Ã½ quan trá»ng cho module Auth:
- Hash password báº±ng bcrypt (salt rounds = 12)
- JWT: access token 15 phÃºt, refresh token 7 ngÃ y
- LÆ°u refresh_token_hash vÃ o DB (khÃ´ng lÆ°u raw token)
- Endpoint activate/reset password dÃ¹ng JWT token riÃªng (khÃ´ng pháº£i access token)
- Google OAuth: dÃ¹ng Passport.js, flow redirect FE â†’ BE /auth/google â†’ Google â†’ BE /auth/google/callback â†’ redirect FE kÃ¨m token
- Kiá»ƒm tra is_active=true khi login â€” náº¿u false, tráº£ lá»—i 403
```

- [ ] M1 hoÃ n thÃ nh
- [ ] Test: ÄÄƒng kÃ½ â†’ nháº­n email â†’ activate â†’ login â†’ nháº­n access + refresh token

---

### M2 â€” Module: USERS

**Phá»¥ thuá»™c:** M1 (cáº§n token)
**Endpoints:** profile, avatar, password, addresses, loyalty

#### ðŸ¤– Prompt Ä‘áº·c biá»‡t M2:

```
[DÃ¹ng template chung]

LÆ°u Ã½:
- Avatar upload: dÃ¹ng multer nháº­n file â†’ upload buffer lÃªn Cloudinary â†’ lÆ°u URL vÃ o DB
- Äá»‹a chá»‰: khi set is_default=true â†’ reset táº¥t cáº£ Ä‘á»‹a chá»‰ khÃ¡c cá»§a user vá» false trÆ°á»›c
- Loyalty: chá»‰ Ä‘á»c, khÃ´ng cÃ³ endpoint chá»‰nh sá»­a Ä‘iá»ƒm á»Ÿ Ä‘Ã¢y (sáº½ cÃ³ á»Ÿ M10)
```

- [ ] M2 hoÃ n thÃ nh
- [ ] Test: Update profile, upload avatar, thÃªm/sá»­a/xÃ³a Ä‘á»‹a chá»‰, xem Ä‘iá»ƒm loyalty

---

### M3 â€” Module: CATEGORIES

**Phá»¥ thuá»™c:** KhÃ´ng
**Endpoints:** Public list/detail, Admin CRUD

- [ ] M3 hoÃ n thÃ nh
- [ ] Test: GET /categories â†’ tháº¥y danh má»¥c tá»« seed. Admin: táº¡o/sá»­a/áº©n danh má»¥c

---

### M4 â€” Module: PRODUCTS

**Phá»¥ thuá»™c:** M3 (categories), Cloudinary
**Endpoints:** Public list/detail/reviews, Admin CRUD + images

#### ðŸ¤– Prompt Ä‘áº·c biá»‡t M4:

```
[DÃ¹ng template chung]

LÆ°u Ã½:
- GET /products: há»— trá»£ query params: category (slug), search, min_price, max_price, sort (price_asc, price_desc, newest, rating), page, limit
- GET /products/:slug: join product_images, option_groups, option_items â†’ tráº£ vá» kÃ¨m avg_rating
- Admin upload áº£nh: multer â†’ Cloudinary â†’ insert product_images
- is_customizable: true náº¿u product cÃ³ option_groups
```

- [ ] M4 hoÃ n thÃ nh
- [ ] Test: GET /products?category=banh-kem&sort=price_asc â†’ danh sÃ¡ch cÃ³ pagination

---

### M5 â€” Module: OPTIONS (Customize BÃ¡nh)

**Phá»¥ thuá»™c:** M4
**Endpoints:** Public láº¥y options theo product, Admin CRUD option_groups + option_items

> âš ï¸ **ÄÃ¢y lÃ  module cá»‘t lÃµi cá»§a tÃ­nh nÄƒng customize bÃ¡nh!**

#### ðŸ¤– Prompt Ä‘áº·c biá»‡t M5:

```
[DÃ¹ng template chung]

Äáº·c biá»‡t quan trá»ng â€” Ä‘Ã¢y lÃ  module tÃ¹y chá»‰nh bÃ¡nh:
- GET /products/:id/options: tráº£ vá» cÃ¢y dá»¯ liá»‡u:
  [{ group_id, name, is_required, is_multiple, items: [{item_id, name, extra_price, image_url}] }]
- Khi FE render trang customize bÃ¡nh, dÃ¹ng response nÃ y Ä‘á»ƒ build UI chá»n tÃ¹y chá»n
- Admin cÃ³ thá»ƒ áº©n/hiá»‡n tá»«ng option_item (is_active toggle)
- Khi xÃ³a option_group: kiá»ƒm tra khÃ´ng cÃ³ order Ä‘ang dÃ¹ng option_items cá»§a group Ä‘Ã³
```

- [ ] M5 hoÃ n thÃ nh
- [ ] Test: GET /products/:id/options â†’ tháº¥y cÃ¢y nhÃ³m-tÃ¹y chá»n Ä‘Ãºng format

---

### M6 â€” Module: CART (Redis-based)

**Phá»¥ thuá»™c:** M4, M5, Redis
**Endpoints:** get, add item, update quantity, delete item, clear, merge

#### ðŸ¤– Prompt Ä‘áº·c biá»‡t M6:

```
[DÃ¹ng template chung]

LÆ°u Ã½ ká»¹ vá» cÃ¡ch lÆ°u cart trong Redis:
- Key: cart:{session_id} cho guest, cart:{user_id} cho member (TTL: 7 ngÃ y)
- Value: JSON array cÃ¡c cart items, má»—i item gá»“m: {cartItemId, product_id, quantity, option_item_ids[], unit_price, item_total}
- Khi GET /cart: tÃ­nh láº¡i tá»•ng tiá»n theo giÃ¡ DB hiá»‡n táº¡i (Ä‘á» phÃ²ng giÃ¡ sáº£n pháº©m thay Ä‘á»•i)
- POST /cart/merge: merge giá» guest vÃ o giá» member, khÃ´ng trÃ¹ng láº·p product+options
- session_id láº¥y tá»« cookie, user_id tá»« JWT náº¿u Ä‘Ã£ Ä‘Äƒng nháº­p

Sau khi táº¡o module, liá»‡t kÃª key Redis máº«u Ä‘á»ƒ tÃ´i kiá»ƒm tra báº±ng redis-cli.
```

- [ ] M6 hoÃ n thÃ nh
- [ ] Test: ThÃªm bÃ¡nh + options vÃ o giá», kiá»ƒm tra TTL key trong Redis

---

### M7 â€” Module: COUPONS

**Phá»¥ thuá»™c:** KhÃ´ng
**Endpoints:** validate coupon (Public), Admin CRUD

- [ ] M7 hoÃ n thÃ nh
- [ ] Test: POST /coupons/validate vá»›i code WELCOME10 + order_value 300000 â†’ tÃ­nh Ä‘Æ°á»£c discount

---

### M8 â€” Module: ORDERS â­ QUAN TRá»ŒNG NHáº¤T

**Phá»¥ thuá»™c:** M6, M7, Email/SMS
**Endpoints:** táº¡o Ä‘Æ¡n, lá»‹ch sá»­, chi tiáº¿t (polling), há»§y, webhook payment mÃ´ phá»ng, admin list/detail/update-status

#### ðŸ¤– Prompt Ä‘áº·c biá»‡t M8:

```
Ngá»¯ cáº£nh: Dá»± Ã¡n WeBee. ÄÃ¢y lÃ  module QUAN TRá»ŒNG NHáº¤T.
Tham kháº£o: document/backend/api.md (MODULE: ORDERS), document/backend/implementation-plan.md (M8)
Quy táº¯c: backend/skill-agent-rules.md

Äá»c Ká»¸ pháº§n MODULE: ORDERS trong `api.md` vÃ  ghi chÃº M8 trong `implementation-plan.md` TRÆ¯á»šC khi code module Orders.

Äiá»ƒm quan trá»ng cáº§n implement Ä‘Ãºng:
1. POST /orders:
   - Láº¥y giá» tá»« Redis â†’ validate coupon â†’ tÃ­nh subtotal/discount/shipping/total
   - Insert orders + order_items + order_item_options (snapshot tÃªn + giÃ¡ táº¡i thá»i Ä‘iá»ƒm Ä‘áº·t)
   - XÃ³a giá» Redis sau khi táº¡o Ä‘Æ¡n thÃ nh cÃ´ng
   - Láº¥y `STATIC_QR_URL` tá»« env Ä‘á»ƒ tráº£ vá» áº£nh QR cá»‘ Ä‘á»‹nh
   - Náº¿u email/phone chÆ°a cÃ³ tÃ i khoáº£n active: táº¡o user is_active=false
   - Gá»­i email/SMS xÃ¡c nháº­n Ä‘Æ¡n + QR cá»‘ Ä‘á»‹nh + ná»™i dung chuyá»ƒn khoáº£n `DH{order_id}`
   - Tráº£ vá»: order_id, tÃ³m táº¯t Ä‘Æ¡n, payment_qr_url, transfer_content

2. POST /webhooks/payment (QUAN TRá»ŒNG):
   - KhÃ´ng cáº§n xÃ¡c thá»±c cho MVP
   - Nháº­n JSON `{ order_id, amount }`
   - TÃ¬m order cÃ³ `order_id`, `total_amount = amount`, `payment_status='pending'`
   - Náº¿u há»£p lá»‡: cáº­p nháº­t `payment_status='paid'`, `order_status='confirmed'`
   - Tráº£ vá» 200

3. GET /orders/me/:id: FE polling má»—i 2-3 giÃ¢y Ä‘á»ƒ phÃ¡t hiá»‡n payment_status='paid'

Táº¡o Ä‘á»§ 5 file + tÃ­ch há»£p route vÃ o index.ts.
```

#### ðŸ¤– Prompt test M8 vá»›i webhook mÃ´ phá»ng:

```
TÃ´i cáº§n test luá»“ng thanh toÃ¡n QR tÄ©nh local.

HÃ£y hÆ°á»›ng dáº«n tÃ´i:
1. Táº¡o Ä‘Æ¡n test qua Swagger (request body máº«u hoÃ n chá»‰nh)
2. MÃ´ phá»ng webhook `POST /webhooks/payment` báº±ng curl command máº«u
3. Kiá»ƒm tra order Ä‘Æ°á»£c cáº­p nháº­t Ä‘Ãºng trong DB
4. Kiá»ƒm tra FE polling phÃ¡t hiá»‡n payment_status='paid'
```

- [ ] M8 hoÃ n thÃ nh
- [ ] Test Ä‘áº§y Ä‘á»§: Táº¡o Ä‘Æ¡n â†’ tháº¥y QR â†’ webhook â†’ order cáº­p nháº­t â†’ polling FE nháº­n Ä‘Æ°á»£c

---

### M9 â€” Module: REVIEWS

**Phá»¥ thuá»™c:** M8 (cáº§n order_status=delivered)

> ðŸ’¡ Tip: DÃ¹ng Prisma Studio cáº­p nháº­t thá»§ cÃ´ng 1 order sang status=delivered Ä‘á»ƒ test

#### ðŸ¤– Prompt M9:

```
[DÃ¹ng template chung]

LÆ°u Ã½:
- Kiá»ƒm tra: order_item thuá»™c vá» user Ä‘ang gá»­i review
- Kiá»ƒm tra: order status = 'delivered' (náº¿u khÃ´ng â†’ 403)
- Kiá»ƒm tra: order_item chÆ°a cÃ³ review nÃ o (náº¿u cÃ³ rá»“i â†’ 409)
- Sau khi insert review: tÃ­nh láº¡i avg_rating cho product (round 2 decimal)
  â†’ UPDATE products SET avg_rating = (SELECT AVG(rating) FROM reviews JOIN order_items...)
- Upload áº£nh review: multer â†’ Cloudinary (optional field)
```

- [ ] M9 hoÃ n thÃ nh
- [ ] Test: ThÃªm review â†’ kiá»ƒm tra avg_rating trÃªn product cáº­p nháº­t

---

### M10 â€” Module: LOYALTY

**Phá»¥ thuá»™c:** M8 (trigger khi order delivered)
**Endpoints:** Internal /internal/loyalty/credit

#### ðŸ¤– Prompt M10:

```
[DÃ¹ng template chung]

ÄÃ¢y lÃ  internal endpoint, chá»‰ Ä‘Æ°á»£c gá»i tá»« module Orders (khi admin Ä‘á»•i status sang delivered).

Logic cá»™ng Ä‘iá»ƒm:
- 1.000Ä‘ = 1 Ä‘iá»ƒm (lÃ m trÃ²n xuá»‘ng)
- Insert loyalty_logs (points_delta dÆ°Æ¡ng, reason='order_delivered')
- Update users.loyalty_points += points_delta
- Kiá»ƒm tra ngÆ°á»¡ng nÃ¢ng háº¡ng:
  * Bronze â†’ Silver: 500 Ä‘iá»ƒm
  * Silver â†’ Gold: 2000 Ä‘iá»ƒm
- Náº¿u Ä‘á»§ ngÆ°á»¡ng â†’ update membership_tier

LÆ°u Ã½: Module Orders gá»i endpoint nÃ y á»Ÿ PATCH /admin/orders/:id/status khi status='delivered'.
```

- [ ] M10 hoÃ n thÃ nh

---

### M11 â€” Module: ANALYTICS

**Phá»¥ thuá»™c:** M8, M10
**Endpoints:** batch events (Public), admin overview, admin behavior, admin customers

#### ðŸ¤– Prompt M11:

```
[DÃ¹ng template chung]

LÆ°u Ã½:
- POST /analytics/events/batch: nháº­n máº£ng tá»‘i Ä‘a 20 events â†’ bulk insert â†’ 204 No Content
  (Angular gá»i má»—i 10s hoáº·c khi Ä‘á»§ 20 events, dÃ¹ng navigator.sendBeacon khi Ä‘Ã³ng tab)
- GET /admin/analytics/overview: nháº­n query params date_from, date_to
  â†’ tá»•ng há»£p: tá»•ng doanh thu, sá»‘ Ä‘Æ¡n, sá»‘ khÃ¡ch má»›i, top 5 sáº£n pháº©m bÃ¡n cháº¡y
- GET /admin/analytics/behavior: group analytics_events theo event_type, page_url, utm_source
- GET /admin/customers: join users + orders â†’ thÃ´ng tin, háº¡ng, Ä‘iá»ƒm, sá»‘ Ä‘Æ¡n
```

- [ ] M11 hoÃ n thÃ nh

---

## PHASE 4 â€” TÃ­ch Há»£p BÃªn Thá»© Ba

> **Quy trÃ¬nh:** Táº¡o test endpoint Ä‘á»™c láº­p â†’ test OK â†’ gáº¯n vÃ o module chÃ­nh
> **Skill:** `skill-integration.md`

### ðŸ¤– Prompt template cho má»—i tÃ­ch há»£p:

```
Ngá»¯ cáº£nh: Dá»± Ã¡n WeBee backend, Ä‘Ã£ cÃ³ scaffold hoÃ n chá»‰nh.
Tham kháº£o: skill/skill-integration.md, document/backend/implementation-plan.md (Phase 4)

TÃ­ch há»£p: [TÃŠN Dá»ŠCH Vá»¤]
Module sáº½ dÃ¹ng: [TÃŠN MODULE]

Nhiá»‡m vá»¥:
1. Táº¡o file src/utils/[tÃªn].ts vá»›i cÃ¡c hÃ m tiá»‡n Ã­ch
2. ThÃªm biáº¿n mÃ´i trÆ°á»ng vÃ o src/config/env.ts náº¿u chÆ°a cÃ³
3. Táº¡o endpoint test riÃªng: [POST /test/tÃªn-dá»‹ch-vá»¥]
4. Giáº£i thÃ­ch luá»“ng gá»i API cá»§a dá»‹ch vá»¥
5. Sau khi tÃ´i xÃ¡c nháº­n test OK â†’ hÆ°á»›ng dáº«n gáº¯n vÃ o module tháº­t
```

### âœ… Checklist tÃ­ch há»£p:

- [ ] **Google OAuth (Passport.js)** â€” Module: Auth
  - Flow: FE â†’ BE `/auth/google/redirect` â†’ Google â†’ BE `/auth/google/callback` â†’ redirect FE kÃ¨m token trong query param

- [ ] **Cloudinary** â€” Module: Products, Users (avatar), Reviews
  - DÃ¹ng `multer` nháº­n file â†’ upload buffer â†’ láº¥y URL â†’ lÆ°u DB

- [ ] **Nodemailer (Gmail SMTP)** â€” Module: Auth, Orders
  - Email kÃ­ch hoáº¡t tÃ i khoáº£n, reset password, xÃ¡c nháº­n Ä‘Æ¡n (kÃ¨m QR tÄ©nh + ná»™i dung chuyá»ƒn khoáº£n)

- [ ] **Twilio SMS** â€” Module: Auth, Orders
  - Chá»‰ kÃ­ch hoáº¡t khi user cÃ³ `phone` nhÆ°ng khÃ´ng cÃ³ `email`

- [ ] **QR tÄ©nh + webhook mÃ´ phá»ng** â€” Module: Orders
  - ÄÃ£ covered trong M8. DÃ¹ng `STATIC_QR_URL` vÃ  `POST /webhooks/payment`.

---

## PHASE 5 â€” Testing

### âœ… Checklist testing:

- [ ] **Manual test qua Swagger UI** â€” Test tá»«ng endpoint sau má»—i milestone *(Æ°u tiÃªn cao nháº¥t)*
- [ ] **Postman Collection** â€” Export collection cho tá»«ng module lÃ m regression test
- [ ] **Unit test (optional)** â€” Jest: service layer tÃ­nh giÃ¡ Ä‘Æ¡n, validate coupon, tÃ­nh Ä‘iá»ƒm loyalty
- [ ] **Integration test (optional)** â€” Jest + Supertest: luá»“ng POST /orders end-to-end

### ðŸ¤– Prompt debug khi gáº·p lá»—i:

```
DÃ¹ng skill: skill/skill-debug.md

TÃ´i gáº·p lá»—i khi gá»i [METHOD] [ENDPOINT]:

Request body/params:
[DÃN REQUEST VÃ€O ÄÃ‚Y]

Response lá»—i:
[DÃN RESPONSE/LOG VÃ€O ÄÃ‚Y]

Nhiá»‡m vá»¥ cá»§a báº¡n:
1. Äá»c cÃ¡c file liÃªn quan: [tÃªn-module].routes.ts, controller.ts, service.ts, schema.ts
2. XÃ¡c Ä‘á»‹nh nguyÃªn nhÃ¢n (validation, logic, DB, middleware?)
3. Giáº£i thÃ­ch nguyÃªn nhÃ¢n rÃµ rÃ ng
4. Äá»€ XUáº¤T cÃ¡ch sá»­a â€” KHÃ”NG tá»± sá»­a, chá» tÃ´i xÃ¡c nháº­n
```

### ðŸ¤– Prompt review & commit sau má»—i milestone:

```
DÃ¹ng skill: skill/skill-review-commit.md

TÃ´i vá»«a hoÃ n thÃ nh module [TÃŠN MODULE].

Nhiá»‡m vá»¥:
1. Tá»•ng há»£p cÃ¡c file Ä‘Ã£ táº¡o/sá»­a
2. TÃ³m táº¯t logic chÃ­nh cÃ¡c endpoint
3. Chá»‰ ra edge cases cáº§n test ká»¹
4. Äá» xuáº¥t commit message theo format: feat(<module>): <mÃ´ táº£>
5. Liá»‡t kÃª cÃ¡c bÆ°á»›c tÃ´i cáº§n lÃ m trÆ°á»›c khi commit (lint, test, migration check)
```

---

## PHASE 6 â€” Deployment

> **Má»¥c tiÃªu:** Angular frontend gá»i Ä‘Æ°á»£c API production, luá»“ng checkout cháº¡y end-to-end

### âœ… Checklist deployment:

- [ ] **1.** Build TypeScript: `npx tsc` â†’ kiá»ƒm tra khÃ´ng cÃ³ lá»—i compile
- [ ] **2.** Deploy backend lÃªn **Render** hoáº·c **Railway** (free tier)
- [ ] **3.** Cáº¥u hÃ¬nh biáº¿n mÃ´i trÆ°á»ng trÃªn platform (copy tá»« `.env`, KHÃ”NG commit file `.env`)
- [ ] **4.** Cáº¥u hÃ¬nh CORS whitelist domain Angular production
- [ ] **5.** Cáº­p nháº­t Google OAuth redirect URI sang domain production
- [ ] **6.** Äáº£m báº£o `STATIC_QR_URL` production cÃ²n hoáº¡t Ä‘á»™ng á»•n Ä‘á»‹nh
- [ ] **7.** Cháº¡y `prisma migrate deploy` trÃªn production DB
- [ ] **8.** Verify Swagger UI production hoáº¡t Ä‘á»™ng: `https://yourdomain.com/api-docs`
- [ ] **9.** Test 1 luá»“ng Ä‘áº§y Ä‘á»§: Ä‘Äƒng kÃ½ â†’ Ä‘áº·t hÃ ng â†’ thanh toÃ¡n â†’ nháº­n xÃ¡c nháº­n
- [ ] **10.** (Optional) Setup GitHub Actions CI/CD: auto deploy khi push `main`

### ðŸ¤– Prompt deployment:

```
Ngá»¯ cáº£nh: Backend WeBee hoÃ n chá»‰nh, cáº§n deploy lÃªn Render/Railway.
Tham kháº£o: document/backend/implementation-plan.md (Phase 6)

Nhiá»‡m vá»¥: HÆ°á»›ng dáº«n chi tiáº¿t tá»«ng bÆ°á»›c deploy backend Node.js + TypeScript lÃªn [RENDER/RAILWAY]:
1. Cáº¥u hÃ¬nh build command (tsc) vÃ  start command
2. CÃ¡ch set biáº¿n mÃ´i trÆ°á»ng trÃªn platform
3. CÃ¡ch cháº¡y prisma migrate deploy (khÃ´ng pháº£i migrate dev)
4. Cáº­p nháº­t CORS, Google OAuth redirect URI, vÃ  kiá»ƒm tra `STATIC_QR_URL` cho production
5. CÃ¡ch verify deployment thÃ nh cÃ´ng

Äáº§u ra: Checklist thá»§ cÃ´ng tá»«ng bÆ°á»›c theo thá»© tá»±.
```

---

## PHASE 7 â€” Sau Khi Deploy (Monitoring)

### âœ… Checklist post-deploy:

- [ ] Setup **UptimeRobot** (free) monitor endpoint `GET /health` má»—i 5 phÃºt
- [ ] Kiá»ƒm tra log lá»—i Ä‘á»‹nh ká»³ trÃªn platform dashboard (Render/Railway)
- [ ] Theo dÃµi Twilio trial balance (háº¿t balance sáº½ khÃ´ng gá»­i Ä‘Æ°á»£c SMS)
- [ ] Cáº­p nháº­t tÃ i liá»‡u `api.md` náº¿u cÃ³ thay Ä‘á»•i endpoint
- [ ] Backup DB Ä‘á»‹nh ká»³ (Supabase cÃ³ auto backup)

---

## ðŸ“Œ Báº¢NG TÃ“M Táº®T QUICK REFERENCE

### CÃ¡c tÃ i liá»‡u cáº§n Ä‘Ã­nh kÃ¨m vÃ o prompt:

| Khi lÃ m gÃ¬ | ÄÃ­nh kÃ¨m tÃ i liá»‡u |
|------------|-------------------|
| Setup mÃ´i trÆ°á»ng | `skill-setup-env.md`, `tech-stack.md` |
| Scaffolding project | `skill-scaffolding.md`, `project-structure.md` |
| Prisma schema | `erd.md` + `skill-prisma-schema.md` |
| Báº¥t ká»³ module nÃ o | `skill-module.md` + Ä‘oáº¡n API spec tÆ°Æ¡ng á»©ng tá»« `api.md` + `skill-agent-rules.md` |
| Module Orders | `api.md` (MODULE: ORDERS) + `implementation-plan.md` (ghi chÃº M8) |
| TÃ­ch há»£p 3rd-party | `skill-integration.md` |
| Debug lá»—i | `skill-debug.md` + files cá»§a module lá»—i |
| Review & commit | `skill-review-commit.md` |

### Thá»© tá»± dependency giá»¯a cÃ¡c module:

```
M3 (Categories) â†’ M4 (Products) â†’ M5 (Options) â†’ M6 (Cart) â†’ M8 (Orders)
M1 (Auth) â†’ M2 (Users)                                           â†“
M7 (Coupons) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â†’ M8
                                                                  â†“
M9 (Reviews) â†â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ M8 (order_status=delivered) â”€â”€â†’ M10 (Loyalty)
                                                                  â†“
                                                               M11 (Analytics)
```

### Flow tÃ¹y chá»‰nh bÃ¡nh (Customize Flow) â€” Äiá»ƒm cá»‘t lÃµi MVP:

```
1. KhÃ¡ch vÃ o trang product detail (is_customizable=true)
2. FE gá»i GET /products/:id/options â†’ nháº­n cÃ¢y option_groups + option_items
3. KhÃ¡ch chá»n: KÃ­ch cá»¡ (required) + Kem phá»§ (required) + Topping (multiple, optional)
4. FE tÃ­nh realtime: base_price + Î£(extra_price cá»§a cÃ¡c item Ä‘Ã£ chá»n)
5. KhÃ¡ch nháº¥n "ThÃªm vÃ o giá»" â†’ POST /cart/items (gá»­i kÃ¨m option_item_ids[])
6. Giá» hÃ ng lÆ°u Redis vá»›i snapshot giÃ¡
7. Checkout â†’ POST /orders â†’ tráº£ vá» QR tÄ©nh + ná»™i dung chuyá»ƒn khoáº£n â†’ hiá»ƒn thá»‹ QR
8. KhÃ¡ch chuyá»ƒn khoáº£n â†’ gá»i `POST /webhooks/payment` mÃ´ phá»ng xÃ¡c nháº­n â†’ order updated â†’ FE polling nháº­n paid
```

---

> **Ghi chÃº cuá»‘i:** LuÃ´n test checkpoint cá»§a tá»«ng phase trÆ°á»›c khi sang phase tiáº¿p theo.
> Commit theo tá»«ng milestone vá»›i message format: `feat(<module>): <mÃ´ táº£ ngáº¯n>`
