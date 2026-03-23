"use client";
import BigSaleCreate from "@/components/admin/bigsale/create";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const BigSaleUpdateContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  return <BigSaleCreate id={id} />;
};

const BigSaleUpdatePage = () => {
  return (
    <Suspense>
      <BigSaleUpdateContent />
    </Suspense>
  );
};
export default BigSaleUpdatePage;
