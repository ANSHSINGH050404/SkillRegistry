// Typed PostHog wrappers. No PII, no raw scores.
import posthog from "posthog-js";

function capture(event: string, props: Record<string, unknown>) {
  try {
    if (typeof window === "undefined") return;
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key || key.includes("placeholder")) return;
    posthog.capture(event, props);
  } catch {
    // analytics must never break the app
  }
}

export function trackSkillViewed(p: { skillId: string; slug: string }) {
  capture("skill_viewed", p);
}
export function trackInstallClicked(p: { skillId: string; slug: string; source: string }) {
  capture("skill_install_clicked", p);
}
export function trackSourceClicked(p: { skillId: string; slug: string }) {
  capture("skill_source_clicked", p);
}
export function trackInstallCopied(p: { skillId: string; slug: string }) {
  capture("skill_install_command_copied", p);
}
export function trackSearch(p: { query: string; resultCount: number }) {
  capture("search_performed", p);
}
export function trackTechnologyViewed(p: { slug: string }) {
  capture("technology_viewed", p);
}
export function trackCategoryViewed(p: { slug: string }) {
  capture("category_viewed", p);
}
export function trackSkillSubmitted(p: { name: string }) {
  capture("skill_submitted", p);
}
