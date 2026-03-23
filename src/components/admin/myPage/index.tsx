"use client";
import avt from "../../../../public/avt_default.svg";
import { Input, Select, Spin } from "antd";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IProfile } from "@/types/admin/mypage";
import { getToken } from "@/api/ServerActions";
import { AppDispatch } from "@/lib/store/store";
import { useDispatch } from "react-redux";
import { fetchProfile } from "@/lib/store/features/user/accountSlice";
import { sendRequest } from "@/utils/api";
interface ProfileProps {
  profile: IProfile | null;
}
const MyPage = ({ profile }: ProfileProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [image, setImage] = useState<File | string | null>(null);
  const [name, setUserName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [password_confirmation, setPasswordConfirm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error_password, setErrorPassword] = useState<string>("");
  const [error_password_confirm, setErrorPasswordCf] = useState<string>("");

  //Effect
  useEffect(() => {
    if (profile) {
      setUserName(`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim());
      setEmail(profile?.email);
      if (profile?.avatar_url) {
        setImage(profile.avatar_url);
      }
    }
  }, [profile]);

  //End Effect

  // handle on off button submit image
  const hasImageChanged = (() => {
    if (!profile) return false;
    if (image instanceof File) return true;
    if (typeof image === "string" && image !== profile.avatar_url) return true;
    return false;
  })();
  //submit image
  const handleSubmitImage = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const token = await getToken();

    try {
      const formData = new FormData();

      if (image instanceof File) {
        formData.append("avatar", image);
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/profile/avatar`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || "Cập nhật thất bại");
      }
      dispatch(fetchProfile());
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };
  //submit profile

  const handleChangeProfile = async (e: React.FormEvent) => {
    setLoading(true);
    const token = await getToken();
    e.preventDefault();
    try {
      await sendRequest({
        url: "/admin/profile",
        method: "POST",
        body: {
          name,
          email,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      setUserName("");
      setEmail("");
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };
  //submit password
  const handleChangePassword = async (e: React.FormEvent) => {
    setLoading(true);
    const token = await getToken();
    e.preventDefault();
    try {
      await sendRequest({
        url: "/admin/profile/change-password",
        method: "POST",
        body: {
          password,
          password_confirmation,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(fetchProfile());
      setPassword("");
      setPasswordConfirm("");
    } catch (err: any) {
      if (err.errors.password.length > 0) {
        setErrorPassword(err.errors.password.join(", "));
      }
      if (err.errors.password_confirmation.length > 0) {
        setErrorPasswordCf(err.errors.password_confirmation.join(", "));
      }
    } finally {
      setLoading(false);
    }
  };
  // Hàm xử lý kéo và thả ảnh bằng react-dropzone
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file); // Lưu ảnh vào state
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 10 * 1024 * 1024,
  });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(file);
    }
  };
  const renderImage = (() => {
    if (typeof image === "string") {
      return (
        <Image
          src={image}
          alt="Avatar"
          width={128}
          height={128}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            maxWidth: "128px",
          }}
        />
      );
    }
    if (image instanceof File) {
      return (
        <Image
          src={URL.createObjectURL(image)}
          alt="Avatar"
          width={128}
          height={128}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
            maxWidth: "128px",
          }}
        />
      );
    }
    return (
      <Image
        src={avt}
        alt="Avatar"
        width={128}
        height={128}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          objectFit: "cover",
          maxWidth: "128px",
        }}
      />
    );
  })();
  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Trang cá nhân
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center  bg-[#FFFFFF] rounded-[12px] ">
          <div
            style={{
              overflowY: "auto",
              height: "calc(100vh - 150px)",
            }}
            className="w-full px-[66px]  hidden-scroll"
          >
            <div className="w-full mt-[57px] pb-[50px] flex justify-between gap-[100px]">
              <div
                style={{
                  width: "50%",
                  height: "128px",
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                }}
              >
                <div
                  className="hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                  style={{
                    minWidth: "128px",
                    height: "128px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                  }}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  {renderImage}
                </div>
                <div className="ml-[40px] flex flex-col justify-start items-start">
                  <div className="text-[14px] font-[400] text-[#000000] text-start">
                    Cài đặt ảnh đại diện
                  </div>
                  <div className="text-[12px] mt-[10px] font-[400] text-[#9E9E9E] text-start">
                    Kéo và thả ảnh vào vùng tròn hoặc nhấn nút chọn ảnh để tải ảnh lên.
                    <br />
                    Hỗ trợ ảnh JPG, GIF hoặc PNG có dung lượng tối đa 10MB.
                  </div>
                  <div className="flex justify-start items-start gap-[15px]">
                    <div className="flex flex-col justify-start items-start">
                      <div
                        className="w-[110px] mt-[20px] hover:bg-[#2e2f2f]  cursor-pointer h-[32px] bg-[#212222] text-[#FFFFFF] rounded-[8px] flex justify-center items-center font-medium text-[12px] hover:text-[15px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                        onClick={() =>
                          document.getElementById("fileInput")?.click()
                        }
                      >
                        Chọn ảnh
                      </div>
                      <input
                        id="fileInput"
                        type="file"
                        style={{ display: "none" }}
                        accept="image/jpeg, image/png, image/gif"
                        onChange={handleFileChange}
                      />
                    </div>
                    {hasImageChanged && (
                      <div
                        onClick={handleSubmitImage}
                        className="mt-[20px] bg-[#2e2f2f] hover:bg-[#2e2f2f] hover:scale-105 transition-all duration-200 cursor-pointer h-[32px] text-white w-[60px] flex justify-center items-center rounded-[8px] font-medium text-[12px]"
                      >
                        Cập nhật
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-[50%] flex flex-col justify-start items-start gap-[30px]">
                <div className="w-full flex flex-col justify-start items-start gap-[20px]">
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Tên người dùng
                    </label>
                    <Input
                      placeholder=""
                      value={name}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Email
                    </label>
                    <Input
                      placeholder=""
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                  <div className="w-full flex justify-end h-[32px]">
                    <div
                      onClick={handleChangeProfile}
                      className={`w-[70px] cursor-pointer h-full  ${
                        name && email
                          ? "bg-[#212222] hover:bg-[#2e2f2f] hover:scale-105 transition-all duration-200 "
                          : "bg-[#9E9E9E]"
                      } rounded-[10px] flex justify-center items-center font-medium text-[13px] text-[#FFFFFF] hover:text-[15px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20
`}
                    >
                      Cập nhật
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col justify-start items-start gap-[20px]">
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Mật khẩu mới
                    </label>
                    <Input.Password
                      placeholder=""
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                    <p className="mt-[10px] text-[12px] text-red-500">
                      {error_password}
                    </p>
                  </div>
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Xác nhận mật khẩu mới
                    </label>
                    <Input.Password
                      placeholder=""
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                    <p className="mt-[10px] text-[12px] text-red-500">
                      {error_password_confirm}
                    </p>
                  </div>
                  <div className="w-full flex justify-end h-[32px]">
                    <div
                      onClick={handleChangePassword}
                      className={`w-[70px] cursor-pointer h-full ${
                        password && password_confirmation
                          ? "bg-[#212222] hover:bg-[#2e2f2f] hover:scale-105 transition-all duration-200"
                          : "bg-[#9E9E9E]"
                      } rounded-[10px] flex justify-center items-center font-medium text-[13px] text-[#FFFFFF] hover:text-[15px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20
`}
                    >
                      Cập nhật
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default MyPage;
