"use client";
import ClockList from "@/components/admin/clock/index";
const SimPage = () => {
  return (
    <ClockList
      categoryId="18"
      pageTitle="Quản lý Sim"
      pageDescription="Xem danh sách sim."
      routePrefix="/admin/sim"
      filterMode="keyword-brand"
    />
  );
};
export default SimPage;
