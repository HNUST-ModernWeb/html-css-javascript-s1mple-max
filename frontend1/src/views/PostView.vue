<template>
  <div class="post-page">
    <h2 class="page-title">发布微博</h2>
    <div class="card">
      <div class="input-group">
        <textarea v-model="content" placeholder="分享新鲜事..." maxlength="2000"></textarea>
      </div>
      <div class="char-count">{{ content.length }}/2000</div>

      <ImageUpload v-model="image" />

      <button class="btn btn-primary btn-publish" :disabled="!content.trim() || publishing" @click="publish">
        {{ publishing ? '发布中...' : '发布' }}
      </button>
    </div>

    <div v-if="toast" class="toast" :class="'toast-' + toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPost } from '../api'
import ImageUpload from '../components/ImageUpload.vue'

const router = useRouter()
const content = ref('')
const image = ref('')
const publishing = ref(false)
const toast = ref(null)

const showToast = (msg, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2000)
}

const publish = async () => {
  if (!content.value.trim()) return
  publishing.value = true
  try {
    await createPost({ content: content.value.trim(), image: image.value })
    showToast('发布成功')
    setTimeout(() => router.push('/'), 800)
  } catch {
    showToast('发布失败', 'error')
  } finally {
    publishing.value = false
  }
}
</script>

<style scoped>
.page-title { font-size: 22px; font-weight: 800; margin-bottom: 20px; }
.char-count { text-align: right; font-size: 13px; color: #aaa; margin: -8px 0 16px; }
.btn-publish { width: 100%; margin-top: 20px; padding: 14px; font-size: 16px; }
</style>
