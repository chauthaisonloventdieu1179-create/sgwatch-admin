"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import Table from "@/components/table/table.orderDeliveryAndMaintenance.pre-shipmentContents";
import Pagination from "@/components/pagination/pagination";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input, Select } from "antd";
type RowType = {
  name: string;
  code: string | number;
  company_name: string;
  manufacturer_special?: string;
};

const GroupSale = () => {
  const [query, setQuery] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchData, setSearchData] = useState({
    search_name: "",
    search_code: "",
  });
  const router = useRouter();
  // const handleAddPage = () => {
  //   router.push("/admin/salesMaint/salesGroup/create/");
  // };
  const columns: ColumnDef<RowType>[] = [
    {
      accessorKey: "name",
      header: () => <div className="text-left">Nhà cung cấp</div>,
      size: 98,
      cell: ({ row }) => {
        const name: any = row.getValue("name");
        return <div className="font-medium">{name}</div>;
      },
      enableSorting: false,
    },
  ];

  return (
    <div className="w-full rounded-[8px] border bg-white h-full flex flex-col">
      <div className=" flex w-full pr-8 pl-4 pb-4 flex-col gap-[15px]">
        <div></div>
        <div className="ml-auto">
          <div
            // onClick={handleAddPage}
            className="w-[110px] ml-auto h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px]  flex justify-center items-center gap-[5px]"
          >
            <Image
              src="/epack/icon_plus.svg"
              alt=""
              width={10}
              height={6}
              style={{ objectFit: "cover" }}
            />
            Thiết lập lại
          </div>
        </div>
        <div className="w-full flex justify-start items-center  gap-[10px]">
          <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
            <div className="w-[35px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
              Tên SP
            </div>
            <div
              style={{
                width: "calc(100% - 40px)",
              }}
              className="h-[32px]"
            >
              <Select
                showSearch
                placeholder="Chọn tên SP"
                optionFilterProp="label"
                className="h-[32px] w-full"
                options={[
                  {
                    value: "1",
                    label: " Tên SP 1",
                  },
                  {
                    value: "2",
                    label: " Tên SP 2",
                  },
                  {
                    value: "3",
                    label: "Tên SP 3",
                  },
                  {
                    value: "4",
                    label: "Tên SP 4",
                  },
                  {
                    value: "5",
                    label: "Tên SP 5",
                  },
                  {
                    value: "6",
                    label: "Tên SP 6",
                  },
                ]}
              />
            </div>
          </div>
          <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
            <div className="w-[35px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
              Mã SP
            </div>
            <div
              style={{
                width: "calc(100% - 40px)",
              }}
              className="h-[32px]"
            >
              <Select
                showSearch
                placeholder="Chọn mã SP"
                optionFilterProp="label"
                className="h-[32px] w-full"
                options={[
                  {
                    value: "1",
                    label: "Mã SP 1",
                  },
                  {
                    value: "2",
                    label: "Mã SP 2",
                  },
                  {
                    value: "3",
                    label: "Mã SP 3",
                  },
                  {
                    value: "4",
                    label: "Mã SP 4",
                  },
                  {
                    value: "5",
                    label: "Mã SP 5",
                  },
                  {
                    value: "6",
                    label: "Mã SP 6",
                  },
                ]}
              />
            </div>
          </div>

          {/* <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
            <div className="w-[65px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
              Hãng SX
            </div>
            <div
              style={{
                width: "calc(100% - 70px)",
              }}
              className="h-[32px]"
            >
              <Select
                showSearch
                placeholder="Chọn hãng SX"
                optionFilterProp="label"
                className="h-[32px] w-full"
                options={[
                  {
                    value: "1",
                    label: "Hãng SX 1",
                  },
                  {
                    value: "2",
                    label: "Hãng SX 2",
                  },
                  {
                    value: "3",
                    label: "Hãng SX 3",
                  },
                  {
                    value: "4",
                    label: "Hãng SX 4",
                  },
                  {
                    value: "5",
                    label: "Hãng SX 5",
                  },
                  {
                    value: "6",
                    label: "Hãng SX 6",
                  },
                ]}
              />
            </div>
          </div> */}

          <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
            <div className="w-[50px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
              JAN
            </div>
            <div
              style={{
                width: "calc(100% - 55px)",
              }}
              className="h-[32px]"
            >
              <Select
                showSearch
                placeholder="Chọn mã JAN"
                optionFilterProp="label"
                className="h-[32px] w-full"
                options={[
                  {
                    value: "1",
                    label: "JAN 1",
                  },
                  {
                    value: "2",
                    label: "JAN 2",
                  },
                  {
                    value: "3",
                    label: "JAN 3",
                  },
                  {
                    value: "4",
                    label: "JAN 4",
                  },
                  {
                    value: "5",
                    label: "JAN 5",
                  },
                  {
                    value: "6",
                    label: "JAN 6",
                  },
                ]}
              />
            </div>
          </div>
          <div className="text-white text-[12px] ml-auto font-medium bg-[#212222] w-[75px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center">
            Tìm kiếm
          </div>
        </div>
      </div>
      <div
        style={{
          overflowY: "auto",
          height: "calc(100vh - 330px)",
        }}
        className=" px-[16px] "
      >
        <div className="w-full flex justify-center">
          <Pagination
            currentPage={1}
            totalPages={10}
            paginate={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};

export default GroupSale;
