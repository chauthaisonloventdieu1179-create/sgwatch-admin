export interface IMaker {
  id: number;
  name: string;
  code: string;
  special: boolean;
  email?: string | null;
  avatar?: string | null;
  company_id: number | null;
  company_name: string | null;
  address: string | null;
  phoneNumber: string | null;
  fax: string | null;
  postalCode: string | null;
}
export interface IMakersCommon {
  id: number;
  name: string;
}

export interface IMakersCommonResponse {
  message: string;
  status_code: number;
  data: {
    makers: IMakersCommon[];
  };
}
export interface IMakersResponse {
  message: string;
  status_code: number;
  data: {
    makers: IMaker[];
    pagination: IPagination;
  };
}

export interface IMakerDetailResponse {
  message: string;
  status_code: number;
  data: {
    maker: IMaker;
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
