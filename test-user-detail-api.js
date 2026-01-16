/**
 * 测试用户详情 API 端点
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// 测试数据（从数据库中获取真实的用户 ID）
const testUserId = '123e4567-e89b-12d3-a456-426614174000';
const currentUserId = '123e4567-e89b-12d3-a456-426614174001';
let testToken = '';

// 模拟登录获取 token
async function login () {
  try {
    console.log('📝 正在登录...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      throw new Error(`登录失败: ${response.status}`);
    }

    const data = await response.json();
    testToken = data.data.token;
    console.log('✅ 登录成功，获取到 token');
    return testToken;
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    return null;
  }
}

// 测试获取用户详情
async function testGetUserDetail () {
  try {
    console.log('\n🔍 测试获取用户详情...');
    const response = await fetch(`${BASE_URL}/users/${testUserId}/detail`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`获取用户详情失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 获取用户详情成功:');
    console.log(JSON.stringify(data.data, null, 2));
    return data.data;
  } catch (error) {
    console.error('❌ 获取用户详情失败:', error.message);
  }
}

// 测试关注用户
async function testFollowUser () {
  try {
    console.log('\n👥 测试关注用户...');
    const response = await fetch(`${BASE_URL}/users/${testUserId}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`关注用户失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 关注用户成功:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ 关注用户失败:', error.message);
  }
}

// 测试获取关注状态
async function testGetFollowStatus () {
  try {
    console.log('\n❓ 测试获取关注状态...');
    const response = await fetch(`${BASE_URL}/users/${testUserId}/follow-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`获取关注状态失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 获取关注状态成功:');
    console.log(JSON.stringify(data.data, null, 2));
  } catch (error) {
    console.error('❌ 获取关注状态失败:', error.message);
  }
}

// 测试取消关注
async function testUnfollowUser () {
  try {
    console.log('\n👋 测试取消关注...');
    const response = await fetch(`${BASE_URL}/users/${testUserId}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`取消关注失败: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ 取消关注成功:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ 取消关注失败:', error.message);
  }
}

// 主测试函数
async function runTests () {
  console.log('🚀 开始测试用户详情 API 端点...\n');

  // 先登录
  const token = await login();
  if (!token) {
    console.error('无法获取 token，停止测试');
    return;
  }

  // 执行测试
  await testGetUserDetail();
  await testFollowUser();
  await testGetFollowStatus();
  await testUnfollowUser();

  console.log('\n✨ 所有测试完成！\n');
}

// 运行测试
runTests().catch(console.error);
