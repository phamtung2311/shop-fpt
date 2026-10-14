package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.ReviewDto;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public List<ReviewDto> getReviewsByProductSlug(String slug) {
        return reviewRepository.findByProductSlugOrderByCreatedAtDesc(slug).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto addReview(String slug, ReviewDto dto, User user) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sản phẩm với slug: " + slug));

        String author = dto.getAuthorName();
        if (user != null && user.getFullName() != null && !user.getFullName().isBlank()) {
            author = user.getFullName();
        }

        // Check if user has purchased this product and order status is COMPLETED
        boolean isVerified = false;
        if (user != null && user.getId() != null) {
            isVerified = orderRepository.existsCompletedOrderByUserAndProduct(user.getId(), product.getId());
        }

        // Check for existing review from this user to allow updating
        Optional<Review> existingReviewOpt = (user != null && user.getId() != null)
                ? reviewRepository.findByProductIdAndUserId(product.getId(), user.getId())
                : Optional.empty();

        Review review;
        if (existingReviewOpt.isPresent()) {
            review = existingReviewOpt.get();
            review.setAuthorName(author);
            review.setRating(Math.max(1, Math.min(5, dto.getRating())));
            review.setContent(dto.getContent().trim());
            review.setVerifiedPurchase(isVerified);
            review.setCreatedAt(LocalDateTime.now());
        } else {
            review = Review.builder()
                    .product(product)
                    .user(user)
                    .authorName(author)
                    .rating(Math.max(1, Math.min(5, dto.getRating())))
                    .content(dto.getContent().trim())
                    .verifiedPurchase(isVerified)
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        Review saved = reviewRepository.save(review);

        // Update product overall rating and reviewCount
        List<Review> allReviews = reviewRepository.findByProductOrderByCreatedAtDesc(product);
        double avg = allReviews.stream().mapToInt(Review::getRating).average().orElse(5.0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount(allReviews.size());
        productRepository.save(product);

        return mapToDto(saved);
    }

    private ReviewDto mapToDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .authorName(review.getAuthorName())
                .rating(review.getRating())
                .content(review.getContent())
                .verifiedPurchase(review.getVerifiedPurchase() != null ? review.getVerifiedPurchase() : false)
                .createdAt(review.getCreatedAt().format(FORMATTER))
                .build();
    }
}
