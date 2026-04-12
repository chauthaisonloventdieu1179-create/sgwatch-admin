"use client";
import { getToken } from "@/api/ServerActions";
import { sendRequest } from "@/utils/api";
import { Input, Spin, message } from "antd";
import { useEffect, useState, useRef, useCallback } from "react";
import { Search, X, Save, Plus } from "lucide-react";
import ConfirmDelete from "@/components/popup/popup.delete";
import Image from "next/image";

interface IProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface IProduct {
  id: number;
  name: string;
  sku: string;
  price_jpy: string;
  price_vnd: string;
  brand: { id: number; name: string; slug: string } | null;
  images?: IProductImage[];
  primary_image_url?: string | null;
}

interface ICollection {
  id: number;
  name: string;
  description: string | null;
  products?: IProduct[];
  product_ids?: number[];
  products_count?: number;
}

interface ICollectionsResponse {
  message: string;
  status_code: number;
  data: {
    collections: ICollection[];
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

interface ICollectionDetailResponse {
  message: string;
  status_code: number;
  data: {
    collection: ICollection;
  };
}

interface IProductsResponse {
  data: {
    products: IProduct[];
  };
}

const CollectionList = () => {
  const [collections, setCollections] = useState<ICollection[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [modalName, setModalName] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  const [saving, setSaving] = useState(false);

  // Product search
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<IProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Delete
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await sendRequest<ICollectionsResponse>({
        url: "/admin/shop/collections",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections(res.data?.collections || []);
    } catch {
      setCollections([]);
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
        url: `/admin/shop/products?keyword=${encodeURIComponent(keyword.trim())}&page=1&per_page=15`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data?.products || []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPrimaryImage = (product: IProduct) => {
    if (product.primary_image_url) return product.primary_image_url;
    return product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url || null;
  };

  const handleAddProduct = (product: IProduct) => {
    if (selectedProducts.some((p) => Number(p.id) === Number(product.id))) {
      message.warning("Sản phẩm đã có trong bộ sưu tập!");
      return;
    }
    setSelectedProducts((prev) => [...prev, product]);
    setSearchKeyword("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => Number(p.id) !== Number(productId)));
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setModalName("");
    setModalDescription("");
    setSelectedProducts([]);
    setSearchKeyword("");
    setShowModal(true);
  };

  const handleOpenEdit = async (id: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await sendRequest<ICollectionDetailResponse>({
        url: `/admin/shop/collections/${id}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const col = res.data.collection;
      setEditId(id);
      setModalName(col.name || "");
      setModalDescription(col.description || "");
      setSelectedProducts(col.products || []);
      setSearchKeyword("");
      setShowModal(true);
    } catch {
      message.error("Không thể tải thông tin bộ sưu tập!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!modalName.trim()) {
      message.warning("Vui lòng nhập tên bộ sưu tập!");
      return;
    }
    try {
      setSaving(true);
      const token = getToken();
      const body = {
        name: modalName,
        description: modalDescription,
        product_ids: selectedProducts.map((p) => p.id),
      };
      if (editId) {
        await sendRequest({
          url: `/admin/shop/collections/${editId}`,
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        message.success("Cập nhật bộ sưu tập thành công!");
      } else {
        await sendRequest({
          url: "/admin/shop/collections",
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        message.success("Tạo bộ sưu tập thành công!");
      }
      setShowModal(false);
      fetchCollections();
    } catch {
      message.error("Thao tác thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setModalName("");
    setModalDescription("");
    setSelectedProducts([]);
    setSearchKeyword("");
  };

  const handleOpenConfirmRemove = (id: number, label: string) => {
    setNameDelete(label);
    setIdDelete(id);
    setIsModalVisible(true);
  };

  const handleCloseConfirmRemove = () => {
    setNameDelete("");
    setIdDelete(null);
    setIsModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!idDelete) return;
      await sendRequest({
        url: `/admin/shop/collections/${idDelete}`,
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCollections();
    } catch {
    } finally {
      setIsModalVisible(false);
      setIdDelete(null);
      setNameDelete("");
    }
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
          Bộ sưu tập
        </div>
        <div className="w-full mt-[15px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            Danh sách bộ sưu tập
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              Quản lý các bộ sưu tập sản phẩm.
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex justify-end items-center">
            <div
              onClick={handleOpenCreate}
              className="w-[150px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] hover:text-[15px] flex justify-center items-center gap-[5px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
            >
              <Plus size={14} />
              Thêm mới
            </div>
          </div>

          <div
            style={{ height: "calc(100vh - 240px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto hidden-scroll">
                {collections.length === 0 && !loading ? (
                  <div className="flex justify-center items-center py-[60px] text-[14px] text-[#9E9E9E]">
                    Chưa có bộ sưu tập nào.
                  </div>
                ) : (
                  <table style={{ borderCollapse: "collapse" }} className="w-full bg-[#FFFFFF]">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-[#E6E6E6] text-left text-[14px] text-[#0D1526] font-[500]">
                        <th style={{ padding: "12px 16px" }} className="w-[5%] text-center">#</th>
                        <th style={{ padding: "12px 16px" }} className="w-[30%]">Tên bộ sưu tập</th>
                        <th style={{ padding: "12px 16px" }} className="w-[35%]">Mô tả</th>
                        <th style={{ padding: "12px 16px" }} className="w-[10%] text-center">Số SP</th>
                        <th style={{ padding: "12px 16px" }} className="w-[20%] text-right">Thao tác</th>
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
                      {collections.map((col, index) => (
                        <tr
                          key={col.id}
                          style={{ borderBottom: "1px solid #ddd" }}
                          className="h-[56px] hover:bg-[#F9F9F9] transition-all duration-150"
                        >
                          <td style={{ padding: "8px 16px" }} className="text-center text-[13px] text-[#9E9E9E]">
                            {index + 1}
                          </td>
                          <td style={{ padding: "8px 16px" }}>
                            <div className="text-[13px] font-medium text-[#212222]">{col.name}</div>
                          </td>
                          <td style={{ padding: "8px 16px" }}>
                            <div className="text-[12px] text-[#9E9E9E] line-clamp-2">{col.description || "—"}</div>
                          </td>
                          <td style={{ padding: "8px 16px" }} className="text-center">
                            <span className="text-[12px] font-medium text-[#212222]">
                              {col.products?.length ?? col.products_count ?? 0}
                            </span>
                          </td>
                          <td style={{ padding: "8px 16px", textAlign: "right" }}>
                            <div className="flex justify-end gap-[8px]">
                              <div
                                onClick={() => handleOpenEdit(col.id)}
                                className="cursor-pointer w-[50px] h-[28px] flex justify-center items-center bg-[#212222] text-white text-[11px] rounded-[6px] hover:scale-105 transition-all duration-200"
                              >
                                Sửa
                              </div>
                              <div
                                onClick={() => handleOpenConfirmRemove(col.id, col.name)}
                                className="cursor-pointer w-[36px] hover:scale-105 hover:bg-red-200 hover:border-red-500 h-[28px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[6px]"
                              >
                                <Image
                                  src="/epack/icon_remove.svg"
                                  alt=""
                                  width={14}
                                  height={18}
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <div className="w-[620px] bg-[#FFFFFF] rounded-[12px] p-[24px] flex flex-col gap-[14px] max-h-[90vh] overflow-y-auto">
            <div className="text-[16px] font-medium text-[#212222]">
              {editId ? "Cập nhật bộ sưu tập" : "Tạo bộ sưu tập mới"}
            </div>

            {/* Name */}
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">
                Tên bộ sưu tập <span className="text-red-500">*</span>
              </label>
              <Input
                value={modalName}
                onChange={(e) => setModalName(e.target.value)}
                placeholder="Nhập tên bộ sưu tập"
                className="h-[36px] w-full text-[13px] mt-[6px]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">Mô tả</label>
              <Input.TextArea
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                placeholder="Nhập mô tả (tuỳ chọn)"
                rows={2}
                className="w-full text-[13px] mt-[6px]"
              />
            </div>

            {/* Product search */}
            <div>
              <label className="text-[13px] font-[400] text-[#212222]">
                Sản phẩm ({selectedProducts.length})
              </label>
              <div className="relative mt-[6px]" ref={dropdownRef}>
                <Input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm sản phẩm theo tên, SKU..."
                  className="h-[36px] text-[13px] pr-[36px]"
                  suffix={
                    searching ? (
                      <Spin size="small" />
                    ) : (
                      <Search size={16} className="text-[#9E9E9E]" />
                    )
                  }
                />
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-[38px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-[100] max-h-[240px] overflow-y-auto hidden-scroll">
                    {searchResults.map((product) => {
                      const alreadyAdded = selectedProducts.some(
                        (p) => Number(p.id) === Number(product.id)
                      );
                      const imgUrl = getPrimaryImage(product);
                      return (
                        <div
                          key={product.id}
                          onClick={() => !alreadyAdded && handleAddProduct(product)}
                          className={`flex items-center gap-[10px] px-[12px] py-[8px] border-b border-[#F0F0F0] last:border-b-0 transition-all ${
                            alreadyAdded
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-[#e5efff]"
                          }`}
                        >
                          <div className="w-[36px] h-[36px] min-w-[36px] rounded-[6px] bg-[#F5F5F5] overflow-hidden flex justify-center items-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            ) : (
                              <span className="text-[9px] text-[#9E9E9E]">No img</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-[#212222] truncate">{product.name}</div>
                            <div className="text-[11px] text-[#9E9E9E]">
                              SKU: {product.sku}
                              {product.brand ? ` • ${product.brand.name}` : ""}
                            </div>
                          </div>
                          {alreadyAdded && (
                            <span className="text-[11px] text-[#1572FF] font-medium whitespace-nowrap">Đã thêm</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {showDropdown && searchResults.length === 0 && !searching && searchKeyword.trim() && (
                  <div className="absolute top-[38px] left-0 right-0 bg-white border border-[#E6E6E6] rounded-[10px] shadow-lg z-[100] p-[12px] text-center text-[13px] text-[#9E9E9E]">
                    Không tìm thấy sản phẩm
                  </div>
                )}
              </div>
            </div>

            {/* Selected products */}
            {selectedProducts.length > 0 && (
              <div className="flex flex-col gap-[6px] max-h-[200px] overflow-y-auto hidden-scroll">
                {selectedProducts.map((product) => {
                  const imgUrl = getPrimaryImage(product);
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-[10px] px-[10px] py-[6px] bg-[#F9F9F9] rounded-[8px] border border-[#E6E6E6]"
                    >
                      <div className="w-[32px] h-[32px] min-w-[32px] rounded-[4px] bg-[#E6E6E6] overflow-hidden flex justify-center items-center">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <span className="text-[9px] text-[#9E9E9E]">No img</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium text-[#212222] truncate">{product.name}</div>
                        <div className="text-[10px] text-[#9E9E9E]">SKU: {product.sku}</div>
                      </div>
                      <div
                        onClick={() => handleRemoveProduct(product.id)}
                        className="cursor-pointer w-[24px] h-[24px] flex justify-center items-center rounded-[4px] border border-[#C8C8C8] hover:bg-red-100 hover:border-red-400 transition-all duration-200"
                      >
                        <X size={12} className="text-[#9E9E9E] hover:text-red-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-[10px] pt-[4px]">
              <div
                onClick={handleCloseModal}
                className="w-[80px] h-[36px] border border-[#C8C8C8] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-[#212222] font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Hủy
              </div>
              <div
                onClick={saving ? undefined : handleSave}
                className={`h-[36px] px-[16px] bg-[#212222] rounded-[8px] flex justify-center items-center cursor-pointer text-[13px] text-white font-medium gap-[6px] transition-all duration-200 hover:scale-105 ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Save size={14} />
                {saving ? "Đang lưu..." : "Lưu"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isModalVisible && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <ConfirmDelete
            onClose={handleCloseConfirmRemove}
            onDelete={handleDelete}
            moduleText={"Bạn có chắc chắn muốn xóa bộ sưu tập này?"}
            confirm={"Bộ sưu tập"}
            id={nameDelete}
          />
        </div>
      )}
    </>
  );
};

export default CollectionList;
