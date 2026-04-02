"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone, ArrowLeft, Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const PLACEMENTS = [
  { value: 'homepage_top', label: 'Homepage — Top' },
  { value: 'homepage_sidebar', label: 'Homepage — Sidebar' },
  { value: 'product_page', label: 'Product Page' },
  { value: 'compare_page', label: 'Compare Page' },
];

interface Ad {
  id: number;
  title: string;
  placement: string;
  image_url: string;
  target_url: string;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
}

export default function AdsManagementPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [placement, setPlacement] = useState("homepage_top");
  const [imageUrl, setImageUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); throw new Error("Unauthorized"); }
    return token;
  };

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/ads`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );
      const data = await res.json();
      setAds(data.data ?? []);
    } catch (err: any) {
      setError(err.message || "Failed to load ads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const openCreate = () => {
    setEditingAd(null);
    setTitle(""); setPlacement("homepage_top"); setImageUrl("");
    setTargetUrl(""); setStartDate(""); setEndDate(""); setIsActive(true);
    setError(null); setIsDialogOpen(true);
  };

  const openEdit = (ad: Ad) => {
    setEditingAd(ad);
    setTitle(ad.title); setPlacement(ad.placement); setImageUrl(ad.image_url);
    setTargetUrl(ad.target_url); setStartDate(ad.start_date ?? ""); setEndDate(ad.end_date ?? "");
    setIsActive(ad.is_active);
    setError(null); setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); setError(null);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
    const payload = {
      title, placement, image_url: imageUrl, target_url: targetUrl,
      start_date: startDate || null, end_date: endDate || null, is_active: isActive
    };
    try {
      const token = getToken();
      const res = await fetch(
        editingAd ? `${baseUrl}/admin/ads/${editingAd.id}` : `${baseUrl}/admin/ads`,
        { method: editingAd ? "PUT" : "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) }
      );
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Failed to save"); }
      const saved = (await res.json()).data;
      if (editingAd) setAds(ads.map(a => a.id === saved.id ? saved : a));
      else setAds([saved, ...ads]);
      setSuccessMsg(editingAd ? "Ad updated!" : "Ad created!");
      setIsDialogOpen(false);
    } catch (err: any) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ad?")) return;
    const old = [...ads]; setAds(ads.filter(a => a.id !== id));
    try {
      const token = getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/admin/ads/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      setSuccessMsg("Ad deleted!");
    } catch (err: any) { setAds(old); setError(err.message); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4 font-bold text-lg">
          <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <Megaphone className="h-5 w-5 text-blue-600" /> Ad Banner Management
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {error && !isDialogOpen && <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>}
        {successMsg && !isDialogOpen && <div className="mb-4 p-4 bg-green-50 text-green-600 border border-green-200 rounded-md">{successMsg}</div>}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Ad Banners</h1>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Add Ad</Button>
        </div>
        <Card className="bg-white dark:bg-zinc-950">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Title</TableHead><TableHead>Placement</TableHead>
                  <TableHead>Date Range</TableHead><TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {ads.map(ad => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">
                        <div>{ad.title}</div>
                        <a href={ad.target_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[250px]">{ad.target_url}</a>
                      </TableCell>
                      <TableCell><span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded text-xs">{PLACEMENTS.find(p => p.value === ad.placement)?.label ?? ad.placement}</span></TableCell>
                      <TableCell className="text-xs text-zinc-500">{ad.start_date ?? "—"} → {ad.end_date ?? "—"}</TableCell>
                      <TableCell><span className={`px-2 py-1 text-xs rounded font-medium ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>{ad.is_active ? "Active" : "Inactive"}</span></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(ad)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(ad.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ads.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center py-8 text-zinc-500">No ads yet. Click "Add Ad" to create one.</TableCell></TableRow>)}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>{editingAd ? "Edit Ad" : "New Ad Banner"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-3 py-4 max-h-[65vh] overflow-y-auto px-1">
              {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
              <div className="grid gap-1"><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div className="grid gap-1">
                <Label>Placement *</Label>
                <select value={placement} onChange={e => setPlacement(e.target.value)} className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950">
                  {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="grid gap-1"><Label>Image URL *</Label><Input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required placeholder="https://..." /></div>
              <div className="grid gap-1"><Label>Target URL *</Label><Input type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)} required placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1"><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div className="grid gap-1"><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" id="active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4" /><Label htmlFor="active" className="cursor-pointer">Active</Label></div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{editingAd ? "Save Changes" : "Create Ad"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
