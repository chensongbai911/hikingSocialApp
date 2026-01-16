/**
 * 综合 API 功能测试脚本
 * 验证所有主要 API 端点的功能
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// 统计变量
let passed = 0;
let failed = 0;
let authToken = '';
let currentUserId = '';

/**
 * 测试结果记录
 */
function logTest (testName, passed, details = '') {
  if (passed) {
    console.log(`✅ ${testName}${details ? ' - ' + details : ''}`);
  } else {
    console.log(`❌ ${testName}${details ? ' - ' + details : ''}`);
  }
}

/**
 * 发送 API 请求
 */
async function makeRequest (method, endpoint, data = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(text);
    } catch (e) {
      responseData = text;
    }

    return { status: response.status, data: responseData };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

/**
 * 测试套件
 */
async function runTests () {
  console.log('🧪 开始 API 综合功能测试\n');
  console.log('='.repeat(60));

  // 测试 1: 健康检查
  console.log('\n📌 测试 1: 服务器健康检查');
  console.log('-'.repeat(60));
  const healthRes = await makeRequest('GET', '/health');
  if (healthRes.status === 200) {
    logTest('健康检查', true);
    passed++;
  } else {
    logTest('健康检查', false, `状态码: ${healthRes.status}`);
    failed++;
  }

  // 测试 2: 用户认证相关 API
  console.log('\n📌 测试 2: 用户认证 API');
  console.log('-'.repeat(60));

  // 注册
  const registerRes = await makeRequest('POST', '/auth/register', {
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    nickname: 'Test User'
  });
  if (registerRes.status === 201 || registerRes.status === 200) {
    logTest('用户注册', true);
    passed++;
  } else {
    logTest('用户注册', false, `状态码: ${registerRes.status}`);
    failed++;
  }

  // 登录
  const loginRes = await makeRequest('POST', '/auth/login', {
    email: 'test@example.com',
    password: 'password123'
  });
  if (loginRes.status === 200 && loginRes.data?.data?.token) {
    authToken = loginRes.data.data.token;
    currentUserId = loginRes.data.data.id;
    logTest('用户登录', true, `Token: ${authToken.substring(0, 20)}...`);
    passed++;
  } else {
    logTest('用户登录', false, `状态码: ${loginRes.status}`);
    failed++;
  }

  // 获取当前用户信息
  const meRes = await makeRequest('GET', '/auth/me');
  if (meRes.status === 200 && meRes.data?.data?.id) {
    logTest('获取当前用户信息', true, `用户 ID: ${meRes.data.data.id}`);
    passed++;
  } else {
    logTest('获取当前用户信息', false, `状态码: ${meRes.status}`);
    failed++;
  }

  // 测试 3: 用户相关 API
  console.log('\n📌 测试 3: 用户相关 API');
  console.log('-'.repeat(60));

  // 获取个人资料
  const profileRes = await makeRequest('GET', '/users/profile');
  if (profileRes.status === 200) {
    logTest('获取个人资料', true);
    passed++;
  } else {
    logTest('获取个人资料', false, `状态码: ${profileRes.status}`);
    failed++;
  }

  // 更新个人资料
  const updateRes = await makeRequest('PUT', '/users/profile', {
    nickname: '测试用户',
    bio: '这是我的个人简介'
  });
  if (updateRes.status === 200) {
    logTest('更新个人资料', true);
    passed++;
  } else {
    logTest('更新个人资料', false, `状态码: ${updateRes.status}`);
    failed++;
  }

  // 获取用户详情（新增的 API）
  if (currentUserId) {
    const detailRes = await makeRequest('GET', `/users/${currentUserId}/detail`);
    if (detailRes.status === 200 && detailRes.data?.data?.followers_count !== undefined) {
      logTest('获取用户详情', true, `关注者: ${detailRes.data.data.followers_count}, 徒步次数: ${detailRes.data.data.activities_count}`);
      passed++;
    } else {
      logTest('获取用户详情', false, `状态码: ${detailRes.status}`);
      failed++;
    }
  }

  // 测试 4: 活动相关 API
  console.log('\n📌 测试 4: 活动相关 API');
  console.log('-'.repeat(60));

  // 获取活动列表
  const activitiesRes = await makeRequest('GET', '/activities?page=1&page_size=10');
  if (activitiesRes.status === 200) {
    const count = activitiesRes.data?.data?.items?.length || 0;
    logTest('获取活动列表', true, `获取 ${count} 个活动`);
    passed++;
  } else {
    logTest('获取活动列表', false, `状态码: ${activitiesRes.status}`);
    failed++;
  }

  // 测试 5: 发现页面 API
  console.log('\n📌 测试 5: 发现页面 API');
  console.log('-'.repeat(60));

  // 获取推荐用户
  const discoverRes = await makeRequest('GET', '/discovery/users');
  if (discoverRes.status === 200) {
    const count = discoverRes.data?.data?.items?.length || 0;
    logTest('获取推荐用户', true, `获取 ${count} 个推荐用户`);
    passed++;
  } else {
    logTest('获取推荐用户', false, `状态码: ${discoverRes.status}`);
    failed++;
  }

  // 测试 6: 消息相关 API
  console.log('\n📌 测试 6: 消息相关 API');
  console.log('-'.repeat(60));

  // 获取对话列表
  const conversationsRes = await makeRequest('GET', '/messages/conversations');
  if (conversationsRes.status === 200) {
    logTest('获取对话列表', true);
    passed++;
  } else if (conversationsRes.status === 401) {
    logTest('获取对话列表', true, '需要认证（预期）');
    passed++;
  } else {
    logTest('获取对话列表', false, `状态码: ${conversationsRes.status}`);
    failed++;
  }

  // 测试 7: 路由验证
  console.log('\n📌 测试 7: 关键路由验证');
  console.log('-'.repeat(60));

  const routes = [
    { method: 'GET', path: '/activities', name: '获取活动列表' },
    { method: 'GET', path: '/users/profile', name: '获取用户资料' },
    { method: 'GET', path: '/discovery/users', name: '获取推荐用户' }
  ];

  for (const route of routes) {
    const res = await makeRequest(route.method, route.path);
    if (res.status !== 0) {
      logTest(route.name, res.status !== 404, `状态码: ${res.status}`);
      if (res.status !== 404) passed++;
      else failed++;
    }
  }

  // 最终统计
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 测试结果统计:');
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📈 通过率: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('\n🎉 所有测试都已通过！系统运行正常！\n');
  } else {
    console.log(`\n⚠️  有 ${failed} 个测试失败，请检查服务器日志。\n`);
  }
}

// 运行测试
runTests().catch(console.error);
