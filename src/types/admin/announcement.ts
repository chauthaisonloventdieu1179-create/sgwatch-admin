export interface IAnnouncement {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface IAnnouncementPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IAnnouncementResponse {
  message: string;
  status_code: number;
  data: {
    notices: IAnnouncement[];
    pagination: IAnnouncementPagination;
  };
}

export interface IAnnouncementDetailResponse {
  message: string;
  status_code: number;
  data: {
    notice: IAnnouncement;
  };
}
