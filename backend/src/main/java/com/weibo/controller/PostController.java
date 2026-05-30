package com.weibo.controller;

import com.weibo.dto.ApiResponse;
import com.weibo.dto.PostRequest;
import com.weibo.entity.Post;
import com.weibo.service.PostService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ApiResponse<List<Post>> feed(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.ok(postService.getFeed(page, size, userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<Post> detail(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Post post = postService.getPost(id, userId);
        if (post == null) return ApiResponse.fail(404, "帖子不存在");
        return ApiResponse.ok(post);
    }

    @PostMapping
    public ApiResponse<Post> create(@Valid @RequestBody PostRequest req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        return ApiResponse.ok(postService.create(req, userId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        try {
            postService.delete(id, userId);
            return ApiResponse.ok();
        } catch (RuntimeException e) {
            return ApiResponse.fail(403, e.getMessage());
        }
    }

    @PostMapping("/{id}/like")
    public ApiResponse<?> toggleLike(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        boolean liked = postService.toggleLike(id, userId);
        return ApiResponse.ok(java.util.Map.of("liked", liked));
    }
}
