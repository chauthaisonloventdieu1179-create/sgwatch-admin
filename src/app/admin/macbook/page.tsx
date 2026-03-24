"use client";
import { Suspense } from "react";
import ClockList from "@/components/admin/clock/index";
const MacbookPage = () => {
  return (
    <Suspense>
      <ClockList
        categoryId="3"
        pageTitle="Quản lý Macbook"
        pageDescription="Xem danh sách sản phẩm Macbook."
        routePrefix="/admin/macbook"
        filterMode="keyword-only"
      />
    </Suspense>
  );
};
export default MacbookPage;
