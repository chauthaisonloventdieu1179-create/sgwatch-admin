1. api get danh sách user
/admin/users?keyword=Nguyen&gender=male&per_page=20&page=1
có ô search và select chọn nam or nữ or khác
có phân trang mỗi trang 20 
response
{
    "message": "Users retrieved successfully.",
    "status_code": 200,
    "data": {
        "users": [
            {
                "id": 4,
                "uuid": "a36500ff-bc31-435f-8ce9-a89c64fb7155",
                "email": "example@gmail.com",
                "first_name": "Nguyen",
                "last_name": "Van A",
                "full_name": "Nguyen Van A",
                "gender": "unknown",
                "avatar_url": null,
                "is_system_admin": false,
                "roles": [
                    {
                        "id": 1,
                        "name": "user",
                        "display_name": "ユーザー"
                    }
                ],
                "created_at": "2026-02-26T00:16:59+09:00"
            },
            {
                "id": 2,
                "uuid": "5a54284e-d7ac-4c44-8dfa-f139c0745dd8",
                "email": "account+general1@gameagelayer.com",
                "first_name": "Test",
                "last_name": "User1",
                "full_name": "Test User1",
                "gender": "unknown",
                "avatar_url": null,
                "is_system_admin": false,
                "roles": [
                    {
                        "id": 1,
                        "name": "user",
                        "display_name": "ユーザー"
                    }
                ],
                "created_at": "2026-02-25T19:50:19+09:00"
            },
            {
                "id": 3,
                "uuid": "2cf95262-3840-4fff-8ab6-a699b9de3696",
                "email": "account+general2@gameagelayer.com",
                "first_name": "Test",
                "last_name": "User2",
                "full_name": "Test User2",
                "gender": "unknown",
                "avatar_url": null,
                "is_system_admin": false,
                "roles": [
                    {
                        "id": 1,
                        "name": "user",
                        "display_name": "ユーザー"
                    }
                ],
                "created_at": "2026-02-25T19:50:19+09:00"
            },
            {
                "id": 1,
                "uuid": "9ccd872e-4731-4ab2-8704-3b67e8bb57e8",
                "email": "account+init@gameagelayer.com",
                "first_name": "System",
                "last_name": "Admin",
                "full_name": "System Admin",
                "gender": "unknown",
                "avatar_url": null,
                "is_system_admin": true,
                "roles": [],
                "created_at": "2026-02-21T00:54:02+09:00"
            }
        ],
        "pagination": {
            "current_page": 1,
            "last_page": 1,
            "per_page": 10,
            "total": 4
        }
    }
}

api: remove delete /admin/users/6
Response:
{
    "message": "User deleted successfully.",
    "status_code": 200,
    "data": null
}

màn hình profile get /user-info
response:
{
    "message": "Success",
    "status_code": 200,
    "data": {
        "user": {
            "id": "1",
            "first_name": "System",
            "last_name": "Admin",
            "gender": "unknown",
            "birthday": null,
            "role": "admin",
            "email": "account+init@gameagelayer.com"
        }
    }
}
có thể chỉnh các thông tin trên update
POST /update-profile
form-data
first_name,last_name
gender,
birthday,avatar


3.api : get list banner : /admin/banners
hiển thị hình ảnh ra luôn nha , có button xóa, sửa
response
create : post /admin/banners
form-data : image
response:
{
    "message": "Banner created successfully.",
    "status_code": 201,
    "data": {
        "banner": {
            "id": 2,
            "image_url": "http://localhost/storage/banners/Z2nBezFVdqbRND0MUhMYSYbevhMHuJrba50v8c1Q.png",
            "sort_order": null,
            "is_active": null,
            "created_at": "2026-02-27T12:48:22+09:00",
            "updated_at": "2026-02-27T12:48:22+09:00"
        }
    }
}
update post: /admin/banners/4

form-data : image
response:
{
    "message": "Banner updated successfully.",
    "status_code": 200,
    "data": {
        "banner": {
            "id": 4,
            "image_url": "http://localhost/storage/banners/4/Q2MWLBIdZXj8hibze7VRhduCkB2xSIB155EaDRut.png",
            "sort_order": 0,
            "is_active": true,
            "created_at": "2026-02-27T12:49:36+09:00",
            "updated_at": "2026-02-27T12:50:51+09:00"
        }
    }
}
delete: /admin/banners/1
response:
{
    "message": "Banner deleted successfully.",
    "status_code": 200,
    "data": null
}
4. api : get discount : /admin/discount-codes
response:
{
    "message": "Discount codes retrieved successfully.",
    "status_code": 200,
    "data": {
        "discount_codes": [
            {
                "id": 3,
                "code": "1223-112221",
                "quantity": 50,
                "percentage": 10,
                "is_active": true,
                "created_at": "2026-02-27T12:55:25+09:00",
                "updated_at": "2026-02-27T12:55:25+09:00"
            },
            {
                "id": 2,
                "code": "1223-111",
                "quantity": 10,
                "percentage": 10,
                "is_active": true,
                "created_at": "2026-02-27T12:55:17+09:00",
                "updated_at": "2026-02-27T12:55:17+09:00"
            },
            {
                "id": 1,
                "code": "123-111",
                "quantity": 10,
                "percentage": 10,
                "is_active": true,
                "created_at": "2026-02-27T12:55:11+09:00",
                "updated_at": "2026-02-27T12:55:11+09:00"
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

tạo mới: post : /admin/discount-codes
body:
{
    "code": "1223-112221",
    "quantity": 50,
    "percentage": "10"
}
response:
{
    "message": "Discount code created successfully.",
    "status_code": 201,
    "data": {
        "discount_code": {
            "id": 3,
            "code": "1223-112221",
            "quantity": 50,
            "percentage": 10,
            "is_active": null,
            "created_at": "2026-02-27T12:55:25+09:00",
            "updated_at": "2026-02-27T12:55:25+09:00"
        }
    }
}
update chỉ update được quantity thôi : post :/admin/discount-codes/1
{
    "quantity": 15
}
response :
{
    "message": "Discount code updated successfully.",
    "status_code": 200,
    "data": {
        "discount_code": {
            "id": 1,
            "code": "123-111",
            "quantity": 15,
            "percentage": 10,
            "is_active": true,
            "created_at": "2026-02-27T12:55:11+09:00",
            "updated_at": "2026-02-27T12:58:01+09:00"
        }
    }
} 
remove: delete :/admin/discount-codes/3
response:
{
    "message": "Discount code deleted successfully.",
    "status_code": 200,
    "data": null
}
