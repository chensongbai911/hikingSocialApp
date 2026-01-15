const http = require('http');

// 测试注册API
function testRegister() {
  const data = JSON.stringify({
    email: 'test@example.com',
    nickname: '测试用户',
    password: 'test123',
    gender: 'male',
    age: 25
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/register',
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
      console.log('=== 注册测试 ===');
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      console.log('');
      
      // 如果注册成功，测试登录
      if (res.statusCode === 201 || res.statusCode === 200) {
        testLogin();
      } else {
        // 如果用户已存在，直接测试登录
        testLogin();
      }
    });
  });

  req.on('error', (error) => {
    console.error('注册错误:', error);
  });

  req.write(data);
  req.end();
}

// 测试登录API
function testLogin() {
  const data = JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
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
      console.log('=== 登录测试 ===');
      console.log('Status:', res.statusCode);
      console.log('Response:', body);
      console.log('');
      
      // 解析token用于后续测试
      try {
        const response = JSON.parse(body);
        if (response.data && response.data.token) {
          testGetMe(response.data.token);
        }
      } catch (e) {
        console.error('解析响应失败');
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
      console.log('Response:', body);
      console.log('');
      console.log('✅ 所有认证API测试完成!');
    });
  });

  req.on('error', (error) => {
    console.error('获取用户信息错误:', error);
  });

  req.end();
}

// 开始测试
console.log('开始测试认证API...\n');
testRegister();
