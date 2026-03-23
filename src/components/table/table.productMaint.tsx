"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { IProduct, IProductsResponse } from "@/types/admin/product";
import ConfirmDelete from "@/components/popup/popup.delete";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
type SortDirection = "asc" | "desc";
interface IProps {
  products: IProduct[];
  fetchData: (
    page: number,
    per_page: number,
    search: string,
    search2: string,
    search3: string,
    search4: string,
  ) => void;
  pagination?: React.ReactNode;
}
const Table: React.FC<IProps> = ({ products, fetchData, pagination }) => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IProduct;
    direction: SortDirection;
  }>({ key: "id", direction: "desc" });

  const handleSort = (key: keyof IProduct) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        const newDirection = prev.direction === "asc" ? "desc" : "asc";
        return { key, direction: newDirection };
      } else {
        return { key, direction: "asc" };
      }
    });
  };

  const sortedProducts = [...products].sort((a, b) => {
    const { key, direction } = sortConfig;
    const aVal = a[key];
    const bVal = b[key];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal;
    }
    return direction === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleUpdate = (id: number) => {
    router.push(`/admin/clock/update?id=${id}`);
  };

  const handleOpenConfirmRemove = (id: number, name: string) => {
    setNameDelete(name);
    setIdDelete(id);
    setIsModalVisible(true);
  };
  const handleCloseConfirmRemove = () => {
    setNameDelete("");
    setIdDelete(null);
    setIsModalVisible(false);
  };
  const handleSubmit = async () => {
    try {
      const token = await getToken();
      if (!idDelete) return;
      const url = `/products/${idDelete}`;
      await sendRequest({
        url,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(1, 10, "", "", "", "");
    } catch (error) {
    } finally {
      setIsModalVisible(false);
      setIdDelete(null);
      setNameDelete("");
    }
  };
  return (
    <>
      <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto hidden-scroll">
          <table
            style={{
              borderCollapse: "collapse",
            }}
            className="w-full bg-[#FFFFFF]"
          >
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-left text-[14px] "
                >
                  <div className="flex items-center">
                    Tên hãng
                    <div
                      className="ml-auto"
                      onClick={() => handleSort("maker_name")}
                    >
                      <Image
                        src="/images/icon_sort_intable.svg"
                        alt=""
                        width={8}
                        height={14}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-left text-[14px] "
                >
                  <div className="flex items-center">
                    Mã JAN
                    <div
                      className="ml-auto"
                      onClick={() => handleSort("jan_code")}
                    >
                      <Image
                        src="/images/icon_sort_intable.svg"
                        alt=""
                        width={8}
                        height={14}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-left text-[14px] "
                >
                  <div className="flex items-center">
                    Tên SP
                    <div className="ml-auto" onClick={() => handleSort("name")}>
                      <Image
                        src="/images/icon_sort_intable.svg"
                        alt=""
                        width={8}
                        height={14}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-left text-[14px] "
                >
                  <div className="flex items-center">
                    Mã SP
                    <div
                      className="ml-auto"
                      onClick={() => handleSort("product_number")}
                    >
                      <Image
                        src="/images/icon_sort_intable.svg"
                        alt=""
                        width={8}
                        height={14}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-left text-[14px] "
                >
                  <div className="flex items-center">
                    Màu
                    <div
                      className="ml-auto"
                      onClick={() => handleSort("color_name")}
                    >
                      <Image
                        src="/images/icon_sort_intable.svg"
                        alt=""
                        width={8}
                        height={14}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-left text-[14px] "
                >
                  <div className="flex items-center">
                    Kích cỡ
                    <div
                      className="ml-auto"
                      onClick={() => handleSort("size_name")}
                    >
                      <Image
                        src="/images/icon_sort_intable.svg"
                        alt=""
                        width={8}
                        height={14}
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </div>
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                  }}
                  className="w-[14%] text-right text-[14px] "
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
              {Array.isArray(products) &&
                sortedProducts.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #ddd" }}
                    className="cursor-pointer h-[50px] hover:bg-[#e5efff]"
                  >
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                      className="max-w-[150px]"
                    >
                      {item.maker_name}
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      {item.jan_code}
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      {item.name}
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
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
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      {item.color_name}
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
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
                    <td
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
                      <div
                        onClick={() =>
                          handleOpenConfirmRemove(item?.id, item?.name)
                        }
                        className="cursor-pointer w-[40px] hover:scale-105  hover:bg-red-200 hover:border-red-500 h-[40px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]"
                      >
                        <Image
                          src="/epack/icon_remove.svg"
                          alt=""
                          width={20}
                          height={25}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {pagination && (
            <div className="w-full flex justify-center items-center  ">
              {pagination}
            </div>
          )}
        </div>
      </div>
      {isModalVisible && (
        <>
          <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
            <ConfirmDelete
              onClose={handleCloseConfirmRemove}
              onDelete={handleSubmit}
              moduleText={"Bạn có chắc chắn muốn xóa sản phẩm này?"}
              confirm={"Sản phẩm"}
              id={nameDelete}
            />
          </div>
        </>
      )}
    </>
  );
};
export default Table;
