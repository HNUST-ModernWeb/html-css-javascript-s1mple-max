package com.weibo.mapper;

import com.weibo.entity.Comment;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface CommentMapper {

    @Select("SELECT c.*, u.nickname, u.avatar FROM comments c " +
            "JOIN users u ON c.user_id = u.id " +
            "WHERE c.post_id = #{postId} ORDER BY c.created_at ASC")
    List<Comment> findByPostId(Long postId);

    @Insert("INSERT INTO comments (post_id, user_id, content) VALUES (#{postId}, #{userId}, #{content})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Comment comment);

    @Delete("DELETE FROM comments WHERE id = #{id} AND user_id = #{userId}")
    int delete(@Param("id") Long id, @Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM comments WHERE post_id = #{postId}")
    int countByPostId(Long postId);
}
