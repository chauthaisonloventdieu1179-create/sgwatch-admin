"use client";
import { useEffect, useRef, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Image from "next/image";
import avt from "../../../public/avt_default.svg";
import icon_dropdown from "../../../public/images/icon_muitenxuong.png";
import avt_big from "../../../public/avt_default.svg";
import { useRouter } from "next/navigation";
import { logout } from "@/app/api/auth/logout";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "@/lib/store/features/user/accountSlice";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/solid";
const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isSettingPage = pathname.startsWith("/setting/");
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const [selectedCompany, setSelectedCompany] =
    useState<string>("Công ty cổ phần");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.profile);
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
      router.push("/auth/signin");
    } catch (_error) {}
  };
  const handleBackHome = () => {
    router.push("/admin/dashboard/");
  };
  const handleClick = () => {
    if (profile?.avatar_url) {
      setShowMenu(false);
      setShowPreview(true);
    }
  };
  return (
    <>
      <div>
        <AppBar
          color="primary"
          sx={{
            position: "relative",
            top: 0,
            background: "#FFE6E5",
            boxShadow: "none",
            borderBottom: "2px solid #C8C8C8",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minWidth: 100,
              height: "66px",
              marginLeft: "30px",
              marginRight: "30px",
              position: "relative",
            }}
          >
            <div
              onClick={handleBackHome}
              className="cursor-pointer flex justify-start items-center"
            >
              <Image
                src="/logo_login.png"
                alt=""
                width={112}
                height={37}
                style={{ objectFit: "contain" }}
              />
            </div>

            <div className="" onClick={toggleMenu}>
              <div
                style={{
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                className="min-w-[44px] max-h-[4px]"
              >
                <Image
                  src={profile?.avatar_url || avt}
                  alt="Avatar"
                  width={44}
                  height={44}
                  style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  className="h-[44px] w-[44px]"
                />
              </div>
            </div>
            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "65px",
                  right: "30px",
                  width: "286px",
                  height: "291px",
                  borderRadius: "10px",
                  border: "1px solid #8A8A8A",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "start",
                  alignItems: "start",
                  backgroundColor: "white",
                }}
              >
                <div
                  style={{
                    width: "286px",
                    height: "236px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderBottom: "1.5px solid #707070",
                    position: "relative",
                  }}
                >
                  <div
                    onClick={toggleMenu}
                    style={{
                      position: "absolute",
                      width: "20px",
                      height: "20px",
                      top: 15,
                      right: 15,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      src="/images/icon_cancle.svg"
                      alt="Icon Cancel"
                      width={15}
                      height={15}
                    />
                  </div>
                  <div
                    style={{
                      width: "222px",
                      height: "172px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                      alignItems: "center",
                    }}
                  >
                    <div
                      onClick={handleClick}
                      style={{
                        width: "128px",
                        height: "128px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        src={profile?.avatar_url || avt_big}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="rounded-full object-cover  h-[128px] min-w-[128px]"
                      />
                    </div>
                    <div
                      style={{
                        width: "222px",
                        height: "20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "24px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#0D1526",
                      }}
                    >
                      {profile?.first_name} {profile?.last_name}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    width: "286px",
                    height: "54px",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "143px",
                      height: "54px",
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      borderRight: "1.5px solid #707070",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "100px",
                        height: "20px",
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        marginLeft: "17px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          src="/images/avt_public_null.svg"
                          alt=""
                          width={18}
                          height={18}
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div
                        onClick={() => router.push("/admin/profile/")}
                        style={{
                          marginLeft: "6px",
                          width: "74px",
                          height: "20px",
                          display: "flex",
                          justifyContent: "start",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#0D1526",
                        }}
                      >
                        Trang cá nhân
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "143px",
                      height: "54px",
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "100px",
                        height: "20px",
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        marginLeft: "17px",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Image
                          src="/images/icon_logout.svg"
                          alt="Logout Icon"
                          width={14.75}
                          height={17.21}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div
                        style={{
                          marginLeft: "6px",
                          width: "74px",
                          height: "20px",
                          display: "flex",
                          justifyContent: "start",
                          alignItems: "center",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#0D1526",
                        }}
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AppBar>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-[2000] bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="absolute top-5 right-5 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(false);
            }}
          >
            <XMarkIcon className="w-8 h-8 text-white" />
          </div>

          <div
            className="relative w-[60vw] h-[60vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={profile?.avatar_url || avt_big}
              alt="Preview"
              layout="fill"
              objectFit="contain"
              className="rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};
export default Header;
