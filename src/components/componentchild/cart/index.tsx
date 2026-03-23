import Image from "next/image";
const CartList = () => {
  const cartProducts = Array.from({ length: 15 }, (_, index) => index + 1);

  return (
    <div
      style={{
        height: "calc(100vh - 146px)",
      }}
      className="w-[90%]  relative"
    >
      <div className="border-b-[2px] pt-[8px] border-[#C8C8C8] pb-1 font-medium text-[14px] text-[#212222]">
        Giỏ hàng
      </div>
      <div
        style={{
          overflowY: "auto",
          height: "calc(100vh - 330px)",
        }}
        className="flex flex-col items-center"
      >
        <div className="mt-[20px] w-[90%] flex flex-col justify-start items-start gap-[12px]">
          {cartProducts.map((item, index) => (
            <div
              className="flex flex-col pb-[10px] w-full  justify-start items-start gap-[10px] border-b-[1.5px] border-[#C8C8C8]"
              key={index}
            >
              <div className="pl-4 text-start h-[12px] text-[10px] text-[#212222]">
                Aitos - Blouson
              </div>
              <div className="w-full flex justify-end items-start  h-[32px]  gap-[10px]">
                <div className="flex w-[120px] bg-[#EE7E87] h-[32px] rounded-[12px] cursor-pointer  justify-between px-[12px] items-center">
                  <div className="h-[18px] w-[18px] flex justify-center items-center">
                    <Image
                      src="/epack/distributor/cart/icon_tym.svg"
                      alt=""
                      width={13.45}
                      height={12.34}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="font-medium text-[10px] text-[#FFFFFF] ">
                    Thêm yêu thích
                  </div>
                </div>
                <div className="h-[32px] cursor-pointer w-[32px] rounded-[8px] border-[2px] border-[#C8C8C8] flex justify-center items-center">
                  <Image
                    src="/epack/distributor/cart/icon_remove.svg"
                    alt=""
                    width={13.14}
                    height={16.89}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-[30px] w-full absolute bottom-0  bg-[#212222] h-[32px] text-[12px] text-[#FFFFFF] font-medium rounded-[10px] cursor-pointer flex justify-center items-center">
        Nhập số lượng
      </div>
    </div>
  );
};

export default CartList;
