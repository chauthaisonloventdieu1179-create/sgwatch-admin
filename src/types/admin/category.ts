export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface ICategoryPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ICategoriesResponse {
  message: string;
  status_code: number;
  data: {
    categories: ICategory[];
    pagination: ICategoryPagination;
  };
}

export interface ICategoryDetailResponse {
  message: string;
  status_code: number;
  data: {
    category: ICategory;
  };
}
