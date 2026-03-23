"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { IBigSale, IBigSalesResponse } from "@/types/admin/bigsale";
import { sendRequest } from "@/utils/api";
import { Input, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConfirmDelete from "@/components/popup/popup.delete";
import { message } from "antd";

const BigSaleList = () => {
  const router = useRouter();
  const [items, setItems] = useState<IBigSale[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(15);
  const [keyword, setKeyword] = useState<string>("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const queryParams: Record<string, any> = {
        per_page: perPage,
        page: page,
      };
      if (keyword) queryParams.keyword = keyword;

      const response = await sendRequest<IBigSalesResponse>({
        url: "/admin/big-sales",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams,
      });
      setItems(response.data.big_sales);
      setTotalPages(response.data.pagination.last_page);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const handleReset = async () => {
    setKeyword("");
    setCurrentPage(1);
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IBigSalesResponse>({
        url: "/admin/big-sales",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { per_page: perPage, page: 1 },
      });
      setItems(response.data.big_sales);
      setTotalPages(response.data.pagination.last_page);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: number) => {
    router.push(`/admin/bigsale/update?id=${id}`);
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

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!idDelete) return;
      await sendRequest({
        url: `/admin/big-sales/${idDelete}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Xóa thành công!");
      fetchData(currentPage);
    } catch {
      message.error("Xóa thất bại!");
    } finally {
      setIsModalVisible(false);
      setIdDelete(null);
      setNameDelete("");
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full mt-[0px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Quản lý Big Sale
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem danh sách chương trình Big Sale.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex items-end gap-[12px]">
              <div className="flex flex-col gap-[4px] flex-1">
                <span className="text-[12px] text-[#9E9E9E]">Từ khóa</span>
                <Input
                  placeholder="Tên chương trình..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  className="h-[32px] text-[14px]"
                />
              </div>
              <div
                onClick={handleReset}
                className="text-[#212222] text-[12px] font-medium bg-[#FFFFFF] border-2 border-[#C8C8C8] w-[85px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
              >
                Đặt lại
              </div>
              <div
                onClick={handleSearch}
                className="text-white text-[12px] font-medium bg-[#212222] w-[85px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
              >
                Tìm kiếm
              </div>
              <div
                onClick={() => router.push("/admin/bigsale/create/")}
                className="w-[125px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] hover:text-[15px] flex justify-center items-center gap-[5px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
              >
                <Image
                  src="/epack/icon_plus.svg"
                  alt=""
                  width={10}
                  height={6}
                  style={{ objectFit: "cover" }}
                />
                Thêm mới
              </div>
            </div>
          </div>
          <div
            style={{ height: "calc(100vh - 300px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-310px)] overflow-y-auto hidden-scroll">
                <table
                  style={{ borderCollapse: "collapse" }}
                  className="w-full bg-[#FFFFFF]"
                >
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                      <th style={{ padding: "12px 8px" }} className="w-[5%] text-center">
                        STT
                      </th>
                      <th style={{ padding: "12px 8px" }} className="w-[8%] text-center">
                        Ảnh
                      </th>
                      <th style={{ padding: "12px 12px" }} className="w-[25%] text-left">
                        Tiêu đề
                      </th>
                      <th style={{ padding: "12px 12px" }} className="w-[20%] text-left">
                        Mô tả
                      </th>
                      <th style={{ padding: "12px 12px" }} className="w-[12%] text-center">
                        Thời gian
                      </th>
                      <th style={{ padding: "12px 8px" }} className="w-[8%] text-center">
                        Giảm %
                      </th>
                      <th style={{ padding: "12px 8px" }} className="w-[8%] text-center">
                        Trạng thái
                      </th>
                      <th style={{ padding: "12px 12px" }} className="w-[14%] text-right">
                        Thao tác
                      </th>
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
                    {Array.isArray(items) &&
                      items.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[56px] hover:bg-[#e5efff]"
                        >
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{ padding: "8px", textAlign: "center" }}
                          >
                            <span className="text-[13px] text-[#9E9E9E]">
                              {(currentPage - 1) * perPage + index + 1}
                            </span>
                          </td>
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{ padding: "6px 8px", textAlign: "center" }}
                          >
                            <div className="w-[48px] h-[48px] rounded-[6px] bg-[#F5F5F5] overflow-hidden mx-auto flex justify-center items-center">
                              {item.media_url ? (
                                <img
                                  src={item.media_url}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-[9px] text-[#9E9E9E]">No img</span>
                              )}
                            </div>
                          </td>
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{
                              padding: "8px 12px",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span className="text-[13px] font-medium text-[#212222]">
                              {item.title}
                            </span>
                          </td>
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{
                              padding: "8px 12px",
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span className="text-[12px] text-[#9E9E9E]">
                              {item.description}
                            </span>
                          </td>
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{ padding: "8px 12px", textAlign: "center" }}
                          >
                            <span className="text-[11px] text-[#9E9E9E]">
                              {item.sale_start_date} ~ {item.sale_end_date}
                            </span>
                          </td>
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{ padding: "8px", textAlign: "center" }}
                          >
                            <span className="text-[13px] font-medium">
                              {item.sale_percentage != null ? `${item.sale_percentage}%` : "—"}
                            </span>
                          </td>
                          <td
                            onClick={() => handleUpdate(item.id)}
                            className="cursor-pointer"
                            style={{ padding: "8px", textAlign: "center" }}
                          >
                            <span
                              className={`text-[11px] font-medium px-[8px] py-[2px] rounded-full ${
                                item.is_active
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {item.is_active ? "Hoạt động" : "Tắt"}
                            </span>
                          </td>
                          <td style={{ padding: "8px 12px", textAlign: "right" }}>
                            <div className="flex justify-end gap-[8px]">
                              <div
                                onClick={() => handleUpdate(item.id)}
                                className="cursor-pointer w-[60px] h-[32px] flex justify-center items-center bg-[#212222] text-white text-[12px] rounded-[8px] hover:scale-105 transition-all duration-200"
                              >
                                Sửa
                              </div>
                              <div
                                onClick={() => handleOpenConfirmRemove(item.id, item.title)}
                                className="cursor-pointer w-[40px] hover:scale-105 hover:bg-red-200 hover:border-red-500 h-[32px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]"
                              >
                                <Image
                                  src="/epack/icon_remove.svg"
                                  alt=""
                                  width={16}
                                  height={20}
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {items.length > 0 && (
                  <div className="w-full flex justify-center items-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      paginate={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalVisible && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <ConfirmDelete
            onClose={handleCloseConfirmRemove}
            onDelete={handleDelete}
            moduleText={"Bạn có chắc chắn muốn xóa chương trình này?"}
            confirm={"Big Sale"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};
export default BigSaleList;
