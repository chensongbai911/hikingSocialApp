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
    console.log('🎯 更新活动...\n');

    // 正确的状态值：'pending', 'approved', 'ongoing', 'completed', 'cancelled'
    const updateData = JSON.stringify({
      title: '周末爬山活动-已发布',
      description: '一起去香山看红叶，已获批准',
      status: 'approved',  // 使用合法的状态值
      difficulty: 'moderate',
      max_participants: 15
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/activities/act-007',
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData, 'utf8')
      }
    };

    const result = await makeRequest(options, updateData);

    console.log('状态码:', result.statusCode);

    if (result.statusCode === 200) {
      console.log('✅ 活动更新成功！\n');
      console.log('更新后的活动信息:');
      const activity = result.body.data;
      console.log(`  📌 ID: ${activity.id}`);
      console.log(`  📝 标题: ${activity.title}`);
      console.log(`  📍 描述: ${activity.description}`);
      console.log(`  ✅ 状态: ${activity.status}`);
      console.log(`  💪 难度: ${activity.difficulty}`);
      console.log(`  👥 最大参与人数: ${activity.max_participants}`);
    } else {
      console.log('❌ 更新失败');
      console.log('错误信息:', result.body?.message);
      console.log('详情:', result.body?.details);
      console.log('\n💡 提示: 状态值必须是: pending, approved, ongoing, completed, cancelled 之一');
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

main();
