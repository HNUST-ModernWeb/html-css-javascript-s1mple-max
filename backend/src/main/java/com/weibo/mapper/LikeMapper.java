package com.weibo.mapper;

import org.apache.ibatis.annotations.*;

@Mapper
public interface LikeMapper {

    @Insert("INSERT INTO likes (post_id, user_id) VALUES (#{postId}, #{userId})")
    int insert(@Param("postId") Long postId, @Param("userId") Long userId);

    @Delete("DELETE FROM likes WHERE post_id = #{postId} AND user_id = #{userId}")
    int delete(@Param("postId") Long postId, @Param("userId") Long userId);

    @Select("SELECT COUNT(*) FROM likes WHERE post_id = #{postId}")
    int countByPostId(Long postId);
}
