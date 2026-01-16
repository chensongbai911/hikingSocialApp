const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDA1IiwiZW1haWwiOiJ0ZXN0dXNlckB0ZXN0LmNvbSIsImlhdCI6MTc2ODU0MTUxOSwiZXhwIjoxNzY5MTQ2MzE5fQ.EZL_VV2-hygQbC5t9Gf-_sqp5xfV6IIsnFeyvsGPURA';

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

async function main() {
  try {
    console.log('🎯 测试新状态值 "recruiting"...\n');

    // 1. 创建新活动
    console.log('1️⃣ 创建新活动...\n');

    const createData = JSON.stringify({
      title: '春季徒步招募',
      description: '春天来了，邀请大家一起去山里踏青',
      location: '八达岭长城',
      latitude: 40.3,
      longitude: 115.9,
      start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      difficulty: 'easy',
      max_participants: 30
    });

    const createOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/activities',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(createData, 'utf8')
      }
    };

    const createResult = await makeRequest(createOptions, createData);

    if (createResult.statusCode === 201) {
      const activityId = createResult.body.data.id;
      console.log('✅ 活动创建成功！');
      console.log(`   活动ID: ${activityId}`);
      console.log(`   当前状态: ${createResult.body.data.status}\n`);

      // 2. 更新活动状态为 "recruiting"
      console.log('2️⃣ 更新活动状态为 "recruiting"（招募中）...\n');

      const updateData = JSON.stringify({
        status: 'recruiting',
        description: '【招募中】春季徒步活动 - 诚邀各位驴友加入！'
      });

      const updateOptions = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/v1/activities/${activityId}`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(updateData, 'utf8')
        }
      };

      const updateResult = await makeRequest(updateOptions, updateData);

      if (updateResult.statusCode === 200) {
        console.log('✅ 活动状态已更新为 "recruiting"！\n');
        const activity = updateResult.body.data;
        console.log('更新后的活动信息:');
        console.log(`  📌 ID: ${activity.id}`);
        console.log(`  📝 标题: ${activity.title}`);
        console.log(`  📍 描述: ${activity.description}`);
        console.log(`  ✅ 状态: ${activity.status}`);
        console.log(`  📊 难度: ${activity.difficulty}`);
        console.log(`  👥 最大参与: ${activity.max_participants}人`);
      } else {
        console.log('❌ 更新失败');
        console.log('错误:', updateResult.body?.message);
      }

      // 3. 测试其他状态值
      console.log('\n3️⃣ 测试其他状态值转换...\n');

      const statuses = ['approved', 'ongoing', 'completed'];
      for (const status of statuses) {
        const updateData = JSON.stringify({ status });
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: `/api/v1/activities/${activityId}`,
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(updateData, 'utf8')
          }
        };

        const result = await makeRequest(options, updateData);
        if (result.statusCode === 200) {
          console.log(`  ✅ ${status}: 成功`);
        } else {
          console.log(`  ❌ ${status}: 失败`);
        }
      }

    } else {
      console.log('❌ 创建失败');
      console.log('错误:', createResult.body?.message);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

main();
