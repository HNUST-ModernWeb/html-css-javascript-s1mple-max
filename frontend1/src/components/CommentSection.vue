<template>
  <div class="comment-section">
    <div class="comment-input-row" v-if="token">
      <input v-model="content" placeholder="写评论..." @keyup.enter="submit" class="comment-input" />
      <button class="btn btn-primary comment-submit" :disabled="!content.trim() || submitting" @click="submit">
        发送
      </button>
    </div>

    <div v-if="loading" class="spinner" style="margin: 16px auto"></div>

    <div v-if="comments.length" class="comment-list">
      <div v-for="c in comments" :key="c.id" class="comment-item">
        <span class="comment-user">{{ c.nickname }}：</span>
        <span class="comment-content">{{ c.content }}</span>
        <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getComments, createComment } from '../api'

const props = defineProps({ postId: Number })

const token = localStorage.getItem('token')
const comments = ref([])
const content = ref('')
const loading = ref(false)
const submitting = ref(false)

onMounted(async () => {
  loading.value = true
  try { comments.value = (await getComments(props.postId)).data || [] }
  catch {} finally { loading.value = false }
})

const submit = async () => {
  if (!content.value.trim()) return
  submitting.value = true
  try {
    const res = await createComment(props.postId, content.value.trim())
    comments.value.push(res.data)
    content.value = ''
  } catch {}
  finally { submitting.value = false }
}

const formatTime = (t) => {
  if (!t) return ''
  const d = new Date(t)
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.comment-section {
  border-top: 1px solid #f0f0f0;
  margin-top: 12px;
  padding-top: 12px;
}
.comment-input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.comment-input {
  flex: 1;
  padding: 8px 14px;
  border: 1.5px solid #eee;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  font-family: inherit;
}
.comment-input:focus { border-color: #1d9bf0; }
.comment-submit { padding: 6px 18px; font-size: 13px; border-radius: 20px; }
.comment-list { display: flex; flex-direction: column; gap: 8px; }
.comment-item {
  padding: 8px 12px;
  background: #f9f9f9;
  border-radius: 10px;
  font-size: 14px;
}
.comment-user { font-weight: 700; color: #333; }
.comment-content { color: #555; }
.comment-time { font-size: 12px; color: #bbb; margin-left: 8px; }
</style>
