# Coding Rules

> Specific to: WeBee Angular 22 project  
> Date: 2026-06-27

---

## TypeScript

- **Strict mode is ON.** Do not disable `strict` in `tsconfig.json`.
- **Never use `any`** unless absolutely unavoidable (e.g., `navigator.sendBeacon` typing). Always use proper interfaces.
- **Use interfaces** for all data models â€” see `document/erd.md`.
- **Use `readonly`** on interface fields that should not be mutated.
- **Avoid type assertions (`as`)** unless necessary for DOM or third-party types. Prefer type narrowing.
- **Prefer `const`** over `let`. Never use `var`.

```typescript
// WRONG
const data: any = response;

// CORRECT
const data: ProductListResponse = response;
```

---

## Angular

### Components
- All components MUST be **standalone** (`standalone: true`).
- **Smart components (pages):** Located in `features/*/pages/`. May inject services and APIs.
- **Dumb components (shared):** Located in `shared/components/`. Use only `@Input()` and `@Output()`. Must NOT inject any API or service.
- Use `inject()` function instead of constructor injection for Angular 16+.

```typescript
// CORRECT
@Component({ standalone: true, ... })
export class ProductListPage {
  private productsApi = inject(ProductsApi);
  private toastService = inject(ToastService);
}
```

### Forms
- Use **Reactive Forms** (`FormGroup`, `FormControl`, `Validators`) for all create/edit/login/register forms.
- Use template-driven forms only for trivial search inputs.
- Always show field-level validation messages in the template.

```typescript
// CORRECT
this.form = new FormGroup({
  fullName: new FormControl('', [Validators.required, Validators.maxLength(100)]),
  email: new FormControl('', [Validators.email]),
});
```

### Observables
- Use `async` pipe in templates where possible to avoid manual subscription management.
- When manual subscription is needed, always unsubscribe using `takeUntilDestroyed()` (Angular 16+).
- Do not call `.subscribe()` without handling unsubscription.

```typescript
// CORRECT â€” use takeUntilDestroyed
this.productsApi.getProducts(params)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(data => { this.products = data.data; });
```

### Change detection
- Default change detection is fine for MVP.
- Do not prematurely add `ChangeDetectionStrategy.OnPush` unless performance problems arise.

---

## Naming conventions

| Item | Convention | Example |
|---|---|---|
| Page component | PascalCase + `Page` suffix | `ProductListPage`, `LoginPage` |
| Reusable component | PascalCase + `Component` suffix | `ProductCardComponent`, `NavbarComponent` |
| API service | PascalCase + `Api` suffix | `ProductsApi`, `AuthApi` |
| State service | PascalCase + `Service` suffix | `AuthService`, `CartService` |
| Model interface | PascalCase | `Product`, `Order`, `User` |
| Model file | kebab-case + `.model.ts` | `product.model.ts` |
| Route file | kebab-case + `.routes.ts` | `products.routes.ts` |
| API file | kebab-case + `.api.ts` | `products.api.ts` |
| Pipe | PascalCase + `Pipe` suffix | `CurrencyVndPipe` |
| Guard | camelCase + `Guard` suffix | `authGuard`, `adminGuard` |

---

## API calls

- **Never inject `HttpClient` directly in components or feature services.**
- All HTTP calls go through `core/api/*.ts` service classes.
- Response types must always be specified: `http.get<ProductListResponse>(url)`.
- Backend uses `snake_case` in request bodies. Frontend models use `camelCase`. Map at the API service layer if needed.

```typescript
// In ProductsApi
getProducts(params: ProductListParams): Observable<ProductListResponse> {
  return this.http.get<ProductListResponse>(`${this.base}`, {
    params: {
      category: params.category ?? '',
      search: params.search ?? '',
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
    }
  });
}
```

---

## Error handling

- Never display raw backend error messages to the user.
- Always catch errors at the component level (not in API services).
- Show user-friendly messages via `ToastService`.
- Map HTTP status codes to user messages:
  - `401` â†’ "Vui lÃ²ng Ä‘Äƒng nháº­p láº¡i."
  - `403` â†’ "Báº¡n khÃ´ng cÃ³ quyá»n thá»±c hiá»‡n thao tÃ¡c nÃ y."
  - `404` â†’ "KhÃ´ng tÃ¬m tháº¥y dá»¯ liá»‡u."
  - `409` â†’ "Dá»¯ liá»‡u Ä‘Ã£ tá»“n táº¡i." (e.g., duplicate email)
  - `500` â†’ "Lá»—i há»‡ thá»‘ng. Vui lÃ²ng thá»­ láº¡i sau."

---

## File modification rules

- **Make the smallest reasonable change.** Do not rewrite files unrelated to the current task.
- **Do not reformat unrelated code.** Formatting changes should be separate commits.
- **Do not introduce new npm packages** without explaining the reason and getting approval.
- **Do not modify backend files** (`backend/src/**`) unless explicitly requested.
- **Do not modify Prisma schema** unless explicitly requested.

---

## Currency formatting

Always format Vietnamese Dong using `CurrencyVndPipe`:

```typescript
// Template
{{ product.basePrice | currencyVnd }}
// Output: "150.000 â‚«"
```

Never format currency manually in component logic.

---

## Fake/mock data rule

- **Do not hardcode fake data** in components if a real API endpoint exists.
- If an endpoint is UNCLEAR or TODO_BACKEND, isolate the mock clearly:

```typescript
// ASSUMPTION: This is a mock until backend implements GET /admin/customers
const mockCustomers: User[] = []; // TODO_BACKEND: replace with real API call
```

---

## Comments

- Use JSDoc for public methods in service classes.
- Use `// ASSUMPTION:` for any choice made without clear backend confirmation.
- Use `// TODO_BACKEND:` for frontend code that depends on a missing/unclear backend feature.
- Use `// TODO:` for frontend-only improvements to do later.
