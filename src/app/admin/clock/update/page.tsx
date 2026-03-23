"use client";
import Create from "@/components/admin/clock/create";
import { Spin } from "antd";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const ClockUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [clockId, setClockId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (id) {
      setClockId(id);
    }
  }, [id]);
  useEffect(() => {
    if (clockId) {
      setLoading(false);
    }
  }, [clockId]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      {!loading && <Create id={clockId} />}
    </>
  );
};
export default ClockUpdatePage;
