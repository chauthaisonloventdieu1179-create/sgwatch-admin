import Cookies from "js-cookie";
const TokenKey = 'jwt_token'

export function getToken() {
    return Cookies.get(TokenKey);
}
export function setToken(token: string) {
    return Cookies.set(TokenKey, token, { expires: 365 });
}
export function deleteToken() {
    return Cookies.remove(TokenKey);
}
