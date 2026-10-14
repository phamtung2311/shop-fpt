package com.ecommerce.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String brand;

    @Column(nullable = false)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    private BigDecimal salePrice;

    @Builder.Default
    private Integer stockQuantity = 50;

    @Column(length = 1000)
    private String thumbnail;

    @Column(columnDefinition = "TEXT")
    private String images; // JSON or comma-separated URLs for photo album

    @Column(columnDefinition = "TEXT")
    private String description;

    // Technical specifications (for FPT Shop style specs sheet)
    private String cpu;
    private String ram;
    private String storage;
    private String vga;
    private String screen;
    private String battery;
    private Integer warrantyMonths;

    // Component slot for PC Builder tool
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ComponentType componentType = ComponentType.NONE;

    @Builder.Default
    private boolean featured = false;

    @Builder.Default
    private boolean bestSeller = false;

    @Builder.Default
    private Double rating = 5.0;

    @Builder.Default
    private Integer reviewCount = 12;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    @JsonIgnore
    private Category category;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
