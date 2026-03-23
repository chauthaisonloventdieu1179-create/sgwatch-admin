export {};
declare global {
    interface ItrackTop {
        id_ : string;
        name: string;
      }
  // khong can import
  interface IRequest {
    url: string;
    method: string;
    body?: { [key: string]: any };
    queryParams?: any;
    useCredentials?: boolean;
    headers?: any;
    nextOption?: any;
  }
  interface IBackendRes<T> {
    // LONG GENNERIC TRONG GENNERIC
    error?: string | string[];
    message: string;
    statusCode: number | string;
    data?: T;
  }
}
