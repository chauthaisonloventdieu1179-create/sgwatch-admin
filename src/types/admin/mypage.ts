export interface IProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  gender: string;
  birthday: string | null;
  role: string;
  email: string;
}
export interface IProfileRep {
  message: string;
  status_code: number;
  data: {
    user: IProfile;
  };
}
