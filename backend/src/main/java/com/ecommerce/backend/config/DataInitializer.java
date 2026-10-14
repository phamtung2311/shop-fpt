package com.ecommerce.backend.config;

import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final VoucherRepository voucherRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        User admin = null;
        User customer = null;

        if (userRepository.count() == 0) {
            log.info("==> Seeding initial users...");
            admin = userRepository.save(User.builder()
                    .fullName("Quản Trị Viên (Admin)")
                    .email("admin@fptshop.com")
                    .password(passwordEncoder.encode("admin123"))
                    .phone("0988888888")
                    .address("Hà Nội, Việt Nam")
                    .role(Role.ROLE_ADMIN)
                    .isActive(true)
                    .build());

            customer = userRepository.save(User.builder()
                    .fullName("Nguyễn Văn Tùng")
                    .email("customer@gmail.com")
                    .password(passwordEncoder.encode("123456"))
                    .phone("0912345678")
                    .address("Đống Đa, Hà Nội")
                    .role(Role.ROLE_CUSTOMER)
                    .isActive(true)
                    .build());
        } else {
            admin = userRepository.findByEmail("admin@fptshop.com").orElse(null);
            customer = userRepository.findByEmail("customer@gmail.com").orElse(null);
        }

        // Initialize Categories if not present
        Category phoneCat = categoryRepository.findBySlug("dien-thoai").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Điện thoại").slug("dien-thoai").icon("Smartphone").description("Điện thoại chính hãng iPhone, Samsung, Xiaomi giá tốt nhất").build()));

        Category laptopGamingCat = categoryRepository.findBySlug("laptop-gaming").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Laptop Gaming").slug("laptop-gaming").icon("Laptop").description("Laptop Gaming ASUS ROG, MSI, Acer Predator, Lenovo Legion").build()));

        Category laptopOfficeCat = categoryRepository.findBySlug("laptop-van-phong").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Laptop Văn phòng").slug("laptop-van-phong").icon("Briefcase").description("MacBook, Dell XPS, HP Envy mỏng nhẹ thời trang").build()));

        Category pcCat = categoryRepository.findBySlug("pc-dong-bo").orElseGet(() ->
                categoryRepository.save(Category.builder().name("PC Đồng bộ").slug("pc-dong-bo").icon("Monitor").description("Dàn máy tính đồng bộ, PC Gaming hiệu năng khủng").build()));

        Category componentCat = categoryRepository.findBySlug("linh-kien-pc").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Linh kiện PC").slug("linh-kien-pc").icon("Cpu").description("CPU, Card màn hình VGA, RAM, Mainboard, Nguồn máy tính").build()));

        Category gearCat = categoryRepository.findBySlug("phu-kien-gear").orElseGet(() ->
                categoryRepository.save(Category.builder().name("Phụ kiện & Gear").slug("phu-kien-gear").icon("Headphones").description("Bàn phím cơ, chuột Gaming, tai nghe không dây").build()));

        // Check if we need to seed rich product catalog
        if (productRepository.count() < 30) {
            log.info("==> Seeding rich authentic tech product catalog...");

            List<Product> newProducts = new ArrayList<>();

            // 1. PHONES
            newProducts.add(Product.builder()
                    .name("iPhone 16 Pro Max 256GB")
                    .slug("iphone-16-pro-max-256gb")
                    .brand("Apple")
                    .originalPrice(new BigDecimal("34990000"))
                    .salePrice(new BigDecimal("31490000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80")
                    .images("[\"https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80\", \"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80\", \"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80\"]")
                    .description("Siêu phẩm iPhone 16 Pro Max khung viền Titan cao cấp, trang bị chip A18 Pro tiến trình 3nm, hệ thống camera 48MP zoom quang học 5x sắc nét và nút Camera Control cảm ứng hoàn toàn mới.")
                    .cpu("Apple A18 Pro 6 nhân")
                    .ram("8GB")
                    .storage("256GB NVMe")
                    .vga("Apple GPU 6 nhân")
                    .screen("6.9 inch Super Retina XDR OLED, 120Hz ProMotion")
                    .battery("4685 mAh, sạc nhanh 25W MagSafe")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(true)
                    .category(phoneCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Samsung Galaxy S24 Ultra 5G 12GB/256GB")
                    .slug("samsung-galaxy-s24-ultra-5g")
                    .brand("Samsung")
                    .originalPrice(new BigDecimal("31990000"))
                    .salePrice(new BigDecimal("26990000"))
                    .stockQuantity(30)
                    .thumbnail("https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80")
                    .images("[\"https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80\", \"https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80\"]")
                    .description("Chiến binh flagship quyền năng với hệ thống Galaxy AI đột phá, màn hình phẳng Dynamic AMOLED 2X 6.8 inch 120Hz, camera zoom 100x và bút S-Pen tích hợp.")
                    .cpu("Snapdragon 8 Gen 3 for Galaxy")
                    .ram("12GB")
                    .storage("256GB UFS 4.0")
                    .vga("Adreno 750")
                    .screen("6.8 inch QHD+ Dynamic AMOLED 2X 120Hz")
                    .battery("5000 mAh, sạc nhanh 45W")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(true)
                    .category(phoneCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Xiaomi 14 Ultra 5G 16GB/512GB (Ống Kính Leica)")
                    .slug("xiaomi-14-ultra-5g-leica")
                    .brand("Xiaomi")
                    .originalPrice(new BigDecimal("32990000"))
                    .salePrice(new BigDecimal("28990000"))
                    .stockQuantity(15)
                    .thumbnail("https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80")
                    .description("Đỉnh cao nhiếp ảnh di động với cụm 4 camera Leica Summilux 50MP cảm biến 1 inch, quay video 8K chuyên nghiệp, vi xử lý Snapdragon 8 Gen 3 đỉnh cao.")
                    .cpu("Snapdragon 8 Gen 3")
                    .ram("16GB LPDDR5X")
                    .storage("512GB UFS 4.0")
                    .screen("6.73 inch LTPO AMOLED 120Hz 3000 nits")
                    .battery("5000 mAh, sạc siêu nhanh 90W")
                    .warrantyMonths(18)
                    .componentType(ComponentType.NONE)
                    .featured(false)
                    .bestSeller(false)
                    .category(phoneCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Samsung Galaxy Z Fold6 5G 12GB/256GB")
                    .slug("samsung-galaxy-z-fold6-5g")
                    .brand("Samsung")
                    .originalPrice(new BigDecimal("43990000"))
                    .salePrice(new BigDecimal("39990000"))
                    .stockQuantity(12)
                    .thumbnail("https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80")
                    .description("Siêu phẩm màn hình gập mỏng nhẹ nhất từ trước đến nay, trang bị Galaxy AI thông minh dịch thuật trực tiếp và khung viền Armor Aluminum gia cường bền bỉ.")
                    .cpu("Snapdragon 8 Gen 3 for Galaxy")
                    .ram("12GB")
                    .storage("256GB")
                    .screen("7.6 inch Dynamic AMOLED 2X 120Hz")
                    .battery("4400 mAh")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(false)
                    .category(phoneCat)
                    .build());

            // 2. LAPTOP GAMING
            newProducts.add(Product.builder()
                    .name("Laptop Gaming ASUS ROG Strix SCAR 16 G634JZR i9-14900HX")
                    .slug("asus-rog-strix-scar-16-g634jzr")
                    .brand("ASUS")
                    .originalPrice(new BigDecimal("79990000"))
                    .salePrice(new BigDecimal("72990000"))
                    .stockQuantity(10)
                    .thumbnail("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80")
                    .description("Cỗ máy chiến game tối thượng với màn hình ROG Nebula HDR Mini LED 2.5K 240Hz, vi xử lý i9-14900HX, card đồ họa RTX 4080 12GB TGP 175W và keo tản nhiệt kim loại lỏng Conductonaut Extreme.")
                    .cpu("Intel Core i9-14900HX (24 nhân 32 luồng)")
                    .ram("32GB DDR5 5600MHz")
                    .storage("1TB SSD PCIe 4.0 NVMe")
                    .vga("NVIDIA GeForce RTX 4080 12GB")
                    .screen("16 inch 2.5K Mini LED 240Hz 100% DCI-P3")
                    .battery("90Wh")
                    .warrantyMonths(24)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(true)
                    .category(laptopGamingCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Laptop Lenovo Legion 5 16IRX9 i7-14650HX")
                    .slug("lenovo-legion-5-16irx9-i7")
                    .brand("Lenovo")
                    .originalPrice(new BigDecimal("42990000"))
                    .salePrice(new BigDecimal("37990000"))
                    .stockQuantity(18)
                    .thumbnail("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80")
                    .description("Cỗ máy chiến game quốc dân với tản nhiệt Legion Coldfront 5.0 cực mát, card đồ hoạ RTX 4060 TGP 140W bung hết hiệu năng và màn hình WQXGA 165Hz sắc nét.")
                    .cpu("Intel Core i7-14650HX (16 nhân 24 luồng)")
                    .ram("16GB DDR5 5600MHz")
                    .storage("1TB SSD M.2 2280 PCIe 4.0")
                    .vga("NVIDIA GeForce RTX 4060 8GB")
                    .screen("16 inch WQXGA (2560x1600) IPS 165Hz")
                    .battery("80Wh")
                    .warrantyMonths(24)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(false)
                    .category(laptopGamingCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Laptop Gaming Acer Predator Helios 16 i9-14900HX / RTX 4070")
                    .slug("acer-predator-helios-16-i9-rtx-4070")
                    .brand("Acer")
                    .originalPrice(new BigDecimal("59990000"))
                    .salePrice(new BigDecimal("54990000"))
                    .stockQuantity(12)
                    .thumbnail("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80")
                    .description("Thiết kế hầm hố đậm chất chiến binh Predator, hệ thống tản nhiệt quạt kim loại AeroBlade 3D thế hệ 5 và bàn phím đèn LED RGB từng phím tùy biến.")
                    .cpu("Intel Core i9-14900HX")
                    .ram("32GB DDR5")
                    .storage("1TB SSD PCIe 4.0")
                    .vga("NVIDIA GeForce RTX 4070 8GB")
                    .screen("16 inch WQXGA 240Hz 500 nits")
                    .battery("90Wh")
                    .warrantyMonths(24)
                    .componentType(ComponentType.NONE)
                    .featured(false)
                    .bestSeller(false)
                    .category(laptopGamingCat)
                    .build());

            // 3. LAPTOP VĂN PHÒNG & ULTRABOOK
            newProducts.add(Product.builder()
                    .name("MacBook Pro 14 inch M3 Pro (18GB RAM / 512GB SSD)")
                    .slug("macbook-pro-14-m3-pro-space-black")
                    .brand("Apple")
                    .originalPrice(new BigDecimal("49990000"))
                    .salePrice(new BigDecimal("45990000"))
                    .stockQuantity(20)
                    .thumbnail("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80")
                    .description("Siêu phẩm làm việc đồ họa chuyên nghiệp màu Space Black lịch lãm, vi xử lý Apple M3 Pro 11-core CPU, màn hình Liquid Retina XDR 120Hz và thời lượng pin lên đến 22 giờ liên tục.")
                    .cpu("Apple M3 Pro (11 nhân CPU, 14 nhân GPU)")
                    .ram("18GB Unified Memory")
                    .storage("512GB SSD siêu tốc")
                    .vga("Apple GPU 14 nhân")
                    .screen("14.2 inch Liquid Retina XDR (3024x1964) 120Hz")
                    .battery("70Wh, pin dùng 22 tiếng")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(true)
                    .category(laptopOfficeCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("MacBook Air 13 inch M3 (16GB RAM / 512GB SSD)")
                    .slug("macbook-air-13-m3-16gb-512gb")
                    .brand("Apple")
                    .originalPrice(new BigDecimal("32990000"))
                    .salePrice(new BigDecimal("29990000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80")
                    .description("Chiếc máy tính xách tay mỏng nhẹ hoàn hảo cho dân văn phòng và sinh viên, chip M3 mạnh mẽ, hỗ trợ xuất 2 màn hình ngoài cùng lúc, vận hành êm ái hoàn toàn không cần quạt.")
                    .cpu("Apple M3 8-core CPU")
                    .ram("16GB Unified")
                    .storage("512GB SSD")
                    .vga("Apple GPU 10 nhân")
                    .screen("13.6 inch Liquid Retina IPS")
                    .battery("52.6Wh, pin 18 tiếng")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(false)
                    .category(laptopOfficeCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Laptop Dell XPS 13 Plus 9320 Core i7-1360P / 3.5K OLED")
                    .slug("dell-xps-13-plus-9320-oled")
                    .brand("Dell")
                    .originalPrice(new BigDecimal("46990000"))
                    .salePrice(new BigDecimal("41990000"))
                    .stockQuantity(15)
                    .thumbnail("https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=800&auto=format&fit=crop&q=80")
                    .description("Biểu tượng thời trang công nghệ với bàn phím tràn viền, hàng phím chức năng cảm ứng LED vô hình và màn hình 3.5K OLED rực rỡ.")
                    .cpu("Intel Core i7-1360P")
                    .ram("16GB LPDDR5 6000MHz")
                    .storage("1TB PCIe 4.0 NVMe")
                    .vga("Intel Iris Xe")
                    .screen("13.4 inch 3.5K (3456x2160) OLED Cảm ứng")
                    .battery("55Wh")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(false)
                    .bestSeller(false)
                    .category(laptopOfficeCat)
                    .build());

            // 4. PC ĐỒNG BỘ
            newProducts.add(Product.builder()
                    .name("PC Gaming FPT Phoenix X1 (Core i7-14700F / RTX 4070 Super / 32GB RAM)")
                    .slug("pc-gaming-fpt-phoenix-x1")
                    .brand("FPT")
                    .originalPrice(new BigDecimal("42990000"))
                    .salePrice(new BigDecimal("38990000"))
                    .stockQuantity(15)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Dàn máy Gaming lắp ráp nguyên chiếc bởi FPT TechStore. Cân mượt mà mọi tựa game 2K/4K max setting và dựng phim 4K chuyên nghiệp.")
                    .cpu("Intel Core i7-14700F (20 nhân 28 luồng)")
                    .ram("32GB DDR5 5600MHz RGB")
                    .storage("1TB SSD NVMe PCIe 4.0")
                    .vga("NVIDIA GeForce RTX 4070 Super 12GB")
                    .screen("Chưa bao gồm màn hình")
                    .battery("Nguồn 750W 80 Plus Gold")
                    .warrantyMonths(36)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(true)
                    .category(pcCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("PC Gaming G-Master Elite (Ryzen 7 7800X3D / RTX 4080 Super / Tản Nước 360)")
                    .slug("pc-gaming-g-master-elite-7800x3d")
                    .brand("G-Master")
                    .originalPrice(new BigDecimal("69990000"))
                    .salePrice(new BigDecimal("63990000"))
                    .stockQuantity(8)
                    .thumbnail("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80")
                    .description("Cấu hình PC Gaming vô địch phân khúc trang bị CPU chơi game tốt nhất thế giới Ryzen 7 7800X3D kết hợp card đồ họa RTX 4080 Super 16GB.")
                    .cpu("AMD Ryzen 7 7800X3D (96MB V-Cache)")
                    .ram("32GB DDR5 6000MHz RGB CL30")
                    .storage("2TB Samsung 990 Pro Gen 4")
                    .vga("NVIDIA GeForce RTX 4080 Super 16GB")
                    .warrantyMonths(36)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(false)
                    .category(pcCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("PC All-in-One Apple iMac 24 inch M3 (8-core GPU / 8GB / 256GB)")
                    .slug("apple-imac-24-inch-m3")
                    .brand("Apple")
                    .originalPrice(new BigDecimal("36990000"))
                    .salePrice(new BigDecimal("33990000"))
                    .stockQuantity(10)
                    .thumbnail("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80")
                    .description("Máy tính để bàn tất cả trong một siêu mỏng chỉ 11.5mm, màn hình 24 inch Retina 4.5K sống động, camera FaceTime 1080p và loa âm thanh vòm đỉnh cao.")
                    .cpu("Apple M3 8-core CPU")
                    .ram("8GB Unified Memory")
                    .storage("256GB SSD")
                    .screen("24 inch 4.5K Retina (4480x2520)")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(false)
                    .bestSeller(false)
                    .category(pcCat)
                    .build());

            // 5. PC BUILDER COMPONENTS
            // 5.1 CPU
            newProducts.add(Product.builder()
                    .name("CPU Intel Core i9-14900K (LGA1700, 24 nhân 32 luồng, xung 6.0GHz)")
                    .slug("cpu-intel-core-i9-14900k")
                    .brand("Intel")
                    .originalPrice(new BigDecimal("16990000"))
                    .salePrice(new BigDecimal("15490000"))
                    .stockQuantity(20)
                    .thumbnail("https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80")
                    .description("Vi xử lý máy bàn đỉnh nóc kịch trần của Intel, đạt tốc độ xung nhịp 6.0 GHz ngay khi xuất xưởng, xử lý đồ họa render 3D và gaming cực khủng.")
                    .cpu("24 nhân (8P + 16E), 32 luồng, Xung 6.0GHz, Socket LGA1700")
                    .warrantyMonths(36)
                    .componentType(ComponentType.CPU)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("CPU Intel Core i7-14700K (LGA1700, 20 nhân 28 luồng, xung 5.6GHz)")
                    .slug("cpu-intel-core-i7-14700k")
                    .brand("Intel")
                    .originalPrice(new BigDecimal("11490000"))
                    .salePrice(new BigDecimal("10590000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80")
                    .description("Bộ vi xử lý cực mạnh cho game thủ chuyên nghiệp và dân đồ họa dựng phim, xung nhịp lên đến 5.6GHz Socket LGA1700.")
                    .cpu("20 nhân 28 luồng, Xung 5.6GHz, Socket LGA1700")
                    .warrantyMonths(36)
                    .componentType(ComponentType.CPU)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("CPU Intel Core i5-14400F (LGA1700, 10 nhân 16 luồng)")
                    .slug("cpu-intel-core-i5-14400f")
                    .brand("Intel")
                    .originalPrice(new BigDecimal("5590000"))
                    .salePrice(new BigDecimal("5090000"))
                    .stockQuantity(40)
                    .thumbnail("https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80")
                    .description("CPU chơi game phân khúc tầm trung quốc dân, 10 nhân 16 luồng Socket LGA1700, mát mẻ và tối ưu chi phí.")
                    .cpu("10 nhân 16 luồng, Socket LGA1700")
                    .warrantyMonths(36)
                    .componentType(ComponentType.CPU)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("CPU AMD Ryzen 7 7800X3D (AM5, 8 nhân 16 luồng, 96MB V-Cache)")
                    .slug("cpu-amd-ryzen-7-7800x3d")
                    .brand("AMD")
                    .originalPrice(new BigDecimal("11990000"))
                    .salePrice(new BigDecimal("10990000"))
                    .stockQuantity(30)
                    .thumbnail("https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800&auto=format&fit=crop&q=80")
                    .description("Vua của các CPU chơi game trên thế giới với công nghệ bộ nhớ đệm 3D V-Cache dung lượng 96MB khổng lồ, Socket AM5.")
                    .cpu("8 nhân 16 luồng, 96MB L3 Cache, Socket AM5")
                    .warrantyMonths(36)
                    .componentType(ComponentType.CPU)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("CPU AMD Ryzen 5 7600X (AM5, 6 nhân 12 luồng, xung 5.3GHz)")
                    .slug("cpu-amd-ryzen-5-7600x")
                    .brand("AMD")
                    .originalPrice(new BigDecimal("6490000"))
                    .salePrice(new BigDecimal("5790000"))
                    .stockQuantity(35)
                    .thumbnail("https://images.unsplash.com/photo-1555617778-02518510b9fa?w=800&auto=format&fit=crop&q=80")
                    .description("CPU thế hệ Zen 4 chuẩn chân cắm Socket AM5, hỗ trợ PCIe 5.0 và RAM DDR5 tốc độ cao.")
                    .cpu("6 nhân 12 luồng, Socket AM5")
                    .warrantyMonths(36)
                    .componentType(ComponentType.CPU)
                    .category(componentCat)
                    .build());

            // 5.2 MAINBOARD
            newProducts.add(Product.builder()
                    .name("Mainboard ASUS ROG MAXIMUS Z790 HERO (LGA1700, DDR5)")
                    .slug("mainboard-asus-rog-maximus-z790-hero")
                    .brand("ASUS")
                    .originalPrice(new BigDecimal("16990000"))
                    .salePrice(new BigDecimal("15490000"))
                    .stockQuantity(12)
                    .thumbnail("https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80")
                    .description("Bo mạch chủ flagship dòng ROG Maximus cho CPU Intel LGA1700, 20+1 phase cấp điện 90A, cổng Thunderbolt 4 kép.")
                    .warrantyMonths(36)
                    .componentType(ComponentType.MAINBOARD)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Mainboard MSI B760 GAMING PLUS WIFI DDR5")
                    .slug("mainboard-msi-b760-gaming-plus-wifi-ddr5")
                    .brand("MSI")
                    .originalPrice(new BigDecimal("4290000"))
                    .salePrice(new BigDecimal("3890000"))
                    .stockQuantity(30)
                    .thumbnail("https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80")
                    .description("Bo mạch chủ chuẩn ATX hỗ trợ vi xử lý Intel Gen 12, 13, 14 Socket LGA1700, 4 khe RAM DDR5, tích hợp sẵn Wi-Fi 6E.")
                    .ram("4 khe DDR5 (lên đến 192GB)")
                    .storage("2x M.2 PCIe 4.0")
                    .warrantyMonths(36)
                    .componentType(ComponentType.MAINBOARD)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Mainboard GIGABYTE X670 AORUS ELITE AX (Socket AM5, DDR5)")
                    .slug("mainboard-gigabyte-x670-aorus-elite-ax")
                    .brand("GIGABYTE")
                    .originalPrice(new BigDecimal("8490000"))
                    .salePrice(new BigDecimal("7690000"))
                    .stockQuantity(18)
                    .thumbnail("https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80")
                    .description("Bo mạch chủ cao cấp chuyên dụng cho CPU AMD Ryzen 7000/8000/9000 Socket AM5, 4 khe M.2 PCIe Gen 5 và Wi-Fi 6E tích hợp.")
                    .warrantyMonths(36)
                    .componentType(ComponentType.MAINBOARD)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Mainboard MSI B650 GAMING PLUS WIFI (Socket AM5, DDR5)")
                    .slug("mainboard-msi-b650-gaming-plus-wifi")
                    .brand("MSI")
                    .originalPrice(new BigDecimal("4890000"))
                    .salePrice(new BigDecimal("4390000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80")
                    .description("Mainboard quốc dân cho CPU AMD Socket AM5, tản nhiệt VRM dày dặn, hỗ trợ ép xung RAM DDR5 lên đến 7200+ MHz.")
                    .warrantyMonths(36)
                    .componentType(ComponentType.MAINBOARD)
                    .category(componentCat)
                    .build());

            // 5.3 RAM
            newProducts.add(Product.builder()
                    .name("RAM Corsair Dominator Titanium RGB 64GB (2x32GB) DDR5 6000MHz")
                    .slug("ram-corsair-dominator-titanium-rgb-64gb")
                    .brand("Corsair")
                    .originalPrice(new BigDecimal("8290000"))
                    .salePrice(new BigDecimal("7490000"))
                    .stockQuantity(20)
                    .thumbnail("https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80")
                    .description("Dòng RAM cao cấp bậc nhất của Corsair với thiết kế nhôm rèn tinh xảo, dải LED RGB Capellix siêu sáng, độ trễ CL30 cực thấp.")
                    .ram("64GB (2x32GB) DDR5 6000MHz CL30")
                    .warrantyMonths(36)
                    .componentType(ComponentType.RAM)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz")
                    .slug("ram-corsair-vengeance-rgb-32gb-ddr5-6000mhz")
                    .brand("Corsair")
                    .originalPrice(new BigDecimal("3490000"))
                    .salePrice(new BigDecimal("3090000"))
                    .stockQuantity(50)
                    .thumbnail("https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80")
                    .description("Kit RAM DDR5 hiệu năng cao trang bị dải đèn LED RGB 10 vùng tùy biến, hỗ trợ Intel XMP 3.0 và AMD EXPO.")
                    .ram("32GB (2x16GB) Bus 6000MHz CL36")
                    .warrantyMonths(36)
                    .componentType(ComponentType.RAM)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("RAM Kingston FURY Beast 16GB (1x16GB) DDR5 5600MHz")
                    .slug("ram-kingston-fury-beast-16gb-ddr5-5600mhz")
                    .brand("Kingston")
                    .originalPrice(new BigDecimal("1690000"))
                    .salePrice(new BigDecimal("1450000"))
                    .stockQuantity(60)
                    .thumbnail("https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80")
                    .description("RAM đơn 16GB bus 5600 chuẩn DDR5 thế hệ mới, tản nhiệt nhôm đen sang trọng.")
                    .ram("16GB Bus 5600MHz")
                    .warrantyMonths(36)
                    .componentType(ComponentType.RAM)
                    .category(componentCat)
                    .build());

            // 5.4 VGA
            newProducts.add(Product.builder()
                    .name("VGA ASUS ROG Strix GeForce RTX 4090 OC 24GB")
                    .slug("vga-asus-rog-strix-geforce-rtx-4090-24gb")
                    .brand("ASUS")
                    .originalPrice(new BigDecimal("58990000"))
                    .salePrice(new BigDecimal("54990000"))
                    .stockQuantity(8)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Quái vật đồ họa mạnh nhất hành tinh với kiến trúc Ada Lovelace, 24GB VRAM GDDR6X, tản nhiệt buồng hơi buồng hơi Vapor Chamber.")
                    .vga("RTX 4090 24GB GDDR6X 384-bit")
                    .warrantyMonths(36)
                    .componentType(ComponentType.VGA)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("VGA MSI GeForce RTX 4080 SUPER 16G GAMING X TRIO")
                    .slug("vga-msi-geforce-rtx-4080-super-16g")
                    .brand("MSI")
                    .originalPrice(new BigDecimal("32990000"))
                    .salePrice(new BigDecimal("29990000"))
                    .stockQuantity(15)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Card đồ họa cao cấp Gaming X Trio với 3 quạt tản nhiệt TORX FAN 5.0, chơi mượt mà mọi tựa game 4K Max Settings.")
                    .vga("RTX 4080 Super 16GB GDDR6X")
                    .warrantyMonths(36)
                    .componentType(ComponentType.VGA)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("VGA MSI GeForce RTX 4070 SUPER 12G VENTUS 2X OC")
                    .slug("vga-msi-geforce-rtx-4070-super-12g-ventus")
                    .brand("MSI")
                    .originalPrice(new BigDecimal("18990000"))
                    .salePrice(new BigDecimal("17490000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Card đồ họa hiệu năng đỉnh cao xử lý đồ họa 4K và chơi mượt mọi tựa game AAA với 12GB VRAM GDDR6X.")
                    .vga("RTX 4070 Super 12GB GDDR6X 192-bit")
                    .warrantyMonths(36)
                    .componentType(ComponentType.VGA)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("VGA ASUS Dual GeForce RTX 4060 OC Edition 8GB")
                    .slug("vga-asus-dual-geforce-rtx-4060-oc-8gb")
                    .brand("ASUS")
                    .originalPrice(new BigDecimal("8990000"))
                    .salePrice(new BigDecimal("8190000"))
                    .stockQuantity(40)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Card đồ họa chiến game Full HD và 2K mượt mà với công nghệ DLSS 3 và Frame Generation.")
                    .vga("RTX 4060 8GB GDDR6 128-bit")
                    .warrantyMonths(36)
                    .componentType(ComponentType.VGA)
                    .category(componentCat)
                    .build());

            // 5.5 SSD
            newProducts.add(Product.builder()
                    .name("Ổ cứng SSD Samsung 990 PRO 2TB PCIe Gen 4.0 NVMe M.2 (7450 MB/s)")
                    .slug("ssd-samsung-990-pro-2tb-pcie-4")
                    .brand("Samsung")
                    .originalPrice(new BigDecimal("5890000"))
                    .salePrice(new BigDecimal("5190000"))
                    .stockQuantity(30)
                    .thumbnail("https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80")
                    .description("Dung lượng 2TB khổng lồ, tốc độ đọc 7450 MB/s, ghi 6900 MB/s, độ bền TBW cực cao.")
                    .storage("2TB NVMe PCIe 4.0")
                    .warrantyMonths(60)
                    .componentType(ComponentType.SSD)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Ổ cứng SSD Samsung 990 PRO 1TB PCIe Gen 4.0 NVMe M.2")
                    .slug("ssd-samsung-990-pro-1tb-pcie-4")
                    .brand("Samsung")
                    .originalPrice(new BigDecimal("3190000"))
                    .salePrice(new BigDecimal("2790000"))
                    .stockQuantity(45)
                    .thumbnail("https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80")
                    .description("Tốc độ đọc tuần tự lên đến 7450 MB/s, dẫn đầu về độ tin cậy và tốc độ tải game.")
                    .storage("1TB NVMe PCIe 4.0")
                    .warrantyMonths(60)
                    .componentType(ComponentType.SSD)
                    .category(componentCat)
                    .build());

            // 5.6 PSU
            newProducts.add(Product.builder()
                    .name("Nguồn máy tính Corsair RM1000e 1000W 80 Plus Gold ATX 3.0")
                    .slug("nguon-corsair-rm1000e-1000w-80-plus-gold")
                    .brand("Corsair")
                    .originalPrice(new BigDecimal("4590000"))
                    .salePrice(new BigDecimal("4190000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80")
                    .description("Nguồn công suất 1000W chuẩn ATX 3.0 PCIe 5.0, dây nguồn 12VHPWR cấp điện trực tiếp cho RTX 4080/4090 an toàn tuyệt đối.")
                    .warrantyMonths(84)
                    .componentType(ComponentType.PSU)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Nguồn máy tính Corsair RM750e 750W 80 Plus Gold - Full Modular")
                    .slug("nguon-corsair-rm750e-750w-80-plus-gold")
                    .brand("Corsair")
                    .originalPrice(new BigDecimal("3090000"))
                    .salePrice(new BigDecimal("2690000"))
                    .stockQuantity(35)
                    .thumbnail("https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80")
                    .description("Nguồn công suất thực 750W chuẩn 80 Plus Gold tiết kiệm điện, thiết kế cáp rời hoàn toàn.")
                    .warrantyMonths(84)
                    .componentType(ComponentType.PSU)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Nguồn máy tính ASUS TUF Gaming 650W 80 Plus Bronze")
                    .slug("nguon-asus-tuf-gaming-650w-bronze")
                    .brand("ASUS")
                    .originalPrice(new BigDecimal("1890000"))
                    .salePrice(new BigDecimal("1650000"))
                    .stockQuantity(40)
                    .thumbnail("https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80")
                    .description("Đạt tiêu chuẩn quân đội TUF Gaming về độ bền, quạt vòng bi kép và lớp phủ bảo vệ PCB chống ẩm.")
                    .warrantyMonths(72)
                    .componentType(ComponentType.PSU)
                    .category(componentCat)
                    .build());

            // 5.7 CASE
            newProducts.add(Product.builder()
                    .name("Vỏ Case máy tính NZXT H9 Flow Dual-Chamber Black")
                    .slug("vo-case-nzxt-h9-flow-dual-chamber-black")
                    .brand("NZXT")
                    .originalPrice(new BigDecimal("4290000"))
                    .salePrice(new BigDecimal("3890000"))
                    .stockQuantity(15)
                    .thumbnail("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80")
                    .description("Case máy tính bể cá 2 khoang cao cấp, kính cường lực nguyên khối không viền góc nhìn panorama tuyệt đẹp.")
                    .warrantyMonths(24)
                    .componentType(ComponentType.CASE)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Vỏ Case máy tính NZXT H5 Flow RGB Black")
                    .slug("vo-case-nzxt-h5-flow-rgb-black")
                    .brand("NZXT")
                    .originalPrice(new BigDecimal("2690000"))
                    .salePrice(new BigDecimal("2390000"))
                    .stockQuantity(25)
                    .thumbnail("https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80")
                    .description("Case Mid-Tower mặt lưới thoáng khí tối ưu luồng gió, kèm sẵn 2 quạt RGB phía trước.")
                    .warrantyMonths(24)
                    .componentType(ComponentType.CASE)
                    .category(componentCat)
                    .build());

            // 5.8 COOLER
            newProducts.add(Product.builder()
                    .name("Tản nhiệt nước AIO NZXT Kraken Elite 360 RGB LCD")
                    .slug("tan-nhiet-nuoc-nzxt-kraken-elite-360-rgb-lcd")
                    .brand("NZXT")
                    .originalPrice(new BigDecimal("7990000"))
                    .salePrice(new BigDecimal("7190000"))
                    .stockQuantity(15)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Tản nước cao cấp màn hình LCD 2.36 inch độ phân giải 640x640 tùy chỉnh ảnh GIF, bơm Asetek thế hệ 7 làm mát êm ái.")
                    .warrantyMonths(72)
                    .componentType(ComponentType.COOLER)
                    .category(componentCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Tản nhiệt khí DeepCool AK620 Digital")
                    .slug("tan-nhiet-khi-deepcool-ak620-digital")
                    .brand("DeepCool")
                    .originalPrice(new BigDecimal("1890000"))
                    .salePrice(new BigDecimal("1650000"))
                    .stockQuantity(30)
                    .thumbnail("https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80")
                    .description("Tản tháp đôi 6 ống đồng tản nhiệt, trang bị màn hình số LED hiển thị nhiệt độ CPU thời gian thực.")
                    .warrantyMonths(36)
                    .componentType(ComponentType.COOLER)
                    .category(componentCat)
                    .build());

            // 6. PHỤ KIỆN & GAMING GEAR
            newProducts.add(Product.builder()
                    .name("Bàn phím cơ không dây ASUS ROG Azoth OLED 75%")
                    .slug("ban-phim-co-asus-rog-azoth-oled")
                    .brand("ASUS")
                    .originalPrice(new BigDecimal("6490000"))
                    .salePrice(new BigDecimal("5790000"))
                    .stockQuantity(20)
                    .thumbnail("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80")
                    .description("Bàn phím cơ custom cao cấp gõ siêu êm với Gasket mount, màn hình OLED hiển thị thông số và núm xoay 3 chiều tiện dụng.")
                    .warrantyMonths(24)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(false)
                    .category(gearCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Chuột Gaming không dây Logitech G Pro X Superlight 2 (60g)")
                    .slug("chuot-logitech-g-pro-x-superlight-2")
                    .brand("Logitech")
                    .originalPrice(new BigDecimal("3890000"))
                    .salePrice(new BigDecimal("3490000"))
                    .stockQuantity(35)
                    .thumbnail("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80")
                    .description("Vua của chuột bắn súng FPS Esports, trọng lượng siêu nhẹ 60g, cảm biến HERO 2 độ nhạy 32.000 DPI và switch quang học lai LIGHTFORCE.")
                    .warrantyMonths(24)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(true)
                    .category(gearCat)
                    .build());

            newProducts.add(Product.builder()
                    .name("Tai nghe không dây Sony WH-1000XM5 Hi-Res Noise Canceling")
                    .slug("tai-nghe-sony-wh-1000xm5")
                    .brand("Sony")
                    .originalPrice(new BigDecimal("8990000"))
                    .salePrice(new BigDecimal("7690000"))
                    .stockQuantity(20)
                    .thumbnail("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80")
                    .description("Đỉnh cao chống ồn chủ động với bộ đôi vi xử lý V1 và QN1, 8 micro thu âm, chất âm Hi-Res Audio đỉnh cao và đệm tai da êm ái.")
                    .battery("Pin 30 giờ nghe liên tục")
                    .warrantyMonths(12)
                    .componentType(ComponentType.NONE)
                    .featured(true)
                    .bestSeller(false)
                    .category(gearCat)
                    .build());

            // Save new products (skip any duplicate slugs)
            for (Product p : newProducts) {
                if (!productRepository.existsBySlug(p.getSlug())) {
                    productRepository.save(p);
                }
            }
            log.info("==> Successfully seeded total {} products in database!", productRepository.count());
        }

        // 7. SEED REVIEWS IF EMPTY
        if (reviewRepository.count() == 0) {
            log.info("==> Seeding authentic customer reviews...");
            final User reviewCustomer = userRepository.findByEmail("customer@gmail.com").orElse(null);

            productRepository.findBySlug("iphone-16-pro-max-256gb").ifPresent(p -> {
                reviewRepository.save(Review.builder()
                        .product(p)
                        .user(reviewCustomer)
                        .authorName("Trần Hoàng Nam")
                        .rating(5)
                        .content("Hàng chính hãng FPT nguyên seal 100%, máy màu Titan Sa Mạc bên ngoài sang hơn trong ảnh nhiều. Màn hình 120Hz siêu mượt và camera zoom quang 5x rất nét!")
                        .verifiedPurchase(true)
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .build());
                reviewRepository.save(Review.builder()
                        .product(p)
                        .authorName("Lê Minh Quân")
                        .rating(5)
                        .content("Giao hàng siêu tốc đúng 2 tiếng nội thành. Nhân viên hướng dẫn kích hoạt bảo hành điện tử chu đáo.")
                        .verifiedPurchase(true)
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .build());
            });

            productRepository.findBySlug("asus-rog-strix-scar-16-g634jzr").ifPresent(p -> {
                reviewRepository.save(Review.builder()
                        .product(p)
                        .authorName("Nguyễn Đức Huy")
                        .rating(5)
                        .content("Đỉnh cao laptop gaming! Màn Mini LED rực rỡ, card RTX 4080 kéo Black Myth Wukong 2K max settings mượt mà 120 fps. Hệ thống tản nhiệt 3 quạt cực êm.")
                        .verifiedPurchase(true)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build());
            });

            productRepository.findBySlug("cpu-amd-ryzen-7-7800x3d").ifPresent(p -> {
                reviewRepository.save(Review.builder()
                        .product(p)
                        .authorName("Hoàng Văn Phúc")
                        .rating(5)
                        .content("Xứng danh vua CPU gaming, 96MB cache 3D kéo FPS game CS2 và Valorant cực kỳ ổn định, không hề bị drop frame!")
                        .verifiedPurchase(true)
                        .createdAt(LocalDateTime.now().minusDays(4))
                        .build());
            });

            productRepository.findBySlug("macbook-pro-14-m3-pro-space-black").ifPresent(p -> {
                reviewRepository.save(Review.builder()
                        .product(p)
                        .authorName("Đặng Thu Thảo")
                        .rating(5)
                        .content("Máy màu Space Black rất ít bám vân tay, render video 4K Final Cut Pro nhanh như chớp mà máy vẫn mát rượi, pin dùng từ sáng đến tối chưa hết.")
                        .verifiedPurchase(true)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build());
            });

            log.info("==> Seeded authentic reviews successfully!");
        }

        // Initialize Vouchers if not present
        if (voucherRepository.count() == 0) {
            log.info("==> Seeding initial vouchers...");
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneYearLater = now.plusYears(1);

            voucherRepository.save(Voucher.builder()
                    .code("FPTSHOP10")
                    .description("Giảm 10% tối đa 500.000đ cho đơn hàng từ 1.000.000đ")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(BigDecimal.valueOf(10))
                    .minOrderValue(BigDecimal.valueOf(1000000))
                    .maxDiscountAmount(BigDecimal.valueOf(500000))
                    .usageLimit(100)
                    .usedCount(0)
                    .startDate(now)
                    .endDate(oneYearLater)
                    .isActive(true)
                    .build());

            voucherRepository.save(Voucher.builder()
                    .code("GIAM200K")
                    .description("Giảm ngay 200.000đ cho đơn hàng từ 3.000.000đ")
                    .discountType(DiscountType.FIXED_AMOUNT)
                    .discountValue(BigDecimal.valueOf(200000))
                    .minOrderValue(BigDecimal.valueOf(3000000))
                    .maxDiscountAmount(null)
                    .usageLimit(50)
                    .usedCount(0)
                    .startDate(now)
                    .endDate(oneYearLater)
                    .isActive(true)
                    .build());

            voucherRepository.save(Voucher.builder()
                    .code("BUILDPC1TR")
                    .description("Giảm 1.000.000đ cho đơn build PC / mua sắm từ 15.000.000đ")
                    .discountType(DiscountType.FIXED_AMOUNT)
                    .discountValue(BigDecimal.valueOf(1000000))
                    .minOrderValue(BigDecimal.valueOf(15000000))
                    .maxDiscountAmount(null)
                    .usageLimit(30)
                    .usedCount(0)
                    .startDate(now)
                    .endDate(oneYearLater)
                    .isActive(true)
                    .build());

            log.info("==> Seeded initial vouchers successfully!");
        }
    }
}
