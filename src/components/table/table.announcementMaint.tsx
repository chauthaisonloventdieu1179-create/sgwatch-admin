"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IAnnouncement } from "@/types/admin/announcement";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import ConfirmDelete from "@/components/popup/popup.delete";
import { useState } from "react";
interface IAnnouncementProps {
  announcements: IAnnouncement[];
  fetchData: (page: number, per_page: number) => void;
  pagination?: React.ReactNode;
}
const Table: React.FC<IAnnouncementProps> = ({
  announcements,
  fetchData,
  pagination,
}) => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);
  const handleUpdate = (id: number) => {
    router.push(`/admin/announcementMaint/update?id=${id}`);
  };
  const handleOpenConfirmRemove = (id: number, name: string) => {
    setNameDelete(name);
    setIdDelete(id);
    setIsModalVisible(true);
  };
  const handleCloseConfirmRemove = () => {
    setNameDelete("");
    setIdDelete(null);
    setIsModalVisible(false);
  };
  const handleRemoveGroupSales = async () => {
    try {
      const token = await getToken();
      if (!idDelete) return;
      const url = `/news/${idDelete}`;
      await sendRequest({
        url,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(1, 10);
    } catch (error) {
    } finally {
      setIsModalVisible(false);
      setIdDelete(null);
      setNameDelete("");
    }
  };
  return (
    <>
      <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto hidden-scroll">
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
                  style={{ padding: "12px 16px" }}
                  className="w-[15%] text-start text-[14px]"
                >
                  Ngày tạo
                </th>
                <th
                  style={{ padding: "12px 16px" }}
                  className="w-[30%] text-start text-[14px]"
                >
                  Tiêu đề
                </th>
                <th
                  style={{ padding: "12px 16px" }}
                  className="w-[10%] text-center text-[14px]"
                >
                  Trạng thái
                </th>
                <th
                  style={{ padding: "12px 16px" }}
                  className="w-[35%] text-start text-[14px]"
                ></th>
                <th
                  style={{ padding: "12px 16px" }}
                  className="w-[10%] text-end text-[14px]"
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
              {Array.isArray(announcements) &&
                announcements.map((item) => (
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
                      {item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "--"}
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        maxWidth: "250px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "left",
                      }}
                    >
                      {item.title}
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        className={`px-[8px] py-[3px] rounded-[6px] text-[12px] font-medium ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td
                      onClick={() => handleUpdate(item.id)}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                      }}
                    ></td>

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
                      <div
                        onClick={() =>
                          handleOpenConfirmRemove(item?.id, item?.title)
                        }
                        className="w-[40px] cursor-pointer h-[40px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]  hover:scale-105  hover:bg-red-200 hover:border-red-500"
                      >
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
            <div className="w-full flex justify-center items-center ">
              {pagination}
            </div>
          )}
        </div>{" "}
      </div>
      {isModalVisible && (
        <>
          <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
            <ConfirmDelete
              onClose={handleCloseConfirmRemove}
              onDelete={handleRemoveGroupSales}
              moduleText={
                "Bạn có chắc chắn muốn xóa thông báo này không?"
              }
              confirm={"Thông báo"}
              id={nameDelete}
            />
          </div>
        </>
      )}
    </>
  );
};
export default Table;
