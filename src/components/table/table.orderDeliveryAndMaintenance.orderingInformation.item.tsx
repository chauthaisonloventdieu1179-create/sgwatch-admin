"use client";

import { IOrderAndDeliveryDetail } from "@/types/admin/order";

const TableItem = ({ items }: { items?: IOrderAndDeliveryDetail }) => {
  return (
    <>
      <div className="w-full  flex justify-start items-center">
        <div className="w-[14.12%] flex flex-col justify-start items-start">
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[10px] text-[#000000]">
            Mã tiếp nhận
          </div>
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[14px] text-[#000000]">
            {items?.order_number}
          </div>
        </div>
        <div className="w-[14.88%] flex flex-col justify-start items-start">
          <div className="w-full h-[34px] text-start pl-[10px] font-[400] text-[10px] text-[#000000]">
            Người phụ trách
          </div>
          <div className="w-full h-[34px] text-start pl-[10px] font-[400] text-[14px] text-[#000000]">
            {items?.manager}
          </div>
        </div>
        <div className="w-[15%] flex flex-col justify-start items-start">
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[10px] text-[#000000]">
            Đối tác
          </div>
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[14px] text-[#000000]">
            ---
          </div>
        </div>
        <div className="w-[20%] flex flex-col justify-start items-start">
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[10px] text-[#000000]">
            Nơi đặt hàng
          </div>
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[14px] text-[#000000]">
            {items?.order_store_name}
          </div>
        </div>
        <div className="w-[14%] flex flex-col justify-start items-start">
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[10px] text-[#000000]">
            Nơi giao hàng
          </div>
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[14px] text-[#000000]">
            {items?.delivery_store_name}
          </div>
        </div>
        <div className="w-[22%] flex flex-col justify-start items-start">
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[10px] text-[#000000]"></div>
          <div className="w-full h-[34px] text-start pl-[15px] font-[400] text-[14px] text-[#000000]"></div>
        </div>
      </div>
      <div className="overflow-hidden w-full ">
        <table
          style={{
            width: "100%",
          }}
        >
          <thead>
            <tr
              style={{
                fontSize: "10px",
                fontWeight: "400",
                textAlign: "left",
              }}
              className="font-[400] text-[#000000]"
            >
              <th
                style={{
                  padding: "12px 16px",
                  width: "14.12%",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                Số dòng
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  width: "14.88%",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                Tên sản phẩm
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  width: "15%",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                Số lượng đặt
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  width: "20%",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                Đơn giá
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  width: "14%",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                Màu sắc
              </th>
              <th
                style={{
                  padding: "12px 16px",
                  width: "22%",
                  textAlign: "left",
                  fontSize: "10px",
                }}
              >
                Kích cỡ
              </th>
            </tr>
          </thead>
          <tbody
            style={{
              borderTop: "1px solid #C8C8C8",
              fontSize: "14px",
              fontWeight: "500",
              color: "#0D1526",
            }}
          >
            {Array.isArray(items?.details) &&
              items.details.map((item) => (
                <tr
                  key={item.product_id}
                  style={{ height: "50px", borderBottom: "1px solid #C8C8C8" }}
                  className="cursor-pointer bg-[#E6E6E6] text-[14px] font-[400px] text-[#000000]"
                >
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
                    {item.product_number}
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
                    {item.product_name}
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
                    {item.quantity}
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
                    {item.price}
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
                    {item.color}
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
                    {item.size_name}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default TableItem;
