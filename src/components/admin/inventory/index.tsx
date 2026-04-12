"use client";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Input, Spin, DatePicker, message } from "antd";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface IInventoryProduct {
  id: number;
  name: string;
  sku: string;
  primary_image_url?: string | null;
}

interface IInventoryHistory {
  id: number;
  type: "import" | "export";
  quantity: number;
  stock_before: number;
  stock_after: number;
  reference_type: string | null;
  reference_id: number | null;
  note: string | null;
  product_color: string | null;
  created_at: string;
  product?: IInventoryProduct;
}

interface IInventoryResponse {
  message: string;
  status_code: number;
  data: {
    records?: IInventoryHistory[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

interface ISearchProduct {
  id: number;
  name: string;
  sku: string;
  primary_image_url?: string | null;
}

interface IProductsResponse {
  data: { products: ISearchProduct[] };
}

const TABS = [
  { key: "import", label: "Hàng nhập" },
  { key: "export", label: "Hàng xuất" },
];

const InventoryHistories = () => {
  const [activeTab, setActiveTab] = useState<"import" | "export">("import");
  const [records, setRecords] = useState<IInventoryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);

  // Filters
  const [singleDate, setSingleDate] = useState<Dayjs | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [selectedProduct, setSelectedProduct] = useState<ISearchProduct | null>(null);

  // Product search
  const [productKeyword, setProductKeyword] = useState("");
  const [productResults, setProductResults] = useState<ISearchProduct[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Applied filters (only set when "Tìm kiếm" clicked)
  const [appliedFilters, setAppliedFilters] = useState<{
    date: string;
    start_date: string;
    end_date: string;
    product_id: number | null;
  }>({ date: "", start_date: "", end_date: "", product_id: null });

  useEffect(() => {
    fetchData(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage, appliedFilters]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const queryParams: Record<string, any> = {
        type: activeTab,
        per_page: perPage,
        page,
      };
      if (appliedFilters.date) queryParams.date = appliedFilters.date;
      if (appliedFilters.start_date) queryParams.start_date = appliedFilters.start_date;
      if (appliedFilters.end_date) queryParams.end_date = appliedFilters.end_date;
      if (appliedFilters.product_id) queryParams.product_id = appliedFilters.product_id;

      const res = await sendRequest<IInventoryResponse>({
        url: "/admin/shop/inventory-histories",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams,
      });

      const list = res.data?.records || [];
      setRecords(list);
      setTotalPages(res.data?.pagination?.last_page ?? 1);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Product search debounce
  const searchProducts = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }
    try {
      setSearchingProduct(true);
      const token = getToken();
      const res = await sendRequest<IProductsResponse>({
        url: `/admin/shop/products?keyword=${encodeURIComponent(keyword.trim())}&page=1&per_page=15`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductResults(res.data?.products || []);
      setShowProductDropdown(true);
    } catch {
      setProductResults([]);
    } finally {
      setSearchingProduct(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!productKeyword.trim()) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      searchProducts(productKeyword);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [productKeyword, searchProducts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setShowProductDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: ISearchProduct) => {
    setSelectedProduct(product);
    setProductKeyword(product.name);
    setShowProductDropdown(false);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    setAppliedFilters({
      date: singleDate ? singleDate.format("YYYY-MM-DD") : "",
      start_date: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : "",
      end_date: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : "",
      product_id: selectedProduct?.id || null,
    });
  };

  const handleReset = () => {
    setSingleDate(null);
    setDateRange([null, null]);
    setSelectedProduct(null);
    setProductKeyword("");
    setCurrentPage(1);
    setAppliedFilters({ date: "", start_date: "", end_date: "", product_id: null });
  };

  const handleTabChange = (tab: "import" | "export") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getProductName = (record: IInventoryHistory) => record.product?.name || "—";
  const getProductSku = (record: IInventoryHistory) => record.product?.sku || "—";

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return dayjs(dateStr).format("DD/MM/YYYY HH:mm");
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Lịch sử xuất nhập hàng
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-start bg-[#FFFFFF] rounded-[12px]">
          {/* Tabs */}
          <div className="w-full flex border-b-[2px] border-[#C8C8C8]">
            {TABS.map((tab) => (
              <div
                key={tab.key}
                onClick={() => handleTabChange(tab.key as "import" | "export")}
                className={`px-[20px] py-[10px] text-[14px] font-medium cursor-pointer transition-all duration-200 border-b-[2px] -mb-[2px] ${
                  activeTab === tab.key
                    ? "border-[#212222] text-[#212222]"
                    : "border-transparent text-[#9E9E9E] hover:text-[#212222]"
                }`}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="w-full px-[20px] pt-[16px] pb-[12px] flex flex-wrap items-end gap-[12px]">
            {/* Single date */}
            <div className="flex flex-col gap-[4px]">
              <label className="text-[12px] text-[#9E9E9E]">Ngày</label>
              <DatePicker
                value={singleDate}
                onChange={(val) => setSingleDate(val)}
                format="DD/MM/YYYY"
                className="h-[32px] text-[13px] w-[140px]"
                placeholder="Chọn ngày"
              />
            </div>
            {/* Date range */}
            <div className="flex flex-col gap-[4px]">
              <label className="text-[12px] text-[#9E9E9E]">Khoảng ngày</label>
              <RangePicker
                value={dateRange}
                onChange={(vals) => setDateRange(vals ? [vals[0], vals[1]] : [null, null])}
                format="DD/MM/YYYY"
                className="h-[32px] text-[13px]"
                placeholder={["Từ ngày", "Đến ngày"]}
              />
            </div>

            {/* Product search */}
            <div className="flex flex-col gap-[4px]">
              <label className="text-[12px] text-[#9E9E9E]">Sản phẩm</label>
              <div className="relative" ref={productDropdownRef}>
                <Input
                  value={productKeyword}
                  onChange={(e) => {
                    setProductKeyword(e.target.value);
                    if (!e.target.value) setSelectedProduct(null);
                  }}
                  placeholder="Tìm sản phẩm..."
                  className="h-[32px] w-[220px] text-[13px]"
                  suffix={
                    searchingProduct ? (
                      <Spin size="small" />
                    ) : (
                      <Search size={14} className="text-[#9E9E9E]" />
                    )
                  }
                />
                {showProductDropdown && productResults.length > 0 && (
                  <div className="absolute top-[34px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[8px] shadow-lg z-[100] max-h-[200px] overflow-y-auto hidden-scroll">
                    {productResults.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="flex items-center gap-[8px] px-[10px] py-[7px] border-b border-[#F0F0F0] last:border-b-0 cursor-pointer hover:bg-[#e5efff] transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-[#212222] truncate">{product.name}</div>
                          <div className="text-[10px] text-[#9E9E9E]">SKU: {product.sku}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showProductDropdown && productResults.length === 0 && !searchingProduct && productKeyword.trim() && (
                  <div className="absolute top-[34px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[8px] shadow-lg z-[100] p-[10px] text-center text-[12px] text-[#9E9E9E]">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-[8px]">
              <div
                onClick={handleSearch}
                className="h-[32px] px-[14px] bg-[#212222] cursor-pointer rounded-[8px] text-white text-[12px] font-medium flex justify-center items-center hover:scale-105 transition-all duration-200"
              >
                Tìm kiếm
              </div>
              <div
                onClick={handleReset}
                className="h-[32px] px-[14px] border border-[#C8C8C8] cursor-pointer rounded-[8px] text-[#212222] text-[12px] font-medium flex justify-center items-center hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                Đặt lại
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            style={{ height: "calc(100vh - 290px)" }}
            className="w-full px-[16px] pb-[16px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-310px)] overflow-y-auto hidden-scroll">
                {records.length === 0 && !loading ? (
                  <div className="flex justify-center items-center py-[60px] text-[14px] text-[#9E9E9E]">
                    Không có dữ liệu.
                  </div>
                ) : (
                  <table style={{ borderCollapse: "collapse" }} className="w-full bg-[#FFFFFF]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                        <th style={{ padding: "12px 16px" }} className="w-[4%] text-center">#</th>
                        <th style={{ padding: "12px 16px" }} className="w-[30%]">Sản phẩm</th>
                        <th style={{ padding: "12px 16px" }} className="w-[10%] text-center">Số lượng</th>
                        <th style={{ padding: "12px 16px" }} className="w-[8%] text-center">Tồn trước</th>
                        <th style={{ padding: "12px 16px" }} className="w-[8%] text-center">Tồn sau</th>
                        <th style={{ padding: "12px 16px" }} className="w-[18%]">Ghi chú</th>
                        <th style={{ padding: "12px 16px" }} className="w-[18%] text-right">Ngày tạo</th>
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
                      {records.map((record, index) => (
                        <tr
                          key={record.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[60px] hover:bg-[#F9F9F9] transition-all duration-150"
                        >
                          <td style={{ padding: "8px 16px" }} className="text-center text-[13px] text-[#9E9E9E]">
                            {(currentPage - 1) * perPage + index + 1}
                          </td>
                          <td style={{ padding: "8px 16px" }}>
                            <div className="flex items-center gap-[8px]">
                              {record.product?.primary_image_url && (
                                <div className="w-[36px] h-[36px] min-w-[36px] rounded-[4px] overflow-hidden bg-[#F5F5F5]">
                                  <img
                                    src={record.product.primary_image_url}
                                    alt={getProductName(record)}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-[13px] font-medium text-[#212222] line-clamp-2">{getProductName(record)}</div>
                                <div className="text-[11px] font-mono text-[#9E9E9E]">{getProductSku(record)}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "8px 16px" }} className="text-center">
                            <span
                              className={`text-[13px] font-medium ${
                                record.type === "import" ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {record.type === "import" ? "+" : "-"}{record.quantity}
                            </span>
                          </td>
                          <td style={{ padding: "8px 16px" }} className="text-center">
                            <span className="text-[12px] text-[#9E9E9E]">{record.stock_before ?? "—"}</span>
                          </td>
                          <td style={{ padding: "8px 16px" }} className="text-center">
                            <span className="text-[12px] font-medium text-[#212222]">{record.stock_after ?? "—"}</span>
                          </td>
                          <td style={{ padding: "8px 16px" }}>
                            <div className="text-[12px] text-[#9E9E9E] line-clamp-2">{record.note || "—"}</div>
                          </td>
                          <td style={{ padding: "8px 16px", textAlign: "right" }}>
                            <span className="text-[12px] text-[#9E9E9E]">{formatDate(record.created_at)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="w-full flex justify-center items-center gap-[6px] mt-[14px]">
                <div
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  className={`h-[32px] px-[12px] rounded-[6px] text-[12px] font-medium flex items-center border transition-all duration-200 ${
                    currentPage === 1
                      ? "border-[#E6E6E6] text-[#C8C8C8] cursor-not-allowed"
                      : "border-[#C8C8C8] text-[#212222] cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  Trước
                </div>
                <span className="text-[12px] text-[#9E9E9E] px-[4px]">
                  {currentPage} / {totalPages}
                </span>
                <div
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  className={`h-[32px] px-[12px] rounded-[6px] text-[12px] font-medium flex items-center border transition-all duration-200 ${
                    currentPage === totalPages
                      ? "border-[#E6E6E6] text-[#C8C8C8] cursor-not-allowed"
                      : "border-[#C8C8C8] text-[#212222] cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  Sau
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryHistories;
