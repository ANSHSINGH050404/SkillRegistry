import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 font-mono">
      <h1 className="font-mono text-[38px] font-bold leading-[1.5] text-foreground">$ 404 --not-found</h1>
      <p className="font-mono text-base font-medium text-muted">
        Try another search term, or browse <Link className="text-accent underline" href="/technologies">technologies</Link> and <Link className="text-accent underline" href="/categories">categories</Link>.
      </p>
    </div>
  );
}
