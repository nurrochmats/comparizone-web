import { ProductDetail, Attribute } from "@/lib/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Check, X, Package, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface CompareTableProps {
  products: ProductDetail[];
}

export function CompareTable({ products }: CompareTableProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [isImageLoaded, setIsImageLoaded] = useState<Record<number, boolean>>({});
  
  const [activeSkus, setActiveSkus] = useState<Record<number, number | null>>({});

  useEffect(() => {
    let isMounted = true;

    products.forEach(async (product) => {
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
            setImageUrls(prev => ({ ...prev, [product.id]: pImg.image_url }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch product images for compare table", err);
      }
    });

    return () => { isMounted = false; };
  }, [products.map(p => p.id).join(',')]); // Depend on product IDs to avoid infinite loops

  useEffect(() => {
    setActiveSkus(prev => {
      const newActive: Record<number, number | null> = { ...prev };
      let changed = false;
      products.forEach(p => {
        if (newActive[p.id] === undefined) {
           newActive[p.id] = (p.skus && p.skus.length > 0) ? p.skus[0].id : null;
           changed = true;
        }
      });
      return changed ? newActive : prev;
    });
  }, [products]);

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const displayData = useMemo(() => {
    const data: Record<number, { mergedSpecs: Record<string, Attribute>, displayPrice: string, activeLinks: any[], activeSku: any }> = {};
    products.forEach(p => {
      const activeSkuId = activeSkus[p.id];
      const activeSku = activeSkuId ? p.skus?.find((s: any) => s.id === activeSkuId) : null;
      
      const mergedSpecs: Record<string, Attribute> = { ...(p.attributes || {}) };
      if (activeSku?.attributes) {
        const skuAttrs = activeSku.attributes;
        Object.keys(skuAttrs).forEach(code => {
          mergedSpecs[code] = skuAttrs[code];
        });
      }
      
      let displayPrice = "";
      if (activeSku && activeSku.base_price) {
        displayPrice = formatPrice(activeSku.base_price);
      } else if (p.price_min) {
        displayPrice = formatPrice(p.price_min);
      } else {
        displayPrice = "N/A";
      }

      const activeLinks = activeSku?.affiliate_links && activeSku.affiliate_links.length > 0 
        ? activeSku.affiliate_links 
        : (p.affiliate_links || []);
        
      data[p.id] = { mergedSpecs, displayPrice, activeLinks, activeSku };
    });
    return data;
  }, [products, activeSkus]);

  // Collect all unique attribute codes from all products
  const allAttributeCodes = useMemo(() => {
    return Array.from(
      new Set(products.flatMap(p => Object.keys(displayData[p.id]?.mergedSpecs || {})))
    );
  }, [products, displayData]);

  // Group attributes by their name for the table rows
  const attributeRows = useMemo(() => {
    return allAttributeCodes.map(code => {
      for (const p of products) {
        const attrDef = displayData[p.id]?.mergedSpecs?.[code];
        if (attrDef) {
          return {
            code,
            name: attrDef.name || code,
            unit: attrDef.unit,
          };
        }
      }
      return { code, name: code, unit: undefined };
    });
  }, [allAttributeCodes, products, displayData]);

  if (!products.length) return <div className="p-8 text-center text-zinc-500">No products to compare</div>;

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

  const renderValue = (val: string | number | boolean | null | undefined, unit: string | null | undefined, modifier?: string | null) => {
    if (val === null || val === undefined) return <span className="text-zinc-400">-</span>;
    if (typeof val === 'boolean') {
      return (
        <span className="inline-flex items-center gap-1 justify-center">
          {val ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-red-500 mx-auto" />}
          {modifier && <span className="text-zinc-500 text-xs font-normal">({modifier})</span>}
        </span>
      );
    }
    return (
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {val} {unit && <span className="text-zinc-500 text-sm font-normal ml-1">{unit}</span>}
        {modifier && <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold ml-1">({modifier})</span>}
      </span>
    );
  };

  return (
    <Card className="overflow-x-auto bg-white dark:bg-zinc-950">
      <Table className="min-w-[800px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px] min-w-[200px] align-bottom pb-6 z-10 sticky left-0 bg-white dark:bg-zinc-950 border-r shadow-[2px_0_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_10px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Compare<br />Products</div>
            </TableHead>
            {products.map(product => {
              const displayImage = imageUrls[product.id] || product.thumbnail;
              const hasError = imageErrors[product.id];
              const loaded = isImageLoaded[product.id];
              const pData = displayData[product.id];

              return (
                <TableHead key={product.id} className="min-w-[250px] align-top px-6 py-6 border-l group h-full">
                  <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
                    <div className="aspect-square relative flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100/30 dark:from-zinc-900/40 dark:to-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 mb-4 p-4 overflow-hidden mix-blend-multiply dark:mix-blend-normal">
                      {displayImage && !hasError ? (
                        <img 
                          src={getImageUrl(displayImage)} 
                          alt={product.name} 
                          className={cn("max-w-full max-h-full object-contain transition-all duration-500 group-hover:scale-105 drop-shadow-sm", !loaded ? "opacity-0 scale-95" : "opacity-100 scale-100")} 
                          loading="lazy"
                          onLoad={() => setIsImageLoaded(prev => ({ ...prev, [product.id]: true }))}
                          onError={() => setImageErrors(prev => ({ ...prev, [product.id]: true }))}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-zinc-400">
                          <Package className="h-10 w-10 mb-2 opacity-50" strokeWidth={1.5} />
                          <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">{product.brand}</div>
                    <div className="font-bold text-base text-zinc-900 dark:text-zinc-100 leading-tight mb-2 line-clamp-2">{product.name}</div>
                    
                    {/* Variant Selector */}
                    {product.skus && product.skus.length > 0 && (
                      <div className="mt-2 mb-3 w-full">
                        <select 
                          className="w-full text-sm font-medium border-2 border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-900 focus:ring-0 focus:border-blue-500 text-center cursor-pointer hover:border-zinc-300 transition-colors"
                          value={activeSkus[product.id] || ""}
                          onChange={(e) => {
                             setActiveSkus(prev => ({ ...prev, [product.id]: parseInt(e.target.value) || null }));
                          }}
                        >
                          {product.skus.map((sku: any) => (
                            <option key={sku.id} value={sku.id}>{sku.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="text-blue-600 dark:text-blue-400 font-bold mt-auto pt-2 border-t w-full">
                      {pData?.displayPrice}
                    </div>
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {attributeRows.map((rowStyle, idx) => (
            <TableRow key={rowStyle.code} className={cn("hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors", idx % 2 === 0 ? "bg-zinc-50/30 dark:bg-zinc-900/20" : "")}>
              <TableCell className="font-semibold text-zinc-600 dark:text-zinc-400 py-4 z-10 sticky left-0 bg-white/95 backdrop-blur-sm dark:bg-zinc-950/95 border-r shadow-[2px_0_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_10px_-4px_rgba(0,0,0,0.5)]">
                {rowStyle.name}
              </TableCell>
              {products.map(product => {
                const attr = displayData[product.id]?.mergedSpecs?.[rowStyle.code];
                return (
                  <TableCell key={`${product.id}-${rowStyle.code}`} className="text-center py-4 border-l">
                    {renderValue(attr?.value, attr?.unit, attr?.modifier)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}

          {/* Affiliate Links Row */}
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[200px] min-w-[200px] align-top pt-8 pb-6 z-10 sticky left-0 bg-white dark:bg-zinc-950 border-r shadow-[2px_0_10px_-4px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_10px_-4px_rgba(0,0,0,0.5)]">
              <div className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Where to Buy
              </div>
            </TableHead>
            {products.map(product => {
              const links = displayData[product.id]?.activeLinks || [];
              const activeSku = displayData[product.id]?.activeSku;
              
              return (
                <TableCell key={`affiliate-${product.id}`} className="p-6 border-l align-top shadow-inner bg-zinc-50/30 dark:bg-zinc-900/20">
                  {links.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {links.map((link: any) => (
                        <div
                          key={link.id}
                          className="group relative flex flex-col items-center gap-4 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 p-5 rounded-3xl hover:border-blue-600 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-xl w-full text-center"
                        >
                          <div className="flex-grow w-full">
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-2">
                              {link.store_name}
                            </div>
                            <div className="font-extrabold text-sm text-zinc-950 dark:text-zinc-50 line-clamp-2 mb-1">
                              {link.product_name || (activeSku ? `${product.name} - ${activeSku.name}` : product.name)}
                            </div>
                            {link.commission_note && (
                              <div className="text-[10px] text-zinc-500 font-bold mb-3 bg-zinc-100 dark:bg-zinc-800 inline-block px-2 py-1 rounded">
                                {link.commission_note}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-center gap-3 w-full border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-auto">
                            <div className="text-lg font-black text-zinc-950 dark:text-white">
                              {link.price ? formatPrice(link.price) : "Check Price"}
                            </div>
                            <a
                              href={link.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center px-4 py-2 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 dark:hover:bg-blue-400 hover:text-white transition-all shadow-md active:scale-95 w-full"
                            >
                              Buy Now
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center py-6 text-zinc-400 h-full">
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-3">
                        <X className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <span className="text-xs font-medium uppercase tracking-widest opacity-60">No Offers</span>
                    </div>
                  )}
                </TableCell>
              );
            })}
          </TableRow>

        </TableBody>
      </Table>
    </Card>
  );
}
