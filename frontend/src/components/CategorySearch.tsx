"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function CategorySearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="relative flex w-full max-w-md shadow-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-transparent transition-all overflow-hidden"
    >
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-zinc-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search in this category...`}
        className="w-full pl-11 pr-4 py-3 bg-transparent text-sm focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
      />
      <button 
        type="submit" 
        className="px-6 bg-zinc-50 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
