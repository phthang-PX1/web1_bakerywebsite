# Website Implementation Workflow — WeBee Bakery

This document serves as the master guide for coding agents executing frontend implementation phases.

## Phase Execution Checklist
When assigned a frontend implementation phase from `document/frontend/implementation_plan.md`:

1. **Pre-Flight Check**:
   - Read `NO_CODE_PLANNING_RULE.md` — confirm user requested implementation.
   - Read `backend_alignment.md` — verify required endpoints exist in `backend/api_contract.md`.
   - Read `conflict_check.md` — ensure no UX contradictions exist.
   - Read `ui_ux_rules.md` — ensure warm bakery aesthetic and required states are planned.

2. **Component & Service Setup**:
   - Create models in `core/models/` matching `schema.md`.
   - Create API services in `core/api/` mapping to confirmed endpoints.
   - Set standalone flag `standalone: true` on all Angular components.

3. **Implementation**:
   - Implement loading skeleton, empty state, error handling, and success view.
   - Use `CurrencyVndPipe` for all monetary values.
   - Validate form fields with Reactive Forms and display Vietnamese error messages.

4. **Verification**:
   - Run `npm run build` to verify zero TypeScript or Angular template errors.
   - Ensure `withCredentials: true` is configured for cookie-based session endpoints (Cart).
