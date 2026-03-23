"use client";
import Create from "@/components/admin/clock/create";
import { Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const MacbookUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [productId, setProductId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (id) {
      setProductId(id);
    }
  }, [id]);
  useEffect(() => {
    if (productId) {
      setLoading(false);
    }
  }, [productId]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      {!loading && (
        <Create
          id={productId}
          defaultCategoryId="17"
          pageTitle="Quản lý Macbook"
          routePrefix="/admin/macbook"
        />
      )}
    </>
  );
};
export default MacbookUpdatePage;
