"use client";
import OrderDetail from "@/components/admin/order/detail";
import { Suspense } from "react";
import { Spin } from "antd";

const OrderDetailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full flex justify-center items-center h-[200px]">
          <Spin size="large" />
        </div>
      }
    >
      <OrderDetail />
    </Suspense>
  );
};
export default OrderDetailPage;
