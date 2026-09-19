"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

export function SearchInput({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form
      role="search"
      aria-label="Search skills"
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const q = ref.current?.value.trim() ?? "";
        router.push(q ? `/skills?q=${encodeURIComponent(q)}` : "/skills");
      }}
    >
      <label htmlFor="site-search" className="sr-only">Search skills</label>
      <Input
        ref={ref}
        id="site-search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search skills… (⌘K)"
        autoComplete="off"
      />
    </form>
  );
}
