"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Product } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageIcon, ArrowLeft, Loader2, Plus, Trash2, Star } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getImageUrl } from "@/lib/utils";

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export default function ProductImagesPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [makePrimary, setMakePrimary] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const getToken = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); throw new Error("Unauthorized"); }
    return token;
  };

  useEffect(() => {
    api.products.list().then(setProducts).catch(console.error);
  }, []);

  const loadImages = async (productId: number) => {
    setIsLoading(true);
    setSelectedProductId(productId);
    setImages([]);
    try {
      const res = await api.products.getImages(productId);
      setImages(res || []);
    } catch (err: any) { setError("Failed to load images"); }
    finally { setIsLoading(false); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedProductId) return;
    setIsUploading(true); setError(null);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("is_primary", makePrimary ? "1" : "0");
    try {
      const token = getToken();
      // Using direct fetch for FormData upload as api-client might not handle FormData yet for this specific endpoint
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
      const res = await fetch(`${BASE_URL}/products/${selectedProductId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Upload failed"); }
      const uploaded = (await res.json()).data;
      if (makePrimary) setImages(imgs => imgs.map(i => ({ ...i, is_primary: false })));
      setImages(imgs => [...imgs, uploaded].sort((a, b) => a.sort_order - b.sort_order));
      setSuccessMsg("Image uploaded!"); setIsDialogOpen(false); setSelectedFile(null);
    } catch (err: any) { setError(err.message); }
    finally { setIsUploading(false); }
  };

  const setPrimary = async (image: ProductImage) => {
    if (!selectedProductId) return;
    try {
      const token = getToken();
      await api.admin.images.update(token, selectedProductId, image.id, { is_primary: true });
      setImages(imgs => imgs.map(i => ({ ...i, is_primary: i.id === image.id })));
      setSuccessMsg("Primary image updated!");
    } catch (err: any) {
      setError(err.message || "Failed to set primary image");
    }
  };

  const handleDelete = async (image: ProductImage) => {
    if (!selectedProductId || !confirm("Delete this image?")) return;
    const old = [...images]; setImages(images.filter(i => i.id !== image.id));
    try {
      const token = getToken();
      await api.admin.images.delete(token, selectedProductId, image.id);
      setSuccessMsg("Image deleted!");
    } catch (err: any) { setImages(old); setError(err.message); }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-12">
      <header className="bg-white dark:bg-zinc-950 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4 font-bold text-lg">
          <Button variant="ghost" size="icon" asChild><Link href="/admin"><ArrowLeft className="h-4 w-4" /></Link></Button>
          <ImageIcon className="h-5 w-5 text-blue-600" /> Product Images
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 border border-red-200 rounded-md">{error}</div>}
        {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-600 border border-green-200 rounded-md">{successMsg}</div>}

        <div className="mb-6">
          <Label htmlFor="product-select" className="mb-2 block text-base font-semibold">Select Product</Label>
          <div className="flex gap-3">
            <select id="product-select"
              className="flex h-10 w-full max-w-sm rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
              value={selectedProductId ?? ""} onChange={e => loadImages(Number(e.target.value))}>
              <option value="" disabled>Choose a product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {selectedProductId && (
              <Button onClick={() => { setSelectedFile(null); setMakePrimary(false); setError(null); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Upload Image
              </Button>
            )}
          </div>
        </div>

        {selectedProduct && (
          <div>
            <h2 className="text-xl font-bold mb-4">Images for: {selectedProduct.name}</h2>
            {isLoading ? (
              <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-zinc-400" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(img => (
                  <Card key={img.id} className={`bg-white dark:bg-zinc-950 overflow-hidden ${img.is_primary ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="relative aspect-square bg-zinc-100 flex items-center justify-center">
                      {imageErrors[img.id] ? (
                        <div className="flex flex-col items-center justify-center text-zinc-400 p-4 text-center">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                          <span className="text-xs font-medium">Image Not Found</span>
                        </div>
                      ) : (
                        <img
                          src={getImageUrl(img.image_url)}
                          alt="product image"
                          className="object-contain p-2 absolute inset-0 w-full h-full"
                          onError={() => setImageErrors(prev => ({ ...prev, [img.id]: true }))}
                        />
                      )}
                      {img.is_primary && (
                        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Star className="h-3 w-3" /> Primary
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2 flex gap-1">
                      {!img.is_primary && (
                        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setPrimary(img)}>
                          <Star className="h-3 w-3 mr-1" /> Set Primary
                        </Button>
                      )}
                      <Button variant="destructive" size="sm" className="flex-1 text-xs text-white" onClick={() => handleDelete(img)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {images.length === 0 && (
                  <div className="col-span-full text-center py-16 text-zinc-500">
                    No images yet. Click "Upload Image" to add some.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Upload Product Image</DialogTitle></DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="grid gap-4 py-4">
              {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
              <div className="grid gap-2">
                <Label htmlFor="file">Image File * (JPEG, PNG, WebP · max 2MB)</Label>
                <input id="file" type="file" accept="image/jpeg,image/png,image/webp"
                  required className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="primary" checked={makePrimary} onChange={e => setMakePrimary(e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="primary" className="cursor-pointer">Set as Primary Image</Label>
              </div>
              {selectedFile && (
                <div className="text-xs text-zinc-500">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUploading}>Cancel</Button>
              <Button type="submit" disabled={isUploading || !selectedFile}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
