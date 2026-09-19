import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Not found</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Try another search term, or browse <Link className="underline" href="/technologies">technologies</Link> and <Link className="underline" href="/categories">categories</Link>.
      </p>
    </div>
  );
}
