"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/api-client";
import { api } from "@/lib/api-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SearchBar() {
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
    if (query.trim()) {
      setIsOpen(true);
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
    <div ref={wrapperRef} className="max-w-2xl mx-auto relative group flex flex-col w-full">
      <form onSubmit={handleSearch} className="relative flex shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full w-full bg-white dark:bg-zinc-950 z-50">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
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
          className="w-full pl-14 pr-4 py-4 rounded-l-full border-2 border-r-0 border-transparent bg-transparent text-lg focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 placeholder:font-normal"
          placeholder="Search for a product... e.g. iPhone 15"
        />
        <Button 
          type="submit" 
          size="lg" 
          className="rounded-l-none rounded-r-full h-auto px-8 text-lg font-bold tracking-wide shadow-none border-2 border-transparent bg-blue-600 hover:bg-blue-700 text-white transition-all focus:ring-0"
        >
          Search
        </Button>
      </form>

      {/* Dropdown Menu */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-40 transform origin-top transition-all p-3">
          {isLoading && results.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-zinc-400" />
              <span className="font-medium animate-pulse">Searching for "{query}"...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-5 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-2xl transition-all group/item border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                >
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-zinc-200/50 dark:border-zinc-800/50 group-hover/item:border-blue-500/30 transition-colors overflow-hidden mix-blend-multiply dark:mix-blend-normal">
                    <SearchProductImage product={product} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">{product.brand || 'Tech Brand'}</div>
                    <div className="font-extrabold text-lg text-zinc-900 dark:text-zinc-100 truncate">{product.name}</div>
                  </div>
                  <div className="text-right flex-shrink-0 pl-4 border-l border-zinc-100 dark:border-zinc-800">
                    <div className="text-xs text-zinc-400 font-medium mb-1 uppercase tracking-wider">Starts From</div>
                    <div className="font-black text-lg text-zinc-900 dark:text-zinc-50">
                      {product.price_min ? formatPrice(product.price_min) : 'N/A'}
                    </div>
                  </div>
                </Link>
              ))}
              
              <div className="p-2 mt-2 border-t border-zinc-100 dark:border-zinc-900">
                <Button variant="ghost" className="w-full text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => {
                  setIsOpen(false);
                  router.push(`/categories/${results[0].category.slug}?search=${encodeURIComponent(query)}`);
                }}>
                  View all results for "{query}"
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No products found</h3>
              <p className="text-zinc-500">We couldn't find anything matching "{query}". Try another search term.</p>
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
        className={`w-full h-full object-contain drop-shadow-sm group-hover/item:scale-105 transition-all duration-300 ${isImageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
        loading="lazy"
        onLoad={() => setIsImageLoaded(true)}
        onError={() => {
          setImageError(true);
          setIsImageLoaded(true);
        }}
      />
    );
  }

  return <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-tight text-center">No<br/>Img</div>;
}
