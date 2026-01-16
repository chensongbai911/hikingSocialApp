/**
 * 测试用户详情 API 的完整流程
 * 包括: 获取用户详情、关注/取消关注、查询关注状态
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// 定义全局变量
let authToken = '';
let currentUserId = '';
let targetUserId = '';

/**
 * 登录用户获取认证令牌
 */
async function login (email, password) {
  try {
    console.log(`\n📝 正在登录账户: ${email}`);
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (!response.ok) {
      throw new Error(`登录失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 200) {
      throw new Error(`登录失败: ${data.message}`);
    }

    authToken = data.data.token;
    currentUserId = data.data.id;
    console.log(`✅ 登录成功！`);
    console.log(`   用户 ID: ${currentUserId}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return { token: authToken, userId: currentUserId };
  } catch (error) {
    console.error(`❌ 登录失败: ${error.message}`);
    throw error;
  }
}

/**
 * 获取用户详情
 */
async function getUserDetail (userId) {
  try {
    console.log(`\n🔍 获取用户详情: ${userId}`);
    const response = await fetch(`${BASE_URL}/users/${userId}/detail`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`获取失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 200) {
      throw new Error(`获取失败: ${data.message}`);
    }

    console.log(`✅ 获取用户详情成功！`);
    console.log(`   昵称: ${data.data.nickname}`);
    console.log(`   地区: ${data.data.region || data.data.city || data.data.province || '未设置'}`);
    console.log(`   徒步次数: ${data.data.activities_count || 0}`);
    console.log(`   关注者: ${data.data.followers_count || 0}`);
    console.log(`   等级: ${data.data.hiking_level || '新手'}`);
    return data.data;
  } catch (error) {
    console.error(`❌ 获取用户详情失败: ${error.message}`);
    throw error;
  }
}

/**
 * 关注用户
 */
async function followUser (userId) {
  try {
    console.log(`\n👥 正在关注用户: ${userId}`);
    const response = await fetch(`${BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`关注失败: ${response.status} - ${data.message}`);
    }

    if (data.code !== 200) {
      throw new Error(`关注失败: ${data.message}`);
    }

    console.log(`✅ 关注成功！`);
    console.log(`   消息: ${data.data.message}`);
    return data.data;
  } catch (error) {
    console.error(`❌ 关注失败: ${error.message}`);
    throw error;
  }
}

/**
 * 获取关注状态
 */
async function getFollowStatus (userId) {
  try {
    console.log(`\n❓ 查询关注状态: ${userId}`);
    const response = await fetch(`${BASE_URL}/users/${userId}/follow-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`查询失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 200) {
      throw new Error(`查询失败: ${data.message}`);
    }

    console.log(`✅ 关注状态查询成功！`);
    console.log(`   是否已关注: ${data.data.is_following ? '是' : '否'}`);
    return data.data;
  } catch (error) {
    console.error(`❌ 查询关注状态失败: ${error.message}`);
    throw error;
  }
}

/**
 * 取消关注用户
 */
async function unfollowUser (userId) {
  try {
    console.log(`\n👋 正在取消关注用户: ${userId}`);
    const response = await fetch(`${BASE_URL}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`取消关注失败: ${response.status} - ${data.message}`);
    }

    if (data.code !== 200) {
      throw new Error(`取消关注失败: ${data.message}`);
    }

    console.log(`✅ 取消关注成功！`);
    console.log(`   消息: ${data.data.message}`);
    return data.data;
  } catch (error) {
    console.error(`❌ 取消关注失败: ${error.message}`);
    throw error;
  }
}

/**
 * 运行完整的测试流程
 */
async function runFullTest () {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 用户详情 API 完整功能测试');
    console.log('='.repeat(60));

    // 第一步: 登录
    await login('test@example.com', 'password123');

    // 第二步: 获取其他用户的详情（需要一个不同的用户 ID）
    // 这里假设有一个其他用户，ID 为 '550e8400-e29b-41d4-a716-446655440000'
    targetUserId = '550e8400-e29b-41d4-a716-446655440000';

    console.log(`\n📋 开始测试目标用户: ${targetUserId}`);
    await getUserDetail(targetUserId);

    // 第三步: 尝试关注这个用户
    console.log(`\n📊 测试关注功能...`);
    await followUser(targetUserId);

    // 第四步: 查询关注状态
    await getFollowStatus(targetUserId);

    // 第五步: 再次获取用户详情（应该显示更新后的关注者数）
    console.log(`\n🔄 重新查询用户详情（验证关注者数是否更新）...`);
    await getUserDetail(targetUserId);

    // 第六步: 取消关注
    console.log(`\n🧪 测试取消关注功能...`);
    await unfollowUser(targetUserId);

    // 第七步: 再次查询关注状态
    await getFollowStatus(targetUserId);

    // 第八步: 最后查询一次用户详情
    console.log(`\n✔️ 最终验证用户详情...`);
    await getUserDetail(targetUserId);

    console.log('\n' + '='.repeat(60));
    console.log('✨ 所有测试完成！用户详情 API 功能正常！');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ 测试流程中止:', error.message);
    console.log('\n💡 提示:');
    console.log('  1. 确保后端服务器正在运行 (localhost:3000)');
    console.log('  2. 确保数据库中有有效的用户账号 (test@example.com / password123)');
    console.log('  3. 确保至少有两个用户账号用于测试');
    console.log('');
  }
}

// 执行测试
runFullTest().catch(console.error);
