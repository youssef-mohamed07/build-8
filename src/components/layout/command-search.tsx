"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/server/actions/search.actions";

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ type: string; label: string; href: string }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open || query.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearch(query);
        setResults(data);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden items-center gap-2 rounded-lg border border-transparent bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground md:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-8 rounded border bg-background px-1.5 text-[10px]">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]">
      <div className="w-full max-w-lg rounded-xl border bg-background shadow-xl">
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search clients, leads, projects..."
            className="border-0 shadow-none focus-visible:ring-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {isPending && <p className="px-3 py-2 text-sm text-muted-foreground">Searching...</p>}
          {!isPending && results.length === 0 && query.length >= 2 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">No results</p>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.href}-${i}`}
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                router.push(r.href);
                setOpen(false);
                setQuery("");
              }}
            >
              <span className="text-xs text-muted-foreground w-16">{r.type}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="fixed inset-0 -z-10" onClick={() => setOpen(false)} aria-label="Close" />
    </div>
  );
}
