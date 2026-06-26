# TicketBari — Server

REST API for **TicketBari**, an online ticket booking platform for bus, train, launch, and plane tickets. Handles authentication (via BetterAuth), tickets, bookings, Stripe payments, and role management for the User / Vendor / Admin dashboards.

## Tech Stack

- Node.js + Express
- MongoDB (native driver)
- BetterAuth (email/password + Google social login)
- JSON Web Token (protects the resource API)
- Stripe (payments)

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


