# UI/UX Conflict Check Rules

Before implementing any screen:
1. Check `document/layout_contract.md`.
2. Check `document/ux_conflict_audit.md`.
3. Check `document/ui_improvement_plan.md`.
4. Check the related page functional description document in `document/frontend/`.
5. Do not implement known conflicts as-is. Always apply the resolution specified in the audit rules.
6. If a screen has an unresolved UX conflict that is not documented, stop and document it before coding.

## Mandatory UX Rules
- **Return to Cart**: Checkout page MUST provide a visible "Chỉnh sửa giỏ hàng" link returning to `/cart`.
- **Loading / Empty / Error**: Every data-fetching UI component MUST implement all 4 states (Loading skeleton, Empty state, Error retry, Success view).
- **Custom Cake**: Must hide global footer and use split-screen fixed preview layout.
