# Coding Standards

## TypeScript/Vue

- Use explicit types for public APIs, store state, and composable returns.
- Avoid `any`; prefer union literals and domain types.
- Early returns over deep nesting; avoid redundant try/catch.
- Comments only for non-obvious rationale, invariants, or caveats.
- Keep helpers pure; avoid side effects in getters.

## Structure & Naming

- Functions = verbs; variables = nouns. Prefer full words.
- Group domain types under `types/`; utilities under `utils/`.
- Avoid long parameter lists—prefer objects with named fields.

## Git & Reviews

- One logical change per commit; descriptive messages.
- Run `npm run lint` and `npm run format` before PR.
- Review checklist:
  - Types correct and exported where needed.
  - Validation covers all inputs.
  - No leaking DB/internal errors to clients.
  - No circular deps; imports are topologically sane.
  - Performance notes addressed (pagination, caching).
