# EditProfile 页面问题修复指南

## 问题1：头像点击不能更新

### 根本原因

在 `EditProfile.vue` 中的 `uploadAvatar` 函数只做了以下操作：

```vue
// 当前实现（有问题） formData.value.avatar_url = compressedBase64 // 只保存
Base64，没有上传到服务器 toast.success('头像上传成功，请点击保存')
```

### 解决方案

**步骤1：修改 `uploadAvatar` 函数**

```vue
<script setup>
import { uploadApi } from '@/api/upload'

// 上传头像
const uploadAvatar = async () => {
  console.log('uploadAvatar 函数被调用');
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]

    if (file) {
      try {
        // 验证文件大小（最大5MB）
        if (file.size > 5 * 1024 * 1024) {
          toast.error('图片大小不能超过5MB')
          return
        }

        toast.info('正在上传头像...')

        // 直接上传到服务器，而不是转换为 Base64
        const response = await uploadApi.uploadAvatar(file)

        // 获取服务器返回的 URL
        formData.value.avatar_url = response.data.avatar_url

        toast.success('头像上传成功，请点击保存')
      } catch (error) {
        console.error('上传头像失败:', error)
        toast.error('上传失败，请重试')
      }
    }
  }

  input.click()
}
</script>
```

**步骤2：修改 `saveProfile` 函数**

确保保存时使用正确的字段名：

```vue
const saveProfile = async () => { try { // 验证必填字段 if (!formData.value.nickname) {
toast.error('昵称不能为空') return } // 构建更新数据 const updateData = { nickname:
formData.value.nickname, gender: formData.value.gender, age: formData.value.age, bio:
formData.value.bio, avatar_url: formData.value.avatar_url, // 使用上传后的 URL province:
formData.value.province, city: formData.value.city, region: formData.value.region, preferences:
formData.value.preferences || [] } // 调用 API 保存 await userStore.updateUserProfile(updateData)
toast.success('资料更新成功') router.back() } catch (error: any) { console.error('保存资料失败:',
error) toast.error(error.message || '保存失败，请重试') } }
```

---

## 问题2：选择的地区没有显示出来

### 根本原因

地区数据可能存在以下问题：

1. 页面初始化时没有正确加载用户已选的地区
2. 选择地区后没有正确更新到 `formData`
3. 地区字段可能存储格式不统一

### 解决方案

**步骤1：修改页面初始化逻辑**

```vue
<script setup>
import { onMounted, computed } from 'vue'

// 初始化表单数据
const initFormData = () => {
  if (currentUser.value) {
    formData.value = {
      nickname: currentUser.value.nickname || '',
      gender: currentUser.value.gender || 'other',
      age: currentUser.value.age || undefined,
      bio: currentUser.value.bio || '',
      avatar_url: currentUser.value.avatarUrl || '',
      province: currentUser.value.province || '',      // ✅ 正确初始化
      city: currentUser.value.city || '',               // ✅ 正确初始化
      region: currentUser.value.region || '',           // ✅ 正确初始化
      preferences: parsePreferences(currentUser.value.preferences) || []
    }

    // 获取城市列表（当已有省份时）
    if (formData.value.province) {
      const cities = getCitiesByProvince(formData.value.province)
      availableCities.value = cities
    }
  }
}

// 解析偏好数据
const parsePreferences = (prefs: any) => {
  if (!prefs) return []
  if (Array.isArray(prefs)) {
    return prefs.map(p =>
      typeof p === 'string' ? p : p.preference_value
    )
  }
  return []
}

onMounted(() => {
  initFormData()
})
</script>
```

**步骤2：正确处理地区选择变化**

```vue
<script setup>
// 省份变化时
const handleProvinceChange = () => {
  // 重置城市和地区
  formData.value.city = ''
  formData.value.region = ''

  // 更新可用城市列表
  if (formData.value.province) {
    availableCities.value = getCitiesByProvince(formData.value.province)
  } else {
    availableCities.value = []
  }
}

// 城市变化时
const handleCityChange = () => {
  // 重置地区
  formData.value.region = ''

  // 可以在这里加载该城市的地区列表
  if (formData.value.city && formData.value.province) {
    // 如果有地区列表 API
    availableRegions.value = getRegionsByCity(formData.value.province, formData.value.city)
  }
}

// 地区变化时
const handleRegionChange = () => {
  // 地区已自动更新到 formData.value.region
  console.log('选择的地区:', formData.value.region)
}
</script>
```

**步骤3：修改 HTML 模板中的地区选择器**

```vue
<template>
  <!-- 省份选择 -->
  <select
    v-model="formData.province"
    @change="handleProvinceChange"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">选择省份</option>
    <option v-for="province in allProvinces" :key="province" :value="province">
      {{ province }}
    </option>
  </select>

  <!-- 城市选择 -->
  <select
    v-model="formData.city"
    @change="handleCityChange"
    :disabled="!formData.province"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">选择城市</option>
    <option v-for="city in availableCities" :key="city" :value="city">
      {{ city }}
    </option>
  </select>

  <!-- 地区选择 -->
  <select
    v-model="formData.region"
    @change="handleRegionChange"
    :disabled="!formData.city"
    class="w-full px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">选择地区</option>
    <option v-for="region in availableRegions" :key="region" :value="region">
      {{ region }}
    </option>
  </select>
</template>
```

---

## 问题3：提交时确保正确发送

### 后端 API 应该接收的格式

```typescript
// UserController.updateProfile 应该接收
{
  nickname: string,
  gender: 'male' | 'female' | 'other',
  age?: number,
  bio?: string,
  avatar_url?: string,
  province?: string,
  city?: string,
  region?: string,
  preferences?: string[]
}
```

### 确保前端发送正确的数据

```vue
const saveProfile = async () => { try { // 确保数据格式正确 const updateData = { nickname:
formData.value.nickname?.trim(), gender: formData.value.gender, age: formData.value.age ?
parseInt(formData.value.age) : undefined, bio: formData.value.bio?.trim(), avatar_url:
formData.value.avatar_url, province: formData.value.province, city: formData.value.city, region:
formData.value.region, preferences: formData.value.preferences } // 移除 undefined 字段
Object.keys(updateData).forEach( key => updateData[key] === undefined && delete updateData[key] )
console.log('发送的数据:', updateData) // 调用 API const response = await
userStore.updateUserProfile(updateData) toast.success('资料更新成功') router.back() } catch (error:
any) { console.error('保存资料失败:', error) toast.error(error.message || '保存失败，请重试') } }
```

---

## 调试步骤

1. **打开浏览器开发者工具 (F12)**

2. **检查网络请求：**
   - 点击头像时，看看是否有上传请求
   - 保存资料时，看看发送的数据是否包含 `province`, `city`, `region`

3. **检查控制台日志：**

   ```
   console.log('选择的地区:', formData.value.region)
   console.log('发送的数据:', updateData)
   ```

4. **检查存储的值：**
   在浏览器应用 > 本地存储中查看 Pinia store 是否正确保存了地区信息

---

## 总结

| 问题       | 原因                        | 解决方案                                             |
| ---------- | --------------------------- | ---------------------------------------------------- |
| 头像不更新 | 只保存 Base64，未上传服务器 | 使用 `uploadApi.uploadAvatar()` 上传到服务器         |
| 地区不显示 | 初始化或更新逻辑错误        | 在 `onMounted` 中正确初始化，选择时正确更新 formData |
| 地区不保存 | 字段名不匹配或未发送        | 确保发送 `province`, `city`, `region` 字段           |
