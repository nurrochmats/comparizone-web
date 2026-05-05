"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product, api } from "@/lib/api-client";
import { Scale, Package, Image as ImageIcon, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn, formatCurrency, getImageUrl } from "@/lib/utils";

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
        const images = await api.products.getImages(product.id);
        
        if (isMounted) {
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
    return formatCurrency(price);
  };


  return (
    <Card className={cn(
      "flex flex-col h-full overflow-hidden transition-all duration-500 bg-white dark:bg-zinc-950 border-2 rounded-[2rem] group/card",
      isComparing 
        ? "border-blue-600 shadow-xl shadow-blue-500/20 ring-4 ring-blue-600/10 scale-[1.02]" 
        : "border-zinc-100 dark:border-zinc-800 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200"
    )}>
      <CardHeader className="p-0 relative aspect-square bg-zinc-50/50 dark:bg-zinc-900/20 flex-shrink-0 overflow-hidden">
        {primaryImage && !imageError ? (
          <>
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            )}
            <img
              src={getImageUrl(primaryImage)}
              alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover/card:scale-110 ${
                isImageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
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
        
        {isComparing && (
          <div className="absolute top-4 right-4 z-20 bg-blue-600 text-white p-1.5 rounded-full shadow-lg animate-in zoom-in">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
        )}

        <Badge className="absolute top-4 left-4 z-10 shadow-lg font-bold tracking-tight bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-900 dark:text-white border-none" variant="outline">
          {product.category?.name || "Tech"}
        </Badge>
      </CardHeader>

      <CardContent className="flex-grow p-6">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-500 mb-2">{product.brand || "Premium"}</div>
        <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover/card:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50 dark:border-zinc-900">
          <div className="text-xl font-black text-zinc-950 dark:text-white">
            {formatPrice(product.price_min)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button variant="default" className="flex-1 rounded-xl font-bold" asChild>
          <Link href={`/product/${product.slug}`}>View Details</Link>
        </Button>
        {onCompare && (
          <Button
            variant={isComparing ? "secondary" : "outline"}
            size="icon"
            className={cn(
              "rounded-xl h-10 w-10 border-2",
              isComparing ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" : "border-zinc-200"
            )}
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
