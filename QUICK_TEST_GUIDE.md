# 快速测试指南

## 测试前准备

1. **确保服务运行**

   ```bash
   # 后端 (端口 3000)
   cd backend && npm run dev

   # 前端 (端口 5173)
   cd frontend && npm run dev
   ```

2. **数据库修复已执行**
   ```bash
   cd backend
   mysql -u root -proot hiking_app < src/database/fix_preferences.sql
   ```

## 测试流程

### 1️⃣ 用户偏好功能

**测试目标**：验证偏好标签的保存和显示

1. 访问 http://localhost:5173/edit-profile
2. 滚动到"徒步偏好"区域
3. 点击推荐标签：周末出发、高海拔、5-10km
4. 或手动输入自定义标签
5. 点击右上角"保存"按钮
6. 等待成功提示
7. 返回 http://localhost:5173/profile
8. ✅ 验证：偏好标签显示在"我的徒步偏好"区域

**预期结果**：

- 保存成功无报错
- 个人主页正确显示所有标签
- 再次编辑时标签被正确加载

---

### 2️⃣ 头像上传功能

**测试目标**：验证头像上传、压缩和保存

1. 访问 http://localhost:5173/edit-profile
2. 点击头像右下角的相机图标
3. 选择一张图片（建议 < 5MB）
4. 等待"头像上传成功，请点击保存"提示
5. 查看头像预览是否更新
6. 点击"保存"按钮
7. 返回个人主页
8. ✅ 验证：头像已更新

**预期结果**：

- 图片上传成功
- 图片被压缩到 400x400
- 头像在所有页面一致显示

**错误情况测试**：

- 上传 > 5MB 的图片 → 应提示"图片大小不能超过 5MB"

---

### 3️⃣ 生活相册上传

**测试目标**：验证多图片上传功能

1. 访问 http://localhost:5173/profile
2. 滚动到"生活相册"区域
3. 点击"添加照片"按钮（虚线框）
4. 选择 1-3 张图片（可按住 Ctrl 多选）
5. 等待上传完成提示
6. 刷新页面
7. ✅ 验证：照片显示在相册中

**预期结果**：

- 支持批量上传
- 图片被压缩到 1200x1200
- 照片按顺序排列
- 最多显示 9 张照片

**边界测试**：

- 已有 8 张照片，再上传 2 张 → 应提示"最多只能上传 9 张照片"

---

### 4️⃣ 活动发布功能

**测试目标**：验证活动创建和封面图

#### 测试 A：带封面图发布

1. 访问 http://localhost:5173/create-activity
2. 填写活动信息：
   - 活动名称：武功山徒步
   - 目的地：麻田镇
   - 日期：2026-01-27
   - 时间：08:00
   - 集合地点：奥林匹克森林公园南门
   - 难度：中等
   - 人数：4
3. 上传 1-2 张照片
4. 点击"发布活动"
5. ✅ 验证：
   - 自动跳转到"我的徒步"页
   - "我发布的"标签页已激活
   - 新活动显示在列表顶部
   - 封面图显示为上传的第一张图

#### 测试 B：无封面图发布

1. 重复上述步骤，但**不上传照片**
2. 直接点击"发布活动"
3. ✅ 验证：
   - 发布成功
   - 封面图显示为默认图片（徒步风景图）

**预期结果**：

- 字段验证正确（difficulty: 'easy'/'moderate'/'hard'）
- 自动计算结束时间（开始时间 + 4 小时）
- 创建成功后跳转到"我的徒步"页
- 封面图逻辑：有上传图 → 用第一张；无上传图 → 用默认图

---

## API 测试（可选）

使用 curl 或 Postman 测试：

### 更新用户偏好

```bash
curl -X PUT http://localhost:3000/api/v1/users/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": [
      { "type": "hiking_preference", "value": "周末出发" },
      { "type": "hiking_preference", "value": "5-10km" }
    ]
  }'
```

预期响应：`{ "code": 200, "message": "更新用户偏好成功" }`

### 创建活动

```bash
curl -X POST http://localhost:3000/api/v1/activities \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "武功山徒步",
    "description": "武功山徒步 - 欢迎加入!",
    "location": "麻田镇",
    "start_time": "2026-01-27T08:00:00",
    "end_time": "2026-01-27T12:00:00",
    "difficulty": "moderate",
    "max_participants": 4,
    "cover_image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306"
  }'
```

预期响应：`{ "code": 201, "data": { "id": "...", ... } }`

---

## 问题排查

### 问题 1：偏好保存失败

**错误信息**：`Data truncated for column 'preference_type'`

**解决**：

```bash
cd backend
mysql -u root -proot hiking_app < src/database/fix_preferences.sql
```

### 问题 2：图片上传失败

**可能原因**：

- 文件太大（>5MB）
- 网络问题
- Base64 转换失败

**排查**：

1. 打开浏览器控制台查看错误
2. 检查 Network 标签的请求详情
3. 尝试更小的图片

### 问题 3：活动发布失败

**错误信息**：`difficulty值必须是easy、moderate或hard`

**解决**：已修复，确保前端发送正确字段名

---

## 测试检查清单

- [ ] 用户偏好保存成功
- [ ] 用户偏好在个人主页正确显示
- [ ] 头像上传成功
- [ ] 头像在个人主页显示
- [ ] 生活相册上传成功（多张）
- [ ] 相册照片正确显示
- [ ] 活动发布成功（带封面图）
- [ ] 活动发布成功（无封面图，使用默认）
- [ ] 活动封面图正确显示
- [ ] 所有功能无控制台错误

---

## 测试完成

所有测试通过后，功能已完全可用！🎉
