const http = require('http');

let authToken = '';

// 1. 登录获取token
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
      console.log('=== 1. 登录 ===');
      console.log('Status:', res.statusCode);
      if (res.statusCode === 200) {
        const response = JSON.parse(body);
        authToken = response.data.token;
        console.log('Token获取成功 ✅');
        callback();
      } else {
        console.log('登录失败:', body);
      }
    });
  });

  req.on('error', (error) => console.error('登录错误:', error));
  req.write(data);
  req.end();
}

// 2. 获取用户资料
function getProfile(callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('\n=== 2. 获取用户资料 ===');
      console.log('Status:', res.statusCode);
      const response = JSON.parse(body);
      console.log('用户:', response.data?.nickname);
      console.log('偏好数:', response.data?.preferences?.length);
      console.log('照片数:', response.data?.photos?.length);
      if (res.statusCode === 200) console.log('✅ 成功');
      callback();
    });
  });

  req.on('error', (error) => console.error('获取资料错误:', error));
  req.end();
}

// 3. 更新用户资料
function updateProfile(callback) {
  const data = JSON.stringify({
    nickname: '山间清风(测试)',
    bio: '这是更新后的个人简介',
    hiking_level: 'advanced'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/profile',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('\n=== 3. 更新用户资料 ===');
      console.log('Status:', res.statusCode);
      console.log('Response body length:', body.length);
      console.log('Response body:', body);

      if (body.length === 0) {
        console.error('❌ 响应体为空');
        callback();
        return;
      }

      try {
        const response = JSON.parse(body);
        console.log('新昵称:', response.data?.nickname);
        console.log('新等级:', response.data?.hiking_level);
        if (res.statusCode === 200) console.log('✅ 成功');
      } catch (e) {
        console.error('JSON解析失败:', e.message);
      }
      callback();
    });
  });

  req.on('error', (error) => console.error('更新资料错误:', error));
  req.write(data);
  req.end();
}

// 4. 更新用户偏好
function updatePreferences(callback) {
  const data = JSON.stringify({
    preferences: [
      { type: 'time', value: '周末' },
      { type: 'type', value: '登山' },
      { type: 'distance', value: '10-20公里' }
    ]
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/preferences',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('\n=== 4. 更新用户偏好 ===');
      console.log('Status:', res.statusCode);
      if (body.length === 0) {
        console.error('❌ 响应体为空');
        callback();
        return;
      }
      try {
        const response = JSON.parse(body);
        console.log('偏好数量:', response.data?.length);
        if (res.statusCode === 200) console.log('✅ 成功');
      } catch (e) {
        console.error('JSON解析失败:', e.message);
      }
      callback();
    });
  });

  req.on('error', (error) => console.error('更新偏好错误:', error));
  req.write(data);
  req.end();
}

// 5. 添加相册照片
function addPhoto(callback) {
  const data = JSON.stringify({
    photo_url: 'https://via.placeholder.com/400/14b8a6/ffffff?text=NewPhoto',
    sort_order: 0
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/photos',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('\n=== 5. 添加相册照片 ===');
      console.log('Status:', res.statusCode);
      const response = JSON.parse(body);
      console.log('照片ID:', response.data?.id);
      if (res.statusCode === 200) console.log('✅ 成功');
      callback();
    });
  });

  req.on('error', (error) => console.error('添加照片错误:', error));
  req.write(data);
  req.end();
}

// 6. 获取更新后的资料
function getFinalProfile() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      console.log('\n=== 6. 验证最终结果 ===');
      console.log('Status:', res.statusCode);
      const response = JSON.parse(body);
      console.log('用户:', response.data?.nickname);
      console.log('等级:', response.data?.hiking_level);
      console.log('偏好数:', response.data?.preferences?.length);
      console.log('照片数:', response.data?.photos?.length);
      if (res.statusCode === 200) {
        console.log('\n✅ 所有用户API测试完成!');
      }
    });
  });

  req.on('error', (error) => console.error('获取资料错误:', error));
  req.end();
}

// 执行测试流程
console.log('开始测试用户API...\n');
login(() => {
  setTimeout(() => getProfile(() => {
    setTimeout(() => updateProfile(() => {
      setTimeout(() => updatePreferences(() => {
        setTimeout(() => addPhoto(() => {
          setTimeout(() => getFinalProfile(), 500);
        }), 500);
      }), 500);
    }), 500);
  }), 500);
});
