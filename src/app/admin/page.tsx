"use client";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const HomePage: React.FC = () => {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  useEffect(() => {
    router.push("/admin/dashboard/");
    setPageLoading(false);
  }, [router]);
  // useEffect(() => {
  //   setPageLoading(false);
  // }, []);
  return (
    <>
      {pageLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default HomePage;
