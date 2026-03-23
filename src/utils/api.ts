import { deleteToken } from "@/api/ServerActions";
import { useRouter } from "next/navigation";
import queryString from "query-string";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
export const sendRequest = async <T>(props: IRequest): Promise<T> => {
  let {
    url,
    method,
    body,
    queryParams = {},
    useCredentials = false,
    headers = {},
    nextOption = {},
  } = props;
  let fullUrl = `${BASE_URL}${url}`;
  if (Object.keys(queryParams).length > 0) {
    const queryStringified = queryString.stringify(queryParams);
    fullUrl = `${fullUrl}?${queryStringified}`;
  }

  const options = {
    method: method,
    headers: new Headers({
      "content-type": "application/json",
      Accept: "application/json",
      ...headers,
    }),
    body: body ? JSON.stringify(body) : null,
    ...nextOption,
  };

  //   const options = {
  //   method,
  //   headers: isFormData
  //     ? new Headers({
  //         Accept: "application/json",
  //         ...headers,
  //       }) // Không set Content-Type, để browser tự xử lý
  //     : new Headers({
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         ...headers,
  //       }),
  //   body: isFormData ? body : body ? JSON.stringify(body) : null,
  //   ...nextOption,
  // };
  if (useCredentials) options.credentials = "include";
  // if (queryParams) {
  //   url = `${fullUrl}?${queryString.stringify(queryParams)}`;
  // }
  try {
    const res = await fetch(fullUrl, options);

    if (res.ok) {
      return res.json() as Promise<T>;
    } else {
      const errorResponse = await res.json();
      if (res.status == 401) {
        deleteToken();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }
      }
      const errorData: any = {
        statusCode: res.status,
        message: errorResponse?.message || "Unknown Error",
        error: errorResponse?.error || "",
        errors: errorResponse?.errors || {},
      };

      if (errorResponse?.errors) {
        errorData.validationErrors = errorResponse.errors;
      }
      throw errorData;
    }
  } catch (err) {
    throw err;
  }
};
// export function redirectToSignin() {
//   const router = useRouter();
//   router.push("/auth/signin");
// }
