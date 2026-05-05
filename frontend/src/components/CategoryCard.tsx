import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/lib/api-client";
import { Smartphone, Laptop, Cpu, MonitorPlay, ChevronRight } from "lucide-react";

// Map slugs to icons
const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone className="h-8 w-8 mb-4 text-blue-500" />,
  laptop: <Laptop className="h-8 w-8 mb-4 text-emerald-500" />,
  vga: <Cpu className="h-8 w-8 mb-4 text-purple-500" />,
  monitor: <MonitorPlay className="h-8 w-8 mb-4 text-orange-500" />
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full group bg-white dark:bg-zinc-950">
        <CardContent className="p-6 flex flex-col items-center text-center h-full relative">
          {iconMap[category.slug] || <Smartphone className="h-8 w-8 mb-4 text-zinc-400" />}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
            {category.name}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2">
            {category.description || `Compare the best ${category.name.toLowerCase()} in the market.`}
          </p>
          <div className="mt-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-medium">
            Explore <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
