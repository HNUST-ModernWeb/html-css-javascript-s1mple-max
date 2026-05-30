package com.weibo.service;

import com.weibo.entity.User;
import com.weibo.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public Map<String, Object> getProfile(Long userId) {
        User user = userMapper.findById(userId);
        if (user == null) throw new RuntimeException("用户不存在");
        return buildUserInfo(user);
    }

    public Map<String, Object> updateProfile(Long userId, String nickname, String bio) {
        User user = userMapper.findById(userId);
        if (user == null) throw new RuntimeException("用户不存在");
        user.setNickname(nickname != null ? nickname : user.getNickname());
        user.setBio(bio != null ? bio : user.getBio());
        userMapper.updateProfile(user);
        return buildUserInfo(userMapper.findById(userId));
    }

    public Map<String, Object> updateAvatar(Long userId, String avatar) {
        userMapper.updateAvatar(userId, avatar);
        return buildUserInfo(userMapper.findById(userId));
    }

    private Map<String, Object> buildUserInfo(User user) {
        Map<String, Object> info = new HashMap<>();
        info.put("id", user.getId());
        info.put("username", user.getUsername());
        info.put("nickname", user.getNickname());
        info.put("avatar", user.getAvatar());
        info.put("bio", user.getBio());
        info.put("createdAt", user.getCreatedAt());
        return info;
    }
}
