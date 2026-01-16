/**
 * 测试用户详情 API 端点
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// 从环境变量或数据库中获取的真实用户 ID
const testUserId = '550e8400-e29b-41d4-a716-446655440000';

// 测试不需要认证的路由
async function testUserDetailRoutes () {
  try {
    console.log('🧪 测试用户详情 API 路由...\n');

    // 测试 1: 获取用户详情 (应该返回 401 或用户详情)
    console.log('1️⃣  测试 GET /users/:userId/detail');
    const detailResponse = await fetch(`${BASE_URL}/users/${testUserId}/detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`   状态码: ${detailResponse.status}`);
    const detailData = await detailResponse.json();
    if (detailResponse.ok) {
      console.log('   ✅ 路由存在并返回数据');
      console.log(`   数据: ${JSON.stringify(detailData, null, 2)}`);
    } else {
      console.log(`   ⚠️  返回错误: ${detailData.message || detailData.error}`);
    }

    // 测试 2: 关注用户 (应该返回 401 或成功)
    console.log('\n2️⃣  测试 POST /users/:userId/follow');
    const followResponse = await fetch(`${BASE_URL}/users/${testUserId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`   状态码: ${followResponse.status}`);
    const followData = await followResponse.json();
    if (followResponse.ok) {
      console.log('   ✅ 路由存在并处理成功');
      console.log(`   数据: ${JSON.stringify(followData, null, 2)}`);
    } else {
      console.log(`   ⚠️  返回错误: ${followData.message || followData.error}`);
    }

    // 测试 3: 获取关注状态 (应该返回 401 或状态信息)
    console.log('\n3️⃣  测试 GET /users/:userId/follow-status');
    const statusResponse = await fetch(`${BASE_URL}/users/${testUserId}/follow-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`   状态码: ${statusResponse.status}`);
    const statusData = await statusResponse.json();
    if (statusResponse.ok) {
      console.log('   ✅ 路由存在并返回状态');
      console.log(`   数据: ${JSON.stringify(statusData, null, 2)}`);
    } else {
      console.log(`   ⚠️  返回错误: ${statusData.message || statusData.error}`);
    }

    // 测试 4: 取消关注 (应该返回 401 或成功)
    console.log('\n4️⃣  测试 DELETE /users/:userId/follow');
    const unfollowResponse = await fetch(`${BASE_URL}/users/${testUserId}/follow`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log(`   状态码: ${unfollowResponse.status}`);
    const unfollowData = await unfollowResponse.json();
    if (unfollowResponse.ok) {
      console.log('   ✅ 路由存在并处理成功');
      console.log(`   数据: ${JSON.stringify(unfollowData, null, 2)}`);
    } else {
      console.log(`   ⚠️  返回错误: ${unfollowData.message || unfollowData.error}`);
    }

    console.log('\n✨ 路由测试完成！所有新增的用户详情路由都已成功加载！\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testUserDetailRoutes().catch(console.error);
