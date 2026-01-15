# 照片上传和删除功能修复说明

## 问题描述
1. 照片上传后无法展示
2. 缺少照片删除功能

## 已修复的问题

### 1. 数据库字段长度问题
**问题**: `photo_url` 字段为 `VARCHAR(500)`，无法存储 base64 编码的图片
**解决**: 
- 创建了 SQL 迁移脚本 `backend/src/database/fix_photo_url_column.sql`
- 将所有图片相关字段改为 `LONGTEXT` 类型
- 包括: `user_photos.photo_url`, `users.avatar_url`, `activities.cover_image_url`, `messages.image_url`, `messages.file_url`

### 2. 前端照片展示问题
**问题**: Profile 页面只展示照片 URL，没有展示照片 ID
**解决**:
- 修改 `frontend/src/components/pages/Profile.vue`
- 更新 `userProfile` computed 属性，返回包含 `id` 和 `photo_url` 的对象数组
- 在模板中使用 `photo.id` 作为 key，`photo.photo_url` 作为图片源

### 3. 照片删除功能
**新增功能**:
- 在 Profile 页面的照片网格中添加删除按钮
- 删除按钮在鼠标悬停时显示（使用 group-hover）
- 添加 `deletePhoto` 方法到 `frontend/src/stores/user.ts`
- 删除前显示确认对话框
- 删除后自动刷新用户资料

### 4. 照片数量限制显示
**新增功能**:
- 在"生活相册"标题旁显示当前照片数量 (例如: 3/9)
- 当照片数量达到 9 张时，隐藏"添加照片"按钮

## 使用说明

### 1. 运行数据库迁移
```bash
# 方法1: 使用 PowerShell 脚本
.\fix-photo-url.ps1

# 方法2: 直接使用 MySQL 命令
Get-Content backend\src\database\fix_photo_url_column.sql | mysql -u root -p hiking_app
```

### 2. 重启前后端服务
```bash
# 重启后端
cd backend
npm run dev

# 重启前端
cd frontend
npm run dev
```

### 3. 测试功能
1. 登录应用
2. 进入个人资料页面
3. 点击"添加照片"按钮上传图片
4. 上传成功后，照片应该立即显示在相册中
5. 鼠标悬停在照片上，应该看到右上角的删除按钮
6. 点击删除按钮，确认后照片应该被删除

## 技术细节

### 照片数据结构
```typescript
interface UserPhoto {
  id: string;          // 照片ID，格式: photo-001
  photo_url: string;   // 照片URL或Base64数据
  sort_order: number;  // 排序顺序
  created_at: string;  // 创建时间
}
```

### API 端点
- **上传照片**: `POST /api/v1/users/photos`
  - Body: `{ photo_url: string }`
  - 返回: `{ code: 200, data: UserPhoto }`

- **删除照片**: `DELETE /api/v1/users/photos/:photoId`
  - 返回: `{ code: 200, message: "删除照片成功" }`

- **获取照片列表**: `GET /api/v1/users/photos`
  - 返回: `{ code: 200, data: UserPhoto[] }`

### 前端组件更新
1. **Profile.vue**
   - 添加照片删除按钮（带悬停效果）
   - 添加照片数量显示
   - 添加 `deletePhoto` 方法
   - 添加 `previewPhoto` 方法（待实现）

2. **user.ts (Store)**
   - 添加 `deletePhoto` action
   - 删除后自动刷新用户数据

3. **imageUpload.ts**
   - `uploadPhoto`: 单张照片上传
   - `uploadPhotos`: 批量照片上传
   - `compressImage`: 图片压缩

## 注意事项

1. **Base64 存储**
   - 当前使用 Base64 格式存储图片
   - 优点: 实现简单，无需文件服务器
   - 缺点: 数据库体积较大
   - 建议: 生产环境考虑使用 OSS（如阿里云 OSS、AWS S3）

2. **照片数量限制**
   - 最多 9 张照片
   - 前端和后端都有验证

3. **图片压缩**
   - 上传前自动压缩到 1200x1200
   - 质量设置为 0.8
   - 可根据需求调整参数

4. **性能优化建议**
   - 考虑添加图片懒加载
   - 考虑生成缩略图
   - 考虑使用 CDN 加速

## 后续改进建议

1. **照片预览功能**
   - 点击照片可以全屏预览
   - 支持左右滑动切换
   - 支持缩放

2. **照片排序**
   - 支持拖拽调整照片顺序
   - 更新 `sort_order` 字段

3. **批量删除**
   - 支持选择多张照片批量删除

4. **照片编辑**
   - 裁剪、旋转、滤镜等

5. **文件上传优化**
   - 使用真实的文件上传（FormData）
   - 集成 OSS 服务
   - 添加上传进度显示
