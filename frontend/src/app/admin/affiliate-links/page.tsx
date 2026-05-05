"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Product } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as LinkIcon, ArrowLeft, Loader2, Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pagination } from "@/components/Pagination";

const STORES = ["Amazon", "Shopee", "Tokopedia", "Lazada", "Blibli", "JD.id", "Other"];

interface AffiliateLink {
  id: number;
  product_id: number;
  store_name: string;
  affiliate_url: string;
  commission_note: string | null;
  is_active: boolean;
  product?: { name: string };
}

export default function AffiliateLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);

  // Form state
  const [productId, setProductId] = useState("");
  const [storeName, setStoreName] = useState("Shopee");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [commissionNote, setCommissionNote] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); throw new Error("Unauthorized"); }
    return token;
  };

  const fetchProducts = async () => {
    try {
      const prods = await api.products.list();
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  const fetchLinks = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const token = getToken();
      const params: any = { page, per_page: itemsPerPage };
      if (search) params.search = search;

      const res = await api.admin.affiliateLinks.list(token, params);
      // Since Res is paginated, it has data and meta/links
      setLinks(res.data || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.last_page || 0);
      setCurrentPage(res.current_page || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchLinks(currentPage, searchQuery);
  }, [currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLinks(1, searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCreate = () => {
    setEditingLink(null); setProductId(""); setStoreName("Shopee");
    setAffiliateUrl(""); setCommissionNote(""); setIsActive(true);
    setError(null); setIsDialogOpen(true);
  };

  const openEdit = (link: AffiliateLink) => {
    setEditingLink(link); setProductId(link.product_id.toString()); setStoreName(link.store_name);
    setAffiliateUrl(link.affiliate_url); setCommissionNote(link.commission_note ?? ""); setIsActive(link.is_active);
    setError(null); setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId && !editingLink) { setError("Product is required"); return; }
    setIsSubmitting(true); setError(null);
    const payload = { store_name: storeName, affiliate_url: affiliateUrl, commission_note: commissionNote || null, is_active: isActive };
    try {
      const token = getToken();
      if (editingLink) {
        await api.admin.affiliateLinks.update(token, editingLink.id, payload);
      } else {
        await api.admin.affiliateLinks.create(token, parseInt(productId), payload);
      }
      setSuccessMsg(editingLink ? "Link updated!" : "Link created!"); 
      setIsDialogOpen(false);
      fetchLinks(currentPage, searchQuery);
    } catch (err: any) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this affiliate link?")) return;
    try {
      const token = getToken();
      await api.admin.affiliateLinks.delete(token, id);
      setSuccessMsg("Link deleted!");
      fetchLinks(currentPage, searchQuery);
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4 font-bold text-lg">
          <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <LinkIcon className="h-5 w-5 text-blue-600" /> Affiliate Links
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {error && !isDialogOpen && <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>}
        {successMsg && !isDialogOpen && <div className="mb-4 p-4 bg-green-50 text-green-600 border border-green-200 rounded-md">{successMsg}</div>}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Affiliate Links</h1>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <Input 
              placeholder="Search product or store..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="flex h-10 w-full sm:w-36 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button onClick={openCreate} className="whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> Add Link</Button>
          </div>
        </div>

        <Card className="bg-white dark:bg-zinc-950 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-3">Product</TableHead>
                      <TableHead className="px-4 py-3">Store</TableHead>
                      <TableHead className="px-4 py-3">URL</TableHead>
                      <TableHead className="px-4 py-3">Commission</TableHead>
                      <TableHead className="px-4 py-3 text-center">Status</TableHead>
                      <TableHead className="px-4 py-3 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map(link => (
                      <TableRow key={link.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <TableCell className="px-4 py-3 font-medium">{link.product?.name ?? `Product #${link.product_id}`}</TableCell>
                        <TableCell className="px-4 py-3">
                          <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide">
                            {link.store_name}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <a href={link.affiliate_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline max-w-[200px] truncate">
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            {link.affiliate_url}
                          </a>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-xs text-zinc-500 max-w-[150px] truncate">{link.commission_note ?? "-"}</TableCell>
                        <TableCell className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 text-xs rounded-md font-semibold ${link.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                            {link.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(link)} aria-label="Edit Link"><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(link.id)} aria-label="Delete Link"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {links.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-zinc-500">
                           No affiliate links found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>{editingLink ? "Edit Affiliate Link" : "Add Affiliate Link"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
              {!editingLink && (
                <div className="grid gap-2">
                  <Label>Product <span className="text-red-500">*</span></Label>
                  <select value={productId} onChange={e => setProductId(e.target.value)} required className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
                    <option value="" disabled>Select product…</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid gap-2">
                <Label>Store <span className="text-red-500">*</span></Label>
                <select value={storeName} onChange={e => setStoreName(e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
                  {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Affiliate URL <span className="text-red-500">*</span></Label>
                <Input type="url" value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)} required placeholder="https://..." />
              </div>
              <div className="grid gap-2">
                <Label>Commission Note</Label>
                <Input value={commissionNote} onChange={e => setCommissionNote(e.target.value)} placeholder="e.g. Up to 3% commission" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-zinc-300" />
                <Label htmlFor="active" className="cursor-pointer">Set as Active</Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingLink ? "Save Changes" : "Create Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
