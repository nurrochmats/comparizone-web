"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, Category, Product } from "@/lib/api-client";
import { FilterPanel } from "@/components/FilterPanel";
import { ProductCard } from "@/components/ProductCard";
import { SortDropdown } from "@/components/SortDropdown";
import { CategorySearch } from "@/components/CategorySearch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Scale, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

// Using static mock filters for the demo based on the seeder
// In a full production app, these would come from an `api.attributes.list(category)` endpoint
const categoryFilters: Record<string, any[]> = {
  smartphone: [
    { code: 'display_type', name: 'Display Type', type: 'option', options: ['IPS', 'OLED', 'AMOLED'] },
    { code: 'nfc', name: 'NFC Support', type: 'boolean' },
    { code: 'battery_capacity', name: 'Battery', type: 'number', min: 3000, max: 6000, unit: 'mAh' },
    { code: 'ram', name: 'RAM', type: 'number', min: 4, max: 16, unit: 'GB' },
    { code: 'storage', name: 'Storage', type: 'number', min: 64, max: 1024, unit: 'GB' },
  ],
  laptop: [
    { code: 'ram', name: 'RAM', type: 'number', min: 8, max: 64, unit: 'GB' },
    { code: 'storage', name: 'Storage', type: 'number', min: 256, max: 4096, unit: 'GB' },
  ],
  vga: [
    { code: 'vram', name: 'VRAM', type: 'number', min: 4, max: 24, unit: 'GB' },
    { code: 'memory_type', name: 'Memory Type', type: 'option', options: ['GDDR6', 'GDDR6X'] },
  ]
};

function FilterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('smartphone');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  
  const currentSort = searchParams.get('sort') || 'newest';
  const currentSearch = searchParams.get('search') || '';
  
  // Compare state
  const [compareIds, setCompareIds] = useState<number[]>([]);

  useEffect(() => {
    // Load categories on mount
    api.categories.list().then(data => {
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].slug);
      }
    }).catch(console.error);

    // Read compare state from URL
    const compareQuery = searchParams.get('compare');
    if (compareQuery) {
      setCompareIds(compareQuery.split(',').map(Number).filter(Boolean));
    }
  }, [searchParams]);

  const fetchProducts = async (cat: string, filters: any[], sort: string, search: string) => {
    setIsLoadingProducts(true);
    try {
      const results = await api.filter.apply(cat, filters, search, sort);
      setProducts(results);
    } catch (error) {
      console.error("Filter failed:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Initial load or category change
  useEffect(() => {
    if (selectedCategory) {
      setActiveFilters([]);
      fetchProducts(selectedCategory, [], currentSort, currentSearch);
    }
  }, [selectedCategory]);

  // Sort or search change without modifying filters
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory, activeFilters, currentSort, currentSearch);
    }
  }, [currentSort, currentSearch]);

  const handleFilterApply = (filters: any[]) => {
    setActiveFilters(filters);
    fetchProducts(selectedCategory, filters, currentSort, currentSearch);
  };

  const toggleCompare = (product: Product) => {
    // To allow comparing different SKUs of the same product, 
    // we now allow duplicate product IDs in the compare list.
    // If the product is already in the list, we add another instance of it 
    // unless the limit (5) is reached.
    
    if (compareIds.length >= 5) {
      alert("You can only compare up to 5 items at once.");
      return;
    }

    const newIds = [...compareIds, product.id];
    setCompareIds(newIds);
    
    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('compare', newIds.join(','));
    window.history.replaceState({}, '', url.toString());
  };

  const filtersToDisplay = categoryFilters[selectedCategory] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Compare Floating Bar */}
      {compareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 animate-in slide-in-from-bottom-5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter italic">
              <Scale className="h-5 w-5 text-blue-600" />
              {compareIds.length} <span className="text-blue-600">Items</span> Ready
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
              Compare different SKUs side-by-side
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-xs"
              onClick={() => {
                setCompareIds([]);
                const url = new URL(window.location.href);
                url.searchParams.delete('compare');
                window.history.replaceState({}, '', url.toString());
              }}
            >
              Reset
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-10 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              disabled={compareIds.length < 2}
              onClick={() => router.push(`/compare?products=${compareIds.join(',')}`)}
            >
              Compare Now
              <ArrowRight className="h-3 w-3 ml-2 stroke-[3]" />
            </Button>
          </div>
        </div>
      )}

      <div className="mb-8 border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-4">Filter Finder</h1>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <p className="text-zinc-500 max-w-xl">
            Select your precise requirements and we'll find the products that match your needs perfectly.
          </p>
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 pl-2">Category:</span>
            <Select value={selectedCategory} onValueChange={(val) => { if (val) setSelectedCategory(val); }}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-950">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-24">
        {/* Left Sidebar - Filters */}
        <div className="lg:col-span-1">
          {filtersToDisplay.length > 0 ? (
            <FilterPanel 
              availableFilters={filtersToDisplay} 
              onFilterApply={handleFilterApply}
              isLoading={isLoadingProducts}
            />
          ) : (
            <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg text-center text-zinc-500 border border-dashed">
              No specific filters configured for this category yet.
            </div>
          )}
        </div>

        {/* Right Content - Results Grid */}
        <div className="lg:col-span-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl font-semibold whitespace-nowrap">
              {isLoadingProducts ? 'Searching...' : `${products.length} Results found`}
            </h2>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 sm:ml-auto">
              <div className="w-full sm:w-64 flex-shrink-0">
                <CategorySearch />
              </div>
              <div className="w-full sm:w-auto">
                <SortDropdown />
              </div>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="flex justify-center items-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onCompare={toggleCompare}
                  isComparing={compareIds.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No matching products</h3>
              <p className="text-zinc-500">Try adjusting your filters or selecting a different category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FilterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <FilterPageContent />
    </Suspense>
  );
}
