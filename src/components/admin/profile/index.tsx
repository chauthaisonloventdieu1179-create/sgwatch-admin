"use client";
import { getToken } from "@/api/ServerActions";
import { IUserProfile, IUserProfileResponse } from "@/types/admin/users";
import { sendRequest } from "@/utils/api";
import { Input, Select, Spin, message } from "antd";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import { fetchProfile as fetchReduxProfile } from "@/lib/store/features/user/accountSlice";

const GENDERS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "unknown", label: "Khác" },
];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const ProfileForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [profile, setProfile] = useState<IUserProfile | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string>("unknown");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IUserProfileResponse>({
        url: "/user-info",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data.user;
      setProfile(user);
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setGender(user.gender || "unknown");
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("gender", gender);
      if (avatarFile) formData.append("avatar", avatarFile);

      const response = await fetch(`${BASE_URL}/update-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (response.ok) {
        message.success("Cập nhật thông tin thành công!");
        fetchProfile();
        dispatch(fetchReduxProfile());
        setAvatarFile(null);
      } else {
        const errorData = await response.json();
        message.error(errorData.message || "Cập nhật thất bại!");
      }
    } catch (error) {
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
          Trang cá nhân
        </div>
        <div className="w-full mt-[15px] px-[16px] py-[20px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Thông tin cá nhân
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và chỉnh sửa thông tin cá nhân.
            </span>
          </div>
          {profile && (
            <div className="w-full mt-[20px] px-[20px] flex flex-col justify-start items-start gap-[16px]">
              <div className="w-full flex justify-start items-center gap-[20px]">
                <div className="flex flex-col items-center gap-[8px]">
                  <div className="w-[80px] h-[80px] rounded-full bg-[#E6E6E6] flex justify-center items-center overflow-hidden">
                    {avatarPreview || profile.avatar_url ? (
                      <img
                        src={avatarPreview || profile.avatar_url || ""}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[24px] font-bold text-[#9E9E9E]">
                        {firstName.charAt(0).toUpperCase()}
                        {lastName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer text-[12px] text-[#212222] font-medium px-[12px] py-[4px] border border-[#C8C8C8] rounded-[6px] hover:bg-[#f5f5f5]">
                    Đổi ảnh
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="text-[16px] font-medium text-[#212222]">
                    {profile.first_name} {profile.last_name}
                  </div>
                  <div className="text-[13px] text-[#9E9E9E]">
                    {profile.email}
                  </div>
                  <div className="text-[13px] text-[#9E9E9E]">
                    Vai trò: {profile.role === "admin" ? "Quản trị viên" : "Người dùng"}
                  </div>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-[16px] mt-[10px]">
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#212222]">
                    Họ <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nhập họ"
                    className="h-[36px]"
                  />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#212222]">
                    Tên <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nhập tên"
                    className="h-[36px]"
                  />
                </div>
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-medium text-[#212222]">
                    Giới tính
                  </label>
                  <Select
                    value={gender}
                    onChange={(value) => setGender(value)}
                    options={GENDERS}
                    className="h-[36px] w-full"
                  />
                </div>
              </div>

              <div className="w-full flex justify-end mt-[10px]">
                <div
                  onClick={saving ? undefined : handleSave}
                  className={`cursor-pointer w-[120px] h-[36px] flex justify-center items-center bg-[#212222] text-white text-[13px] font-medium rounded-[10px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)] ${
                    saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default ProfileForm;
