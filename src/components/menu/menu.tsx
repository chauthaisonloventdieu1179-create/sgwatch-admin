"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import {
  LayoutDashboard,
  Watch,
  Laptop,
  Smartphone,
  ShoppingCart,
  Image as ImageIcon,
  Tags,
  Bell,
  Users,
  CircleUser,
  FolderTree,
  Award,
  MessageSquare,
  Star,
  MonitorSmartphone,
  Tablet,
  Flame,
  BookOpen,
  LayoutList,
  ArrowLeftRight,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface NavigationItem {
  key: string;
  name: string;
  href: string;
  icon: LucideIcon;
  children?: { key: string; name: string; href: string }[];
}

const navigation: NavigationItem[] = [
  {
    key: "dashboard",
    name: "Dashboard",
    href: "/admin/dashboard/",
    icon: LayoutDashboard,
  },
  {
    key: "inventory",
    name: "Xuất nhập hàng",
    href: "/admin/inventory/",
    icon: ArrowLeftRight,
  },
  {
    key: "chat",
    name: "Chat",
    href: "/admin/chat/",
    icon: MessageSquare,
  },
  {
    key: "order",
    name: "Danh sách đơn hàng",
    href: "/admin/order/",
    icon: ShoppingCart,
  },
  {
    key: "clock",
    name: "Danh sách đồng hồ",
    href: "/admin/clock/",
    icon: Watch,
  },
  {
    key: "laptop",
    name: "Danh sách laptop",
    href: "/admin/laptop/",
    icon: Laptop,
  },
  // {
  //   key: "sim",
  //   name: "Danh sách sim",
  //   href: "/admin/sim/",
  //   icon: Smartphone,
  // },
  {
    key: "macbook",
    name: "Danh sách Macbook",
    href: "/admin/macbook/",
    icon: MonitorSmartphone,
  },
  {
    key: "ipad",
    name: "Danh sách iPad",
    href: "/admin/ipad/",
    icon: Tablet,
  },
  {
    key: "category",
    name: "Danh mục sản phẩm",
    href: "/admin/category/",
    icon: FolderTree,
  },
  {
    key: "brand",
    name: "Thương hiệu",
    href: "/admin/brand/",
    icon: Award,
  },
  {
    key: "banner",
    name: "Danh sách banner",
    href: "/admin/banner/",
    icon: ImageIcon,
  },
  {
    key: "blog",
    name: "Quản lý Blog",
    href: "/admin/blog/",
    icon: BookOpen,
  },
  {
    key: "collection",
    name: "Bộ sưu tập",
    href: "/admin/collection/",
    icon: LayoutList,
  },
  {
    key: "discount",
    name: "Danh sách discount",
    href: "/admin/discount/",
    icon: Tags,
  },
  {
    key: "announcement",
    name: "Danh sách thông báo",
    href: "/admin/announcementMaint/",
    icon: Bell,
  },
  {
    key: "users",
    name: "Danh sách người dùng",
    href: "/admin/users/",
    icon: Users,
  },
  {
    key: "featured",
    name: "SP nổi bật trang chủ",
    href: "/admin/featured/",
    icon: Star,
  },
  {
    key: "bigsale",
    name: "Big Sale",
    href: "/admin/bigsale/",
    icon: Flame,
  },
  {
    key: "profile",
    name: "Trang cá nhân",
    href: "/admin/profile/",
    icon: CircleUser,
  },
];

function classNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
const HomeMenuSideBar = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await sendRequest<any>({
        url: "/chat/conversations",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { page: 1, limit: 1, is_hidden: false },
      });
      setUnreadCount(res.data?.pagination?.total_unread_count ?? 0);
    } catch {}
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    const handleChatChanged = () => fetchUnreadCount();
    window.addEventListener("chat-unread-changed", handleChatChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener("chat-unread-changed", handleChatChanged);
    };
  }, [fetchUnreadCount]);
  useEffect(() => {
    const currentItem = navigation.find((item) =>
      pathname.startsWith(item.href),
    );
    if (currentItem) {
      setCurrentTab(currentItem.key);
    } else {
      setCurrentTab(null);
    }
  }, [pathname]);
  if (!isMounted) return null;

  return (
    <div className="h-screen">
      <div className="h-screen lg:fixed bg-[#FFFFFF] w-[257px] lg:inset-y-0 lg:z-50 lg:flex lg:flex-col border-r-[2px] border-[#C8C8C8]">
        <div className="relative flex grow gap-y-1 overflow-hidden w-[250px] mt-[75px]">
          <nav className="flex px-2 flex-1 flex-col w-[85%] bg-bg_bg_menu_tc">
            <ul
              role="list"
              className="flex flex-1 mt-[20px] flex-col overflow-auto hidden-scroll"
            >
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li className="mt-[4px]" key={item.key}>
                    <Link
                      href={item.href}
                      className={classNames(
                        currentTab === item.key
                          ? "bg-[#212222] text-white"
                          : "text-[#0D1526] hover:bg-[#212222]",
                        "group flex gap-x-3 pl-[15px] p-2 text-sm leading-6 font-semibold font-source-han-sans-jp text-[14px] rounded-[12px]",
                      )}
                    >
                      <div className="w-[24px] flex justify-center items-center">
                        <Icon
                          size={20}
                          className={classNames(
                            "shrink-0 group-hover:text-white",
                            currentTab === item.key
                              ? "text-white"
                              : "text-[#0D1526]",
                          )}
                        />
                      </div>
                      <span
                        style={{ whiteSpace: "pre-line" }}
                        className="group-hover:text-white text-[14px] font-medium flex-1"
                      >
                        {item.name}
                      </span>
                      {item.key === "chat" && unreadCount > 0 && (
                        <span className="min-w-[20px] h-[20px] px-[6px] flex items-center justify-center rounded-full bg-red-500 text-white text-[11px] font-bold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default HomeMenuSideBar;
