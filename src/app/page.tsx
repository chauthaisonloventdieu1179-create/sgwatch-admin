"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/api/ServerActions";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();

      if (token) {
        router.replace("/admin/dashboard/");
      } else {
        router.replace("/auth/signin");
      }
    };

    checkToken();
  }, [router]);

  return null;
}
