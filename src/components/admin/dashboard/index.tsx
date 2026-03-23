"use client";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { DatePicker, Select, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ---------- types ----------
interface IRevenueBar {
  label: string;
  value: number;
  orders: number;
}

interface IOrderStatusRow {
  status: string;
  label: string;
  count: number;
  color: string;
  bg: string;
}

// ---------- constants ----------
const FILTER_OPTIONS = [
  { value: "date_range", label: "Khoảng ngày" },
  { value: "month", label: "Theo tháng" },
  { value: "year", label: "Theo năm" },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> =
  {
    pending: { label: "Chờ xử lý", color: "#D97706", bg: "#FEF3C7" },
    confirmed: { label: "Đã xác nhận", color: "#2563EB", bg: "#DBEAFE" },
    processing: { label: "Đang xử lý", color: "#7C3AED", bg: "#EDE9FE" },
    shipping: { label: "Đang giao", color: "#0891B2", bg: "#CFFAFE" },
    delivered: { label: "Đã giao", color: "#059669", bg: "#D1FAE5" },
    completed: { label: "Hoàn thành", color: "#16A34A", bg: "#DCFCE7" },
    cancelled: { label: "Đã hủy", color: "#DC2626", bg: "#FEE2E2" },
    refunded: { label: "Hoàn tiền", color: "#9333EA", bg: "#F3E8FF" },
  };

const CHART_HEIGHT = 220;
const Y_AXIS_STEPS = 5;
const REFRESH_INTERVAL = 60_000; // 1 minute

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial values from URL or use defaults
  const [filterType, setFilterType] = useState<string>(
    searchParams.get("filter_type") || "month",
  );
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(
    searchParams.get("month")
      ? dayjs(searchParams.get("month"), "YYYY-MM")
      : dayjs(),
  );
  const [selectedYear, setSelectedYear] = useState<Dayjs>(
    searchParams.get("year")
      ? dayjs(searchParams.get("year"), "YYYY")
      : dayjs(),
  );
  const [fromDate, setFromDate] = useState<Dayjs | null>(
    searchParams.get("date_from") ? dayjs(searchParams.get("date_from")) : null,
  );
  const [toDate, setToDate] = useState<Dayjs | null>(
    searchParams.get("date_to") ? dayjs(searchParams.get("date_to")) : null,
  );

  const [loading, setLoading] = useState(false);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [inventoryQty, setInventoryQty] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [revenueBars, setRevenueBars] = useState<IRevenueBar[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<IOrderStatusRow[]>([]);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
    orders: number;
  } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Build URL params string
  const buildUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("filter_type", filterType);
    if (filterType === "month") {
      params.set("month", selectedMonth.format("YYYY-MM"));
    } else if (filterType === "year") {
      params.set("year", selectedYear.format("YYYY"));
    } else if (filterType === "date_range") {
      if (fromDate) params.set("date_from", fromDate.format("YYYY-MM-DD"));
      if (toDate) params.set("date_to", toDate.format("YYYY-MM-DD"));
    }
    return params;
  }, [filterType, selectedMonth, selectedYear, fromDate, toDate]);

  // Build API query params
  const buildApiParams = useCallback(() => {
    const q: Record<string, any> = { filter_type: filterType };
    if (filterType === "month") {
      q.month = selectedMonth.format("YYYY-MM");
    } else if (filterType === "year") {
      q.year = selectedYear.format("YYYY");
    } else if (filterType === "date_range") {
      if (fromDate) q.date_from = fromDate.format("YYYY-MM-DD");
      if (toDate) q.date_to = toDate.format("YYYY-MM-DD");
    }
    return q;
  }, [filterType, selectedMonth, selectedYear, fromDate, toDate]);

  const fetchDashboard = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const token = getToken();
        const res = await sendRequest<any>({
          url: "/admin/dashboard",
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          queryParams: buildApiParams(),
        });
        const data = res?.data;
        if (!data) return;

        setTotalOrders(data.total_orders || 0);
        setTotalRevenue(data.revenue || 0);
        setInventoryQty(data.total_stock_quantity || 0);
        setInventoryValue(data.total_stock_value || 0);

        // Revenue chart
        const chart = data.revenue_chart || [];
        setRevenueBars(
          chart.map((c: any) => {
            let label = c.label || "";
            // Format label for display
            if (filterType === "date_range" || filterType === "month") {
              const d = dayjs(label);
              if (d.isValid()) label = d.format("DD");
            }
            return {
              label,
              value: Number(c.revenue || 0),
              orders: Number(c.orders || 0),
            };
          }),
        );

        // Orders by status
        const statusData = data.orders_by_status || {};
        setOrdersByStatus(
          Object.entries(STATUS_MAP).map(([key, s]) => ({
            status: key,
            label: s.label,
            count: Number(statusData[key] || 0),
            color: s.color,
            bg: s.bg,
          })),
        );
      } catch {
        setTotalOrders(0);
        setTotalRevenue(0);
        setRevenueBars([]);
        setOrdersByStatus(
          Object.entries(STATUS_MAP).map(([key, s]) => ({
            status: key,
            label: s.label,
            count: 0,
            color: s.color,
            bg: s.bg,
          })),
        );
      } finally {
        setLoading(false);
      }
    },
    [buildApiParams, filterType],
  );

  // Initial fetch
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Auto refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleFilter = () => {
    const params = buildUrlParams();
    router.push(`/admin/dashboard?${params.toString()}`);
    fetchDashboard();
  };

  const handleReset = async () => {
    setFilterType("month");
    setSelectedMonth(dayjs());
    setSelectedYear(dayjs());
    setFromDate(null);
    setToDate(null);
    router.push("/admin/dashboard");
    // Gọi API với params mặc định (month = tháng hiện tại)
    try {
      setLoading(true);
      const token = getToken();
      const res = await sendRequest<any>({
        url: "/admin/dashboard",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { filter_type: "month", month: dayjs().format("YYYY-MM") },
      });
      const data = res?.data;
      if (!data) return;
      setTotalOrders(data.total_orders || 0);
      setTotalRevenue(data.revenue || 0);
      setInventoryQty(data.total_stock_quantity || 0);
      setInventoryValue(data.total_stock_value || 0);
      const chart = data.revenue_chart || [];
      setRevenueBars(
        chart.map((c: any) => {
          let label = c.label || "";
          const d = dayjs(label);
          if (d.isValid()) label = d.format("DD");
          return {
            label,
            value: Number(c.revenue || 0),
            orders: Number(c.orders || 0),
          };
        }),
      );
      const statusData = data.orders_by_status || {};
      setOrdersByStatus(
        Object.entries(STATUS_MAP).map(([key, s]) => ({
          status: key,
          label: s.label,
          count: Number(statusData[key] || 0),
          color: s.color,
          bg: s.bg,
        })),
      );
    } catch {
      setTotalOrders(0);
      setTotalRevenue(0);
      setRevenueBars([]);
      setOrdersByStatus(
        Object.entries(STATUS_MAP).map(([key, s]) => ({
          status: key,
          label: s.label,
          count: 0,
          color: s.color,
          bg: s.bg,
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (num: number) => `¥${num.toLocaleString("ja-JP")}`;

  const formatShort = (num: number) => {
    if (num >= 1_000_000) return `¥${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `¥${(num / 1_000).toFixed(0)}K`;
    return `¥${num}`;
  };

  const maxBarValue = Math.max(...revenueBars.map((b) => b.value), 1);
  const niceMax = (() => {
    if (maxBarValue <= 0) return 100;
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxBarValue)));
    const normalized = maxBarValue / magnitude;
    if (normalized <= 1) return magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
  })();

  const yLabels = Array.from(
    { length: Y_AXIS_STEPS + 1 },
    (_, i) => (niceMax / Y_AXIS_STEPS) * (Y_AXIS_STEPS - i),
  );

  const summaryCards = [
    {
      label: "Tổng đơn hàng",
      value: totalOrders.toLocaleString(),
      sub:
        filterType === "date_range"
          ? "Khoảng ngày"
          : filterType === "month"
            ? "Tháng này"
            : "Năm nay",
      color: "#2563EB",
      bg: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      iconBg: "#2563EB",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: "Doanh thu",
      value: formatCurrency(totalRevenue),
      sub: "Không tính đơn hủy/hoàn",
      color: "#16A34A",
      bg: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
      iconBg: "#16A34A",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      label: "Số lượng tồn kho",
      value: inventoryQty.toLocaleString(),
      sub: "Sản phẩm trong kho",
      color: "#D97706",
      bg: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)",
      iconBg: "#D97706",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: "Giá trị tồn kho",
      value: formatCurrency(inventoryValue),
      sub: "Tổng giá trị hàng trong kho",
      color: "#9333EA",
      bg: "linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)",
      iconBg: "#9333EA",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start gap-[16px]">
        {/* Filter Bar */}
        <div className="w-full px-[20px] py-[10px] bg-[#FFFFFF] rounded-[12px] flex items-center gap-[12px] shadow-sm flex-wrap">
          <span className="text-[13px] font-medium text-[#212222]">
            Lọc theo:
          </span>
          <Select
            value={filterType}
            onChange={(v) => setFilterType(v)}
            options={FILTER_OPTIONS}
            className="w-[140px] h-[32px]"
          />
          {filterType === "month" && (
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(d) => d && setSelectedMonth(d)}
              format="MM/YYYY"
              className="h-[32px]"
            />
          )}
          {filterType === "year" && (
            <DatePicker
              picker="year"
              value={selectedYear}
              onChange={(d) => d && setSelectedYear(d)}
              format="YYYY"
              className="h-[32px]"
            />
          )}
          {filterType === "date_range" && (
            <>
              <span className="text-[13px] text-[#9E9E9E]">Từ</span>
              <DatePicker
                value={fromDate}
                onChange={(d) => setFromDate(d)}
                format="DD/MM/YYYY"
                className="h-[32px] w-[135px]"
                placeholder="dd/mm/yyyy"
                allowClear
              />
              <span className="text-[13px] text-[#9E9E9E]">-</span>
              <DatePicker
                value={toDate}
                onChange={(d) => setToDate(d)}
                format="DD/MM/YYYY"
                className="h-[32px] w-[135px]"
                placeholder="dd/mm/yyyy"
                allowClear
              />
            </>
          )}
          <div
            onClick={handleReset}
            className="text-[12px] font-medium text-[#212222] border border-[#C8C8C8] px-[16px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95"
          >
            Đặt lại
          </div>
          <div
            onClick={handleFilter}
            className="text-white text-[12px] font-medium bg-[#212222] px-[16px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
          >
            Lọc dữ liệu
          </div>
        </div>

        {/* Summary Cards */}
        <div className="w-full grid grid-cols-4 gap-[14px]">
          {summaryCards.map((card, i) => (
            <div
              key={i}
              style={{ background: card.bg }}
              className="px-[18px] py-[18px] rounded-[14px] flex items-center gap-[14px] shadow-sm border border-white/60 hover:shadow-md transition-shadow duration-200"
            >
              <div
                style={{ backgroundColor: card.iconBg }}
                className="w-[44px] h-[44px] rounded-[12px] flex justify-center items-center shrink-0 shadow-sm"
              >
                {card.icon}
              </div>
              <div className="flex flex-col gap-[1px] min-w-0">
                <span className="text-[12px] text-[#6B7280] font-medium">
                  {card.label}
                </span>
                <span
                  style={{ color: card.color }}
                  className="text-[22px] font-bold leading-[1.2] truncate"
                >
                  {card.value}
                </span>
                {card.sub && (
                  <span className="text-[11px] text-[#BDBDBD]">{card.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Row: Revenue Chart + Order Status */}
        <div className="w-full flex gap-[14px]">
          {/* Revenue Bar Chart */}
          <div className="w-[65%] px-[20px] py-[18px] bg-[#FFFFFF] rounded-[14px] shadow-sm">
            <div className="flex justify-between items-center pb-[12px] border-b border-[#F0F0F0]">
              <div>
                <span className="text-[15px] font-semibold text-[#212222]">
                  Biểu đồ doanh thu
                </span>
                <span className="text-[12px] pl-[10px] text-[#9E9E9E]">
                  {filterType === "date_range"
                    ? "Theo ngày"
                    : filterType === "month"
                      ? "Theo ngày trong tháng"
                      : "Theo tháng trong năm"}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-[#2563EB]">
                {formatCurrency(totalRevenue)}
              </span>
            </div>

            <div
              ref={chartRef}
              className="mt-[16px] flex relative"
              style={{ height: `${CHART_HEIGHT + 28}px` }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Y-axis labels */}
              <div
                className="flex flex-col justify-between shrink-0 pr-[8px]"
                style={{ height: `${CHART_HEIGHT}px` }}
              >
                {yLabels.map((v, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-[#BDBDBD] text-right w-[50px] leading-none"
                  >
                    {formatShort(v)}
                  </span>
                ))}
              </div>

              {/* Chart area */}
              <div
                className="flex-1 relative"
                style={{ height: `${CHART_HEIGHT}px` }}
              >
                {/* Grid lines */}
                {yLabels.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-dashed border-[#F0F0F0]"
                    style={{ top: `${(i / Y_AXIS_STEPS) * 100}%` }}
                  />
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex items-end gap-[2px] px-[2px]">
                  {revenueBars.map((bar, i) => {
                    const heightPct =
                      niceMax > 0 ? (bar.value / niceMax) * 100 : 0;
                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center justify-end cursor-pointer"
                        style={{ height: "100%" }}
                        onMouseEnter={(e) => {
                          const rect =
                            chartRef.current?.getBoundingClientRect();
                          if (rect) {
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top - 10,
                              label: bar.label,
                              value: bar.value,
                              orders: bar.orders,
                            });
                          }
                        }}
                        onMouseMove={(e) => {
                          const rect =
                            chartRef.current?.getBoundingClientRect();
                          if (rect) {
                            setTooltip({
                              x: e.clientX - rect.left,
                              y: e.clientY - rect.top - 10,
                              label: bar.label,
                              value: bar.value,
                              orders: bar.orders,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <div
                          className="w-full rounded-t-[4px] transition-all duration-300"
                          style={{
                            height: `${Math.max(heightPct, bar.value > 0 ? 3 : 1)}%`,
                            background:
                              bar.value > 0
                                ? "linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)"
                                : "#F3F4F6",
                            minHeight: bar.value > 0 ? "4px" : "2px",
                            opacity:
                              tooltip && tooltip.label === bar.label
                                ? 1
                                : bar.value > 0
                                  ? 0.85
                                  : 0.5,
                            boxShadow:
                              bar.value > 0
                                ? "0 -2px 6px rgba(59,130,246,0.2)"
                                : "none",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Tooltip */}
                {tooltip && tooltip.value > 0 && (
                  <div
                    className="absolute pointer-events-none z-20"
                    style={{
                      left: tooltip.x,
                      top: tooltip.y,
                      transform: "translate(-50%, -100%)",
                    }}
                  >
                    <div className="bg-[#1E293B] text-white text-[11px] px-[10px] py-[5px] rounded-[8px] shadow-lg whitespace-nowrap">
                      <div className="font-semibold">
                        {formatCurrency(tooltip.value)}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">
                        {tooltip.orders} đơn - {tooltip.label}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex pl-[58px] pr-[2px]">
              {revenueBars.map((bar, i) => {
                const total = revenueBars.length;
                const showLabel =
                  total <= 12 ? true : i % Math.ceil(total / 15) === 0;
                return (
                  <div key={i} className="flex-1 text-center">
                    <span className="text-[9px] text-[#BDBDBD] leading-none">
                      {showLabel ? bar.label : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order by Status */}
          <div className="w-[35%] px-[20px] py-[18px] bg-[#FFFFFF] rounded-[14px] shadow-sm">
            <div className="pb-[12px] border-b border-[#F0F0F0]">
              <span className="text-[15px] font-semibold text-[#212222]">
                Đơn hàng theo trạng thái
              </span>
              <span className="text-[12px] pl-[8px] text-[#9E9E9E]">
                {totalOrders} đơn
              </span>
            </div>
            <div className="mt-[14px] flex flex-col gap-[10px]">
              {ordersByStatus.map((row) => {
                const totalOrd = Math.max(totalOrders, 1);
                const pct = Math.round((row.count / totalOrd) * 100);
                return (
                  <div
                    key={row.status}
                    className="flex items-center gap-[10px] group"
                  >
                    <div className="flex items-center gap-[6px] w-[110px] shrink-0">
                      <div
                        className="w-[8px] h-[8px] rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      <span className="text-[13px] text-[#4B5563]">
                        {row.label}
                      </span>
                    </div>
                    <div className="flex-1 h-[22px] bg-[#F9FAFB] rounded-[6px] overflow-hidden relative">
                      <div
                        className="h-full rounded-[6px] transition-all duration-500"
                        style={{
                          width: `${Math.max(pct, row.count > 0 ? 8 : 0)}%`,
                          background: `linear-gradient(90deg, ${row.bg} 0%, ${row.color}30 100%)`,
                          borderRight:
                            row.count > 0 ? `3px solid ${row.color}` : "none",
                        }}
                      />
                      {row.count > 0 && (
                        <span
                          className="absolute right-[6px] top-1/2 -translate-y-1/2 text-[11px] font-medium"
                          style={{ color: row.color }}
                        >
                          {pct}%
                        </span>
                      )}
                    </div>
                    <span
                      className="w-[32px] text-right text-[14px] font-bold shrink-0"
                      style={{ color: row.count > 0 ? row.color : "#D1D5DB" }}
                    >
                      {row.count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total summary */}
            <div className="mt-[16px] pt-[12px] border-t border-[#F0F0F0] flex justify-between items-center">
              <span className="text-[13px] text-[#6B7280] font-medium">
                Tổng cộng
              </span>
              <span className="text-[18px] font-bold text-[#212222]">
                {totalOrders}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
