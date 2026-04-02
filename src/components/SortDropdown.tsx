"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
  { value: "name_desc", label: "Name: Z to A" },
];

export function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative group/sort z-40">
      <button className="flex items-center justify-between w-full sm:w-auto min-w-[200px] gap-3 px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-zinc-400 font-normal">Sort:</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {SORT_OPTIONS.find(o => o.value === currentSort)?.label || "Newest Arrivals"}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-zinc-400 group-hover/sort:text-zinc-900 dark:group-hover/sort:text-white transition-transform group-hover/sort:rotate-180" />
      </button>

      {/* Dropdown Menu - appears on hover via group */}
      <div className="absolute right-0 sm:left-auto mt-2 w-full sm:w-56 opacity-0 invisible group-hover/sort:opacity-100 group-hover/sort:visible transition-all duration-200 transform origin-top border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] bg-white dark:bg-zinc-950 overflow-hidden">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSort(option.value)}
            className={`w-full text-left px-5 py-3.5 text-sm font-semibold flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors ${
              currentSort === option.value
                ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                : "text-zinc-700 dark:text-zinc-300"
            }`}
          >
            {option.label}
            {currentSort === option.value && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}
