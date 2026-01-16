/**
 * 测试创建对话 API
 * 验证修复后的参数验证逻辑
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3000;

// 登录获取 token
async function login (email, password) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password });

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
      res.on('data', (chunk) => { body += chunk; });
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

// 创建对话
async function createConversation (token, targetUserId) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ targetUserId });

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/v1/messages/conversations',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          reject(new Error('解析响应失败: ' + error.message));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 主测试流程
async function main () {
  console.log('🧪 测试创建对话 API\n');

  try {
    // 1. 登录获取 token（使用默认测试用户）
    console.log('🔐 正在登录...');
    const token = await login('mowalla1@example.com', 'password123');
    console.log('✅ 登录成功\n');

    // 2. 测试创建对话（使用字符串格式的用户ID）
    console.log('📝 测试参数: { targetUserId: "user-004" }');
    const response = await createConversation(token, 'user-004');

    console.log('\n📊 API 响应:');
    console.log(JSON.stringify(response, null, 2));

    if (response.code === 0) {
      console.log('\n✅ 测试通过！对话创建成功');
      console.log(`   对话ID: ${response.data.conversation.id}`);
    } else if (response.code === 2001) {
      console.log('\n❌ 测试失败！参数验证仍有问题');
      console.log(`   错误信息: ${response.message}`);
      console.log(`   详情: ${response.details}`);
    } else {
      console.log(`\n⚠️  返回了其他错误码: ${response.code}`);
      console.log(`   消息: ${response.message}`);
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

main();
