import { Airpods, User, Grid } from "@mynaui/icons-react";
import React from "react";

export type SidbarItem = {
  name: string;
  link?: string;
  icon?: React.ElementType | string;
  group?: boolean;
  children?: { name: string; link: string; icon?: React.ElementType }[];
};
const sidebar: SidbarItem[] = [
  {
    name: "Trang chủ", //Home
    icon: '/sidebar_icons/home.svg',
    link: "/management/home",
  },
  {
    name: "Yêu thích", //Favorite
    icon: '/sidebar_icons/love.svg',
    link: "/management/favorite",
  },
  {
    name: "Nhập số lượng", //Input data
    icon: '/sidebar_icons/calendar.svg',
    link: "/management/input",
  },
  {
    name: "Lịch sử", //History
    icon: '/sidebar_icons/history.svg',
    link: "/management/history",
  },
  {
    name: 'Liên hệ',
    group: true,
  },
  {
    name: "Đăng ký sản phẩm", //Product
    icon: '/sidebar_icons/clothes.svg',
    link: "/management/product",
  },

  {
    name: "Yêu cầu tính năng", //Feature Request
    icon: '/sidebar_icons/setting.svg',
    link: "/management/feature",
  },

  {
    name: "  Đăng ký tài khoản mới",
    icon: '/sidebar_icons/user.svg',
    link: "/management/register",
  },


  // {
  //   name: "Products",
  //   icon: Airpods,
  //   children: [
  //     {
  //       name: "Me",
  //       icon: User,
  //       link: "/management/me",
  //     },
  //     {
  //       name: "Profile",
  //       icon: User,
  //       link: "xx",
  //     },
  //   ],
  // }
];
export default sidebar;
