"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Product } from "@/lib/api-client";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await api.products.list({ search: query, per_page: "5" });
        setResults(data || []);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && results.length > 0) {
      setIsOpen(false);
      router.push(`/categories/${results[0].category.slug}?search=${encodeURIComponent(query)}`);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div ref={wrapperRef} className="relative hidden w-[320px] lg:block">
      <form onSubmit={handleSearch} className="relative w-full">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
          )}
        </div>
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          className="w-full pl-10 pr-4 py-2 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 placeholder:font-normal"
          placeholder="Search products... e.g. Samsung"
        />
      </form>

      {/* Dropdown Menu */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-[100] transform origin-top transition-all p-2">
          {isLoading && results.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 flex flex-col items-center">
              <Loader2 className="h-6 w-6 animate-spin mb-2 text-zinc-400" />
              <span className="text-sm font-medium animate-pulse">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-xl transition-all group/item border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                >
                  <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex-shrink-0 flex items-center justify-center p-1 border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden mix-blend-multiply dark:mix-blend-normal">
                    <SearchProductImage product={product} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5 truncate">{product.category?.name || 'Category'}</div>
                    <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">{product.name}</div>
                    <div className="font-bold text-xs text-zinc-900 dark:text-zinc-300 mt-0.5">
                      {product.price_min ? formatPrice(product.price_min) : 'N/A'}
                    </div>
                  </div>
                </Link>
              ))}
              
              <div className="p-1.5 mt-1 border-t border-zinc-100 dark:border-zinc-900">
                <button 
                  className="w-full text-center py-2 rounded-lg text-xs text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:outline-none" 
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/categories/${results[0].category.slug}?search=${encodeURIComponent(query)}`);
                  }}
                >
                  View all results for "{query}"
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center flex flex-col items-center">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">No products found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchProductImage({ product }: { product: Product }) {
  const [primaryImage, setPrimaryImage] = useState<string | null>(product.thumbnail || null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPrimaryImage = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const res = await fetch(`${apiUrl}/products/${product.id}/images`, {
          headers: { Accept: "application/json" }
        });
        
        if (res.ok && isMounted) {
          const data = await res.json();
          const images = data.data || [];
          const pImg = images.find((img: any) => img.is_primary === true);
          if (pImg) {
            setPrimaryImage(pImg.image_url);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product images for search", err);
      }
    };

    fetchPrimaryImage();

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || apiUrl.replace(/\/api$/, '').replace(/\/+$/, '');
    const path = url.startsWith('/') ? url : `/storage/${url}`;
    if (url.includes('/storage/')) return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    return `${baseUrl}${path}`;
  };

  if (primaryImage && !imageError) {
    return (
      <img 
        src={getImageUrl(primaryImage)} 
        alt={product.name} 
        className={`w-full h-full object-contain transition-all duration-300 ${isImageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
        loading="lazy"
        onLoad={() => setIsImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setIsImageLoaded(true);
        }}
      />
    );
  }

  return <div className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest text-center leading-tight">No<br/>Img</div>;
}
