import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline font-mono">
      <div className="mx-auto grid max-w-[880px] gap-8 px-4 py-12 text-base md:grid-cols-3 md:px-6">
        <div>
          <p className="font-bold text-foreground">~/skills</p>
          <p className="mt-2 font-medium text-muted">
            $ discover skills for your AI coding agent
          </p>
        </div>
        <nav aria-label="Explore">
          <p className="font-bold text-foreground">explore/</p>
          <ul className="mt-2 space-y-1 font-medium text-muted">
            <li><Link className="underline transition-colors duration-150 ease-terminal hover:text-foreground" href="/skills">Skills</Link></li>
            <li><Link className="underline transition-colors duration-150 ease-terminal hover:text-foreground" href="/technologies">Technologies</Link></li>
            <li><Link className="underline transition-colors duration-150 ease-terminal hover:text-foreground" href="/categories">Categories</Link></li>
            <li><Link className="underline transition-colors duration-150 ease-terminal hover:text-foreground" href="/agents">Agents</Link></li>
          </ul>
        </nav>
        <nav aria-label="Community">
          <p className="font-bold text-foreground">community/</p>
          <ul className="mt-2 space-y-1 font-medium text-muted">
            <li><Link className="underline transition-colors duration-150 ease-terminal hover:text-foreground" href="/submit">Submit Skill</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
