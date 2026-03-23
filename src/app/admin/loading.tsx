import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="w-full flex justify-center items-center" style={{ height: "calc(100vh - 120px)" }}>
      <Spin size="large" />
    </div>
  );
}
