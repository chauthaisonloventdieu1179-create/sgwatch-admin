"use client";
import Create from "@/components/admin/clock/create";
const LaptopCreatePage = () => {
  return (
    <Create
      defaultCategoryId="16"
      pageTitle="Quản lý Laptop"
      routePrefix="/admin/laptop"
    />
  );
};
export default LaptopCreatePage;
