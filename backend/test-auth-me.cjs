const axios = require('axios');

// 使用新注册的测试用户
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDA2IiwiZW1haWwiOiJ0ZXN0cmVnaW9uQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY4NTQzODkxLCJleHAiOjE3NjkxNDg2OTF9.mRGt_f2nZpzDyP-mvi5aIcYL187RpueXXU2Mgv_zoBU';
const apiUrl = 'http://localhost:3000/api/v1';

async function testAuthMe() {
  console.log('🧪 测试 /auth/me 接口返回地区字段...\n');

  try {
    // 1. 先设置用户地区信息
    console.log('1️⃣ 设置用户地区信息...');
    await axios.put(
      `${apiUrl}/users/profile`,
      {
        province: '广东省',
        city: '深圳市',
        region: '广东省 深圳市'
      },
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );
    console.log('✅ 地区信息设置成功\n');

    // 2. 测试 /auth/me 接口
    console.log('2️⃣ 调用 /auth/me 接口...');
    const response = await axios.get(`${apiUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    console.log(`✅ 状态码: ${response.status}`);
    console.log('\n返回的用户信息:');
    console.log(`  - ID: ${response.data.data.id}`);
    console.log(`  - 昵称: ${response.data.data.nickname}`);
    console.log(`  - 邮箱: ${response.data.data.email}`);
    console.log(`  - 性别: ${response.data.data.gender || '(未设置)'}`);
    console.log(`  - 年龄: ${response.data.data.age || '(未设置)'}`);
    console.log(`  - 省份: ${response.data.data.province || '(未设置)'}`);
    console.log(`  - 城市: ${response.data.data.city || '(未设置)'}`);
    console.log(`  - 地区: ${response.data.data.region || '(未设置)'}`);
    console.log(`  - 头像: ${response.data.data.avatar_url ? '已设置' : '(未设置)'}`);
    console.log(`  - 偏好数量: ${(response.data.data.preferences || []).length}`);
    console.log(`  - 照片数量: ${(response.data.data.photos || []).length}`);

    // 验证地区字段是否存在
    if (response.data.data.province && response.data.data.city && response.data.data.region) {
      console.log('\n✅ 地区字段返回正常！');
      console.log(`   完整地区: ${response.data.data.region}`);
    } else {
      console.log('\n⚠️  地区字段缺失:');
      if (!response.data.data.province) console.log('   - province 字段缺失');
      if (!response.data.data.city) console.log('   - city 字段缺失');
      if (!response.data.data.region) console.log('   - region 字段缺失');
    }

    // 3. 测试 /users/profile 接口对比
    console.log('\n3️⃣ 对比 /users/profile 接口...');
    const profileResponse = await axios.get(`${apiUrl}/users/profile`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    console.log(`✅ 状态码: ${profileResponse.status}`);
    console.log(`  - 地区: ${profileResponse.data.data.region}`);

    if (response.data.data.region === profileResponse.data.data.region) {
      console.log('\n✅ 两个接口返回的地区信息一致！');
    } else {
      console.log('\n⚠️  两个接口返回的地区信息不一致：');
      console.log(`   /auth/me: ${response.data.data.region}`);
      console.log(`   /users/profile: ${profileResponse.data.data.region}`);
    }

  } catch (error) {
    if (error.response) {
      console.error(`❌ 请求失败 (状态码: ${error.response.status})`);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('❌ 测试失败:', error.message);
    }
  }
}

testAuthMe().catch(console.error);
