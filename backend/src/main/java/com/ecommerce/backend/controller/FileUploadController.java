package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final String UPLOAD_DIR = "uploads";

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng chọn file để tải lên"));
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "image.jpg"));
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error("Định dạng file không hợp lệ! Chỉ chấp nhận: .jpg, .jpeg, .png, .webp, .gif")
            );
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            String newFilename = UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;
            Path filePath = uploadPath.resolve(newFilename);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            }

            String fileUrl = "/uploads/" + newFilename;
            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", fileUrl);
            responseData.put("filename", newFilename);

            return ResponseEntity.ok(ApiResponse.ok("Tải ảnh lên thành công", responseData));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(
                    ApiResponse.error("Có lỗi xảy ra khi lưu file: " + e.getMessage())
            );
        }
    }
}
