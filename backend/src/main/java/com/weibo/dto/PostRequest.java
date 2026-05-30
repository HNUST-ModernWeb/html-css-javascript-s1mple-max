package com.weibo.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class PostRequest {
    @NotBlank(message = "内容不能为空")
    @Size(max = 2000, message = "内容不能超过2000字")
    private String content;
    private String image;

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
