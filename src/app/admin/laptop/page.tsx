"use client";
import { Suspense } from "react";
import ClockList from "@/components/admin/clock/index";
const LaptopPage = () => {
  return (
    <Suspense>
      <ClockList
        categoryId="2"
        pageTitle="Quản lý Laptop"
        pageDescription="Xem danh sách sản phẩm laptop."
        routePrefix="/admin/laptop"
        filterMode="keyword-brand"
        importApiPath="/admin/shop/products/import-computers"
      />
    </Suspense>
  );
};
export default LaptopPage;
