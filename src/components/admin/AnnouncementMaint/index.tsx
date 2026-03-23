"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import ConfirmDelete from "@/components/popup/popup.delete";
import {
  IAnnouncement,
  IAnnouncementResponse,
} from "@/types/admin/announcement";
import { sendRequest } from "@/utils/api";
import { Input, Spin } from "antd";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AnnouncementMaint = () => {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
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

      const response = await sendRequest<IAnnouncementResponse>({
        url: "/admin/notices",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams,
      });
      setAnnouncements(response.data.notices);
      setTotalPages(response.data.pagination?.last_page ?? 1);
    } catch (error) {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const handleAddPage = () => {
    router.push("/admin/announcementMaint/create/");
  };

  const handleUpdate = (id: number) => {
    router.push(`/admin/announcementMaint/update?id=${id}`);
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
        url: `/admin/notices/${idDelete}`,
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
          Quản lý thông báo
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách thông báo
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý danh sách thông báo.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex justify-between items-center gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  placeholder="Tìm kiếm theo tiêu đề..."
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
            style={{ height: "calc(100vh - 240px)" }}
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
                        className="w-[6%] text-left text-[14px]"
                      >
                        STT
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[15%] text-left text-[14px]"
                      >
                        Hình ảnh
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[39%] text-left text-[14px]"
                      >
                        Tiêu đề
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[20%] text-left text-[14px]"
                      >
                        Ngày tạo
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[20%] text-right text-[14px]"
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
                    {Array.isArray(announcements) &&
                      announcements.map((item, index) => (
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
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-[60px] h-[40px] object-cover rounded-[4px]"
                              />
                            ) : (
                              <span className="text-[12px] text-[#9E9E9E]">
                                --
                              </span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              maxWidth: "400px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                            }}
                          >
                            {item.title}
                          </td>
                          <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                          >
                            {item.created_at}
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
                                  handleOpenConfirmRemove(item.id, item.title)
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
                {announcements.length > 0 && (
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
            moduleText={"Bạn có chắc chắn muốn xóa thông báo này?"}
            confirm={"Thông báo"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};
export default AnnouncementMaint;
