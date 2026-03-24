"use client";
import { Suspense } from "react";
import ClockList from "@/components/admin/clock/index";
const ClockPage = () => {
  return (
    <Suspense>
      <ClockList />
    </Suspense>
  );
};
export default ClockPage;
