<template>
  <div class="auth-page">
    <div class="card auth-card">
      <h2 class="auth-title">登录 Weibo</h2>

      <div class="input-group">
        <label>用户名</label>
        <input v-model="form.username" type="text" placeholder="请输入用户名" />
      </div>
      <div class="input-group">
        <label>密码</label>
        <input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="submit" />
      </div>

      <button class="btn btn-primary auth-btn" :disabled="loading" @click="submit">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <p class="auth-switch">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>

    <div v-if="toast" class="toast" :class="'toast-' + toast.type">{{ toast.msg }}</div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../api'

const router = useRouter()
const form = reactive({ username: '', password: '' })
const loading = ref(false)
const toast = ref(null)

const showToast = (msg, type = 'error') => {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 2000)
}

const submit = async () => {
  if (!form.username || !form.password) { showToast('请填写完整信息'); return }
  loading.value = true
  try {
    const res = await login(form)
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    showToast('登录成功', 'success')
    router.push('/')
  } catch (err) {
    showToast(err.response?.data?.message || '登录失败')
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
