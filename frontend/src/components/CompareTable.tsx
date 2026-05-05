import { ProductDetail, Attribute } from "@/lib/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Check, X, Package, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";

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
      products.forEach((p, idx) => {
        if (newActive[idx] === undefined) {
           newActive[idx] = (p.skus && p.skus.length > 0) ? p.skus[0].id : null;
           changed = true;
        }
      });
      return changed ? newActive : prev;
    });
  }, [products]);

  const formatPrice = (price: number | null) => {
    return formatCurrency(price);
  };

  const displayData = useMemo(() => {
    const data: Record<number, { mergedSpecs: Record<string, Attribute>, displayPrice: string, activeLinks: any[], activeSku: any }> = {};
    products.forEach((p, idx) => {
      const activeSkuId = activeSkus[idx];
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
        
      data[idx] = { mergedSpecs, displayPrice, activeLinks, activeSku };
    });
    return data;
  }, [products, activeSkus]);

  // Collect all unique attribute codes from all products
  const allAttributeCodes = useMemo(() => {
    return Array.from(
      new Set(products.flatMap((p, idx) => Object.keys(displayData[idx]?.mergedSpecs || {})))
    );
  }, [products, displayData]);

  // Group attributes by their name for the table rows
  const attributeRows = useMemo(() => {
    return allAttributeCodes.map(code => {
      for (let i = 0; i < products.length; i++) {
        const attrDef = displayData[i]?.mergedSpecs?.[code];
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
    <Card className="overflow-hidden bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-xl">
      <div className="overflow-x-auto custom-scrollbar">
        <Table className="min-w-full table-fixed border-collapse">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[180px] md:w-[220px] align-bottom pb-10 z-30 sticky left-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-r-2 border-zinc-100 dark:border-zinc-800 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
                <div className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter leading-none italic">
                  Compare<br /><span className="text-blue-600">Specs</span>
                </div>
              </TableHead>
              {products.map((product, idx) => {
                const displayImage = imageUrls[product.id] || product.thumbnail;
                const hasError = imageErrors[product.id];
                const loaded = isImageLoaded[product.id];
                const pData = displayData[idx];

                return (
                  <TableHead key={`${product.id}-${idx}`} className="w-[280px] min-w-[280px] align-top px-8 py-10 border-l border-zinc-100 dark:border-zinc-800 group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                    <div className="flex flex-col h-full">
                      <div className="w-full aspect-square relative flex items-center justify-center bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-zinc-100 dark:border-zinc-800 mb-6 overflow-hidden shadow-sm group-hover:shadow-xl group-hover:border-blue-200 dark:group-hover:border-blue-900/50 transition-all duration-500">
                        {displayImage && !hasError ? (
                          <img 
                            src={getImageUrl(displayImage)} 
                            alt={product.name} 
                            className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110", !loaded ? "opacity-0 scale-95" : "opacity-100 scale-100")} 
                            loading="lazy"
                            onLoad={() => setIsImageLoaded(prev => ({ ...prev, [product.id]: true }))}
                            onError={() => setImageErrors(prev => ({ ...prev, [product.id]: true }))}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-zinc-400">
                            <Package className="h-10 w-10 mb-2 opacity-30" strokeWidth={1} />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em] mb-2">{product.brand}</div>
                      <div className="font-bold text-lg text-zinc-950 dark:text-zinc-50 leading-tight mb-4 line-clamp-2 h-14 group-hover:text-blue-600 transition-colors">{product.name}</div>
                      
                      {/* Variant Selector */}
                      {product.skus && product.skus.length > 0 && (
                        <div className="mb-6">
                          <select 
                            className="w-full text-xs font-bold border-2 border-zinc-100 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 transition-all appearance-none"
                            value={activeSkus[idx] || ""}
                            onChange={(e) => {
                               setActiveSkus(prev => ({ ...prev, [idx]: parseInt(e.target.value) || null }));
                            }}
                          >
                            {product.skus.map((sku: any) => (
                              <option key={sku.id} value={sku.id}>{sku.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="text-2xl font-black text-zinc-950 dark:text-white mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-900">
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
              <TableRow key={rowStyle.code} className={cn("hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors border-none", idx % 2 === 0 ? "bg-zinc-50/40 dark:bg-zinc-900/10" : "")}>
                <TableCell className="font-black text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 py-6 px-6 z-20 sticky left-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-r-2 border-zinc-100 dark:border-zinc-800 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
                  {rowStyle.name}
                </TableCell>
                {products.map((product, pIdx) => {
                  const attr = displayData[pIdx]?.mergedSpecs?.[rowStyle.code];
                  return (
                    <TableCell key={`${pIdx}-${rowStyle.code}`} className="text-center py-6 px-8 border-l border-zinc-50 dark:border-zinc-900/50">
                      {renderValue(attr?.value, attr?.unit, attr?.modifier)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

            {/* Affiliate Links Row */}
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[180px] md:w-[220px] align-top pt-12 pb-10 z-20 sticky left-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-r-2 border-zinc-100 dark:border-zinc-800 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]">
                <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-3 uppercase tracking-tighter italic">
                  <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                  Best Deals
                </div>
              </TableHead>
            {products.map((product, pIdx) => {
              const links = displayData[pIdx]?.activeLinks || [];
              const activeSku = displayData[pIdx]?.activeSku;
              
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
      </div>
    </Card>
  );
}
