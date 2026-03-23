1. api get : admin/shop/orders?per_page=20&page =1
phân trang có ô search để serach search name, mã đơn hàng, mã sản phẩm
response:
{
    "message": "Orders retrieved successfully.",
    "status_code": 200,
    "data": {
        "orders": [
            {
                "id": 3,
                "order_number": "SO-20260225-0001",
                "status": "pending",
                "payment_status": "pending",
                "payment_method": "stripe",
                "payment_receipt": null,
                "shipping_method": "standard",
                "total_amount": "106100",
                "currency": "JPY",
                "total_items": 2,
                "user": {
                    "id": 1,
                    "first_name": "System",
                    "last_name": "Admin",
                    "full_name": "System Admin",
                    "email": "account+init@gameagelayer.com"
                },
                "created_at": "2026-02-25T18:29:00+09:00"
            },
            {
                "id": 2,
                "order_number": "SO-20260221-0002",
                "status": "delivered",
                "payment_status": "pending",
                "payment_method": "cod",
                "payment_receipt": null,
                "shipping_method": "standard",
                "total_amount": "501200",
                "currency": "JPY",
                "total_items": 3,
                "user": {
                    "id": 1,
                    "first_name": "System",
                    "last_name": "Admin",
                    "full_name": "System Admin",
                    "email": "account+init@gameagelayer.com"
                },
                "created_at": "2026-02-21T14:24:15+09:00"
            },
            {
                "id": 1,
                "order_number": "SO-20260221-0001",
                "status": "cancelled",
                "payment_status": "pending",
                "payment_method": "cod",
                "payment_receipt": null,
                "shipping_method": "standard",
                "total_amount": "334300",
                "currency": "JPY",
                "total_items": 2,
                "user": {
                    "id": 1,
                    "first_name": "System",
                    "last_name": "Admin",
                    "full_name": "System Admin",
                    "email": "account+init@gameagelayer.com"
                },
                "created_at": "2026-02-21T13:33:03+09:00"
            }
        ],
        "pagination": {
            "current_page": 1,
            "last_page": 1,
            "per_page": 15,
            "total": 3
        }
    }
}

api getdetail. /admin/shop/orders/3
response:
{
    "message": "Order retrieved successfully.",
    "status_code": 200,
    "data": {
        "order": {
            "id": 1,
            "order_number": "SO-20260221-0001",
            "status": "cancelled",
            "payment_status": "pending",
            "payment_method": "cod",
            "payment_receipt": null,
            "shipping_method": "standard",
            "subtotal": "333800",
            "shipping_fee": "500",
            "cod_fee": "0",
            "deposit_amount": "0",
            "discount_amount": "0",
            "points_used": 0,
            "total_amount": "334300",
            "currency": "JPY",
            "shipping_name": "System Admin",
            "shipping_phone": "0901234567",
            "shipping_address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
            "shipping_city": "TP Hồ Chí Minh",
            "shipping_country": "VN",
            "shipping_postal_code": "700000",
            "note": "Ghi chú",
            "tracking_number": null,
            "shipping_carrier": null,
            "cancel_reason": null,
            "confirmed_at": null,
            "paid_at": null,
            "shipped_at": null,
            "delivered_at": null,
            "cancelled_at": "2026-02-21T13:36:52+09:00",
            "created_at": "2026-02-21T13:33:03+09:00",
            "items": [
                {
                    "id": 1,
                    "product_id": 1,
                    "product_name": "Mathey-Tissot D117ABU Women Quartz - Display Item",
                    "product_sku": "D117ABU",
                    "product_image": "http://localhost/storage/storage/shop/products/d117abu-1.jpg",
                    "quantity": 2,
                    "unit_price": "166900",
                    "total_price": "333800"
                }
            ],
            "admin_note": null,
            "user": {
                "id": 1,
                "uuid": "9ccd872e-4731-4ab2-8704-3b67e8bb57e8",
                "first_name": "System",
                "last_name": "Admin",
                "full_name": "System Admin",
                "email": "account+init@gameagelayer.com"
            }
        }
    }
}
chỉnh sửa trạng thái đơn hàng : put /admin/shop/orders/3/status
body :
{
    "status": "cancelled"
    // "tracking_number": "JP123456789",
    // "shipping_carrier": "Yamato",
    // "cancel_reason": "Out of stock",
    // "admin_note": "Ghi chú admin"
}

// Từ trạng thái	Có thể chuyển sang
// pending	confirmed, cancelled
// confirmed	processing, cancelled
// processing	shipping, cancelled
// shipping	delivered
// delivered	completed, refunded
// completed	refunded
reponse :
{
    "message": "Order status updated successfully.",
    "status_code": 200,
    "data": {
        "order": {
            "id": 3,
            "order_number": "SO-20260225-0001",
            "status": "cancelled",
            "payment_status": "pending",
            "payment_method": "stripe",
            "payment_receipt": null,
            "shipping_method": "standard",
            "subtotal": "105600",
            "shipping_fee": "500",
            "cod_fee": "0",
            "deposit_amount": "0",
            "discount_amount": "0",
            "points_used": 0,
            "total_amount": "106100",
            "currency": "JPY",
            "shipping_name": "System Admin",
            "shipping_phone": "0901234567",
            "shipping_address": "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP Hồ Chí Minh",
            "shipping_city": "TP Hồ Chí Minh",
            "shipping_country": "VN",
            "shipping_postal_code": "700000",
            "note": "Ghi chú",
            "tracking_number": null,
            "shipping_carrier": null,
            "cancel_reason": null,
            "confirmed_at": null,
            "paid_at": null,
            "shipped_at": null,
            "delivered_at": null,
            "cancelled_at": "2026-02-27T13:17:16+09:00",
            "created_at": "2026-02-25T18:29:00+09:00",
            "items": [
                {
                    "id": 3,
                    "product_id": 4,
                    "product_name": "Seiko Presage Cocktail Time SRPB43J1",
                    "product_sku": "SRPB43J1",
                    "product_image": "http://localhost/storage/storage/shop/products/srpb43j1-1.jpg",
                    "quantity": 2,
                    "unit_price": "52800",
                    "total_price": "105600"
                }
            ]
        }
    }
}
 