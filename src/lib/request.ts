// import { getToken } from "@/api/ServerActions";
import { toast } from "sonner"
import { getToken } from "./clientToken";

const PARAM_METHOD = ["GET", "DELETE"];

const baseUrl = process.env.NEXT_PUBLIC_API_URL

type REQUEST_METHOD = {
  url: string;
  method: string;
  params?: object;
  data?: object;
  formData?: FormData;
  headers?: object;
  mode?: string | string[];
  cache?: string;
  credentials?: string;
  redirect?: string;
  referrerPolicy?: string;
};

type RequestResponse = {
  ok: boolean;
  response: any;
  error: any;
  code: string | number;
  text: string | null;
};

const request = async (prop: REQUEST_METHOD) => {
  const token = await getToken();
  var { url, method, params, data, formData, headers } = { ...prop };
  url = handleUrl(url);

  const options: RequestInit = {
    method: method.toUpperCase().trim(),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + token,
    },
    body: formData ? formData : data ? JSON.stringify(data) : undefined,
  };
  if (headers) {
    options.headers = { ...options.headers, ...headers };
  }
  if (PARAM_METHOD.includes(method.toUpperCase().trim())) {
    url = params ? `${url}?${new URLSearchParams({ ...params })}` : url;
    delete options.body;
  }


  const response = await fetch(url, options);
  return await handleResponse(response);
};

const handleResponse = async (response: any): Promise<RequestResponse> => {
  const data = await response.json();
  var error;
  if (!response?.ok) {
    var message = "";
    if (data) {
      error = data;
      message = data.title || response?.statusText || "Something went wrong";
    }
    if(typeof window !== 'undefined' && response.status != 401){
      toast.error(message)
    }
  }
  return {
    ok: response?.ok ? true : false,
    response: response?.ok ? data : null,
    error,
    code: response?.status,
    text: response?.statusText,
  };
};

const handleUrl = (url: string) => {
  const urlRegex = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  );
  const isUrl = urlRegex.test(url.toLowerCase().trim());
  if(isUrl){
    return url.toLowerCase().trim();
  }
  return (baseUrl + url.toLowerCase().trim()).replace(/([^:])\/\/+/g, '$1/')
};
export default request;
