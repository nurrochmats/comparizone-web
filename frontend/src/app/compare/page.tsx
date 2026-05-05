"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, ProductDetail } from "@/lib/api-client";
import { CompareTable } from "@/components/CompareTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";

function ComparePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productIdsQuery = searchParams.get('products');
  const ids = productIdsQuery ? productIdsQuery.split(',').map(Number).filter(Boolean) : [];

  useEffect(() => {
    async function loadProducts() {
      if (ids.length === 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const data = await api.compare.products(ids);
        setProducts(data);
        setError(null);
      } catch (err: any) {
        if (err.message?.includes('Validation')) {
           setError("Compare needs between 2 and 5 products of the same type.");
        } else {
           setError(err.message || "Failed to load products for comparison");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [productIdsQuery]);

  const removeProduct = (idToRemove: number) => {
    const newIds = ids.filter(id => id !== idToRemove);
    if (newIds.length) {
      router.push(`/compare?products=${newIds.join(',')}`);
    } else {
      router.push('/compare');
    }
  };

  const clearAll = () => {
    router.push('/compare');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Compare Products</h1>
          <p className="text-zinc-500 mt-1">Side-by-side technical specifications</p>
        </div>
        
        <div className="flex items-center gap-3">
            {ids.length > 0 && (
                <Button variant="ghost" onClick={clearAll} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Clear All
                </Button>
            )}
            <Button onClick={() => router.push('/filter')} variant={ids.length === 0 ? "default" : "outline"}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-200 font-medium">
          {error}
        </div>
      )}

      {ids.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-zinc-950 border border-dashed rounded-xl">
          <h3 className="text-xl font-semibold mb-2">No products selected</h3>
          <p className="text-zinc-500 mb-6 font-medium">Select up to 5 products to compare their specs side-by-side.</p>
          <Button onClick={() => router.push('/filter')} size="lg">
            Find Products to Compare
          </Button>
        </div>
      ) : ids.length === 1 ? (
        <div className="text-center py-16 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl">
          <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-2">One more needed!</h3>
          <p className="text-blue-600 dark:text-blue-400 mb-6">Select at least one more product to begin comparison.</p>
          <Button onClick={() => router.push('/filter')}>
            Add another product
          </Button>
        </div>
      ) : (
        <CompareTable products={products} />
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ComparePageContent />
    </Suspense>
  );
}
