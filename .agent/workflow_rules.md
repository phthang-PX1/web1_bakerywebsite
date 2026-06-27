# Agent Workflow Rules — WeBee Angular Frontend

> For AI coding agents working on the WeBee Angular frontend.  
> Date: 2026-06-27 (revised)

---

## Before coding any feature

The agent MUST complete the following steps IN ORDER:

1. **Read `document/context.md`** — understand business domain, roles, modules, current status.
2. **Read `document/feature_mapping.md`** — identify the exact endpoints needed. Do NOT assume any endpoint exists without finding it here.
3. **Read `document/backend/gap_analysis.md`** — check for gaps that affect your feature.
4. **Read `document/erd.md`** — find the data models to use.
5. **Read `document/layout_contract.md`** — confirm routes, layout, and header/footer visibility.
6. **Read `.agent/FRONTEND_ARCHITECTURE.md`** — confirm where the new files should go and what patterns to follow.
7. **Read `.agent/CODING_RULES.md`** — check naming conventions and rules before writing any code.
8. **Read `document/frontend/UI_UX_RULES.md`** and `.agent/ui_ux_rules.md` — ensure all required states (loading, empty, error) are planned and UI is consistent.
9. **Read `document/ux_conflict_audit.md`** — check for unresolved conflicts affecting the feature.
10. **Inspect existing files** related to the feature — check if the service, model, or route already partially exists.

---

## Critical known facts (must not re-discover)

- **Cart session uses HTTP-only cookie `session_id`**, not `X-Session-Id` header.
  - Frontend cart requests MUST have `withCredentials: true`.
  - `cart.api.ts` currently has a bug — `X-Session-Id` header must be removed.
- **Backend endpoint is `GET /users/me`**, NOT `GET /auth/me`. The latter does not exist.
- **Payment method**: UI bắt buộc hiển thị cả COD và Chuyển khoản (`transfer`). Backend hiện chưa có COD nên đánh dấu `TODO_BACKEND` để bổ sung vào schema.
- **`delivery_date` and `delivery_time_slot` are REQUIRED** by backend for all orders.
- **Shipping fee is always 0** — display "Miễn phí" or read from order response.
- **Account routes use `/account/*`** (not `/profile/*`).
- **Blog and Policies are static content** for MVP — no backend API.
- **Cart merge** (`POST /cart/merge`) must be called after successful login.
- **No `soldCount` field** — use `rating_desc` as proxy for best sellers.

---

## During coding

- **Use only endpoints listed in `document/feature_mapping.md`** as CONFIRMED.
- If an endpoint is marked MISSING, TODO_BACKEND, or UNCLEAR — do not build full UI for it. Build placeholder with comment.
- **Place files in the correct folders** per `FRONTEND_ARCHITECTURE.md`. Never put API calls in shared components.
- **Reuse existing services and components** before creating new ones. Check `shared/components/` and `core/services/`.
- **Keep changes scoped** to the feature being implemented. Do not refactor unrelated code.
- **Do not add npm packages** unless absolutely necessary.
- **Do not change backend files** unless explicitly asked.
- **Preserve all existing comments** in files you modify. Do not remove JSDoc, ASSUMPTION, or TODO_BACKEND comments.

---

## Handling unclear or missing backend

If you need a backend capability that is UNCLEAR or missing:

1. Mark the location with `// TODO_BACKEND: [description of what's needed]`.
2. Create a temporary mock only if necessary to unblock frontend work.
3. Clearly isolate the mock.
4. Do NOT pretend the mock is real integration.

```typescript
// TODO_BACKEND: GET /admin/customers not confirmed — using empty mock
private getCustomers(): Observable<PaginatedResponse<User>> {
  // ASSUMPTION: Replace with customersApi.getList() when endpoint is confirmed
  return of({ data: [], total: 0, page: 1, limit: 20 });
}
```

---

## If you need to modify an existing file

1. Read the entire file first.
2. Make the **minimum required change** — do not rewrite unrelated parts.
3. Do not reformat the file unless that is the explicit task.
4. Preserve all existing comments, types, and method signatures you are not changing.

---

## After finishing a feature

1. Verify the component handles loading, empty, error, and success states.
2. Verify form validation messages are in Vietnamese per `UI_UX_RULES.md`.
3. Verify the component is standalone (`standalone: true`).
4. Verify API calls use correct endpoint from `feature_mapping.md`.
5. Verify all ASSUMPTION and TODO_BACKEND comments are present where applicable.
6. Verify currency is formatted with `CurrencyVndPipe`.
7. Verify destructive actions use `confirm-dialog` component.
