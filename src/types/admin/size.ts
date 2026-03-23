export interface ISize {
  id: number;
  name: string;
  code: string;
  scale: string;
  remarks: string;
  sort: number;
  display_order: string | null;
  size_master: string | null;
  note: string;
  created_at: string;
  updated_at: string;
}

export interface ISizesResponse {
  message: string;
  status_code: number;
  data: {
    sizes: ISize[];
    pagination: IPagination;
  };
}

export interface ISizeDetailResponse {
  message: string;
  status_code: number;
  data: {
    size: ISize;
  };
}
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
