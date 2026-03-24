"use client";
import { Suspense } from "react";
import ClockList from "@/components/admin/clock/index";
const IpadPage = () => {
  return (
    <Suspense>
      <ClockList
        categoryId="4"
        pageTitle="Quản lý iPad"
        pageDescription="Xem danh sách sản phẩm iPad."
        routePrefix="/admin/ipad"
        filterMode="keyword-only"
        importApiPath="/admin/shop/products/import-ipads"
      />
    </Suspense>
  );
};
export default IpadPage;
