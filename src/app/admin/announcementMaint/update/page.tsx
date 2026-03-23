"use client";
import Create from "@/components/admin/AnnouncementMaint/create";
import { useSearchParams } from "next/navigation";

const AnnouncementMaintUpdatePage = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <Create id={id || undefined} />;
};
export default AnnouncementMaintUpdatePage;
