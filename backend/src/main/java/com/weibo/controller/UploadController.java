package com.weibo.controller;

import com.weibo.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${app.upload-path}")
    private String uploadPath;

    @PostMapping("/image")
    public ApiResponse<?> uploadImage(@RequestParam("file") MultipartFile file,
                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");

        if (file.isEmpty()) return ApiResponse.fail(400, "文件为空");

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        String filename = UUID.randomUUID().toString() + ext;
        File dir = new File(uploadPath);
        if (!dir.exists()) dir.mkdirs();

        try {
            file.transferTo(new File(dir, filename));
        } catch (IOException e) {
            return ApiResponse.fail(500, "上传失败");
        }

        Map<String, String> result = new HashMap<>();
        result.put("url", "/uploads/" + filename);
        return ApiResponse.ok(result);
    }
}
