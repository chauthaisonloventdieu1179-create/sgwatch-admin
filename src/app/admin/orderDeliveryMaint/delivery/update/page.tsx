"use client";
import Create from "@/components/admin/OrderDeliveryMaint/delivery";
import { Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const DeliveryUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [deliveryId, setDeliveryId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      setDeliveryId(id);
    }
  }, [id]);

  useEffect(() => {
    if (deliveryId) {
      setLoading(false);
    }
  }, [deliveryId]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <Create id={deliveryId} />
    </>
  );
};
export default DeliveryUpdatePage;
