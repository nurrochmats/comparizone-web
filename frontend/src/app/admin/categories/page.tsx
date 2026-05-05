"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Category } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderTree, ArrowLeft, Loader2, Plus, Edit2, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pagination } from "@/components/Pagination";

export default function CategoryManagementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const getToken = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("admin_token") : null;
    if (!token) {
      router.push("/login");
      throw new Error("Unauthorized");
    }
    return token;
  };

  const fetchCategories = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const token = getToken();
      const params: any = { page, per_page: itemsPerPage };
      if (search) params.search = search;

      const res = await api.admin.categories.list(token, params);
      setCategories(res.data || []);
      setTotalItems(res.meta?.total || res.total || 0);
      setTotalPages(res.meta?.last_page || res.last_page || 0);
      setCurrentPage(res.meta?.current_page || res.current_page || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, searchQuery);
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategories(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsActive(true);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setIsActive((category as any).is_active ?? true);
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
      const payload = {
        name,
        slug: slug || undefined, // Allow backend to auto-generate if empty
        description,
        is_active: isActive
      };

      if (editingCategory) {
        await api.admin.categories.update(token, editingCategory.id, payload);
        setSuccessMsg("Category updated successfully!");
      } else {
        await api.admin.categories.create(token, payload);
        setSuccessMsg("Category created successfully!");
      }
      setIsDialogOpen(false);
      fetchCategories(currentPage, searchQuery);
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all associated products and attributes. This action cannot be undone.")) return;
    
    try {
      const token = getToken();
      await api.admin.categories.delete(token, id);
      setSuccessMsg("Category deleted successfully!");
      fetchCategories(currentPage, searchQuery);
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 font-bold text-lg">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <FolderTree className="h-5 w-5 text-blue-600" />
            Category Management
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Categories</h1>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search categories..." 
                className="pl-10" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={openCreateDialog} className="whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
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
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Products</TableHead>
                      <TableHead className="text-center">Attributes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-zinc-500 font-mono text-xs">{category.slug}</TableCell>
                        <TableCell className="max-w-[300px] truncate text-zinc-500">
                          {category.description || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {category.products_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {category.attributes_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {categories.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-zinc-500">
                          No categories found.
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
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && isDialogOpen && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated if empty" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
