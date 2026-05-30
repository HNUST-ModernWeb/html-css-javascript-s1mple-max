<template>
  <div class="profile">
    <div v-if="loading" class="loading"><div class="spinner"></div></div>

    <template v-else-if="profile">
      <div class="card profile-header">
        <div class="profile-top">
          <span class="profile-avatar-lg">{{ profile.nickname?.charAt(0) }}</span>
          <div class="profile-info">
            <h2 class="profile-name">{{ profile.nickname }}</h2>
            <p class="profile-username">@{{ profile.username }}</p>
            <p class="profile-bio">{{ profile.bio || '这个人很懒，什么都没写...' }}</p>
          </div>
        </div>

        <div v-if="isOwner" class="edit-section">
          <button class="btn btn-outline" @click="editing = !editing">{{ editing ? '取消' : '编辑资料' }}</button>
          <div v-if="editing" class="edit-form">
            <div class="input-group">
              <label>昵称</label>
              <input v-model="editForm.nickname" placeholder="输入新昵称" />
            </div>
            <div class="input-group">
              <label>个人简介</label>
              <textarea v-model="editForm.bio" placeholder="写一句简介..." maxlength="200"></textarea>
            </div>
            <button class="btn btn-primary" :disabled="editingSaving" @click="saveProfile">
              {{ editingSaving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <h3 class="section-title">Ta 的微博</h3>

      <PostCard
        v-for="post in profile.posts || []"
        :key="post.id"
        :post="post"
        @like="handleLike"
        @delete="handleDelete"
      />

      <div v-if="(profile.posts || []).length === 0" class="empty">暂无微博</div>
    </template>

    <div v-if="toast" class="toast" :class="'toast-' + toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUserProfile, updateProfile, toggleLike, deletePost } from '../api'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const profile = ref(null)
const loading = ref(true)
const editing = ref(false)
const editingSaving = ref(false)
const editForm = reactive({ nickname: '', bio: '' })
const toast = ref(null)

const isOwner = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.id && profile.value && user.id === profile.value.id
})

const showToast = (msg, type = 'success') => {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2000)
}

const fetchProfile = async () => {
  loading.value = true
  try {
    const res = await getUserProfile(route.params.id)
    profile.value = res.data
    editForm.nickname = profile.value.nickname
    editForm.bio = profile.value.bio || ''
  } catch { showToast('加载失败', 'error') }
  finally { loading.value = false }
}

const saveProfile = async () => {
  editingSaving.value = true
  try {
    const res = await updateProfile({ nickname: editForm.nickname, bio: editForm.bio })
    profile.value = { ...profile.value, ...res.data }
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    user.nickname = res.data.nickname
    user.bio = res.data.bio
    localStorage.setItem('user', JSON.stringify(user))
    editing.value = false
    showToast('保存成功')
  } catch { showToast('保存失败', 'error') }
  finally { editingSaving.value = false }
}

const handleLike = async (postId) => {
  if (!localStorage.getItem('token')) { showToast('请先登录', 'error'); return }
  try {
    const res = await toggleLike(postId)
    const post = (profile.value.posts || []).find(p => p.id === postId)
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
    profile.value.posts = profile.value.posts.filter(p => p.id !== postId)
    showToast('删除成功')
  } catch { showToast('删除失败', 'error') }
}

onMounted(fetchProfile)
</script>

<style scoped>
.profile-header { margin-bottom: 24px; }
.profile-top { display: flex; gap: 20px; align-items: flex-start; }
.profile-avatar-lg {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1d9bf0, #764ba2);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  flex-shrink: 0;
}
.profile-info { flex: 1; }
.profile-name { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
.profile-username { font-size: 14px; color: #999; margin-bottom: 8px; }
.profile-bio { font-size: 14px; color: #666; line-height: 1.6; }
.edit-section { margin-top: 16px; }
.edit-form { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
.edit-form .input-group textarea { min-height: 80px; }
.section-title { font-size: 18px; font-weight: 700; margin: 24px 0 16px; }
</style>
