const http = require('http');

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

// 注册新用户
async function register() {
  const data = JSON.stringify({
    email: 'testuser@test.com',
    password: 'Test@123456',
    nickname: 'TestUser'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const result = await makeRequest(options, data);
  console.log('\n=== 注册用户 ===');
  console.log('Status:', result.statusCode);
  console.log('Response:', JSON.stringify(result.body, null, 2));

  if (result.statusCode === 201 || result.statusCode === 200) {
    console.log('✅ 注册成功');
    return true;
  } else {
    console.log('❌ 注册失败');
    return false;
  }
}

async function main() {
  try {
    await register();
  } catch (error) {
    console.error('错误:', error);
  }
}

main();
