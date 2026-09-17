# 2026 NFL DFS League

A web app for running a season-long DraftKings DFS league: league setup and
payout rules, weekly score entry, vs.-all standings, and a 6-seed playoff
bracket with Home Field Advantage bonuses.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, and Prisma +
Postgres for persistence.

## Features

- **League** (`/`) — buy-in, prize pool, and payout breakdown; regular
  season and playoff rules; the Home Field Advantage table. Mirrors the
  league's rules sheet and updates automatically from **Settings**.
- **Teams** (`/teams`) — add/remove the teams competing this season.
- **Scores** (`/scores`) — enter each team's weekly DraftKings DFS score,
  for regular season weeks and the 3 playoff weeks.
- **Standings** (`/standings`) — per-week vs.-all records (you beat every
  team you outscore that week) and cumulative season standings, ranked by
  win percentage with total points for as the tiebreaker.
- **Playoffs** (`/playoffs`) — seeds 1-6 from final regular-season
  standings, Round 1 (seeds 3-6, seeds 1-2 bye), reseeded Round 2, and the
  Finals — each with HFA bonuses applied automatically.
- **Settings** (`/settings`) — number of teams, buy-in, playoff teams,
  regular season length, and all payout amounts.

## Getting Started

### 1. Database

This app uses Postgres via [Prisma](https://www.prisma.io/). For local
development, point `DATABASE_URL` at any Postgres instance (local, Docker,
or a cloud dev database):

```bash
cp .env.example .env.local
# edit .env.local with your local Postgres connection string
```

Then apply the schema:

```bash
npx prisma migrate dev
```

### 2. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The league settings
seed with defaults matching a 12-team, $50 buy-in league (edit them anytime
on the **Settings** page).

## Deploying (Vercel + Postgres)

1. Create a Postgres database from the Vercel dashboard (Storage →
   Postgres) and connect it to this project — this sets `DATABASE_URL`
   (and related env vars) automatically.
2. Set the project's build command to run migrations before building:
   ```
   npx prisma migrate deploy && next build
   ```
3. Deploy. `npm install` will run `prisma generate` automatically via the
   `postinstall` script.

## Project structure

- `prisma/schema.prisma` — `League` (single settings row), `Team`,
  `WeeklyScore` models.
- `src/lib/standings.ts` — pure functions for vs.-all weekly records,
  season standings, and the playoff bracket (seeding, HFA, advancement).
  No I/O — easy to unit test.
- `src/lib/queries.ts` — Prisma reads used by Server Components.
- `src/lib/actions.ts` — Server Actions for mutations (add/remove team,
  save weekly scores, update league settings).
- `src/app/*` — one route per page listed above.
