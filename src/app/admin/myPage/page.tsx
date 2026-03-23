"use client";
import MyPageComponent from "@/components/admin/myPage";
import { Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/store/store";
import { fetchProfile } from "@/lib/store/features/user/accountSlice";
const MyPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.profile);
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <MyPageComponent profile={profile} />
    </>
  );
};
export default MyPage;
