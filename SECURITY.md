# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |

Only the latest `main` branch receives security updates. Please upgrade to the latest version.

## Reporting a Vulnerability

**Do not report security vulnerabilities via public GitHub issues.**

Please report suspected security vulnerabilities privately to:

**security@skillregistry.dev**

Or use GitHub's [private vulnerability reporting](https://github.com/<owner>/<repo>/security/advisories/new).

Include as much detail as possible:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and provide a preliminary assessment within 5 business days.

## Scope

This policy covers the SkillRegistry codebase (Next.js app, Prisma schema, API routes, and associated libraries). It does not cover:

- Third-party dependencies (report those upstream)
- Infrastructure (Vercel, Neon, PostHog — report to respective vendors)
- User-submitted skill content (moderated via admin queue)

## Security Measures in Place

- **Admin gating**: `/admin/*` and `/api/admin/*` protected by `ADMIN_SECRET` (header, bearer, query, or cookie)
- **Rate limiting**: Public submissions endpoint throttled to 5 req/10min/IP (in-memory sliding window)
- **Input validation**: Zod schemas on all public API endpoints (`/api/submissions`, `/api/search`)
- **Output sanitization**: Markdown rendered via `react-markdown` + `rehype-sanitize`
- **URL allowlists**: GitHub repo URLs and install commands validated against patterns
- **Secrets**: Never committed (`.env*` gitignored); only `NEXT_PUBLIC_*` vars exposed to browser
- **CSP-ready**: No inline scripts/styles; CSP header can be added via `next.config.ts`

## Dependency Security

- `pnpm audit` run in CI
- `package.json` pins exact versions where practical (no loose `^` on major deps)
- Renovate/Dependabot recommended for automated updates

## Disclosure Timeline

- **Day 0**: Private report received
- **Day 1-2**: Acknowledgment + triage
- **Day 5**: Preliminary assessment + fix plan
- **Day 30**: Target for patch release (sooner for critical issues)
- **Day 90**: Public disclosure after fix released (or sooner if exploit in wild)

## Hall of Fame

We gratefully acknowledge security researchers who responsibly disclose vulnerabilities:

<!-- Add names here as reports are received -->