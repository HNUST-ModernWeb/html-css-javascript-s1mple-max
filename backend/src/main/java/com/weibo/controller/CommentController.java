package com.weibo.controller;

import com.weibo.dto.ApiResponse;
import com.weibo.dto.CommentRequest;
import com.weibo.entity.Comment;
import com.weibo.service.CommentService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    public ApiResponse<List<Comment>> list(@PathVariable Long postId) {
        return ApiResponse.ok(commentService.getComments(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ApiResponse<Comment> create(@PathVariable Long postId,
                                       @Valid @RequestBody CommentRequest req,
                                       HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        Comment comment = commentService.create(postId, userId, req.getContent());

        // Manually set user info for immediate display
        comment.setNickname("我");
        return ApiResponse.ok(comment);
    }

    @DeleteMapping("/comments/{id}")
    public ApiResponse<?> delete(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) return ApiResponse.fail(401, "请先登录");
        try {
            commentService.delete(id, userId);
            return ApiResponse.ok();
        } catch (RuntimeException e) {
            return ApiResponse.fail(403, e.getMessage());
        }
    }
}
