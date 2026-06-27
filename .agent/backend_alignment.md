# Backend Alignment Rules

Before implementing any frontend feature:
1. Read `document/backend/api_contract.md`.
2. Read `document/feature_mapping.md`.
3. Verify endpoint exists and is marked **CONFIRMED**.
4. Verify request/response fields match `document/schema.md`.
5. If missing or marked `TODO_BACKEND`, mark your frontend integration with `// TODO_BACKEND: [reason]` and do not invent integration or fake API calls.
6. Do not change backend code or schemas unless explicitly requested by the user.

## Specific Alignment Rules for WeBee Bakery
- **Auth**: Always call `GET /users/me` (NOT `/auth/me`).
- **Cart**: Cart uses HTTP-only cookie `session_id`. Always set `withCredentials: true` on cart HTTP requests. Do NOT send `X-Session-Id` header.
- **Payment**: UI bắt buộc cho phép chọn cả `transfer` và `cod`. Đối với `cod`, đánh dấu `// TODO_BACKEND: Backend cần bổ sung 'cod' vào enum payment_method`.
- **Checkout Fields**: `delivery_date` and `delivery_time_slot` are REQUIRED. Address must be combined into a single string `delivery_address`.
