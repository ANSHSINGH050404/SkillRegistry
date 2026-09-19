# Contributing to SkillRegistry

Thank you for your interest in contributing! This document outlines the process for contributing to the Agent Skills Directory.

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Issues

- Search existing issues first to avoid duplicates
- Use the issue templates when available
- Provide clear reproduction steps, expected vs actual behavior
- Include environment details (OS, Node version, pnpm version)

### Submitting Pull Requests

1. **Fork** the repository and create a feature branch from `main`
2. **Follow conventions**:
   - Conventional Commits for commit messages (`feat:`, `fix:`, `chore:`, etc.)
   - TypeScript strict mode — no `any` without justification
   - Run `pnpm lint`, `pnpm typecheck`, `pnpm test` before pushing
3. **Write tests** for new functionality (unit tests in `lib/`, E2E in `e2e/`)
4. **Keep PRs focused** — one logical change per PR
5. **Update docs** if you change user-facing behavior

### Development Setup

```bash
cp .env.example .env    # Fill in Neon, PostHog, GitHub, ADMIN_SECRET
pnpm install
pnpm db:generate
pnpm db:migrate         # Requires real DIRECT_URL (Neon)
pnpm db:seed            # Taxonomy only
pnpm dev                # http://localhost:3000
```

### Code Style

- **TypeScript strict** — no implicit `any`, strict null checks
- **ESLint + core-web-vitals** — run `pnpm lint`
- **Prettier** via ESLint integration
- **Tailwind v4** + `@theme` tokens in `app/globals.css`
- **Monospace UI** — JetBrains Mono everywhere, terminal aesthetic

### Project Structure

```
app/                    # Next.js App Router pages + API routes
  (marketing)/          # Public pages: /, /skills, /technologies, /categories, /agents, /submit
  api/                  # Server routes: /api/search, /api/submissions, /api/admin/*
  admin/                # Admin moderation UI (ADMIN_SECRET gated)
components/             # UI components (cards, nav, forms, analytics)
lib/                    # Pure logic: search, validation, github, cursor, rate-limit, analytics
prisma/                 # Schema, migrations, seed, import scripts
```

### Testing

```bash
pnpm test               # Vitest unit + integration tests
pnpm test:e2e           # Playwright E2E (requires running dev server)
```

Target areas for unit tests: `lib/` (slug, validation, search, cursor, popularity, rate-limit, github).

### Reporting Security Issues

See [SECURITY.md](SECURITY.md) for responsible disclosure process.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).