"use client";
import Create from "@/components/admin/ProductMaint/create";
import { Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const UpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [paramId, setParamId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      setParamId(id);
    }
  }, [id]);

  useEffect(() => {
    if (paramId) {
      setLoading(false);
    }
  }, [paramId]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <Create id={paramId} />
    </>
  );
};
export default UpdatePage;
