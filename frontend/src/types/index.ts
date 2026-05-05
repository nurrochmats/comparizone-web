export type Product = {
  id: number;
  name: string;
  brand: string | null;
  price_min: number | null;
  price_max: number | null;
  thumbnail: string | null;
  slug: string;
  category: {
    name: string;
    slug: string;
  };
};

export type Attribute = {
  code: string;
  name: string;
  value: string | number | boolean | null;
  unit: string | null;
};

export type ProductDetail = Product & {
  attributes: Record<string, Attribute>;
};
