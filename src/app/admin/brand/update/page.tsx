"use client";
import Create from "@/components/admin/brand/create";
import { useSearchParams } from "next/navigation";

const BrandUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <Create id={id || undefined} />;
};
export default BrandUpdatePage;
