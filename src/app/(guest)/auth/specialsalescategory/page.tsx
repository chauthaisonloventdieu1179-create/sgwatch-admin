"use client";
import { sendRequest } from "@/utils/api";
import { Box, Grid, TextField } from "@mui/material";
import { Input, Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Select } from "antd";
const SpecialSalesCategory = () => {
  const router = useRouter();
  const [login_id, setLoginId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [errorsForm, setErrorsForm] = useState({
    login_id: false,
  });

  const handleSubmit = async () => {
    router.push("/admin/dashboard/");
  };
  useEffect(() => {
    setPageLoading(false);
  }, []);
  return (
    <Box sx={{}}>
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
            <div className="w-[80%]" style={{ margin: "20px" }}>
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
                  Phân loại công ty đặc biệt
                </p>

                <Select
                  showSearch
                  placeholder="Search to Select"
                  optionFilterProp="label"
                  filterSort={(optionA, optionB) =>
                    (optionA?.label ?? "")
                      .toLowerCase()
                      .localeCompare((optionB?.label ?? "").toLowerCase())
                  }
                  className="h-[32px] w-full mt-[40px]"
                  options={[
                    {
                      value: "1",
                      label: "Not Identified",
                    },
                    {
                      value: "2",
                      label: "Closed",
                    },
                    {
                      value: "3",
                      label: "Communicated",
                    },
                    {
                      value: "4",
                      label: "Identified",
                    },
                    {
                      value: "5",
                      label: "Resolved",
                    },
                    {
                      value: "6",
                      label: "Cancelled",
                    },
                  ]}
                />

                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleSubmit}
                  className="w-full h-[32px] mt-[25px] text-[#FFFFFF] bg-[#212222] text-[12px] font-medium "
                >
                  Đăng nhập
                </Button>

              </Box>
            </div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
export default SpecialSalesCategory;
