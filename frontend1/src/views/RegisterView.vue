<template>
  <div class="auth-page">
    <div class="card auth-card">
      <h2 class="auth-title">注册 Weibo</h2>

      <div class="input-group">
        <label>用户名</label>
        <input v-model="form.username" type="text" placeholder="3-20个字符" />
      </div>
      <div class="input-group">
        <label>昵称</label>
        <input v-model="form.nickname" type="text" placeholder="输入你的昵称" />
      </div>
      <div class="input-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="至少6位密码" />
      </div>

      <button class="btn btn-primary auth-btn" :disabled="loading" @click="submit">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <p class="auth-switch">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>

    <div v-if="toast" class="toast" :class="'toast-' + toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api'

const router = useRouter()
const form = reactive({ username: '', nickname: '', password: '' })
const loading = ref(false)
const toast = ref(null)

const showToast = (msg, type = 'error') => {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2000)
}

const submit = async () => {
  if (!form.username || !form.nickname || !form.password) { showToast('请填写完整信息'); return }
  if (form.username.length < 3) { showToast('用户名至少3个字符'); return }
  if (form.password.length < 6) { showToast('密码至少6位'); return }
  loading.value = true
  try {
    const res = await register(form)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    showToast('注册成功', 'success')
    router.push('/')
  } catch (err) {
    showToast(err.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}
.auth-card { width: 400px; padding: 36px; }
.auth-title { text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 28px; }
.auth-btn { width: 100%; padding: 14px; font-size: 16px; margin-top: 8px; }
.auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: #888; }
.auth-switch a { color: #1d9bf0; font-weight: 600; }
</style>
