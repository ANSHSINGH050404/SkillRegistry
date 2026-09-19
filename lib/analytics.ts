// Typed PostHog wrappers (Phase 5 wires the client). No PII, no raw scores.
export function trackSkillViewed(_p: { skillId: string; slug: string }) {}
export function trackInstallClicked(_p: { skillId: string; slug: string; source: string }) {}
export function trackSourceClicked(_p: { skillId: string; slug: string }) {}
export function trackInstallCopied(_p: { skillId: string; slug: string }) {}
export function trackSearch(_p: { query: string; resultCount: number }) {}
export function trackTechnologyViewed(_p: { slug: string }) {}
export function trackCategoryViewed(_p: { slug: string }) {}
export function trackSkillSubmitted(_p: { name: string }) {}
