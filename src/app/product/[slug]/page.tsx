import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProductDetailClient } from "@/components/ProductDetailClient";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const product = await api.products.get(slug).catch(() => null);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Button><Link href="/">Go Home</Link></Button>
      </div>
    );
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || apiUrl.replace(/\/api$/, '').replace(/\/+$/, '');

  // Explicitly fetch images as requested
  const imagesRes = product ? await fetch(`${apiUrl}/products/${product.id}/images`, { 
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 } 
  }).catch(() => null) : null;
  
  let images = [];
  if (imagesRes && imagesRes.ok) {
    const data = await imagesRes.json();
    images = data.data || [];
  }

  // Find primary image from images array (is_primary === true) or fallback to thumbnail
  const primaryImage = images.find((img: any) => img.is_primary === true)?.image_url || product?.thumbnail;

  return (
    <ProductDetailClient 
      product={product} 
      images={images} 
      primaryImage={primaryImage} 
      baseUrl={baseUrl} 
    />
  );
}
