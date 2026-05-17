// Vitest setup file. Registered via vitest.config.ts.
// Runs once before each test file.

import { afterEach } from 'vitest'

afterEach(() => {
  localStorage.clear()
})

// jsdom limitation: Chart.js requires ResizeObserver to size canvases responsively,
// but jsdom does not implement it. Stub here, NOT in product code. The mock is
// limited to test runs; production runtime keeps the real browser API.
// See ADR-5 in specs/20260515-fix-calculos-financieros/2-plan.md.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserverStub,
  })
}

// navigator.storage.estimate() is mocked ONLY in TC-C-001 (quota-exceeded path).
// Real localStorage is used everywhere else per Constitution (prefer real over
// mock for persistence). Individual tests override via vi.spyOn when needed.
// Default stub here returns plenty of free space so unrelated tests are unaffected.
if (
  typeof navigator !== 'undefined' &&
  navigator.storage &&
  typeof navigator.storage.estimate !== 'function'
) {
  Object.defineProperty(navigator.storage, 'estimate', {
    writable: true,
    configurable: true,
    value: async () => ({ quota: 5_000_000, usage: 0 }),
  })
}
