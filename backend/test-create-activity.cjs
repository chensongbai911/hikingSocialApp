const http = require('http');

let authToken = '';
let activityId = '';

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

  if (result.statusCode === 200 && result.body?.data?.token) {
    authToken = result.body.data.token;
    console.log('✅ Token获取成功');
  } else {
    console.log('❌ 登录失败:', result.body?.message);
  }
}

// 2. 创建活动
async function createActivity() {
  const data = JSON.stringify({
    title: '周末爬山活动',
    description: '一起去香山看红叶',
    location: '北京香山公园',
    latitude: 40.0,
    longitude: 116.2,
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    difficulty: 'easy',
    max_participants: 10,
    route_description: '从北门进，沿主路上山',
    equipment_required: '登山鞋、水壶'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/activities',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const result = await makeRequest(options, data);
  console.log('\n=== 2. 创建活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 201 && result.body?.data?.id) {
    activityId = result.body.data.id;
    console.log('✅ 活动创建成功');
    console.log('活动ID:', activityId);
    console.log('活动标题:', result.body.data.title);
  } else {
    console.log('❌ 创建失败');
    console.log('Message:', result.body?.message);
    console.log('Details:', result.body?.data);
  }
}

// 3. 获取活动列表
async function getActivities() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/activities?page=1&page_size=10',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 3. 获取活动列表 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200 && result.body?.data?.items) {
    console.log('✅ 获取成功');
    console.log('总活动数:', result.body.data.pagination.total);
    console.log('当前页数:', result.body.data.pagination.page);
  } else {
    console.log('❌ 获取失败');
  }
}

// 主函数
async function main() {
  try {
    console.log('开始测试活动API...');
    await login();

    if (authToken) {
      await createActivity();
      await getActivities();
      console.log('\n✅ 所有测试完成！');
    } else {
      console.log('❌ 无法进行后续测试，登录失败');
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

main();
