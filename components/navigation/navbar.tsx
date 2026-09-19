import Link from "next/link";
import { SearchInput } from "@/components/search/search-input";

export function Navbar() {
  return (
    <header className="border-b border-hairline">
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-[880px] items-center gap-6 px-4 font-mono md:px-6">
        <Link href="/" className="font-mono text-base font-bold text-foreground">
          ~/skills
        </Link>
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/skills" className="font-mono text-base font-medium text-muted underline transition-colors duration-150 ease-terminal hover:text-foreground">Skills</Link>
          <Link href="/technologies" className="font-mono text-base font-medium text-muted underline transition-colors duration-150 ease-terminal hover:text-foreground">Technologies</Link>
          <Link href="/categories" className="font-mono text-base font-medium text-muted underline transition-colors duration-150 ease-terminal hover:text-foreground">Categories</Link>
          <Link href="/agents" className="font-mono text-base font-medium text-muted underline transition-colors duration-150 ease-terminal hover:text-foreground">Agents</Link>
        </div>
        <div className="ml-auto flex flex-1 max-w-xs items-center">
          <SearchInput />
        </div>
        <Link href="/submit" className="font-mono text-base font-medium text-foreground underline underline-offset-4 transition-opacity duration-150 ease-terminal hover:opacity-80">
          Submit
        </Link>
      </nav>
    </header>
  );
}
