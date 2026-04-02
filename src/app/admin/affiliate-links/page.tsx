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

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); throw new Error("Unauthorized"); }
    return token;
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const prods = await api.products.list();
      setProducts(prods);
      // Fetch all affiliate links by aggregating across products or fetch from a dedicated endpoint
      // Using search with no filter for now; a dedicated endpoint can be added later
      const res = await fetch(`${BASE_URL}/admin/affiliate-links`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        setLinks(data.data ?? []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

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
      let savedLink: AffiliateLink;
      if (editingLink) {
        const res = await fetch(`${BASE_URL}/affiliate-links/${editingLink.id}`, {
          method: "PUT", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to save");
        savedLink = (await res.json()).data;
        setLinks(links.map(l => l.id === savedLink.id ? { ...l, ...savedLink } : l));
      } else {
        const res = await fetch(`${BASE_URL}/products/${productId}/affiliate-links`, {
          method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...payload, product_id: parseInt(productId) })
        });
        if (!res.ok) throw new Error((await res.json()).message || "Failed to save");
        savedLink = (await res.json()).data;
        const prod = products.find(p => p.id === parseInt(productId));
        setLinks([{ ...savedLink, product: prod ? { name: prod.name } : undefined }, ...links]);
      }
      setSuccessMsg(editingLink ? "Link updated!" : "Link created!"); setIsDialogOpen(false);
    } catch (err: any) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this affiliate link?")) return;
    const old = [...links]; setLinks(links.filter(l => l.id !== id));
    try {
      const token = getToken();
      await fetch(`${BASE_URL}/affiliate-links/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setSuccessMsg("Link deleted!");
    } catch (err: any) { setLinks(old); setError(err.message); }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Affiliate Links</h1>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Link</Button>
        </div>
        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>Store</TableHead>
                  <TableHead>URL</TableHead><TableHead>Commission</TableHead>
                  <TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {links.map(link => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.product?.name ?? `Product #${link.product_id}`}</TableCell>
                      <TableCell><span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded text-xs font-medium">{link.store_name}</span></TableCell>
                      <TableCell><a href={link.affiliate_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-500 hover:underline max-w-[200px] truncate"><ExternalLink className="h-3 w-3 flex-shrink-0" />{link.affiliate_url}</a></TableCell>
                      <TableCell className="text-xs text-zinc-500 max-w-[150px] truncate">{link.commission_note ?? "-"}</TableCell>
                      <TableCell><span className={`px-2 py-1 text-xs rounded font-medium ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>{link.is_active ? "Active" : "Inactive"}</span></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(link)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(link.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {links.length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-8 text-zinc-500">No affiliate links yet. Click "Add Link".</TableCell></TableRow>)}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>{editingLink ? "Edit Affiliate Link" : "Add Affiliate Link"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto px-1">
              {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
              {!editingLink && (
                <div className="grid gap-1">
                  <Label>Product *</Label>
                  <select value={productId} onChange={e => setProductId(e.target.value)} required className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
                    <option value="" disabled>Select product…</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid gap-1">
                <Label>Store *</Label>
                <select value={storeName} onChange={e => setStoreName(e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
                  {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid gap-1"><Label>Affiliate URL *</Label><Input type="url" value={affiliateUrl} onChange={e => setAffiliateUrl(e.target.value)} required placeholder="https://..." /></div>
              <div className="grid gap-1"><Label>Commission Note</Label><Input value={commissionNote} onChange={e => setCommissionNote(e.target.value)} placeholder="e.g. Up to 3% commission" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" /><Label htmlFor="active" className="cursor-pointer">Active</Label></div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingLink ? "Save Changes" : "Create Link"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
