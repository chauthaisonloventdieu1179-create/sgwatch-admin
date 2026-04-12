"use client";
import { getToken } from "@/api/ServerActions";
import Pagination from "@/components/pagination/pagination";
import { IClockProduct, IClockProductsResponse } from "@/types/admin/clock";
import { IBrandsResponse } from "@/types/admin/brand";
import { sendRequest } from "@/utils/api";
import { Checkbox, Input, Modal, Select, Spin } from "antd";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { message } from "antd";
import ConfirmDelete from "@/components/popup/popup.delete";

const MOVEMENT_TYPES = [
  { value: "quartz", label: "Quartz" },
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "solar", label: "Solar" },
  { value: "kinetic", label: "Kinetic" },
];

const STOCK_TYPES = [
  { value: "in_stock", label: "Hàng có sẵn" },
  { value: "pre_order", label: "Hàng order" },
];

const GENDERS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "couple", label: "Đồng hồ cặp" },
];

const DOMESTIC_OPTIONS = [
  { value: "0", label: "Hàng quốc tế" },
  { value: "1", label: "Hàng nội địa" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng" },
  { value: "price_desc", label: "Giá giảm" },
];

interface ProductListProps {
  categoryId?: string;
  pageTitle?: string;
  pageDescription?: string;
  routePrefix?: string;
  filterMode?: "full" | "keyword-brand" | "keyword-only";
  importApiPath?: string;
}

const ClockList = ({
  categoryId = "1",
  pageTitle = "Quản lý đồng hồ",
  pageDescription = "Xem danh sách sản phẩm đồng hồ.",
  routePrefix = "/admin/clock",
  filterMode = "full",
  importApiPath = "/admin/shop/products/import",
}: ProductListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đọc search params từ URL khi mount
  const [products, setProducts] = useState<IClockProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(() => Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(50);
  const [keyword, setKeyword] = useState<string>(() => searchParams.get("keyword") || "");
  const [brandId, setBrandId] = useState<string | undefined>(() => searchParams.get("brand_id") || undefined);
  const [movementType, setMovementType] = useState<string | undefined>(
    () => searchParams.get("movement_type") || undefined,
  );
  const [stockType, setStockType] = useState<string | undefined>(() => searchParams.get("stock_type") || undefined);
  const [gender, setGender] = useState<string | undefined>(() => searchParams.get("gender") || undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(() => searchParams.get("sort_by") || undefined);
  const [isDomestic, setIsDomestic] = useState<string | undefined>(() => searchParams.get("is_domestic") || undefined);
  const [isNew, setIsNew] = useState<string | undefined>(() => searchParams.get("is_new") || undefined);

  const [brandOptions, setBrandOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const [sortByOrder, setSortByOrder] = useState(() => searchParams.get("sort_by_order") === "1");

  // Sync state từ URL search params khi quay lại (router.back)
  useEffect(() => {
    setCurrentPage(Number(searchParams.get("page")) || 1);
    setKeyword(searchParams.get("keyword") || "");
    setBrandId(searchParams.get("brand_id") || undefined);
    setMovementType(searchParams.get("movement_type") || undefined);
    setStockType(searchParams.get("stock_type") || undefined);
    setGender(searchParams.get("gender") || undefined);
    setSortBy(searchParams.get("sort_by") || undefined);
    setIsDomestic(searchParams.get("is_domestic") || undefined);
    setIsNew(searchParams.get("is_new") || undefined);
    setSortByOrder(searchParams.get("sort_by_order") === "1");
  }, [searchParams]);

  // Ghi search params vào URL
  const pushSearchParams = useCallback((params: Record<string, string | undefined>, page: number) => {
    const sp = new URLSearchParams();
    if (page > 1) sp.set("page", String(page));
    Object.entries(params).forEach(([key, value]) => {
      if (value) sp.set(key, value);
    });
    const qs = sp.toString();
    router.replace(`${routePrefix}/${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router, routePrefix]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idDelete, setIdDelete] = useState<number | null>(null);
  const [nameDelete, setNameDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import popup state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importBrandId, setImportBrandId] = useState<string | undefined>(
    undefined,
  );
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const handleOpenImport = () => {
    setImportBrandId(undefined);
    setImportFile(null);
    setShowImportModal(true);
  };

  const handleImportFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
    event.target.value = "";
  };

  const handleImportSubmit = async () => {
    if (filterMode === "full" && !importBrandId) {
      message.warning("Vui lòng chọn thương hiệu và file Excel");
      return;
    }
    if (!importFile) {
      message.warning("Vui lòng chọn file Excel");
      return;
    }
    const token = getToken();
    const formData = new FormData();
    formData.append("file", importFile);
    if (importBrandId) formData.append("brand_id", importBrandId);
    formData.append("category_id", categoryId);

    try {
      setImportLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}${importApiPath}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );
      const resJson = await response.json();
      if (response.ok && resJson.status === "success") {
        message.success(resJson.message || "Import thành công");
        setShowImportModal(false);
        setCurrentPage(1);
        fetchData(1);
      } else {
        message.error(resJson.message || "Import thất bại");
      }
    } catch {
      message.error("Import thất bại");
    } finally {
      setImportLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const token = getToken();
      const response = await sendRequest<IBrandsResponse>({
        url: "/admin/shop-brands",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { per_page: 100 },
      });
      setBrandOptions(
        response.data.brands.map((b) => ({
          value: String(b.id),
          label: b.name,
        })),
      );
    } catch {
      setBrandOptions([]);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    pushSearchParams(getCurrentFilterParams(), currentPage);
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      const token = getToken();
      const queryParams: Record<string, any> = {
        per_page: perPage,
        page: page,
        category_id: categoryId,
      };
      if (keyword) queryParams.keyword = keyword;
      if (brandId) queryParams.brand_id = brandId;
      if (movementType) queryParams.movement_type = movementType;
      if (stockType) queryParams.stock_type = stockType;
      if (gender) queryParams.gender = gender;
      if (isDomestic !== undefined) queryParams.is_domestic = isDomestic;
      if (isNew !== undefined) queryParams.is_new = isNew;
      if (sortByOrder) {
        queryParams.sort_by = "display_order";
      } else if (sortBy) {
        queryParams.sort_by = sortBy;
      }

      const response = await sendRequest<IClockProductsResponse>({
        url: "/admin/shop/products",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: queryParams,
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.last_page);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentFilterParams = () => ({
    keyword: keyword || undefined,
    brand_id: brandId,
    movement_type: movementType,
    stock_type: stockType,
    gender: gender,
    sort_by: sortByOrder ? "display_order" : sortBy,
    is_domestic: isDomestic,
    is_new: isNew,
    sort_by_order: sortByOrder ? "1" : undefined,
  });

  const handleSearch = () => {
    setCurrentPage(1);
    pushSearchParams(getCurrentFilterParams(), 1);
    fetchData(1);
  };

  const handleReset = async () => {
    setKeyword("");
    setBrandId(undefined);
    setMovementType(undefined);
    setStockType(undefined);
    setGender(undefined);
    setSortBy(undefined);
    setIsDomestic(undefined);
    setIsNew(undefined);
    setSortByOrder(false);
    setCurrentPage(1);
    // Xóa tất cả search params trên URL
    router.replace(`${routePrefix}/`, { scroll: false });
    try {
      setLoading(true);
      const token = getToken();
      const response = await sendRequest<IClockProductsResponse>({
        url: "/admin/shop/products",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        queryParams: { per_page: perPage, page: 1, category_id: categoryId },
      });
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.last_page);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = () => {
    router.push(`${routePrefix}/create/`);
  };

  const handleUpdate = (id: number) => {
    router.push(`${routePrefix}/update?id=${id}`);
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

  const handleDelete = async () => {
    try {
      const token = getToken();
      if (!idDelete) return;
      await sendRequest({
        url: `/admin/shop/products/${idDelete}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData(currentPage);
    } catch (error) {
    } finally {
      setIsModalVisible(false);
      setIdDelete(null);
      setNameDelete("");
    }
  };

  const updateDisplayOrder = async (
    productId: number,
    displayOrder: number,
  ) => {
    try {
      const token = getToken();
      await sendRequest({
        url: "/admin/shop/products/sort-order",
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { id: productId, display_order: displayOrder },
      });
      message.success("Cập nhật vị trí thành công!");
      fetchData(currentPage);
    } catch {
      message.error("Cập nhật vị trí thất bại!");
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
        {/* <div className="text-start h-[22px] text-[18px] font-medium text-[#212222]">
          {pageTitle}
        </div> */}
        <div className="w-full mt-[0px] px-[16px] flex flex-col justify-start items-center bg-[#FFFFFF] rounded-[12px]">
          <div className="pb-[8px] pt-[5px] w-full border-b-[2px] border-[#C8C8C8] text-[#212222] text-[14px] font-medium">
            {pageTitle}
            <span className="text-[12px] pl-[10px] font-[400] text-[#9E9E9E]">
              {pageDescription}
            </span>
          </div>
          <div className="w-full px-[20px] mt-[20px] flex flex-col justify-start items-start gap-[12px]">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImportFileChange}
            />
            {filterMode !== "full" ? (
              <div className="w-full flex items-end gap-[12px]">
                <div className="flex flex-col gap-[4px] flex-1">
                  <span className="text-[12px] text-[#9E9E9E]">Từ khóa</span>
                  <Input
                    placeholder="Tên sản phẩm, SKU..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={handleSearch}
                    className="h-[32px] text-[14px]"
                  />
                </div>
                {filterMode === "keyword-brand" && (
                  <div className="flex flex-col gap-[4px] w-[200px]">
                    <span className="text-[12px] text-[#9E9E9E]">
                      Thương hiệu
                    </span>
                    <Select
                      allowClear
                      placeholder="Tất cả"
                      className="h-[32px] w-full"
                      value={brandId}
                      onChange={(value) => setBrandId(value)}
                      options={brandOptions}
                    />
                  </div>
                )}
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
                  onClick={handleAddPage}
                  className="w-[125px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] hover:text-[15px] flex justify-center items-center gap-[5px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
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
                  onClick={handleOpenImport}
                  className="w-[125px] h-[32px] bg-[#FFFFFF] border-2 border-[#212222] cursor-pointer rounded-[10px] text-[#212222] font-medium text-[12px] flex justify-center items-center gap-[5px] hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
                >
                  Import Excel
                </div>
              </div>
            ) : (
              <>
                <div className="w-full grid grid-cols-5 gap-[12px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">Từ khóa</span>
                    <Input
                      placeholder="Tên sản phẩm, SKU..."
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onPressEnter={handleSearch}
                      className="h-[32px] text-[14px]"
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">
                      Thương hiệu
                    </span>
                    <Select
                      allowClear
                      placeholder="Tất cả"
                      className="h-[32px] w-full"
                      value={brandId}
                      onChange={(value) => setBrandId(value)}
                      options={brandOptions}
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">Bộ máy</span>
                    <Select
                      allowClear
                      placeholder="Tất cả"
                      className="h-[32px] w-full"
                      value={movementType}
                      onChange={(value) => setMovementType(value)}
                      options={MOVEMENT_TYPES}
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">
                      Giới tính
                    </span>
                    <Select
                      allowClear
                      placeholder="Tất cả"
                      className="h-[32px] w-full"
                      value={gender}
                      onChange={(value) => setGender(value)}
                      options={GENDERS}
                    />
                  </div>
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[12px] text-[#9E9E9E]">
                      Tình trạng
                    </span>
                    <Select
                      allowClear
                      placeholder="Tất cả"
                      className="h-[32px] w-full"
                      value={isNew}
                      onChange={(value) => setIsNew(value)}
                      options={[
                        { value: "1", label: "Hàng mới" },
                        { value: "0", label: "Hàng cũ" },
                      ]}
                    />
                  </div>
                </div>
                <div className="w-full flex justify-between items-end gap-[12px]">
                  <div className="flex gap-[12px] items-end">
                    <div className="flex flex-col gap-[4px]">
                      <span className="text-[12px] text-[#9E9E9E]">
                        Kho hàng
                      </span>
                      <Select
                        allowClear
                        placeholder="Tất cả"
                        className="w-[150px] h-[32px]"
                        value={stockType}
                        onChange={(value) => setStockType(value)}
                        options={STOCK_TYPES}
                      />
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <span className="text-[12px] text-[#9E9E9E]">
                        Loại hàng
                      </span>
                      <Select
                        allowClear
                        placeholder="Tất cả"
                        className="w-[150px] h-[32px]"
                        value={isDomestic}
                        onChange={(value) => setIsDomestic(value)}
                        options={DOMESTIC_OPTIONS}
                      />
                    </div>
                    <div className="flex flex-col gap-[4px]">
                      <span className="text-[12px] text-[#9E9E9E]">
                        Sắp xếp
                      </span>
                      <Select
                        allowClear
                        placeholder="Tất cả"
                        value={sortBy}
                        onChange={(value) => setSortBy(value)}
                        className="w-[150px] h-[32px]"
                        options={SORT_OPTIONS}
                        disabled={sortByOrder}
                      />
                    </div>
                    <div className="flex items-center h-[32px]">
                      <Checkbox
                        checked={sortByOrder}
                        onChange={(e) => setSortByOrder(e.target.checked)}
                      >
                        <span className="text-[12px] text-[#212222] font-medium">
                          Sắp xếp theo order
                        </span>
                      </Checkbox>
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
                      onClick={handleAddPage}
                      className="w-[125px] h-[32px] bg-[#212222] cursor-pointer rounded-[10px] text-white font-medium text-[12px] hover:text-[15px] flex justify-center items-center gap-[5px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
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
                      onClick={handleOpenImport}
                      className="w-[125px] h-[32px] bg-[#FFFFFF] border-2 border-[#212222] cursor-pointer rounded-[10px] text-[#212222] font-medium text-[12px] flex justify-center items-center gap-[5px] hover:text-[14px] transition-all duration-200 ease-out hover:scale-105 active:scale-95 hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]"
                    >
                      Import Excel
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div
            style={{ height: "calc(100vh - 300px)" }}
            className="w-full px-[16px] mt-[18px]"
          >
            <div className="overflow-hidden ring-1 shadow-sm ring-black/5 sm:rounded-[8px]">
              <div className="max-h-[calc(100vh-310px)] overflow-y-auto hidden-scroll">
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
                        STT
                      </th>
                      <th
                        style={{ padding: "12px 8px" }}
                        className="w-[7%] text-center"
                      >
                        Ảnh
                      </th>
                      <th
                        style={{ padding: "12px 12px" }}
                        className="w-[12%] text-left"
                      >
                        SKU
                      </th>
                      <th
                        style={{ padding: "12px 12px" }}
                        className="w-[30%] text-left"
                      >
                        Tên sản phẩm
                      </th>
                      <th
                        style={{ padding: "12px 12px" }}
                        className="w-[12%] text-right"
                      >
                        Giá (JPY)
                      </th>
                      <th
                        style={{ padding: "12px 8px" }}
                        className="w-[8%] text-center"
                      >
                        Vị trí
                      </th>
                      <th
                        style={{ padding: "12px 12px" }}
                        className="w-[14%] text-right"
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
                    {Array.isArray(products) &&
                      products.map((item, index) => {
                        const primaryImg = item.primary_image_url || null;
                        return (
                          <tr
                            key={item.id}
                            style={{ borderBottom: "1px solid #ddd" }}
                            className="h-[56px] hover:bg-[#e5efff]"
                          >
                            <td
                              onClick={() => handleUpdate(item.id)}
                              className="cursor-pointer"
                              style={{ padding: "8px", textAlign: "center" }}
                            >
                              <span className="text-[13px] text-[#9E9E9E]">
                                {(currentPage - 1) * perPage + index + 1}
                              </span>
                            </td>
                            <td
                              onClick={() => handleUpdate(item.id)}
                              className="cursor-pointer"
                              style={{
                                padding: "6px 8px",
                                textAlign: "center",
                              }}
                            >
                              <div className="w-[40px] h-[40px] rounded-[6px] bg-[#F5F5F5] overflow-hidden mx-auto flex justify-center items-center">
                                {primaryImg ? (
                                  <img
                                    src={primaryImg}
                                    alt={item.name}
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
                            </td>
                            <td
                              onClick={() => handleUpdate(item.id)}
                              className="cursor-pointer"
                              style={{
                                padding: "8px 12px",
                                maxWidth: "120px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span className="text-[12px] font-mono text-[#9E9E9E]">
                                {item.sku}
                              </span>
                            </td>
                            <td
                              onClick={() => handleUpdate(item.id)}
                              className="cursor-pointer"
                              style={{
                                padding: "8px 12px",
                                maxWidth: "280px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <span className="text-[13px] font-medium text-[#212222]">
                                {item.name}
                              </span>
                            </td>
                            <td
                              onClick={() => handleUpdate(item.id)}
                              className="cursor-pointer"
                              style={{
                                padding: "8px 12px",
                                textAlign: "right",
                              }}
                            >
                              <span className="text-[13px] font-medium text-[#212222]">
                                ¥{Number(item.price_jpy).toLocaleString()}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "4px 8px",
                                textAlign: "center",
                              }}
                            >
                              <Input
                                type="number"
                                defaultValue={item.display_order ?? ""}
                                key={`${item.id}-${item.display_order}`}
                                className="w-[60px] h-[30px] text-center text-[13px]"
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  if (
                                    val === "" ||
                                    Number(val) === (item.display_order ?? 0)
                                  )
                                    return;
                                  updateDisplayOrder(item.id, Number(val));
                                }}
                                onPressEnter={(e) => {
                                  (e.target as HTMLInputElement).blur();
                                }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td
                              style={{
                                padding: "8px 12px",
                                textAlign: "right",
                              }}
                            >
                              <div className="flex justify-end gap-[8px]">
                                <div
                                  onClick={() => handleUpdate(item.id)}
                                  className="cursor-pointer w-[60px] h-[32px] flex justify-center items-center bg-[#212222] text-white text-[12px] rounded-[8px] hover:scale-105 transition-all duration-200"
                                >
                                  Sửa
                                </div>
                                <div
                                  onClick={() =>
                                    handleOpenConfirmRemove(item.id, item.name)
                                  }
                                  className="cursor-pointer w-[40px] hover:scale-105 hover:bg-red-200 hover:border-red-500 h-[32px] flex justify-center items-center border-2 border-[#C8C8C8] rounded-[8px]"
                                >
                                  <Image
                                    src="/epack/icon_remove.svg"
                                    alt=""
                                    width={16}
                                    height={20}
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {products.length > 0 && (
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
      {isModalVisible && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-20 z-[1500] flex justify-center items-center">
          <ConfirmDelete
            onClose={handleCloseConfirmRemove}
            onDelete={handleDelete}
            moduleText={"Bạn có chắc chắn muốn xóa sản phẩm này?"}
            confirm={"Sản phẩm"}
            id={nameDelete}
          />
        </div>
      )}
      <Modal
        open={showImportModal}
        title="Import Excel"
        okText="Import"
        cancelText="Hủy"
        onCancel={() => setShowImportModal(false)}
        onOk={handleImportSubmit}
        confirmLoading={importLoading}
        okButtonProps={{ disabled: (filterMode === "full" && !importBrandId) || !importFile }}
      >
        <div className="flex flex-col gap-[16px] mt-[16px]">
          {filterMode === "full" && (
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] font-medium text-[#0D1526]">
                Thương hiệu <span className="text-red-500">*</span>
              </span>
              <Select
                allowClear
                placeholder="Chọn thương hiệu"
                className="h-[36px] w-full"
                value={importBrandId}
                onChange={(value) => setImportBrandId(value)}
                options={brandOptions}
              />
            </div>
          )}
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px] font-medium text-[#0D1526]">
              Danh mục
            </span>
            <Input value={pageTitle} disabled className="h-[36px]" />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px] font-medium text-[#0D1526]">
              File Excel <span className="text-red-500">*</span>
            </span>
            <div className="flex items-center gap-[10px]">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="px-[16px] h-[36px] bg-[#212222] cursor-pointer rounded-[8px] text-white font-medium text-[12px] flex justify-center items-center hover:scale-105 transition-all duration-200"
              >
                Chọn file
              </div>
              <span className="text-[13px] text-[#9E9E9E]">
                {importFile ? importFile.name : "Chưa chọn file"}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default ClockList;
