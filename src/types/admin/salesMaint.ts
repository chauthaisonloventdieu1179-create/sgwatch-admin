export interface ICompanyGroupCommon {
  id: number;
  code: string;
  name: string;
}
export interface ICompanyCommon {
  id: number;
  code: string;
  name: string;
}

export interface ICompanyGroupCommonRp {
  message: string;
  status_code: number;
  data: {
    groups: ICompanyGroupCommon[];
  };
}
export interface ICompanyCommonRp {
  message: string;
  status_code: number;
  data: {
    companies: ICompanyCommon[];
  };
}
