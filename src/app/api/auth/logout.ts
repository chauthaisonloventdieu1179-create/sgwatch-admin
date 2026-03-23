import { getToken, deleteToken } from "../../../api/ServerActions";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const logout = async (): Promise<void> => {
  const token = await getToken();
  if (!token) {
    throw new Error("No token found");
  }
  const response = await fetch(`${BASE_URL}/logout`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  deleteToken();
};
