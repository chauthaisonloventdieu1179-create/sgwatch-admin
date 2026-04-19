"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { IOrder, IOrdersResponse } from "@/types/admin/order";
import { IBrandsResponse } from "@/types/admin/brand";
import { sendRequest } from "@/utils/api";
import { Input, Select, Spin, message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ALL_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "waiting_order",
  "shipping",
  "delivered",
  "completed",
  "cancelled",
  "refunded",
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    pending: { label: "Chờ xử lý", color: "#D97706", bg: "#FEF3C7" },
    confirmed: { label: "Đã xác nhận", color: "#2563EB", bg: "#DBEAFE" },
    processing: { label: "Đang xử lý", color: "#7C3AED", bg: "#EDE9FE" },
    waiting_order: { label: "Hàng order", color: "#B45309", bg: "#FEF9C3" },
    shipping: { label: "Đang giao", color: "#0891B2", bg: "#CFFAFE" },
    delivered: { label: "Đã giao", color: "#059669", bg: "#D1FAE5" },
    completed: { label: "Hoàn thành", color: "#16A34A", bg: "#DCFCE7" },
    cancelled: { label: "Đã hủy", color: "#DC2626", bg: "#FEE2E2" },
    refunded: { label: "Hoàn tiền", color: "#9333EA", bg: "#F3E8FF" },
  };

const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Chờ thanh toán", color: "#D97706", bg: "#FEF3C7" },
  paid: { label: "Đã thanh toán", color: "#16A34A", bg: "#DCFCE7" },
  failed: { label: "Thất bại", color: "#DC2626", bg: "#FEE2E2" },
  refunded: { label: "Hoàn tiền", color: "#9333EA", bg: "#F3E8FF" },
};

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
  { value: "cod", label: "COD" },
  { value: "deposit_transfer", label: "Đặt cọc CK" },
  { value: "stripe", label: "Stripe" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "total_asc", label: "Tổng tiền tăng" },
  { value: "total_desc", label: "Tổng tiền giảm" },
];

const OrderList = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(20);
  const [keyword, setKeyword] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [userKeyword, setUserKeyword] = useState<string>("");
  const [productKeyword, setProductKeyword] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [brandId, setBrandId] = useState<string | undefined>(undefined);
  const [categoryOptions, setCategoryOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const fetchCategories = async () => {
    try {
      const token = getToken();
      const response = await sendRequest<any>({
        url: "/admin/shop-categories",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { page: 1, per_page: 30 },
      });
      setCategoryOptions(
        response.data.categories.map((c: any) => ({
          value: String(c.id),
          label: c.name,
        })),
      );
    } catch {
      setCategoryOptions([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = getToken();
      const response = await sendRequest<IBrandsResponse>({
        url: "/admin/shop-brands",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { page: 1, per_page: 50 },
      });
      setBrandOptions(
        response.data.brands.map((b: any) => ({
          value: String(b.id),
          label: b.name,
        })),
      );
    } catch {
      setBrandOptions([]);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const queryParams: Record<string, any> = {
        per_page: perPage,
        page: page,
      };
      if (keyword) queryParams.keyword = keyword;
      if (orderNumber) queryParams.order_number = orderNumber;
      if (userKeyword) queryParams.user_keyword = userKeyword;
      if (productKeyword) queryParams.product_keyword = productKeyword;
      if (statusFilter) queryParams.status = statusFilter;
      if (paymentStatusFilter) queryParams.payment_status = paymentStatusFilter;
      if (paymentMethodFilter) queryParams.payment_method = paymentMethodFilter;
      if (sortBy) queryParams.sort_by = sortBy;
      if (categoryId) queryParams.category_id = categoryId;
      if (brandId) queryParams.brand_id = brandId;

      const response = await sendRequest<IOrdersResponse>({
        url: "/admin/shop/orders",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: queryParams,
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.last_page);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  const handleReset = async () => {
    setKeyword("");
    setOrderNumber("");
    setUserKeyword("");
    setProductKeyword("");
    setStatusFilter("");
    setPaymentStatusFilter("");
    setPaymentMethodFilter("");
    setSortBy(undefined);
    setCategoryId(undefined);
    setBrandId(undefined);
    setCurrentPage(1);
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IOrdersResponse>({
        url: "/admin/shop/orders",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { per_page: perPage, page: 1 },
      });
      setOrders(response.data.orders);
      setTotalPages(response.data.pagination.last_page);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: string, currency: string) => {
    const num = Number(amount);
    if (currency === "JPY") {
      return `¥${num.toLocaleString("ja-JP")}`;
    }
    return `${num.toLocaleString()}${currency}`;
  };

  const getStatusBadge = (
    status: string,
    map: Record<string, { label: string; color: string; bg: string }>,
  ) => {
    const s = map[status] || { label: status, color: "#6B7280", bg: "#F3F4F6" };
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.color,
          padding: "2px 8px",
          borderRadius: "9999px",
          fontSize: "12px",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {s.label}
      </span>
    );
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full mt-[1px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách đơn hàng
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Xem và quản lý đơn hàng.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <div className="w-full flex gap-[12px]">
              <div className="flex-1 flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Từ khóa</span>
                <Input
                  placeholder="Tìm kiếm chung..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  className="h-[32px] text-[14px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Mã đơn hàng</span>
                <Input
                  placeholder="Nhập mã đơn hàng..."
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  onPressEnter={handleSearch}
                  className="h-[32px] text-[14px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Khách hàng</span>
                <Input
                  placeholder="Tên, email khách hàng..."
                  value={userKeyword}
                  onChange={(e) => setUserKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  className="h-[32px] text-[14px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Sản phẩm</span>
                <Input
                  placeholder="Tên, SKU sản phẩm..."
                  value={productKeyword}
                  onChange={(e) => setProductKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  className="h-[32px] text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Sắp xếp</span>
                <Select
                  allowClear
                  placeholder="Tất cả"
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                  className="w-[150px] h-[32px]"
                  options={SORT_OPTIONS}
                />
              </div>
            </div>
            <div className="w-full flex justify-between items-end gap-[12px]">
              <div className="flex gap-[12px]">
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#9E9E9E]">Trạng thái</span>
                  <Select
                    placeholder="Tất cả"
                    allowClear
                    value={statusFilter || undefined}
                    onChange={(value) => setStatusFilter(value || "")}
                    className="w-[150px] h-[32px]"
                    options={ALL_STATUSES.map((s) => ({
                      value: s,
                      label: STATUS_MAP[s]?.label || s,
                    }))}
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#9E9E9E]">
                    Trạng thái thanh toán
                  </span>
                  <Select
                    placeholder="Tất cả"
                    allowClear
                    value={paymentStatusFilter || undefined}
                    onChange={(value) => setPaymentStatusFilter(value || "")}
                    className="w-[150px] h-[32px]"
                    options={[
                      { value: "pending", label: "Chưa thanh toán" },
                      { value: "paid", label: "Đã thanh toán" },
                    ]}
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#9E9E9E]">
                    Phương thức thanh toán
                  </span>
                  <Select
                    placeholder="Tất cả"
                    allowClear
                    value={paymentMethodFilter || undefined}
                    onChange={(value) => setPaymentMethodFilter(value || "")}
                    className="w-[150px] h-[32px]"
                    options={PAYMENT_METHOD_OPTIONS}
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#9E9E9E]">Danh mục</span>
                  <Select
                    allowClear
                    placeholder="Tất cả"
                    value={categoryId}
                    onChange={(value) => setCategoryId(value)}
                    className="w-[150px] h-[32px]"
                    options={categoryOptions}
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <span className="text-[12px] text-[#9E9E9E]">
                    Thương hiệu
                  </span>
                  <Select
                    allowClear
                    placeholder="Tất cả"
                    value={brandId}
                    onChange={(value) => setBrandId(value)}
                    className="w-[150px] h-[32px]"
                    options={brandOptions}
                  />
                </div>
              </div>
              <div className="flex gap-[8px]">
                <div
                  onClick={handleReset}
                  className="text-[#212222] text-[12px] font-medium bg-[#FFFFFF] border-2 border-[#C8C8C8] w-[85px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
                >
                  Đặt lại
                </div>
                <div
                  onClick={handleSearch}
                  className="text-white text-[12px] font-medium bg-[#212222] w-[85px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
                >
                  Tìm kiếm
                </div>
                <div
                  onClick={() => router.push("/admin/order/create")}
                  className="text-white text-[12px] font-medium bg-[#2563EB] px-[14px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
                >
                  Tạo đơn hàng
                </div>
              </div>
            </div>
          </div>
          <div
            style={{ height: "calc(100vh - 300px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-320px)] overflow-y-auto hidden-scroll">
                <table
                  style={{ borderCollapse: "collapse" }}
                  className="w-full bg-[#FFFFFF]"
                >
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[5%] text-left text-[14px]"
                      >
                        STT
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[14%] text-left text-[14px]"
                      >
                        Mã đơn hàng
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[15%] text-left text-[14px]"
                      >
                        Khách hàng
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[12%] text-right text-[14px]"
                      >
                        Tổng tiền
                      </th>
                      {/* <th
                        style={{ padding: "12px 16px" }}
                        className="w-[6%] text-center text-[14px]"
                      >
                        Số SP
                      </th> */}
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[12%] text-center text-[14px]"
                      >
                        Trạng thái
                      </th>
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[12%] text-center text-[14px]"
                      >
                        Thanh toán
                      </th>
                      {/* <th
                        style={{ padding: "12px 16px" }}
                        className="w-[14%] text-left text-[14px]"
                      >
                        Ngày tạo
                      </th> */}
                      {/* <th
                        style={{ padding: "12px 16px" }}
                        className="w-[10%] text-center text-[14px]"
                      >
                        Ảnh thanh toán
                      </th> */}
                      <th
                        style={{ padding: "12px 16px" }}
                        className="w-[10%] text-right text-[14px]"
                      >
                        Thao tác
                      </th>
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
                    {Array.isArray(orders) &&
                      orders.map((item, index) => (
                        <tr
                          key={item.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[30px] hover:bg-[#e5efff]"
                        >
                          <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                          >
                            {(currentPage - 1) * perPage + index + 1}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "left",
                              fontWeight: 600,
                            }}
                          >
                            {item.order_number}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              maxWidth: "180px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                            }}
                          >
                            {item.order_type === "walk_in" ? (
                              <div className="flex items-center gap-[6px]">
                                <span>{item.customer_name || "—"}</span>
                                <span style={{ fontSize: "10px", color: "#D97706", background: "#FEF3C7", padding: "1px 6px", borderRadius: "9999px", fontWeight: 500 }}>
                                  Vãng lai
                                </span>
                              </div>
                            ) : (
                              <>
                                <div>{item.user?.full_name || item.customer_name || "—"}</div>
                                <div style={{ fontSize: "12px", color: "#9E9E9E" }}>
                                  {item.user?.email || ""}
                                </div>
                              </>
                            )}
                          </td>
                          <td
                            style={{ padding: "10px 16px", textAlign: "right" }}
                          >
                            {formatCurrency(item.total_amount, item.currency)}
                          </td>
                          {/* <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            {item.total_items}
                          </td> */}
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            {getStatusBadge(item.status, STATUS_MAP)}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            {getStatusBadge(
                              item.payment_status,
                              PAYMENT_STATUS_MAP,
                            )}
                          </td>
                          {/* <td
                            style={{ padding: "10px 16px", textAlign: "left" }}
                          >
                            {formatDate(item.created_at)}
                          </td> */}
                          {/* <td
                            style={{
                              padding: "10px 16px",
                              textAlign: "center",
                            }}
                          >
                            {item.payment_receipt ? (
                              <img
                                src={item.payment_receipt}
                                alt="Ảnh thanh toán"
                                className="w-[40px] h-[40px] object-cover rounded-[4px] cursor-pointer mx-auto"
                                onClick={() =>
                                  window.open(item.payment_receipt!, "_blank")
                                }
                              />
                            ) : (
                              <span className="text-[12px] text-[#9E9E9E]">
                                —
                              </span>
                            )}
                          </td> */}
                          <td
                            style={{ padding: "10px 16px", textAlign: "right" }}
                          >
                            <div className="flex justify-end gap-[6px]">
                              {/* <div
                                onClick={() => openStatusModal(item)}
                                className="cursor-pointer px-[8px] h-[28px] flex justify-center items-center border-2 border-[#7C3AED] text-[#7C3AED] rounded-[8px] text-[11px] font-medium hover:scale-105 hover:bg-[#EDE9FE] transition-all"
                              >
                                Đổi TT
                              </div> */}
                              {/* <div
                                onClick={() => openPaymentModal(item)}
                                className="cursor-pointer px-[8px] h-[28px] flex justify-center items-center border-2 border-[#2563EB] text-[#2563EB] rounded-[8px] text-[11px] font-medium hover:scale-105 hover:bg-[#DBEAFE] transition-all"
                              >
                                Đổi TT toán
                              </div> */}
                              <div
                                onClick={() =>
                                  router.push(
                                    `/admin/order/update?id=${item.id}`,
                                  )
                                }
                                className="cursor-pointer px-[8px] h-[28px] flex justify-center items-center border-2 border-[#2563EB] text-[#2563EB] rounded-[8px] text-[11px] font-medium hover:scale-105 hover:bg-blue-100 transition-all"
                              >
                                Sửa
                              </div>
                              <div
                                onClick={() =>
                                  router.push(
                                    `/admin/order/detail?id=${item.id}`,
                                  )
                                }
                                className="cursor-pointer px-[8px] h-[28px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px] text-[11px] font-medium hover:scale-105 hover:bg-blue-100 hover:border-blue-400 transition-all"
                              >
                                Chi tiết
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {orders.length > 0 && (
                  <div className="w-full flex justify-center items-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      paginate={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default OrderList;
