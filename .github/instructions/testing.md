# Testing — Detailed Rules

Referenced from AGENTS.md. MUST be read before creating or modifying any spec.

## Runner

- Runner is **Vitest**, executed through `ng test`. Single run: `pnpm test:run`
  (`ng test --watch=false`).
- Mocks and spies use Vitest only: `import { vi } from 'vitest'` and `vi.fn()`,
  `vi.spyOn()`, `vi.mocked()`. Never use Jasmine APIs (`jasmine.createSpyObj`,
  `spyOn`).
- Do NOT use Zone-based helpers: `fakeAsync`, `tick`, `flush`, `waitForAsync`.
  Use `await fixture.whenStable()`, harness auto-waiting, and Vitest fake timers.
- Never use `any` in specs. Type stubs with `satisfies Partial<T>`.

## Setup

- Test setup lives with the spec. Each spec (or spec group) configures its own
  `TestBed` explicitly.
- Do not create a project-wide wrapper unless the same setup is repeated in 5 or
  more specs.
- Stub what the spec does not care about: replace irrelevant dependencies with
  minimal stubs.
- Set component inputs with `fixture.componentRef.setInput(name, value)`, then
  `await fixture.whenStable()`.
- For routed components that use `withComponentInputBinding()`, test through
  `RouterTestingHarness`.

## Stubbing

- **Services**: provide a typed partial stub.
  ```ts
  { provide: UserService, useValue: { user: signal(null) } satisfies Partial<UserService> }
  ```
- **HTTP**: `provideHttpClient()` + `provideHttpClientTesting()`, then drive
  responses with `HttpTestingController` (`expectOne(...).flush(...)`). Call
  `verify()` in `afterEach`. This also applies to `httpResource()`.
- **Router**: `provideRouter([])`, or `RouterTestingHarness.create()` when the
  spec needs navigation.
- **Time** (debounce, timeouts): `vi.useFakeTimers()` in the arrange step,
  advance with `await vi.advanceTimersByTimeAsync(ms)`, and ALWAYS restore with
  `vi.useRealTimers()` in `afterEach`. Never wait with real `setTimeout`.
- **Signals / resources**: stub with writable `signal()` values so the spec can
  change state and assert the resulting UI.

## Harnesses

- Always drive component specs through a harness. Prefer the harness that ships
  with Angular Material for the component under test (e.g. `MatButtonHarness`
  from `@angular/material/button/testing`).
- `@angular/cdk/testing` ships with Angular Material (Angular CDK). Import it
  directly. It is NOT a new dependency and needs no tooling commit.
- Get a loader with `TestbedHarnessEnvironment.loader(fixture)`.
- Harnesses expose typed methods (`click()`, `getText()`, `isDisabled()`) instead
  of raw DOM queries. Never use `fixture.debugElement.query`,
  `fixture.nativeElement.querySelector`, or `document.querySelector` in specs.

### Custom harnesses

- Create one only when no Material harness covers the behavior.
- File: `<name>.harness.ts`, colocated with the component, one harness per file.
- Extend `ComponentHarness`, declare `static hostSelector`, and build every query
  with a typed `locatorFor` / `locatorForOptional` / `locatorForAll`.
- Prefer composing Material harnesses inside the custom one over selectors.
- Expose behavior and state (`increment()`, `getCount()`), never DOM details.

## Overlays

Dialogs, menus, selects, autocompletes, tooltips, and snackbars render outside
the fixture. Locate them with the document root loader:

```ts
const overlay = TestbedHarnessEnvironment.documentRootLoader(fixture);
const menu = await overlay.getHarness(MatMenuHarness);
```

## Accessibility assertions

Assert the semantics defined in AGENTS.md as observable behavior, via harnesses:

- **Role / name / label**: `(await harness.host()).getAttribute('role')`,
  `getAttribute('aria-label')`, or the harness's own `getText()`/`getLabel()`.
- **Focus**: `await harness.focus()` then `expect(await harness.isFocused())`.
- **Keyboard**: `(await harness.host()).sendKeys(TestKey.ENTER)` and assert the
  outcome, not that the key was pressed.
- **State**: `isDisabled()`, `isChecked()`, `isExpanded()` where the harness
  provides them.

## Non-component specs

- **Services**: `TestBed.inject(Service)`. Only skip `TestBed` if the service has
  no DI at all.
- **Pipes**: instantiate directly (`new MyPipe()`) when it has no dependencies.
- **Directives**: test through a minimal host component declared in the spec
  and a harness for that host.
- **Guards / resolvers**: `TestBed.runInInjectionContext(() => guard(route, state))`.
  Convert Observable results with `lastValueFrom`.

## Extraction

- If the same arrange/act/assert logic appears in 3 specs, extract it into a
  spec-local helper colocated with those specs.
- Do not extract before the third repetition.

## Examples

### Good

```ts
describe('CounterComponent', () => {
  describe('when the user presses Increment', () => {
    it('shows the updated count', async () => {
      // Arrange
      const fixture = TestBed.createComponent(CounterComponent);
      const counter = await TestbedHarnessEnvironment.harnessForFixture(
        fixture,
        CounterHarness,
      );

      // Act
      await counter.increment();

      // Assert
      expect(await counter.getCount()).toBe('1');
    });
  });
});
```

```ts
// counter.harness.ts
export class CounterHarness extends ComponentHarness {
  static hostSelector = 'app-counter';

  private readonly incrementButton = this.locatorFor(
    MatButtonHarness.with({ text: 'Increment' }),
  );
  private readonly count = this.locatorFor('[data-testid="count"]');

  async increment(): Promise<void> {
    await (await this.incrementButton()).click();
  }

  async getCount(): Promise<string> {
    return (await this.count()).text();
  }
}
```

### Bad

```ts
it('increments', done => {
  const fixture = TestBed.createComponent(CounterComponent);
  fixture.componentInstance.increment();            // tests a method, not behavior
  fixture.detectChanges();
  fixture.componentInstance.count$.subscribe(v => { // .subscribe() + done()
    expect(
      fixture.nativeElement.querySelector('.count').textContent, // raw DOM
    ).toBe('1');
    done();
  });
});
```