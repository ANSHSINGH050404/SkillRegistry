import Link from "next/link";
import { SearchInput } from "@/components/search/search-input";

export function Navbar() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Agent Skills
        </Link>
        <div className="hidden items-center gap-4 text-sm text-zinc-600 md:flex dark:text-zinc-400">
          <Link href="/skills" className="hover:text-zinc-950 dark:hover:text-zinc-50">Skills</Link>
          <Link href="/technologies" className="hover:text-zinc-950 dark:hover:text-zinc-50">Technologies</Link>
          <Link href="/categories" className="hover:text-zinc-950 dark:hover:text-zinc-50">Categories</Link>
          <Link href="/agents" className="hover:text-zinc-950 dark:hover:text-zinc-50">Agents</Link>
        </div>
        <div className="ml-auto flex flex-1 max-w-xs items-center">
          <SearchInput />
        </div>
        <Link href="/submit" className="text-sm font-medium underline-offset-4 hover:underline">
          Submit Skill
        </Link>
      </nav>
    </header>
  );
}
