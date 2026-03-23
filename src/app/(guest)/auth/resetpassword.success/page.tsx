"use client";
import { Box, Grid } from "@mui/material";
import { Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
const AuthResetPasswordSuccess = () => {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(true);

  const handleChangeSign = () => {
    router.push("/auth/signin");
  };
  useEffect(() => {
    setPageLoading(false);
  }, []);

  return (
    <Box sx={{}}>
      {pageLoading ? (
        <div
          style={{
            height: "100vh",
          }}
          className="flex justify-center items-center"
        >
          <Spin size="large" />
        </div>
      ) : (
        <Grid
          container
          sx={{
            height: "100vh",
          }}
          className="bg-[#F3F3F3] flex justify-center items-center"
        >
          <Grid
            item
            xs={12}
            sm={8}
            md={5}
            lg={3.5}
            className="bg-[#FFFFFF] rounded-[10px] flex items-center justify-center"
            sx={{
              height: "calc(100% - 120px)",
            }}
          >
            <div className="w-[80%] " style={{ margin: "20px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <div>
                  <Image
                    src="/logo_login.png"
                    alt=""
                    width={275}
                    height={90}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <p className="w-full mb-0 h-[26px] text-center mt-[40px] font-medium text-[22px] text-[#212222]">
                  Đặt lại mật khẩu thành công
                </p>
                <p className="w-full mb-0 h-[26px] text-center mt-[40px] font-[400] text-[14px] text-[#9E9E9E]">
                  Mật khẩu đã được đặt lại thành công.
                </p>
                <Button
                  className="w-full h-[32px] mt-[25px] text-[#FFFFFF] bg-[#212222] text-[12px] font-medium "
                  type="primary"
                  onClick={handleChangeSign}
                >
                  Đi đến trang đăng nhập
                </Button>
              </Box>
            </div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
export default AuthResetPasswordSuccess;
