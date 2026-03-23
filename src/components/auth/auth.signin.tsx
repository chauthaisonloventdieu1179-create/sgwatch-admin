"use client";
import { getToken, setToken, deleteToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Input, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AuthSignIn = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingToken, setCheckingToken] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorsForm, setErrorsForm] = useState({
    email: false,
    password: false,
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        router.push("/admin/dashboard/");
      } else {
        setCheckingToken(false);
      }
    };
    checkToken();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const newErrors = {
      email: !email,
      password: !password,
    };
    setErrorsForm(newErrors);
    if (newErrors.email || newErrors.password) {
      setLoading(false);
      return;
    }

    try {
      const response = await sendRequest<any>({
        url: "/login",
        method: "POST",
        body: { email, password },
      });
      const token = response?.data?.token || response?.access_token;
      await setToken(token);

      // Check role admin
      const userInfo = await sendRequest<any>({
        url: "/user-info",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (userInfo?.data?.user?.role !== "admin") {
        deleteToken();
        setError("Tài khoản không có quyền truy cập. Hệ thống chỉ dành cho quản trị viên.");
        return;
      }

      router.push("/admin/dashboard/");
    } catch (err) {
      setError((err as any)?.message || "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#F5F5F5]">
      <div className="w-[400px] bg-white rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.1)] px-[40px] py-[40px] flex flex-col items-center">
        <Image
          src="/logo_login.png"
          alt="Logo"
          width={160}
          height={53}
          style={{ objectFit: "contain" }}
          className="mb-[28px]"
        />

        <p className="w-full text-center text-[20px] font-[500] text-[#0D1526] mb-[24px]">
          Đăng nhập
        </p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-[500] text-[#0D1526]">
              Email
            </label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              className={`h-[40px] ${errorsForm.email ? "border-[#FF7777] border-[2px]" : ""}`}
            />
            {errorsForm.email && (
              <p className="text-[12px] text-red-500">Vui lòng nhập email</p>
            )}
          </div>

          <div className="flex flex-col gap-[6px]">
            <label className="text-[14px] font-[500] text-[#0D1526]">
              Mật khẩu
            </label>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className={`h-[40px] ${errorsForm.password ? "border-[#FF7777] border-[2px]" : ""}`}
            />
            {errorsForm.password && (
              <p className="text-[12px] text-red-500">Vui lòng nhập mật khẩu</p>
            )}
          </div>

          {error && (
            <p className="text-[13px] text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[42px] mt-[8px] bg-[#212222] text-white text-[14px] font-medium rounded-[10px] cursor-pointer flex justify-center items-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_8px_24px_rgba(0,0,0,.25)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Spin size="small" /> : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AuthSignIn;
