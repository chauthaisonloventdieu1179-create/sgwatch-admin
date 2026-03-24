"use client";
import { Input, Select, Spin } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { getToken } from "@/api/ServerActions";
import { IClockProductDetailResponse } from "@/types/admin/clock";
import { ICategoriesResponse } from "@/types/admin/category";
import Image from "next/image";

const STOCK_TYPES = [
  { value: "in_stock", label: "Hàng có sẵn" },
  { value: "pre_order", label: "Hàng order" },
];

const CONDITIONS = [
  { value: "new", label: "Mới" },
  { value: "like_new", label: "Like New" },
  { value: "used", label: "Đã sử dụng" },
];

interface CreateProps {
  id?: string;
  defaultCategoryId?: string;
  pageTitle?: string;
  routePrefix?: string;
}

const Create = ({
  id,
  defaultCategoryId = "4",
  pageTitle = "Quản lý iPad",
  routePrefix = "/admin/ipad",
}: CreateProps) => {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string | undefined>(defaultCategoryId);
  const [shortDescription, setShortDescription] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priceJpy, setPriceJpy] = useState<string>("");
  const [originalPriceJpy, setOriginalPriceJpy] = useState<string>("");
  const [points, setPoints] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<string>("");
  const [stockType, setStockType] = useState<string | undefined>(undefined);
  const [condition, setCondition] = useState<string | undefined>(undefined);
  const [warrantyMonths, setWarrantyMonths] = useState<string>("");
  const [costPriceJpy, setCostPriceJpy] = useState<string>("");
  const [productInfo, setProductInfo] = useState<string>("");
  const [dealInfo, setDealInfo] = useState<string>("");
  const [attrYear, setAttrYear] = useState<string>("");
  const [attrColor, setAttrColor] = useState<string>("");
  const [attrSecurity, setAttrSecurity] = useState<string>("");
  const [attrBattery, setAttrBattery] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: number; image_url: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [errors, setErrors] = useState({ name: false, sku: false });
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  const compressImage = (file: File, maxSizeKB = 300): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= maxSizeKB * 1024) {
        resolve(file);
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_DIM = 1600;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        let quality = 0.7;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) { resolve(file); return; }
              if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
                quality -= 0.1;
                tryCompress();
              } else {
                const compressed = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressed);
              }
            },
            "image/jpeg",
            quality,
          );
        };
        tryCompress();
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await sendRequest<ICategoriesResponse>({
        url: "/admin/shop-categories",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { per_page: 100 },
      });
      setCategoryOptions(
        response.data.categories.map((c) => ({
          value: String(c.id),
          label: c.name,
        })),
      );
    } catch {
      setCategoryOptions([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        const token = await getToken();
        try {
          const response = await sendRequest<IClockProductDetailResponse>({
            url: `/admin/shop/products/${id}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const p = response.data.product;
          setName(p.name);
          setSku(p.sku);
          setCategoryId(p.category?.id?.toString());
          setShortDescription(p.short_description || "");
          setDescription(p.description || "");
          setPriceJpy(p.price_jpy || "");
          setOriginalPriceJpy(p.original_price_jpy || "");
          setPoints(p.points?.toString() || "");
          setStockQuantity(p.stock_quantity?.toString() || "");
          setStockType(p.stock_type || undefined);
          setCostPriceJpy(p.cost_price_jpy || "");
          setCondition(p.condition || undefined);
          setWarrantyMonths(p.warranty_months?.toString() || "");
          setProductInfo(p.product_info || "");
          setDealInfo(p.deal_info || "");
          setAttrYear(p.attributes?.year || "");
          setAttrColor(p.attributes?.color || "");
          setAttrSecurity(p.attributes?.security || "");
          const rawBattery = p.attributes?.battery || "";
          if (rawBattery && parseFloat(rawBattery) > 0 && parseFloat(rawBattery) <= 1) {
            setAttrBattery(Math.round(parseFloat(rawBattery) * 100) + "%");
          } else {
            setAttrBattery(rawBattery);
          }
          setExistingImages(
            p.images?.map((img) => ({ id: img.id, image_url: img.image_url })) || [],
          );
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const compressed = await Promise.all(
        Array.from(files).map((file) => compressImage(file)),
      );
      setImages((prev) => [...prev, ...compressed]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: number) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setServerErrors({});
    const newErrors = { name: !name, sku: !sku };
    setErrors(newErrors);
    if (newErrors.name || newErrors.sku) {
      setLoading(false);
      return;
    }
    const token = await getToken();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("sku", sku);
    if (categoryId) formData.append("category_id", categoryId);
    if (shortDescription) formData.append("short_description", shortDescription);
    if (description) formData.append("description", description);
    if (priceJpy) formData.append("price_jpy", priceJpy);
    if (originalPriceJpy) formData.append("original_price_jpy", originalPriceJpy);
    if (points) formData.append("points", points);
    if (stockQuantity) formData.append("stock_quantity", stockQuantity);
    if (stockType) formData.append("stock_type", stockType);
    if (costPriceJpy) formData.append("cost_price_jpy", costPriceJpy);
    if (condition) formData.append("condition", condition);
    if (warrantyMonths) formData.append("warranty_months", warrantyMonths);
    if (productInfo) formData.append("product_info", productInfo);
    if (dealInfo) formData.append("deal_info", dealInfo);
    if (attrYear) formData.append("attributes[year]", attrYear);
    if (attrColor) formData.append("attributes[color]", attrColor);
    if (attrSecurity) formData.append("attributes[security]", attrSecurity);
    if (attrBattery) {
      const batteryVal = attrBattery.replace("%", "").trim();
      const num = parseFloat(batteryVal);
      if (!isNaN(num) && num > 1) {
        formData.append("attributes[battery]", String(num / 100));
      } else {
        formData.append("attributes[battery]", attrBattery);
      }
    }
    if (id && existingImages.length > 0) {
      existingImages.forEach((img) => {
        formData.append("existing_image_ids[]", String(img.id));
      });
    }
    images.forEach((img) => {
      formData.append("images[]", img);
    });

    try {
      const url = id
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/shop/products/${id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/shop/products`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        if (errorResponse?.errors) {
          const errs: Record<string, string> = {};
          Object.keys(errorResponse.errors).forEach((key) => {
            if (Array.isArray(errorResponse.errors[key])) {
              errs[key] = errorResponse.errors[key].join(", ");
            }
          });
          setServerErrors(errs);
        }
        throw new Error(errorResponse.message || "Lỗi");
      }
      router.push(`${routePrefix}/`);
    } catch (error: any) {
    } finally {
      setLoading(false);
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
          {pageTitle}
        </div>
        <div
          style={{ overflowY: "auto", height: "calc(100vh - 170px)" }}
          className="w-full mt-[15px] hidden-scroll bg-[#FFFFFF] rounded-[12px]"
        >
          <div className="w-full px-[16px] flex flex-col justify-start items-center">
            <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              {id ? "Chi tiết sản phẩm" : "Thêm sản phẩm mới"}
              <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
                {id ? "Xem và chỉnh sửa thông tin sản phẩm." : "Nhập thông tin để thêm sản phẩm mới."}
              </span>
            </div>
            <div className="w-full flex justify-center items-start mt-[40px] pb-[100px]">
              <div className="w-full flex px-[150px] justify-start items-start">
                <div className="w-[20%] text-start text-[#212222] text-[14px] font-medium">
                  Thông tin sản phẩm
                </div>
                <div className="w-[80%] flex flex-col justify-start items-start gap-[20px]">
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên sản phẩm"
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${errors.name ? "border-[#FF7777] border-[2px]" : ""}`}
                    />
                    {serverErrors.name && <p className="mt-[5px] text-[12px] text-red-500">{serverErrors.name}</p>}
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="Nhập mã SKU"
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${errors.sku ? "border-[#FF7777] border-[2px]" : ""}`}
                    />
                    {serverErrors.sku && <p className="mt-[5px] text-[12px] text-red-500">{serverErrors.sku}</p>}
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Danh mục
                    </label>
                    <Select
                      allowClear
                      placeholder="Chọn danh mục"
                      className="h-[32px] w-full mt-[8px]"
                      value={categoryId}
                      onChange={(value) => setCategoryId(value)}
                      options={categoryOptions}
                      disabled={!!defaultCategoryId}
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Mô tả ngắn
                    </label>
                    <TextArea
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Nhập mô tả ngắn"
                      rows={2}
                      className="w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Mô tả chi tiết
                    </label>
                    <TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả chi tiết"
                      rows={4}
                      className="w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full flex gap-[20px]">
                    <div className="w-[33%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Giá bán (JPY)</label>
                      <Input value={priceJpy} onChange={(e) => setPriceJpy(e.target.value)} placeholder="Nhập giá bán" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                    <div className="w-[33%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Giá gốc (JPY)</label>
                      <Input value={originalPriceJpy} onChange={(e) => setOriginalPriceJpy(e.target.value)} placeholder="Nhập giá gốc" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                    <div className="w-[33%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Giá nhập (JPY)</label>
                      <Input value={costPriceJpy} onChange={(e) => setCostPriceJpy(e.target.value)} placeholder="Nhập giá nhập" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                  </div>
                  <div className="w-full flex gap-[20px]">
                    <div className="w-[33%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Điểm tích lũy</label>
                      <Input value={points} onChange={(e) => setPoints(e.target.value)} placeholder="Nhập điểm" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                    <div className="w-[33%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Tình trạng</label>
                      <Select allowClear placeholder="Chọn tình trạng" className="h-[32px] w-full mt-[8px]" value={condition} onChange={(value) => setCondition(value)} options={CONDITIONS} />
                    </div>
                    <div className="w-[33%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Bảo hành (tháng)</label>
                      <Input value={warrantyMonths} onChange={(e) => setWarrantyMonths(e.target.value)} placeholder="Nhập số tháng bảo hành" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                  </div>
                  <div className="w-full flex gap-[20px]">
                    <div className="w-[50%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Số lượng tồn kho</label>
                      <Input value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="Nhập số lượng" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                    <div className="w-[50%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Loại kho</label>
                      <Select allowClear placeholder="Chọn loại kho" className="h-[32px] w-full mt-[8px]" value={stockType} onChange={(value) => setStockType(value)} options={STOCK_TYPES} />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">Thông tin sản phẩm</label>
                    <TextArea value={productInfo} onChange={(e) => setProductInfo(e.target.value)} placeholder="Nhập thông tin sản phẩm (bảo hành, khuyến mãi...)" rows={4} className="w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">Thông tin deal</label>
                    <TextArea value={dealInfo} onChange={(e) => setDealInfo(e.target.value)} placeholder="Nhập thông tin deal (nếu có)" rows={3} className="w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                  </div>
                  <div className="w-full flex gap-[20px]">
                    <div className="w-[50%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Năm sản xuất</label>
                      <Input value={attrYear} onChange={(e) => setAttrYear(e.target.value)} placeholder="Nhập năm sản xuất" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                    <div className="w-[50%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Màu sắc</label>
                      <Input value={attrColor} onChange={(e) => setAttrColor(e.target.value)} placeholder="Nhập màu sắc" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                  </div>
                  <div className="w-full flex gap-[20px]">
                    <div className="w-[50%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Bảo mật</label>
                      <Input value={attrSecurity} onChange={(e) => setAttrSecurity(e.target.value)} placeholder="Nhập thông tin bảo mật" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                    <div className="w-[50%]">
                      <label className="text-[14px] font-[400] text-[#000000]">Pin</label>
                      <Input value={attrBattery} onChange={(e) => setAttrBattery(e.target.value)} placeholder="Nhập thông tin pin" className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]" />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">Hình ảnh</label>
                    {existingImages.length > 0 && (
                      <div className="flex gap-[10px] mt-[8px] flex-wrap">
                        {existingImages.map((img) => (
                          <div key={img.id} className="relative w-[100px] h-[100px] rounded-[8px] overflow-hidden border-2 border-[#C8C8C8]">
                            <Image src={img.image_url.startsWith("http") ? img.image_url : `${process.env.NEXT_PUBLIC_API_URL?.replace("/admin-api/v1", "")}/storage/${img.image_url}`} width={100} height={100} className="object-cover w-full h-full" alt="product" unoptimized={true} />
                            <button onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white w-[20px] h-[20px] rounded-full text-[10px] flex items-center justify-center" type="button">X</button>
                          </div>
                        ))}
                      </div>
                    )}
                    {images.length > 0 && (
                      <div className="flex gap-[10px] mt-[8px] flex-wrap">
                        {images.map((img, index) => (
                          <div key={index} className="relative w-[100px] h-[100px] rounded-[8px] overflow-hidden border-2 border-[#C8C8C8]">
                            <Image src={URL.createObjectURL(img)} width={100} height={100} className="object-cover w-full h-full" alt="new" unoptimized={true} />
                            <button onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-red-500 text-white w-[20px] h-[20px] rounded-full text-[10px] flex items-center justify-center" type="button">X</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-[10px]">
                      <label htmlFor="ipad-images" className="w-[130px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] flex justify-center items-center gap-[5px] hover:scale-105 transition-all duration-200">
                        <Image src="/epack/icon_plus.svg" alt="" width={10} height={6} style={{ objectFit: "cover" }} />
                        Chọn hình ảnh
                      </label>
                      <input id="ipad-images" type="file" accept="image/*" multiple onClick={(e) => { (e.target as HTMLInputElement).value = ""; }} onChange={handleImageChange} style={{ display: "none" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[60px] fixed top-auto bottom-0 w-full ml-[-33px] flex justify-end items-center bg-[#FFFFFF] border-t-[2px] border-[#C8C8C8]">
          <div className="w-[175px] h-[36px] mr-[300px] flex justify-start items-center">
            <div onClick={() => router.back()} className="cursor-pointer rounded-[8px] w-[80px] h-[36px] text-[#9E9E9E] border-[2px] border-[#9E9E9E] font-medium text-[12px] flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]">
              Quay lại
            </div>
            <div className={`${name && sku ? "bg-[#212222]" : "bg-[#9E9E9E]"} cursor-pointer text-[#FFFFFF] rounded-[8px] w-[80px] h-[36px] ml-[11px] flex justify-center items-center text-[12px] font-medium hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]`} onClick={handleSubmit}>
              {id ? "Cập nhật" : "Đăng ký"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Create;
