"use client";
import { Input, Spin, message } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { ICategoryDetailResponse } from "@/types/admin/category";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

const Create = ({ id }: { id?: string }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState({
    name: false,
    slug: false,
  });

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const response = await sendRequest<ICategoryDetailResponse>({
        url: `/admin/shop-categories/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const cat = response.data.category;
      setName(cat.name);
      setSlug(cat.slug);
      setDescription(cat.description || "");
      if (cat.image_url) {
        setImagePreview(cat.image_url);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: !name,
      slug: !slug,
    };
    setErrors(newErrors);
    if (newErrors.name || newErrors.slug) {
      return;
    }

    setLoading(true);
    const token = getToken();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("slug", slug);
      if (description) formData.append("description", description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = id
        ? `${NEXT_PUBLIC_API_URL}/admin/shop-categories/${id}`
        : `${NEXT_PUBLIC_API_URL}/admin/shop-categories`;

      await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw err;
        }
        return res.json();
      });

      message.success(id ? "Cập nhật danh mục thành công" : "Tạo danh mục thành công");
      router.push("/admin/category/");
    } catch (error: any) {
      message.error(error?.message || "Có lỗi xảy ra");
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
          Quản lý danh mục
        </div>
        <div
          style={{
            overflowY: "auto",
            height: "calc(100vh - 120px)",
          }}
          className="w-full mt-[15px] hidden-scroll bg-[#FFFFFF] rounded-[12px]"
        >
          <div className="w-full h-full px-[16px] flex flex-col justify-start items-center">
            <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              {id ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
              <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
                {id ? "Chỉnh sửa thông tin danh mục." : "Nhập thông tin danh mục mới."}
              </span>
            </div>
            <div className="w-full flex justify-center items-start mt-[60px] pb-[100px]">
              <div className="w-full flex px-[230px] justify-start items-start">
                <div className="w-[25%] text-start text-[#212222] text-[14px] font-medium">
                  Thông tin danh mục
                </div>
                <div className="w-[75%] flex flex-col justify-start items-start gap-[20px]">
                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Tên danh mục <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập tên danh mục"
                      className={`${
                        errors.name ? "border-[#FF7777] border-[2px]" : ""
                      } h-[35px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]`}
                    />
                  </div>

                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="Nhập slug (vd: men-watches)"
                      className={`${
                        errors.slug ? "border-[#FF7777] border-[2px]" : ""
                      } h-[35px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]`}
                    />
                  </div>

                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Mô tả
                    </label>
                    <TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Nhập mô tả danh mục"
                      rows={4}
                      className="w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>

                  <div className="w-full">
                    <label className="text-[14px] font-[400] text-[#000000]">
                      Hình ảnh
                    </label>
                    <div className="mt-[8px]">
                      {imagePreview ? (
                        <div className="relative inline-block">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={200}
                            height={150}
                            style={{ objectFit: "cover", borderRadius: "8px" }}
                            unoptimized
                          />
                          <div
                            onClick={handleRemoveImage}
                            className="absolute top-[-8px] right-[-8px] w-[24px] h-[24px] bg-red-500 text-white rounded-full flex justify-center items-center cursor-pointer text-[12px] hover:bg-red-600"
                          >
                            ✕
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-[200px] h-[150px] border-2 border-dashed border-[#C8C8C8] rounded-[8px] flex flex-col justify-center items-center cursor-pointer hover:border-[#212222] transition-all"
                        >
                          <Image
                            src="/epack/icon_plus.svg"
                            alt=""
                            width={20}
                            height={20}
                          />
                          <span className="text-[12px] text-[#9E9E9E] mt-[8px]">
                            Chọn hình ảnh
                          </span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
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
              className="cursor-pointer rounded-[8px] w-[80px] h-[36px] text-[#9E9E9E] border-[2px] border-[#9E9E9E] font-medium text-[12px] flex justify-center items-center hover:text-[15px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
            >
              Quay lại
            </div>
            <div
              className={`${
                name && slug ? "bg-[#212222]" : "bg-[#9E9E9E]"
              } cursor-pointer text-[#FFFFFF] rounded-[8px] w-[80px] h-[36px] ml-[11px] flex justify-center items-center text-[12px] font-medium hover:text-[15px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]`}
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
