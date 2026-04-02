"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Category } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderTree, ArrowLeft, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.categories.list();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
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
        // Optimistic UI update
        const updated = await api.admin.categories.update(token, editingCategory.id, payload);
        setCategories(categories.map(c => c.id === updated.id ? updated : c));
        setSuccessMsg("Category updated successfully!");
      } else {
        const created = await api.admin.categories.create(token, payload);
        // Optimistic UI append
        setCategories([...categories, created].sort((a, b) => a.name.localeCompare(b.name)));
        setSuccessMsg("Category created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This will also delete all associated products and attributes. This action cannot be undone.")) return;
    
    // Optimistic UI removal
    const oldCategories = [...categories];
    setCategories(categories.filter(c => c.id !== id));
    
    try {
      const token = getToken();
      await api.admin.categories.delete(token, id);
      setSuccessMsg("Category deleted successfully!");
    } catch (err: any) {
      // Revert if failed
      setCategories(oldCategories);
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

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categories</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-24">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : (
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
                        No categories found. Click "Add Category" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
