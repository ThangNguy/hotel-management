# HotelManagement

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Hotel Management - Frontend

## Cấu trúc dự án

Dự án frontend được tổ chức theo mô hình module với kiến trúc sau:

### Core

Thư mục `core` chứa các services và interceptors cốt lõi của ứng dụng:

- **Services**: Các dịch vụ cốt lõi được sử dụng xuyên suốt ứng dụng
  - `ApiConfigService`: Quản lý cấu hình API endpoints
  - `AuthService`: Xử lý xác thực người dùng
  - `ErrorHandlingService`: Xử lý lỗi toàn cục
  - `HotelService`: Quản lý dữ liệu phòng và đặt phòng
  - `LoadingService`: Quản lý trạng thái loading
  - `RequestService`: Trung gian xử lý các HTTP requests

- **Interceptors**: Các interceptors làm việc với HttpClient
  - `AuthInterceptor`: Thêm token xác thực vào requests
  - `LoadingInterceptor`: Hiển thị loading indicator khi có request

### Shared

Thư mục `shared` chứa các components, directives và pipes dùng chung:

- **Components**: Các components có thể tái sử dụng
- **Directives**: Custom directives
- **Pipes**: Custom pipes

### Features

Thư mục `features` chứa các module chức năng riêng biệt:

- **Public**: Module cho người dùng cuối
  - Home page
  - Room listing
  - Booking form
  - Contact page

- **Admin**: Module quản trị
  - Dashboard
  - Room management
  - Booking management
  - User management

- **Not-Found**: Module xử lý route không tồn tại

### Models

Thư mục `models` chứa các interfaces định nghĩa dữ liệu:

- `Room`: Thông tin phòng
- `Booking`: Thông tin đặt phòng
- `Amenity`: Tiện ích khách sạn

## Lazy Loading

Ứng dụng sử dụng lazy loading để tải các module, cải thiện hiệu suất:
- Chỉ tải module khi cần thiết
- Giảm kích thước bundle ban đầu
- Cải thiện thời gian tải trang

## Nguyên tắc thiết kế

- **Modular**: Tổ chức code theo module chức năng
- **Encapsulation**: Mỗi module đóng gói tính năng riêng
- **SOLID**: Tuân thủ nguyên tắc SOLID
- **DRY**: Tránh lặp lại code
- **Single Responsibility**: Mỗi component/service có một trách nhiệm duy nhất
