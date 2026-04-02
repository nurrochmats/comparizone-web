"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Category } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, ArrowLeft, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// We need an interface for Attribute from the admin side (different from the public one)
export interface AdminAttribute {
    id: number;
    category_id: number;
    code: string;
    name: string;
    data_type: 'text' | 'number' | 'boolean' | 'option';
    input_type: string | null;
    is_filterable: boolean;
    is_required: boolean;
    is_multi_value: boolean;
    filter_strategy: string | null;
    unit: string | null;
    sort_order: number;
    category?: Category;
    options_count?: number;
    products_count?: number;
}

export default function AttributeManagementPage() {
  const router = useRouter();
  const [attributes, setAttributes] = useState<AdminAttribute[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttr, setEditingAttr] = useState<AdminAttribute | null>(null);
  
  // Form states
  const [categoryId, setCategoryId] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState<'text'|'number'|'boolean'|'option'>('text');
  const [unit, setUnit] = useState("");
  const [isFilterable, setIsFilterable] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const [attrs, cats] = await Promise.all([
        api.admin.attributes.list(token).then(res => res as AdminAttribute[]),
        api.categories.list()
      ]);
      setAttributes(attrs);
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
    setEditingAttr(null);
    setCategoryId("");
    setCode("");
    setName("");
    setDataType("text");
    setUnit("");
    setIsFilterable(true);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (a: AdminAttribute) => {
    setEditingAttr(a);
    setCategoryId(a.category_id.toString());
    setCode(a.code);
    setName(a.name);
    setDataType(a.data_type);
    setUnit(a.unit || "");
    setIsFilterable(a.is_filterable);
    setError(null);
    setSuccessMsg(null);
    setIsDialogOpen(true);
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
        category_id: parseInt(categoryId),
        code,
        name,
        data_type: dataType,
        unit: unit || null,
        is_filterable: isFilterable,
      };

      if (editingAttr) {
        const updated = await api.admin.attributes.update(token, editingAttr.id, payload) as AdminAttribute;
        
        const cat = categories.find(c => c.id === updated.category_id);
        if(cat && !updated.category) updated.category = cat;
        
        setAttributes(attributes.map(a => a.id === updated.id ? updated : a));
        setSuccessMsg("Attribute updated successfully!");
      } else {
        const created = await api.admin.attributes.create(token, payload) as AdminAttribute;
        
        const cat = categories.find(c => c.id === created.category_id);
        if(cat && !created.category) created.category = cat;
        
        setAttributes([...attributes, created]);
        setSuccessMsg("Attribute created successfully!");
      }
      setIsDialogOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save attribute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this attribute? This action cannot be undone.")) return;
    
    const old = [...attributes];
    setAttributes(attributes.filter(a => a.id !== id));
    
    try {
      const token = getToken();
      await api.admin.attributes.delete(token, id);
      setSuccessMsg("Attribute deleted successfully!");
    } catch (err: any) {
      setAttributes(old);
      setError(err.message || "Failed to delete attribute");
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
            <Settings2 className="h-5 w-5 text-blue-600" />
            Attribute Management
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
          <h1 className="text-2xl font-bold">Attributes</h1>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Attribute
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
                    <TableHead>Category</TableHead>
                    <TableHead>Attribute</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Filterable</TableHead>
                    <TableHead className="text-center">Options</TableHead>
                    <TableHead className="text-center">Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attributes.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.category?.name || a.category_id}</TableCell>
                      <TableCell className="font-medium">
                        <div>{a.name}</div>
                        <div className="text-xs text-zinc-500 font-mono">{a.code}</div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                            {a.data_type}
                        </span>
                      </TableCell>
                      <TableCell>{a.unit || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 flex w-max rounded-md text-xs font-medium ${a.is_filterable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {a.is_filterable ? 'Yes' : 'No'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs font-medium">
                          {a.data_type === 'option' ? (a.options_count ?? 0) : '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">
                          {a.products_count ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(a)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {attributes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-zinc-500">
                        No attributes found. Click "Add Attribute" to create one.
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
            <DialogTitle>{editingAttr ? "Edit Attribute" : "Add New Attribute"}</DialogTitle>
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
                <Label htmlFor="name">Attribute Name *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Screen Size" required />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="code">Code (Identifier) *</Label>
                <Input id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. screen_size" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dataType">Data Type *</Label>
                <select 
                  id="dataType" 
                  value={dataType} 
                  onChange={e => setDataType(e.target.value as any)} 
                  required
                  className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                >
                  <option value="text">Text / String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean (Yes/No)</option>
                  <option value="option">Dropdown Option</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit (optional)</Label>
                <Input id="unit" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. inch, GB, mAh" />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isFilterable" 
                  checked={isFilterable} 
                  onChange={e => setIsFilterable(e.target.checked)} 
                  className="h-4 w-4"
                />
                <Label htmlFor="isFilterable" className="cursor-pointer">Can be used as a Filter</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingAttr ? "Save Changes" : "Create Attribute"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
