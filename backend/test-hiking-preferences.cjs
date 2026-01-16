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
    // 1. 更新徒步偏好 - 单一接口调用
    console.log('🏔️ 更新徒步偏好...\n');

    const preferences = [
      { type: 'hiking_time', value: '周末上午' },
      { type: 'activity_type', value: '登山' },
      { type: 'special_interest', value: '欣赏自然风景' },
      { type: 'distance_preference', value: '10-20公里' },
      { type: 'difficulty_level', value: 'moderate' }
    ];

    const updateData = JSON.stringify({ preferences });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/users/preferences',
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
      console.log('✅ 徒步偏好更新成功！\n');
      console.log('已保存的偏好:');
      if (result.body.data && Array.isArray(result.body.data)) {
        result.body.data.forEach((pref, idx) => {
          console.log(`  ${idx + 1}. [${pref.preference_type}] ${pref.preference_value}`);
        });
      }
      console.log('\n📊 总偏好数:', result.body.data?.length || 0);
    } else {
      console.log('❌ 更新失败');
      console.log('错误信息:', result.body?.message);
      if (result.body?.details) {
        console.log('详情:', result.body.details);
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

main();
