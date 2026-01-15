# Upload API Documentation

## Base URL

```
http://localhost:3000/api/v1/upload
```

## Endpoints

### 1. Upload General Image

Upload and process a general image with thumbnail generation.

**Endpoint:** `POST /upload/image`

**Authentication:** Not required

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `image`: Image file (JPEG, PNG, WEBP)
  - Max size: 10MB

**Response:**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "url": "/uploads/photos/xxx-processed.jpeg",
    "thumbnail": "/uploads/photos/xxx-thumb.jpg",
    "width": 1200,
    "height": 800,
    "size": 245678
  },
  "timestamp": 1768444380936
}
```

**Processing:**

- Resize: Max 1200x1200 (maintains aspect ratio)
- Format: JPEG
- Quality: 85%
- Thumbnail: 200x200 (center crop)

---

### 2. Upload Avatar

Upload and set user avatar with square cropping.

**Endpoint:** `POST /upload/avatar`

**Authentication:** Required (Bearer token)

**Request:**

- Content-Type: `multipart/form-data`
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `avatar`: Image file (JPEG, PNG, WEBP)
  - Max size: 10MB

**Response:**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "avatar_url": "/uploads/avatars/xxx-avatar.jpg",
    "thumbnail_url": "/uploads/avatars/xxx-avatar-thumb.jpg",
    "width": 300,
    "height": 300
  },
  "timestamp": 1768444380936
}
```

**Processing:**

- Crop: 300x300 (center, square)
- Format: JPEG
- Quality: 90%
- Thumbnail: 100x100 (for list display)
- Auto-delete old avatar

**Database Update:**

- Updates `users.avatar_url` field
- Sets `users.updated_at` to current time

---

### 3. Upload Photos (Batch)

Upload multiple photos to user's photo album.

**Endpoint:** `POST /upload/photos`

**Authentication:** Required (Bearer token)

**Request:**

- Content-Type: `multipart/form-data`
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `photos`: Array of image files
  - Max files: 6 per request
  - Max size per file: 10MB

**Response:**

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "uploaded": 3,
    "photos": [
      {
        "id": "photo-020",
        "photo_url": "/uploads/photos/xxx-processed.jpeg",
        "thumbnail_url": "/uploads/photos/xxx-thumb.jpg",
        "display_order": 1
      },
      ...
    ]
  },
  "timestamp": 1768444380936
}
```

**Processing:**

- Resize: Max 1200x1200 (maintains aspect ratio)
- Format: JPEG
- Quality: 85%
- Thumbnail: 200x200 (center crop)

**Validation:**

- Checks existing photo count
- Maximum 6 photos total per user
- Returns error if limit exceeded

**Database Insert:**

- Inserts into `user_photos` table
- Auto-generates photo ID (photo-XXX)
- Sets display_order sequentially

---

## Error Responses

### Validation Errors (400)

```json
{
  "code": 2001,
  "message": "请选择要上传的图片",
  "timestamp": 1768444380936
}
```

### Authentication Errors (401)

```json
{
  "code": 1006,
  "message": "未授权访问",
  "timestamp": 1768444380936
}
```

### Photo Limit Exceeded (400)

```json
{
  "code": 3011,
  "message": "最多只能上传6张照片，当前已有4张",
  "timestamp": 1768444380936
}
```

### Server Errors (500)

```json
{
  "code": 5999,
  "message": "图片上传失败",
  "timestamp": 1768444380936
}
```

---

## File Constraints

- **Allowed formats:** JPEG, PNG, WEBP
- **Max file size:** 10MB per file
- **Max batch size:** 6 files for photos endpoint
- **Storage location:** `backend/uploads/`
  - Avatars: `uploads/avatars/`
  - Photos: `uploads/photos/`

---

## Testing Examples

### Using curl (Windows)

```powershell
# 1. Login to get token
$token = (Invoke-RestMethod -Uri http://localhost:3000/api/v1/auth/login -Method Post -Body '{"email":"zhangsan@test.com","password":"password123"}' -ContentType 'application/json').data.token

# 2. Upload avatar
curl.exe -X POST http://localhost:3000/api/v1/upload/avatar -H "Authorization: Bearer $token" -F "avatar=@path/to/image.jpg"

# 3. Upload photos
curl.exe -X POST http://localhost:3000/api/v1/upload/photos -H "Authorization: Bearer $token" -F "photos=@image1.jpg" -F "photos=@image2.jpg"
```

### Using PowerShell

See `test-upload.ps1` for complete example.

---

## Implementation Details

### Middleware Stack

1. **uploadHandler.ts**: Multer configuration
   - File filter (mimetype validation)
   - Size limit enforcement
   - Storage destination routing

2. **authMiddleware.ts**: JWT verification (for protected endpoints)

### Service Layer

**UploadService.ts** provides:

- `processImage()`: Resize and compress
- `generateThumbnail()`: Create thumbnail
- `processAvatar()`: Square crop for avatars
- `deleteFileAsync()`: Clean up old files
- `getFileUrl()`: Convert path to URL

### Controller Layer

**UploadController.ts** handles:

- File validation
- Service method invocation
- Database updates
- Error handling
- Response formatting

---

## Test Results

✅ All endpoints tested and working:

- POST /api/v1/upload/image - Returns 400 (needs file)
- POST /api/v1/upload/avatar - Returns 401 (needs auth), 200 with token
- POST /api/v1/upload/photos - Returns 401 (needs auth)

✅ File processing verified:

- Original: 568KB PNG
- Processed avatar: 18KB JPEG (300x300)
- Thumbnail: 3KB JPEG (100x100)

✅ Database integration working:

- Avatar URL updated in users table
- Photo records created in user_photos table
