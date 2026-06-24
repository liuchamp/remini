
```
buf generate /Users/champliu/workspace/remxdev/zxivser/protos --template src/shared/api2/buf.gen.yaml
```

## Runtime

`generated/` is protoc output and must not be edited by hand.

Use `@/shared/api2` from domain modules:

- `runtime.ts` adapts generated `{ path, method, body }` requests to `Taro.request`.
- `clients.ts` exports typed service clients such as `logisticsService` and `productService`.
- `index.ts` re-exports generated types, runtime helpers, and clients.

The runtime keeps the behavior expected from the old `shared/api/request.ts` layer:

- H5 uses `/api`; miniapp targets use `https://api.remx.com`.
- Generated paths such as `api/v1/products` are normalized to `/api/v1/products`.
- `Authorization`, platform, client type, and JSON headers are attached.
- `{ code, data, message }` responses are unwrapped for generated service clients.
- `401` refreshes `/api/v1/auth/refresh` and replays the original request once.
- `403`, `412`, timeout, and network errors keep the existing user-facing handling.

## Migration Status

Migrated:

- `src/domains/address/api.ts` now uses `logisticsService` while preserving the legacy `ApiResponse<T>` return shape for pages and stores.
- `src/domains/notification/api.ts` now uses `notificationService` while preserving the legacy `ApiResponse<T>` return shape for pages and stores.
- `src/domains/marketing/api.ts` now uses `marketingService` while preserving the legacy `ApiResponse<T>` return shape for pages and stores.

Recommended next order:

1. `product`
2. `community`
3. `chat`
4. `trade`
5. `wallet`
6. `shipping`
7. `auth`
8. `kyc`
9. scattered direct callers in `pages/` and shared components

For each domain, keep the public domain API contract stable first. After all consumers are migrated, remove the legacy `ApiResponse<T>` wrapping and delete `src/shared/api/request.ts`.
