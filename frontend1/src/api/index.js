import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return Promise.reject(err)
  }
)

// Auth
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)

// Posts
export const getPosts = (page = 1, size = 10) => api.get('/posts', { params: { page, size } })
export const getPost = (id) => api.get(`/posts/${id}`)
export const createPost = (data) => api.post('/posts', data)
export const deletePost = (id) => api.delete(`/posts/${id}`)
export const toggleLike = (id) => api.post(`/posts/${id}/like`)

// Comments
export const getComments = (postId) => api.get(`/posts/${postId}/comments`)
export const createComment = (postId, content) => api.post(`/posts/${postId}/comments`, { content })
export const deleteComment = (id) => api.delete(`/comments/${id}`)

// Users
export const getMe = () => api.get('/users/me')
export const getUserProfile = (id) => api.get(`/users/${id}`)
export const updateProfile = (data) => api.put('/users/me', data)

// Upload
export const uploadImage = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export default api
