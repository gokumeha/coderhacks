# FishFlow AI

FishFlow AI is a smart harbor demo platform for fishermen, vendors, buyers, and harbor admins. It combines on-device fish scanning, AI-assisted selling recommendations, live market pricing, multilingual support, SMS alerts, auctions, and harbor congestion tracking in a single React app.

This repository is built as a hackathon-style prototype focused on the Mangalore fishing ecosystem, with a polished frontend and a lightweight Node/Socket.IO backend for real-time demo flows.

## What It Does

- `AI fish scanner` detects likely fish species, freshness, grade, and estimated weight from camera or uploaded image input.
- `Selling recommendations` suggest the best harbor based on demand, congestion, and price context.
- `Live market pricing` shows consensus fish prices with simple trend and volatility indicators.
- `Vendor hub` lets vendors submit prices and runs basic fraud/deviation checks.
- `Premium auctions` let buyers bid on AI-certified lots.
- `Harbor map` visualizes congestion and recommended harbors on Leaflet maps.
- `Multilingual UX` supports 10 Indian languages for UI, voice, and SMS templates.
- `Chat assistant` answers common questions about prices, harbors, and selling decisions.
- `Admin dashboard` shows user status, harbor health, and fraud alerts.

## Demo Roles

The login page includes one-click demo access for:

- `Fisherman`
- `Vendor`
- `Buyer`
- `Admin`

These are the fastest way to explore the app locally.

## Screens Included

- `/` Landing page
- `/login` Email, phone OTP, Google auth, and quick demo login
- `/scanner` AI fish scanner demo
- `/dashboard` Fisherman recommendation dashboard
- `/market` Live market pricing
- `/vendor` Vendor trust and price submission hub
- `/auction` Premium fish auction flow
- `/map` Harbor congestion map
- `/admin` Harbor authority dashboard

## Tech Stack

- `Frontend:` React 19, TypeScript, Vite
- `Styling:` Tailwind CSS, custom glassmorphism UI, Framer Motion
- `State:` Zustand
- `Routing:` React Router
- `Charts:` Recharts
- `Maps:` Leaflet + React Leaflet
- `AI/ML:` TensorFlow.js, MobileNet, COCO-SSD
- `Backend:` Express, Socket.IO
- `Auth:` Firebase Auth

## Getting Started

### Prerequisites

- `Node.js 18+`
- `npm`

### Install

```bash
npm install
```

### Run the Full Demo

```bash
npm run dev:all
```

This starts:

- frontend on `http://localhost:5173`
- backend on `http://localhost:4000`

### Run Frontend Only

```bash
npm run dev
```

### Run Backend Only

```bash
npm run dev:server
```

## Available Scripts

- `npm run dev` starts the Vite frontend
- `npm run dev:server` starts the Express/Socket.IO backend
- `npm run dev:all` starts both together
- `npm run build` builds the production frontend bundle
- `npm run lint` runs ESLint
- `npm run preview` previews the Vite build

## Typical Demo Flow

1. Start the app with `npm run dev:all`.
2. Open `http://localhost:5173`.
3. Use a quick demo login from `/login`.
4. Try `/scanner` to simulate fish recognition and selling recommendations.
5. Open `/dashboard` to see AI recommendations and SMS-triggered actions.
6. Visit `/market`, `/vendor`, `/auction`, and `/map` to explore the broader platform.

## Backend API

The local backend in [server/index.cjs](/c:/techverse/fishflow-ai/server/index.cjs) provides demo endpoints such as:

- `GET /api/health`
- `GET /api/prices`
- `GET /api/prices/:species`
- `POST /api/prices/submit`
- `GET /api/harbors`
- `POST /api/ai/recommend`
- `POST /api/sms/send`
- `GET /api/proxy`

Socket events are also used for:

- live price updates
- auction bid updates
- recommendation broadcasts

## Project Structure

```text
fishflow-ai/
|- src/
|  |- components/        UI, charts, chatbot, navbar
|  |- pages/             App screens and role-based flows
|  |- services/          AI, speech, SMS, Firebase services
|  |- store/             Zustand state stores
|  |- data/              Mock prices, harbors, vendors, templates
|  `- types/             Shared TypeScript models
|- server/               Express + Socket.IO demo backend
|- public/               Static icons/assets
`- README.md
```

## Notes

- This project currently mixes `real integrations` and `demo/mock behavior`.
- Firebase auth is wired in, but the app includes fallback demo login flows when auth setup is unavailable.
- SMS sending defaults to mock/demo mode in the backend.
- Market data, recommendations, auctions, and some user/admin flows are seeded from in-repo mock data.
- Firebase configuration is currently hardcoded in [src/services/firebase/config.ts](/c:/techverse/fishflow-ai/src/services/firebase/config.ts). For production use, move these values into environment variables.

## Production Hardening Ideas

- Move Firebase and SMS credentials to `.env` files
- Replace mock pricing and harbor data with a database
- Persist auction, pricing, and user activity on the backend
- Add real role storage and Firestore user profiles
- Add tests for AI mapping, fraud validation, and route protection
- Clean up encoding issues in some source files

## Why This Project Exists

FishFlow AI is designed as a practical, accessible digital assistant for coastal fish markets: helping fishermen decide where to sell, helping vendors report fair prices, and helping harbor operators manage flow with better visibility.
