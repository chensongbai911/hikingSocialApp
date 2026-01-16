/**
 * 完整测试：登录 → 测试 /api/v1/auth/me 接口性能
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3000;

// 登录获取 token
async function login () {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'zhangsan@test.com',
      password: 'password123'
    });

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.code === 200 && response.data.token) {
            resolve(response.data.token);
          } else {
            reject(new Error('登录失败: ' + (response.message || '未知错误')));
          }
        } catch (error) {
          reject(new Error('解析登录响应失败: ' + error.message));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 测试 /me 接口
function testMe (token) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        try {
          const jsonData = JSON.parse(data);
          resolve({ duration, response: jsonData });
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 主测试流程
async function main () {
  console.log('🧪 开始测试 /api/v1/auth/me 接口优化效果\n');

  try {
    // 1. 登录获取 token
    console.log('🔐 正在登录...');
    const token = await login();
    console.log('✅ 登录成功，获取到 token\n');

    // 2. 执行多次请求测试
    console.log('📊 执行 5 次请求测试性能...\n');
    const results = [];

    for (let i = 0; i < 5; i++) {
      const { duration, response } = await testMe(token);
      results.push(duration);

      console.log(`第 ${i + 1} 次请求:`);
      console.log(`  ⏱️  响应时间: ${duration}ms`);
      console.log(`  📦 状态码: ${response.code}`);

      // 第一次显示详细信息
      if (i === 0 && response.code === 200 && response.data) {
        console.log(`\n📝 返回的用户数据:`);
        console.log(`  👤 用户ID: ${response.data.id}`);
        console.log(`  👤 昵称: ${response.data.nickname}`);
        console.log(`  📧 邮箱: ${response.data.email}`);
        console.log(`  🖼️  头像: ${response.data.avatar_url || '未设置'}`);
        console.log(`  🏷️  偏好: ${response.data.preferences?.length || 0} 个`);
        console.log(`  📷 照片: ${response.data.photos?.length || 0} 张`);

        // 验证 URL 格式
        if (response.data.avatar_url) {
          const valid = /^https?:\/\//.test(response.data.avatar_url);
          console.log(`  ${valid ? '✅' : '❌'} 头像URL格式: ${valid ? '正确 (完整URL)' : '错误 (相对路径)'}`);
        }

        if (response.data.photos?.length > 0) {
          const firstPhoto = response.data.photos[0];
          const valid = /^https?:\/\//.test(firstPhoto.photo_url);
          console.log(`  ${valid ? '✅' : '❌'} 照片URL格式: ${valid ? '正确 (完整URL)' : '错误 (相对路径)'}`);

          if (valid) {
            console.log(`  📸 示例照片URL: ${firstPhoto.photo_url.substring(0, 60)}...`);
          }
        }
        console.log('');
      }

      // 等待一小段时间
      if (i < 4) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // 3. 性能统计
    console.log('\n📈 性能统计结果:');
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);

    console.log(`  📊 平均响应时间: ${avg.toFixed(2)}ms`);
    console.log(`  ⚡ 最快: ${min}ms`);
    console.log(`  🐌 最慢: ${max}ms`);

    // 4. 性能评估
    console.log('\n🎯 优化效果评估:');
    if (avg < 50) {
      console.log('  🌟 卓越！响应时间 < 50ms，优化效果非常显著');
    } else if (avg < 100) {
      console.log('  ✅ 优秀！响应时间 < 100ms，性能表现良好');
    } else if (avg < 200) {
      console.log('  👍 良好！响应时间 < 200ms，符合预期');
    } else {
      console.log('  ⚠️  一般，响应时间 > 200ms，仍有优化空间');
    }

    console.log('\n✨ 测试完成！\n');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

main();
