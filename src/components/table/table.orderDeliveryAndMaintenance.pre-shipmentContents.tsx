"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IMaker } from "@/types/admin/maker";
interface IProps {
  makers: IMaker[];
  pagination?: React.ReactNode;
}

const Table = ({ makers, pagination }: IProps) => {
  const router = useRouter();
  const handleUpdate = (id: number) => {
    // route removed
  };

  return (
    <>
      <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
        <div className="max-h-[calc(100vh-210px)] overflow-y-auto hidden-scroll">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#FFFFFF",
            }}
          >
            <thead className="sticky top-0 z-10">
              <tr
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#0D1526",
                  textAlign: "left",
                }}
                className="bg-[#E6E6E6]"
              >
                <th
                  style={{
                    padding: "12px 16px",
                    width: "90%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                >
                  Danh sách hãng sản xuất
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    width: "10%",
                    textAlign: "left",
                    fontSize: "14px",
                  }}
                ></th>
              </tr>
            </thead>
            <tbody
              style={{
                borderTop: "1px solid #ddd",
                fontSize: "14px",
                fontWeight: "500",
                color: "#0D1526",
              }}
            >
              {Array.isArray(makers) &&
                makers.map((item) => (
                  <tr
                    key={item.id}
                    style={{ height: "50px", borderBottom: "1px solid #ddd" }}
                    className="cursor-pointer hover:bg-[#e5efff]"
                  >
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      {item.name}
                    </td>

                    <td
                      style={{
                        padding: "10px 16px",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}
                      className="flex justify-end"
                    >
                      <div className="w-[40px] h-[40px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]  hover:scale-105  hover:bg-red-200 hover:border-red-500">
                        <Image
                          src="/epack/icon_remove.svg"
                          alt=""
                          width={20}
                          height={25}
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {pagination && (
            <div className="w-full flex justify-center items-center  ">
              {pagination}
            </div>
          )}
        </div>{" "}
      </div>
    </>
  );
};
export default Table;
