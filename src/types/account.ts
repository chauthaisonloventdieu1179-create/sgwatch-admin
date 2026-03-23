export interface IAccount {
  id: number;
  user_id: string;
  login_id: string;
  name: string;
  email: string;
  icon_path: string;
  icon_url: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
  admin_name: string;
  admin_company: string;
  last_logged_in_at: string;
}
export interface IAccountRep {
  user: IAccount;
}
