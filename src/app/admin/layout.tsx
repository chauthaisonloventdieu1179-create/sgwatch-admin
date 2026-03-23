"use client";
import AppHeader from "@/components/header/app.header.tamayura";
import ThemeRegistry from "@/components/theme-registry/theme.registry";
import "../../styles/app.css";
import "../../styles/globals.css";
import Menu from "@/components/menu/menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, deleteToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Modal, Spin } from "antd";
import StoreProvider from "@/lib/store/redux-provider";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [showNotAdmin, setShowNotAdmin] = useState<boolean>(false);
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        router.push("/auth/signin");
        return;
      }
      try {
        const userInfo = await sendRequest<any>({
          url: "/user-info",
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userInfo?.data?.user?.role !== "admin") {
          deleteToken();
          setShowNotAdmin(true);
          return;
        }
        setPageLoading(false);
      } catch {
        deleteToken();
        router.push("/auth/signin");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <>
      <Modal
        open={showNotAdmin}
        title="Truy cập bị từ chối"
        okText="Về trang đăng nhập"
        cancelButtonProps={{ style: { display: "none" } }}
        closable={false}
        onOk={() => {
          setShowNotAdmin(false);
          router.push("/auth/signin");
        }}
      >
        <p>Tài khoản của bạn không có quyền quản trị viên. Vui lòng đăng nhập bằng tài khoản admin.</p>
      </Modal>
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
        <div
          style={{
            height: "100vh",
            display: "flex",
            backgroundColor: "#F3F3F3",
            flexDirection: "column",
            margin: 0,
            fontFamily: "Noto Sans JP, sans-serif",
          }}
        >
          <StoreProvider>
            <ThemeRegistry>
              <AppHeader />
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "center",
                  gap: "32px",
                  overflow: "hidden",
                  height: "calc(100vh - 66px)",
                }}
              >
                <div
                  style={{
                    flex: 2,
                    backgroundColor: "#FFFFFF",
                    height: "calc(100vh - 66px)",
                    position: "fixed",
                    left: 0,
                    width: "250px",
                    overflow: "hidden",
                  }}
                >
                  <Menu />
                </div>

                <div
                  style={{
                    flex: 10,
                    marginLeft: "270px",
                    height: "calc(100vh - 66px)",
                    overflowY: "auto",
                    padding: "20px",
                  }}
                >
                  {children}
                </div>
              </div>
            </ThemeRegistry>
          </StoreProvider>
        </div>
      )}
    </>
  );
}
