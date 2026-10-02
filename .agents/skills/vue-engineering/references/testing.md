# Vue Test Conventions

- Pure `src/lib/` unit tests need no Pinia. Store tests create a fresh
  `setActivePinia(createPinia())` in `beforeEach`, never at module scope.
- Component tests use `createTestingPinia({ stubActions: false, createSpy: vi.fn,
initialState })` when exercising real actions. Supply the full settings
  state when locale, currency, or theme affects the component.
- Use `freshPage` or `returningPage` from `e2e/fixtures.ts` for browser
  flows that depend on initial persisted state.
- For work under an active SDD spec, trace test cases to its `AC-N.M` IDs
  using the repository's `TC-U-NNN (AC-X.Y):` naming convention. Do not
  invent AC IDs for unrelated maintenance work.
- Run `npm test && npm run typecheck && npm run lint`. Use
  `npm run test:coverage` for changed calculations or tax logic and
  `npm run e2e` for changed routes, persistence, or critical user flows.
  Apply the coverage thresholds in `constitution.md` and the project
  coverage configuration; do not infer quality from a percentage alone.
