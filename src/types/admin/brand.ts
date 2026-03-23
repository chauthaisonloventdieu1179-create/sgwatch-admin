export interface IBrand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  country: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface IBrandPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IBrandsResponse {
  message: string;
  status_code: number;
  data: {
    brands: IBrand[];
    pagination: IBrandPagination;
  };
}

export interface IBrandDetailResponse {
  message: string;
  status_code: number;
  data: {
    brand: IBrand;
  };
}
