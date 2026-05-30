<template>
  <div class="post-card card">
    <div class="post-header">
      <router-link :to="'/profile/' + post.userId" class="post-user">
        <img v-if="post.avatar" :src="post.avatar" class="post-avatar" />
        <span v-else class="post-avatar-placeholder">👤</span>
        <span class="post-nickname">{{ post.nickname }}</span>
      </router-link>
      <span class="post-time">{{ formatTime(post.createdAt) }}</span>
    </div>

    <div class="post-content">{{ post.content }}</div>

    <img v-if="post.image" :src="post.image" class="post-image" @click="previewImage = post.image" />

    <div class="post-actions">
      <button class="action-btn" :class="{ liked: post.liked }" @click="$emit('like', post.id)">
        <span class="action-icon">{{ post.liked ? '❤️' : '🤍' }}</span>
        <span>{{ post.likeCount || 0 }}</span>
      </button>
      <button class="action-btn" @click="showComment = !showComment">
        <span class="action-icon">💬</span>
        <span>评论</span>
      </button>
      <button v-if="isOwner" class="action-btn delete-btn" @click="$emit('delete', post.id)">
        🗑️
      </button>
    </div>

    <CommentSection v-if="showComment" :post-id="post.id" />

    <!-- Image preview modal -->
    <div v-if="previewImage" class="image-preview-overlay" @click="previewImage = null">
      <img :src="previewImage" class="image-preview" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CommentSection from './CommentSection.vue'

const props = defineProps({ post: Object })
defineEmits(['like', 'delete'])

const showComment = ref(false)
const previewImage = ref(null)

const isOwner = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.id === props.post.userId
})

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return d.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.post-card { margin-bottom: 16px; }

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.post-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.post-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}
.post-avatar-placeholder { font-size: 28px; }
.post-nickname {
  font-weight: 700;
  font-size: 15px;
  color: #333;
}
.post-time { font-size: 13px; color: #aaa; }

.post-content {
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
}

.post-actions {
  display: flex;
  gap: 4px;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border: none;
  background: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.2s;
  font-family: inherit;
}
.action-btn:hover { background: #f5f5f5; }
.action-btn.liked { color: #e0245e; }
.action-icon { font-size: 16px; }
.delete-btn:hover { background: #fef1f5; color: #e0245e; }

.image-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
}
.image-preview {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}
</style>
