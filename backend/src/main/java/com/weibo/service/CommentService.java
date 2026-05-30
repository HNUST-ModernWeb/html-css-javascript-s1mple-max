package com.weibo.service;

import com.weibo.entity.Comment;
import com.weibo.mapper.CommentMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentMapper commentMapper;

    public CommentService(CommentMapper commentMapper) {
        this.commentMapper = commentMapper;
    }

    public List<Comment> getComments(Long postId) {
        return commentMapper.findByPostId(postId);
    }

    public Comment create(Long postId, Long userId, String content) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUserId(userId);
        comment.setContent(content);
        commentMapper.insert(comment);
        return comment;
    }

    public void delete(Long id, Long userId) {
        int rows = commentMapper.delete(id, userId);
        if (rows == 0) throw new RuntimeException("无权删除或评论不存在");
    }
}
