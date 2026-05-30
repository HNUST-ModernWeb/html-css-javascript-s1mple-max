<template>
  <div class="home">
    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <template v-else>
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @like="handleLike"
        @delete="handleDelete"
      />

      <div v-if="posts.length === 0" class="empty">
        还没有微博，快来发布第一条吧！
      </div>

      <div v-if="hasMore && posts.length > 0" class="load-more">
        <button class="btn btn-outline" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </template>

    <div v-if="toast" class="toast" :class="'toast-' + toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPosts, toggleLike, deletePost } from '../api'
import PostCard from '../components/PostCard.vue'

const posts = ref([])
const page = ref(1)
const hasMore = ref(true)
const loading = ref(true)
const loadingMore = ref(false)
const toast = ref(null)

const showToast = (msg, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2000)
}

const fetchPosts = async (append = false) => {
  try {
    const res = await getPosts(page.value)
    const data = res.data || []
    if (append) posts.value.push(...data)
    else posts.value = data
    hasMore.value = data.length === 10
  } catch {
    showToast('加载失败', 'error')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = () => {
  page.value++
  loadingMore.value = true
  fetchPosts(true)
}

const handleLike = async (postId) => {
  if (!localStorage.getItem('token')) { showToast('请先登录', 'error'); return }
  try {
    const res = await toggleLike(postId)
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.liked = res.data.liked
      post.likeCount += res.data.liked ? 1 : -1
    }
  } catch { showToast('操作失败', 'error') }
}

const handleDelete = async (postId) => {
  if (!confirm('确定删除这条微博？')) return
  try {
    await deletePost(postId)
    posts.value = posts.value.filter(p => p.id !== postId)
    showToast('删除成功')
  } catch { showToast('删除失败', 'error') }
}

onMounted(() => fetchPosts())
</script>

<style scoped>
.home { padding-bottom: 40px; }
.load-more { text-align: center; margin-top: 24px; }
</style>
