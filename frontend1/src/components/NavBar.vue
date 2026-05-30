<template>
  <nav class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="nav-brand">Weibo</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">首页</router-link>
        <template v-if="user">
          <router-link to="/post" class="nav-link">发布</router-link>
          <router-link :to="'/profile/' + user.id" class="nav-link nav-user">
            <img v-if="user.avatar" :src="user.avatar" class="nav-avatar" />
            <span v-else class="nav-avatar-placeholder">👤</span>
            <span>{{ user.nickname }}</span>
          </router-link>
          <button class="nav-link nav-logout" @click="logout">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">登录</router-link>
          <router-link to="/register" class="btn btn-primary nav-register-btn">注册</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)

const loadUser = () => {
  const u = localStorage.getItem('user')
  user.value = u ? JSON.parse(u) : null
}

onMounted(loadUser)
watch(() => router.currentRoute.value, loadUser)

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  user.value = null
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #eee;
  height: 56px;
}
.navbar-inner {
  max-width: 680px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}
.nav-brand {
  font-size: 22px;
  font-weight: 800;
  color: #1d9bf0;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link {
  padding: 8px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  border-radius: 20px;
  transition: all 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.nav-link:hover { background: #f0f0f0; color: #333; }
.nav-link.router-link-active { color: #1d9bf0; font-weight: 700; }
.nav-register-btn { padding: 6px 18px; font-size: 14px; }
.nav-user { display: flex; align-items: center; gap: 6px; }
.nav-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.nav-avatar-placeholder { font-size: 20px; }
.nav-logout { color: #e0245e; }
</style>
