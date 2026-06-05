# Build8 Production Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Domain with SSL (e.g., `app.build8.com`)
- S3-compatible storage (for documents)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Production URL (https://app.build8.com) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as AUTH_URL |
| `SMTP_*` | For email | Password reset emails |
| `S3_*` | For files | Document storage |

## Local Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (Docker)
docker run --name build8-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=build8 -p 5432:5432 -d postgres:15

# Configure .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/build8?schema=public"
AUTH_SECRET="dev-secret-change-in-production"
AUTH_URL="http://localhost:3000"

# Generate Prisma client
npx prisma generate

# Sync schema + seed (safe for existing Supabase DB)
npm run db:setup

# Start dev server
npm run dev
```

Login with: `youssef@build8.com` or `saif@build8.com` / `Build8@2026`

## Database Setup

### Migrations

```bash
# Development — sync schema without resetting data
npm run db:setup

# Production — apply migration history
npm run db:deploy
```

If you previously used `prisma db push` and see drift errors, baseline once:

```bash
npm run db:baseline
```

### Seed (first deploy only)

```bash
npx prisma db seed
```

## Deployment Options

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Use Vercel Postgres or external PostgreSQL (Neon, Supabase, Railway)
5. Deploy

```bash
# vercel.json (optional)
{
  "buildCommand": "npx prisma generate && next build",
  "installCommand": "npm install"
}
```

**Note:** Run `npx prisma migrate deploy` as a build step or via Vercel deploy hook.

### Option B: Docker + VPS

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/build8
      - AUTH_SECRET=${AUTH_SECRET}
      - AUTH_URL=https://app.build8.com
    depends_on:
      - db

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=build8
      - POSTGRES_PASSWORD=password

volumes:
  pgdata:
```

Enable standalone output in `next.config.ts`:

```typescript
const nextConfig = {
  output: "standalone",
};
```

### Option C: Railway

1. Create Railway project
2. Add PostgreSQL plugin
3. Deploy from GitHub
4. Set `DATABASE_URL` from Railway Postgres
5. Add build command: `npx prisma generate && npx prisma migrate deploy && npm run build`

## Post-Deploy Checklist

- [ ] Run database migrations
- [ ] Run seed script (first deploy)
- [ ] Change default founder passwords
- [ ] Verify SSL/HTTPS
- [ ] Test login flow
- [ ] Test RBAC permissions per role
- [ ] Configure SMTP for password reset
- [ ] Set up S3 for document storage
- [ ] Configure database backups
- [ ] Set up monitoring (Sentry, uptime)
- [ ] Review CORS and security headers

## Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260605.sql
```

Automate with cron or managed database backup (Neon, Supabase, RDS).

## Security Hardening

1. **Change default passwords** immediately after seed
2. **Rotate AUTH_SECRET** periodically
3. **Enable database SSL** in production `DATABASE_URL`
4. **Restrict database access** to app server IP only
5. **Set security headers** in `next.config.ts`:

```typescript
headers: async () => [
  {
    source: "/(.*)",
    headers: [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ],
  },
],
```

## Monitoring

- **Errors:** Sentry (`@sentry/nextjs`)
- **Uptime:** Better Uptime, Pingdom
- **Database:** Prisma query logging in dev only
- **Logs:** Vercel logs or Docker log driver

## Scaling Notes

Build8 is a single-tenant internal tool. Expected load is low (5–20 concurrent users). A single Vercel deployment with managed PostgreSQL is sufficient for years of growth. Scale considerations:

- Connection pooling: Prisma Accelerate or PgBouncer if needed
- File storage: S3/R2 for documents (not database)
- Caching: Redis only if dashboard queries become slow
