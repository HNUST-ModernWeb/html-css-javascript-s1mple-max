package com.weibo.controller;

import com.weibo.dto.ApiResponse;
import com.weibo.service.PostService;
import com.weibo.service.UserService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PostService postService;

    public UserController(UserService userService, PostService postService) {
        this.userService = userService;
        this.postService = postService;
    }

    @GetMapping("/me")
    public ApiResponse<?> me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        return ApiResponse.ok(userService.getProfile(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<?> profile(@PathVariable Long id, HttpServletRequest request) {
        Long currentUserId = (Long) request.getAttribute("userId");
        Map<String, Object> profile = userService.getProfile(id);
        profile.put("posts", postService.getUserPosts(id, 1, 20, currentUserId));
        return ApiResponse.ok(profile);
    }

    @PutMapping("/me")
    public ApiResponse<?> updateProfile(@RequestBody Map<String, String> body,
                                         HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        return ApiResponse.ok(userService.updateProfile(userId,
                body.get("nickname"), body.get("bio")));
    }
}
