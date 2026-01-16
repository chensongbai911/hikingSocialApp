const http = require('http');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDA1IiwiZW1haWwiOiJ0ZXN0dXNlckB0ZXN0LmNvbSIsImlhdCI6MTc2ODU0MTUxOSwiZXhwIjoxNzY5MTQ2MzE5fQ.EZL_VV2-hygQbC5t9Gf-_sqp5xfV6IIsnFeyvsGPURA';

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

// 测试更新用户偏好
async function updatePreferences() {
  const data = JSON.stringify({
    preferences: [
      { type: 'hiking_preference', value: '爱看风景' },
      { type: 'activity_type', value: '登山' },
      { type: 'distance_preference', value: '10-20公里' }
    ]
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/users/preferences',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const result = await makeRequest(options, data);
  console.log('\n=== 更新用户偏好 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 200 || result.statusCode === 201) {
    console.log('✅ 偏好更新成功！');
    console.log('更新后的偏好数:', result.body.data?.length || 0);
    if (result.body.data) {
      result.body.data.forEach((pref, idx) => {
        console.log(`  ${idx + 1}. ${pref.preference_type}: ${pref.preference_value}`);
      });
    }
  } else {
    console.log('❌ 更新失败');
    console.log('Message:', result.body?.message);
    console.log('Details:', result.body?.details);
  }
}

async function main() {
  try {
    await updatePreferences();
  } catch (error) {
    console.error('错误:', error);
  }
}

main();
