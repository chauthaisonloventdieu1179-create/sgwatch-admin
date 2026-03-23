"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
interface Supplier {
  id: number;
  sales_group: string;
}

// Data mẫu
const sampleSuppliers: Supplier[] = [
  {
    id: 1,
    sales_group: "Aitos",
  },
  {
    id: 2,
    sales_group: "Aitos",
  },
  {
    id: 3,
    sales_group: "Aitos",
  },
  {
    id: 4,
    sales_group: "Aitos",
  },
  {
    id: 5,
    sales_group: "Aitos",
  },
  {
    id: 6,
    sales_group: "Aitos",
  },
  {
    id: 7,
    sales_group: "Aitos",
  },
  {
    id: 8,
    sales_group: "Aitos",
  },
  {
    id: 9,
    sales_group: "Aitos",
  },
  {
    id: 10,
    sales_group: "Aitos",
  },
];
const Table = () => {
  const router = useRouter();
  const suppliers = sampleSuppliers;
  const handleUpdate = () => {
    router.push(`/admin/orderDeliveryMaint/delivery/update?id=${11111}`);
  };
  const handleSubmit = () => {
    router.push("/admin/orderDeliveryMaint/");
  };
  return (
    <>
      <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#FFFFFF",
          }}
        >
          <thead>
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
                Nơi giao hàng
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
            {Array.isArray(suppliers) &&
              suppliers.map((item) => (
                <tr
                  key={item.id}
                  style={{ height: "50px", borderBottom: "1px solid #ddd" }}
                  className="cursor-pointer"
                >
                  <td
                    onClick={handleUpdate}
                    style={{
                      padding: "10px 16px",
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textAlign: "left",
                    }}
                  >
                    {item.sales_group}
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
                    <div className="w-[40px] h-[40px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]">
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
      </div>
    </>
  );
};
export default Table;
