# Feature Implementation Template

> Use this checklist every time you implement a new frontend feature in WeBee.  
> Date: 2026-06-27

---

## 1. Read documentation first

Before writing any code, confirm you have read:

- [ ] `document/context.md`
- [ ] `document/backend/api.md`
- [ ] `document/erd.md`
- [ ] `.agent/FRONTEND_ARCHITECTURE.md`
- [ ] `.agent/CODING_RULES.md`
- [ ] `document/frontend/UI_UX_RULES.md`

---

## 2. Confirm feature scope

Fill in before starting:

```
Feature name: ___________
Backend endpoints used:
  - METHOD /path (status: CONFIRMED / UNCLEAR / TODO_BACKEND)
  - ...
Models used:
  - (list interfaces from document/erd.md)
Pages needed:
  - src/app/features/{feature}/pages/{name}.page.ts
Components needed:
  - (list new shared or feature components)
Existing files to modify:
  - (list existing services, routes, or layouts to update)
```

---

## 3. Create or update models

Location: `src/app/core/models/{feature}.model.ts`

Required interfaces:
- [ ] Entity interface (e.g., `Product`, `Order`)
- [ ] Create request interface (e.g., `CreateProductRequest`)
- [ ] Update request interface (e.g., `UpdateProductRequest`)
- [ ] List/paginated response interface if needed

Rule: Use only fields confirmed in `document/backend/api.md`. Do not add fields that don't exist in the API.

---

## 4. Create or update API service

Location: `src/app/core/api/{feature}.api.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class {Feature}Api {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/{resource}`;

  // Only include methods matching confirmed backend endpoints
  getList(params?: ...): Observable<PaginatedResponse<Entity>> { ... }
  getById(id: string): Observable<Entity> { ... }
  create(payload: CreateRequest): Observable<Entity> { ... }
  update(id: string, payload: UpdateRequest): Observable<Entity> { ... }
  delete(id: string): Observable<{ message: string }> { ... }
}
```

Rules:
- Only implement methods for confirmed backend endpoints.
- If endpoint is UNCLEAR/TODO_BACKEND, add comment and return mock Observable.
- Always type the response: `http.get<ResponseType>(url)`.

---

## 5. Create feature routes

Location: `src/app/features/{feature}/{feature}.routes.ts`

```typescript
export const {feature}Routes: Routes = [
  {
    path: '',
    component: {Feature}ListPage
  },
  {
    path: 'create',
    component: {Feature}FormPage,
    canActivate: [authGuard]  // if needed
  },
  {
    path: ':id',
    component: {Feature}DetailPage
  },
  {
    path: ':id/edit',
    component: {Feature}FormPage,
    canActivate: [authGuard]  // if needed
  },
];
```

Then register in `app.routes.ts`:
```typescript
{
  path: '{feature}',
  loadChildren: () => import('./features/{feature}/{feature}.routes').then(m => m.{feature}Routes)
}
```

---

## 6. Create page components

For each page, use this skeleton:

```typescript
@Component({
  standalone: true,
  selector: 'app-{name}-page',
  imports: [CommonModule, ReactiveFormsModule, /* shared components */],
  templateUrl: './{name}.page.html',
  styleUrl: './{name}.page.scss'
})
export class {Name}Page implements OnInit {
  // Services
  private {feature}Api = inject({Feature}Api);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  // State
  isLoading = signal(false);
  error = signal<string | null>(null);
  data = signal<Entity[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.{feature}Api.getList()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (res) => this.data.set(res.data),
        error: (err) => {
          this.error.set('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u. Vui lÃ²ng thá»­ láº¡i.');
          // Map specific status codes if needed
        }
      });
  }
}
```

---

## 7. Template structure

Every API-connected page template must include:

```html
<!-- Loading state -->
@if (isLoading()) {
  <app-loading-spinner />
}

<!-- Error state -->
@if (error() && !isLoading()) {
  <div class="error-state">
    <p>{{ error() }}</p>
    <button (click)="loadData()">Thá»­ láº¡i</button>
  </div>
}

<!-- Empty state -->
@if (!isLoading() && !error() && data().length === 0) {
  <div class="empty-state">
    <p>ChÆ°a cÃ³ dá»¯ liá»‡u</p>
  </div>
}

<!-- Success state -->
@if (!isLoading() && !error() && data().length > 0) {
  <!-- Render data here -->
}
```

---

## 8. Required UI states checklist

For every component that fetches from API:

- [ ] Loading state â€” spinner or skeleton
- [ ] Empty state â€” friendly message, optional CTA
- [ ] Error state â€” user-friendly message + retry button
- [ ] Success state â€” main content
- [ ] (Forms) Validation error state â€” field-level messages

---

## 9. Form implementation

```typescript
form = new FormGroup({
  name: new FormControl('', [
    Validators.required,
    Validators.maxLength(100)
  ]),
  price: new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0)
  ]),
});

submit(): void {
  if (this.form.invalid) return;
  
  this.isSubmitting.set(true);
  this.{feature}Api.create(this.form.value as CreateRequest)
    .pipe(finalize(() => this.isSubmitting.set(false)))
    .subscribe({
      next: () => {
        this.toastService.success('Táº¡o thÃ nh cÃ´ng!');
        this.router.navigate(['/{feature}']);
      },
      error: (err) => {
        const msg = err.status === 409 ? 'Dá»¯ liá»‡u Ä‘Ã£ tá»“n táº¡i.' : 'CÃ³ lá»—i xáº£y ra.';
        this.toastService.error(msg);
      }
    });
}
```

---

## 10. Delete action

Always use the shared `confirm-dialog` component:

```typescript
async delete(id: string): Promise<void> {
  const confirmed = await this.confirmDialog.open({
    title: 'XÃ¡c nháº­n xÃ³a',
    message: 'Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a má»¥c nÃ y khÃ´ng?',
    confirmLabel: 'XÃ³a',
    cancelLabel: 'Há»§y'
  });

  if (!confirmed) return;

  this.{feature}Api.delete(id)
    .subscribe({
      next: () => {
        this.toastService.success('ÄÃ£ xÃ³a thÃ nh cÃ´ng.');
        this.loadData(); // refresh list
      },
      error: () => this.toastService.error('KhÃ´ng thá»ƒ xÃ³a. Vui lÃ²ng thá»­ láº¡i.')
    });
}
```

---

## 11. Final report after implementation

After completing the feature, provide this summary:

```markdown
## Implementation Summary â€” {Feature Name}

### Files created
- src/app/core/models/{feature}.model.ts
- src/app/core/api/{feature}.api.ts
- src/app/features/{feature}/{feature}.routes.ts
- src/app/features/{feature}/pages/{name}.page.ts
- ...

### Files modified
- src/app/app.routes.ts â€” added {feature} route
- ...

### API endpoints used
- GET /api/{resource} â€” CONFIRMED
- POST /api/{resource} â€” CONFIRMED
- ...

### Assumptions made
- (list each // ASSUMPTION: written)

### TODO_BACKEND items
- (list each // TODO_BACKEND: written, what endpoint is missing)

### How to test
1. Run `npm start` in frontend folder
2. Navigate to /{feature}
3. Verify loading state appears
4. Verify data loads from backend
5. (specific test steps for this feature)
```
