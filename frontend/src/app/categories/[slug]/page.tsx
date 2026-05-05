import { api, Product } from "@/lib/api-client";
import { ProductCard } from "@/components/ProductCard";
import { CategorySearch } from "@/components/CategorySearch";
import { SortDropdown } from "@/components/SortDropdown";
import { Suspense } from "react";

interface PageProps {
  params: { slug: string };
  searchParams?: { page?: string, search?: string, sort?: string };
}

export default async function CategoryDetailPage({ params, searchParams }: PageProps) {
  // Wait for dynamic route segments to resolve in Next.js 15
  const slug = (await params).slug;
  const sp = await searchParams; // searchParams is a promise in Next.js 15
  const search = sp?.search || '';
  const sort = sp?.sort || '';

  const categories = await api.categories.list().catch(() => []);
  const category = categories.find(c => c.slug === slug);
  
  if (!category) {
    return <div className="p-20 text-center text-xl font-bold">Category not found</div>;
  }

  // Use the filter API to get products for this specific category
  const products = await api.filter.apply(slug, [], search, sort).catch(() => []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 capitalize">
            {category.name} {search && <span className="text-blue-600 font-medium whitespace-nowrap">"{search}"</span>}
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl">
            {category.description || `Browse and compare top ${category.name} models.`}
          </p>
          <p className="mt-2 font-medium text-sm text-zinc-400">{products.length} products available</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-72 lg:w-80 flex-shrink-0">
            <Suspense fallback={<div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>}>
              <CategorySearch />
            </Suspense>
          </div>
          <Suspense fallback={<div className="h-12 w-full sm:w-48 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse"></div>}>
            <SortDropdown />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full py-24 text-center text-zinc-500 border-2 border-dashed rounded-xl">
            No products found in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
