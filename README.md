# Holidaze

A modern accommodation booking application built with React, TypeScript, and Tailwind CSS. Holidaze connects guests with unique venues worldwide and gives venue managers a full self-service dashboard to list and manage their properties.

## Project links

|                       |                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub Repository** | [github.com/Hammadniazi/holidaze-booking-app](https://github.com/Hammadniazi/holidaze-booking-app)                                     |
| **Live demo**         | [holidazebooking.vercel.app](https://holidazebooking.vercel.app/)                                                                      |
| **Figma Design**      | _(link coming soon)_                                                                                                                   |
| **Figma Style Guide** | _(link coming soon)_                                                                                                                   |
| **Kanban Board**      | [github.com/users/Hammadniazi/projects/10](https://github.com/users/Hammadniazi/projects/10)                                           |
| **Gantt Chart**       | [View timeline](https://github.com/users/Hammadniazi/projects/10/views/4?sortedBy%5Bdirection%5D=asc&sortedBy%5BcolumnId%5D=284477411) |
| **Project Report**    | _(link coming soon)_                                                                                                                   |

---

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Available scripts](#available-scripts)
- [Project structure](#project-structure)
- [Features](#features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [License](#license)
- [Author](#author)

---

## Overview

Holidaze supports two user roles — **guest** and **venue manager** — controlled by a single `venueManager: boolean` flag on the Noroff user object. The same account can book venues as a traveller and list properties as a host.

The UI adapts per role:

- **Guests** land on their profile and see a "My Trips" section with all upcoming bookings, each editable or cancellable inline.
- **Venue managers** get a tabbed profile (My Venues / My Trips) plus a dedicated `/dashboard` with stats, CRUD controls for their listings, and per-venue booking drill-downs.

---

## Tech stack

| Layer       | Technology                                | Notes                                                 |
| ----------- | ----------------------------------------- | ----------------------------------------------------- |
| Framework   | React 19 + TypeScript + Vite              | React Compiler enabled via Babel preset               |
| Styling     | Tailwind CSS v4 + shadcn/ui primitives    | CSS variables, dark mode via `class` strategy         |
| Routing     | TanStack Router v1                        | File-based route tree, typed search params            |
| State       | Zustand v5                                | Persisted: auth, theme, favourites                    |
| Forms       | React Hook Form v7 + Zod v4               | End-to-end typed schemas for all forms                |
| API         | Noroff Holidaze API v2                    | REST; JWT bearer + `X-Noroff-API-Key` headers         |
| Date picker | react-day-picker v9 + date-fns v4         | Range selection; blocked dates from existing bookings |
| Toasts      | Sonner                                    | `richColors` variant                                  |
| Testing     | Vitest v3 (unit) + Playwright v1.60 (e2e) | 144 unit tests · 6 e2e spec files                     |
| Deployment  | Vercel                                    | SPA rewrites + CSP headers in `vercel.json`           |

---

## Getting started

### Prerequisites

- **Node.js 20+** and **npm 10+**
- A **Noroff API key** — generate one at [`/auth/create-api-key`](https://v2.api.noroff.dev/auth/create-api-key) after registering a `@stud.noroff.no` account

### 1. Clone the repository

```bash
git clone https://github.com/Hammadniazi/holidaze-booking-app.git
cd holidaze-booking-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your API key:

```env
VITE_API_KEY=your_api_key_here
```

### 4. Start the development server

```bash
npm run dev
```

The app is now running at [http://localhost:5173](http://localhost:5173).

---

## Available scripts

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Start Vite dev server with HMR                    |
| `npm run build`          | Type-check (`tsc -b`) then bundle for production  |
| `npm run preview`        | Serve the production build locally                |
| `npm run lint`           | Run ESLint across the whole project               |
| `npm test`               | Run unit tests in watch mode                      |
| `npm run test:run`       | Run unit tests once (CI-friendly)                 |
| `npm run test:coverage`  | Unit tests with V8 coverage report                |
| `npm run test:e2e`       | Run all Playwright e2e tests                      |
| `npm run test:e2e:ui`    | Playwright interactive UI mode                    |
| `npm run test:e2e:fresh` | Full build → then run e2e (closest to production) |

---

## Project structure

```
src/
├── api/
│   └── client.ts          # Central fetch wrapper, ApiError class, all API modules
│                          # (authApi, venuesApi, bookingsApi, profilesApi)
├── components/
│   ├── bookings/          # BookingCalendar, BookingForm (date range + guests)
│   ├── dashboard/         # VenueManagement, VenueForm (CRUD)
│   ├── ui/                # Primitive components: Button, Card, Dialog, Input,
│   │                      # Select, Textarea, Badge, Alert, Skeleton
│   └── venues/            # VenueCard, VenueSearch (search + sort controls)
├── hooks/
│   ├── useAuth.ts         # login, register, logout; wraps authStore
│   ├── useBookings.ts     # createBooking, deleteBooking, editBooking
│   └── useVenues.ts       # useVenues (paginated list), useVenue (single, silent refetch)
├── layouts/
│   ├── Navbar.tsx         # Sticky; role-aware links; avatar dropdown; mobile slide-down
│   ├── Footer.tsx         # Role-aware Account links; social icons; back-to-top
│   └── RootLayout.tsx     # Skip link, Toaster, flex min-h-screen wrapper
├── pages/
│   ├── VenueListPage.tsx  # Browse + search + sort + pagination
│   ├── VenueDetailPage.tsx # Gallery, amenities, host info, map embed, booking widget
│   ├── ProfilePage.tsx    # Tabbed (manager) or section (customer); edit profile dialog
│   ├── DashboardPage.tsx  # Protected /dashboard; renders VenueManagement
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx   # Radio-card account type selector (Guest / Venue Manager)
│   ├── ContactPage.tsx    # Contact page with info cards and enquiry form
│   └── NotFoundPage.tsx
├── routes/
│   └── index.tsx          # TanStack Router route tree; validateSearch on /profile
├── schemas/
│   └── index.ts           # Zod schemas: login, register, createVenue, booking, contact
├── store/
│   ├── authStore.ts       # Persisted: user + JWT token
│   ├── bookingStore.ts    # In-memory bookings list
│   ├── venueStore.ts      # Venues list, current venue, search/sort/page state
│   ├── themeStore.ts      # Persisted: dark mode flag, synced to <html class="dark">
│   └── favoritesStore.ts  # Persisted: array of favourited venue IDs
├── types/
│   └── index.ts           # TypeScript interfaces: Venue, Booking, Profile, AuthUser…
└── utils/
    └── index.ts           # cn, formatPrice (NOK), formatDate, buildImageUrl,
                           # calculateNights, getPageNumbers, placeholders

tests/
├── unit/                  # Vitest + Testing Library (Navbar, Footer, VenueCard,
│                          # schemas, stores, utils, ContactPage)
└── e2e/                   # Playwright (smoke, auth, venues, profile, dashboard, contact)
```

---

## Features

### Public — no account required

- Browse all venues, paginated (16 per page) with smart ellipsis page numbers
- Search venues by name (live clear button, resets to page 1)
- Sort by newest / price (low–high, high–low) / name (A–Z, Z–A)
- Full venue detail page: image gallery with dot + arrow navigation, amenity badges, host card, availability calendar, Google Maps embed
- Dark mode toggle — persisted across sessions, respects system preference on first visit
- Favourite any venue with the heart button — persisted locally
- Fully responsive — optimised layouts for mobile, tablet, and desktop
- Accessible — skip-navigation link, ARIA roles and labels, keyboard-navigable menus and dialogs

### Guest account

- Register with a `@stud.noroff.no` email; choose Customer or Venue Manager at sign-up
- Session persists across page reloads via Zustand + `localStorage`
- Book a venue: date-range picker (blocked dates shown), guest count, price breakdown, confirmation
- Profile page — "My Trips" section: view all bookings with venue image, dates, guest count, price; edit dates/guests inline; cancel with confirmation dialog
- Update profile avatar URL, banner URL, and bio

### Venue Manager account

- Tabbed profile: **My Venues** tab and **My Trips** tab (badge shows pending booking count)
- Dedicated dashboard at `/dashboard` — stats grid (venues listed, total bookings, avg. price/night)
- Create / edit / delete venues with full form: name, description, price, max guests, amenity checkboxes, up to 5 media URLs, location fields
- Expand any venue card to see its upcoming guest bookings (customer name, dates, guest count)
- Click any venue thumbnail or title to preview the listing exactly as a guest sees it
- "My Venues" link in navbar (desktop + mobile) and footer for one-tap access

---

## Testing

```bash
# Unit tests (144 tests across 7 files)
npm run test:run

# Unit tests with coverage
npm run test:coverage

# End-to-end tests (requires a running dev or preview server)
npm run test:e2e

# Full production build → e2e (closest to real-world conditions)
npm run test:e2e:fresh
```

**Unit test coverage:** Navbar, Footer, VenueCard, Zod schemas, Zustand stores, utility functions, ContactPage — 144 tests, 7 files.

**E2e spec files:** `smoke.spec.ts`, `auth.spec.ts`, `venues.spec.ts`, `profile.spec.ts`, `dashboard.spec.ts`, `contact.spec.ts` — all passing.

---

## Deployment

The project is pre-configured for **Vercel**.

1. Import the repository in the [Vercel dashboard](https://vercel.com/new)
2. Add `VITE_API_KEY` as a project environment variable
3. Deploy — `vercel.json` handles everything else

`vercel.json` configures:

| Setting                   | Value                                                       |
| ------------------------- | ----------------------------------------------------------- |
| SPA rewrite               | All paths → `index.html`                                    |
| `Content-Security-Policy` | Allowlists Noroff API, Unsplash images, Google Maps iframes |
| `X-Frame-Options`         | `SAMEORIGIN`                                                |
| `X-Content-Type-Options`  | `nosniff`                                                   |
| `Referrer-Policy`         | `strict-origin-when-cross-origin`                           |
| `Permissions-Policy`      | Blocks camera, microphone, geolocation                      |

---

## Environment variables

| Variable       | Required | Description                                                          |
| -------------- | -------- | -------------------------------------------------------------------- |
| `VITE_API_KEY` | ✅       | Noroff API key — the `VITE_` prefix exposes it to the browser bundle |

---

## API reference

This application integrates with the **Noroff Holidaze API v2**.

- Documentation: [docs.noroff.dev/docs/v2/holidaze/venues](https://docs.noroff.dev/docs/v2/holidaze/venues)
- Base URL: `https://v2.api.noroff.dev`
- Auth: `Authorization: Bearer <token>` + `X-Noroff-API-Key: <key>` on all protected endpoints

---

## License

This project is created as part of a school assignment at Noroff School of Technology and Digital Media.

---

## Author

**Hammad Khan** · [@Hammadniazi](https://github.com/Hammadniazi)

---

**Happy Tour!** 🌍
