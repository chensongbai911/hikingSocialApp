const http = require('http');

// 先登录获取token
function login(callback) {
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
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      const response = JSON.parse(body);
      callback(response.data.token);
    });
  });

  req.write(data);
  req.end();
}

// 更新资料
function updateProfile(token) {
  const data = JSON.stringify({
    bio: '测试更新简介',
    hiking_level: 'advanced'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/profile',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('发送请求...');
  console.log('Headers:', options.headers);
  console.log('Body:', data);

  const req = http.request(options, (res) => {
    console.log('\n响应状态:', res.statusCode);
    console.log('响应头:', res.headers);

    let body = '';
    res.on('data', (chunk) => {
      console.log('收到数据块:', chunk.toString());
      body += chunk;
    });

    res.on('end', () => {
      console.log('\n完整响应体:', body);
      console.log('响应体长度:', body.length);

      if (body.length > 0) {
        try {
          const response = JSON.parse(body);
          console.log('解析后的响应:', JSON.stringify(response, null, 2));
        } catch (e) {
          console.error('JSON解析失败:', e.message);
        }
      } else {
        console.error('响应体为空!');
      }
    });
  });

  req.on('error', (error) => {
    console.error('请求错误:', error);
  });

  req.write(data);
  req.end();
}

// 执行测试
login((token) => {
  console.log('Token获取成功:', token.substring(0, 20) + '...\n');
  updateProfile(token);
});
