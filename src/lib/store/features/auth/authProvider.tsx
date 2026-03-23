"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { getMe } from "@/api/auth";
import { setMeData } from "./authSlice";
import { deleteToken } from "@/lib/clientToken";
// import { deleteToken } from "@/api/ServerActions";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const checkAuth = async () => {
    // const me = await getMe();
    // if (me.ok) {
    //   dispatch(setMeData(me.response?.detail));
    // }else {
    //   dispatch(setMeData(null));
    //   deleteToken()
    // }
  };
  const authState: any = useAppSelector((state) => state.auth.authState);
  useEffect(() => {
    if (authState === null || authState === undefined) {
      checkAuth();
    }
  });
  return <>{children}</>;
}
