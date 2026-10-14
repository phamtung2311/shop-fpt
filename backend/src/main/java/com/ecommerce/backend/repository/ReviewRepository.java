package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByProductSlugOrderByCreatedAtDesc(String slug);
    long countByProduct(Product product);
}
