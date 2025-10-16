# Frontend Rules

## Composables

- `useApi`: single point for HTTP with timeout, abort, retry; return typed generics.
- `useInfiniteProducts`:
  - Source of truth for filters, sort, pagination, debounced fetching.
  - Always build query via a single function; deduplicate by `product.id`.
  - Cache brand options; avoid refetch if already present.

## State (Pinia)

- Cart: items `{ id, product, qty }`; expose getters and minimal actions.
- Favorites: keep list and `ids` index for O(1) checks; expose `toggle`.
- Persist only necessary paths; version keys (`*_v1`).

## Components

- Keep components presentational; no direct `$fetch`—use composables.
- Derive UI options (checked flags) from state rather than mutate in place.
- Use `@nuxt/image` for product images; prefer AVIF/WebP.

## Types & Imports

- Import domain types from `types/` only; avoid component→types circular deps.
- Extend `types/api.ts` and `types/product.ts` when adding fields.

## UX

- Show skeletons/spinners based on `initialLoading`/`isLoadingMore`.
- Reset and re-fetch on filter changes with debounce (250ms, maxWait 600ms).
- Gracefully handle errors; clear stale errors before new requests.
