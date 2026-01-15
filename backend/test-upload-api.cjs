const http = require('http');
const fs = require('fs');
const path = require('path');

let authToken = '';
let userId = '';

// HTTP请求辅助函数
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: body.length > 0 ? JSON.parse(body) : null
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: null, error: e.message });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// 多部分表单数据上传
function makeMultipartRequest(options, fields, files) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    let body = '';

    // 添加字段
    for (const [key, value] of Object.entries(fields || {})) {
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      body += `${value}\r\n`;
    }

    // 添加文件
    for (const [fieldName, filePath] of Object.entries(files || {})) {
      const fileContent = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\n`;
      body += `Content-Type: image/jpeg\r\n\r\n`;

      // 文件内容需要是Buffer
      const parts = [
        Buffer.from(body, 'utf8'),
        fileContent,
        Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
      ];

      const fullBody = Buffer.concat(parts);

      options.headers = options.headers || {};
      options.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
      options.headers['Content-Length'] = fullBody.length;

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          try {
            resolve({
              statusCode: res.statusCode,
              body: responseBody.length > 0 ? JSON.parse(responseBody) : null
            });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: null, error: e.message });
          }
        });
      });

      req.on('error', reject);
      req.write(fullBody);
      req.end();
      return;
    }
  });
}

// 1. 登录获取token
async function login() {
  const data = JSON.stringify({
    email: 'zhangsan@test.com',
    password: 'password123'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const result = await makeRequest(options, data);
  console.log('\n=== 1. 登录 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    authToken = result.body.data.token;
    userId = result.body.data.user.id;
    console.log('✅ Token获取成功');
    console.log('用户ID:', userId);
  } else {
    console.log('❌ 登录失败');
  }
}

// 2. 使用真实测试图片
function getTestImage() {
  const testImagePath = path.join(__dirname, '../design_images/avatar.png');

  if (!fs.existsSync(testImagePath)) {
    console.log('❌ 测试图片不存在:', testImagePath);
    return null;
  }

  console.log('\n=== 2. 准备测试图片 ===');
  console.log('✅ 使用测试图片:', testImagePath);

  return testImagePath;
}

// 3. 上传头像
async function uploadAvatar(imagePath) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/upload/avatar',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeMultipartRequest(options, {}, { avatar: imagePath });
  console.log('\n=== 3. 上传头像 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('头像URL:', result.body.data.avatar_url);
    console.log('缩略图URL:', result.body.data.thumbnail_url);
    console.log('✅ 上传成功');
  } else {
    console.log('❌ 上传失败:', result.body?.message);
    console.log('错误:', result.error);
  }
}

// 4. 通用图片上传
async function uploadImage(imagePath) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/upload/image',
    method: 'POST'
  };

  const result = await makeMultipartRequest(options, {}, { image: imagePath });
  console.log('\n=== 4. 通用图片上传 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('图片URL:', result.body.data.url);
    console.log('缩略图URL:', result.body.data.thumbnail);
    console.log('尺寸:', `${result.body.data.width}x${result.body.data.height}`);
    console.log('✅ 上传成功');
  } else {
    console.log('❌ 上传失败:', result.body?.message);
    console.log('错误:', result.error);
  }
}

// 5. 检查上传的文件
async function checkUploads() {
  const uploadsDir = path.join(__dirname, '../uploads/avatars');

  console.log('\n=== 5. 检查上传目录 ===');

  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    console.log(`找到 ${files.length} 个文件`);
    if (files.length > 0) {
      console.log('最新文件:', files[files.length - 1]);
    }
    console.log('✅ 上传目录检查完成');
  } else {
    console.log('⚠️  上传目录不存在');
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试上传API...');

  try {
    await login();
    const testImagePath = getTestImage();

    if (!testImagePath) {
      console.log('❌ 无法获取测试图片，测试终止');
      return;
    }

    await uploadAvatar(testImagePath);
    await uploadImage(testImagePath);
    await checkUploads();

    console.log('\n✅ 所有上传API测试完成!');
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
    console.error(error.stack);
  }
}

runTests();

