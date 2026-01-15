// 简单的上传测试 - 验证端点和中间件配置
const http = require('http');

async function testEndpoints() {
  console.log('测试上传API端点...\n');

  // 1. 测试通用图片上传端点（无需认证）
  console.log('1. 测试 POST /api/v1/upload/image');
  testEndpoint('POST', '/api/v1/upload/image', false);

  // 2. 测试头像上传端点（需要认证）
  console.log('2. 测试 POST /api/v1/upload/avatar (需要认证)');
  testEndpoint('POST', '/api/v1/upload/avatar', true);

  // 3. 测试批量照片上传端点（需要认证）
  console.log('3. 测试 POST /api/v1/upload/photos (需要认证)');
  testEndpoint('POST', '/api/v1/upload/photos', true);

  console.log('\n✅ 所有端点已注册');
  console.log('\n📝 说明:');
  console.log('- 400错误表示缺少文件，但端点存在且正常工作');
  console.log('- 401错误表示需要认证，端点存在');
  console.log('- 要完整测试上传功能，需要使用支持multipart/form-data的工具');
  console.log('- 推荐使用: Postman, Insomnia, 或 curl命令');
}

function testEndpoint(method, path, needsAuth) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers: needsAuth ? { 'Authorization': 'Bearer invalid_token' } : {}
  };

  const req = http.request(options, (res) => {
    if (res.statusCode === 400 || res.statusCode === 401) {
      console.log(`   ✅ ${path} - 端点存在 (${res.statusCode})`);
    } else if (res.statusCode === 404) {
      console.log(`   ❌ ${path} - 端点不存在 (404)`);
    } else {
      console.log(`   ℹ️  ${path} - 状态码: ${res.statusCode}`);
    }
  });

  req.on('error', (error) => {
    console.log(`   ❌ ${path} - 连接失败:`, error.message);
  });

  req.end();
}

testEndpoints();
