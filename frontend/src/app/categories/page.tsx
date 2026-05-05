import { api } from "@/lib/api-client";
import { CategoryCard } from "@/components/CategoryCard";

export default async function CategoriesPage() {
  const categories = await api.categories.list().catch(() => []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">All Categories</h1>
        <p className="text-lg text-zinc-500">
          Find exactly what you're looking for. Select a category to start comparing top-rated products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            No categories available. Please check the API connection.
          </div>
        )}
      </div>
    </div>
  );
}
