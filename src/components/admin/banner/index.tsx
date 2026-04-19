"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { IBanner, IBannersResponse } from "@/types/admin/users";
import { sendRequest } from "@/utils/api";
import { Input, InputNumber, Spin, message } from "antd";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import ConfirmDelete from "@/components/popup/popup.delete";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const BannerList = () => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(50);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);

  // Nén ảnh trước khi upload - target ~300KB
  const compressImage = (file: File, maxSizeKB = 300): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= maxSizeKB * 1024) { resolve(file); return; }
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_DIM = 1600;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
          else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.7;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(file); return; }
            if (blob.size > maxSizeKB * 1024 && quality > 0.1) { quality -= 0.1; tryCompress(); }
            else { resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() })); }
          }, "image/jpeg", quality);
        };
        tryCompress();
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editBannerId, setEditBannerId] = useState<number | null>(null);
  const [uploadLink, setUploadLink] = useState<string>("");
  const [uploadSortOrder, setUploadSortOrder] = useState<number | null>(null);
  const [cacheKey, setCacheKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IBannersResponse>({
        url: "/admin/banners",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: {
          per_page: perPage,
          page: page,
        },
      });
      setBanners(response.data.banners);
      setTotalPages(response.data.pagination?.last_page ?? 1);
    } catch (error) {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditBannerId(null);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadLink("");
    setUploadSortOrder(null);
    setShowUploadModal(true);
  };

  const handleOpenEdit = (id: number) => {
    const banner = banners.find((b) => b.id === id);
    setEditBannerId(id);
    setUploadFile(null);
    setUploadPreview(banner?.media_url || null);
    setUploadLink(banner?.link || "");
    setUploadSortOrder(banner?.sort_order ?? null);
    setShowUploadModal(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setUploadFile(compressed);
      setUploadPreview(URL.createObjectURL(compressed));
    }
  };

  const handleUploadSubmit = async () => {
    if (!editBannerId && !uploadFile) {
      message.warning("Vui lòng chọn ảnh!");
      return;
    }
    try {
      setUploading(true);
      const token = getToken();
      const formData = new FormData();
      if (uploadFile) formData.append("media", uploadFile);
      if (uploadLink) formData.append("link", uploadLink);
      if (uploadSortOrder !== null) formData.append("sort_order", String(uploadSortOrder));

      const url = editBannerId
        ? `${BASE_URL}/admin/banners/${editBannerId}`
        : `${BASE_URL}/admin/banners`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        message.success(
          editBannerId ? "Cập nhật banner thành công!" : "Thêm banner thành công!"
        );
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadPreview(null);
        setUploadLink("");
        setEditBannerId(null);
        setCacheKey(Date.now());
        fetchData(currentPage);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Thao tác thất bại!");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra!");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadPreview(null);
    setUploadLink("");
    setUploadSortOrder(null);
    setEditBannerId(null);
  };

  const handleOpenConfirmRemove = (id: number, label: string) => {
    setNameDelete(label);
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
        url: `/admin/banners/${idDelete}`,
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
          Quản lý Banner
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách banner
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý danh sách banner.
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
            style={{ height: "calc(100vh - 240px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto hidden-scroll">
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
                {Array.isArray(banners) &&
                  banners.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-[#F9F9F9] rounded-[10px] overflow-hidden border border-[#E6E6E6] hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-full h-[180px] bg-[#E6E6E6] flex justify-center items-center overflow-hidden">
                        {item.media_url ? (
                          <img
                            src={`${item.media_url}?t=${cacheKey}`}
                            alt={`Banner #${(currentPage - 1) * perPage + index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-[14px] text-[#9E9E9E]">
                            Không có ảnh
                          </div>
                        )}
                      </div>
                      <div className="p-[12px] flex flex-col gap-[6px]">
                        <div className="flex justify-between items-center">
                          <div className="text-[13px] font-medium text-[#212222]">
                            Banner #{(currentPage - 1) * perPage + index + 1}
                          </div>
                          <div className="flex gap-[8px]">
                            <div
                              onClick={() => handleOpenEdit(item.id)}
                              className="cursor-pointer w-[50px] h-[28px] flex justify-center items-center bg-[#212222] text-white text-[11px] rounded-[6px] hover:scale-105 transition-all duration-200"
                            >
                              Sửa
                            </div>
                            <div
                              onClick={() =>
                                handleOpenConfirmRemove(
                                  item.id,
                                  `Banner #${(currentPage - 1) * perPage + index + 1}`
                                )
                              }
                              className="cursor-pointer w-[36px] hover:scale-105 hover:bg-red-200 hover:border-red-500 h-[28px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[6px]"
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
                        </div>
                        {item.link && (
                          <div className="text-[11px] text-[#1572FF] truncate">{item.link}</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              {banners.length > 0 && (
                <div className="w-full flex justify-center items-center mt-[16px]">
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <div className="w-[480px] bg-[#FFFFFF] rounded-[12px] p-[24px] flex flex-col gap-[16px]">
            <div className="text-[16px] font-medium text-[#212222]">
              {editBannerId ? "Cập nhật banner" : "Thêm banner mới"}
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[200px] border-2 border-dashed border-[#C8C8C8] rounded-[10px] flex justify-center items-center cursor-pointer hover:border-[#212222] transition-all duration-200 overflow-hidden"
            >
              {uploadPreview ? (
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-[8px] text-[#9E9E9E]">
                  <Image
                    src="/epack/icon_plus.svg"
                    alt=""
                    width={20}
                    height={20}
                    style={{ objectFit: "cover" }}
                  />
                  <span className="text-[13px]">Nhấn để chọn ảnh</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">Link</label>
              <Input
                value={uploadLink}
                onChange={(e) => setUploadLink(e.target.value)}
                placeholder="Nhập link (tuỳ chọn)"
                className="h-[36px] w-full text-[13px] mt-[6px]"
              />
            </div>
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">Thứ tự hiển thị</label>
              <InputNumber
                value={uploadSortOrder}
                onChange={(val) => setUploadSortOrder(val)}
                placeholder="Nhập thứ tự (tuỳ chọn)"
                className="h-[36px] w-full text-[13px] mt-[6px]"
                min={0}
              />
            </div>
            <div className="flex justify-end gap-[10px]">
              <div
                onClick={handleCloseUploadModal}
                className="w-[80px] h-[36px] border border-[#C8C8C8] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-[#212222] font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Hủy
              </div>
              <div
                onClick={uploading ? undefined : handleUploadSubmit}
                className={`w-[100px] h-[36px] bg-[#212222] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-white font-medium transition-all duration-200 hover:scale-105 ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? "Đang lưu..." : "Lưu"}
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
            moduleText={"Bạn có chắc chắn muốn xóa banner này?"}
            confirm={"Banner"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};
export default BannerList;
