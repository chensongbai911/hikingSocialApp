/**
 * 测试关注功能 API
 * 包括：关注用户、取消关注、获取关注状态、获取用户详情
 */

const BASE_URL = 'http://localhost:3000/api/v1';

// 测试用户凭证
let authToken = '';
let testUserId = 'user-007'; // 被关注的用户ID

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log (message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 1. 登录获取 token
async function login () {
  log('\n📝 测试 1: 用户登录', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123456'
      })
    });

    const data = await response.json();

    if (data.code === 200 && data.data.token) {
      authToken = data.data.token;
      log('✅ 登录成功', 'green');
      log(`Token: ${authToken.substring(0, 20)}...`, 'yellow');
      return true;
    } else {
      log(`❌ 登录失败: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 登录请求失败: ${error.message}`, 'red');
    return false;
  }
}

// 2. 获取用户详情（包含关注数）
async function getUserDetail () {
  log('\n📝 测试 2: 获取用户详情', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/users/${testUserId}/detail`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (data.code === 200 && data.data) {
      log('✅ 获取用户详情成功', 'green');
      log(`用户: ${data.data.nickname}`, 'yellow');
      log(`关注者数: ${data.data.followers_count}`, 'yellow');
      log(`活动数: ${data.data.activities_count}`, 'yellow');
      return data.data;
    } else {
      log(`❌ 获取失败: ${data.message}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    return null;
  }
}

// 3. 获取关注状态
async function getFollowStatus () {
  log('\n📝 测试 3: 获取关注状态', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/users/${testUserId}/follow-status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const data = await response.json();

    if (data.code === 200 && data.data) {
      log('✅ 获取关注状态成功', 'green');
      log(`是否关注: ${data.data.is_following ? '是' : '否'}`, 'yellow');
      return data.data.is_following;
    } else {
      log(`❌ 获取失败: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    return false;
  }
}

// 4. 关注用户
async function followUser () {
  log('\n📝 测试 4: 关注用户', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/users/${testUserId}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.code === 200) {
      log('✅ 关注成功', 'green');
      return true;
    } else {
      log(`❌ 关注失败: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    return false;
  }
}

// 5. 取消关注
async function unfollowUser () {
  log('\n📝 测试 5: 取消关注', 'blue');

  try {
    const response = await fetch(`${BASE_URL}/users/${testUserId}/follow`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.code === 200) {
      log('✅ 取消关注成功', 'green');
      return true;
    } else {
      log(`❌ 取消关注失败: ${data.message}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ 请求失败: ${error.message}`, 'red');
    return false;
  }
}

// 主测试流程
async function runTests () {
  log('='.repeat(60), 'blue');
  log('🚀 开始测试关注功能 API', 'blue');
  log('='.repeat(60), 'blue');

  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ 登录失败，测试终止', 'red');
    return;
  }

  // 等待一下
  await new Promise(resolve => setTimeout(resolve, 500));

  // 2. 获取初始用户详情
  const initialDetail = await getUserDetail();
  const initialFollowers = initialDetail ? initialDetail.followers_count : 0;

  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. 检查初始关注状态
  const initialStatus = await getFollowStatus();

  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. 如果已关注，先取消关注
  if (initialStatus) {
    await unfollowUser();
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 5. 测试关注功能
  await followUser();
  await new Promise(resolve => setTimeout(resolve, 500));

  // 6. 验证关注状态
  const afterFollowStatus = await getFollowStatus();
  await new Promise(resolve => setTimeout(resolve, 500));

  // 7. 验证用户详情中的关注数增加
  const afterFollowDetail = await getUserDetail();
  const afterFollowCount = afterFollowDetail ? afterFollowDetail.followers_count : 0;

  await new Promise(resolve => setTimeout(resolve, 500));

  // 8. 测试取消关注
  await unfollowUser();
  await new Promise(resolve => setTimeout(resolve, 500));

  // 9. 验证取消关注后的状态
  const afterUnfollowStatus = await getFollowStatus();
  await new Promise(resolve => setTimeout(resolve, 500));

  // 10. 验证取消关注后的用户详情
  const afterUnfollowDetail = await getUserDetail();
  const afterUnfollowCount = afterUnfollowDetail ? afterUnfollowDetail.followers_count : 0;

  // 测试结果总结
  log('\n' + '='.repeat(60), 'blue');
  log('📊 测试结果汇总', 'blue');
  log('='.repeat(60), 'blue');

  log(`\n初始关注者数: ${initialFollowers}`, 'yellow');
  log(`关注后关注者数: ${afterFollowCount}`, 'yellow');
  log(`取消关注后关注者数: ${afterUnfollowCount}`, 'yellow');

  log(`\n关注状态变化:`, 'yellow');
  log(`  初始: ${initialStatus ? '已关注' : '未关注'}`, 'yellow');
  log(`  关注后: ${afterFollowStatus ? '已关注' : '未关注'}`, 'yellow');
  log(`  取消后: ${afterUnfollowStatus ? '已关注' : '未关注'}`, 'yellow');

  // 验证测试结果
  let allPassed = true;

  log('\n✓ 测试验证:', 'blue');

  if (afterFollowStatus === true) {
    log('  ✅ 关注后状态正确', 'green');
  } else {
    log('  ❌ 关注后状态错误', 'red');
    allPassed = false;
  }

  if (afterFollowCount === initialFollowers + 1 || afterFollowCount > initialFollowers) {
    log('  ✅ 关注后计数增加', 'green');
  } else {
    log('  ❌ 关注后计数未增加', 'red');
    allPassed = false;
  }

  if (afterUnfollowStatus === false) {
    log('  ✅ 取消关注后状态正确', 'green');
  } else {
    log('  ❌ 取消关注后状态错误', 'red');
    allPassed = false;
  }

  if (afterUnfollowCount === initialFollowers || afterUnfollowCount < afterFollowCount) {
    log('  ✅ 取消关注后计数减少', 'green');
  } else {
    log('  ❌ 取消关注后计数未减少', 'red');
    allPassed = false;
  }

  log('\n' + '='.repeat(60), 'blue');
  if (allPassed) {
    log('🎉 所有测试通过！', 'green');
  } else {
    log('⚠️  部分测试失败', 'red');
  }
  log('='.repeat(60), 'blue');
}

// 执行测试
runTests().catch(error => {
  log(`\n💥 测试过程出错: ${error.message}`, 'red');
  console.error(error);
});
