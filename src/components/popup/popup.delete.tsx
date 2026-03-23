import Image from "next/image";
interface DeleteProps {
  moduleText: string;
  confirm: string;
  id: string | number | null;
  onClose: () => void;
  onDelete: () => void;
}
const Delete: React.FC<DeleteProps> = ({
  moduleText,
  confirm,
  id,
  onClose,
  onDelete,
}) => {
  return (
    <>
      <div className="">
        <div className="w-[512px] h-[204px] flex justify-center items-center bg-[#FFFFFF] rounded-[10px] border-[1px] border-[#D1D5DB]">
          <div className="w-[472px] h-[156px] flex justify-start items-start ">
            <div className="min-w-[40px] h-[40px] flex justify-center items-center rounded-full bg-[#FEE2E2]">
              <Image
                src="/images/icon_confirm_delete.svg"
                alt="My Icon"
                width={19.21}
                height={17.25}
                className="object-cover"
              />
            </div>
            <div className="ml-[16px] w-full h-full flex flex-col justify-start items-start">
              <div className="h-[109px] w-full flex flex-col justify-start items-start">
                <div className="h-[20px] text-[16px] font-medium text-[#111827]">
                  Xác nhận xóa
                </div>
                <div className="h-[20px] mt-[8px] text-[14px] font-normal text-[#111827]">
                  {moduleText}
                </div>
                <div className="h-[20px] pl-[2px] mt-[13px] text-[14px] font-normal text-[#6B7280]">
                  [ {confirm} ]
                </div>
                <div className="h-[20px]  mt-[4px] text-[14px] font-normal text-[#6B7280]">
                  {id}
                </div>
              </div>
              <div className="w-full mt-[11px] flex justify-end items-center h-[36px]">
                <div
                  onClick={onClose}
                  className="w-[96px] rounded-[5px] mr-[8px] h-[36px] border-[1px] border-[#D1D5DB] flex justify-center items-center cursor-pointer text-[14px] text-[#111827] font-medium transition-all duration-200 ease-out
      hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 hover:shadow
      motion-safe:active:scale-[0.98] active:bg-gray-100
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-gray-400/50 focus-visible:ring-offset-2"
                >
                  Hủy
                </div>
                <div
                  onClick={onDelete}
                  className="w-[52px] rounded-[5px] h-[36px] bg-[#DC2626] flex justify-center items-center cursor-pointer text-[14px] text-[#FFFFFF] font-medium transition-all duration-200 ease-out
      hover:bg-[#b91c1c] hover:shadow-md
      motion-safe:active:scale-[0.98] active:brightness-95
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-red-500/60 focus-visible:ring-offset-2"
                >
                  Xóa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Delete;
