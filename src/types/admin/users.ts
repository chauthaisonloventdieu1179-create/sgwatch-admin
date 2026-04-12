export interface IUserRole {
  id: number;
  name: string;
  display_name: string;
}

export interface IUser {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  gender: string;
  avatar_url: string | null;
  is_system_admin: boolean;
  roles: IUserRole[];
  created_at: string;
}

export interface IUserPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IUsersResponse {
  message: string;
  status_code: number;
  data: {
    users: IUser[];
    pagination: IUserPagination;
  };
}

export interface IUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  gender: string;
  birthday: string | null;
  role: string;
  email: string;
}

export interface IUserProfileResponse {
  message: string;
  status_code: number;
  data: {
    user: IUserProfile;
  };
}

export interface IBanner {
  id: number;
  media_url: string;
  media_type: string;
  link: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface IBannersResponse {
  message: string;
  status_code: number;
  data: {
    banners: IBanner[];
    pagination: IUserPagination;
  };
}

export interface IDiscountCode {
  id: number;
  code: string;
  quantity: number;
  percentage: number;
  is_active: boolean | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IDiscountCodesResponse {
  message: string;
  status_code: number;
  data: {
    discount_codes: IDiscountCode[];
    pagination: IUserPagination;
  };
}
