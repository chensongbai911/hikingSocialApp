// API 测试脚本
// 使用方法: node test-api.js

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let userId = '';
let activityId = '';

// 辅助函数
const log = (title, data) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(50)}`);
  console.log(JSON.stringify(data, null, 2));
};

const handleError = (error, context) => {
  console.error(`\n❌ ${context} 失败:`);
  if (error.response) {
    console.error('状态码:', error.response.status);
    console.error('错误信息:', error.response.data);
  } else {
    console.error('错误:', error.message);
  }
};

// 测试函数
async function testRegister () {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: `test${Date.now()}@example.com`,
      nickname: 'Test User',
      password: 'Test1234',
    });

    authToken = response.data.data.token;
    userId = response.data.data.user.id;

    log('✅ 用户注册成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '用户注册');
    return false;
  }
}

async function testLogin () {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test1234',
    });

    log('✅ 用户登录成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '用户登录');
    return false;
  }
}

async function testGetCurrentUser () {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    log('✅ 获取当前用户信息成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '获取当前用户信息');
    return false;
  }
}

async function testCreateActivity () {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/activities`,
      {
        title: '测试活动：泰山日出',
        description: '这是一个测试活动，用于验证 API 功能',
        location: '山东·泰安',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天后
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 7天后+8小时
        difficulty: 'easy',
        distance: 15,
        type: 'sunrise',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    activityId = response.data.data.id;

    log('✅ 创建活动成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '创建活动');
    return false;
  }
}

async function testGetActivities () {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities`, {
      params: {
        page: 1,
        limit: 10,
      },
    });

    log('✅ 获取活动列表成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '获取活动列表');
    return false;
  }
}

async function testGetActivityDetail () {
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/${activityId}`);

    log('✅ 获取活动详情成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '获取活动详情');
    return false;
  }
}

async function testJoinActivity () {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/activities/${activityId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    log('✅ 参加活动成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '参加活动');
    return false;
  }
}

async function testUpdateProfile () {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/users/profile`,
      {
        bio: '热爱徒步，喜欢挑战',
        hikingLevel: 'intermediate',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    log('✅ 更新用户信息成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '更新用户信息');
    return false;
  }
}

async function testHealthCheck () {
  try {
    const response = await axios.get('http://localhost:3000/health');
    log('✅ 健康检查成功', response.data);
    return true;
  } catch (error) {
    handleError(error, '健康检查');
    return false;
  }
}

// 运行所有测试
async function runAllTests () {
  console.log('\n🚀 开始测试后端 API...\n');
  console.log('确保后端服务已在 http://localhost:3000 启动\n');

  let passed = 0;
  let failed = 0;

  // 健康检查
  if (await testHealthCheck()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  // 用户相关
  if (await testRegister()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  if (await testGetCurrentUser()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  if (await testUpdateProfile()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  // 活动相关
  if (await testCreateActivity()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  if (await testGetActivities()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  if (await testGetActivityDetail()) passed++; else failed++;

  await new Promise(resolve => setTimeout(resolve, 500));

  if (await testJoinActivity()) passed++; else failed++;

  // 总结
  console.log(`\n${'='.repeat(50)}`);
  console.log('  测试总结');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`📊 总计: ${passed + failed}`);
  console.log(`${'='.repeat(50)}\n`);
}

// 执行测试
runAllTests().catch(console.error);
