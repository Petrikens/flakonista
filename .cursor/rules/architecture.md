# Architecture Rules

- Source of truth: `@architecture.mdc` at repo root.
- Keep server modules in `server/api/` thin: validate input, build Supabase query, map output.
- Client state/business logic lives in `composables/` or `stores/`; UI components must remain presentational.
- Domain types live in `types/`; do not import from components into types.
- Shared helpers go to `utils/`; avoid cross-import cycles.
- Prefer typed responses (`types/api.ts`) for all API calls.
- Any new feature: update `@architecture.mdc` and this file if boundaries change.
