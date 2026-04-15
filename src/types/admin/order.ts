export interface IOrderUser {
  id: number;
  uuid?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
}

export interface IOrder {
  id: number;
  order_number: string;
  order_type: string;
  customer_name: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_receipt: string | null;
  shipping_method: string;
  total_amount: string;
  currency: string;
  total_items: number;
  user: IOrderUser | null;
  created_at: string;
}

export interface IOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface IOrderDetail {
  id: number;
  order_number: string;
  order_type: string;
  customer_name: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_receipt: string | null;
  shipping_method: string;
  subtotal: string;
  shipping_fee: string;
  cod_fee: string;
  stripe_fee: number;
  deposit_amount: string;
  discount_amount: string;
  points_used: number;
  points_earned: number;
  total_amount: string;
  currency: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postal_code: string;
  note: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  cancel_reason: string | null;
  admin_note: string | null;
  confirmed_at: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  items: IOrderItem[];
  user: IOrderUser;
}

export interface IOrderPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface IOrdersResponse {
  message: string;
  status_code: number;
  data: {
    orders: IOrder[];
    pagination: IOrderPagination;
  };
}

export interface IOrderDetailResponse {
  message: string;
  status_code: number;
  data: {
    order: IOrderDetail;
  };
}

// Legacy types (used by orderDeliveryMaint)
export interface IPagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: {
    next?: string;
    prev?: string;
  };
}
export interface IOrderDelivery {
  id: number;
  company_name: string;
  order_number: string;
  order_date: string;
  delivery_date: string;
  with_count_order_detail: number;
}
export interface IOrderDeliveryResponse {
  message: string;
  status_code: number;
  data: {
    orders: IOrderDelivery[];
    pagination: IPagination;
  };
}
export interface IOrderAndDeliveryDetailChild {
  product_id: number;
  product_name: string;
  product_number: string;
  color: string;
  price: string;
  quantity: number;
  size_name: string;
}
export interface IOrderAndDeliveryDetail {
  manager: string;
  order_number: string;
  delivery_store_name: string;
  order_store_name: string;
  details: IOrderAndDeliveryDetailChild[];
}
export interface IOrderAndDeliveryDetailResponse {
  message: string;
  status_code: number;
  data: {
    order: IOrderAndDeliveryDetail;
  };
}
