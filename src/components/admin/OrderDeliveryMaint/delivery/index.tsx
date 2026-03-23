"use client";
import { Input } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter } from "next/navigation";

const Create = ({ id }: { id?: string }) => {
  const router = useRouter();
  const handleSubmit = () => {
    router.push("/admin/orderDeliveryMaint?tab=delivery");
  };
  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Quản lý đặt hàng & giao hàng
        </div>
        <div
          style={{
            overflowY: "auto",
            height: "calc(100vh - 170px)",
          }}
          className="w-full mt-[15px] hidden-scroll bg-[#FFFFFF] rounded-[12px]"
        >
          <div className="w-full  px-[16px] flex flex-col justify-start items-center   ">
            <div className="pb-[8px] pt-[5px]  w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              {id
                ? "Chi tiết quản lý đặt hàng & giao hàng"
                : "Thêm mới quản lý đặt hàng & giao hàng"}
              <span className=" text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
                {id
                  ? "Bạn có thể xem và chỉnh sửa thông tin chi tiết quản lý đặt hàng & giao hàng."
                  : "Bạn có thể thêm mới quản lý đặt hàng & giao hàng."}
              </span>
            </div>{" "}
            <div className="w-full flex justify-center items-start mt-[60px] pb-[100px]">
              <div className="w-full flex px-[230px] justify-start items-start">
                <div className="w-[25%] text-start text-[#212222] text-[14px] font-medium">
                  Thông tin hiển thị
                </div>
                <div className="w-[75%] flex flex-col justify-start items-start gap-[20px]">
                  <div className="w-full ">
                    <label
                      htmlFor=""
                      className="text-[14px] font-[400] text-[#000000]"
                    >
                      Nơi giao hàng
                    </label>
                    <Input
                      placeholder="Vui lòng nhập nơi giao hàng."
                      className="h-[32px] w-full text-[14px] mt-[8px] font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
        <div className="h-[60px] fixed top-auto bottom-0 w-full ml-[-33px] flex justify-end items-center bg-[#FFFFFF] border-t-[2px] border-[#C8C8C8]">
          <div className="w-[115px] h-[36px] mr-[300px] flex justify-start items-center">
            <div
              onClick={handleSubmit}
              className="cursor-pointer rounded-[8px] w-[52px] h-[36px] text-[#9E9E9E] border-[2px] border-[#9E9E9E] font-medium text-[12px] flex justify-center items-center"
            >
              Quay lại
            </div>
            <div
              className="cursor-pointer rounded-[8px] w-[52px] h-[36px] ml-[11px] flex justify-center items-center text-[12px] font-medium"
              onClick={handleSubmit}
              style={{
                color: "#FFFFFF",
                backgroundColor: "#2E6FF2",
              }}
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
