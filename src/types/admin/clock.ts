export interface IClockProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  short_description: string;
  description: string;
  product_info: string | null;
  deal_info: string | null;
  price_jpy: string;
  price_vnd: string;
  original_price_jpy: string;
  original_price_vnd: string | null;
  points: number;
  gender: string;
  movement_type: string;
  condition: string | null;
  cost_price_jpy: string | null;
  attributes: {
    case_size?: number;
    dial_color?: string;
    band_material?: string;
    case_material?: string;
    power_reserve?: string;
    glass_material?: string;
    water_resistance?: string;
    thong_so_ky_thuat?: string;
    year?: string;
    color?: string;
    security?: string;
    battery?: string;
    gpu?: string;
    ports?: string;
    target_customer?: string;
    design?: string;
  } | null;
  stock_quantity: number;
  stock_type: string | null;
  is_domestic: number | null;
  is_new: boolean | null;
  warranty_months: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  sort_order: number | null;
  display_order: number | null;
  brand: {
    id: number;
    name: string;
    slug: string;
  } | null;
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  images: {
    id: number;
    image_url: string;
    alt_text: string | null;
    is_primary: boolean;
    sort_order: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface IClockPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IClockProductsResponse {
  message: string;
  status_code: number;
  data: {
    products: IClockProduct[];
    pagination: IClockPagination;
  };
}

export interface IClockProductDetailResponse {
  message: string;
  status_code: number;
  data: {
    product: IClockProduct;
  };
}
