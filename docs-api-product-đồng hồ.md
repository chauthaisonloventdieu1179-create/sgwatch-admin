hoàn thành và chỉnh sửa để đúng chuẩn api sau.
1. màn hình danh sách product đồng hồ.
GET /admin/shop/products?keyword=Casio G-Shock GA-2100-1A1&sort_by=price_asc&per_page=1&page=7&gender=male
trong code hình như dùng litmit đổi thành per_page nha
có ổ search : keyword , 1 select để search hàng đồng hồ  brand_id , 1 cái movement_type: quartz, automatic, manual, solar, kinetic 
response:
{
    "message": "Products retrieved successfully.",
    "status_code": 200,
    "data": {
        "products": [
            {
                "id": 2,
                "name": "Orient Star Mechanical Moon Phase RK-AY0102S",
                "slug": "orient-star-rk-ay0102s",
                "sku": "RK-AY0102S",
                "short_description": "Orient Star men automatic watch with moon phase complication",
                "description": "Orient Star Mechanical Moon Phase RK-AY0102S is a premium automatic watch with moon phase display, elegant design suitable for businessmen.",
                "product_info": "Authentic watch, 100% new\nPackage includes: box, manual, warranty card\nGold warranty 5 years at Hoang Hai Watch\nShipping to Vietnam supported",
                "deal_info": null,
                "price_jpy": "89800",
                "price_vnd": "1262000",
                "original_price_jpy": "110000",
                "original_price_vnd": "1546000",
                "points": 148,
                "gender": "male",
                "movement_type": "automatic",
                "condition": "new",
                "attributes": {
                    "case_size": 41,
                    "dial_color": "White",
                    "band_material": "Leather",
                    "case_material": "Stainless Steel",
                    "power_reserve": "50 hours",
                    "glass_material": "Sapphire",
                    "water_resistance": "5ATM"
                },
                "stock_quantity": 5,
                "warranty_months": 60,
                "is_active": true,
                "is_featured": true,
                "sort_order": 1,
                "brand": {
                    "id": 2,
                    "name": "Orient Star",
                    "slug": "orient-star"
                },
                "category": {
                    "id": 3,
                    "name": "Men Automatic Watches",
                    "slug": "men-automatic-watches"
                },
                "images": [
                    {
                        "id": 4,
                        "image_url": "/storage/shop/products/rk-ay0102s-1.jpg",
                        "alt_text": null,
                        "is_primary": true,
                        "sort_order": 0
                    },
                    {
                        "id": 5,
                        "image_url": "/storage/shop/products/rk-ay0102s-2.jpg",
                        "alt_text": null,
                        "is_primary": false,
                        "sort_order": 1
                    }
                ],
                "created_at": "2026-02-21T00:53:58+09:00",
                "updated_at": "2026-02-21T00:53:58+09:00"
            }
        ],
        "pagination": {
            "current_page": 7,
            "last_page": 7,
            "per_page": 1,
            "total": 7
        }
    }
}
chỉ cần hiển thị stt , sku,name,price_jpy 2 button sửa và xóa
2. api create post /admin/shop/products
form-data
name: bắt buộc
sku: bắt buộc
category_id: mặc định là 1 :đồng hồ
brand_id: select các hàng đồng hồ 
  danh sách đây từ 1 tới 11 nha
  - Orient, 
- Orient star 
- Seiko: 
- Citizen
- Carnival
- Longines
- Omega
- Tissot
- Dong ho nu 
- cap doi 
- Dong ho oder
short_description : 
description:
price_jpy:
original_price_jpy:
points:
gender:
movement_type: quartz, automatic, manual, solar, kinetic
stock_quantity:
images[] : có thể nhiều hình nha

response:
{
    "message": "Product created successfully.",
    "status_code": 201,
    "data": {
        "product": {
            "id": 18,
            "name": "test1333",
            "slug": "test1333-9X3FMI",
            "sku": "1232221",
            "short_description": "Đồng hồ Seiko Presage mặt xanh",
            "description": "Đồng hồ nam Seiko Presage SRPD37J1 với thiết kế mặt số xanh...",
            "product_info": null,
            "deal_info": null,
            "price_jpy": "1000",
            "price_vnd": "175000",
            "original_price_jpy": "1500",
            "original_price_vnd": "262500",
            "points": "100",
            "gender": "male",
            "movement_type": "automatic",
            "condition": null,
            "attributes": null,
            "stock_quantity": "10",
            "warranty_months": null,
            "is_active": null,
            "is_featured": null,
            "sort_order": null,
            "brand": {
                "id": 1,
                "name": "Mathey-Tissot",
                "slug": "mathey-tissot"
            },
            "category": null,
            "images": [],
            "created_at": "2026-02-27T11:25:00+09:00",
            "updated_at": "2026-02-27T11:25:00+09:00"
        }
    }
}

3. api get detail : /admin/shop/products/17
response:
{
    "message": "Product retrieved successfully.",
    "status_code": 200,
    "data": {
        "product": {
            "id": 17,
            "name": "1234",
            "slug": "test-uQ9RbI",
            "sku": "123",
            "short_description": "Đồng hồ Seiko Presage mặt xanh",
            "description": "Đồng hồ nam Seiko Presage SRPD37J1 với thiết kế mặt số xanh...",
            "product_info": null,
            "deal_info": null,
            "price_jpy": "1000",
            "price_vnd": "0",
            "original_price_jpy": "1500",
            "original_price_vnd": null,
            "points": 100,
            "gender": "male",
            "movement_type": "automatic",
            "condition": "new",
            "attributes": null,
            "stock_quantity": 10,
            "warranty_months": 0,
            "is_active": true,
            "is_featured": false,
            "sort_order": 0,
            "brand": {
                "id": 1,
                "name": "Mathey-Tissot",
                "slug": "mathey-tissot"
            },
            "category": null,
            "images": [
                {
                    "id": 24,
                    "image_url": "products/17/8JExtLsDb0Hu2Iy7zm9EMYvoqLZ4SvVRMJPhv5iZ.webp",
                    "alt_text": null,
                    "is_primary": true,
                    "sort_order": 0
                },
                {
                    "id": 27,
                    "image_url": "products/17/RwYcF83LBksq1cKIG2e574TgzRfZsetfPSfM3xmW.webp",
                    "alt_text": null,
                    "is_primary": false,
                    "sort_order": 1
                }
            ],
            "created_at": "2026-02-23T11:06:26+09:00",
            "updated_at": "2026-02-23T11:13:49+09:00"
        }
    }
}

api update: POST :/admin/shop/products/17
form-data như create nha
response
{
    "message": "Product updated successfully.",
    "status_code": 200,
    "data": {
        "product": {
            "id": 17,
            "name": "1234",
            "slug": "test-uQ9RbI",
            "sku": "123",
            "short_description": "Đồng hồ Seiko Presage mặt xanh",
            "description": "Đồng hồ nam Seiko Presage SRPD37J1 với thiết kế mặt số xanh...",
            "product_info": null,
            "deal_info": null,
            "price_jpy": "1000",
            "price_vnd": "0",
            "original_price_jpy": "1500",
            "original_price_vnd": null,
            "points": 100,
            "gender": "male",
            "movement_type": "automatic",
            "condition": "new",
            "attributes": null,
            "stock_quantity": 10,
            "warranty_months": 0,
            "is_active": true,
            "is_featured": false,
            "sort_order": 0,
            "brand": {
                "id": 1,
                "name": "Mathey-Tissot",
                "slug": "mathey-tissot"
            },
            "category": null,
            "images": [
                {
                    "id": 24,
                    "image_url": "products/17/8JExtLsDb0Hu2Iy7zm9EMYvoqLZ4SvVRMJPhv5iZ.webp",
                    "alt_text": null,
                    "is_primary": true,
                    "sort_order": 0
                },
                {
                    "id": 27,
                    "image_url": "products/17/RwYcF83LBksq1cKIG2e574TgzRfZsetfPSfM3xmW.webp",
                    "alt_text": null,
                    "is_primary": false,
                    "sort_order": 1
                }
            ],
            "created_at": "2026-02-23T11:06:26+09:00",
            "updated_at": "2026-02-23T11:13:49+09:00"
        }
    }
}

api xóa : delete /admin/shop/products/16
response: {
    "message": "Product deleted successfully.",
    "status_code": 200,
    "data": null
}