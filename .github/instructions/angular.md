# Angular — Detailed Rules

Referenced from AGENTS.md. MUST be read before creating or modifying components,
templates, services, routes, or forms.

## Components

- Build on **Angular Material**. Use the Material component that covers the needed
  semantics; reimplementing a Material primitive is a defect.
- Small, single-responsibility components. Prefer an inline template when it is
  about 10 lines or fewer; otherwise use an external file.
- `input()` / `output()` functions, not decorators. `model()` for `[(prop)]`.
- Members used only by the template are `protected`. Everything else that is not
  public API is `private`. Never test them directly (see testing.md).
- `computed()` for derived state; `linkedSignal()` for state derived from several
  sources that must stay in sync.
- Prefer Signal Forms (`@angular/forms/signals`) for new forms; otherwise Reactive
  forms, never Template-driven.
- No `ngClass` / `ngStyle`; use `class` and `style` bindings.
- External templates/styles use paths relative to the component file.
- **Directives** for DOM manipulation, event handling, and reusable UI logic;
  structural directives for permission/auth checks.
- Use `host` in the decorator, never `@HostBinding` / `@HostListener`.
- `NgOptimizedImage` for static images (not for inline base64).

## State and reactivity

| Situation | Use | Do NOT use |
|-----------|-----|------------|
| Value derived from other signals | `computed()` | `effect()` setting a signal |
| Derived from several sources, must stay in sync | `linkedSignal()` | `computed()` + `effect()` |
| Local component state | `signal()` | `BehaviorSubject` |
| Side effect (logging, analytics, DOM) | `effect()` | `computed()` |
| Async data fetch | `resource()` / `httpResource()` | `subscribe()` + manual `set` |

- Keep state transformations pure. Use `update` / `set`, never `mutate`.
- Every async source renders its loading and error states, not only the happy
  path.
- Clean up subscriptions with `takeUntilDestroyed()` or `DestroyRef`. Never
  unsubscribe by hand in `ngOnDestroy`.
- Convert between signals and RxJS with `toSignal()` / `toObservable()`. Do not
  mirror an Observable into a signal with `subscribe()` + `set`.

## Templates

- Keep them simple. Native control flow (`@if`, `@for`, `@switch`), `track` always,
  tracking by a stable id, never by index unless the list is static.
- Async pipe for observables.
- Templates cannot access globals like `new Date()`; expose the value from the
  class (signal or `computed()`).
- No `CommonModule`; import only the directives/pipes used (`AsyncPipe`, ...).
- No function calls in bindings except signal reads. Derive with `computed()`.
- `@let` for a value used several times in one template.
- `@defer` for heavy UI that is not needed on first render.
- ARIA and accessibility rules: see accessibility.md.

## Services

- Single responsibility. Use `inject()`, not constructor injection.
- New root singletons use `@Service()`. Use `@Injectable` only for non-root scopes
  (`platform`, `any`, a module) or when editing an existing one. Do not migrate
  existing services as a side effect of a feature change.
- Prefer composition (inject another service) over inheritance.
- Expose state as read-only signals (`asReadonly()`); mutate only through
  methods of the service.
- All HTTP lives in services (or `httpResource()` inside them). Components never
  inject `HttpClient`.
- Type every request and response. Never leave an HTTP result as `any`.

## Routing

- Lazy-load feature routes with `loadComponent` / `loadChildren`.
- Read route params and data through component inputs
  (`withComponentInputBinding()`), not `ActivatedRoute` subscriptions.
- Guards, resolvers, and interceptors are functional, never class-based.

## Forms

- New forms use Signal Forms; existing Reactive forms stay Reactive.
- Validation messages use `mat-error` inside `mat-form-field`.
- A form never submits while invalid; disable by state, not by hiding errors.

## Performance

- Keep the initial bundle small: lazy routes, `@defer`, no heavy imports at the
  root.
- Avoid work in `effect()` that can run on every signal change; derive instead.
- Heavy computations belong in `computed()` so they are memoized.