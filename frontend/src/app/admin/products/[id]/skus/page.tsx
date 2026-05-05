"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api, Product, ProductSku, AffiliateLink } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft, Loader2, Plus, Edit2, Trash2, SlidersHorizontal, Settings2, Link as LinkIcon, Save } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export default function SkuManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [skus, setSkus] = useState<ProductSku[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Variant Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<ProductSku | null>(null);
  const [skuCode, setSkuCode] = useState("");
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Specs Modal (Single SKU)
  const [isAttrsDialogOpen, setIsAttrsDialogOpen] = useState(false);
  const [selectedSkuForAttrs, setSelectedSkuForAttrs] = useState<ProductSku | null>(null);
  const [categoryAttributes, setCategoryAttributes] = useState<any[]>([]);
  const [productValues, setProductValues] = useState<Record<number, any>>({});
  const [isSavingAttrs, setIsSavingAttrs] = useState(false);

  // Matrix Specs Modal (Multi SKU)
  const [isMatrixDialogOpen, setIsMatrixDialogOpen] = useState(false);
  const [matrixValues, setMatrixValues] = useState<Record<number, Record<string, any>>>({});
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);


  useEffect(() => {
    fetchData();
  }, [productId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      // Temporarily use products.list because we don't have a single product backend route that doesn't use slugs
      const productList = await api.products.list();
      const foundProduct = productList.find(p => p.id === productId);
      if (!foundProduct) throw new Error("Product not found");

      setProduct(foundProduct);

      const fetchedSkus = await api.admin.skus.list(token, productId);
      setSkus(fetchedSkus);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const getToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
    if (!token) {
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return token;
  };

  const openCreateDialog = () => {
    setEditingSku(null);
    setSkuCode("");
    setName("");
    setBasePrice("");
    setIsActive(true);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (s: ProductSku) => {
    setEditingSku(s);
    setSkuCode(s.sku_code);
    setName(s.name);
    setBasePrice(s.base_price?.toString() || "");
    setIsActive(s.is_active);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = getToken();
      const payload: Partial<ProductSku> = {
        sku_code: skuCode,
        name,
        base_price: basePrice ? parseInt(basePrice) : null,
        is_active: isActive
      };

      if (editingSku) {
        const updated = await api.admin.skus.update(token, editingSku.id, payload);
        setSkus(skus.map(s => s.id === updated.id ? updated : s));
        setSuccessMsg("Variant updated successfully!");
      } else {
        const created = await api.admin.skus.create(token, productId, payload);
        setSkus([...skus, created]);
        setSuccessMsg("Variant created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save variant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this variant? It will orphan all related affiliate links and attributes!")) return;

    const old = [...skus];
    setSkus(skus.filter(s => s.id !== id));

    try {
      const token = getToken();
      await api.admin.skus.delete(token, id);
      setSuccessMsg("Variant deleted successfully!");
    } catch (err: any) {
      setSkus(old);
      setError(err.message || "Failed to delete variant");
    }
  };

  // --- Specifications / Attributes per SKU ---
  const openAttrsDialog = async (s: ProductSku) => {
    if (!product) return;
    setSelectedSkuForAttrs(s);
    setCategoryAttributes([]);
    setProductValues({});
    setError(null);
    setSuccessMsg(null);
    setIsAttrsDialogOpen(true);

    try {
      const token = getToken();
      // Load standard category attributes
      const attrs = await api.admin.attributes.list(token, product.category_id || product.category?.id);
      setCategoryAttributes(attrs as any[]);

      // Load specific ProductAttributeValues
      const valuesRes = await api.admin.productAttributeValues.list(token, productId);
      const valuesMap: Record<number, any> = {};

      (valuesRes as any[]).forEach(v => {
        // Load only the attribute values that correspond to THIS sku_id
        if (v.sku_id === s.id) {
          valuesMap[v.attribute_id] = v;
        }
      });
      setProductValues(valuesMap);
    } catch (err: any) {
      setError(err.message || "Failed to load attributes");
    }
  };

  const handleAttrChange = (attrId: number, field: string, value: any) => {
    setProductValues(prev => ({
      ...prev,
      [attrId]: {
        ...prev[attrId],
        attribute_id: attrId,
        [field]: value
      }
    }));
  };

  const saveProductAttributes = async () => {
    if (!selectedSkuForAttrs || !product) return;
    setIsSavingAttrs(true);
    setError(null);
    try {
      const token = getToken();

      const promises = Object.values(productValues).map(async val => {
        const payload = {
          attribute_id: val.attribute_id,
          sku_id: selectedSkuForAttrs.id, // BIND TO SKU
          value_text: val.value_text ?? null,
          value_number: val.value_number ?? null,
          value_boolean: val.value_boolean ?? null,
          value_option_id: val.value_option_id ?? null,
        };

        const hasValue = payload.value_text !== null || payload.value_number !== null || payload.value_boolean !== null || payload.value_option_id !== null;

        if (val.id) {
          if (!hasValue) {
            return api.admin.productAttributeValues.delete(token, productId, val.id);
          }
          return api.admin.productAttributeValues.update(token, productId, val.id, payload);
        } else if (hasValue) {
          return api.admin.productAttributeValues.create(token, productId, payload);
        }
      });

      await Promise.all(promises);
      setSuccessMsg(`Attributes saved for ${selectedSkuForAttrs.name} successfully!`);
      setIsAttrsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save attributes");
    } finally {
      setIsSavingAttrs(false);
    }
  };

  // --- Matrix Specs Logic ---
  const openMatrixDialog = async () => {
    if (!product) return;
    setIsLoading(true);
    setCategoryAttributes([]);
    setMatrixValues({});
    setError(null);
    setSuccessMsg(null);
    setIsMatrixDialogOpen(true);

    try {
      const token = getToken();
      // 1. Fetch category attributes
      const attrs = await api.admin.attributes.list(token, product.category_id || product.category?.id);
      setCategoryAttributes(attrs as any[]);

      // 2. Fetch ALL product attribute values for this product
      const valuesRes = await api.admin.productAttributeValues.list(token, productId);

      // 3. Map values to Matrix [attribute_id][sku_id_or_base]
      const matrix: Record<number, Record<string, any>> = {};
      (valuesRes as any[]).forEach(v => {
        const attrId = v.attribute_id;
        const colKey = v.sku_id ? v.sku_id.toString() : "base";
        if (!matrix[attrId]) matrix[attrId] = {};
        matrix[attrId][colKey] = v;
      });
      setMatrixValues(matrix);
    } catch (err: any) {
      setError(err.message || "Failed to load matrix data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatrixValueChange = (attrId: number, colKey: string, field: string, value: any) => {
    setMatrixValues(prev => {
      const currentAttr = prev[attrId] || {};
      const currentCol = currentAttr[colKey] || { attribute_id: attrId, sku_id: colKey === "base" ? null : parseInt(colKey) };

      return {
        ...prev,
        [attrId]: {
          ...currentAttr,
          [colKey]: {
            ...currentCol,
            [field]: value
          }
        }
      };
    });
  };

  const renderMatrixCell = (attr: any, colKey: string) => {
    const val = matrixValues[attr.id]?.[colKey] || { attribute_id: attr.id, sku_id: colKey === "base" ? null : parseInt(colKey), value_text: null, value_number: null, value_boolean: null, value_option_id: null };

    if (attr.data_type === 'boolean') {
      return (
        <select className="w-full h-9 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:bg-zinc-950 dark:border-zinc-800"
          value={val.value_boolean === true ? "1" : val.value_boolean === false ? "0" : ""}
          onChange={e => handleMatrixValueChange(attr.id, colKey, 'value_boolean', e.target.value === "" ? null : e.target.value === "1")}>
          <option value="">{colKey === "base" ? "Not set" : "Inherit"}</option>
          <option value="1">Yes</option>
          <option value="0">No</option>
        </select>
      );
    }

    if (attr.data_type === 'option') {
      return (
        <select className="w-full h-9 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:bg-zinc-950 dark:border-zinc-800"
          value={val.value_option_id || ""}
          onChange={e => handleMatrixValueChange(attr.id, colKey, 'value_option_id', e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">{colKey === "base" ? "Not set" : "Inherit"}</option>
          {(attr.options || []).map((opt: any) => (
            <option key={opt.id} value={opt.id}>{opt.label || opt.value}</option>
          ))}
        </select>
      );
    }

    if (attr.data_type === 'number') {
      return (
        <div className="flex flex-col gap-1.5">
          <Input
            type="number"
            step="any"
            placeholder="Value"
            className="h-8 text-xs px-2"
            value={val.value_number ?? ""}
            onChange={e => handleMatrixValueChange(attr.id, colKey, 'value_number', e.target.value === "" ? null : Number(e.target.value))}
          />
          <Input
            type="text"
            placeholder="Mod (DDR5...)"
            className="h-7 text-[10px] px-2 bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 italic"
            value={val.value_text ?? ""}
            onChange={e => handleMatrixValueChange(attr.id, colKey, 'value_text', e.target.value || null)}
          />
        </div>
      );
    }

    return (
      <Input
        type="text"
        className="h-9 text-xs px-2"
        placeholder="e.g. OLED"
        value={val.value_text ?? ""}
        onChange={e => handleMatrixValueChange(attr.id, colKey, 'value_text', e.target.value || null)}
      />
    );
  };

  const saveMatrix = async () => {
    if (!product) return;
    setIsSavingMatrix(true);
    setError(null);
    try {
      const token = getToken();
      const allPromises: Promise<any>[] = [];

      Object.keys(matrixValues).forEach(attrIdStr => {
        const attrId = parseInt(attrIdStr);
        const colMap = matrixValues[attrId];

        Object.keys(colMap).forEach(colKey => {
          const val = colMap[colKey];
          const payload = {
            attribute_id: attrId,
            sku_id: colKey === "base" ? null : parseInt(colKey),
            value_text: val.value_text ?? null,
            value_number: val.value_number ?? null,
            value_boolean: val.value_boolean ?? null,
            value_option_id: val.value_option_id ?? null,
          };

          const hasValue = payload.value_text !== null || payload.value_number !== null || payload.value_boolean !== null || payload.value_option_id !== null;

          if (val.id) {
            if (!hasValue) {
              allPromises.push(api.admin.productAttributeValues.delete(token, productId, val.id));
            } else {
              allPromises.push(api.admin.productAttributeValues.update(token, productId, val.id, payload));
            }
          } else if (hasValue) {
            allPromises.push(api.admin.productAttributeValues.create(token, productId, payload));
          }
        });
      });

      await Promise.all(allPromises);
      setSuccessMsg("Specifications Matrix saved successfully!");
      setIsMatrixDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save matrix");
    } finally {
      setIsSavingMatrix(false);
    }
  };


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 font-bold text-lg">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Settings2 className="h-5 w-5 text-indigo-600" />
            <div className="flex flex-col">
              <span>Manage Variants (SKUs)</span>
              {product && <span className="text-xs text-zinc-500 font-normal">{product.name} • {product.brand}</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && !isDialogOpen && !isAttrsDialogOpen && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        {successMsg && !isDialogOpen && !isAttrsDialogOpen && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 border border-green-200 rounded-md">
            {successMsg}
          </div>
        )}

        <div className="flex justify-between items-center mb-6 gap-2">
          <h1 className="text-xl font-bold">Product SKUs</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={openMatrixDialog} disabled={isLoading}>
              <SlidersHorizontal className="mr-2 h-4 w-4 text-blue-600" /> Specs Matrix
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Variant
            </Button>
          </div>
        </div>

        <Card className="bg-white dark:bg-zinc-950 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : (
              <>
                {/* Desktop Table View - Hidden on LG and smaller to prevent horizontal scrolling */}
                <div className="hidden lg:block overflow-hidden">
                  <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                      <TableRow>
                        <TableHead className="w-[200px]">SKU Code</TableHead>
                        <TableHead>Configuration Name</TableHead>
                        <TableHead>Override Base Price</TableHead>
                        <TableHead className="w-[120px]">Status</TableHead>
                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skus.map((s) => (
                        <TableRow key={s.id} className="group/row">
                          <TableCell className="font-mono text-xs">
                            <div className="flex items-center gap-2">
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">
                                {s.sku_code}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-zinc-900 dark:text-zinc-100">{s.name}</TableCell>
                          <TableCell>
                            {s.base_price ? (
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {formatCurrency(s.base_price)}
                              </span>
                            ) : (
                              <span className="text-zinc-400 italic text-sm">Inherited from Product</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.is_active 
                                ? "bg-green-100/50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-800/50" 
                                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-400"}`} />
                              {s.is_active ? "Active" : "Draft"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 opacity-0 group-hover/row:opacity-100 transition-opacity"
                              onClick={() => openEditDialog(s)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover/row:opacity-100 transition-opacity"
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Tablet & Mobile Card View - Triggered on LG (1024px) and smaller to ensure no scrolling */}
                <div className="lg:hidden space-y-4 p-4 bg-zinc-50/30 dark:bg-zinc-900/10">
                  {skus.map((s) => (
                    <div 
                      key={s.id} 
                      className="group/card bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg px-2.5 py-1 border border-zinc-200/50 dark:border-zinc-700/50">
                                <span className="font-mono text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                                  {s.sku_code}
                                </span>
                              </div>
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${
                                s.is_active 
                                  ? "bg-green-100/50 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? "bg-green-500 animate-pulse" : "bg-zinc-400"}`} />
                                {s.is_active ? "Active" : "Draft"}
                              </div>
                            </div>
                            <h3 className="font-black text-xl text-zinc-900 dark:text-white leading-none pt-1">
                              {s.name}
                            </h3>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-10 w-10 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
                              onClick={() => openEditDialog(s)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="icon" 
                              className="h-10 w-10 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="relative group/info p-4 rounded-[1.25rem] bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 transition-colors hover:border-indigo-200 dark:hover:border-indigo-900/50">
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-1 h-3 bg-indigo-500 rounded-full" />
                              Base Pricing
                            </div>
                            <div className="text-base font-black text-zinc-900 dark:text-white">
                              {s.base_price ? (
                                <span className="text-indigo-600 dark:text-indigo-400">{formatCurrency(s.base_price)}</span>
                              ) : (
                                <span className="text-zinc-400 font-medium italic opacity-60 italic text-xs">Inherited from Product</span>
                              )}
                            </div>
                          </div>

                          <div className="p-4 rounded-[1.25rem] bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-center">
                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase font-black tracking-[0.2em] mb-2 flex items-center gap-2">
                              <div className="w-1 h-3 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                              System Info
                            </div>
                            <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                              <Package className="h-3 w-3 opacity-40" />
                              ID: #{s.id}
                              <span className="mx-1 opacity-20">|</span>
                              Managed SKU
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {skus.length === 0 && (
                  <div className="text-center py-12 px-4 text-zinc-500">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No SKUs defined for this product.</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSku ? "Edit Variant" : "Create Variant"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 px-1">
              {error && isDialogOpen && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
              <div className="grid gap-2">
                <Label htmlFor="skuCode">SKU Code *</Label>
                <Input id="skuCode" value={skuCode} onChange={e => setSkuCode(e.target.value)} required placeholder="e.g. S24-8GB-128GB" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. 8GB RAM / 128GB Storage" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="basePrice">Override Base Price (Rp)</Label>
                <Input id="basePrice" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="Leave blank to inherit product price range" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="isActive" className="cursor-pointer">Active Variant</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingSku ? "Save Changes" : "Create Variant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isMatrixDialogOpen} onOpenChange={setIsMatrixDialogOpen}>
        <DialogContent className="sm:max-w-[95vw] lg:max-w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-blue-600" />
              Specifications Matrix: {product?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-grow overflow-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-zinc-500">
                <Loader2 className="h-6 w-6 animate-spin mb-3" />
                <span className="text-sm">Preparing matrix view...</span>
              </div>
            ) : (
              <div className="px-4 py-3"> {/* ✅ NEW CONTAINER */}
                <div className="rounded-lg border bg-white dark:bg-zinc-950 overflow-hidden">

                  <Table className="border-separate border-spacing-0 min-w-full text-sm">

                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-20">
                      <TableRow className="hover:bg-transparent">

                        {/* ATTRIBUTE */}
                        <TableHead className="w-[180px] sticky left-0 z-30 bg-zinc-50 dark:bg-zinc-900 border-b border-r shadow-[1px_0_0_0_#e4e4e7] dark:shadow-[1px_0_0_0_#27272a] h-12 px-3">
                          Attribute
                        </TableHead>

                        {/* ❌ BASE SPECS REMOVED */}

                        {/* SKU */}
                        {skus.map(s => (
                          <TableHead
                            key={s.id}
                            className="w-[200px] min-w-[180px] border-b text-center px-3 font-semibold border-l"
                          >
                            {s.name}
                            <div className="text-[10px] font-mono opacity-60">
                              {s.sku_code}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {categoryAttributes.map((attr, idx) => (
                        <TableRow
                          key={attr.id}
                          className={
                            idx % 2 === 0
                              ? "bg-white dark:bg-zinc-950"
                              : "bg-zinc-50/30 dark:bg-zinc-900/10"
                          }
                        >
                          {/* ATTRIBUTE */}
                          <TableCell className="font-medium text-xs sticky left-0 z-10 bg-inherit border-r px-3 py-2 shadow-[1px_0_0_0_#e4e4e7] dark:shadow-[1px_0_0_0_#27272a]">
                            {attr.name}
                            {attr.unit && (
                              <span className="text-[10px] text-zinc-500 block">
                                ({attr.unit})
                              </span>
                            )}
                          </TableCell>

                          {/* ❌ BASE COLUMN REMOVED */}

                          {/* SKU CELLS */}
                          {skus.map(s => (
                            <TableCell
                              key={s.id}
                              className="px-2 py-2 border-b border-l"
                            >
                              {renderMatrixCell(attr, s.id.toString())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>

                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between sm:justify-between">
            <div className="text-xs text-zinc-500 max-w-[60%] italic">
              <span className="font-bold text-blue-600">Tip:</span> Leave SKU cells empty to inherit from "Base Specs". Attribute values will be split precisely between variants in the Comparison Table.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsMatrixDialogOpen(false)} disabled={isSavingMatrix}>Cancel</Button>
              <Button onClick={saveMatrix} disabled={isSavingMatrix || isLoading || categoryAttributes.length === 0}>
                {isSavingMatrix ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save All Overrides
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
