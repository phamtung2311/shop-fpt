package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ProductDto;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.entity.ComponentType;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductDto> getProducts(
            Long categoryId,
            String categorySlug,
            String brand,
            ComponentType componentType,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String keyword,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (categorySlug != null && !categorySlug.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category").get("slug")), categorySlug.toLowerCase()));
            }
            if (brand != null && !brand.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            }
            if (componentType != null && componentType != ComponentType.NONE) {
                predicates.add(cb.equal(root.get("componentType"), componentType));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salePrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salePrice"), maxPrice));
            }
            if (keyword != null && !keyword.isBlank()) {
                String searchPattern = "%" + keyword.toLowerCase().trim() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(nameMatch, descMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + id));
        return mapToDto(product);
    }

    public ProductDto getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với slug: " + slug));
        return mapToDto(product);
    }

    public List<ProductDto> getFeaturedProducts() {
        return productRepository.findByFeaturedTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getBestSellers() {
        return productRepository.findByBestSellerTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ProductDto> getComponentsByType(ComponentType componentType) {
        return productRepository.findByComponentType(componentType).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDto createProduct(ProductDto dto) {
        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));
        }

        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? dto.getSlug()
                : CategoryService.toSlug(dto.getName()) + "-" + System.currentTimeMillis();

        Product product = Product.builder()
                .name(dto.getName())
                .slug(slug)
                .brand(dto.getBrand())
                .originalPrice(dto.getOriginalPrice())
                .salePrice(dto.getSalePrice())
                .stockQuantity(dto.getStockQuantity() != null ? dto.getStockQuantity() : 50)
                .thumbnail(dto.getThumbnail())
                .description(dto.getDescription())
                .cpu(dto.getCpu())
                .ram(dto.getRam())
                .storage(dto.getStorage())
                .vga(dto.getVga())
                .screen(dto.getScreen())
                .battery(dto.getBattery())
                .warrantyMonths(dto.getWarrantyMonths() != null ? dto.getWarrantyMonths() : 12)
                .componentType(dto.getComponentType() != null ? dto.getComponentType() : ComponentType.NONE)
                .featured(dto.isFeatured())
                .bestSeller(dto.isBestSeller())
                .category(category)
                .build();

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + id));

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục"));
            product.setCategory(category);
        }

        product.setName(dto.getName());
        product.setBrand(dto.getBrand());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setSalePrice(dto.getSalePrice());
        if (dto.getStockQuantity() != null) product.setStockQuantity(dto.getStockQuantity());
        if (dto.getThumbnail() != null) product.setThumbnail(dto.getThumbnail());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        product.setCpu(dto.getCpu());
        product.setRam(dto.getRam());
        product.setStorage(dto.getStorage());
        product.setVga(dto.getVga());
        product.setScreen(dto.getScreen());
        product.setBattery(dto.getBattery());
        if (dto.getWarrantyMonths() != null) product.setWarrantyMonths(dto.getWarrantyMonths());
        if (dto.getComponentType() != null) product.setComponentType(dto.getComponentType());
        product.setFeatured(dto.isFeatured());
        product.setBestSeller(dto.isBestSeller());

        return mapToDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new IllegalArgumentException("Không tìm thấy sản phẩm với ID: " + id);
        }
        productRepository.deleteById(id);
    }

    public ProductDto mapToDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .brand(product.getBrand())
                .originalPrice(product.getOriginalPrice())
                .salePrice(product.getSalePrice())
                .stockQuantity(product.getStockQuantity())
                .thumbnail(product.getThumbnail())
                .description(product.getDescription())
                .cpu(product.getCpu())
                .ram(product.getRam())
                .storage(product.getStorage())
                .vga(product.getVga())
                .screen(product.getScreen())
                .battery(product.getBattery())
                .warrantyMonths(product.getWarrantyMonths())
                .componentType(product.getComponentType())
                .featured(product.isFeatured())
                .bestSeller(product.isBestSeller())
                .rating(product.getRating())
                .reviewCount(product.getReviewCount())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
