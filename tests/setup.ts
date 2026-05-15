// Vitest setup file. Registered via vitest.config.ts.
// Runs once before each test file.

import { afterEach } from 'vitest'

afterEach(() => {
  localStorage.clear()
})
