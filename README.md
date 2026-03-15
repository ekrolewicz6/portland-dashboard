# Portland Commons Civic Dashboard

Real-time data on Portland's recovery — seven questions that drive Portland's story, answered with public data.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS v4 + Recharts
- **Backend**: Next.js API routes (PostgreSQL-ready, mock data for development)
- **ETL Pipeline**: Python workers scheduled via cron (see `etl/`)
- **Database**: PostgreSQL with PostGIS extension
- **Maps**: Mapbox GL JS
- **Hosting**: Vercel (frontend) + Railway/Fly.io (backend/DB/ETL)

## The Seven Questions

1. **Is Portland gaining or losing people?** — Water bureau activations, Census, IRS migration
2. **Is Portland gaining or losing businesses?** — BLT registrations, CivicApps, SOS filings
3. **Is downtown coming back?** — Placer.ai foot traffic, vacancy, CoStar
4. **Is Portland safe?** — PPB crime data, 911 response times, PDX Reporter
5. **Is the tax burden competitive?** — Comparative rate analysis
6. **Is housing getting built?** — PP&D permits, Zillow rents, PHB pipeline
7. **Is the Portland Commons working?** — PCB registry metrics

## ETL Pipeline

```bash
cd etl
pip install -r requirements.txt
cp .env.example .env

# Run all workers once
python scheduler.py --run-now

# Run scheduler (cron-like)
python scheduler.py
```

## Database Setup

```bash
# Create database
createdb portland_dashboard

# Enable PostGIS
psql portland_dashboard -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Run schema
psql portland_dashboard < etl/schema.sql
```

## Deployment

### Vercel (Frontend)

```bash
vercel deploy
```

### Railway (Database + ETL)

See `etl/` for worker configurations. Deploy as a background service.
