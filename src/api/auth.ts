import request from "@/lib/request";

export function login(data: object) {
  return request({
    url: "/auth/distributor-login",
    method: "post",
    data,
  });
}

export function adminLogin(data: object) {
  return request({
    url: "/auth/login",
    method: "post",
    data,
  });
}

export function getMe() {
  return request({
    url: "auth/me",
    method: "get",
  });
}

export function getUsers(params: object) {
  return request({
    url: "users",
    method: "get",
    params
  });
}

export function getProducts(data: object) {
  return request({
    url: "https://fakestoreapi.com/carts",
    method: "get",
    data,
  });
}
