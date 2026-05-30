package com.weibo.mapper;

import com.weibo.entity.Post;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PostMapper {

    @Select("SELECT p.*, u.nickname, u.avatar, " +
            "(SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count " +
            "FROM posts p JOIN users u ON p.user_id = u.id " +
            "ORDER BY p.created_at DESC LIMIT #{offset}, #{size}")
    List<Post> findAll(@Param("offset") int offset, @Param("size") int size);

    @Select("SELECT p.*, u.nickname, u.avatar, " +
            "(SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count " +
            "FROM posts p JOIN users u ON p.user_id = u.id " +
            "WHERE p.user_id = #{userId} " +
            "ORDER BY p.created_at DESC LIMIT #{offset}, #{size}")
    List<Post> findByUserId(@Param("userId") Long userId, @Param("offset") int offset, @Param("size") int size);

    @Select("SELECT p.*, u.nickname, u.avatar, " +
            "(SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count " +
            "FROM posts p JOIN users u ON p.user_id = u.id " +
            "WHERE p.id = #{id}")
    Post findById(Long id);

    @Insert("INSERT INTO posts (user_id, content, image) VALUES (#{userId}, #{content}, #{image})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Post post);

    @Delete("DELETE FROM posts WHERE id = #{id} AND user_id = #{userId}")
    int delete(@Param("id") Long id, @Param("userId") Long userId);

    @Select("SELECT EXISTS(SELECT 1 FROM likes WHERE post_id = #{postId} AND user_id = #{userId})")
    boolean isLiked(@Param("postId") Long postId, @Param("userId") Long userId);
}
