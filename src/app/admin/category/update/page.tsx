"use client";
import Create from "@/components/admin/category/create";
import { useSearchParams } from "next/navigation";

const CategoryUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <Create id={id || undefined} />;
};
export default CategoryUpdatePage;
