export interface IPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: {
    next?: string;
    prev?: string;
  };
}

export interface IProduct {
  id: number;
  maker_name: string;
  jan_code: string;
  name: string;
  product_number: string;
  color_name?: string;
  size_name?: string;
}
export interface IProductDetail {
  id: number;
  maker_code: string;
  maker_name: string;
  jan_code: string;
  product_name: string;
  product_number: string;
  wsn_code: string;
  color: string;
  color_number: string;
  color_name: string;
  size_code: string;
  size_name: string;
  minimum_order_quantity: number;
  minimum_order_lot_size: number;
  reference_retail_price: number;
  unit_price: number;
  category: string;
  thumbnail: string;
  thumbnail_url: string;
}
export interface IProductsResponse {
  message: string;
  status_code: number;
  data: {
    products: IProduct[];
    pagination: IPagination;
  };
}
export interface IProductDetailResponse {
  message: string;
  status_code: number;
  data: {
    product: IProductDetail;
  };
}

export interface ITemplateCSVProduct {
  message: string;
  status_code: number;
  data: {
    url: string;
  };
}
