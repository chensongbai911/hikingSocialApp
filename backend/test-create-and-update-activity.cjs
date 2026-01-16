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
    // 1. 创建新活动
    console.log('1️⃣ 创建新活动...\n');

    const createData = JSON.stringify({
      title: '户外徒步挑战赛',
      description: '一起去爬山，欣赏自然风景',
      location: '京郊山区',
      latitude: 40.5,
      longitude: 116.0,
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      difficulty: 'moderate',
      max_participants: 20
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
      console.log(`   活动ID: ${activityId}\n`);

      // 2. 更新活动状态
      console.log('2️⃣ 更新活动状态...\n');

      const updateData = JSON.stringify({
        status: 'approved',  // 状态必须是: pending, approved, ongoing, completed, cancelled
        description: '已获批准的户外徒步挑战赛 - 报名已开放'
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

      console.log('状态码:', updateResult.statusCode);

      if (updateResult.statusCode === 200) {
        console.log('✅ 活动更新成功！\n');
        console.log('更新后的活动信息:');
        const activity = updateResult.body.data;
        console.log(`  📌 ID: ${activity.id}`);
        console.log(`  📝 标题: ${activity.title}`);
        console.log(`  📍 描述: ${activity.description}`);
        console.log(`  ✅ 状态: ${activity.status}`);
        console.log(`  💪 难度: ${activity.difficulty}`);
        console.log(`  👥 最大参与人数: ${activity.max_participants}`);
        console.log(`  📍 地点: ${activity.location}`);
      } else {
        console.log('❌ 更新失败');
        console.log('错误信息:', updateResult.body?.message);
        console.log('详情:', updateResult.body?.details);
      }
    } else {
      console.log('❌ 创建失败');
      console.log('错误信息:', createResult.body?.message);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

main();
