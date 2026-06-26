# TicketBari — Server

> REST API backend for TicketBari — Bangladesh's online ticket booking platform for Bus, Train, Launch, and Plane travel.

## 🌐 Live URLs

| | URL |
|---|---|
| **Client (Live Site)** | https://ticket-bari-client-green.vercel.app |
| **Server (API)** | https://ticketbari-server-55dz.onrender.com |

---

## 🎯 Purpose

TicketBari Server powers all backend operations — authentication, ticket listings, booking lifecycle management, Stripe payments, and role-based dashboards for Users, Vendors, and Admins. Built on Node.js and Express with MongoDB as the database.

## Tech Stack

- Node.js + Express
- MongoDB (native driver)
- BetterAuth (email/password + Google social login)
- JSON Web Token (protects the resource API)
- Stripe (payments)

## ✨ Key Features

### 🔐 Authentication & Security
- Email/Password registration and login via **BetterAuth**
- **Google OAuth** social login (Continue with Google)
- **JWT-protected** resource API — every private endpoint requires a valid Bearer token
- Role-based middleware guards: `verifyToken` → `verifyAdmin` / `verifyVendor`
- Fraud vendor system — flagged vendors lose all listing access instantly

### 🎫 Ticket Management
- Vendors can **add, update, and delete** their own tickets
- Admin **approves or rejects** vendor submissions before they go public
- Full **search** by From/To location, **filter** by transport type (Bus/Train/Launch/Plane), **sort** by price, and **pagination** (9 per page)
- Admin can **advertise** up to 6 tickets at a time on the homepage

### 📦 Booking Workflow
- Users book tickets with a desired quantity
- Booking saved instantly with `pending` status
- Vendor **accepts or rejects** each booking request
- Accepted bookings unlock the **Pay Now** button for the user
- Rejected bookings remove the countdown from the card
- Bookings **cannot be paid** after the departure date has passed
- Optional: users can **cancel** pending bookings before vendor responds

### 💳 Stripe Payments
- Server creates a **Stripe Payment Intent** for the exact booking amount
- After successful card confirmation, booking status updates to `paid`
- Ticket quantity **automatically reduced** by the booked amount
- Every transaction is saved with Transaction ID, amount, ticket title, and date

### 📊 Stats & Analytics
- **Vendor Revenue Overview** — total tickets added, total sold, total revenue, monthly revenue chart
- **Admin Summary** — total users, tickets, bookings, and platform revenue

### 👥 User Role System
| Role | Capabilities |
|---|---|
| **User** | Browse tickets, book, pay, view history |
| **Vendor** | Add/manage tickets, accept/reject bookings, view revenue |
| **Admin** | Approve tickets, manage users, control advertising |

---

## 📦 npm Packages Used

| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.19.2 | Web server framework |
| `better-auth` | ^1.2.7 | Authentication — email/password + Google OAuth |
| `mongodb` | ^6.7.0 | Native MongoDB driver |
| `jsonwebtoken` | ^9.0.2 | JWT token signing and verification |
| `stripe` | ^16.2.0 | Stripe payment processing |
| `cors` | ^2.8.5 | Cross-origin resource sharing |
| `dotenv` | ^16.4.5 | Environment variable management |
| `cookie-parser` | ^1.4.6 | Cookie parsing middleware |
| `nodemon` | ^3.1.4 | Auto-restart in development |

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in your real values (MongoDB, Google, Stripe, BetterAuth)

# 3. Start development server
npm run dev
```

Server runs on `http://localhost:5001`

---

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5001) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL for CORS |
| `DB_USER` | MongoDB Atlas username |
| `DB_PASS` | MongoDB Atlas password |
| `DB_NAME` | MongoDB database name |
| `ACCESS_TOKEN_SECRET` | JWT signing secret (any long random string) |
| `BETTER_AUTH_SECRET` | BetterAuth session secret |
| `BETTER_AUTH_URL` | This server's URL |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |

---

## 👑 Creating the First Admin

Register normally on the site, then run:

```bash
node scripts/makeFirstAdmin.js your@email.com
```

Use **Admin → Manage Users** to promote further users to admin or vendor.

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


