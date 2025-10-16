# Backend API Rules

## Endpoints

- `GET /api/products`
  - Query: `genders`, `brands` (UUID CSV), `season`, `profileAny`, `profileAll`, `sort` in {`newest`,`price_asc`,`price_desc`}, `page`, `perPage`.
  - Response: `ProductsListResponse` `{ items: Product[], count, page, perPage }`.
  - Validation via `utils/validation.ts`; return 400 for invalid parameters.
  - Pagination with `range(from,to)`. Sorting by `date_create` or `price_10ml`.
- `GET /api/products/:id`
  - Path: `id` (UUID). 400 if invalid; 404 if not found.
  - Query: `withRelated` (bool), `relatedLimit` (1..20).
  - Response: `Product` plus optional `related_products`.
  - Caching: `Cache-Control: public, max-age=600`, ETag by `id` + `date_create`.
- `GET /api/brands`
  - Query: `withCount` (bool) to include aggregated `products_count`.
  - Ordering by `name` asc.
  - Caching: `Cache-Control: public, max-age=300`, ETag by length and flag.

## Guidelines

- Always use `serverSupabaseClient(event)`.
- Validate all inputs; never pass unvalidated values into SQL filters.
- Map DB relations using select aliases (e.g., `brands:brand_id(id,name)`).
- Do not leak DB errors; wrap with `createError` 500 and hide details in prod.
- Keep responses typed with `types/api.ts` and `types/product.ts`.
- Prefer narrow SELECTs; add fields explicitly when extending the UI.
