## 多照片功能测试步骤

### ✅ 环境准备完成

- 后端服务: http://localhost:3000 ✅
- 前端服务: http://localhost:5174 ✅
- 数据库表 `activity_photos` 已创建 ✅

---

## 测试场景 1: 创建活动上传多张照片

### 步骤：

1. 打开浏览器访问: http://localhost:5174
2. 登录账号（如果需要）
3. 点击底部导航 "+" 按钮，或进入 `/create-activity`
4. 填写活动信息：

   - 活动名称：测试多照片功能
   - 目的地：选择任意地点
   - 日期时间：选择未来日期
   - 难度等级：任选

5. **测试照片上传**：

   - 点击 "添加照片" 按钮
   - 上传第 1 张照片 → 验证：显示 "封面" 标记
   - 继续上传第 2、3、4、5、6 张照片
   - 验证：显示 "6/6 张"
   - 验证：上传按钮消失（已达上限）

6. **测试照片删除**：

   - 点击任意照片右上角的 ❌
   - 验证：照片被移除，显示 "5/6 张"
   - 验证：上传按钮重新出现

7. 点击 "发布活动"
8. 验证：跳转到 "我的徒步" 页面

### 预期结果：

- ✅ 可以上传最多 6 张照片
- ✅ 第一张照片显示 "封面" 标记
- ✅ 照片数量正确显示
- ✅ 可以删除单张照片
- ✅ 活动创建成功

### 后端检查：

打开新终端，执行：

```powershell
mysql -u root -psenbochen hiking_app -e "SELECT a.id, a.title, ap.photo_url, ap.is_cover, ap.sort_order FROM activities a LEFT JOIN activity_photos ap ON a.id = ap.activity_id WHERE a.title LIKE '%测试多照片%' ORDER BY a.id, ap.sort_order"
```

预期看到：

- 活动记录存在
- 有 6 条照片记录（如果上传了 6 张）
- 第一张照片 is_cover = 1, sort_order = 0
- 其他照片 is_cover = 0, sort_order = 1,2,3...

---

## 测试场景 2: 编辑活动查看照片

### 步骤：

1. 进入 "我的徒步" → "我创建的" 标签
2. 找到刚才创建的活动
3. 点击 "编辑" 按钮
4. **验证照片加载**：
   - 所有上传的照片应该正确显示
   - 照片数量正确（如 "6/6 张"）
   - 第一张照片显示 "封面" 标记

### 预期结果：

- ✅ 编辑模式正确加载所有照片
- ✅ 不是只加载封面图
- ✅ 照片顺序保持一致

---

## 测试场景 3: 修改活动照片

### 步骤：

1. 在编辑页面
2. 删除 2 张照片
3. 上传 3 张新照片
4. 验证：显示 "7/6 张" 不应该出现（最多 6 张）
5. 点击 "保存修改"

### 预期结果：

- ✅ 只能保存最多 6 张照片
- ✅ 更新成功后重新进入编辑，照片正确显示

### 后端检查：

```powershell
mysql -u root -psenbochen hiking_app -e "SELECT activity_id, photo_url, is_cover, sort_order FROM activity_photos WHERE activity_id = 'act-XXX' ORDER BY sort_order"
```

（替换 act-XXX 为实际活动 ID）

预期看到：

- 照片记录已更新
- 第一张照片仍然是封面
- 删除的旧照片不存在

---

## 测试场景 4: API 接口测试（可选）

使用 Postman 或 curl：

### 创建活动

```bash
curl -X POST http://localhost:3000/api/v1/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "API测试活动",
    "location": "测试地点",
    "start_time": "2024-06-01T09:00:00",
    "difficulty": "moderate",
    "photos": [
      "https://picsum.photos/800/600?random=1",
      "https://picsum.photos/800/600?random=2",
      "https://picsum.photos/800/600?random=3"
    ]
  }'
```

### 获取活动详情

```bash
curl http://localhost:3000/api/v1/activities/act-XXX \
  -H "Authorization: Bearer YOUR_TOKEN"
```

验证响应包含：

```json
{
  "id": "act-XXX",
  "title": "API测试活动",
  "cover_image_url": "https://picsum.photos/800/600?random=1",
  "photos": [
    "https://picsum.photos/800/600?random=1",
    "https://picsum.photos/800/600?random=2",
    "https://picsum.photos/800/600?random=3"
  ]
}
```

---

## 测试检查清单

### 前端功能

- [ ] 创建活动时可以上传多张照片
- [ ] 最多 6 张照片限制生效
- [ ] 第一张照片显示 "封面" 标记
- [ ] 可以删除单张照片
- [ ] 上传按钮在 6 张时隐藏
- [ ] 编辑模式正确加载所有照片
- [ ] 修改照片后保存成功

### 后端功能

- [ ] POST /api/v1/activities 支持 photos 数组
- [ ] PUT /api/v1/activities/:id 支持 photos 数组
- [ ] GET /api/v1/activities/:id 返回 photos 数组
- [ ] 照片数量验证（最多 6 张）
- [ ] activity_photos 表正确存储照片
- [ ] 第一张照片 is_cover = 1

### 数据库

- [ ] activity_photos 表存在
- [ ] 外键约束正常工作
- [ ] 删除活动时级联删除照片

---

## 常见问题排查

### 问题 1: 编辑模式照片不显示

**原因**: loadActivityData() 可能未正确加载 photos 数组
**检查**:

```typescript
// CreateActivity.vue 第607行左右
if (activity.photos && activity.photos.length > 0) {
  uploadedPhotos.value = activity.photos
}
```

### 问题 2: 照片数量超过 6 张

**原因**: 后端验证未生效
**检查**:

```typescript
// ActivityController.ts 第199行左右
if (photos !== undefined && Array.isArray(photos) && photos.length > 6) {
  return validationError(res, { photos: '最多只能上传6张照片' })
}
```

### 问题 3: 数据库外键错误

**原因**: activities 表不存在或活动 ID 不匹配
**解决**:

```sql
-- 检查外键约束
SHOW CREATE TABLE activity_photos;

-- 如果需要，临时禁用外键检查
SET FOREIGN_KEY_CHECKS = 0;
-- 执行操作
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 测试完成报告

测试完成后，请记录：

### ✅ 通过的测试

- [ ] 场景 1: 创建活动上传多张照片
- [ ] 场景 2: 编辑活动查看照片
- [ ] 场景 3: 修改活动照片
- [ ] 场景 4: API 接口测试

### ❌ 未通过的测试

（记录失败场景和错误信息）

### 📝 发现的问题

（记录 bug 和待优化项）

---

**测试开始时间**: ****\_\_\_****
**测试完成时间**: ****\_\_\_****
**测试人员**: ****\_\_\_****
