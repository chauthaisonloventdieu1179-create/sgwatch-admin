"use client";
import ClockList from "@/components/admin/clock/index";
const LaptopPage = () => {
  return (
    <ClockList
      categoryId="2"
      pageTitle="Quản lý Laptop"
      pageDescription="Xem danh sách sản phẩm laptop."
      routePrefix="/admin/laptop"
      filterMode="keyword-brand"
    />
  );
};
export default LaptopPage;
