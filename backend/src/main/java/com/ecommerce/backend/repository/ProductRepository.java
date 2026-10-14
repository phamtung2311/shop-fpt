package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.ComponentType;
import com.ecommerce.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Product> findByComponentType(ComponentType componentType);

    List<Product> findByFeaturedTrue();

    List<Product> findByBestSellerTrue();
}
