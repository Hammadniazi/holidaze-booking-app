# Holidaze

A modern accommodation booking application built with React, TypeScript, and Tailwind CSS. Holidaze connects guests with unique venues worldwide and gives venue managers a full self-service dashboard to list and manage their properties.

Live demo: [https://holidaze.vercel.app](https://holidaze.vercel.app)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | TanStack Router v1 |
| State | Zustand v5 (persisted) |
| Forms | React Hook Form + Zod |
| API | Noroff Holidaze API v2 |
| Toasts | Sonner |
| Calendar | react-day-picker |
| Testing | Vitest (unit) + Playwright (e2e) |
| Deployment | Vercel |

---

## Getting started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- A Noroff API key (create one at [https://v2.api.noroff.dev/auth/create-api-key](https://v2.api.noroff.dev/auth/create-api-key) after registering)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/holidaze.git
cd holidaze
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Noroff API key:

```
VITE_API_KEY=your_noroff_api_key_here
```

### 4. Start the development server

```bash
npm run dev
```

The app is now running at [http://localhost:5173](http://localhost:5173).

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests in watch mode |
| `npm run test:run` | Run unit tests once |
| `npm run test:coverage` | Run unit tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:e2e:ui` | Run Playwright tests with interactive UI |

---

## Project structure

```
src/
  api/          API client and all endpoint methods
  components/   Reusable UI components (bookings, venues, dashboard, ui)
  hooks/        Custom hooks (useAuth, useVenues, useBookings)
  layouts/      Navbar, Footer, RootLayout
  pages/        One file per route
  routes/       TanStack Router route tree
  schemas/      Zod validation schemas
  store/        Zustand global stores (auth, venue, booking, theme)
  types/        TypeScript interfaces and types
  utils/        Pure helper functions
```

---

## Features

### Public (no account required)
- Browse all venues with pagination
- Search venues by name
- Sort venues by name, price, or newest
- View full venue details: images, amenities, description, map, host info
- Availability calendar showing booked dates

### Customer account
- Register with a `@stud.noroff.no` email address
- Log in and persist session across page reloads
- Book a venue by selecting dates and number of guests
- View, edit, and cancel upcoming bookings from the Profile page
- Update profile avatar and banner

### Venue Manager account
- All public features above
- Create, edit, and delete venues from the Dashboard (`/dashboard`)
- View upcoming bookings made by guests for each owned venue
- Preview any owned venue exactly as guests see it
- Update profile avatar and banner

---

## Authentication

- Tokens are stored in `localStorage` via Zustand persist
- All authenticated API calls include the `Authorization: Bearer <token>` header and the `X-Noroff-API-Key` header
- `/profile` and `/dashboard` redirect to `/login` if the user is not authenticated
- `/dashboard` redirects non-manager accounts to `/profile`

---

## Environment variables

| Variable | Description | Required |
|---|---|---|
| `VITE_API_KEY` | Noroff API key | Yes |

---

## Deployment

The project is configured for Vercel. Push to the `main` branch and import the repository in the Vercel dashboard. Add `VITE_API_KEY` as an environment variable in the Vercel project settings.

A `vercel.json` file is included with:
- SPA rewrite rule (all routes serve `index.html`)
- Content Security Policy headers
- `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` headers

---

## API reference

This app integrates with the [Noroff Holidaze API v2](https://docs.noroff.dev/docs/v2/holidaze/venues).

Base URL: `https://v2.api.noroff.dev`
