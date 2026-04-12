"use client";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Input, Spin, message } from "antd";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search, GripVertical, X, Save } from "lucide-react";

interface IProductImage {
  id: number;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface IProductBrand {
  id: number;
  name: string;
  slug: string;
}

interface IProductCategory {
  id: number;
  name: string;
  slug: string;
}

interface IProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price_jpy: string;
  price_vnd: string;
  original_price_jpy: string | null;
  original_price_vnd: string | null;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  brand: IProductBrand | null;
  category: IProductCategory | null;
  images?: IProductImage[];
  primary_image_url?: string | null;
}

interface IProductsResponse {
  data: {
    products: IProduct[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

interface IFeaturedResponse {
  message: string;
  status_code: number;
  data: {
    products: IProduct[];
  };
}

const MAX_FEATURED = 8;

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load current featured products on mount
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await sendRequest<IFeaturedResponse>({
        url: "/admin/shop/products/featured",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.products && Array.isArray(res.data.products)) {
        setFeaturedProducts(res.data.products);
      } else {
        setFeaturedProducts([]);
      }
    } catch {
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = useCallback(async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      setSearching(true);
      const token = getToken();
      const res = await sendRequest<IProductsResponse>({
        url: `/admin/shop/products?keyword=${encodeURIComponent(keyword.trim())}&page=1&per_page=15&category_id=1`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data.products || []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimerRef.current = setTimeout(() => {
      searchProducts(searchKeyword);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchKeyword, searchProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Add product to featured
  const handleAddProduct = (product: IProduct) => {
    if (featuredProducts.length >= MAX_FEATURED) {
      message.warning(`Tối đa ${MAX_FEATURED} sản phẩm!`);
      return;
    }
    if (featuredProducts.some((p) => Number(p.id) === Number(product.id))) {
      message.warning("Sản phẩm đã có trong danh sách!");
      return;
    }
    setFeaturedProducts((prev) => [...prev, product]);
    setSearchKeyword("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Remove product from featured
  const handleRemoveProduct = (productId: number) => {
    setFeaturedProducts((prev) =>
      prev.filter((p) => Number(p.id) !== Number(productId)),
    );
  };

  // Save featured products
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const productIds = featuredProducts.map((p) => p.id);
      await sendRequest<IFeaturedResponse>({
        url: "/admin/shop/products/featured",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { product_ids: productIds },
      });
      message.success("Lưu sản phẩm nổi bật thành công!");
      // Refetch from server to ensure consistency
      await fetchFeaturedProducts();
    } catch (error: any) {
      message.error(error?.message || "Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // ========== Drag & Drop ==========
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (
      dragIndex !== null &&
      dragOverIndex !== null &&
      dragIndex !== dragOverIndex
    ) {
      setFeaturedProducts((prev) => {
        const updated = [...prev];
        const [dragged] = updated.splice(dragIndex, 1);
        updated.splice(dragOverIndex, 0, dragged);
        return updated;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getPrimaryImage = (product: IProduct) => {
    if (product.primary_image_url) return product.primary_image_url;
    const primary = product.images?.find((img) => img.is_primary);
    return primary?.image_url || product.images?.[0]?.image_url || null;
  };

  const formatPrice = (jpy: string | null, vnd: string | null) => {
    if (jpy) return `¥${Number(jpy).toLocaleString()}`;
    if (vnd) return `₫${Number(vnd).toLocaleString()}`;
    return "—";
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
          Sản phẩm nổi bật trang chủ
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Chọn sản phẩm hiển thị trang chủ
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Tối đa {MAX_FEATURED} sản phẩm. Kéo để thay đổi thứ tự.
            </span>
          </div>

          {/* Search area */}
          <div className="w-full px-[20px] mt-[20px] flex flex-col gap-[12px]">
            <div className="w-full flex justify-between items-center gap-[12px]">
              <div className="relative flex-1 max-w-[500px]" ref={dropdownRef}>
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên, SKU..."
                  className="h-[40px] rounded-[10px] pr-[40px]"
                  suffix={
                    searching ? (
                      <Spin size="small" />
                    ) : (
                      <Search size={18} className="text-[#9E9E9E]" />
                    )
                  }
                />
                {/* Search dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-[44px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-[100] max-h-[320px] overflow-y-auto hidden-scroll">
                    {searchResults.map((product) => {
                      const alreadyAdded = featuredProducts.some(
                        (p) => Number(p.id) === Number(product.id),
                      );
                      const imgUrl = getPrimaryImage(product);
                      return (
                        <div
                          key={product.id}
                          onClick={() =>
                            !alreadyAdded && handleAddProduct(product)
                          }
                          className={`flex items-center gap-[10px] px-[12px] py-[8px] border-b border-[#F0F0F0] last:border-b-0 transition-all ${
                            alreadyAdded
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-[#e5efff]"
                          }`}
                        >
                          <div className="w-[40px] h-[40px] min-w-[40px] rounded-[6px] bg-[#F5F5F5] overflow-hidden flex justify-center items-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span className="text-[10px] text-[#9E9E9E]">
                                No img
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-[#212222] truncate">
                              {product.name}
                            </div>
                            <div className="text-[11px] text-[#9E9E9E]">
                              SKU: {product.sku} •{" "}
                              {formatPrice(
                                product.price_jpy,
                                product.price_vnd,
                              )}
                              {product.brand ? ` • ${product.brand.name}` : ""}
                            </div>
                          </div>
                          {alreadyAdded && (
                            <span className="text-[11px] text-[#1572FF] font-medium whitespace-nowrap">
                              Đã thêm
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {showDropdown &&
                  searchResults.length === 0 &&
                  !searching &&
                  searchKeyword.trim() && (
                    <div className="absolute top-[44px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-[100] p-[16px] text-center text-[13px] text-[#9E9E9E]">
                      Không tìm thấy sản phẩm
                    </div>
                  )}
              </div>
              <div
                onClick={saving ? undefined : handleSave}
                className={`w-[120px] h-[40px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[13px] flex justify-center items-center gap-[6px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)] ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Save size={16} />
                {saving ? "Đang lưu..." : "Lưu"}
              </div>
            </div>

            <div className="text-[12px] text-[#9E9E9E]">
              Đã chọn: {featuredProducts.length}/{MAX_FEATURED} sản phẩm
            </div>
          </div>

          {/* Featured products list */}
          <div
            style={{ height: "calc(100vh - 290px)" }}
            className="w-full px-[16px] mt-[12px] pb-[16px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto hidden-scroll">
                {featuredProducts.length === 0 ? (
                  <div className="flex flex-col justify-center items-center py-[60px] text-[#9E9E9E]">
                    <div className="text-[14px]">
                      Chưa có sản phẩm nào. Tìm và thêm sản phẩm ở trên.
                    </div>
                  </div>
                ) : (
                  <table
                    style={{ borderCollapse: "collapse" }}
                    className="w-full bg-[#FFFFFF]"
                  >
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                        <th
                          style={{ padding: "12px 8px" }}
                          className="w-[5%] text-center"
                        >
                          #
                        </th>
                        {/* <th
                          style={{ padding: "12px 16px" }}
                          className="w-[8%] text-center"
                        >
                          Ảnh
                        </th> */}
                        <th
                          style={{ padding: "12px 16px" }}
                          className="w-[30%] text-left"
                        >
                          Tên sản phẩm
                        </th>
                        <th
                          style={{ padding: "12px 16px" }}
                          className="w-[12%] text-left"
                        >
                          SKU
                        </th>
                        <th
                          style={{ padding: "12px 16px" }}
                          className="w-[12%] text-left"
                        >
                          Thương hiệu
                        </th>
                        <th
                          style={{ padding: "12px 16px" }}
                          className="w-[13%] text-right"
                        >
                          Giá (JPY)
                        </th>
                        {/* <th
                          style={{ padding: "12px 16px" }}
                          className="w-[10%] text-center"
                        >
                          Trạng thái
                        </th> */}
                        <th
                          style={{ padding: "12px 16px" }}
                          className="w-[10%] text-right"
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
                      {featuredProducts.map((product, index) => {
                        const imgUrl = getPrimaryImage(product);
                        return (
                          <tr
                            key={product.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            style={{ borderBottom: "1px solid #ddd" }}
                            className={`h-[60px] transition-all duration-150 ${
                              dragIndex === index
                                ? "opacity-40 bg-[#F5F5F5]"
                                : dragOverIndex === index
                                  ? "bg-[#e5efff] border-t-2 border-[#1572FF]"
                                  : "hover:bg-[#F9F9F9]"
                            }`}
                          >
                            <td
                              style={{ padding: "8px" }}
                              className="text-center"
                            >
                              <div className="flex items-center justify-center gap-[4px]">
                                <GripVertical
                                  size={16}
                                  className="text-[#C8C8C8] cursor-grab active:cursor-grabbing"
                                />
                                <span className="text-[13px] text-[#9E9E9E]">
                                  {index + 1}
                                </span>
                              </div>
                            </td>
                            {/* <td
                              style={{ padding: "8px 16px" }}
                              className="text-center"
                            >
                              <div className="w-[44px] h-[44px] rounded-[6px] bg-[#F5F5F5] overflow-hidden mx-auto flex justify-center items-center">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <span className="text-[9px] text-[#9E9E9E]">
                                    No img
                                  </span>
                                )}
                              </div>
                            </td> */}
                            <td style={{ padding: "8px 16px" }}>
                              <div className="text-[13px] font-medium text-[#212222] line-clamp-2">
                                {product.name}
                              </div>
                            </td>
                            <td style={{ padding: "8px 16px" }}>
                              <span className="text-[12px] font-mono text-[#9E9E9E]">
                                {product.sku}
                              </span>
                            </td>
                            <td style={{ padding: "8px 16px" }}>
                              <span className="text-[12px] text-[#212222]">
                                {product.brand?.name || "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "8px 16px",
                                textAlign: "right",
                              }}
                            >
                              <span className="text-[13px] font-medium text-[#212222]">
                                ¥{Number(product.price_jpy).toLocaleString()}
                              </span>
                            </td>
                            {/* <td
                              style={{
                                padding: "8px 16px",
                                textAlign: "center",
                              }}
                            >
                              <span
                                className={`text-[11px] px-[6px] py-[2px] rounded-[4px] ${
                                  product.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {product.is_active ? "Hoạt động" : "Ẩn"}
                              </span>
                            </td> */}
                            <td
                              style={{
                                padding: "8px 16px",
                                textAlign: "right",
                              }}
                            >
                              <div
                                onClick={() => handleRemoveProduct(product.id)}
                                className="cursor-pointer w-[32px] h-[32px] ml-auto flex justify-center items-center rounded-[8px] border border-[#C8C8C8] hover:bg-red-100 hover:border-red-400 transition-all duration-200"
                              >
                                <X
                                  size={16}
                                  className="text-[#9E9E9E] hover:text-red-500"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default FeaturedProducts;
