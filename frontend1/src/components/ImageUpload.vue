<template>
  <div class="image-upload">
    <div v-if="!preview && !imageUrl" class="upload-zone" @click="trigger">
      <span class="upload-icon">📷</span>
      <span class="upload-text">点击上传图片</span>
    </div>

    <div v-else class="preview-wrapper">
      <img :src="preview || imageUrl" class="preview-img" />
      <button class="remove-btn" @click="remove">✕</button>
    </div>

    <input ref="fileInput" type="file" accept="image/*" @change="handleFile" hidden />
    <div v-if="uploading" class="upload-progress">上传中...</div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { uploadImage } from '../api'

const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const preview = ref(null)
const imageUrl = ref(props.modelValue || '')
const uploading = ref(false)

watch(() => props.modelValue, v => { imageUrl.value = v || '' })

const trigger = () => fileInput.value?.click()

const handleFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  preview.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    const res = await uploadImage(file)
    imageUrl.value = res.data.url
    emit('update:modelValue', res.data.url)
  } catch {}
  finally { uploading.value = false }
}

const remove = () => {
  preview.value = null
  imageUrl.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) fileInput.value.value = ''
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-zone:hover { border-color: #1d9bf0; background: #f8fbff; }
.upload-icon { font-size: 32px; display: block; margin-bottom: 8px; }
.upload-text { font-size: 14px; color: #999; }
.preview-wrapper { position: relative; display: inline-block; }
.preview-img { max-width: 200px; max-height: 200px; border-radius: 10px; object-fit: cover; }
.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #e0245e;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-progress { font-size: 13px; color: #1d9bf0; margin-top: 8px; }
</style>
