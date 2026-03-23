// "use server";
// import { cookies } from "next/headers";

// const JWT_TOKEN_KEY = "jwt_token";

// export async function setToken(token: string) {
//   cookies().set(JWT_TOKEN_KEY, token);
// }
// export async function deleteToken() {
//   cookies().delete(JWT_TOKEN_KEY);
// }
// export async function hasCookieToken() {
//   return cookies().has(JWT_TOKEN_KEY);
// }

// export async function getToken() {
//   const token = await cookies().get(JWT_TOKEN_KEY);
//   return token?.value;
// }
// localStorage-utils.ts

const JWT_TOKEN_KEY = "jwt_token";

// Lưu token vào localStorage
export function setToken(token: string) {
  if (typeof window !== "undefined") {
    // Kiểm tra nếu đang ở client-side
    localStorage.setItem(JWT_TOKEN_KEY, token);
  }
}

// Xóa token khỏi localStorage
export function deleteToken() {
  if (typeof window !== "undefined") {
    // Kiểm tra nếu đang ở client-side
    localStorage.removeItem(JWT_TOKEN_KEY);
  }
}

// Kiểm tra xem token có tồn tại trong localStorage hay không
export function hasCookieToken() {
  if (typeof window !== "undefined") {
    // Kiểm tra nếu đang ở client-side
    return localStorage.getItem(JWT_TOKEN_KEY) !== null;
  }
  return false;
}

// Lấy token từ localStorage
export function getToken() {
  if (typeof window !== "undefined") {
    // Kiểm tra nếu đang ở client-side
    return localStorage.getItem(JWT_TOKEN_KEY);
  }
  return null;
}
