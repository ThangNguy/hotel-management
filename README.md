# Hotel Management System

## Tổng quan về dự án
Hệ thống quản lý khách sạn cung cấp một nền tảng quản lý hoạt động của khách sạn, bao gồm đặt phòng, quản lý phòng, quản lý khách hàng và các dịch vụ khác.

## Kiến trúc ứng dụng
Dự án được chia thành hai phần chính:
- **Frontend**: Phát triển bằng Angular
- **Backend**: Phát triển bằng ASP.NET Core

### Cấu trúc Frontend
Ứng dụng client được tổ chức theo mô hình module với cấu trúc thư mục sau:
- `/core`: Chứa các services và interceptors cốt lõi
- `/shared`: Chứa các components, directives và pipes dùng chung
- `/features`: Chứa các module chức năng riêng biệt (public, admin, not-found)
- `/models`: Chứa các interfaces và enums
- `/assets`: Chứa hình ảnh, translations, và các tài nguyên khác

### Cấu trúc Backend
Backend được xây dựng theo kiến trúc Clean Architecture:
- `HotelManagement.API`: API endpoints và controllers
- `HotelManagement.Application`: Business logic và use cases
- `HotelManagement.Core`: Entities và business rules
- `HotelManagement.Infrastructure`: Database, external services, and repositories

## Hướng dẫn cài đặt

### Yêu cầu
- Node.js (16.x hoặc cao hơn)
- Angular CLI (16.x hoặc cao hơn)
- .NET 7.0 hoặc cao hơn
- SQL Server (local hoặc remote)

### Cài đặt Frontend
```bash
cd client
npm install
ng serve
```

### Cài đặt Backend
```bash
cd server/src
dotnet restore
dotnet run --project HotelManagement.API
```

## Quy tắc phát triển
Xem chi tiết tại [CODING_STANDARDS.md](./CODING_STANDARDS.md)

## Tính năng chính
- Quản lý đặt phòng
- Quản lý phòng và loại phòng
- Giao diện người dùng cho khách hàng đặt phòng
- Dashboard quản trị
- Báo cáo và thống kê
- Đa ngôn ngữ