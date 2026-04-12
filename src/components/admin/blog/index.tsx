"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { sendRequest } from "@/utils/api";
import { Input, Spin, Switch, message } from "antd";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import ConfirmDelete from "@/components/popup/popup.delete";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface IBlogPost {
  id: number;
  title: string;
  description: string | null;
  link: string | null;
  media_url: string | null;
  is_active: number | boolean;
  created_at: string;
  updated_at: string;
}

interface IBlogResponse {
  message: string;
  status_code: number;
  data: {
    posts: IBlogPost[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

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

const BlogList = () => {
  const [posts, setPosts] = useState<IBlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editPostId, setEditPostId] = useState<number | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalLink, setModalLink] = useState("");
  const [modalIsActive, setModalIsActive] = useState(true);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cacheKey, setCacheKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData(currentPage, keyword);
  }, [currentPage, keyword]);

  const fetchData = async (page: number, kw: string) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IBlogResponse>({
        url: "/admin/posts",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: {
          per_page: perPage,
          page: page,
          ...(kw ? { keyword: kw } : {}),
        },
      });
      setPosts(response.data.posts);
      setTotalPages(response.data.pagination?.last_page ?? 1);
    } catch (error) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setKeyword(searchInput);
  };

  const handleReset = () => {
    setSearchInput("");
    setKeyword("");
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setEditPostId(null);
    setModalTitle("");
    setModalDescription("");
    setModalLink("");
    setModalIsActive(true);
    setUploadFile(null);
    setUploadPreview(null);
    setShowModal(true);
  };

  const handleOpenEdit = async (id: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<{ data: { post: IBlogPost } }>({
        url: `/admin/posts/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const post = response.data.post;
      setEditPostId(id);
      setModalTitle(post.title || "");
      setModalDescription(post.description || "");
      setModalLink(post.link || "");
      setModalIsActive(post.is_active === 1 || post.is_active === true);
      setUploadFile(null);
      setUploadPreview(post.media_url || null);
      setShowModal(true);
    } catch {
      message.error("Không thể tải thông tin bài viết!");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setUploadFile(compressed);
      setUploadPreview(URL.createObjectURL(compressed));
    }
  };

  const handleSubmit = async () => {
    if (!modalTitle.trim()) {
      message.warning("Vui lòng nhập tiêu đề!");
      return;
    }
    if (!editPostId && !uploadFile) {
      message.warning("Vui lòng chọn ảnh!");
      return;
    }
    try {
      setUploading(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("title", modalTitle);
      if (modalDescription) formData.append("description", modalDescription);
      if (modalLink) formData.append("link", modalLink);
      if (uploadFile) formData.append("media", uploadFile);
      formData.append("is_active", modalIsActive ? "1" : "0");

      const url = editPostId
        ? `${BASE_URL}/admin/posts/${editPostId}`
        : `${BASE_URL}/admin/posts`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        message.success(editPostId ? "Cập nhật bài viết thành công!" : "Thêm bài viết thành công!");
        setShowModal(false);
        setCacheKey(Date.now());
        fetchData(currentPage, keyword);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Thao tác thất bại!");
      }
    } catch {
      message.error("Có lỗi xảy ra!");
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPostId(null);
    setModalTitle("");
    setModalDescription("");
    setModalLink("");
    setModalIsActive(true);
    setUploadFile(null);
    setUploadPreview(null);
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
        url: `/admin/posts/${idDelete}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData(currentPage, keyword);
    } catch {
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
          Quản lý Blog
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách bài viết
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý danh sách bài viết Blog.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex justify-between items-center gap-[10px]">
              <div className="flex items-center gap-[8px]">
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onPressEnter={handleSearch}
                  placeholder="Tìm kiếm bài viết..."
                  className="h-[32px] w-[220px] text-[13px]"
                />
                <div
                  onClick={handleSearch}
                  className="h-[32px] px-[12px] bg-[#212222] cursor-pointer rounded-[8px] text-white text-[12px] font-medium flex justify-center items-center hover:scale-105 transition-all duration-200"
                >
                  Tìm kiếm
                </div>
                <div
                  onClick={handleReset}
                  className="h-[32px] px-[12px] border border-[#C8C8C8] cursor-pointer rounded-[8px] text-[#212222] text-[12px] font-medium flex justify-center items-center hover:bg-gray-50 hover:scale-105 transition-all duration-200"
                >
                  Đặt lại
                </div>
              </div>
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
                {Array.isArray(posts) &&
                  posts.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-[#F9F9F9] rounded-[10px] overflow-hidden border border-[#E6E6E6] hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-full h-[180px] bg-[#E6E6E6] flex justify-center items-center overflow-hidden">
                        {item.media_url ? (
                          <img
                            src={`${item.media_url}?t=${cacheKey}`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-[14px] text-[#9E9E9E]">
                            Không có ảnh
                          </div>
                        )}
                      </div>
                      <div className="p-[12px] flex flex-col gap-[6px]">
                        <div className="flex justify-between items-start gap-[8px]">
                          <div className="flex flex-col gap-[2px] flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-[#212222] truncate">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-[11px] text-[#9E9E9E] line-clamp-2">
                                {item.description}
                              </div>
                            )}
                            {item.link && (
                              <div className="text-[11px] text-[#1572FF] truncate">{item.link}</div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-[4px] shrink-0">
                            <div
                              className={`text-[10px] px-[6px] py-[2px] rounded-full font-medium ${
                                item.is_active === 1 || item.is_active === true
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {item.is_active === 1 || item.is_active === true ? "Hiển thị" : "Ẩn"}
                            </div>
                            <div className="flex gap-[6px]">
                              <div
                                onClick={() => handleOpenEdit(item.id)}
                                className="cursor-pointer w-[50px] h-[28px] flex justify-center items-center bg-[#212222] text-white text-[11px] rounded-[6px] hover:scale-105 transition-all duration-200"
                              >
                                Sửa
                              </div>
                              <div
                                onClick={() => handleOpenConfirmRemove(item.id, item.title)}
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
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {posts.length > 0 && (
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <div className="w-[520px] bg-[#FFFFFF] rounded-[12px] p-[24px] flex flex-col gap-[14px] max-h-[90vh] overflow-y-auto">
            <div className="text-[16px] font-medium text-[#212222]">
              {editPostId ? "Cập nhật bài viết" : "Thêm bài viết mới"}
            </div>
            {/* Image upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[180px] border-2 border-dashed border-[#C8C8C8] rounded-[10px] flex justify-center items-center cursor-pointer hover:border-[#212222] transition-all duration-200 overflow-hidden"
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
            {/* Title */}
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <Input
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                className="h-[36px] w-full text-[13px] mt-[6px]"
              />
            </div>
            {/* Description */}
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">Mô tả</label>
              <Input.TextArea
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                placeholder="Nhập mô tả (tuỳ chọn)"
                rows={3}
                className="w-full text-[13px] mt-[6px]"
              />
            </div>
            {/* Link */}
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">Link</label>
              <Input
                value={modalLink}
                onChange={(e) => setModalLink(e.target.value)}
                placeholder="Nhập link (tuỳ chọn)"
                className="h-[36px] w-full text-[13px] mt-[6px]"
              />
            </div>
            {/* is_active */}
            <div className="flex items-center gap-[10px]">
              <label className="text-[13px] font-[400] text-[#212222]">Hiển thị</label>
              <Switch
                checked={modalIsActive}
                onChange={(checked) => setModalIsActive(checked)}
                size="small"
              />
            </div>
            {/* Buttons */}
            <div className="flex justify-end gap-[10px]">
              <div
                onClick={handleCloseModal}
                className="w-[80px] h-[36px] border border-[#C8C8C8] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-[#212222] font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Hủy
              </div>
              <div
                onClick={uploading ? undefined : handleSubmit}
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
            moduleText={"Bạn có chắc chắn muốn xóa bài viết này?"}
            confirm={"Bài viết"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};

export default BlogList;
