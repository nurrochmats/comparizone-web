import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("Rp", "Rp.");
}

export function getImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const baseUrl = apiUrl.replace(/\/api$/, '').replace(/\/+$/, '');
  
  const path = url.startsWith('/') ? url : `/${url}`;
  
  if (!path.startsWith('/storage/')) {
    return `${baseUrl}/storage${path}`;
  }

  return `${baseUrl}${path}`;
}
