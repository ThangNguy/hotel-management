# Handoff: Central Hotel — Redesign giao diện (Nocturne)

## Tổng quan
Đây là bộ thiết kế **nâng cấp giao diện** (UI/UX) cho ứng dụng đặt phòng **Central Hotel and Residences Phu My Hung**.
Mục tiêu: biến giao diện hiện tại thành trải nghiệm khách sạn cao cấp theo hướng thẩm mỹ **"Nocturne"** — boutique tối sang: nền than ấm, accent đồng thau (brass), typography serif thanh lịch.

**QUAN TRỌNG — không đổi logic:** Chỉ thay lớp giao diện (UI, layout, màu, typography, spacing, animation). Giữ nguyên: business logic, API calls, routing, data models, state management, cấu trúc Angular module. Các trường form, cột bảng, trạng thái booking đều được giữ khớp 1:1 với code hiện tại.

## Về các file thiết kế
Các file `.dc.html` trong gói này là **bản tham chiếu thiết kế viết bằng HTML** — prototype thể hiện diện mạo và hành vi mong muốn, KHÔNG phải code production để copy trực tiếp.
Nhiệm vụ: **tái hiện các thiết kế này trong codebase Angular hiện có** (`client/`), dùng đúng các component, Angular Material, SCSS và pattern sẵn có của dự án. Chỉ chỉnh template HTML + SCSS của từng component; không đụng vào file `.ts` (trừ dữ liệu tĩnh về nội dung như tên khách sạn/địa chỉ nếu cần).

## Độ hoàn thiện (Fidelity)
**High-fidelity (hifi)** — màu, typography, spacing, tương tác đã chốt. Hãy tái hiện chính xác theo các giá trị token bên dưới.

## Bản đồ file thiết kế → component Angular
- `Nocturne Home.dc.html` → `features/public/components/hero` + `rooms` + `amenities` + `contact` + `header` + `footer`
- `Nocturne Room Detail.dc.html` → `features/public/components/room-detail-modal` (nâng thành trang/hoặc modal đầy đủ)
- `Nocturne Admin.dc.html` → `features/admin/components/admin-layout` + `admin-dashboard`

---

## Design Tokens (Nocturne)

### Màu sắc
| Vai trò | Hex |
|---|---|
| Nền chính (dark) | `#16130f` |
| Nền phụ / section | `#1a1611` |
| Nền card / panel | `#1f1b15` |
| Nền footer / sidebar | `#100d0a` |
| Chữ chính | `#ece5d8` |
| Chữ phụ (mờ) | `rgba(236,229,216,0.6)` / `0.5` / `0.4` |
| Accent đồng thau (brass) | `#b08d4f` |
| Brass hover | `#c9a86a` |
| Chữ trên nền brass | `#16130f` |
| Viền hairline | `rgba(236,229,216,0.08)` → `0.1` |
| Viền brass | `rgba(176,141,79,0.35)` → `0.4` |

### Màu trạng thái booking (dùng cho status chip, kiểu viền)
| Status | Màu chữ | Màu viền |
|---|---|---|
| Pending | `#e5a53d` | `rgba(245,158,11,0.4)` |
| Confirmed | `#34c294` | `rgba(16,185,129,0.4)` |
| Checked In | `#7fb2f2` | `rgba(96,165,250,0.4)` |
| Checked Out | `rgba(236,229,216,0.6)` | `rgba(236,229,216,0.25)` |
| Cancelled | `#e5766c` | `rgba(239,68,68,0.4)` |

### Typography
- **Serif (heading, brand, giá):** `'Marcellus', serif` — weight 400. Dùng cho h1/h2/h3, logo, tên phòng, giá.
- **Sans (body, nav, label, button):** `'Archivo', sans-serif` — weight 300 (body), 400/500 (nav), 600/700 (button, label).
- Google Fonts: `Marcellus`, `Archivo:wght@300;400;500;600;700`.
- Icon: Material Icons. **Lưu ý:** icon nằm trong phần tử `text-transform: uppercase` phải thêm `text-transform: none` để ligature hiển thị đúng (nếu không sẽ ra chữ "ARROW_FORWARD").

Thang cỡ chữ (px):
- Hero h1: 66 · Section h2: 44 · Room detail h1: 52
- Card title: 22 · Sub-heading: 26–28
- Body: 15–17 (weight 300, line-height 1.75–1.85)
- Label/eyebrow: 10–12, letter-spacing 2.5–5px, uppercase
- Nav: 12, letter-spacing 3px, uppercase

### Spacing
Hệ 8px. Section padding dọc 104–120px; padding ngang container 56px; `max-width` container 1400px.

### Khác
- Bo góc: hầu như **vuông** (0px) hoặc rất nhỏ — phong cách boutique. Không dùng border-radius lớn.
- Đường "eyebrow": đoạn kẻ ngang `width:40px; height:1px; background:#b08d4f` cạnh nhãn uppercase brass.
- Transition: `0.3s` cho màu/hover; `0.35s cubic-bezier(0.4,0,0.2,1)` cho transform card; `0.6s cubic-bezier(0.4,0,0.2,1)` cho zoom ảnh (scale 1.05).
- Hover card: `translateY(-6px)` + đổi viền sang `rgba(176,141,79,0.5)`.

---

## Screens / Views

### 1. Home (`Nocturne Home.dc.html`)
**Header** (fixed, cao 92px, nền gradient `rgba(22,19,15,0.85)→transparent`): logo "CENTRAL HOTEL" (Marcellus, letter-spacing 4px, uppercase) trái; nav Rooms/Amenities/Contact (Archivo 12px uppercase, hover gạch chân brass) + nút "Book Now" nền brass phải.

**Hero** (full-screen, min-height 760px): ảnh nền phòng đêm (opacity 0.85) + overlay gradient lên `#16130f`. Nội dung căn đáy: eyebrow "Central Hotel and Residences Phu My Hung", h1 "Stay where the night feels tailored", đoạn mô tả (nhắc Phu My Hung, Quận 7). Bên phải: **search card** kính tối (`rgba(22,19,15,0.88)`, blur 14px, viền brass) — 4 trường Check-in / Check-out / Adults / Children (khớp form đặt phòng hiện tại) + nút "Check Availability".

**Rooms** (`#rooms`): tiêu đề "Suites & Rooms" + mô tả. Lưới 3 cột, card nền `#1f1b15` viền hairline: ảnh 16:10 (hover scale 1.05), badge availability (góc trái, viền brass) + rating sao (góc phải), tên phòng (Marcellus 22), meta (guests · bed · m²), mô tả 2 dòng, chân card: giá brass + "Details →". Giá format USD (`Intl.NumberFormat`, không phần thập phân) — giữ nguyên `formatPrice()` hiện có.

**Amenities** (`#amenities`, nền `#1a1611`): tiêu đề canh giữa. Lưới 4 cột kiểu ô hairline (gap 1px trên nền viền), mỗi ô: icon brass 30px, tên (Marcellus 17), mô tả ngắn. 8 tiện nghi khớp `amenities.component.ts`.

**Contact** (`#contact`): 2 cột (5fr/7fr). Trái: eyebrow + h2 "Get in Touch" + danh sách 4 mục (địa chỉ/điện thoại/email/giờ làm việc) — **dùng data thật:** `Hưng Phước 4/34, Khu phố Hưng Phước 1, Tân Hưng, Quận 7, TP. Hồ Chí Minh` · `0964 254 450`. Phải: form (Full Name / Email / Phone / Message) kiểu underline + nút "Send Message". Khớp `contact.component` form.

**Footer** (nền `#100d0a`): 4 cột (brand + Explore/Services/Support) + hàng dưới copyright "Central Hotel and Residences Phu My Hung" + Sitemap/Admin Login. Khớp `footer.component`.

### 2. Room Detail (`Nocturne Room Detail.dc.html`)
Header dạng sticky đặc (nền `rgba(22,19,15,0.92)` blur). Breadcrumb Home / Suites & Rooms / [tên phòng]. Hàng tiêu đề: tên phòng (Marcellus 52) + meta (rating, guests, bed, m²) + badge Available. **Gallery** grid 3 cột (ảnh lớn chiếm 2 hàng bên trái + 4 ảnh nhỏ, ảnh cuối có overlay "All photos"). Thân 2 cột (7fr/5fr): trái = mô tả + lưới tiện nghi phòng (2 cột) + bảng "Good to Know" (Check-in/out, Cancellation, Smoking); phải = **booking card sticky** viền brass: giá, các trường (Check-in/out, Guests, Full Name, Email, Phone) khớp form booking của `room-detail-modal`, tóm tắt giá (đêm × giá, thuế, tổng), nút "Book Now", dòng chính sách hủy.

### 3. Admin Dashboard (`Nocturne Admin.dc.html`)
Layout 2 phần. **Sidebar** 260px nền `#100d0a`: brand "CENTRAL HOTEL / Admin"; 5 mục nav khớp `admin-layout.component` (Dashboard active nền brass, Bookings, Booking Calendar, Booking Grid, Room Management) + Logout dưới cùng. **Main:** top bar (Hello, Admin + avatar) + tiêu đề trang + nút "New Booking". **4 KPI card** (nền `#1f1b15` viền hairline, giá trị Marcellus): Occupancy Rate, Monthly Revenue, Total Bookings, Manage Facilities — khớp `admin-dashboard.component`. **Bảng Recent Bookings**: header nền mờ; cột ID / Guest Name / Room / Check In / Check Out / Status / Total Price; status chip kiểu viền theo bảng màu trạng thái ở trên; giá brass. Hover row nền sáng nhẹ.

---

## Interactions & Behavior
- Hover nav: gạch chân brass (`border-bottom 1px #b08d4f`).
- Hover card phòng/KPI: nâng `translateY(-6px)` + đổi viền brass; ảnh zoom `scale(1.05)` (0.6s).
- Hover button brass: nền `#b08d4f → #c9a86a`.
- Hover row bảng: nền `rgba(236,229,216,0.03)`.
- `scroll-behavior: smooth` cho anchor nav.
- Các trạng thái loading/skeleton/empty/error đã có trong code hiện tại — giữ nguyên, chỉ áp lại màu Nocturne (skeleton nền `#1f1b15`, shimmer sáng nhẹ).

## State Management
Không thay đổi. Toàn bộ signals/services (hotel.service, booking-status.service, loading.service…) và luồng dữ liệu giữ nguyên. Thiết kế chỉ đổi template + SCSS.

## Assets
- Ảnh phòng/hero trong prototype là ảnh mẫu Unsplash — thay bằng ảnh thật từ API/`room.images` khi triển khai.
- Ảnh hero có thể dùng ảnh khách sạn thật (ngoại thất/hồ bơi).
- Icon: Material Icons (đã có trong dự án).
- Fonts: đổi `Playfair Display + Be Vietnam Pro` (hiện tại) sang `Marcellus + Archivo` trong `index.html` và token typography, nếu chấp nhận hướng Nocturne. (Có thể giữ Playfair nếu muốn — nhưng Marcellus cho cảm giác boutique hơn.)

## Files (trong gói này)
- `Nocturne Home.dc.html`
- `Nocturne Room Detail.dc.html`
- `Nocturne Admin.dc.html`

Mỗi file mở trực tiếp được trên trình duyệt để xem tham chiếu.
