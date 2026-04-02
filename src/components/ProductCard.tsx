"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/api-client";
import { Scale, Package, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
  onCompare?: (product: Product) => void;
  isComparing?: boolean;
}

export function ProductCard({ product, onCompare, isComparing = false }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<string | null>(product.thumbnail || null);

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
        console.error("Failed to fetch product images for card", err);
      }
    };

    fetchPrimaryImage();

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || apiUrl.replace(/\/api$/, '').replace(/\/+$/, '');

    const path = url.startsWith('/') ? url : `/storage/${url}`;
    
    if (url.includes('/storage/')) {
        return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }

    return `${baseUrl}${path}`;
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-300 bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50">
      <CardHeader className="p-0 relative aspect-square bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/50 dark:to-zinc-950 flex-shrink-0 group overflow-hidden">
        {primaryImage && !imageError ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            )}
            <img
              src={getImageUrl(primaryImage)}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-contain p-6 transition-all duration-700 ease-in-out group-hover:scale-105 ${
                isImageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              }`}
              loading="lazy"
              onLoad={() => setIsImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setIsImageLoaded(true);
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/20 text-zinc-400">
            <div className="p-4 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 mb-3">
              <ImageIcon className="h-6 w-6 text-zinc-300 dark:text-zinc-600" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400/70">No Image</span>
          </div>
        )}
        <Badge className="absolute top-3 left-3 z-10 shadow-sm font-semibold tracking-wide" variant="secondary">
          {product.category.name}
        </Badge>
      </CardHeader>

      <CardContent className="flex-grow p-4">
        <div className="text-sm text-zinc-500 mb-1">{product.brand || "Unknown Brand"}</div>
        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-auto">
          {formatPrice(product.price_min)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="flex-1">
          <Link href={`/product/${product.slug}`}>Details</Link>
        </Button>
        {onCompare && (
          <Button
            variant={isComparing ? "secondary" : "default"}
            size="icon"
            onClick={() => onCompare(product)}
            title={isComparing ? "Remove from compare" : "Add to compare"}
          >
            <Scale className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
