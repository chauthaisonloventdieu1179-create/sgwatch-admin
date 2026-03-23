"use client";
import ClockList from "@/components/admin/clock/index";
const MacbookPage = () => {
  return (
    <ClockList
      categoryId="3"
      pageTitle="Quản lý Macbook"
      pageDescription="Xem danh sách sản phẩm Macbook."
      routePrefix="/admin/macbook"
      filterMode="keyword-only"
    />
  );
};
export default MacbookPage;
