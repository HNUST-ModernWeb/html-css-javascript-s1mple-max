package com.weibo.service;

import com.weibo.dto.PostRequest;
import com.weibo.entity.Post;
import com.weibo.mapper.LikeMapper;
import com.weibo.mapper.PostMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostMapper postMapper;
    private final LikeMapper likeMapper;

    public PostService(PostMapper postMapper, LikeMapper likeMapper) {
        this.postMapper = postMapper;
        this.likeMapper = likeMapper;
    }

    public List<Post> getFeed(int page, int size, Long currentUserId) {
        List<Post> posts = postMapper.findAll((page - 1) * size, size);
        if (currentUserId != null) {
            for (Post post : posts) {
                post.setLiked(postMapper.isLiked(post.getId(), currentUserId));
            }
        }
        return posts;
    }

    public List<Post> getUserPosts(Long userId, int page, int size, Long currentUserId) {
        List<Post> posts = postMapper.findByUserId(userId, (page - 1) * size, size);
        if (currentUserId != null) {
            for (Post post : posts) {
                post.setLiked(postMapper.isLiked(post.getId(), currentUserId));
            }
        }
        return posts;
    }

    public Post getPost(Long id, Long currentUserId) {
        Post post = postMapper.findById(id);
        if (post != null && currentUserId != null) {
            post.setLiked(postMapper.isLiked(post.getId(), currentUserId));
        }
        return post;
    }

    public Post create(PostRequest req, Long userId) {
        Post post = new Post();
        post.setUserId(userId);
        post.setContent(req.getContent());
        post.setImage(req.getImage() != null ? req.getImage() : "");
        postMapper.insert(post);
        return postMapper.findById(post.getId());
    }

    public void delete(Long id, Long userId) {
        int rows = postMapper.delete(id, userId);
        if (rows == 0) throw new RuntimeException("无权删除或帖子不存在");
    }

    public boolean toggleLike(Long postId, Long userId) {
        if (postMapper.isLiked(postId, userId)) {
            likeMapper.delete(postId, userId);
            return false;
        } else {
            likeMapper.insert(postId, userId);
            return true;
        }
    }
}
