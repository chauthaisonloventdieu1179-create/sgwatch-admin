"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import TableItem from "./table.orderDeliveryAndMaintenance.orderingInformation.item";
import React from "react";
import {
  IOrderAndDeliveryDetail,
  IOrderAndDeliveryDetailResponse,
  IOrderDelivery,
} from "@/types/admin/order";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Spin } from "antd";
interface IProps {
  orders: IOrderDelivery[];
  idOrder?: string;
  pagination?: React.ReactNode;
}

const Table = ({ orders, idOrder, pagination }: IProps) => {
  const [selectAll, setSelectAll] = useState(false);
  const [orderDetail, setOrderDetail] = useState<
    Record<number, IOrderAndDeliveryDetail>
  >({});
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const handleToggleExpandOrderDetail = async (id: number) => {
    const isExpanded = expandedRows.includes(id);

    if (isExpanded) {
      setExpandedRows((prev) => prev.filter((rowId) => rowId !== id));
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const url = `/maker/${idOrder}/order-history/${id}`;

      const response = await sendRequest<IOrderAndDeliveryDetailResponse>({
        url,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const detailData = response.data.order;

      setOrderDetail((prev) => ({
        ...prev,
        [id]: detailData,
      }));

      setExpandedRows((prev) => [...prev, id]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      setSelectedRows(orders.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };
  const handleSelectRowChange = (id: number) => {
    setSelectedRows((prev) => {
      const newSelectedRows = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      if (newSelectedRows.length === orders.length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }

      return newSelectedRows;
    });
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto hidden-scroll">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#FFFFFF",
            }}
          >
            <thead className="sticky top-0 z-10">
              <tr
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#0D1526",
                  textAlign: "left",
                }}
                className="bg-[#E6E6E6]"
              >
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    width: "3.7%",
                  }}
                >
                  <input
                    style={{ accentColor: "#212222" }}
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "14%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Mã đơn hàng
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "14%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Tên công ty
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "14%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Ngày
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "20%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Ngày giờ đặt hàng
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "14%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Số chi tiết
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "20%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                ></th>

                <th
                  style={{
                    padding: "12px 16px",
                    width: "4%",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody
              style={{
                borderTop: "1px solid #ddd",
                fontSize: "14px",
                fontWeight: "500",
                color: "#0D1526",
              }}
            >
              {Array.isArray(orders) &&
                orders.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      key={item.id}
                      style={{ height: "50px", borderBottom: "1px solid #ddd" }}
                      className="cursor-pointer hover:bg-[#e5efff]"
                    >
                      <td
                        style={{
                          padding: "10px 16px",
                          textAlign: "center",
                        }}
                      >
                        <input
                          style={{ accentColor: "#26488C" }}
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleSelectRowChange(item.id)}
                        />
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {item.order_number}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {item.company_name}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {item.order_date}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {item.delivery_date}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      >
                        {item.with_count_order_detail}
                      </td>
                      <td
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "left",
                        }}
                      ></td>

                      <td
                        onClick={() => handleToggleExpandOrderDetail(item.id)}
                        style={{
                          padding: "10px 16px",
                          maxWidth: "150px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          textAlign: "right",
                        }}
                        className="flex justify-end"
                      >
                        <div className="w-[40px] h-[40px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px] hover:scale-105  hover:bg-blue-200 hover:border-blue-500">
                          <Image
                            src="/epack/icon_opentable.svg"
                            alt=""
                            width={10}
                            height={15}
                            style={{
                              objectFit: "cover",
                              transform: expandedRows.includes(item.id)
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                    {expandedRows.includes(item.id) && orderDetail[item.id] && (
                      <tr>
                        <td
                          colSpan={8}
                          className="pl-[3.8%] pr-[5%] py-2 bg-[#F7F7F7]"
                        >
                          <TableItem items={orderDetail[item.id]} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
          {pagination && (
            <div className="w-full flex justify-center items-center  ">
              {pagination}
            </div>
          )}
        </div>{" "}
      </div>
    </>
  );
};
export default Table;
