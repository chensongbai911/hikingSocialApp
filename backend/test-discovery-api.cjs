const http = require('http');

let authToken = '';

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

// 1. 登录
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
    console.log('✅ Token获取成功');
  } else {
    console.log('❌ 登录失败');
  }
}

// 2. 获取推荐活动
async function getRecommendedActivities() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/activities?page=1&page_size=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 2. 获取推荐活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('推荐活动总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    if (result.body.data.items.length > 0) {
      console.log('第一个活动:', result.body.data.items[0].title);
    }
    console.log('✅ 获取成功');
  } else {
    console.log('❌ 获取失败:', result.body?.message);
  }
}

// 3. 获取推荐用户
async function getRecommendedUsers() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/users?page=1&page_size=5',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 3. 获取推荐用户 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('推荐用户总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    if (result.body.data.items.length > 0) {
      console.log('第一个用户:', result.body.data.items[0].nickname);
      console.log('共同偏好数:', result.body.data.items[0].common_preferences);
    }
    console.log('✅ 获取成功');
  } else {
    console.log('❌ 获取失败:', result.body?.message);
  }
}

// 4. 搜索活动(关键词)
async function searchActivitiesByKeyword() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/search/activities?keyword=' + encodeURIComponent('徒步') + '&page=1&page_size=10',
    method: 'GET'
  };

  const result = await makeRequest(options);
  console.log('\n=== 4. 搜索活动(关键词:徒步) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('搜索结果总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    if (result.body.data.items.length > 0) {
      console.log('第一个结果:', result.body.data.items[0].title);
    }
    console.log('✅ 搜索成功');
  } else {
    console.log('❌ 搜索失败:', result.body?.message);
  }
}

// 5. 搜索活动(地点)
async function searchActivitiesByLocation() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/search/activities?location=' + encodeURIComponent('北京') + '&page=1&page_size=10',
    method: 'GET'
  };

  const result = await makeRequest(options);
  console.log('\n=== 5. 搜索活动(地点:北京) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('搜索结果总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    console.log('✅ 搜索成功');
  } else {
    console.log('❌ 搜索失败:', result.body?.message);
  }
}

// 6. 搜索活动（难度）
async function searchActivitiesByDifficulty() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/search/activities?difficulty=easy&page=1&page_size=10',
    method: 'GET'
  };

  const result = await makeRequest(options);
  console.log('\n=== 6. 搜索活动(难度:easy) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('搜索结果总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    console.log('✅ 搜索成功');
  } else {
    console.log('❌ 搜索失败:', result.body?.message);
  }
}

// 7. 搜索用户(昵称)
async function searchUsersByNickname() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/search/users?keyword=' + encodeURIComponent('清风') + '&page=1&page_size=10',
    method: 'GET'
  };

  const result = await makeRequest(options);
  console.log('\n=== 7. 搜索用户(昵称:清风) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('搜索结果总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    if (result.body.data.items.length > 0) {
      console.log('第一个结果:', result.body.data.items[0].nickname);
    }
    console.log('✅ 搜索成功');
  } else {
    console.log('❌ 搜索失败:', result.body?.message);
  }
}

// 8. 搜索用户（徒步等级）
async function searchUsersByHikingLevel() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/discovery/search/users?hiking_level=intermediate&page=1&page_size=10',
    method: 'GET'
  };

  const result = await makeRequest(options);
  console.log('\n=== 8. 搜索用户(等级:intermediate) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('搜索结果总数:', result.body.data.pagination.total);
    console.log('返回数量:', result.body.data.items.length);
    console.log('✅ 搜索成功');
  } else {
    console.log('❌ 搜索失败:', result.body?.message);
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试发现页API...');

  try {
    await login();
    await getRecommendedActivities();
    await getRecommendedUsers();
    await searchActivitiesByKeyword();
    await searchActivitiesByLocation();
    await searchActivitiesByDifficulty();
    await searchUsersByNickname();
    await searchUsersByHikingLevel();

    console.log('\n✅ 所有发现页API测试完成!');
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
  }
}

runTests();
