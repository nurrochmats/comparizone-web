"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Megaphone, ArrowLeft, Loader2, Plus, Edit2, Trash2, Search } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

const PLACEMENTS = [
  { value: 'homepage_top', label: 'Homepage — Top' },
  { value: 'homepage_sidebar', label: 'Homepage — Sidebar' },
  { value: 'product_page', label: 'Product Page' },
  { value: 'compare_page', label: 'Compare Page' },
  { value: 'footerads', label: 'Footer Ads' },
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
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); throw new Error("Unauthorized"); }
    return token;
  };

  const fetchAds = async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const token = getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
      const res = await fetch(
        `${baseUrl}/admin/ads?page=${page}&search=${search}&per_page=${itemsPerPage}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
      );
      const data = await res.json();
      
      // Laravel Pagination structure
      setAds(data.data ?? []);
      setTotalItems(data.total ?? 0);
      setTotalPages(data.last_page ?? 0);
      setCurrentPage(data.current_page ?? 1);
    } catch (err: any) {
      setError(err.message || "Failed to load ads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchAds(currentPage, searchQuery); 
  }, [currentPage]);

  // Handle search with reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAds(1, searchQuery);
    }, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openCreate = () => {
    setEditingAd(null);
    setTitle(""); setPlacement("homepage_top"); setImageUrl("");
    setTargetUrl(""); setStartDate(""); setEndDate(""); setIsActive(true);
    setError(null); setIsDialogOpen(true);
  };

  const openEdit = (ad: Ad) => {
    setEditingAd(ad);
    setTitle(ad.title); 
    setPlacement(ad.placement); 
    setImageUrl(ad.image_url);
    setTargetUrl(ad.target_url);
    
    // Format dates to YYYY-MM-DD for <input type="date">
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "";
      return dateStr.split('T')[0];
    };
    
    setStartDate(formatDate(ad.start_date)); 
    setEndDate(formatDate(ad.end_date));
    setIsActive(ad.is_active);
    setError(null); 
    setIsDialogOpen(true);
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
      
      setSuccessMsg(editingAd ? "Ad updated!" : "Ad created!");
      setIsDialogOpen(false);
      fetchAds(currentPage, searchQuery); // Refetch current page
    } catch (err: any) { setError(err.message); }
    finally { setIsSubmitting(false); }
  };
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;
    try {
      const token = getToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
      const res = await fetch(`${baseUrl}/admin/ads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (!res.ok) throw new Error("Failed to delete ad");
      setSuccessMsg("Ad deleted!");
      fetchAds(currentPage, searchQuery);
    } catch (err: any) { setError(err.message); }
  };

  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }).replace(/ /g, '-');
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Ad Banners</h1>
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Search ads..." 
                className="pl-10" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={openCreate} className="whitespace-nowrap"><Plus className="mr-2 h-4 w-4" /> Add Ad</Button>
          </div>
        </div>
        <DataTable 
          data={ads}
          isLoading={isLoading}
          columns={[
            {
              header: "Title",
              cell: (ad) => (
                <div className="py-1">
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{ad.title}</div>
                  <a 
                    href={ad.target_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-blue-500 hover:underline truncate block max-w-[250px] font-medium"
                  >
                    {ad.target_url}
                  </a>
                </div>
              )
            },
            {
              header: "Placement",
              cell: (ad) => (
                <span className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100 dark:border-blue-900/50">
                  {PLACEMENTS.find(p => p.value === ad.placement)?.label ?? ad.placement}
                </span>
              )
            },
            {
              header: "Date Range",
              cell: (ad) => (
                <div className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">{formatDateDisplay(ad.start_date)}</span>
                  <span className="text-zinc-300">→</span>
                  <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded">{formatDateDisplay(ad.end_date)}</span>
                </div>
              )
            },
            {
              header: "Status",
              cell: (ad) => (
                <span className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                  ad.is_active 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", ad.is_active ? "bg-emerald-500" : "bg-zinc-400")} />
                  {ad.is_active ? "Active" : "Inactive"}
                </span>
              )
            },
            {
              header: "Actions",
              className: "text-right",
              cell: (ad) => (
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900" onClick={() => openEdit(ad)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30" onClick={() => handleDelete(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          emptyMessage="No advertisements found matching your search."
        />

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
