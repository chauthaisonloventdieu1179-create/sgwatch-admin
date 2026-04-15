"use client";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Input, Select, Spin, message, InputNumber } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ---------- constants ----------
const PAYMENT_METHODS = [
  { value: "cash", label: "Tiền mặt" },
  { value: "bank_transfer", label: "Chuyển khoản" },
];

const SHIPPING_METHODS = [
  { value: "pickup", label: "Nhận tại cửa hàng" },
  { value: "standard", label: "Giao hàng" },
];

const COUNTRIES = [
  { value: "JP", label: "Nhật Bản" },
  { value: "VN", label: "Việt Nam" },
];

// ---------- types ----------
interface IProductOption {
  id: number;
  name: string;
  sku: string;
  price_jpy: string;
  image_url?: string;
}

interface IOrderItem {
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image?: string;
  unit_price: number;
  quantity: number;
}

interface IUserOption {
  id: number;
  full_name: string;
  email: string;
}

const OrderCreate = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const isEdit = !!orderId;

  // Customer type: "registered" or "walk_in"
  const [customerType, setCustomerType] = useState<"registered" | "walk_in">(
    "walk_in",
  );

  // Walk-in fields
  const [customerName, setCustomerName] = useState("");

  // Registered user fields
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [userOptions, setUserOptions] = useState<IUserOption[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userHasMore, setUserHasMore] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  // Order items
  const [items, setItems] = useState<IOrderItem[]>([]);

  // Product search with pagination
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<IProductOption[]>([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const [productHasMore, setProductHasMore] = useState(true);

  // Order fields
  const [currency] = useState("JPY");
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>(
    undefined,
  );
  const [shippingMethod, setShippingMethod] = useState<string | undefined>(
    undefined,
  );
  const [shippingCountry, setShippingCountry] = useState<string>("JP");
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingEmail, setShippingEmail] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [note, setNote] = useState("");
  const [shippingFee, setShippingFee] = useState<number>(0);

  // Discount code
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  // ---------- Fetch users with pagination + search ----------
  const fetchUsers = useCallback(
    async (page: number, search: string, append: boolean) => {
      try {
        setUserLoading(true);
        const token = getToken();
        const queryParams: Record<string, any> = { per_page: 20, page };
        if (search) queryParams.keyword = search;
        const res = await sendRequest<any>({
          url: "/admin/users",
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          queryParams,
        });
        const users = (res.data.users || []).map((u: any) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
        }));
        const lastPage = res.data.pagination?.last_page || 1;
        if (append) {
          setUserOptions((prev) => [...prev, ...users]);
        } else {
          setUserOptions(users);
        }
        setUserHasMore(page < lastPage);
      } catch {
        if (!append) setUserOptions([]);
      } finally {
        setUserLoading(false);
      }
    },
    [],
  );

  // Initial user load when switching to registered
  useEffect(() => {
    if (customerType === "registered") {
      setUserPage(1);
      fetchUsers(1, userSearch, false);
    }
  }, [customerType]);

  // User search debounce
  const userSearchTimer = useRef<NodeJS.Timeout>();
  const handleUserSearch = (value: string) => {
    setUserSearch(value);
    clearTimeout(userSearchTimer.current);
    userSearchTimer.current = setTimeout(() => {
      setUserPage(1);
      fetchUsers(1, value, false);
    }, 400);
  };

  const handleUserScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 &&
      userHasMore &&
      !userLoading
    ) {
      const nextPage = userPage + 1;
      setUserPage(nextPage);
      fetchUsers(nextPage, userSearch, true);
    }
  };

  // ---------- Product search with pagination ----------
  const fetchProducts = useCallback(
    async (page: number, search: string, append: boolean) => {
      try {
        setProductLoading(true);
        const token = getToken();
        const queryParams: Record<string, any> = { per_page: 20, page };
        if (search) queryParams.keyword = search;
        const res = await sendRequest<any>({
          url: "/admin/shop/products",
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          queryParams,
        });
        const products = (res.data.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          sku: p.sku || "",
          price_jpy: p.price_jpy || "0",
          image_url: p.images?.[0]?.image_url || "",
        }));
        const lastPage = res.data.pagination?.last_page || 1;
        if (append) {
          setProductOptions((prev) => [...prev, ...products]);
        } else {
          setProductOptions(products);
        }
        setProductHasMore(page < lastPage);
      } catch {
        if (!append) setProductOptions([]);
      } finally {
        setProductLoading(false);
      }
    },
    [],
  );

  // Load products on mount
  useEffect(() => {
    fetchProducts(1, "", false);
  }, []);

  const productSearchTimer = useRef<NodeJS.Timeout>();
  const handleProductSearch = (value: string) => {
    setProductSearch(value);
    clearTimeout(productSearchTimer.current);
    productSearchTimer.current = setTimeout(() => {
      setProductPage(1);
      fetchProducts(1, value, false);
    }, 400);
  };

  const handleProductScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 20 &&
      productHasMore &&
      !productLoading
    ) {
      const nextPage = productPage + 1;
      setProductPage(nextPage);
      fetchProducts(nextPage, productSearch, true);
    }
  };

  // ---------- Discount code ----------
  const handleCheckDiscount = async () => {
    const code = discountCode.trim();
    if (!code) {
      message.warning("Vui lòng nhập mã giảm giá");
      return;
    }
    try {
      setDiscountLoading(true);
      const token = getToken();
      const res = await sendRequest<any>({
        url: `/discount-codes/${code}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const dc = res.data.discount_code;
      if (dc && dc.available) {
        setDiscountAmount(Number(dc.amount));
        setDiscountApplied(true);
        message.success(`Áp dụng mã giảm giá thành công: -¥${Number(dc.amount).toLocaleString("ja-JP")}`);
      } else {
        setDiscountAmount(0);
        setDiscountApplied(false);
        message.error("Mã giảm giá không còn hiệu lực");
      }
    } catch {
      setDiscountAmount(0);
      setDiscountApplied(false);
      message.error("Mã giảm giá không tồn tại hoặc đã hết hạn");
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode("");
    setDiscountAmount(0);
    setDiscountApplied(false);
  };

  const handleAddProduct = (productId: number) => {
    const product = productOptions.find((p) => p.id === productId);
    if (!product) return;
    // Check if already exists
    const existing = items.find((i) => i.product_id === productId);
    if (existing) {
      setItems(
        items.map((i) =>
          i.product_id === productId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          product_image: product.image_url,
          unit_price: Number(product.price_jpy),
          quantity: 1,
        },
      ]);
    }
    setProductSearch("");
    setProductPage(1);
    fetchProducts(1, "", false);
  };

  const handleRemoveItem = (productId: number) => {
    setItems(items.filter((i) => i.product_id !== productId));
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    if (qty < 1) return;
    setItems(
      items.map((i) =>
        i.product_id === productId ? { ...i, quantity: qty } : i,
      ),
    );
  };

  // ---------- Load order for edit ----------
  useEffect(() => {
    if (isEdit && orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await sendRequest<any>({
        url: `/admin/shop/orders/${orderId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const order = res.data.order;
      if (!order) return;

      // Set customer type
      if (order.user?.id) {
        setCustomerType("registered");
        setUserId(order.user.id);
        setUserOptions([
          {
            id: order.user.id,
            full_name: order.user.full_name,
            email: order.user.email,
          },
        ]);
      } else {
        setCustomerType("walk_in");
        setCustomerName(order.customer_name || "");
      }

      // Set items
      setItems(
        (order.items || []).map((item: any) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          product_image: item.product_image,
          unit_price: Number(item.unit_price),
          quantity: item.quantity,
        })),
      );

      // Set order fields
      setPaymentMethod(order.payment_method || undefined);
      setShippingMethod(order.shipping_method || undefined);
      setShippingCountry(order.shipping_country || "JP");
      setShippingName(order.shipping_name || "");
      setShippingAddress(order.shipping_address || "");
      setShippingPhone(order.shipping_phone || "");
      setShippingEmail(order.shipping_email || "");
      setShippingCity(order.shipping_city || "");
      setShippingPostalCode(order.shipping_postal_code || "");
      setNote(order.note || "");
      setShippingFee(Number(order.shipping_fee || 0));

      // Discount
      if (order.discount_code) {
        setDiscountCode(order.discount_code);
        setDiscountAmount(Number(order.discount_amount || 0));
        setDiscountApplied(true);
      }
    } catch {
      message.error("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Submit ----------
  const handleSubmit = async () => {
    // Validate
    if (items.length === 0) {
      message.warning("Vui lòng thêm ít nhất 1 sản phẩm");
      return;
    }
    if (!paymentMethod) {
      message.warning("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (!shippingMethod) {
      message.warning("Vui lòng chọn phương thức vận chuyển");
      return;
    }
    if (customerType === "walk_in" && !customerName.trim()) {
      message.warning("Vui lòng nhập tên khách hàng");
      return;
    }
    if (customerType === "registered" && !userId) {
      message.warning("Vui lòng chọn khách hàng");
      return;
    }

    try {
      setLoading(true);
      const token = getToken();

      const body: Record<string, any> = {
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
        currency,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        shipping_country: shippingCountry,
      };

      if (customerType === "walk_in") {
        body.customer_name = customerName.trim();
        body.order_type = "walk_in";
      } else {
        body.user_id = userId;
      }

      // Shipping info (for registered or if filled)
      if (shippingName) body.shipping_name = shippingName;
      if (shippingAddress) body.shipping_address = shippingAddress;
      if (shippingPhone) body.shipping_phone = shippingPhone;
      if (shippingEmail) body.shipping_email = shippingEmail;
      if (shippingCity) body.shipping_city = shippingCity;
      if (shippingPostalCode) body.shipping_postal_code = shippingPostalCode;
      if (note) body.note = note;
      if (shippingFee > 0) body.shipping_fee = shippingFee;
      if (discountApplied && discountCode.trim())
        body.discount_code = discountCode.trim();

      if (isEdit) {
        await sendRequest({
          url: `/admin/shop/orders/${orderId}`,
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        message.success("Cập nhật đơn hàng thành công");
      } else {
        await sendRequest({
          url: "/admin/shop/orders",
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        message.success("Tạo đơn hàng thành công");
      }
      router.push("/admin/order");
    } catch (error: any) {
      console.error("Order submit error:", error);
      message.error(error?.message || error?.error || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const discountValue = discountApplied ? discountAmount : 0;
  const totalAmount = subtotal - discountValue + shippingFee;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[1500] flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}
      <div className="w-full flex flex-col justify-start items-start">
        <div className="w-full flex justify-between items-center">
          <div className="text-start text-[18px] font-medium text-[#212222]">
            {isEdit ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}
          </div>
          <div className="flex gap-[8px]">
            <div
              onClick={() => router.push("/admin/order")}
              className="text-[#212222] text-[12px] font-medium border-2 border-[#C8C8C8] px-[16px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95"
            >
              Quay lại
            </div>
            <div
              onClick={handleSubmit}
              className="text-white text-[12px] font-medium bg-[#212222] px-[16px] h-[32px] rounded-[10px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
            >
              {isEdit ? "Cập nhật" : "Tạo đơn hàng"}
            </div>
          </div>
        </div>

        <div className="w-full mt-[15px] flex flex-col gap-[16px]">
          {/* Customer Section */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Thông tin khách hàng
            </div>
            <div className="mt-[12px] flex flex-col gap-[12px]">
              <div className="flex items-center gap-[16px]">
                <span className="text-[13px] font-medium text-[#212222]">
                  Loại khách:
                </span>
                <div className="flex gap-[8px]">
                  <div
                    onClick={() => setCustomerType("walk_in")}
                    className={`px-[14px] h-[32px] rounded-[8px] text-[12px] font-medium cursor-pointer flex items-center justify-center transition-all ${
                      customerType === "walk_in"
                        ? "bg-[#212222] text-white"
                        : "border-2 border-[#C8C8C8] text-[#212222] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    Khách vãng lai
                  </div>
                  <div
                    onClick={() => setCustomerType("registered")}
                    className={`px-[14px] h-[32px] rounded-[8px] text-[12px] font-medium cursor-pointer flex items-center justify-center transition-all ${
                      customerType === "registered"
                        ? "bg-[#212222] text-white"
                        : "border-2 border-[#C8C8C8] text-[#212222] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    Khách đã đăng ký
                  </div>
                </div>
              </div>

              {customerType === "walk_in" ? (
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">
                      Tên khách hàng <span className="text-red-500">*</span>
                    </span>
                    <Input
                      placeholder="Nhập tên khách hàng..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-[36px] text-[14px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-[12px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">
                      Chọn khách hàng <span className="text-red-500">*</span>
                    </span>
                    <Select
                      showSearch
                      placeholder="Tìm theo tên hoặc email..."
                      value={userId}
                      onChange={(v) => setUserId(v)}
                      onSearch={handleUserSearch}
                      onPopupScroll={handleUserScroll}
                      filterOption={false}
                      loading={userLoading}
                      className="h-[36px] w-full"
                      notFoundContent={
                        userLoading ? <Spin size="small" /> : "Không tìm thấy"
                      }
                      options={userOptions.map((u) => ({
                        value: u.id,
                        label: `${u.full_name} (${u.email})`,
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Sản phẩm{items.length > 0 ? ` (${items.length})` : ""}
            </div>
            <div className="mt-[12px] flex flex-col gap-[12px]">
              {/* Product Search */}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Tìm sản phẩm</span>
                <Select
                  showSearch
                  placeholder="Nhập tên hoặc SKU sản phẩm..."
                  value={undefined}
                  onSearch={handleProductSearch}
                  onChange={handleAddProduct}
                  onPopupScroll={handleProductScroll}
                  filterOption={false}
                  loading={productLoading}
                  className="h-[36px] w-full"
                  notFoundContent={
                    productLoading ? <Spin size="small" /> : "Không tìm thấy"
                  }
                  options={productOptions.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  optionRender={(option) => {
                    const p = productOptions.find((x) => x.id === option.value);
                    if (!p) return option.label;
                    return (
                      <div className="flex items-center gap-[8px] py-[2px]">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt=""
                            className="w-[30px] h-[30px] object-cover rounded-[4px] flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-medium truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-[#9E9E9E]">
                            SKU: {p.sku} | ¥
                            {Number(p.price_jpy).toLocaleString("ja-JP")}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="overflow-hidden ring-1 shadow-sm ring-black/5 rounded-[8px]">
                  <table
                    style={{ borderCollapse: "collapse" }}
                    className="w-full"
                  >
                    <thead>
                      <tr className="bg-[#F5F5F5] text-left text-[13px] text-[#0D1526] font-[500]">
                        <th style={{ padding: "8px 12px" }} className="w-[5%]">
                          STT
                        </th>
                        <th style={{ padding: "8px 12px" }} className="w-[8%]">
                          Ảnh
                        </th>
                        <th style={{ padding: "8px 12px" }} className="w-[35%]">
                          Sản phẩm
                        </th>
                        <th style={{ padding: "8px 12px" }} className="w-[12%]">
                          SKU
                        </th>
                        <th
                          style={{ padding: "8px 12px" }}
                          className="w-[14%] text-right"
                        >
                          Đơn giá
                        </th>
                        <th
                          style={{ padding: "8px 12px" }}
                          className="w-[12%] text-center"
                        >
                          Số lượng
                        </th>
                        <th
                          style={{ padding: "8px 12px" }}
                          className="w-[14%] text-right"
                        >
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-[14px]">
                      {items.map((item, index) => (
                        <tr
                          key={item.product_id}
                          style={{ borderBottom: "1px solid #eee" }}
                        >
                          <td style={{ padding: "8px 12px" }}>{index + 1}</td>
                          <td style={{ padding: "8px 12px" }}>
                            {item.product_image ? (
                              <img
                                src={item.product_image}
                                alt=""
                                className="w-[40px] h-[40px] object-cover rounded-[4px]"
                              />
                            ) : (
                              <div className="w-[40px] h-[40px] bg-[#F5F5F5] rounded-[4px]" />
                            )}
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 500 }}>
                            {item.product_name}
                          </td>
                          <td style={{ padding: "8px 12px", color: "#9E9E9E" }}>
                            {item.product_sku}
                          </td>
                          <td
                            style={{ padding: "8px 12px", textAlign: "right" }}
                          >
                            ¥{item.unit_price.toLocaleString("ja-JP")}
                          </td>
                          <td
                            style={{ padding: "8px 12px", textAlign: "center" }}
                          >
                            <InputNumber
                              min={1}
                              value={item.quantity}
                              onChange={(v) =>
                                handleQuantityChange(item.product_id, v || 1)
                              }
                              className="w-[70px]"
                              size="small"
                            />
                          </td>
                          <td
                            style={{
                              padding: "8px 12px",
                              textAlign: "right",
                              fontWeight: 600,
                            }}
                          >
                            <div className="flex items-center justify-end gap-[8px]">
                              <span>
                                ¥
                                {(
                                  item.unit_price * item.quantity
                                ).toLocaleString("ja-JP")}
                              </span>
                              <div
                                onClick={() =>
                                  handleRemoveItem(item.product_id)
                                }
                                className="cursor-pointer w-[24px] h-[24px] flex justify-center items-center rounded-full hover:bg-red-100 text-red-500 text-[16px] transition-all"
                              >
                                ×
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Discount Code */}
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Mã giảm giá</span>
                <div className="flex items-center gap-[8px]">
                  <Input
                    placeholder="Nhập mã giảm giá..."
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      if (discountApplied) {
                        setDiscountApplied(false);
                        setDiscountAmount(0);
                      }
                    }}
                    className="h-[36px] text-[14px] w-[280px]"
                    disabled={discountApplied}
                  />
                  {!discountApplied ? (
                    <div
                      onClick={
                        discountLoading ? undefined : handleCheckDiscount
                      }
                      className={`text-white text-[12px] font-medium bg-[#2563EB] px-[16px] h-[36px] rounded-[8px] cursor-pointer flex justify-center items-center hover:scale-105 transition-all duration-200 ease-out active:scale-95 ${discountLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {discountLoading ? <Spin size="small" /> : "Kiểm tra"}
                    </div>
                  ) : (
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[13px] text-green-600 font-medium">
                        Giảm ¥{discountAmount.toLocaleString("ja-JP")}
                      </span>
                      <div
                        onClick={handleRemoveDiscount}
                        className="cursor-pointer w-[24px] h-[24px] flex justify-center items-center rounded-full hover:bg-red-100 text-red-500 text-[16px] transition-all"
                      >
                        ×
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              {items.length > 0 && (
                <div className="flex justify-end">
                  <div className="w-[300px] flex flex-col gap-[4px] text-[14px]">
                    <div className="flex justify-between">
                      <span className="text-[#9E9E9E]">Tạm tính:</span>
                      <span>¥{subtotal.toLocaleString("ja-JP")}</span>
                    </div>
                    {discountApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>-¥{discountValue.toLocaleString("ja-JP")}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[#9E9E9E]">Phí vận chuyển:</span>
                      <span>¥{shippingFee.toLocaleString("ja-JP")}</span>
                    </div>
                    <div className="flex justify-between border-t pt-[4px] mt-[2px] font-semibold text-[16px]">
                      <span>Tổng cộng:</span>
                      <span className="text-[#DC2626]">
                        ¥{totalAmount.toLocaleString("ja-JP")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment & Shipping Method */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Thanh toán & Vận chuyển
            </div>
            <div className="mt-[12px] grid grid-cols-3 gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">
                  Phương thức thanh toán <span className="text-red-500">*</span>
                </span>
                <Select
                  placeholder="Chọn..."
                  value={paymentMethod}
                  onChange={(v) => setPaymentMethod(v)}
                  options={PAYMENT_METHODS}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">
                  Phương thức vận chuyển <span className="text-red-500">*</span>
                </span>
                <Select
                  placeholder="Chọn..."
                  value={shippingMethod}
                  onChange={(v) => setShippingMethod(v)}
                  options={SHIPPING_METHODS}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">
                  Phí vận chuyển (¥)
                </span>
                <InputNumber
                  min={0}
                  value={shippingFee}
                  onChange={(v) => setShippingFee(v || 0)}
                  className="h-[36px] w-full"
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(v) => Number(v!.replace(/,/g, ""))}
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Địa chỉ giao hàng
            </div>
            <div className="mt-[12px] grid grid-cols-3 gap-[12px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Người nhận</span>
                <Input
                  placeholder="Tên người nhận..."
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="h-[36px] text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">
                  Số điện thoại
                </span>
                <Input
                  placeholder="Nhập SĐT..."
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="h-[36px] text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Email</span>
                <Input
                  placeholder="Nhập email..."
                  value={shippingEmail}
                  onChange={(e) => setShippingEmail(e.target.value)}
                  className="h-[36px] text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Địa chỉ</span>
                <Input
                  placeholder="Nhập địa chỉ..."
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="h-[36px] text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Thành phố</span>
                <Input
                  placeholder="Nhập thành phố..."
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="h-[36px] text-[14px]"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Quốc gia</span>
                <Select
                  value={shippingCountry}
                  onChange={(v) => setShippingCountry(v)}
                  options={COUNTRIES}
                  className="h-[36px] w-full"
                />
              </div>
              <div className="flex flex-col gap-[4px]">
                <span className="text-[12px] text-[#9E9E9E]">Mã bưu điện</span>
                <Input
                  placeholder="Nhập mã bưu điện..."
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  className="h-[36px] text-[14px]"
                />
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="w-full px-[20px] py-[16px] bg-[#FFFFFF] rounded-[12px]">
            <div className="pb-[8px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
              Ghi chú
            </div>
            <div className="mt-[12px]">
              <TextArea
                placeholder="Nhập ghi chú cho đơn hàng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="text-[14px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderCreate;
