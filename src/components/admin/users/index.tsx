"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { IUser, IUsersResponse } from "@/types/admin/users";
import { sendRequest } from "@/utils/api";
import { Input, Select, Spin } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import ConfirmDelete from "@/components/popup/popup.delete";

const GENDERS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "unknown", label: "Khác" },
];

const UsersList = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(50);
  const [keyword, setKeyword] = useState<string>("");
  const [gender, setGender] = useState<string | undefined>(undefined);

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
      if (gender) queryParams.gender = gender;

      const response = await sendRequest<IUsersResponse>({
        url: "/admin/users",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: queryParams,
      });
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.last_page);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1);
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
        url: `/admin/users/${idDelete}`,
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGenderLabel = (g: string) => {
    switch (g) {
      case "male": return "Nam";
      case "female": return "Nữ";
      default: return "Khác";
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
          Quản lý người dùng
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách người dùng
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý danh sách người dùng hệ thống.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex justify-between items-center gap-[10px]">
              <div className="w-[35%] h-[32px] flex justify-start items-center gap-[5px]">
                <div className="w-[70px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
                  Tìm kiếm
                </div>
                <div
                  style={{ width: "calc(100% - 75px)" }}
                  className="h-[32px]"
                >
                  <Input
                    placeholder="Nhập tên hoặc email..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="h-[32px] w-full text-[14px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                  />
                </div>
              </div>
              <div className="w-[25%] h-[32px] flex justify-start items-center gap-[5px]">
                <div className="w-[65px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
                  Giới tính
                </div>
                <div
                  style={{ width: "calc(100% - 70px)" }}
                  className="h-[32px]"
                >
                  <Select
                    allowClear
                    placeholder="Chọn giới tính"
                    className="h-[32px] w-full"
                    value={gender}
                    onChange={(value) => setGender(value)}
                    options={GENDERS}
                  />
                </div>
              </div>
              <div
                onClick={handleSearch}
                className="text-white text-[12px] font-medium bg-[#212222] w-[85px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
              >
                Tìm kiếm
              </div>
            </div>
          </div>
          <div
            style={{ height: "calc(100vh - 260px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto hidden-scroll">
                <table
                  style={{ borderCollapse: "collapse" }}
                  className="w-full bg-[#FFFFFF]"
                >
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                      <th style={{ padding: "12px 16px" }} className="w-[6%] text-left text-[14px]">
                        STT
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[22%] text-left text-[14px]">
                        Họ tên
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[25%] text-left text-[14px]">
                        Email
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[10%] text-center text-[14px]">
                        Giới tính
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[12%] text-left text-[14px]">
                        Vai trò
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[15%] text-left text-[14px]">
                        Ngày tạo
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[10%] text-right text-[14px]">
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
                    {Array.isArray(users) &&
                      users.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[50px] hover:bg-[#e5efff]"
                        >
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                            }}
                          >
                            {(currentPage - 1) * perPage + index + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                            }}
                          >
                            {item.full_name}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              maxWidth: "220px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                            }}
                          >
                            {item.email}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            {getGenderLabel(item.gender)}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                            }}
                          >
                            {item.is_system_admin
                              ? "Admin"
                              : item.roles.map((r) => r.display_name).join(", ") || "User"}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                            }}
                          >
                            {formatDate(item.created_at)}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "right",
                            }}
                          >
                            <div className="flex justify-end gap-[8px]">
                              {!item.is_system_admin && (
                                <div
                                  onClick={() =>
                                    handleOpenConfirmRemove(item.id, item.full_name)
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
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {users.length > 0 && (
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
            moduleText={"Bạn có chắc chắn muốn xóa người dùng này?"}
            confirm={"Người dùng"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};
export default UsersList;
