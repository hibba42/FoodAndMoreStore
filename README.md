# Food & More Store

A grocery storefront built as a full-stack portfolio project: browse products,
view details, fill a cookie-based cart, and place a guest order that is saved
to PostgreSQL. Everything runs with one `docker compose up`.

## Status

| Feature | State |
|---|---|
| Product catalog (categories, details pages, images) | Done |
| Cookie-based shopping cart (no account needed) | Done |
| Guest checkout (validated form, transactional order save) | Done |
| Order confirmation page with unguessable link | Done |
| Customer accounts and saved-details prefill | Planned |
| Payments | Planned (checkout currently records the order only) |
| Real product photos | Planned (illustrations are used for now) |

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) and **React**
- **TypeScript**
- **PostgreSQL 17** with **Drizzle ORM** (`pg` driver)
- **Zod** for server-side form validation
- **Docker Compose** (web + database containers)

## Architecture

```
Browser
   |
   |  pages, forms, Server Actions
   v
Next.js app  (Server Components + Server Actions)
   |   src/app/       -> routes and UI
   |   src/lib/       -> cart, checkout, validation logic
   |   src/lib/db/    -> data-access layer (Drizzle queries)
   v
PostgreSQL   (customers, categories, products, orders, order_items)
```

The browser never talks to the database. All queries live in `src/lib/db/`,
and only Server Components and Server Actions import them.

## Key design decisions

- **The cart is a cookie holding only product IDs and quantities.** Prices and
  names are always read from the database, so a visitor can't tamper with them.
  The cookie is `HttpOnly`, validated on every read, and capped in size.
- **Orders are snapshots.** `order_items.unit_price` and the order's shipping
  address and contact details are copied at checkout, so later price or
  address changes never rewrite history.
- **Order saving is one transaction.** The customer, the order, and every order
  line are written together or not at all.
- **Guest checkout never overwrites an existing customer's saved details**,
  since anyone can type any email address into a guest form.
- **Order confirmation pages use a random UUID**, not the sequential order ID,
  so orders can't be found by guessing numbers.
- **Server-side validation of everything**: form fields (Zod), cart contents,
  product availability, and the 21+ check for age-restricted items.

## Getting started

Requirements: Docker with Docker Compose, and Node.js 24 for local development
(matching the Dockerfile).

### Option A: run everything in Docker

```bash
cp .env.example .env        # then edit .env and set a real POSTGRES_PASSWORD
docker compose up -d --build
```

Open <http://localhost:3000>. The database is created and seeded with sample
products automatically the first time it starts.

```bash
docker compose logs -f web   # follow the app logs
docker compose down          # stop (data is kept)
docker compose down -v       # stop AND delete the database volume (re-runs the init SQL)
```

### Option B: local development with hot reload

1. Create the Docker environment file and set a password:
   ```bash
   cp .env.example .env
   ```
2. In `docker-compose.yml`, uncomment the `ports` lines under the `db` service
   so the database is reachable from your machine (localhost only):
   ```yaml
   ports:
     - "127.0.0.1:5432:5432"
   ```
3. Create the local environment file. Use the same credentials as in `.env`:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start only the database, then the dev server:
   ```bash
   docker compose up -d db
   npm install
   npm run dev
   ```

Open <http://localhost:3000>.

### Environment files

Neither real file is committed (see `.gitignore`); only the `*.example` files are.

| File | Used by | Contains |
|---|---|---|
| `.env` | Docker Compose | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |
| `.env.local` | `npm run dev`, `drizzle-kit` | `DATABASE_URL` (pointing at `localhost`) |

Optional: set `COOKIE_SECURE=true` once the site is served over HTTPS.

## Database

The schema lives in `db/init/`. Postgres runs these files **once**, when the
data volume is first created, in filename order:

- `01-schema.sql`: tables, constraints, and indexes
- `02-sample-data.sql`, `03-sample-data-extra.sql`: sample categories and products

To change the schema while there is only sample data, edit `01-schema.sql` and
reset the volume with `docker compose down -v`.

The Drizzle schema in `src/lib/db/schema.ts` is generated from the live
database, not written by hand. After any schema change:

```bash
npx drizzle-kit pull
# then move drizzle/schema.ts and drizzle/relations.ts into src/lib/db/
```

## Project structure

```
db/init/                SQL that creates and seeds the database
public/images/          product images
src/app/                routes: home, products/[id], cart, checkout, orders/[token]
src/lib/                cart, checkout actions, validation, formatting
src/lib/db/             Drizzle schema and queries
Dockerfile              multi-stage build (standalone Next.js output)
docker-compose.yml      web + db services
drizzle.config.ts       used by drizzle-kit
```

## Troubleshooting

- **`drizzle-kit pull`: "Either connection url or host, database are required"**
  `.env.local` is missing or has no `DATABASE_URL`. Create it from
  `.env.local.example`.
- **`drizzle-kit pull` or `npm run dev` can't connect to the database**
  The `db` service's `ports` line is still commented out, or the container
  isn't healthy yet (`docker compose ps`).
- **The init SQL changes don't show up**
  Init scripts only run on a brand-new volume. Run `docker compose down -v`
  and start again (this deletes the database contents).
- **The cart doesn't persist behind HTTPS or over plain HTTP**
  `COOKIE_SECURE=true` requires HTTPS; leave it unset when serving over HTTP.

## Roadmap

1. Customer accounts (Better Auth) with the checkout form prefilled from saved details
2. Payment integration
3. Real product photography
4. Category pages, search, and order history
