# TicketBari — Server

REST API for **TicketBari**, an online ticket booking platform for bus, train, launch, and plane tickets. Handles authentication (via BetterAuth), tickets, bookings, Stripe payments, and role management for the User / Vendor / Admin dashboards.

## Tech Stack

- Node.js + Express
- MongoDB (native driver)
- BetterAuth (email/password + Google social login)
- JSON Web Token (protects the resource API)
- Stripe (payments)

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in your real values
npm run dev
```

Server runs on `http://localhost:5000` by default.

## Environment Variables

See `.env.example` for the full list. You will need:

- A **MongoDB Atlas** cluster (`DB_USER`, `DB_PASS`, `DB_NAME`)
- A **Google OAuth Client ID/Secret** for "Continue with Google" (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) — set the authorized redirect URI to `{BETTER_AUTH_URL}/api/auth/callback/google`
- A **Stripe secret key** (`STRIPE_SECRET_KEY`)
- Two long random strings for `ACCESS_TOKEN_SECRET` and `BETTER_AUTH_SECRET`

## Creating Your First Admin Account

1. Register a normal account from the client (Register page).
2. Run:
   ```bash
   node scripts/makeFirstAdmin.js you@example.com
   ```
3. Log out and back in (or refresh) — the dashboard now shows the Admin sidebar.

From there, use **Manage Users** in the Admin dashboard to promote anyone else to admin or vendor.

## API Overview

| Method | Route | Access |
|---|---|---|
| POST | `/jwt` | Public — issues the resource-API JWT after BetterAuth login |
| POST | `/users` | Public — syncs a new BetterAuth user into our app fields |
| GET | `/users/role/:email` | Logged in |
| GET | `/users` | Admin |
| PATCH | `/users/admin/:id` | Admin |
| PATCH | `/users/vendor/:id` | Admin |
| PATCH | `/users/fraud/:id` | Admin |
| GET | `/tickets` | Public (approved only, search/filter/sort/pagination) |
| GET | `/tickets/latest` | Public |
| GET | `/tickets/advertised` | Public |
| GET | `/tickets/:id` | Logged in |
| POST | `/tickets` | Vendor |
| GET/PATCH/DELETE | `/tickets/vendor/:email`, `/tickets/:id` | Vendor (own tickets) |
| GET | `/tickets/manage` | Admin |
| PATCH | `/tickets/approve/:id`, `/tickets/reject/:id`, `/tickets/advertise/:id` | Admin |
| POST | `/bookings` | Logged in |
| GET | `/bookings/user/:email` | Logged in |
| GET | `/bookings/vendor/:email` | Vendor |
| PATCH | `/bookings/accept/:id`, `/bookings/reject/:id` | Vendor |
| DELETE | `/bookings/:id` | Logged in (only while pending) |
| POST | `/create-payment-intent`, `/payments` | Logged in |
| GET | `/payments/user/:email` | Logged in |
| GET | `/vendor-stats/:email` | Vendor |
| GET | `/admin-stats` | Admin |
| ALL | `/api/auth/*` | BetterAuth (registration, login, Google OAuth, session) |

## Deployment Notes

- Set `CLIENT_URL` and `BETTER_AUTH_URL` to your real production URLs (not localhost) before deploying, or cookies/CORS will fail.
- On Vercel/Render, add every variable from `.env.example` to the project's environment settings.
- Make sure the MongoDB Atlas Network Access list includes `0.0.0.0/0` (or your host's IP) so the deployed server can connect.
