# Project Rules â€“ Webee Backend
Náº¿u cÃ³ gÃ¬ chÆ°a rÃµ cáº§n pháº£i há»i láº¡i Ä‘á»ƒ cÃ³ sá»± xÃ¡c nháº­n, náº¿u cÃ³ thay Ä‘á»•i gÃ¬ pháº£i check láº¡i tÃ i liá»‡u, káº¿ hoáº¡ch liÃªn quan Ä‘á»ƒ chá»‰nh sá»­a láº¡i bá»• sung Ä‘á»ƒ cho Ä‘á»“ng bá»™ (cáº§n pháº£i Ä‘Æ°a tÃ´i check láº¡i). Code pháº£i gá»n gÃ ng, khÃ´ng cáº§n note quÃ¡ chi tiáº¿t

- Khi lÃ m module Orders, báº¯t buá»™c Ä‘á»c ká»¹ `api.md` pháº§n MODULE: ORDERS vÃ  hiá»ƒu rÃµ cÆ¡ cháº¿ thanh toÃ¡n QR tÄ©nh + webhook `/webhooks/payment` trÆ°á»›c khi code.
## Format response mong Ä‘á»£i tá»« AI
- **Äá»‘i vá»›i code:** giáº£i thÃ­ch logic trÆ°á»›c, sau Ä‘Ã³ Ä‘Æ°a code (hoáº·c diff).
- **Äá»‘i vá»›i debug:** xÃ¡c Ä‘á»‹nh nguyÃªn nhÃ¢n â†’ Ä‘á» xuáº¥t hÆ°á»›ng fix â†’ khÃ´ng tá»± sá»­a.
- **Äá»‘i vá»›i cáº­p nháº­t:** chá»‰ ra file cáº§n sá»­a, code cÅ© â†’ code má»›i, tÃ¡c Ä‘á»™ng.

## Nhá»¯ng Ä‘iá»u cáº¥m AI lÃ m
- Tá»± Ã½ cháº¡y `npm install`, `prisma migrate`, `git commit`.
- Tá»± Ã½ xÃ³a file mÃ  khÃ´ng há»i.
- Äá» xuáº¥t thay Ä‘á»•i ERD hoáº·c API spec mÃ  khÃ´ng cÃ³ lÃ½ do chÃ­nh Ä‘Ã¡ng.

## Tech stack
Node.js + TypeScript + Express + Prisma + PostgreSQL (Supabase) + Redis + Zod.

## Cáº¥u trÃºc module
Má»—i module trong src/modules/<name>/ gá»“m:
- <name>.routes.ts
- <name>.controller.ts
- <name>.service.ts
- <name>.schema.ts (Zod)
- <name>.types.ts

## Quy táº¯c code
- ToÃ n bá»™ input request pháº£i validate báº±ng Zod trÆ°á»›c khi vÃ o controller.
- Controller chá»‰ gá»i service, khÃ´ng chá»©a business logic.
- Má»i lá»—i throw qua errorHandler dÃ¹ng class AppError(statusCode, message).
- KhÃ´ng hardcode secret â€” luÃ´n Ä‘á»c qua src/config/env.ts.
- Sau khi táº¡o code, giáº£i thÃ­ch ngáº¯n gá»n logic end-to-end cá»§a endpoint Ä‘Ã³.

## TÃ i liá»‡u tham kháº£o
- ERD: `document/erd.md`
- API spec: `document/backend/api.md`
- Káº¿ hoáº¡ch: `document/backend/implementation-plan.md`
- Cáº¥u trÃºc: `document/backend/project-structure.md`


ÄIá»u chá»‰nh láº¡i cÃ¡c cÃ¡u trÃºc skill
