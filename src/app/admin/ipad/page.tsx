"use client";
import ClockList from "@/components/admin/clock/index";
const IpadPage = () => {
  return (
    <ClockList
      categoryId="4"
      pageTitle="Quản lý iPad"
      pageDescription="Xem danh sách sản phẩm iPad."
      routePrefix="/admin/ipad"
      filterMode="keyword-only"
    />
  );
};
export default IpadPage;
