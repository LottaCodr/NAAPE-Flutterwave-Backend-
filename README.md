# NAAPE API

Production-oriented TypeScript API for the Nigerian Association of Aircraft Pilots and Engineers. It powers identity, memberships, editorial publishing, events, notifications, subscriptions, and Flutterwave payments.

## Highlights

- JWT and Google authentication with role-based access controls
- Publication review workflows, news, comments, and notifications
- Event registration and verified Flutterwave transactions
- Subscription plans and member payment history
- Cloudinary image processing with file type and size controls
- Structured errors, request IDs, CORS protection, rate limits, security headers, and health checks
- Responsive API landing page at `/`

## Quick start

```bash
cp .env.example .env
npm ci
npm run dev
```

The API listens on `http://localhost:5000` by default. MongoDB must be available before the server starts.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start with automatic reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run typecheck` | Validate types without output |
| `npm test` | Run the API test suite |
| `npm start` | Run the compiled production server |
| `npm run create-admin` | Create an initial administrator |

## Core endpoints

| Area | Base path | Access |
| --- | --- | --- |
| Authentication | `/api/v1/auth` | Public / rate-limited |
| Users | `/api/v1/users` | Authenticated; admin lists |
| Publications | `/api/v1/publications` | Approved content public |
| News and events | `/api/v1/news`, `/api/v1/events` | Reads public; writes privileged |
| Payments | `/api/v1/payments` | Authenticated; payouts admin-only |
| Plans | `/api/v1/plans` | Reads public; writes admin-only |
| Membership forms | `/api/v1/membership-form` | Submit public; management admin-only |
| Health | `/health` | Public |

Protected routes require:

```http
Authorization: Bearer <jwt>
```

Errors use a consistent shape at the application boundary:

```json
{
  "success": false,
  "code": "ROUTE_NOT_FOUND",
  "message": "Route GET /missing was not found",
  "requestId": "..."
}
```

## Flutterwave webhook

Configure Flutterwave to send events to:

```text
POST https://your-api.example.com/webhook/flutterwave
```

Set the same secret hash in Flutterwave and `FLW_HASH`. Transaction verification additionally checks ownership, amount, currency, plan/event metadata, and idempotency before granting access.

## Deployment

1. Set every production variable in `.env.example` that applies to your deployment.
2. Use a long random `JWT_SECRET`; the server refuses to start in production if core secrets are missing.
3. Run `npm ci && npm run build` during build and `npm start` at runtime.
4. Monitor `GET /health`; it returns `503` when MongoDB is disconnected.
5. Add each browser origin to `CORS_ORIGINS` as an exact, comma-separated URL.

Never commit `.env` or provider credentials.
