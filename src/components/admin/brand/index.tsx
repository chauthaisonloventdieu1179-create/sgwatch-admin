"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import ConfirmDelete from "@/components/popup/popup.delete";
import { IBrand, IBrandsResponse } from "@/types/admin/brand";
import { sendRequest } from "@/utils/api";
import { Input, Spin } from "antd";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BrandList = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);

  const [keyword, setKeyword] = useState("");

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
      if (keyword.trim()) queryParams.keyword = keyword.trim();

      const response = await sendRequest<IBrandsResponse>({
        url: "/admin/shop-brands",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams,
      });
      setBrands(response.data.brands);
      setTotalPages(response.data.pagination?.last_page ?? 1);
    } catch (error) {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const handleAddPage = () => {
    router.push("/admin/brand/create/");
  };

  const handleUpdate = (id: number) => {
    router.push(`/admin/brand/update?id=${id}`);
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
        url: `/admin/shop-brands/${idDelete}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(currentPage);
    } catch (error) {
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
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Quản lý thương hiệu
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách thương hiệu
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý danh sách thương hiệu.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex justify-between items-center gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  placeholder="Tìm kiếm theo tên thương hiệu..."
                  className="w-[300px] h-[32px] text-[13px]"
                />
                <div
                  onClick={handleSearch}
                  className="w-[90px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95"
                >
                  Tìm kiếm
                </div>
              </div>
              <div
                onClick={handleAddPage}
                className="w-[120px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] flex justify-center items-center gap-[5px] hover:text-[15px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
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
            style={{ height: "calc(100vh - 250px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-260px)] overflow-y-auto hidden-scroll">
                <table
                  style={{ borderCollapse: "collapse" }}
                  className="w-full bg-[#FFFFFF]"
                >
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[5%] text-left text-[14px]"
                      >
                        STT
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[10%] text-left text-[14px]"
                      >
                        Logo
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[20%] text-left text-[14px]"
                      >
                        Tên thương hiệu
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[15%] text-left text-[14px]"
                      >
                        Slug
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[10%] text-center text-[14px]"
                      >
                        Trạng thái
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[15%] text-right text-[14px]"
                      >
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
                    {Array.isArray(brands) &&
                      brands.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[50px] hover:bg-[#e5efff]"
                        >
                          <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                          >
                            {(currentPage - 1) * perPage + index + 1}
                          </td>
                          <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                          >
                            {item.logo_url ? (
                              <img
                                src={item.logo_url}
                                alt={item.name}
                                className="w-[50px] h-[35px] object-contain rounded-[4px]"
                              />
                            ) : (
                              <span className="text-[12px] text-[#9E9E9E]">
                                --
                              </span>
                            )}
                          </td>
                          <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                          >
                            {item.name}
                          </td>
                          <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                            className="text-[13px] text-[#666]"
                          >
                            {item.slug}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            <span
                              className={`px-[8px] py-[3px] rounded-[6px] text-[12px] font-medium ${
                                item.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td
                            style={{ padding: "10px 16px", textAlign: "right" }}
                          >
                            <div className="flex justify-end gap-[8px]">
                              <div
                                onClick={() => handleUpdate(item.id)}
                                className="cursor-pointer w-[40px] hover:scale-105 hover:bg-blue-200 hover:border-blue-500 h-[32px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]"
                              >
                                <Pencil size={16} className="text-[#212222]" />
                              </div>
                              <div
                                onClick={() =>
                                  handleOpenConfirmRemove(item.id, item.name)
                                }
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
                {brands.length > 0 && (
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
            moduleText={"Bạn có chắc chắn muốn xóa thương hiệu này?"}
            confirm={"Thương hiệu"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};
export default BrandList;
