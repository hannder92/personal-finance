# Vue Architecture in Personal Finance

## Dependency direction

`views → components → composables → stores → lib`; avoid reverse imports.
`src/lib/` stays independent of Vue and Pinia. Views use composables to
connect stores and pure calculations; they do not import directly from
`@/lib/calculations` or `@/lib/tax`.

## State and navigation

- Follow the established setup-store shape. Mutate store state through actions,
  not directly from components. Initialize a fresh Pinia instance per store
  test; see [testing.md](testing.md).
- Use `globalThis.crypto.randomUUID()` for new entity IDs, preserving the
  documented reserved ID behavior in the income store.
- Keep `App.vue` as the navigation shell. New routes update `ALL_NAV` and
  `MOBILE_NAV`; use `RouterLink` for internal navigation.
- A view for a store with add operations needs a discoverable CTA, input flow,
  and empty state. Check existing read-only views before adding CRUD.

## Data and forms

- Validate loaded, saved, and imported state at the Zod storage boundary.
  For UI forms, use the project's Zod pattern where available; preserve store
  guards as the minimum boundary.
- A persisted shape change adds a new `AppStateSchemaVN` in
  `src/lib/storage/schema.ts` (currently V6) and its `migrateV(N-1)toVN` step in
  `src/lib/storage/migrate.ts` together.
- Put new user-facing strings in both `src/i18n/es.json` and
  `src/i18n/en.json`, then render through `t('key')`.

Read `docs/agent-reference.md` for the current store and boot-cycle catalog
instead of copying that catalog into this skill.
