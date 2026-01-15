// 测试照片上传和删除API
const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:3000/api/v1';

// 测试用的 token（需要先登录获取）
let TOKEN = '';

// 小的测试图片 base64（1x1 像素的透明 PNG）
const TEST_IMAGE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function register() {
  try {
    console.log('1. 注册测试账号...');
    const response = await axios.post(`${API_BASE}/auth/register`, {
      email: 'phototest@example.com',
      password: 'Test123456',
      nickname: '照片测试用户'
    });
    
    if (response.data.code === 200) {
      console.log('✓ 注册成功');
      return true;
    } else {
      console.log('✗ 注册失败:', response.data.message);
      // 如果用户已存在，继续登录
      return response.data.message.includes('已存在');
    }
  } catch (error) {
    console.log('✗ 注册失败:', error.response?.data?.message || error.message);
    return true; // 继续尝试登录
  }
}

async function login() {
  try {
    console.log('2. 登录测试账号...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'phototest@example.com',
      password: 'Test123456'
    });
    
    if (response.data.code === 200) {
      TOKEN = response.data.data.token;
      console.log('✓ 登录成功');
      console.log('Token:', TOKEN.substring(0, 20) + '...');
      return true;
    } else {
      console.log('✗ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('✗ 登录失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function uploadPhoto() {
  try {
    console.log('\n3. 上传照片...');
    const response = await axios.post(
      `${API_BASE}/users/photos`,
      { photo_url: TEST_IMAGE_BASE64 },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    
    if (response.data.code === 200) {
      console.log('✓ 照片上传成功');
      console.log('照片ID:', response.data.data.id);
      return response.data.data.id;
    } else {
      console.log('✗ 照片上传失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.log('✗ 照片上传失败:', error.response?.data?.message || error.message);
    if (error.response?.data?.details) {
      console.log('详细错误:', error.response.data.details);
    }
    return null;
  }
}

async function getPhotos() {
  try {
    console.log('\n4. 获取照片列表...');
    const response = await axios.get(
      `${API_BASE}/users/photos`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    
    if (response.data.code === 200) {
      console.log('✓ 获取照片列表成功');
      console.log('照片数量:', response.data.data.length);
      response.data.data.forEach((photo, index) => {
        console.log(`  ${index + 1}. ID: ${photo.id}, 创建时间: ${photo.created_at}`);
      });
      return response.data.data;
    } else {
      console.log('✗ 获取照片列表失败:', response.data.message);
      return [];
    }
  } catch (error) {
    console.log('✗ 获取照片列表失败:', error.response?.data?.message || error.message);
    return [];
  }
}

async function deletePhoto(photoId) {
  try {
    console.log(`\n5. 删除照片 ${photoId}...`);
    const response = await axios.delete(
      `${API_BASE}/users/photos/${photoId}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    
    if (response.data.code === 200) {
      console.log('✓ 照片删除成功');
      return true;
    } else {
      console.log('✗ 照片删除失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('✗ 照片删除失败:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== 照片上传和删除功能测试 ===\n');
  
  // 1. 注册
  await register();
  
  // 2. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n测试终止：登录失败');
    return;
  }
  
  // 3. 上传照片
  const photoId = await uploadPhoto();
  if (!photoId) {
    console.log('\n测试终止：照片上传失败');
    return;
  }
  
  // 4. 获取照片列表
  const photos = await getPhotos();
  
  // 5. 删除照片
  if (photoId) {
    await deletePhoto(photoId);
  }
  
  // 6. 再次获取照片列表验证删除
  console.log('\n6. 验证删除结果...');
  await getPhotos();
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
runTests().catch(console.error);
