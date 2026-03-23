"use client";
import { Input, Spin } from "antd";
import { useRouter } from "next/navigation";
import ImageUploader from "./uploadImg";
import { useEffect, useState } from "react";
import { sendRequest } from "@/utils/api";
import { getToken } from "@/api/ServerActions";
import { IProductDetailResponse } from "@/types/admin/product";

const Create = ({ id }: { id?: string }) => {
  const router = useRouter();
  const [jan_code, setJanCode] = useState<string>("");
  const [product_name, setProductName] = useState<string>("");
  const [product_number, setProductNumber] = useState<string>("");
  const [wsn_code, setWSNCode] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [color_number, setColorNumber] = useState<string>("");
  const [color_name, setColorName] = useState<string>("");
  const [size_code, setSizeCode] = useState<string>("");
  const [size_name, setSizeName] = useState<string>("");
  const [minimum_order_quantity, setMinimumOrderQuantity] = useState<
    number | null
  >(null);
  const [minimum_order_lot_size, setMinimumOrderLotSize] = useState<
    number | null
  >(null);
  const [reference_retail_price, setReferenceRetailPrice] = useState<
    number | null
  >(null);
  const [maker_code, setMakerCode] = useState<string>("");
  const [maker_name, setMakerName] = useState<string>("");
  const [unit_price, setUnitPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [thumbnail, setImage] = useState<File | string | null>(null);
  const [errorJanCode, setErrorJanCode] = useState<string>("");
  const [errorProductName, setErrorProductName] = useState<string>("");
  const [errorProductNumber, setErrorProductNumber] = useState<string>("");
  const [errorWSNCode, setErrorWSNCode] = useState<string>("");
  const [errorSizeCode, setErrorSizeCode] = useState<string>("");
  const [errorSizeName, setErrorSizeName] = useState<string>("");
  const [errorThumbnail, setErrorThumbnail] = useState<string>("");
  const [errors, setErrors] = useState({
    jan_code: false,
    product_name: false,
    product_number: false,
    wsn_code: false,
    size_code: false,
    size_name: false,
    thumbnail: false,
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        setLoading(true);
        const token = await getToken();
        try {
          const response = await sendRequest<IProductDetailResponse>({
            url: `/admin/products/${id}`,
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setJanCode(response?.data?.product?.jan_code);
          setProductName(response?.data?.product?.product_name);
          setProductNumber(response?.data?.product?.product_number);
          setWSNCode(response?.data?.product?.wsn_code);
          setColor(response?.data?.product?.color);
          setColorNumber(response?.data?.product?.color_number);
          setColorName(response?.data?.product?.color_name);
          setSizeCode(response?.data?.product?.size_code);
          setSizeName(response?.data?.product?.size_name);
          setMinimumOrderQuantity(
            response?.data?.product?.minimum_order_quantity
          );
          setUnitPrice(response?.data?.product?.unit_price);
          setMinimumOrderLotSize(
            response?.data?.product?.minimum_order_lot_size
          );
          setReferenceRetailPrice(
            response?.data?.product?.reference_retail_price
          );
          setMakerCode(response?.data?.product?.maker_code);
          setMakerName(response?.data?.product?.maker_name);
          setImage(response?.data?.product?.thumbnail_url);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);
  const handleSubmit = async () => {
    setLoading(true);
    const newErrors = {
      jan_code: !jan_code,
      product_name: !product_name,
      product_number: !product_number,
      wsn_code: !wsn_code,
      size_code: !size_code,
      size_name: !size_name,
      thumbnail: !thumbnail,
    };
    setErrors(newErrors);
    if (
      newErrors.jan_code ||
      newErrors.product_name ||
      newErrors.product_number ||
      newErrors.size_code ||
      newErrors.size_name ||
      newErrors.thumbnail ||
      newErrors.wsn_code
    ) {
      setLoading(false);
      return;
    }
    const token = await getToken();
    const formData = new FormData();
    formData.append("jan_code", jan_code);
    formData.append("product_name", product_name);
    formData.append("product_number", product_number);
    formData.append("wsn_code", wsn_code);
    formData.append("color", color);
    formData.append("color_number", color_number);
    formData.append("color_name", color_name);
    formData.append("size_code", size_code);
    formData.append("size_name", size_name);

    formData.append("minimum_order_quantity", String(minimum_order_quantity));
    formData.append("unit_price", String(unit_price));
    formData.append("minimum_order_lot_size", String(minimum_order_lot_size));
    formData.append("reference_retail_price", String(reference_retail_price));
    formData.append("maker_code", maker_code);
    formData.append("maker_name", maker_name);
    if (thumbnail instanceof File) {
      formData.append("thumbnail", thumbnail);
    }
    if (id) {
      formData.append("_method", "put");
    }
    try {
      const url = id
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/products`;
      const method = "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        if (Array.isArray(errorResponse?.errors?.jan_code)) {
          setErrorJanCode(errorResponse.errors.jan_code.join(", "));
        }
        if (Array.isArray(errorResponse?.errors?.product_name)) {
          setErrorProductName(errorResponse.errors.product_name.join(", "));
        }
        if (Array.isArray(errorResponse?.errors?.product_number)) {
          setErrorProductNumber(errorResponse.errors.product_number.join(", "));
        }

        if (Array.isArray(errorResponse?.errors?.wsn_code)) {
          setErrorWSNCode(errorResponse.errors.wsn_code.join(", "));
        }
        if (Array.isArray(errorResponse?.errors?.size_name)) {
          setErrorSizeName(errorResponse.errors.size_name.join(", "));
        }
        if (Array.isArray(errorResponse?.errors?.size_code)) {
          setErrorSizeCode(errorResponse.errors.size_code.join(", "));
        }
        if (Array.isArray(errorResponse?.errors?.thumbnail)) {
          setErrorThumbnail(errorResponse.errors.thumbnail.join(", "));
        }
        throw new Error(errorResponse.message || "Cập nhật thất bại");
      }
      router.push("/admin/clock/");
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Quản lý sản phẩm
        </div>
        <div
          style={{
            overflowY: "auto",
            height: "calc(100vh - 170px)",
          }}
          className="w-full mt-[15px] hidden-scroll bg-[#FFFFFF] rounded-[12px]"
        >
          <div className="w-full  px-[16px] flex flex-col justify-start items-center   ">
            <div className="pb-[8px] pt-[5px]  w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              {id ? "Chi tiết sản phẩm" : "Thêm sản phẩm mới"}
              <span className=" text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
                {id
                  ? "Xem và chỉnh sửa thông tin sản phẩm."
                  : "Nhập thông tin để thêm sản phẩm mới."}
              </span>
            </div>{" "}
            <div className="w-full flex justify-center items-start mt-[60px] pb-[100px]">
              <div className="w-full flex px-[230px] justify-start items-start">
                <div className="w-[25%] text-start text-[#212222] text-[14px] font-medium">
                  Thông tin hiển thị
                </div>
                <div className="w-[75%] flex flex-col justify-start items-start gap-[20px]">
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mã hãng
                    </label>
                    <Input
                      value={maker_code}
                      onChange={(e) => setMakerCode(e.target.value)}
                      placeholder="Nhập mã hãng."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Hãng sản xuất
                    </label>
                    <Input
                      value={maker_name}
                      onChange={(e) => setMakerName(e.target.value)}
                      placeholder="Nhập tên hãng."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mã JAN
                    </label>
                    <Input
                      value={jan_code}
                      onChange={(e) => setJanCode(e.target.value)}
                      placeholder="Nhập mã JAN."
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${
                        errors.jan_code
                          ? "border-[#FF7777] border-[2px]"
                          : "border-[#E5E7EA]"
                      } focus:outline-none`}
                    />
                    {errorJanCode && (
                      <p className="mt-[10px] text-[12px] text-red-500">
                        {errorJanCode}
                      </p>
                    )}
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mã WSN
                    </label>
                    <Input
                      value={wsn_code}
                      onChange={(e) => setWSNCode(e.target.value)}
                      placeholder="Nhập mã WSN."
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${
                        errors.wsn_code
                          ? "border-[#FF7777] border-[2px]"
                          : "border-[#E5E7EA]"
                      } focus:outline-none`}
                    />
                    {errorWSNCode && (
                      <p className="mt-[10px] text-[12px] text-red-500">
                        {errorWSNCode}
                      </p>
                    )}
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mã sản phẩm
                    </label>
                    <Input
                      value={product_number}
                      onChange={(e) => setProductNumber(e.target.value)}
                      placeholder="Nhập mã sản phẩm."
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${
                        errors.product_number
                          ? "border-[#FF7777] border-[2px]"
                          : "border-[#E5E7EA]"
                      } focus:outline-none`}
                    />
                    {errorProductNumber && (
                      <p className="mt-[10px] text-[12px] text-red-500">
                        {errorProductNumber}
                      </p>
                    )}
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Tên sản phẩm
                    </label>
                    <Input
                      value={product_name}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Nhập tên sản phẩm."
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${
                        errors.product_name
                          ? "border-[#FF7777] border-[2px]"
                          : "border-[#E5E7EA]"
                      } focus:outline-none`}
                    />
                    {errorProductName && (
                      <p className="mt-[10px] text-[12px] text-red-500">
                        {errorProductName}
                      </p>
                    )}
                  </div>

                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Màu sắc
                    </label>
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Nhập màu sắc."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mã màu hãng
                    </label>
                    <Input
                      value={color_number}
                      onChange={(e) => setColorNumber(e.target.value)}
                      placeholder="Nhập mã màu hãng."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Tên màu hãng
                    </label>
                    <Input
                      value={color_name}
                      onChange={(e) => setColorName(e.target.value)}
                      placeholder="Nhập tên màu hãng."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mã kích cỡ
                    </label>
                    <Input
                      value={size_code}
                      onChange={(e) => setSizeCode(e.target.value)}
                      placeholder="Nhập mã kích cỡ."
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${
                        errors.size_code
                          ? "border-[#FF7777] border-[2px]"
                          : "border-[#E5E7EA]"
                      } focus:outline-none`}
                    />
                    {errorSizeCode && (
                      <p className="mt-[10px] text-[12px] text-red-500">
                        {errorSizeCode}
                      </p>
                    )}
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Kích cỡ
                    </label>
                    <Input
                      value={size_name}
                      onChange={(e) => setSizeName(e.target.value)}
                      placeholder="Nhập kích cỡ."
                      className={`h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E] ${
                        errors.size_name
                          ? "border-[#FF7777] border-[2px]"
                          : "border-[#E5E7EA]"
                      } focus:outline-none`}
                    />
                    {errorSizeName && (
                      <p className="mt-[10px] text-[12px] text-red-500">
                        {errorSizeName}
                      </p>
                    )}
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Số lượng đặt tối thiểu
                    </label>
                    <Input
                      value={minimum_order_quantity ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMinimumOrderQuantity(
                          value === "" ? null : Number(value)
                        );
                      }}
                      placeholder="Nhập số lượng đặt tối thiểu."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Đơn giá tiêu chuẩn
                    </label>
                    <Input
                      value={unit_price ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setUnitPrice(value === "" ? null : Number(value));
                      }}
                      placeholder="Nhập giá tham khảo."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Giá bán lẻ tham khảo
                    </label>
                    <Input
                      value={reference_retail_price ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setReferenceRetailPrice(
                          value === "" ? null : Number(value)
                        );
                      }}
                      placeholder="Nhập giá tham khảo."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Phân loại
                    </label>
                    <Input
                      value={minimum_order_lot_size ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setMinimumOrderLotSize(
                          value === "" ? null : Number(value)
                        );
                      }}
                      placeholder="Nhập phân loại."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <ImageUploader
                    label="Hình ảnh"
                    image={thumbnail}
                    onChange={setImage}
                    error={errors.thumbnail}
                  />
                  {errorThumbnail && (
                    <p className="mt-[10px] text-[12px] text-red-500">
                      {errorThumbnail}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
        <div className="h-[60px] fixed top-auto bottom-0 w-full ml-[-33px] flex justify-end items-center bg-[#FFFFFF] border-t-[2px] border-[#C8C8C8]">
          <div className="w-[175px] h-[36px] mr-[300px] flex justify-start items-center">
            <div
              onClick={() => router.back()}
              className="cursor-pointer rounded-[8px] w-[80px] h-[36px] text-[#9E9E9E] border-[2px] border-[#9E9E9E] font-medium text-[12px] flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            >
              Quay lại
            </div>
            <div
              className={`${
                jan_code &&
                product_name &&
                product_number &&
                wsn_code &&
                size_code &&
                size_name &&
                thumbnail
                  ? "bg-[#212222]"
                  : "bg-[#9E9E9E]"
              } cursor-pointer  text-[#FFFFFF] rounded-[8px] w-[80px] h-[36px] ml-[11px] flex justify-center items-center text-[12px] font-medium hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20`}
              onClick={handleSubmit}
            >
              {id ? "Cập nhật" : "Đăng ký"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Create;
