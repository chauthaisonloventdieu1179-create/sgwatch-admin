export interface IBigSaleProduct {
  id: number;
  name: string;
  slug: string;
  price_jpy: string;
  price_vnd: string;
  original_price_jpy: string;
  original_price_vnd: string;
  sale_percent: number;
  primary_image_url: string | null;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
}

export interface IBigSale {
  id: number;
  title: string;
  description: string;
  media_url: string | null;
  media_type: string;
  product_ids: string[];
  sale_start_date: string;
  sale_end_date: string;
  sale_percentage: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products?: IBigSaleProduct[];
}

export interface IBigSalesResponse {
  message: string;
  status_code: number;
  data: {
    big_sales: IBigSale[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface IBigSaleDetailResponse {
  message: string;
  status_code: number;
  data: {
    big_sale: IBigSale;
  };
}
