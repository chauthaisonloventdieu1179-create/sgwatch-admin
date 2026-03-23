"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import Table from "@/components/table/table.productMaint";
import {
  IProduct,
  IProductsResponse,
  ITemplateCSVProduct,
} from "@/types/admin/product";
import { sendRequest } from "@/utils/api";
import { Input, Modal, Spin } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Table as AntTable, Tag } from "antd";
const ProductMaint = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(50);
  const [search_product_name, setProductName] = useState<string>("");
  const [search_maker_name, setMakerName] = useState<string>("");
  const [search_jan, setJan] = useState<string>("");
  const [search_product_number, setProductNumber] = useState<string>("");
  const [importResult, setImportResult] = useState<{
    totalSuccess: number;
    totalError: number;
    errors: {
      line: number;
      jan_code: string;
      errorMessage: string;
    }[];
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  useEffect(() => {
    fetchData(currentPage, itemsPerPage, "", "", "", "");
  }, [currentPage, itemsPerPage]);

  const fetchData = async (
    page: number,
    limit: number,
    search_product_name: string,
    search_product_number: string,
    search_maker_name: string,

    search_jan: string
  ) => {
    try {
      setLoading(true);
      const token = await getToken();
      const url = "/products";
      const queryParams = {
        limit: limit,
        page: page,
        search_product_name: search_product_name,
        search_jan: search_jan,
        search_product_number: search_product_number,
        search_maker_name: search_maker_name,
      };
      const response = await sendRequest<IProductsResponse>({
        url: url,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: queryParams,
      });
      setProducts(response.data.products);
      setTotalPages(Math.ceil(response?.data.pagination.total / limit));
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = () => {
    fetchData(
      1,
      10,
      search_product_name,
      search_product_number,
      search_maker_name,
      search_jan
    );
  };

  const handleAddPage = () => {
    router.push("/admin/clock/create/");
  };
  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams({
        search_product_name: search_product_name || "",
        search_jan: search_jan || "",
        search_product_number: search_product_number || "",
        search_maker_name: search_maker_name || "",
      });

      const token = await getToken();
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/admin/products/export?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const resJson = await response.json();
      const { file_url, file_name } = resJson.data;
      if (!file_url || !file_name) {
        throw new Error("Thiếu file_url hoặc file_name trong phản hồi.");
      }
      const csvResponse = await fetch(file_url);
      if (!csvResponse.ok) {
        throw new Error("Tải file CSV thất bại.");
      }

      const blob = await csvResponse.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {}
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = await getToken();
      const response = await sendRequest<ITemplateCSVProduct>({
        url: "/admin/products/template",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.url) {
        const csvResponse = await fetch(response.data.url);
        if (!csvResponse.ok) {
          throw new Error("Tải file mẫu thất bại.");
        }

        const blob = await csvResponse.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = "product_template.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {}
  };

  const importCSV = async (file: File): Promise<void> => {
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", file);

    if (!file.name.endsWith(".csv")) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/products/import`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      const resJson = await response.json();
      if (response.ok) {
        setImportResult({
          totalSuccess: resJson.data.total_record_success,
          totalError: resJson.data.total_record_error,
          errors: resJson.data.record_errors || [],
        });
        setIsModalOpen(true);
        fetchData(currentPage, itemsPerPage, "", "", "", "");
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to import file:",
          errorData.message || response.statusText
        );
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importCSV(file);
    }
    event.target.value = "";
  };
  return (
    <>
      {loading && (
        <div className="fixed inset-0  z-[1500] flex justify-center items-center ">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Quản lý sản phẩm
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center  bg-[#FFFFFF] rounded-[12px] ">
          <div className="pb-[8px] pt-[5px]  w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách sản phẩm
            <span className=" text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem danh sách sản phẩm.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start h-[76px] gap-[12px]">
            <div className="w-full flex justify-end items-center  gap-[10px]">
              <div
                onClick={handleAddPage}
                className="w-[125px]  h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] hover:text-[15px]  flex justify-center items-center gap-[5px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                <Image
                  src="/epack/icon_plus.svg"
                  alt=""
                  width={10}
                  height={6}
                  style={{ objectFit: "cover" }}
                />
                Thêm mới
              </div>
              <div
                onClick={handleDownloadTemplate}
                className="w-[120px] h-[32px] bg-[#FFFFFF] border-2 border-[#212222] cursor-pointer rounded-[10px] text-[#212222] font-medium text-[12px]  flex justify-center items-center gap-[5px]
                 hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Mẫu template
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-[125px] h-[32px] bg-[#FFFFFF] border-2 border-[#212222] cursor-pointer rounded-[10px] text-[#212222] font-medium text-[12px]  flex justify-center items-center gap-[5px] hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Nhập CSV
              </div>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <div
                onClick={handleExportCSV}
                className="w-[90px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px]  flex justify-center items-center gap-[5px] hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Xuất CSV
              </div>
            </div>
            <div className="w-full flex justify-between items-center  gap-[10px]">
              <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
                <div className="w-[35px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
                  Tên SP
                </div>
                <div
                  style={{
                    width: "calc(100% - 40px)",
                  }}
                  className="h-[32px]"
                >
                  <Input
                    placeholder=""
                    value={search_product_name}
                    onChange={(e) => setProductName(e.target.value)}
                    className="h-[32px] w-full text-[14px]  font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                  />
                </div>
              </div>
              <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
                <div className="w-[35px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
                  Mã SP
                </div>
                <div
                  style={{
                    width: "calc(100% - 40px)",
                  }}
                  className="h-[32px]"
                >
                  <Input
                    placeholder=""
                    value={search_product_number}
                    onChange={(e) => setProductNumber(e.target.value)}
                    className="h-[32px] w-full text-[14px]  font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                  />
                </div>
              </div>
              <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
                <div className="w-[65px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
                  Hãng
                </div>
                <div
                  style={{
                    width: "calc(100% - 70px)",
                  }}
                  className="h-[32px]"
                >
                  <Input
                    placeholder=""
                    value={search_maker_name}
                    onChange={(e) => setMakerName(e.target.value)}
                    className="h-[32px] w-full text-[14px]  font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                  />
                </div>
              </div>
              <div className="w-[21%] h-[32px] flex justify-start items-center gap-[5px]">
                <div className="w-[40px] flex justify-start items-center h-[17px] text-[14px] font-[400] text-[#000000]">
                  JAN
                </div>
                <div
                  style={{
                    width: "calc(100% - 45px)",
                  }}
                  className="h-[32px]"
                >
                  <Input
                    placeholder=""
                    value={search_jan}
                    onChange={(e) => setJan(e.target.value)}
                    className="h-[32px] w-full text-[14px]  font-[400] text-[#212222] placeholder:text-[#9E9E9E]"
                  />
                </div>
              </div>
              <div
                onClick={handleSearch}
                className="text-white text-[12px] font-medium bg-[#212222] w-[85px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Tìm kiếm
              </div>
            </div>
          </div>
          <div
            style={{
              height: "calc(100vh - 290px)",
            }}
            className="w-full px-[16px] mt-[18px] "
          >
            <Table
              products={products}
              fetchData={fetchData}
              pagination={
                products.length > 0 ? (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    paginate={(page) => setCurrentPage(page)}
                  />
                ) : undefined
              }
            />
          </div>
        </div>
      </div>
      <Modal
        title="Kết quả nhập CSV"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {importResult && (
          <div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>
              <Tag color="green">✅ Thành công: {importResult.totalSuccess}</Tag>
              <Tag color="red">❌ Thất bại: {importResult.totalError}</Tag>
            </p>

            <AntTable
              dataSource={importResult.errors.map((err, idx) => ({
                key: idx,
                line: err.line,
                jan_code: err.jan_code,
                errorMessage: err.errorMessage,
              }))}
              columns={[
                {
                  title: "Line",
                  dataIndex: "line",
                  key: "line",
                  align: "center",
                  width: 80,
                },
                {
                  title: "Mã JAN",
                  dataIndex: "jan_code",
                  key: "jan_code",
                  align: "center",
                  width: 150,
                },
                {
                  title: "Lỗi",
                  dataIndex: "errorMessage",
                  key: "errorMessage",
                  render: (text) => (
                    <span style={{ whiteSpace: "pre-line", color: "#d4380d" }}>
                      {text}
                    </span>
                  ),
                },
              ]}
              bordered
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </>
  );
};
export default ProductMaint;
