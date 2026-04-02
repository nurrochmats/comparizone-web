"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Product, Category } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft, Loader2, Plus, Edit2, Trash2, Layers } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Data Table states
  const [globalSearch, setGlobalSearch] = useState("");
  const [columnSearch, setColumnSearch] = useState({ name: "", category: "", brand: "" });
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'id', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.products.list(),
        api.categories.list()
      ]);
      setProducts(prods);
      setCategories(cats);
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
    setEditingProduct(null);
    setName("");
    setSlug("");
    setCategoryId("");
    setBrand("");
    setPriceMin("");
    setPriceMax("");
    setThumbnail("");
    setIsActive(true);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setCategoryId(p.category?.id?.toString() || "");
    setBrand(p.brand || "");
    setPriceMin(p.price_min?.toString() || "");
    setPriceMax(p.price_max?.toString() || "");
    setThumbnail(p.thumbnail || "");
    setIsActive((p as any).is_active ?? true);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
  };

  // Generate SEO-friendly slug
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-');    // Replace multiple - with single -
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Auto-generate slug only if creating a new product
    // OR if the slug is completely empty while editing
    if (!editingProduct || slug === "") {
      setSlug(generateSlug(newName));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
       setError("Category is required");
       return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const token = getToken();
      const payload = {
        name,
        slug: slug || generateSlug(name), // Fallback in case it's empty
        category_id: parseInt(categoryId),
        brand: brand || undefined,
        price_min: priceMin ? parseInt(priceMin) : null,
        price_max: priceMax ? parseInt(priceMax) : null,
        thumbnail: thumbnail || null,
        is_active: isActive
      };

      if (editingProduct) {
        const updated = await api.admin.products.update(token, editingProduct.id, payload);
        const cat = categories.find(c => c.id === updated.category_id || c.id === updated.category?.id);
        if(cat && !updated.category) updated.category = cat;
        setProducts(products.map(p => p.id === updated.id ? updated : p));
        setSuccessMsg("Product updated successfully!");
      } else {
        const created = await api.admin.products.create(token, payload);
        const cat = categories.find(c => c.id === created.category_id || c.id === created.category?.id);
        if(cat && !created.category) created.category = cat;
        setProducts([created, ...products]);
        setSuccessMsg("Product created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    const old = [...products];
    setProducts(products.filter(p => p.id !== id));
    
    try {
      const token = getToken();
      await api.admin.products.delete(token, id);
      setSuccessMsg("Product deleted successfully!");
    } catch (err: any) {
      setProducts(old);
      setError(err.message || "Failed to delete product");
    }
  };

  // --- Data Table processing ---
  
  // 1. Filter
  const filteredProducts = products.filter(p => {
    const matchGlobal = globalSearch === "" || 
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(globalSearch.toLowerCase()) ||
      (p.category?.name || "").toLowerCase().includes(globalSearch.toLowerCase());
      
    const matchName = columnSearch.name === "" || p.name.toLowerCase().includes(columnSearch.name.toLowerCase());
    const matchCategory = columnSearch.category === "" || (p.category?.name || "").toLowerCase().includes(columnSearch.category.toLowerCase());
    const matchBrand = columnSearch.brand === "" || (p.brand || "").toLowerCase().includes(columnSearch.brand.toLowerCase());
    
    return matchGlobal && matchName && matchCategory && matchBrand;
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, columnSearch, sortConfig]);

  // 2. Sort
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    
    if (sortConfig.key === 'category') {
      aVal = a.category?.name || "";
      bVal = b.category?.name || "";
    }
    
    if (aVal === bVal) return 0;
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (sortConfig.direction === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // 3. Paginate
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 font-bold text-lg">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Package className="h-5 w-5 text-blue-600" />
            Product Management
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        
        {error && !isDialogOpen && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">
            {error}
          </div>
        )}
        {successMsg && !isDialogOpen && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 border border-green-200 rounded-md">
            {successMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Products</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Input 
              placeholder="Search all columns..." 
              value={globalSearch} 
              onChange={e => setGlobalSearch(e.target.value)}
              className="w-full sm:w-64"
            />
            <select 
              className="flex h-10 w-full sm:w-[180px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
              value={`${sortConfig.key}-${sortConfig.direction}`}
              onChange={(e) => {
                const [key, direction] = e.target.value.split('-');
                setSortConfig({ key, direction: direction as 'asc'|'desc' });
              }}
            >
              <option value="id-desc">Newest First</option>
              <option value="id-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price_min-asc">Price (Low to High)</option>
              <option value="price_min-desc">Price (High to Low)</option>
              <option value="category-asc">Category (A-Z)</option>
              <option value="brand-asc">Brand (A-Z)</option>
            </select>
            <Button onClick={openCreateDialog} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        </div>

        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price Min</TableHead>
                      <TableHead className="text-center">Images</TableHead>
                      <TableHead className="text-center">Links</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/20">
                      <TableHead className="py-2"><Input placeholder="Filter Name..." value={columnSearch.name} onChange={e => setColumnSearch({...columnSearch, name: e.target.value})} className="h-8 text-xs max-w-[200px]" /></TableHead>
                      <TableHead className="py-2"><Input placeholder="Filter Category..." value={columnSearch.category} onChange={e => setColumnSearch({...columnSearch, category: e.target.value})} className="h-8 text-xs max-w-[150px]" /></TableHead>
                      <TableHead className="py-2"><Input placeholder="Filter Brand..." value={columnSearch.brand} onChange={e => setColumnSearch({...columnSearch, brand: e.target.value})} className="h-8 text-xs max-w-[150px]" /></TableHead>
                      <TableHead colSpan={4}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          <div>{p.name}</div>
                          <div className="text-xs text-zinc-500 font-mono">{p.slug}</div>
                        </TableCell>
                        <TableCell>{p.category?.name || "-"}</TableCell>
                        <TableCell>{p.brand || "-"}</TableCell>
                        <TableCell>{p.price_min ? `Rp ${p.price_min.toLocaleString('id-ID')}` : "-"}</TableCell>
                        <TableCell className="text-center">
                          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {p.images_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {p.affiliate_links_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" asChild title="Manage SKUs, Variants & Specifications">
                            <Link href={`/admin/products/${p.id}/skus`}>
                              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(p)} title="Edit Product Info">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                          {products.length === 0 ? 'No products found. Click "Add Product" to create one.' : 'No products matched your search filters.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                {/* Pagination Controls */}
                {sortedProducts.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="text-sm text-zinc-500 mb-4 sm:mb-0">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm font-medium px-2">
                        Page {currentPage} of {Math.max(1, totalPages)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage >= totalPages || totalPages === 0}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              {error && isDialogOpen && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <select 
                  id="category" 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)} 
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus:ring-zinc-300"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={handleNameChange} required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated if empty" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Apple" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priceMin">Price Min (Rp)</Label>
                  <Input id="priceMin" type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priceMax">Price Max (Rp)</Label>
                  <Input id="priceMax" type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
                <Input id="thumbnail" type="url" value={thumbnail} onChange={e => setThumbnail(e.target.value)} placeholder="https://..." />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active Product</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
