# Flex Living Reviews Dashboard

A full-stack review management platform for Flex Living with unified data model, manager dashboard, and public review pages. Integrates Hostaway and Yelp, normalizes data, and provides bulk moderation, analytics, and exports.

## Tech stack

- Frontend: Next.js 15 (App Router) + TypeScript
- Styling: Tailwind CSS + shadcn/ui + Radix UI
- State: Zustand
- Charts: Recharts
- Mapping: Leaflet + react-leaflet (client-only)
- Dates: date-fns
- Backend: Next.js Route Handlers (serverless-friendly)
- DB/ORM: Prisma + SQLite (dev) / PostgreSQL (prod)

## Key design and logic decisions

- Unified Review Model
  - `Property` and `Review` are the core entities. Reviews have `channel` (e.g. `hostaway`, `yelp`), `status` (`pending|approved|rejected`), and optional `categories`.
  - All 3rd-party reviews are normalized into this schema; channel-specific metadata is dropped or mapped.
- Idempotent ingestion
  - External review IDs are prefixed and used as primary keys (e.g. `yelp_<reviewId>`), enabling safe re-runs (upsert).
  - Properties from external systems are deterministically keyed (e.g. `yelp_<businessId>`).
- Moderation-first
  - Reviews default to `pending` unless explicitly approved by ingest or by manager action.
  - Public endpoints return only `approved` content.
- Resilience & fallbacks (Yelp)
  - Primary: Yelp Fusion v3 `/businesses/{id}/reviews`.
  - If unavailable/empty: ask Yelp AI for minimal review summaries for that business and persist them with `channel = 'yelp'`.
  - We removed the `review_highlights` fallback due to authorization restrictions for standard keys.
- Performance & UX
  - Server rendering for public view; React Server Components where practical.
  - Client-only map is dynamically imported with resize invalidation to avoid gray tiles and overflow.

## Database schema (Prisma)

- Dev: SQLite (`DATABASE_URL="file:./prisma/dev.db"`).
- Prod: Switch to `postgresql` provider and set `DATABASE_URL` accordingly.
- Entities:
  - `Property(id, name, location, imageUrl, pricePerNight, maxGuests, createdAt, updatedAt)`
  - `Review(id, propertyId, channel, guestName, rating, reviewText, submittedAt, status, isPublic, createdAt, updatedAt)`
  - `ReviewCategory(id, reviewId, category, rating)`

## API behaviors

- GET `/api/reviews/hostaway`
  - Query: `page`, `pageSize`
  - Returns: `{ success, data: NormalizedReview[] }`
- GET `/api/reviews/public/[property]`
  - Path param: `property` (name or `all`)
  - Query: `page`, `pageSize`
  - Returns: `{ success, data: { property_name, reviews, statistics } }`
- GET `/api/reviews/yelp/search`
  - Query: `query`, `location` (default: `London, UK`), `categories`
  - Returns: `{ success, data: NormalizedReview[] }` (combined business search + reviews fetch)
- POST `/api/yelp/ingest`
  - Body: `{ location: string, maxBusinesses?: number }`
  - Behavior:
    - Uses Yelp AI to return business IDs (min 2 reviews constraint).
    - Upserts properties and attempts `/v3/businesses/{id}/reviews?limit=20&sort_by=yelp_sort`.
    - If no reviews, asks Yelp AI for minimal top reviews and persists them.
  - Returns: `{ success, ingested, totalCandidates, businessIds, reviewUrls, failures }`
- POST `/api/reviews/update-status`
  - Body: `{ id: string, status: 'pending'|'approved'|'rejected' }`
  - Returns: `{ success: true }`
- POST `/api/reviews/bulk-update-status`
  - Body: `{ ids: string[], status: 'pending'|'approved'|'rejected' }`
  - Returns: `{ success: true }`

## Analytics & Insights

The dashboard includes a rich Insights section to make review data actionable:

- Rolling averages: 7-day and 28-day rating averages with trend lines
- Review velocity: daily reviews bar chart to track inflow
- Status over time: stacked area chart (approved/pending/rejected)
- Topic signals: lightweight NLP to surface top negative themes (e.g., cleanliness, Wi‑Fi, noise, check‑in)
- Anomaly banner: highlights a significant drop in the 7-day average vs 28-day and links to pre-filtered view
- Needs Attention: properties flagged for low average rating or high pending backlog, with quick filter chips

Operational notes:
- Global Insight metrics are computed from the full dataset (not impacted by current UI filters)
- Pagination is handled client-side to aggregate all pages from the reviews API for accurate totals

## Yelp integration

- Authentication
  - Set `YELP_API_KEY` in environment.
- Endpoints used
  - Yelp Fusion v3: `/businesses/search`, `/businesses/{id}`, `/businesses/{id}/reviews`.
  - Yelp AI Chat v2: `POST https://api.yelp.com/ai/chat/v2`.
- Business discovery
  - Primary: Ask Yelp AI to return `business_ids` for apartment/real estate renting in a given location; filtered to have at least 2 reviews.
  - Fallback: Fusion search with categories `apartments, realestateagents, propertymgmt`, filtered by `review_count >= 2`.
- Reviews retrieval
  - Primary: `/businesses/{id}/reviews?limit=20&sort_by=yelp_sort`.
  - Fallback: Ask Yelp AI to summarize minimal top reviews; persist with `channel = 'yelp'`.
- Known constraints
  - Some business IDs may 404 on `/reviews`; handled by fallbacks.
  - `/review_highlights` requires elevated access and is not used.

## Setup & usage

### Prerequisites
- Node 18+
- Env vars:
  - `DATABASE_URL` (dev default: `file:./prisma/dev.db`)
  - `YELP_API_KEY` (required for Yelp)

### Install & run
```bash
npm install
npm run dev
```
Visit http://localhost:3000

### Build & lint
```bash
npm run build
npm run lint
```

### Database (Prisma)
```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

### Yelp ingest examples
```bash
curl -X POST http://localhost:3000/api/yelp/ingest \
  -H 'content-type: application/json' \
  -d '{"location":"London, UK","maxBusinesses":5}'
```

## Notes
- Public pages render only `approved` reviews.
- The dashboard supports searching, filtering, bulk status updates, and CSV export.
- The map on properties pages is client-only and sized to its container with resize invalidation to avoid tile gray-outs.
