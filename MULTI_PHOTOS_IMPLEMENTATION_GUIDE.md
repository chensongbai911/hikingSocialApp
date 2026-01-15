# 多照片功能测试指南

## 完成的功能

### 1. 后端改动

- ✅ 创建 `activity_photos` 表（已执行）
- ✅ 新增 `ActivityPhoto` 模型
- ✅ `ActivityService` 添加照片处理方法：
  - `saveActivityPhotos()` - 保存最多 6 张照片
  - `getActivityPhotos()` - 获取活动照片数组
  - `generatePhotoId()` - 生成照片 ID
- ✅ `createActivity` 支持 `photos` 数组
- ✅ `updateActivity` 支持 `photos` 数组
- ✅ `getActivityById` 返回 `photos` 数组
- ✅ `ActivityController` 验证照片数量（最多 6 张）

### 2. 前端改动

- ✅ `Activity` 接口添加 `photos?: string[]`
- ✅ `CreateActivityData` 添加 `photos?: string[]`
- ✅ `UpdateActivityData` 添加 `photos?: string[]`
- ✅ `CreateActivity.vue` - `loadActivityData()` 加载多照片
- ✅ `CreateActivity.vue` - `handleSubmit()` 发送照片数组
- ✅ 照片上传 UI 支持 6 张（已有）

## 数据库表结构

```sql
CREATE TABLE activity_photos (
  id VARCHAR(36) PRIMARY KEY,
  activity_id VARCHAR(36) NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);
```

## API 接口变更

### POST /api/v1/activities

**请求体新增字段**:

```json
{
  "title": "活动标题",
  "location": "地点",
  "start_time": "2024-06-01T09:00:00",
  "difficulty": "moderate",
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg",
    "https://example.com/photo3.jpg"
  ]
}
```

### PUT /api/v1/activities/:id

**请求体新增字段**:

```json
{
  "photos": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
}
```

### GET /api/v1/activities/:id

**响应新增字段**:

```json
{
  "id": "act-001",
  "title": "活动标题",
  "cover_image_url": "https://example.com/photo1.jpg",
  "photos": [
    "https://example.com/photo1.jpg",
    "https://example.com/photo2.jpg",
    "https://example.com/photo3.jpg"
  ]
}
```

## 测试步骤

### 前置条件

1. 数据库表 `activity_photos` 已创建 ✅
2. 后端服务需要重新编译部署

### 场景 1：创建活动上传 6 张照片

1. 打开 `/create-activity` 页面
2. 填写活动信息
3. 依次上传 6 张照片
4. 验证：
   - ✅ 第 1 张标记为"封面"
   - ✅ 第 6 张上传后，上传按钮消失
   - ✅ 可以删除任意照片
5. 点击"发布活动"
6. 检查请求体是否包含 `photos` 数组（6 个 URL）

### 场景 2：编辑活动查看照片

1. 进入"我的徒步" -> "我创建的"
2. 点击某个活动的"编辑"按钮
3. 验证：
   - ✅ 照片区域显示所有已上传照片（而不是只有 1 张封面）
   - ✅ 照片数量正确（例如：3/6 张）
   - ✅ 第一张照片标记为"封面"

### 场景 3：修改活动照片

1. 在编辑页面删除 1-2 张照片
2. 上传新照片补充
3. 点击"保存修改"
4. 验证：
   - ✅ 更新请求包含完整的 `photos` 数组
   - ✅ 返回活动详情后重新进入编辑，照片正确

### 场景 4：活动详情页显示

1. 查看活动详情页
2. 验证：
   - ✅ 封面图显示第一张照片
   - ✅ （如果详情页支持）可以查看所有照片

## 已知限制

1. **后端编译错误**：现有代码有 42 个 TypeScript 错误，需要修复后才能编译
2. **前端测试受限**：需要后端服务运行才能完整测试
3. **ActivityDetail.vue**：暂未添加多照片展示（仅显示封面）

## 下一步行动

### 立即可做（不依赖后端）

- [ ] 修复后端 TypeScript 编译错误
- [ ] 在 ActivityDetail.vue 添加照片轮播/画廊

### 需要后端运行

- [ ] 启动后端服务
- [ ] 使用 Postman 测试 API
- [ ] 前端完整测试流程

### 可选增强

- [ ] 照片压缩（前端上传前）
- [ ] 照片拖拽排序
- [ ] 照片预览大图
- [ ] 活动列表卡片显示多照片（轮播）

## 兼容性说明

- **向后兼容**：旧活动只有 `cover_image_url`，前端会兼容处理
- **数据迁移**：现有活动的封面图可选择性迁移到 `activity_photos` 表
  ```sql
  INSERT INTO activity_photos (id, activity_id, photo_url, is_cover, sort_order)
  SELECT CONCAT(id, '-cover'), id, cover_image_url, TRUE, 0
  FROM activities WHERE cover_image_url IS NOT NULL;
  ```

## 文件清单

### 新增文件

- `backend/src/database/add_activity_photos.sql` - 数据库迁移脚本
- `backend/src/models/ActivityPhoto.ts` - 照片模型

### 修改文件

- `backend/src/services/ActivityService.ts` - 照片处理逻辑
- `backend/src/controllers/ActivityController.ts` - API 验证
- `frontend/src/types/index.ts` - 类型定义
- `frontend/src/components/pages/CreateActivity.vue` - 照片加载和提交

## 代码关键点

### 后端 - 保存照片

```typescript
private async saveActivityPhotos(activityId: string, photos: string[]): Promise<void> {
  if (!photos || photos.length === 0) return;

  // 删除旧照片
  await pool.query('DELETE FROM activity_photos WHERE activity_id = ?', [activityId]);

  // 插入新照片（最多6张）
  for (let i = 0; i < photos.length && i < 6; i++) {
    const photoId = await this.generatePhotoId();
    await pool.query(
      `INSERT INTO activity_photos (id, activity_id, photo_url, is_cover, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [photoId, activityId, photos[i], i === 0, i]
    );
  }
}
```

### 前端 - 加载照片

```typescript
// 加载照片数组（如果有多张）
if (activity.photos && activity.photos.length > 0) {
  uploadedPhotos.value = activity.photos
} else if (activity.cover_image_url) {
  // 兼容旧数据，只有封面图的情况
  uploadedPhotos.value = [activity.cover_image_url]
}
```

### 前端 - 提交照片

```typescript
const activityData: CreateActivityData = {
  title: form.value.title,
  location: form.value.destination,
  start_time: startTime,
  difficulty: form.value.difficulty,
  photos, // 照片数组（最多6张）
}
```

## 总结

✅ 后端逻辑已完成（需修复编译错误）
✅ 前端逻辑已完成
✅ 数据库表已创建
⏳ 等待后端编译通过后进行完整测试

---

**创建时间**: 2024 年
**完成度**: 90%（代码完成，待测试验证）
