import { api } from "@/lib/api-client";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Search, Scale } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  // Fetch initial data concurrently
  const [categories, latestStats] = await Promise.all([
    api.categories.list().catch(() => []), 
    // We don't have a public latest endpoint yet, but we can reuse the dashboard one if we had a public variant
    // For now we'll fetch products and take the first few as "trending"
    api.products.list().then(res => res.slice(0, 4)).catch(() => [])
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-white dark:bg-zinc-950 border-b py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Compare before you <span className="text-blue-600 dark:text-blue-500">buy.</span>
          </h1>
          <p className="text-xl text-zinc-500 mb-10 max-w-2xl mx-auto">
            Find the perfect tech gear. Compare smartphones, laptops, and components side-by-side with our detailed database.
          </p>
          
          <SearchBar />
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Browse Categories</h2>
            <Button variant="ghost">
              <Link href="/categories">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
            {categories.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No categories found. Is the API running?
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trending / Popular Section */}
      <section className="py-16 px-4 bg-white dark:bg-zinc-950">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold tracking-tight">Popular Products</h2>
            </div>
            <Button variant="ghost">
              <Link href="/filter">Filter Finder</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestStats.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {latestStats.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                No products found. Is the API running?
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
