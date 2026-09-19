import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <p className="font-semibold">Agent Skills Directory</p>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Discover skills for your AI coding agent.
          </p>
        </div>
        <nav aria-label="Explore">
          <p className="font-medium">Explore</p>
          <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
            <li><Link href="/skills">Skills</Link></li>
            <li><Link href="/technologies">Technologies</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/agents">Agents</Link></li>
          </ul>
        </nav>
        <nav aria-label="Community">
          <p className="font-medium">Community</p>
          <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-400">
            <li><Link href="/submit">Submit Skill</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
