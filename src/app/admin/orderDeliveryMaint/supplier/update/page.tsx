"use client";
import Create from "@/components/admin/OrderDeliveryMaint/supplier";
import { Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const SupplierUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [supplierId, setSupplierId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      setSupplierId(id);
    }
  }, [id]);

  useEffect(() => {
    if (supplierId) {
      setLoading(false);
    }
  }, [supplierId]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <Create id={supplierId} />
    </>
  );
};
export default SupplierUpdatePage;
