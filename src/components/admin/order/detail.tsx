"use client";
import { getToken } from "@/api/ServerActions";
import { IOrderDetail, IOrderDetailResponse } from "@/types/admin/order";
import { sendRequest } from "@/utils/api";
import { Modal, Select, Spin, message } from "antd";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ xử lý", color: "#D97706", bg: "#FEF3C7" },
  confirmed: { label: "Đã xác nhận", color: "#2563EB", bg: "#DBEAFE" },
  processing: { label: "Đang xử lý", color: "#7C3AED", bg: "#EDE9FE" },
  shipping: { label: "Đang giao", color: "#0891B2", bg: "#CFFAFE" },
  delivered: { label: "Đã giao", color: "#059669", bg: "#D1FAE5" },
  completed: { label: "Hoàn thành", color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Đã hủy", color: "#DC2626", bg: "#FEE2E2" },
  refunded: { label: "Hoàn tiền", color: "#9333EA", bg: "#F3E8FF" },
};

const PAYMENT_STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Chờ thanh toán", color: "#D97706", bg: "#FEF3C7" },
  paid: { label: "Đã thanh toán", color: "#16A34A", bg: "#DCFCE7" },
  failed: { label: "Thất bại", color: "#DC2626", bg: "#FEE2E2" },
  refunded: { label: "Hoàn tiền", color: "#9333EA", bg: "#F3E8FF" },
};

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipping", "delivered", "completed", "cancelled", "refunded"];

const OrderDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<IOrderDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal đổi trạng thái đơn hàng
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string | undefined>(undefined);

  // Modal đổi trạng thái thanh toán
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IOrderDetailResponse>({
        url: `/admin/shop/orders/${orderId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(response.data.order);
    } catch (error) {
      message.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = () => {
    setNewStatus(undefined);
    setStatusModalOpen(true);
  };

  const handleOpenPaymentModal = () => {
    setNewPaymentStatus(undefined);
    setPaymentModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!newStatus || !order) return;
    try {
      setLoading(true);
      const token = getToken();
      await sendRequest({
        url: `/admin/shop/orders/${order.id}/status`,
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: { status: newStatus },
      });
      message.success("Cập nhật trạng thái thành công");
      setStatusModalOpen(false);
      fetchOrder();
    } catch (error: any) {
      message.error(error?.message || "Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!newPaymentStatus || !order) return;
    try {
      setLoading(true);
      const token = getToken();
      await sendRequest({
        url: `/admin/shop/orders/${order.id}/payment-status`,
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: { payment_status: newPaymentStatus },
      });
      message.success("Cập nhật trạng thái thanh toán thành công");
      setPaymentModalOpen(false);
      fetchOrder();
    } catch (error: any) {
      message.error(error?.message || "Cập nhật trạng thái thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
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
    if (currency === "JPY") return `¥${num.toLocaleString("ja-JP")}`;
    return `${num.toLocaleString()}${currency}`;
  };

  const getStatusBadge = (status: string, map: Record<string, { label: string; color: string; bg: string }>) => {
    const s = map[status] || { label: status, color: "#6B7280", bg: "#F3F4F6" };
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.color,
          padding: "4px 12px",
          borderRadius: "9999px",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        {s.label}
      </span>
    );
  };

  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const handleInvoice = async () => {
    if (!order) return;
    try {
      setInvoiceLoading(true);
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/shop/orders/${order.id}/invoice`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Không thể tải hóa đơn");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error: any) {
      message.error(error?.message || "Tải hóa đơn thất bại");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const allowedTransitions = order ? ALL_STATUSES.filter((s) => s !== order.status) : [];

  if (loading) {
    return (
      <div className="fixed inset-0 z-[1500] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full flex flex-col justify-start items-start">
        <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          Đơn hàng không tồn tại
        </div>
        <div
          onClick={() => router.push("/admin/order")}
          className="mt-[20px] cursor-pointer text-blue-600 hover:underline text-[14px]"
        >
          Quay lại danh sách
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full flex justify-between items-center">
          <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
            Chi tiết đơn hàng #{order.order_number}
          </div>
          <div className="flex gap-[8px]">
            {order.status === "completed" && (
              <div
                onClick={handleInvoice}
                className={`text-white text-[12px] font-medium bg-[#16A34A] px-[16px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)] ${invoiceLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                {invoiceLoading ? "Đang tải..." : "In hóa đơn"}
              </div>
            )}
            <div
              onClick={() => router.push("/admin/order")}
              className="text-white text-[12px] font-medium bg-[#212222] w-[120px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
            >
              Quay lại
            </div>
          </div>
        </div>

        <div className="w-full mt-[15px] flex flex-col gap-[16px]">
          {/* Order Info */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium flex justify-between items-center">
              <span>Thông tin đơn hàng</span>
              <div className="flex gap-[8px]">
                {order.user && (
                  <div
                    onClick={() => router.push(`/admin/chat/?user_id=${order.user!.id}`)}
                    className="text-white text-[12px] font-medium px-[14px] h-[30px] rounded-[8px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all bg-[#059669]"
                  >
                    Nhắn tin với {order.user.full_name}
                  </div>
                )}
                <div
                  onClick={handleOpenStatusModal}
                  className="text-white text-[12px] font-medium px-[14px] h-[30px] rounded-[8px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all bg-[#7C3AED]"
                >
                  Đổi trạng thái
                </div>
                <div
                  onClick={handleOpenPaymentModal}
                  className="text-white text-[12px] font-medium px-[14px] h-[30px] rounded-[8px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all bg-[#2563EB]"
                >
                  Đổi thanh toán
                </div>
              </div>
            </div>
            <div className="mt-[12px] grid grid-cols-2 gap-x-[40px] gap-y-[10px] text-[14px]">
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">Mã đơn hàng:</span>
                <span className="font-semibold">{order.order_number}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">Loại đơn:</span>
                <span>{order.order_type === "online" ? "Online" : order.order_type === "walk_in" ? "Tại cửa hàng" : order.order_type}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">Trạng thái:</span>
                {getStatusBadge(order.status, STATUS_MAP)}
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">Thanh toán:</span>
                {getStatusBadge(order.payment_status, PAYMENT_STATUS_MAP)}
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">PT thanh toán:</span>
                <span>{order.payment_method === "cod" ? "COD" : order.payment_method === "stripe" ? "Stripe" : order.payment_method}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">PT vận chuyển:</span>
                <span>{order.shipping_method}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[140px]">Ngày tạo:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              {order.tracking_number && (
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[140px]">Mã vận đơn:</span>
                  <span className="font-semibold">{order.tracking_number}</span>
                </div>
              )}
              {order.shipping_carrier && (
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[140px]">Đơn vị vận chuyển:</span>
                  <span>{order.shipping_carrier}</span>
                </div>
              )}
              {order.cancel_reason && (
                <div className="flex gap-[8px] col-span-2">
                  <span className="text-[#9E9E9E] w-[140px]">Lý do hủy:</span>
                  <span className="text-red-600">{order.cancel_reason}</span>
                </div>
              )}
              {order.admin_note && (
                <div className="flex gap-[8px] col-span-2">
                  <span className="text-[#9E9E9E] w-[140px]">Ghi chú admin:</span>
                  <span>{order.admin_note}</span>
                </div>
              )}
              {order.note && (
                <div className="flex gap-[8px] col-span-2">
                  <span className="text-[#9E9E9E] w-[140px]">Ghi chú KH:</span>
                  <span>{order.note}</span>
                </div>
              )}
              {order.payment_receipt && (
                <div className="flex gap-[8px] col-span-2">
                  <span className="text-[#9E9E9E] w-[140px]">Ảnh thanh toán:</span>
                  <img
                    src={order.payment_receipt}
                    alt="Ảnh thanh toán"
                    className="w-[120px] h-[120px] object-cover rounded-[8px] cursor-pointer border border-[#E5E5E5]"
                    onClick={() => window.open(order.payment_receipt!, "_blank")}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Lịch sử trạng thái
            </div>
            <div className="mt-[12px] grid grid-cols-3 gap-x-[40px] gap-y-[10px] text-[14px]">
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[100px]">Tạo đơn:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[100px]">Xác nhận:</span>
                <span>{formatDate(order.confirmed_at)}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[100px]">Thanh toán:</span>
                <span>{formatDate(order.paid_at)}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[100px]">Giao hàng:</span>
                <span>{formatDate(order.shipped_at)}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[100px]">Đã giao:</span>
                <span>{formatDate(order.delivered_at)}</span>
              </div>
              <div className="flex gap-[8px]">
                <span className="text-[#9E9E9E] w-[100px]">Đã hủy:</span>
                <span>{formatDate(order.cancelled_at)}</span>
              </div>
            </div>
          </div>

          {/* Customer + Shipping */}
          <div className="w-full flex gap-[16px]">
            <div className="w-[50%] px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
              <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
                Thông tin khách hàng
              </div>
              <div className="mt-[12px] flex flex-col gap-[8px] text-[14px]">
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">Họ tên:</span>
                  <span className="font-semibold">{order.user?.full_name || "—"}</span>
                </div>
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">Email:</span>
                  <span>{order.user?.email || "—"}</span>
                </div>
              </div>
            </div>
            <div className="w-[50%] px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
              <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
                Địa chỉ giao hàng
              </div>
              <div className="mt-[12px] flex flex-col gap-[8px] text-[14px]">
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">Người nhận:</span>
                  <span className="font-semibold">{order.shipping_name}</span>
                </div>
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">SĐT:</span>
                  <span>{order.shipping_phone}</span>
                </div>
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">Địa chỉ:</span>
                  <span>{order.shipping_address}</span>
                </div>
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">Thành phố:</span>
                  <span>{order.shipping_city}</span>
                </div>
                <div className="flex gap-[8px]">
                  <span className="text-[#9E9E9E] w-[80px]">Mã bưu điện:</span>
                  <span>{order.shipping_postal_code}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Sản phẩm trong đơn ({order.items?.length || 0} sản phẩm)
            </div>
            <div className="mt-[12px]">
              <table style={{ borderCollapse: "collapse" }} className="w-full">
                <thead>
                  <tr className="bg-[#F5F5F5] text-left text-[13px] text-[#0D1526] font-[500]">
                    <th style={{ padding: "10px 12px" }} className="w-[5%]">STT</th>
                    <th style={{ padding: "10px 12px" }} className="w-[10%]">Ảnh</th>
                    <th style={{ padding: "10px 12px" }} className="w-[35%]">Tên sản phẩm</th>
                    <th style={{ padding: "10px 12px" }} className="w-[12%]">SKU</th>
                    <th style={{ padding: "10px 12px" }} className="w-[10%] text-center">Số lượng</th>
                    <th style={{ padding: "10px 12px" }} className="w-[14%] text-right">Đơn giá</th>
                    <th style={{ padding: "10px 12px" }} className="w-[14%] text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {(order.items || []).map((item, index) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px 12px" }}>{index + 1}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <div className="w-[50px] h-[50px] relative rounded-[6px] overflow-hidden bg-[#F5F5F5]">
                          <Image
                            src={item.product_image}
                            alt={item.product_name}
                            fill
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 500 }}>
                        {item.product_name}
                      </td>
                      <td style={{ padding: "10px 12px", color: "#9E9E9E" }}>
                        {item.product_sku}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right" }}>
                        {formatCurrency(item.unit_price, order.currency)}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600 }}>
                        {formatCurrency(item.total_price, order.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Order Summary */}
            <div className="mt-[16px] flex justify-end">
              <div className="w-[300px] flex flex-col gap-[6px] text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">Tạm tính:</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9E9E9E]">Phí vận chuyển:</span>
                  <span>{formatCurrency(order.shipping_fee, order.currency)}</span>
                </div>
                {Number(order.cod_fee) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">Phí COD:</span>
                    <span>{formatCurrency(order.cod_fee, order.currency)}</span>
                  </div>
                )}
                {Number(order.stripe_fee) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">Phí Stripe:</span>
                    <span>{formatCurrency(String(order.stripe_fee), order.currency)}</span>
                  </div>
                )}
                {Number(order.discount_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">Giảm giá:</span>
                    <span className="text-red-500">-{formatCurrency(order.discount_amount, order.currency)}</span>
                  </div>
                )}
                {Number(order.deposit_amount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">Đặt cọc:</span>
                    <span>-{formatCurrency(order.deposit_amount, order.currency)}</span>
                  </div>
                )}
                {order.points_used > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9E9E9E]">Điểm sử dụng:</span>
                    <span>{order.points_used}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-[6px] mt-[4px] font-semibold text-[16px]">
                  <span>Tổng cộng:</span>
                  <span className="text-[#DC2626]">{formatCurrency(order.total_amount, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal đổi trạng thái đơn hàng */}
      <Modal
        title="Đổi trạng thái đơn hàng"
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        onOk={handleUpdateStatus}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ disabled: !newStatus }}
      >
        <div className="flex flex-col gap-[14px] mt-[16px]">
          <div>
            <div className="text-[14px] font-medium mb-[6px]">Trạng thái hiện tại</div>
            <div>{getStatusBadge(order?.status || "", STATUS_MAP)}</div>
          </div>
          <div>
            <div className="text-[14px] font-medium mb-[6px]">
              Chuyển sang <span className="text-red-500">*</span>
            </div>
            <Select
              placeholder="Chọn trạng thái mới"
              className="w-full"
              value={newStatus}
              onChange={(value) => setNewStatus(value)}
              options={allowedTransitions.map((s) => ({
                value: s,
                label: STATUS_MAP[s]?.label || s,
              }))}
            />
          </div>
        </div>
      </Modal>

      {/* Modal đổi trạng thái thanh toán */}
      <Modal
        title="Đổi trạng thái thanh toán"
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        onOk={handleUpdatePaymentStatus}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ disabled: !newPaymentStatus }}
      >
        <div className="flex flex-col gap-[14px] mt-[16px]">
          <div>
            <div className="text-[14px] font-medium mb-[6px]">Trạng thái hiện tại</div>
            <div>{getStatusBadge(order?.payment_status || "", PAYMENT_STATUS_MAP)}</div>
          </div>
          <div>
            <div className="text-[14px] font-medium mb-[6px]">
              Chuyển sang <span className="text-red-500">*</span>
            </div>
            <Select
              placeholder="Chọn trạng thái thanh toán"
              className="w-full"
              value={newPaymentStatus}
              onChange={(value) => setNewPaymentStatus(value)}
              options={[
                { value: "paid", label: "Đã thanh toán" },
                { value: "pending", label: "Chờ thanh toán" },
              ].filter((s) => s.value !== (order?.payment_status || ""))}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
export default OrderDetail;
