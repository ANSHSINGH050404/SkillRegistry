# SkillRegistry — Agent Skills Directory

Searchable registry for skills that extend AI coding agents. Strict MVP per shared understanding Q1–Q23.

## Stack

Next 16.3 + React 19.3, TypeScript strict, Tailwind v4 + shadcn/Radix, Prisma 7 + Neon PG, Zod v4 + RHF, PostHog + Vercel Analytics, ESLint `core-web-vitals`, pnpm, Vitest + Playwright.

## Setup

```bash
cp .env.example .env   # fill Neon/Vercel/PostHog/GitHub/ADMIN_SECRET
pnpm install
pnpm db:generate
pnpm db:migrate        # needs real DIRECT_URL (Neon)
pnpm db:seed           # taxonomy only (tech/agents/categories); skills via prisma/import-mattpocock.ts
pnpm dev
```

## Gates (§56)

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Deploy (Vercel)

1. Create Vercel project from this repo.
2. Set env: `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `NEXT_PUBLIC_POSTHOG_KEY/HOST`, `GITHUB_TOKEN`, `ADMIN_SECRET`, `NEXT_PUBLIC_SITE_URL`.
3. Build runs `prisma generate && next build` automatically.
4. Run `prisma migrate deploy` against `DIRECT_URL`, then seed once.
5. Admin at `/admin?admin=SECRET` (or `x-admin-secret` header / `admin_secret` cookie).

## Conventions

Conventional Commits per phase. Secrets never committed (`.env*` ignored, `/generated` ignored). Analytics split: Vercel = traffic, PostHog = behavior.
