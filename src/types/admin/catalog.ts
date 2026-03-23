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
export interface ICatalog {
  id: number;
  maker_id: number;
  name: string;
  link: string;
  thumbnail_1: string;
  thumbnail_2: string;
  thumbnail_1_url: string;
  thumbnail_2_url: string;
}

export interface ICatalogResponse {
  message: string;
  status_code: number;
  data: {
    catalogs: ICatalog[];
    pagination: IPagination;
  };
}

export interface ICatalogResponseDetail {
  message: string;
  status_code: number;
  data: {
    catalog: ICatalog;
  };
}
