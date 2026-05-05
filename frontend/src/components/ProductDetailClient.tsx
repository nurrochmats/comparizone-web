"use client";

import { useState } from "react";
import { ProductDetail, Attribute } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, ChevronLeft, ChevronRight, Check, X, ImageIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency, getImageUrl } from "@/lib/utils";
import { useEffect } from "react";
import { trackEvent } from "@/lib/visitor-tracker";

interface Props {
  product: ProductDetail;
  images: any[];
  primaryImage: string;
  baseUrl: string;
}

export function ProductDetailClient({ product, images, primaryImage, baseUrl }: Props) {
  // State for active SKU selection
  // Null means "Base Product" is selected. We default to the first SKU if available.
  const [activeSkuId, setActiveSkuId] = useState<number | null>(
    product.skus && product.skus.length > 0 ? product.skus[0].id : null
  );

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize carousel with primary image index if possible
  useEffect(() => {
    if (images && images.length > 0 && primaryImage) {
      const pIdx = images.findIndex(img => img.image_url === primaryImage);
      if (pIdx !== -1) setCurrentImageIndex(pIdx);
    }
  }, [primaryImage, images]);

  const nextImage = () => {
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    trackEvent('product_view', {
      product_id: product.id,
      product_name: product.name,
      category_id: product.category.id
    }, product.name);
  }, [product.id, product.name, product.category.id]);


  const formatPrice = (price: number | null) => {
    return formatCurrency(price);
  };

  const renderValue = (val: string | number | boolean | null, unit: string | null, modifier?: string | null) => {
    if (val === null) return <span className="text-zinc-400">-</span>;
    if (typeof val === 'boolean') {
      return (
        <span className="inline-flex items-center gap-2">
          {val ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />}
          {modifier && <span className="text-zinc-500 text-sm font-normal">({modifier})</span>}
        </span>
      );
    }
    return (
      <span className="font-medium">
        {val} {unit && <span className="text-zinc-500 text-sm font-normal ml-1">{unit}</span>}
        {modifier && <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold ml-1.5">({modifier})</span>}
      </span>
    );
  };

  // ── Compute Active Data ──
  const activeSku = activeSkuId ? product.skus?.find(s => s.id === activeSkuId) : null;

  // Display Price
  let displayPrice = "";
  if (activeSku && activeSku.base_price) {
    displayPrice = formatPrice(activeSku.base_price);
  } else if (product.price_min) {
    displayPrice = `from ${formatPrice(product.price_min)}`;
    if (product.price_max && product.price_max > product.price_min) {
      displayPrice += ` - ${formatPrice(product.price_max)}`;
    }
  } else {
    displayPrice = "Price unavailable";
  }

  // Display Specs: Merge Base Attributes with SKU overrides (if any)
  const mergedSpecs: Record<string, Attribute> = { ...(product.attributes || {}) };
  if (activeSku?.attributes) {
    const skuAttrs = activeSku.attributes;
    Object.keys(skuAttrs).forEach(code => {
      mergedSpecs[code] = skuAttrs[code];
    });
  }

  // Display Links: Use SKU links if present, otherwise fallback to base links
  let activeLinks = activeSku?.affiliate_links && activeSku.affiliate_links.length > 0
    ? activeSku.affiliate_links
    : (product.affiliate_links || []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/categories/${product.category.slug}`}
          className="group inline-flex items-center gap-2.5 text-sm font-bold text-zinc-950 dark:text-zinc-50 hover:text-blue-600 transition-colors"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm transition-transform group-hover:-translate-x-1">
            <ChevronLeft className="h-4 w-4 stroke-[3.5]" />
          </span>
          {product.category.name}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Left Column - Image & Quick Specs */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800/50">
            <div className="aspect-square relative group bg-gradient-to-br from-zinc-50 to-zinc-100/30 dark:from-zinc-900/30 dark:to-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
              {images && images.length > 0 ? (
                <>
                  <img
                    src={getImageUrl(images[currentImageIndex].image_url)}
                    alt={`${product.name} - image ${currentImageIndex + 1}`}
                    className="absolute inset-0 w-full h-full object-contain p-8 drop-shadow-sm transition-opacity duration-500"
                    loading="lazy"
                  />

                  {/* Carousel Controls */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-zinc-900 shadow-lg z-10"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-zinc-900 shadow-lg z-10"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>

                      {/* Image Counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-bold text-white tracking-widest uppercase">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : primaryImage ? (
                <img
                  src={getImageUrl(primaryImage)}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-8 drop-shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 w-full h-full">
                  <div className="p-6 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-zinc-100 dark:border-zinc-800 mb-4">
                    <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600" strokeWidth={1} />
                  </div>
                  <span className="text-xs font-black tracking-[0.25em] uppercase text-zinc-400/50">Image Not Available</span>
                </div>
              )}
            </div>

            {/* Thumbnails Gallery */}
            {images && images.length > 1 && (
              <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-900 bg-white/50 dark:bg-zinc-950/50">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "relative w-16 h-16 rounded-xl border-2 transition-all flex-shrink-0 overflow-hidden bg-zinc-50 dark:bg-zinc-900",
                      currentImageIndex === idx
                        ? "border-blue-600 ring-4 ring-blue-600/10"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img
                      src={getImageUrl(img.image_url)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-sm font-semibold tracking-wider text-zinc-500 uppercase mb-1">
                {product.brand}
              </div>
              <h1 className="text-2xl font-bold leading-tight mb-2">{product.name}</h1>

              {/* Price Display */}
              <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-500 mb-6 border-t pt-4">
                <span className="block mt-2">
                  {displayPrice}
                </span>
              </div>

              {/* SKU Variant Selector */}
              {product.skus && product.skus.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="text-sm font-bold text-zinc-950 dark:text-white flex items-center justify-between">
                    Available Configurations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.skus.map((sku: any) => (
                      <button
                        key={sku.id}
                        onClick={() => setActiveSkuId(sku.id)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 active:scale-95",
                          activeSkuId === sku.id
                            ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400 shadow-sm"
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 hover:shadow-sm"
                        )}
                      >
                        {sku.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full gap-2 text-md h-12 shadow-sm rounded-xl" asChild>
                <Link href={`/compare?products=${product.id}`}>
                  <Scale className="h-5 w-5" /> Compare with others
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Attributes & Affiliate Links */}
        <div className="md:col-span-2 space-y-8">
          <Card className="h-full bg-white dark:bg-zinc-950 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
            <CardHeader className="border-b bg-zinc-50/50 dark:bg-zinc-900/50">
              <CardTitle className="text-xl">Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {Object.keys(mergedSpecs).length > 0 ? Object.values(mergedSpecs).map((attr) => (
                  <div key={attr.code} className="flex px-6 py-4 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors">
                    <div className="w-1/3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      {attr.name}
                    </div>
                    <div className="w-2/3 text-sm text-zinc-900 dark:text-zinc-100">
                      {renderValue(attr.value, attr.unit, attr.modifier)}
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-zinc-500 text-sm">
                    No technical specifications available for this product configuration.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Affiliate Offers Section */}
      {activeLinks && activeLinks.length > 0 && (
        <div className="mt-16 pt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3 mb-8">
              <span className="w-2.5 h-10 bg-blue-600 rounded-full"></span>
              Where to Buy {activeSku ? activeSku.name : product.name}
            </h2>
            <div className="grid gap-4">
              {activeLinks.map((link: any) => (
                <div
                  key={link.id}
                  className="group relative flex flex-col md:flex-row md:items-center gap-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl hover:border-blue-600 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-xl"
                >
                  <div className="flex-grow">
                    <div className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
                      {link.store_name}
                    </div>
                    <div className="font-extrabold text-xl text-zinc-950 dark:text-zinc-50 mb-1">
                      {link.product_name || (activeSku ? `${product.name} - ${activeSku.name}` : product.name)}
                    </div>
                    {link.commission_note && (
                      <div className="text-xs text-zinc-500 font-bold mt-1 bg-zinc-100 dark:bg-zinc-800 inline-block px-2 py-1 rounded-md">
                        {link.commission_note}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between md:items-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-2xl font-black text-zinc-950 dark:text-white">
                      {link.price ? formatPrice(link.price) : "Check Price"}
                    </div>
                    <BuyNowLink link={link} productName={product.name} productId={product.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BuyNowLink({ link, productName, productId }: { link: any, productName: string, productId: number }) {
  return (
    <Link
      href={link.affiliate_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('click', {
        link_id: link.id,
        product_id: productId,
        store: link.store_name,
        sku_id: link.sku_id
      }, `Click ${link.store_name} - ${productName}`)}
      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white transition-all shadow-lg active:scale-95 w-full md:w-auto"
    >
      <ShoppingCart className="h-4 w-4" />
      Buy Now
    </Link>
  );
}
