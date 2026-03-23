"use client";
import { Input, Select, Spin, DatePicker } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { sendRequest } from "@/utils/api";
import { getToken } from "@/api/ServerActions";
import { IBigSaleDetailResponse, IBigSaleProduct } from "@/types/admin/bigsale";
import { message } from "antd";
import { Search, X, Upload } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateProps {
  id?: string;
}

const BigSaleCreate = ({ id }: CreateProps) => {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [saleStartDate, setSaleStartDate] = useState<Dayjs | null>(null);
  const [saleEndDate, setSaleEndDate] = useState<Dayjs | null>(null);
  const [salePercentage, setSalePercentage] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("1");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);

  const [saleProducts, setSaleProducts] = useState<IBigSaleProduct[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const fetchDetail = async () => {
        setLoading(true);
        try {
          const token = getToken();
          const response = await sendRequest<IBigSaleDetailResponse>({
            url: `/admin/big-sales/${id}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const s = response.data.big_sale;
          setTitle(s.title || "");
          setDescription(s.description || "");
          if (s.sale_start_date) setSaleStartDate(dayjs(s.sale_start_date));
          if (s.sale_end_date) setSaleEndDate(dayjs(s.sale_end_date));
          setSalePercentage(s.sale_percentage?.toString() || "");
          setIsActive(s.is_active ? "1" : "0");
          if (s.media_url) {
            setExistingMediaUrl(s.media_url);
            setMediaType(s.media_type?.startsWith("video") ? "video" : "image");
          }
          setSaleProducts(s.products || []);
        } catch {
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [id]);

  // Product search with debounce
  const searchProducts = useCallback(async (kw: string) => {
    if (!kw.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      setSearching(true);
      const token = getToken();
      const res = await sendRequest<any>({
        url: "/admin/shop/products",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { keyword: kw.trim(), page: 1, per_page: 15 },
      });
      setSearchResults(res.data.products || []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      searchProducts(searchKeyword);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchKeyword, searchProducts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddProduct = (product: any) => {
    if (saleProducts.some((p) => p.id === product.id)) {
      message.warning("Sản phẩm đã có trong danh sách!");
      return;
    }
    setSaleProducts((prev) => [...prev, product]);
    setSearchKeyword("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveProduct = (productId: number) => {
    setSaleProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke old preview URL to free memory
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
      setMediaFile(file);
      setMediaType(file.type.startsWith("video") ? "video" : "image");
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    setExistingMediaUrl(null);
    setMediaType("image");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getPrimaryImage = (product: any) => {
    if (product.primary_image_url) return product.primary_image_url;
    const primary = product.images?.find((img: any) => img.is_primary);
    return primary?.image_url || product.images?.[0]?.image_url || null;
  };

  const handleSubmit = async () => {
    if (!title) {
      message.warning("Vui lòng nhập tiêu đề!");
      return;
    }
    try {
      setSaving(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (saleStartDate) formData.append("sale_start_date", saleStartDate.format("YYYY-MM-DD"));
      if (saleEndDate) formData.append("sale_end_date", saleEndDate.format("YYYY-MM-DD"));
      if (salePercentage) formData.append("sale_percentage", salePercentage);
      formData.append("is_active", isActive);
      if (mediaFile) formData.append("media", mediaFile);
      saleProducts.forEach((p) => {
        formData.append("product_ids[]", String(p.id));
      });

      const url = id
        ? `${BASE_URL}/admin/big-sales/${id}`
        : `${BASE_URL}/admin/big-sales`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (res.ok) {
        message.success(id ? "Cập nhật thành công!" : "Tạo mới thành công!");
        router.push("/admin/bigsale/");
      } else {
        const err = await res.json();
        message.error(err.message || "Thao tác thất bại!");
      }
    } catch {
      message.error("Có lỗi xảy ra!");
    } finally {
      setSaving(false);
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
          Quản lý Big Sale
        </div>
        <div
          style={{ overflowY: "auto", height: "calc(100vh - 170px)" }}
          className="w-full mt-[15px] hidden-scroll bg-[#FFFFFF] rounded-[12px]"
        >
          <div className="w-full px-[16px] flex flex-col justify-start items-center">
            <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              {id ? "Chi tiết Big Sale" : "Thêm Big Sale mới"}
              <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
                {id ? "Xem và chỉnh sửa thông tin." : "Nhập thông tin để tạo mới."}
              </span>
            </div>
            <div className="w-full flex justify-center items-start mt-[40px] pb-[100px]">
              <div className="w-full flex px-[100px] justify-start items-start">
                <div className="w-[20%] text-start text-[#212222] text-[14px] font-medium">
                  Thông tin
                </div>
                <div className="w-[80%] flex flex-col justify-start items-start gap-[20px]">
                  {/* Title */}
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề"
                      className="h-[32px] w-full text-[14px] mt-[8px]"
                    />
                  </div>

                  {/* Description */}
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Mô tả
                    </label>
                    <TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả"
                      rows={3}
                      className="w-full text-[14px] mt-[8px]"
                    />
                  </div>

                  {/* Date + Percentage + Active */}
                  <div className="w-full flex gap-[20px]">
                    <div className="w-[25%]">
                      <label className="text-[14px] font-[400] text-[#000000]">
                        Ngày bắt đầu
                      </label>
                      <DatePicker
                        value={saleStartDate}
                        onChange={(date) => setSaleStartDate(date)}
                        format="YYYY-MM-DD"
                        placeholder="Chọn ngày"
                        className="h-[32px] w-full mt-[8px]"
                      />
                    </div>
                    <div className="w-[25%]">
                      <label className="text-[14px] font-[400] text-[#000000]">
                        Ngày kết thúc
                      </label>
                      <DatePicker
                        value={saleEndDate}
                        onChange={(date) => setSaleEndDate(date)}
                        format="YYYY-MM-DD"
                        placeholder="Chọn ngày"
                        className="h-[32px] w-full mt-[8px]"
                      />
                    </div>
                    <div className="w-[25%]">
                      <label className="text-[14px] font-[400] text-[#000000]">
                        Giảm giá (%)
                      </label>
                      <Input
                        value={salePercentage}
                        onChange={(e) => setSalePercentage(e.target.value)}
                        placeholder="VD: 20"
                        className="h-[32px] w-full text-[14px] mt-[8px]"
                      />
                    </div>
                    <div className="w-[25%]">
                      <label className="text-[14px] font-[400] text-[#000000]">
                        Trạng thái
                      </label>
                      <Select
                        value={isActive}
                        onChange={(value) => setIsActive(value)}
                        className="h-[32px] w-full mt-[8px]"
                        options={[
                          { value: "1", label: "Hoạt động" },
                          { value: "0", label: "Tắt" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Media */}
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Ảnh / Media
                    </label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {mediaPreview || existingMediaUrl ? (
                      <div
                        className="relative w-full max-w-[400px] h-[200px] rounded-[8px] overflow-hidden bg-[#F5F5F5] border border-[#E6E6E6] cursor-pointer group mt-[8px]"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {mediaType === "video" ? (
                          <video
                            src={mediaPreview || existingMediaUrl!}
                            className="w-full h-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                          />
                        ) : (
                          <img
                            src={mediaPreview || existingMediaUrl!}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-[12px] font-medium">
                            {mediaType === "video" ? "Thay video" : "Thay ảnh"}
                          </span>
                        </div>
                        <div
                          onClick={handleRemoveMedia}
                          className="absolute top-[6px] right-[6px] w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-all"
                        >
                          <X size={14} className="text-red-500" />
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full max-w-[400px] h-[200px] rounded-[8px] border-2 border-dashed border-[#C8C8C8] flex flex-col items-center justify-center gap-[8px] cursor-pointer hover:border-[#2563EB] hover:bg-[#F0F7FF] transition-all mt-[8px]"
                      >
                        <Upload size={28} className="text-[#C8C8C8]" />
                        <span className="text-[12px] text-[#9E9E9E]">
                          Click để chọn ảnh
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Sản phẩm sale
                      {saleProducts.length > 0 && (
                        <span className="ml-[8px] text-[12px] font-normal text-[#9E9E9E]">
                          {saleProducts.length} sản phẩm
                        </span>
                      )}
                    </label>
                    <div className="relative max-w-[500px] mt-[8px]" ref={dropdownRef}>
                      <Input
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="Tìm sản phẩm theo tên, SKU..."
                        className="h-[36px] rounded-[10px]"
                        suffix={
                          searching ? (
                            <Spin size="small" />
                          ) : (
                            <Search size={16} className="text-[#9E9E9E]" />
                          )
                        }
                      />
                      {showDropdown && searchResults.length > 0 && (
                        <div className="absolute top-[40px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-[100] max-h-[280px] overflow-y-auto hidden-scroll">
                          {searchResults.map((product) => {
                            const alreadyAdded = saleProducts.some((p) => p.id === product.id);
                            const imgUrl = getPrimaryImage(product);
                            return (
                              <div
                                key={product.id}
                                onClick={() => !alreadyAdded && handleAddProduct(product)}
                                className={`flex items-center gap-[10px] px-[12px] py-[8px] border-b border-[#F0F0F0] last:border-b-0 transition-all ${
                                  alreadyAdded
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-[#e5efff]"
                                }`}
                              >
                                <div className="w-[36px] h-[36px] min-w-[36px] rounded-[6px] bg-[#F5F5F5] overflow-hidden flex justify-center items-center">
                                  {imgUrl ? (
                                    <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[9px] text-[#9E9E9E]">No img</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-medium text-[#212222] truncate">
                                    {product.name}
                                  </div>
                                  <div className="text-[11px] text-[#9E9E9E]">
                                    ¥{Number(product.price_jpy).toLocaleString()}
                                    {product.brand ? ` • ${product.brand.name}` : ""}
                                  </div>
                                </div>
                                {alreadyAdded && (
                                  <span className="text-[11px] text-[#1572FF] font-medium">Đã thêm</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Product list */}
                    {saleProducts.length > 0 && (
                      <div className="mt-[12px] flex flex-col gap-[8px]">
                        {saleProducts.map((product, index) => {
                          const imgUrl = getPrimaryImage(product);
                          return (
                            <div
                              key={product.id}
                              className="flex items-center gap-[12px] p-[8px] rounded-[8px] border border-[#E6E6E6] hover:bg-[#F9F9F9]"
                            >
                              <span className="text-[12px] text-[#9E9E9E] w-[24px] text-center">
                                {index + 1}
                              </span>
                              <div
                                onClick={() => router.push(`/admin/clock/update/?id=${product.id}`)}
                                className="flex items-center gap-[12px] flex-1 min-w-0 cursor-pointer"
                              >
                                <div className="w-[40px] h-[40px] min-w-[40px] rounded-[6px] bg-[#F5F5F5] overflow-hidden flex justify-center items-center">
                                  {imgUrl ? (
                                    <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <span className="text-[9px] text-[#9E9E9E]">No img</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-medium text-[#212222] truncate hover:text-[#1572FF] transition-colors">
                                    {product.name}
                                  </div>
                                  <div className="text-[11px] text-[#9E9E9E]">
                                    ¥{Number(product.price_jpy).toLocaleString()}
                                    {product.brand ? ` • ${product.brand.name}` : ""}
                                  </div>
                                </div>
                              </div>
                              <div
                                onClick={() => handleRemoveProduct(product.id)}
                                className="cursor-pointer w-[28px] h-[28px] flex justify-center items-center rounded-[6px] border border-[#C8C8C8] hover:bg-red-100 hover:border-red-400 transition-all"
                              >
                                <X size={14} className="text-[#9E9E9E]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[60px] fixed top-auto bottom-0 w-full ml-[-33px] flex justify-end items-center bg-[#FFFFFF] border-t-[2px] border-[#C8C8C8]">
          <div className="w-[175px] h-[36px] mr-[300px] flex justify-start items-center">
            <div
              onClick={() => router.back()}
              className="cursor-pointer rounded-[8px] w-[80px] h-[36px] text-[#9E9E9E] border-[2px] border-[#9E9E9E] font-medium text-[12px] flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
            >
              Quay lại
            </div>
            <div
              className={`${
                title ? "bg-[#212222]" : "bg-[#9E9E9E]"
              } cursor-pointer text-[#FFFFFF] rounded-[8px] w-[80px] h-[36px] ml-[11px] flex justify-center items-center text-[12px] font-medium hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]`}
              onClick={saving ? undefined : handleSubmit}
            >
              {saving ? <Spin size="small" /> : id ? "Cập nhật" : "Đăng ký"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default BigSaleCreate;
