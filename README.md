# DỰ ÁN WEBSITE BÁN ĐỒ CÔNG NGHỆ & PC BUILDER (PHONG CÁCH FPT SHOP)

Dự án website thương mại điện tử chuyên đồ công nghệ (Điện thoại, Laptop Gaming, Laptop Văn phòng, PC Đồng bộ, Linh kiện máy tính) với tính năng đột phá **"Xây dựng cấu hình PC" (PC Builder)**, phục vụ báo cáo thực tập tốt nghiệp và làm sản phẩm điểm nhấn trong CV.

---

## 1. Công nghệ sử dụng (Tech Stack)

### Backend (Java Spring Boot)
- **Java:** OpenJDK 21 LTS
- **Framework:** Spring Boot 3.3.4
- **Bảo mật & Auth:** Spring Security 6 + JJWT 0.12.6 (Stateless JWT Authentication)
- **Cơ sở dữ liệu & ORM:** PostgreSQL 18 + Spring Data JPA (Hibernate) + JPA Criteria Specification
- **Tài liệu API:** Springdoc OpenAPI 2.6.0 (Swagger UI tương tác trực tiếp)
- **Tiện ích:** Lombok, Jakarta Validation

### Frontend (React + Vite)
- **Ngôn ngữ & Thư viện:** React 19 + TypeScript
- **Bundler:** Vite 8 (Hot Module Replacement siêu tốc)
- **Styling:** Tailwind CSS v4 + Lucide React Icons
- **Quản lý trạng thái:** Zustand (Auth Store, Cart Store, PC Builder Store với LocalStorage persistence)
- **HTTP Client:** Axios với Request/Response Interceptors

---

## 2. Các Tính Năng Nổi Bật

### A. Dành cho Khách hàng (Storefront)
1. **Trang chủ (Home):**
   - Banner khuyến mãi công nghệ, giới thiệu siêu phẩm Laptop ROG, iPhone 16 Pro Max.
   - Danh mục nhanh (Điện thoại, Laptop, PC, Linh kiện...).
   - Danh sách "Sản phẩm nổi bật" và "Bán chạy nhất" kèm badge giảm giá, cấu hình tóm tắt.
2. **Tìm kiếm thông minh (Live Autocomplete Search):**
   - Tìm kiếm gợi ý tức thì trên thanh điều hướng (Navbar) với độ trễ debounce tối ưu 250ms.
   - Hiển thị pop-up dropdown xem nhanh ảnh đại diện, giá bán ưu đãi, hãng sản xuất và điều hướng trực tiếp chỉ với 1 click.
3. **Cửa hàng & Bộ lọc nâng cao (Shop):**
   - Lọc theo danh mục.
   - Lọc theo hãng sản xuất (Apple, ASUS, MSI, Lenovo, Intel, AMD, Corsair, Samsung...).
   - Tìm kiếm từ khóa theo tên và mô tả sản phẩm.
   - Sắp xếp linh hoạt: Mới nhất, Giá tăng dần, Giá giảm dần, Đánh giá sao.
4. **Chi tiết sản phẩm & Đánh giá (Product Details & Reviews):**
   - Bảng **Thông số kỹ thuật chi tiết** chuẩn FPT Shop (CPU, RAM, Ổ cứng, VGA, Màn hình, Dung lượng Pin, Thời gian bảo hành).
   - Form gửi và hiển thị nhận xét, đánh giá sản phẩm thực tế.
5. **Công cụ "Xây Dựng Cấu Hình PC" (PC Builder Engine) ⚡:**
   - Chọn linh kiện theo từng slot: CPU, Mainboard, RAM, VGA, SSD, Nguồn (PSU), Vỏ Case, Tản nhiệt.
   - **Thuật toán kiểm tra tương thích Socket:** Tự động phát hiện và cảnh báo nếu người dùng chọn CPU Intel với Mainboard AMD (hoặc ngược lại).
   - **Bộ tính toán công suất tiêu thụ (Wattage Calculator):** Ước tính công suất TDP hệ thống và tự động đề xuất nguồn (PSU) phù hợp kèm cảnh báo nếu nguồn thiếu hụt công suất.
   - **Xuất Phiếu Báo Giá Chuẩn Doanh Nghiệp (Printable Quotation):** Tạo hóa đơn dự toán cấu hình chuẩn thương hiệu FPT Shop kèm mã báo giá, thông tin bảo hành, thuế VAT và hỗ trợ in/xuất PDF trực tiếp (`@media print`).
   - **Thêm toàn bộ cấu hình vào giỏ hàng chỉ với 1 click!**
6. **Giỏ hàng & Cổng thanh toán (Cart, Checkout & VNPay Simulator):**
   - Quản lý số lượng, xóa món, tính tổng tiền.
   - Đặt hàng hỗ trợ cả **khách vãng lai** và **thành viên đã đăng nhập**.
   - Phương thức thanh toán: COD (Thanh toán khi nhận hàng) hoặc **VNPay-QR Gateway mô phỏng** với đồng hồ đếm ngược 15 phút và xác nhận thanh toán trực tiếp.
   - Theo dõi chi tiết lịch sử đơn hàng tại trang **Đơn hàng của tôi (`/my-orders`)**.

### B. Dành cho Quản trị viên (Admin Dashboard)
1. **Thống kê tổng quan:** Doanh thu thực tế, Tổng đơn hàng, Số đơn chờ xử lý, Tổng sản phẩm, Tổng khách hàng.
2. **Quản lý đơn hàng:** Xem danh sách, xem chi tiết giỏ hàng và địa chỉ giao hàng của khách, quy trình duyệt đơn (`PENDING` ➔ `CONFIRMED` ➔ `SHIPPING` ➔ `COMPLETED` / `CANCELLED`).
3. **Quản lý sản phẩm (Product Management):** 
   - Thêm sản phẩm mới kèm đầy đủ thông số kỹ thuật.
   - **Chỉnh sửa sản phẩm (Edit Product):** Cập nhật giá bán, số lượng tồn kho, slot PC Builder, hình ảnh và thông số.
   - Xóa sản phẩm khỏi hệ thống.
4. **Quản lý danh mục ngành hàng (Category Management):**
   - Thêm mới danh mục với slug tự động.
   - Chỉnh sửa tên, icon đại diện, mô tả danh mục.
   - Xóa danh mục và đếm số lượng sản phẩm liên kết theo thời gian thực.

---

## 3. Tài Khoản Thử Nghiệm Có Sẵn (Demo Accounts)

Hệ thống đã tự động nạp sẵn dữ liệu mẫu khi khởi động:

| Loại tài khoản | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@fptshop.com` | `admin123` | Toàn quyền xem Dashboard, duyệt đơn, thêm/xóa sản phẩm |
| **Khách hàng (Customer)** | `customer@gmail.com` | `123456` | Mua hàng, xem lịch sử đơn hàng cá nhân |

*(Hoặc ông có thể đăng ký tài khoản mới trực tiếp trên giao diện)*

---

## 4. Hướng Dẫn Khởi Chạy Dự Án

### Khởi chạy Backend (Java Spring Boot)
```bash
cd backend
export JAVA_HOME=/home/tung/.jdks/jdk-21.0.12.1+1
./mvnw spring-boot:run
```
- API Backend sẽ chạy tại: `http://localhost:8080`
- Giao diện tài liệu Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### Khởi chạy Frontend (React Vite)
```bash
cd frontend
npm run dev
```
- Giao diện Web Client sẽ chạy tại: `http://localhost:5173`
