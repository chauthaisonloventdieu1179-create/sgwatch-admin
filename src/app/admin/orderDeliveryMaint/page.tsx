"use client";

import GroupSale from "./group-sale";
import "./custom.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import UserSale from "./user-sale";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
const SalePage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState("pre-shipmentContents");
  useEffect(() => {
    if (tabParam === "orderingInformation") {
      setTab("orderingInformation");
    } else {
      setTab("pre-shipmentContents");
    }
  }, [tabParam]);
  // Hàm xử lý khi đổi tab
  const handleTabChange = (value: string) => {
    setTab(value);
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.replace(`?${params.toString()}`); // giữ lại các param khác nếu có
  };
  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-[18px] font-medium text-[#212222]">
          Quản lý đặt hàng & giao hàng
        </div>
        <div className="w-full mt-[10px] border rounded-[10px] bg-white ">
          <div className="px-4 pt-[5px] pb-[5px] border-b-[1.5px] w-full text-[14px] font-medium text-[#212222]">
            {tab == "pre-shipmentContents"
              ? "Danh sách nhà cung cấp"
              : "Danh sách quản lý giao hàng"}
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              {tab == "pre-shipmentContents"
                ? "Bạn có thể xem danh sách nhà cung cấp."
                : "Bạn có thể xem danh sách quản lý giao hàng."}
            </span>
          </div>
          <Tabs
            value={tab}
            onValueChange={handleTabChange}
            className="w-full flex flex-col "
          >
            <TabsList className="grid w-[250px] grid-cols-2 TabsList pl-2 h-auto">
              <TabsTrigger value="pre-shipmentContents" className="TabsTrigger">
                Nhà cung cấp
              </TabsTrigger>
              <TabsTrigger value="orderingInformation" className="TabsTrigger">
                Nơi giao hàng
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 flex flex-col">
              <TabsContent value="pre-shipmentContents" className="">
                <GroupSale />
              </TabsContent>
              <TabsContent value="orderingInformation" className="">
                <UserSale />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SalePage;
