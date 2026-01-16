/**
 * 测试 /api/v1/auth/me 接口性能
 * 验证优化后的响应速度和图片URL
 */

const http = require('http');

// 配置
const HOST = 'localhost';
const PORT = 3000;
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDAxIiwiZW1haWwiOiJtb3dhbGxhMUBleGFtcGxlLmNvbSIsImlhdCI6MTczNzAzMzMyMCwiZXhwIjoxNzM3NjM4MTIwfQ.rTCF4ld19CtMUIlzZMnjPvLdO7q8JG12t7F_RYhFyqY'; // 需要有效的 token

console.log('🧪 开始测试 /api/v1/auth/me 接口...\n');

// 执行多次请求测试性能
async function testPerformance (times = 5) {
  const results = [];

  for (let i = 0; i < times; i++) {
    const startTime = Date.now();

    try {
      const response = await makeRequest();
      const endTime = Date.now();
      const duration = endTime - startTime;

      results.push(duration);

      console.log(`📊 第 ${i + 1} 次请求:`);
      console.log(`   ⏱️  响应时间: ${duration}ms`);
      console.log(`   ✅ 状态码: ${response.code}`);

      // 第一次请求时显示详细信息
      if (i === 0 && response.data) {
        console.log(`\n📝 返回数据结构:`);
        console.log(`   👤 用户ID: ${response.data.id}`);
        console.log(`   📧 邮箱: ${response.data.email}`);
        console.log(`   🖼️  头像URL: ${response.data.avatar_url || '未设置'}`);
        console.log(`   🏷️  偏好数量: ${response.data.preferences?.length || 0}`);
        console.log(`   📷 照片数量: ${response.data.photos?.length || 0}`);

        // 验证图片 URL 格式
        if (response.data.avatar_url) {
          const isValidUrl = response.data.avatar_url.startsWith('http://') ||
            response.data.avatar_url.startsWith('https://');
          console.log(`   ${isValidUrl ? '✅' : '❌'} 头像URL格式: ${isValidUrl ? '正确' : '错误'}`);
        }

        if (response.data.photos?.length > 0) {
          const firstPhotoUrl = response.data.photos[0].photo_url;
          const isValidUrl = firstPhotoUrl.startsWith('http://') ||
            firstPhotoUrl.startsWith('https://');
          console.log(`   ${isValidUrl ? '✅' : '❌'} 照片URL格式: ${isValidUrl ? '正确' : '错误'}`);
          console.log(`   📸 第一张照片: ${firstPhotoUrl}`);
        }
      }
      console.log('');

    } catch (error) {
      console.error(`❌ 第 ${i + 1} 次请求失败:`, error.message);
    }

    // 等待一小段时间再发送下一个请求
    if (i < times - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // 统计结果
  console.log('\n📈 性能统计:');
  const avg = results.reduce((a, b) => a + b, 0) / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);

  console.log(`   平均响应时间: ${avg.toFixed(2)}ms`);
  console.log(`   最快响应时间: ${min}ms`);
  console.log(`   最慢响应时间: ${max}ms`);

  // 性能评估
  console.log('\n🎯 性能评估:');
  if (avg < 100) {
    console.log('   ⚡ 优秀 - 响应速度非常快！');
  } else if (avg < 300) {
    console.log('   ✅ 良好 - 响应速度符合预期');
  } else if (avg < 500) {
    console.log('   ⚠️  一般 - 响应速度有优化空间');
  } else {
    console.log('   ❌ 较慢 - 需要进一步优化');
  }
}

// 发送 HTTP 请求
function makeRequest () {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 运行测试
testPerformance(5).then(() => {
  console.log('\n✨ 测试完成！\n');
}).catch((error) => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});
