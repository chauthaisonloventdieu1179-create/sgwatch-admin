"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { IDiscountCode, IDiscountCodesResponse } from "@/types/admin/users";
import { sendRequest } from "@/utils/api";
import { DatePicker, Input, InputNumber, Spin, message } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import ConfirmDelete from "@/components/popup/popup.delete";

const DiscountList = () => {
  const [discounts, setDiscounts] = useState<IDiscountCode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(50);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCode, setCreateCode] = useState("");
  const [createQuantity, setCreateQuantity] = useState<number>(10);
  const [createAmount, setCreateAmount] = useState<number>(10);
  const [createExpiresAt, setCreateExpiresAt] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editExpiresAt, setEditExpiresAt] = useState<string>("");

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IDiscountCodesResponse>({
        url: "/admin/discount-codes",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: {
          per_page: perPage,
          page: page,
        },
      });
      setDiscounts(response.data.discount_codes);
      setTotalPages(response.data.pagination.last_page);
    } catch (error) {
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleOpenCreate = () => {
    setCreateCode("");
    setCreateQuantity(10);
    setCreateAmount(10);
    setCreateExpiresAt("");
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!createCode.trim()) {
      message.warning("Vui lòng nhập mã discount!");
      return;
    }
    try {
      setSaving(true);
      const token = getToken();
      await sendRequest({
        url: "/admin/discount-codes",
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          code: createCode,
          quantity: createQuantity,
          amount: createAmount,
          ...(createExpiresAt ? { expires_at: createExpiresAt } : {}),
        },
      });
      message.success("Tạo discount thành công!");
      setShowCreateModal(false);
      fetchData(currentPage);
    } catch (error: any) {
      message.error(error?.message || "Tạo discount thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const handleOpenEdit = (item: IDiscountCode) => {
    setEditId(item.id);
    setEditCode(item.code);
    setEditQuantity(item.quantity);
    setEditAmount(item.amount);
    setEditExpiresAt(item.expires_at || "");
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      setSaving(true);
      const token = getToken();
      await sendRequest({
        url: `/admin/discount-codes/${editId}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          code: editCode,
          quantity: editQuantity,
          amount: editAmount,
          ...(editExpiresAt ? { expires_at: editExpiresAt } : {}),
        },
      });
      message.success("Cập nhật thành công!");
      setShowEditModal(false);
      fetchData(currentPage);
    } catch (error: any) {
      message.error(error?.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleOpenConfirmRemove = (id: number, code: string) => {
    setNameDelete(code);
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
        url: `/admin/discount-codes/${idDelete}`,
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

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Quản lý Discount
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách discount
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý danh sách mã giảm giá.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex justify-end items-center gap-[10px]">
              <div
                onClick={handleOpenCreate}
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
                      <th style={{ padding: "12px 16px" }} className="w-[8%] text-left text-[14px]">
                        STT
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[22%] text-left text-[14px]">
                        Mã giảm giá
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[12%] text-center text-[14px]">
                        Số lượng
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[12%] text-center text-[14px]">
                        Số tiền
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[10%] text-center text-[14px]">
                        Trạng thái
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[16%] text-left text-[14px]">
                        Hạn sử dụng
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[16%] text-left text-[14px]">
                        Ngày tạo
                      </th>
                      <th style={{ padding: "12px 16px" }} className="w-[12%] text-right text-[14px]">
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
                    {Array.isArray(discounts) &&
                      discounts.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[50px] hover:bg-[#e5efff]"
                        >
                          <td style={{ padding: "10px 16px", textAlign: "left" }}>
                            {(currentPage - 1) * perPage + index + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                              fontFamily: "monospace",
                              fontWeight: "600",
                            }}
                          >
                            {item.code}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            {item.amount}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "center" }}>
                            {item.expires_at && new Date(item.expires_at) < new Date() ? (
                              <span className="text-[11px] px-[6px] py-[2px] rounded-[4px] bg-red-100 text-red-600">
                                Hết hạn
                              </span>
                            ) : (
                              <span
                                className={`text-[11px] px-[6px] py-[2px] rounded-[4px] ${
                                  item.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {item.is_active ? "Hoạt động" : "Ẩn"}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "left" }}>
                            {item.expires_at ? (
                              <span className={`${new Date(item.expires_at) < new Date() ? "text-red-500" : ""}`}>
                                {formatDate(item.expires_at)}
                              </span>
                            ) : (
                              <span className="text-[#9E9E9E]">Không giới hạn</span>
                            )}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "left" }}>
                            {formatDate(item.created_at)}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "right" }}>
                            <div className="flex justify-end gap-[8px]">
                              <div
                                onClick={() => handleOpenEdit(item)}
                                className="cursor-pointer w-[50px] h-[30px] flex justify-center items-center bg-[#212222] text-white text-[11px] rounded-[8px] hover:scale-105 transition-all duration-200"
                              >
                                Sửa
                              </div>
                              <div
                                onClick={() =>
                                  handleOpenConfirmRemove(item.id, item.code)
                                }
                                className="cursor-pointer w-[36px] hover:scale-105 hover:bg-red-200 hover:border-red-500 h-[30px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]"
                              >
                                <Image
                                  src="/epack/icon_remove.svg"
                                  alt=""
                                  width={14}
                                  height={18}
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {discounts.length > 0 && (
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <div className="w-[440px] bg-[#FFFFFF] rounded-[12px] p-[24px] flex flex-col gap-[16px]">
            <div className="text-[16px] font-medium text-[#212222]">
              Thêm mã giảm giá mới
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Mã giảm giá <span className="text-red-500">*</span>
                </label>
                <Input
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  placeholder="VD: 1223-112221"
                  className="h-[36px]"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Số lượng
                </label>
                <InputNumber
                  min={1}
                  value={createQuantity}
                  onChange={(v) => setCreateQuantity(v || 1)}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Số tiền
                </label>
                <InputNumber
                  min={1}
                  value={createAmount}
                  onChange={(v) => setCreateAmount(v || 1)}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Hạn sử dụng
                </label>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  value={createExpiresAt ? dayjs(createExpiresAt) : null}
                  onChange={(val) =>
                    setCreateExpiresAt(val ? val.format("YYYY-MM-DD HH:mm:ss") : "")
                  }
                  placeholder="Chọn ngày hết hạn (tùy chọn)"
                  className="h-[36px] w-full"
                  getPopupContainer={(trigger) => trigger.parentElement!}
                />
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <div
                onClick={() => setShowCreateModal(false)}
                className="w-[80px] h-[36px] border border-[#C8C8C8] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-[#212222] font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Hủy
              </div>
              <div
                onClick={saving ? undefined : handleCreate}
                className={`w-[100px] h-[36px] bg-[#212222] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-white font-medium transition-all duration-200 hover:scale-105 ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Đang lưu..." : "Tạo mới"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <div className="w-[440px] bg-[#FFFFFF] rounded-[12px] p-[24px] flex flex-col gap-[16px]">
            <div className="text-[16px] font-medium text-[#212222]">
              Cập nhật discount
            </div>
            <div className="flex flex-col gap-[12px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Mã giảm giá
                </label>
                <Input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="h-[36px]"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Số lượng
                </label>
                <InputNumber
                  min={1}
                  value={editQuantity}
                  onChange={(v) => setEditQuantity(v || 1)}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Số tiền
                </label>
                <InputNumber
                  min={1}
                  value={editAmount}
                  onChange={(v) => setEditAmount(v || 1)}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-medium text-[#212222]">
                  Hạn sử dụng
                </label>
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  value={editExpiresAt ? dayjs(editExpiresAt) : null}
                  onChange={(val) =>
                    setEditExpiresAt(val ? val.format("YYYY-MM-DD HH:mm:ss") : "")
                  }
                  placeholder="Chọn ngày hết hạn (tùy chọn)"
                  className="h-[36px] w-full"
                  getPopupContainer={(trigger) => trigger.parentElement!}
                />
              </div>
            </div>
            <div className="flex justify-end gap-[10px]">
              <div
                onClick={() => setShowEditModal(false)}
                className="w-[80px] h-[36px] border border-[#C8C8C8] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-[#212222] font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Hủy
              </div>
              <div
                onClick={saving ? undefined : handleUpdate}
                className={`w-[100px] h-[36px] bg-[#212222] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-white font-medium transition-all duration-200 hover:scale-105 ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Đang lưu..." : "Cập nhật"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <ConfirmDelete
            onClose={handleCloseConfirmRemove}
            onDelete={handleDelete}
            moduleText={"Bạn có chắc chắn muốn xóa discount này?"}
            confirm={"Discount"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};
export default DiscountList;
