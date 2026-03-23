"use client";
import { sendRequest } from "@/utils/api";
import { Box, Grid } from "@mui/material";
import { Input, Button, Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert } from "antd";

const AuthSignUp = () => {
  const router = useRouter();
  const [login_id, setLoginId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [password_confirmation, setPasswordConfirmation] = useState<string>("");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [errorId, setErrorID] = useState<string>("");
  const [errorEmail, setErrorEmail] = useState<string>("");
  const [errorPassword, setErrorPassword] = useState<string>("");
  const [errorsForm, setErrorsForm] = useState({
    login_id: false,
    email: false,
    name: false,
    password: false,
    password_confirmation: false,
  });
  const handleChangeSign = () => {
    router.push("/auth/signin");
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setErrorID("");
    const newErrors = {
      login_id: !login_id,
      email: !email,
      name: !name,
      password: !password,
      password_confirmation: !password_confirmation,
    };
    setErrorsForm(newErrors);
    if (
      newErrors.login_id ||
      newErrors.email ||
      newErrors.name ||
      newErrors.password ||
      newErrors.password_confirmation
    ) {
      setLoading(false);
      return;
    }
    try {
      await sendRequest({
        url: "/register",
        method: "POST",
        body: { login_id, email, name, password, password_confirmation },
      });
      router.push("/auth/signin");
    } catch (err: any) {
      setError(err?.message);
      if (err?.errors?.login_id?.length > 0) {
        setErrorID(err?.errors?.login_id[0]);
      }
      if (err?.errors?.email?.length > 0) {
        setErrorEmail(err?.errors.email[0]);
      }
      if (err?.errors?.password?.length > 0) {
        setErrorPassword(err?.errors.password.join(", "));
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setPageLoading(false);
  }, []);
  return (
    <Box sx={{}}>
      {pageLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Grid
          container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "calc(100vh - 30px)",
          }}
        >
          <Grid item xs={12} sm={8} md={5} lg={3.5}>
            <div style={{ margin: "20px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                {error && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    style={{
                      position: "fixed",
                      top: 20,
                      right: 20,
                      width: "300px",
                      zIndex: 9999,
                    }}
                  />
                )}
                <p
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "36px",
                    fontWeight: "800",
                    color: "#26488C",
                    height: "52px",
                    marginBottom: "0px",
                  }}
                >
                  TAMAYURA U-SYS
                </p>
                <p
                  style={{
                    marginTop: "24px",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "20px",
                    fontWeight: "500",
                    color: "#0D1526",
                    height: "29px",
                    marginBottom: "0px",
                  }}
                >
                  Đăng ký tài khoản
                </p>
                <label
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    textAlign: "start",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0D1526",
                  }}
                >
                  ID
                </label>
                <Input
                  style={{ marginTop: "8px" }}
                  value={login_id}
                  onChange={(e) => setLoginId(e.target.value)}
                  className={`${
                    errorsForm.login_id
                      ? "border-[#FF7777] border-[2px]"
                      : "border-[#E5E7EA]"
                  } focus:outline-none`}
                />
                {errorId && (
                  <div
                    className="mt-[3px] mb-[-15px] text-[12px] font-normal text-start w-full "
                    style={{ color: "red" }}
                  >
                    {errorId}
                  </div>
                )}
                <label
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    textAlign: "start",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0D1526",
                  }}
                >
                  Email
                </label>
                <Input
                  style={{ marginTop: "8px" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${
                    errorsForm.email
                      ? "border-[#FF7777] border-[2px]"
                      : "border-[#E5E7EA]"
                  } focus:outline-none`}
                />
                {errorEmail && (
                  <div
                    className="mt-[3px] mb-[-15px] text-[12px] font-normal text-start w-full "
                    style={{ color: "red" }}
                  >
                    {errorEmail}
                  </div>
                )}
                <label
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    textAlign: "start",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0D1526",
                  }}
                >
                  Tên hiển thị
                </label>
                <Input
                  style={{ marginTop: "8px" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${
                    errorsForm.name
                      ? "border-[#FF7777] border-[2px]"
                      : "border-[#E5E7EA]"
                  } focus:outline-none`}
                />
                <label
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    textAlign: "start",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0D1526",
                  }}
                >
                  Mật khẩu
                </label>
                <Input.Password
                  style={{ marginTop: "8px" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${
                    errorsForm.password
                      ? "border-[#FF7777] border-[2px]"
                      : "border-[#E5E7EA]"
                  } focus:outline-none`}
                />
                {errorPassword && (
                  <div
                    className="mt-[3px] mb-[-15px] text-[12px] font-normal text-start w-full "
                    style={{ color: "red" }}
                  >
                    {errorPassword}
                  </div>
                )}
                <label
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    textAlign: "start",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#0D1526",
                  }}
                >
                  Xác nhận mật khẩu
                </label>
                <Input.Password
                  style={{ marginTop: "8px" }}
                  value={password_confirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className={`${
                    errorsForm.password_confirmation
                      ? "border-[#FF7777] border-[2px]"
                      : "border-[#E5E7EA]"
                  } focus:outline-none`}
                />
                <Button
                  style={{
                    width: "100%",
                    marginTop: "24px",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: "bold",
                    backgroundColor: "#26488C",
                  }}
                  type="primary"
                  loading={loading}
                  onClick={handleRegister}
                >
                  Tiếp tục (2/2)
                </Button>
                <p
                  style={{
                    width: "100%",
                    textAlign: "center",
                    marginTop: "24px",
                    fontSize: "14px",
                    fontWeight: "normal",
                    color: "#0D1526",
                    marginBottom: "0px",
                  }}
                >
                  Đã có tài khoản?{" "}
                  <span
                    onClick={handleChangeSign}
                    style={{
                      color: "#26488C",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Nhấn vào đây
                  </span>{" "}
                </p>
              </Box>
            </div>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
export default AuthSignUp;
