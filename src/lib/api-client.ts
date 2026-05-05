export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  attributes_count?: number;
  products_count?: number;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string | null;
  price_min: number | null;
  price_max: number | null;
  thumbnail: string | null;
  category_id?: number;
  category: Category;
  affiliate_links_count?: number;
  images_count?: number;
  clicks_count?: number;
}

export interface Attribute {
  code: string;
  name: string;
  value: string | number | boolean | null;
  unit: string | null;
  modifier?: string | null;
}

export interface ProductSku {
  id: number;
  product_id: number;
  sku_code: string;
  name: string;
  base_price: number | null;
  is_active: boolean;
  attributes?: Record<string, Attribute>;
  affiliate_links?: AffiliateLink[];
}

export interface AffiliateLink {
  id: number;
  product_id: number;
  product_name: string | null;
  store_name: string;
  affiliate_url: string;
  price: number | null;
  image_url: string | null;
  commission_note: string | null;
  sku_id?: number | null;
  is_active: boolean;
  product?: {
    id: number;
    name: string;
  };
}

export interface ProductDetail extends Product {
  attributes: Record<string, Attribute>;
  affiliate_links?: AffiliateLink[];
  skus?: ProductSku[];
  images?: {
    id: number;
    image_url: string;
    is_primary: boolean;
  }[];
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  total_attributes: number;
  total_clicks: number;
  latest_products: Product[];
}

export const api = {
  categories: {
    list: () => apiClient('/categories').then((res) => res.data as Category[]),
    nav: () => apiClient('/categories/nav').then((res) => res.data as { name: string; href: string }[]),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiClient('/products' + qs).then((res) => res.data as Product[]);
    },
    get: (slug: string) => apiClient(`/products/${slug}`).then((res) => res.data as ProductDetail),
    getImages: (productId: number) => apiClient(`/products/${productId}/images`).then((res) => res.data as { id: number; product_id: number; image_url: string; is_primary: boolean; sort_order: number; }[]),
  },
  filter: {
    apply: (category: string, filters: any[], search?: string, sort?: string) =>
      apiClient('/filter', {
        method: 'POST',
        body: JSON.stringify({ category, filters, search, sort }),
      }).then((res) => res.data as Product[]),
  },
  compare: {
    products: (productIds: number[]) =>
      apiClient('/compare', {
        method: 'POST',
        body: JSON.stringify({ products: productIds }),
      }).then((res) => res.data as ProductDetail[]),
  },
  admin: {
    dashboard: (token: string) =>
      apiClient('/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.data as DashboardStats),
    categories: {
      list: (token: string, params?: Record<string, any>) => {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return apiClient('/admin/categories' + qs, { headers: { Authorization: `Bearer ${token}` } });
      },
      create: (token: string, data: Partial<Category>) =>
        apiClient('/categories', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res.data as Category),
      update: (token: string, id: number, data: Partial<Category>) =>
        apiClient(`/categories/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res.data as Category),
      delete: (token: string, id: number) =>
        apiClient(`/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    products: {
      list: (token: string, params?: Record<string, any>) => {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return apiClient('/admin/products' + qs, { headers: { Authorization: `Bearer ${token}` } });
      },
      create: (token: string, data: any) =>
        apiClient('/products', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res.data as Product),
      update: (token: string, id: number, data: any) =>
        apiClient(`/products/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res.data as Product),
      delete: (token: string, id: number) =>
        apiClient(`/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    attributes: {
      list: (token: string, params?: Record<string, any>) => {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return apiClient('/attributes' + qs, { headers: { Authorization: `Bearer ${token}` } });
      },
      create: (token: string, data: any) =>
        apiClient('/attributes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
      update: (token: string, id: number, data: any) =>
        apiClient(`/attributes/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
      delete: (token: string, id: number) =>
        apiClient(`/attributes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    skus: {
      list: (token: string, productId: number) =>
        apiClient(`/products/${productId}/skus`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res as ProductSku[]),
      create: (token: string, productId: number, data: Partial<ProductSku>) =>
        apiClient(`/products/${productId}/skus`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res as ProductSku),
      update: (token: string, skuId: number, data: Partial<ProductSku>) =>
        apiClient(`/skus/${skuId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res as ProductSku),
      delete: (token: string, skuId: number) =>
        apiClient(`/skus/${skuId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    productAttributeValues: {
      list: (token: string, productId: number) =>
        apiClient(`/products/${productId}/attribute-values`, { headers: { Authorization: `Bearer ${token}` } }),
      create: (token: string, productId: number, data: any) =>
        apiClient(`/products/${productId}/attribute-values`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
      update: (token: string, productId: number, valueId: number, data: any) =>
        apiClient(`/products/${productId}/attribute-values/${valueId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
      delete: (token: string, productId: number, valueId: number) =>
        apiClient(`/products/${productId}/attribute-values/${valueId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    affiliateLinks: {
      list: (token: string, params?: Record<string, any>) => {
        const qs = params ? '?' + new URLSearchParams(params as any).toString() : '';
        return apiClient('/admin/affiliate-links' + qs, { headers: { Authorization: `Bearer ${token}` } });
      },
      listByProduct: (token: string, productId: number) =>
        apiClient(`/products/${productId}/affiliate-links`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data as AffiliateLink[]),
      create: (token: string, productId: number, data: any) =>
        apiClient(`/products/${productId}/affiliate-links`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res.data as AffiliateLink),
      update: (token: string, id: number, data: any) =>
        apiClient(`/affiliate-links/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }).then(res => res.data as AffiliateLink),
      delete: (token: string, id: number) =>
        apiClient(`/affiliate-links/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    images: {
      update: (token: string, productId: number, imageId: number, data: any) =>
        apiClient(`/products/${productId}/images/${imageId}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
      delete: (token: string, productId: number, imageId: number) =>
        apiClient(`/products/${productId}/images/${imageId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    }
  },
};
