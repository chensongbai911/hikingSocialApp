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

// 创建活动
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
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data, 'utf8')
    }
  };

  const result = await makeRequest(options, data);
  console.log('\n=== 创建活动 ===');
  console.log('Status:', result.statusCode);

  if (result.statusCode === 201 || result.statusCode === 200) {
    console.log('✅ 活动创建成功！');
    console.log('活动ID:', result.body.data?.id);
    console.log('活动标题:', result.body.data?.title);
  } else {
    console.log('❌ 创建失败');
    console.log('Message:', result.body?.message);
    console.log('Code:', result.body?.code);
  }
}

async function main() {
  try {
    await createActivity();
  } catch (error) {
    console.error('错误:', error);
  }
}

main();
