"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Product, Category, AffiliateLink, ProductSku } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  ExternalLink,
  Settings,
  MoreVertical,
  Filter
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/Pagination";
import { formatCurrency, getImageUrl } from "@/lib/utils";

const STORES = ["Amazon", "Shopee", "Tokopedia", "Lazada", "Blibli", "JD.id", "Other"];

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  // Product Modal State
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodBrand, setProdBrand] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodCategoryId, setProdCategoryId] = useState("");
  const [prodThumbnail, setProdThumbnail] = useState("");

  // Affiliate Links Modal State
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productLinks, setProductLinks] = useState<AffiliateLink[]>([]);
  const [productSkus, setProductSkus] = useState<ProductSku[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Link Form State
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);
  const [linkStore, setLinkStore] = useState("Amazon");
  const [linkSkuId, setLinkSkuId] = useState<string>("base");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPrice, setLinkPrice] = useState("");
  const [linkCommission, setLinkCommission] = useState("");

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return token;
  };

  const fetchProducts = async (page = 1, search = "", category = "all") => {
    setIsLoading(true);
    try {
      const token = getToken();
      const params: any = { page, per_page: itemsPerPage };
      if (search) params.search = search;
      if (category !== "all") params.category_id = category;

      const res = await api.admin.products.list(token, params);
      setProducts(res.data);
      setTotalItems(res.meta?.total || res.total || 0);
      setTotalPages(res.meta?.last_page || res.last_page || 0);
      setCurrentPage(res.meta?.current_page || res.current_page || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await api.categories.list();
      setCategories(cats);
    } catch (err: any) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when page or category changes
  useEffect(() => {
    fetchProducts(currentPage, searchQuery, selectedCategory);
  }, [currentPage, selectedCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1, searchQuery, selectedCategory);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Product CRUD
  const openCreateProduct = () => {
    setEditingProduct(null);
    setProdName("");
    setProdBrand("");
    setProdSlug("");
    setProdCategoryId("");
    setProdThumbnail("");
    setError(null);
    setIsProductDialogOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdBrand(p.brand || "");
    setProdSlug(p.slug);
    setProdCategoryId(p.category_id?.toString() || "");
    setProdThumbnail(p.thumbnail || "");
    setError(null);
    setIsProductDialogOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = getToken();
      const payload = {
        name: prodName,
        brand: prodBrand,
        slug: prodSlug,
        category_id: parseInt(prodCategoryId),
        thumbnail: prodThumbnail || null
      };

      if (editingProduct) {
        await api.admin.products.update(token, editingProduct.id, payload);
        setSuccessMsg("Product updated!");
      } else {
        await api.admin.products.create(token, payload);
        setSuccessMsg("Product created!");
      }
      setIsProductDialogOpen(false);
      fetchProducts(currentPage, searchQuery, selectedCategory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Delete this product and all its variations/links?")) return;
    try {
      const token = getToken();
      await api.admin.products.delete(token, id);
      setSuccessMsg("Product deleted!");
      fetchProducts(currentPage, searchQuery, selectedCategory);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openManageLinks = async (p: Product) => {
    setSelectedProduct(p);
    setIsLinksDialogOpen(true);
    setIsLoadingLinks(true);
    resetLinkForm();
    try {
      const token = getToken();
      const [links, skus] = await Promise.all([
        api.admin.affiliateLinks.listByProduct(token, p.id),
        api.admin.skus.list(token, p.id)
      ]);
      setProductLinks(links);
      setProductSkus(skus);
    } catch (err: any) {
      setError(err.message || "Failed to load links");
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const resetLinkForm = () => {
    setEditingLink(null);
    setLinkStore("Amazon");
    setLinkSkuId("base");
    setLinkUrl("");
    setLinkPrice("");
    setLinkCommission("");
  };

  const handleLinkEdit = (link: AffiliateLink) => {
    setEditingLink(link);
    setLinkStore(link.store_name);
    setLinkSkuId(link.sku_id ? link.sku_id.toString() : "base");
    setLinkUrl(link.affiliate_url);
    setLinkPrice(link.price?.toString() || "");
    setLinkCommission(link.commission_note || "");
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsSavingLink(true);
    try {
      const token = getToken();
      const payload = {
        product_id: selectedProduct.id,
        sku_id: linkSkuId === "base" ? null : parseInt(linkSkuId),
        store_name: linkStore,
        affiliate_url: linkUrl,
        price: linkPrice ? parseFloat(linkPrice) : null,
        commission_note: linkCommission || null
      };

      if (editingLink) {
        await api.admin.affiliateLinks.update(token, editingLink.id, payload);
      } else {
        await api.admin.affiliateLinks.create(token, selectedProduct.id, payload);
      }
      
      // Refresh links
      const updatedLinks = await api.admin.affiliateLinks.listByProduct(token, selectedProduct.id);
      setProductLinks(updatedLinks);
      resetLinkForm();
      fetchProducts(currentPage, searchQuery, selectedCategory); // Update count in table
    } catch (err: any) {
      alert(err.message || "Failed to save link");
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleDeleteLink = async (id: number) => {
    if (!confirm("Delete this affiliate link?")) return;
    try {
      const token = getToken();
      await api.admin.affiliateLinks.delete(token, id);
      setProductLinks(productLinks.filter(l => l.id !== id));
      fetchProducts(currentPage, searchQuery, selectedCategory);
    } catch (err: any) {
      alert(err.message || "Failed to delete link");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 font-bold text-lg">
            <Package className="h-5 w-5 text-blue-600" />
            Manage Products
          </div>
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" asChild>
                <Link href="/admin/categories">Categories</Link>
             </Button>
             <Button size="sm" onClick={openCreateProduct}>
                <Plus className="h-4 w-4 mr-1" /> New Product
             </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {successMsg && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-md flex justify-between items-center">
            {successMsg}
            <button onClick={() => setSuccessMsg(null)} className="text-sm font-bold">×</button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-10" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <select 
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-950 dark:border-zinc-800"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <Card className="bg-white dark:bg-zinc-950 overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/50">
                      <TableHead className="w-16"></TableHead>
                      <TableHead>Product Info</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-center">Variations</TableHead>
                      <TableHead className="text-center">Links</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>                  <TableBody>
                    {products.map(p => (
                      <TableRow key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                        <TableCell>
                          <div className="h-10 w-10 rounded border overflow-hidden bg-zinc-100 flex items-center justify-center">
                            {p.thumbnail ? (
                              <img src={getImageUrl(p.thumbnail)} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-zinc-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-xs text-zinc-500 uppercase tracking-wider">{p.brand || "No Brand"}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">{p.category?.name || "Uncategorized"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                           <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
                              <Link href={`/admin/products/${p.id}/skus`}>
                                 <Settings className="h-3.5 w-3.5 mr-1.5" /> Configure
                              </Link>
                           </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900/30 dark:text-orange-400"
                            onClick={() => openManageLinks(p)}
                          >
                            <LinkIcon className="h-3.5 w-3.5 mr-1.5" /> 
                            {p.affiliate_links_count || 0} Links
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProduct(p)}><Edit2 className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {products.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-20 text-zinc-500">
                           No products found. {searchQuery && "Try another search term."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
 
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />

              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Create New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProductSubmit} className="space-y-4 py-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2">
                  <Label>Product Name *</Label>
                  <Input value={prodName} onChange={e => setProdName(e.target.value)} required placeholder="e.g. Samsung Galaxy S24 Ultra" />
               </div>
               <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input value={prodBrand} onChange={e => setProdBrand(e.target.value)} placeholder="e.g. Samsung" />
               </div>
               <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input value={prodSlug} onChange={e => setProdSlug(e.target.value)} required placeholder="samsung-galaxy-s24-ultra" />
               </div>
               <div className="space-y-2 col-span-2">
                  <Label>Category *</Label>
                  <select 
                    value={prodCategoryId} 
                    onChange={e => setProdCategoryId(e.target.value)} 
                    required
                    className="w-full h-10 px-3 rounded-md border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2 col-span-2">
                  <Label>Thumbnail URL</Label>
                  <Input value={prodThumbnail} onChange={e => setProdThumbnail(e.target.value)} placeholder="https://..." />
               </div>
            </div>
            <DialogFooter className="pt-4">
               <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>Cancel</Button>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingProduct ? "Save Changes" : "Create Product"}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Affiliate Links Dialog */}
      <Dialog open={isLinksDialogOpen} onOpenChange={setIsLinksDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="flex items-center gap-2">
               <LinkIcon className="h-5 w-5 text-orange-500" />
               Manage Affiliate Links: {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>Add or remove purchasing links for this product's variations.</DialogDescription>
          </DialogHeader>

          <div className="flex-grow overflow-auto p-6 space-y-8">
             {/* Link Form */}
             <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-sm font-bold mb-4 flex items-center">
                   {editingLink ? <Edit2 className="h-3.5 w-3.5 mr-2" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
                   {editingLink ? "Edit Link" : "Add New Link"}
                </h3>
                <form onSubmit={handleLinkSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label className="text-xs">Store *</Label>
                      <select value={linkStore} onChange={e => setLinkStore(e.target.value)} className="w-full h-9 px-2 rounded-md border border-zinc-200 bg-white text-xs">
                         {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs">Variation (SKU)</Label>
                      <select value={linkSkuId} onChange={e => setLinkSkuId(e.target.value)} className="w-full h-9 px-2 rounded-md border border-zinc-200 bg-white text-xs">
                         <option value="base">General (Base Product)</option>
                         {productSkus.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sku_code})</option>)}
                      </select>
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <Label className="text-xs">Affiliate URL *</Label>
                      <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} required placeholder="https://..." className="h-9 text-xs" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs">Price (Optional)</Label>
                      <Input type="number" value={linkPrice} onChange={e => setLinkPrice(e.target.value)} placeholder="e.g. 15000000" className="h-9 text-xs" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-xs">Commission Note</Label>
                      <Input value={linkCommission} onChange={e => setLinkCommission(e.target.value)} placeholder="e.g. 3% Cashback" className="h-9 text-xs" />
                   </div>
                   <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                      {editingLink && (
                        <Button type="button" variant="ghost" size="sm" onClick={resetLinkForm} className="h-8 text-xs">Cancel Edit</Button>
                      )}
                      <Button size="sm" className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white" disabled={isSavingLink}>
                         {isSavingLink && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                         {editingLink ? "Update Link" : "Add Link"}
                      </Button>
                   </div>
                </form>
             </div>

             {/* Links List */}
             <div className="space-y-3">
                <h3 className="text-sm font-bold flex items-center">
                   <LinkIcon className="h-3.5 w-3.5 mr-2" /> Existing Links
                </h3>
                {isLoadingLinks ? (
                   <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-zinc-300" /></div>
                ) : (
                   <div className="space-y-2">
                      {productLinks.map(link => {
                        const sku = productSkus.find(s => s.id === link.sku_id);
                        return (
                          <div key={link.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors bg-white dark:bg-zinc-950">
                             <div className="flex-grow min-w-0 pr-4">
                                <div className="flex items-center gap-2 mb-1">
                                   <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[10px] px-1.5 py-0">
                                      {link.store_name}
                                   </Badge>
                                   {sku && (
                                     <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-700">
                                        SKU: {sku.name}
                                     </Badge>
                                   )}
                                   {link.price && (
                                      <span className="text-xs font-bold text-emerald-600">
                                         {formatCurrency(link.price)}
                                      </span>
                                   )}
                                </div>
                                <a 
                                  href={link.affiliate_url} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-xs text-blue-500 hover:underline flex items-center gap-1 truncate"
                                >
                                   <ExternalLink className="h-3 w-3" />
                                   {link.affiliate_url}
                                </a>
                                {link.commission_note && (
                                  <div className="text-[10px] text-zinc-500 mt-1 italic">
                                     Note: {link.commission_note}
                                  </div>
                                )}
                             </div>
                             <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleLinkEdit(link)}><Edit2 className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteLink(link.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                             </div>
                          </div>
                        );
                      })}
                      {productLinks.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg text-zinc-400 text-sm">
                           No affiliate links configured for this product yet.
                        </div>
                      )}
                   </div>
                )}
             </div>
          </div>

          <DialogFooter className="p-4 border-t bg-zinc-50 dark:bg-zinc-900/50">
             <Button variant="outline" onClick={() => setIsLinksDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
