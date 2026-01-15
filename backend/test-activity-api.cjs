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

  if (result.statusCode === 201) {
    console.log('活动ID:', result.body.data.id);
    console.log('活动标题:', result.body.data.title);
    console.log('✅ 创建成功');
    return result.body.data.id;
  } else {
    console.log('❌ 创建失败:', result.body?.message);
    return null;
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

  if (result.statusCode === 200) {
    console.log('活动总数:', result.body.data.pagination.total);
    console.log('当前页:', result.body.data.pagination.page);
    console.log('返回数量:', result.body.data.items.length);
    console.log('✅ 获取成功');
  } else {
    console.log('❌ 获取失败');
  }
}

// 4. 获取活动详情
async function getActivityDetail(activityId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/activities/${activityId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 4. 获取活动详情 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('活动标题:', result.body.data.title);
    console.log('参与人数:', result.body.data.participant_count);
    console.log('创建者:', result.body.data.creator.nickname);
    console.log('✅ 获取成功');
  } else {
    console.log('❌ 获取失败');
  }
}

// 5. 更新活动
async function updateActivity(activityId) {
  const data = JSON.stringify({
    title: '周末爬山活动（名额增加）',
    max_participants: 15
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/activities/${activityId}`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const result = await makeRequest(options, data);
  console.log('\n=== 5. 更新活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('新标题:', result.body.data.title);
    console.log('新人数限制:', result.body.data.max_participants);
    console.log('✅ 更新成功');
  } else {
    console.log('❌ 更新失败:', result.body?.message);
  }
}

// 6. 登录另一个用户
async function loginAnotherUser() {
  const data = JSON.stringify({
    email: 'lisi@test.com',
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
  console.log('\n=== 6. 切换用户(李四) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    authToken = result.body.data.token;
    console.log('✅ 登录成功');
    return true;
  } else {
    console.log('❌ 登录失败');
    return false;
  }
}

// 7. 加入活动
async function joinActivity(activityId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/activities/${activityId}/join`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 7. 加入活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 201) {
    console.log('参与ID:', result.body.data.id);
    console.log('✅ 加入成功');
  } else {
    console.log('❌ 加入失败:', result.body?.message);
  }
}

// 8. 获取我参与的活动
async function getMyJoinedActivities() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/activities/my-joined',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 8. 获取我参与的活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('参与的活动数:', result.body.data.pagination.total);
    console.log('✅ 获取成功');
  } else {
    console.log('❌ 获取失败');
  }
}

// 9. 退出活动
async function leaveActivity(activityId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/activities/${activityId}/leave`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 9. 退出活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 204) {
    console.log('✅ 退出成功');
  } else {
    console.log('❌ 退出失败:', result.body?.message);
  }
}

// 10. 切换回第一个用户并获取我创建的活动
async function getMyCreatedActivities() {
  // 先登录回张三
  const data = JSON.stringify({
    email: 'zhangsan@test.com',
    password: 'password123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const loginResult = await makeRequest(loginOptions, data);
  if (loginResult.statusCode === 200) {
    authToken = loginResult.body.data.token;
  }

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/activities/my-created',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 10. 获取我创建的活动(张三) ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200) {
    console.log('创建的活动数:', result.body.data.pagination.total);
    console.log('✅ 获取成功');
  } else {
    console.log('❌ 获取失败');
  }
}

// 11. 删除活动
async function deleteActivity(activityId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/activities/${activityId}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  };

  const result = await makeRequest(options);
  console.log('\n=== 11. 删除活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 204) {
    console.log('✅ 删除成功');
  } else {
    console.log('❌ 删除失败:', result.body?.message);
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试活动API...');

  try {
    await login();
    const activityId = await createActivity();

    if (activityId) {
      await getActivities();
      await getActivityDetail(activityId);
      await updateActivity(activityId);

      const switched = await loginAnotherUser();
      if (switched) {
        await joinActivity(activityId);
        await getMyJoinedActivities();
        await leaveActivity(activityId);
      }

      await getMyCreatedActivities();
      await deleteActivity(activityId);
    }

    console.log('\n✅ 所有活动API测试完成!');
  } catch (error) {
    console.error('\n❌ 测试出错:', error.message);
  }
}

runTests();
