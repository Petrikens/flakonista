# Performance & Security

## Performance

- Server:
  - Paginate always; never return unbounded lists.
  - Use narrow SELECTs; add only required columns.
  - Add HTTP caching headers (Cache-Control, ETag) where data is slow-changing.
- Client:
  - Debounce filter changes; skip duplicate brand fetches.
  - Derive and memoize computed props; avoid unnecessary watchers.
  - Deduplicate paginated items by id.

## Validation

- Centralize constraints in `utils/validation.ts`.
- Validate all query params; return 400 on invalid enum/UUID.
- Sanitize arrays: trim, non-empty, filter allowed values.

## Security

- Never echo raw DB errors to clients in production.
- Use server-side Supabase client only on server routes.
- Avoid leaking internal IDs beyond what UI requires.
- Treat query params as untrusted; validate before building DB filters.

## Observability

- Log unexpected errors server-side; avoid noisy logs for handled 4xx.
- Prefer structured error messages with `statusCode`/`statusMessage`.
