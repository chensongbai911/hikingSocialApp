const http = require('http');

// 使用数据库中的测试账号登录
function testLoginWithExistingUser() {
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
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('=== 使用种子数据账号登录测试 ===');
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.stringify(JSON.parse(body), null, 2));
      console.log('');

      if (res.statusCode === 200) {
        const response = JSON.parse(body);
        if (response.data && response.data.token) {
          console.log('✅ 登录成功!');
          testGetMe(response.data.token);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('登录错误:', error);
  });

  req.write(data);
  req.end();
}

// 测试获取当前用户信息API
function testGetMe(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      console.log('=== 获取当前用户信息测试 ===');
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.stringify(JSON.parse(body), null, 2));
      console.log('');
      console.log('✅ 所有认证API测试完成!');
    });
  });

  req.on('error', (error) => {
    console.error('获取用户信息错误:', error);
  });

  req.end();
}

console.log('开始测试认证API (使用种子数据账号)...\n');
testLoginWithExistingUser();
