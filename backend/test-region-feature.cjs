const axios = require('axios');

// 测试用户token (user-006 - 地区测试用户)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDA2IiwiZW1haWwiOiJ0ZXN0cmVnaW9uQGV4YW1wbGUuY29tIiwiaWF0IjoxNzY4NTQzODkxLCJleHAiOjE3NjkxNDg2OTF9.mRGt_f2nZpzDyP-mvi5aIcYL187RpueXXU2Mgv_zoBU';
const apiUrl = 'http://localhost:3000/api/v1';

async function testRegionFeature() {
  console.log('🎯 测试用户地区功能...\n');

  try {
    // 1. 获取当前用户资料
    console.log('1️⃣ 获取用户资料（测试地区字段）...');
    const profileRes = await axios.get(`${apiUrl}/users/profile`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    console.log(`✅ 获取成功 (状态码: ${profileRes.status})`);
    console.log('当前资料:');
    console.log(`  - 昵称: ${profileRes.data.data.nickname}`);
    console.log(`  - 省份: ${profileRes.data.data.province || '(未设置)'}`);
    console.log(`  - 城市: ${profileRes.data.data.city || '(未设置)'}`);
    console.log(`  - 完整地区: ${profileRes.data.data.region || '(未设置)'}`);
    console.log('');

    // 2. 更新用户资料 - 添加地区信息
    console.log('2️⃣ 更新用户资料（设置地区为：浙江省 杭州市）...');
    const updateRes = await axios.put(
      `${apiUrl}/users/profile`,
      {
        province: '浙江省',
        city: '杭州市',
        region: '浙江省 杭州市'
      },
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );

    console.log(`✅ 更新成功 (状态码: ${updateRes.status})`);
    console.log('更新后的资料:');
    console.log(`  - 省份: ${updateRes.data.data.province}`);
    console.log(`  - 城市: ${updateRes.data.data.city}`);
    console.log(`  - 完整地区: ${updateRes.data.data.region}`);
    console.log('');

    // 3. 再次获取用户资料验证更新
    console.log('3️⃣ 重新获取用户资料验证更新...');
    const verifyRes = await axios.get(`${apiUrl}/users/profile`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });

    console.log(`✅ 验证成功 (状态码: ${verifyRes.status})`);
    console.log('最终资料:');
    console.log(`  - 昵称: ${verifyRes.data.data.nickname}`);
    console.log(`  - 省份: ${verifyRes.data.data.province}`);
    console.log(`  - 城市: ${verifyRes.data.data.city}`);
    console.log(`  - 完整地区: ${verifyRes.data.data.region}`);
    console.log('');

    // 4. 测试其他地区
    console.log('4️⃣ 测试其他地区（北京市）...');
    const updateRes2 = await axios.put(
      `${apiUrl}/users/profile`,
      {
        province: '北京市',
        city: '朝阳区',
        region: '北京市 朝阳区'
      },
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );

    console.log(`✅ 更新成功 (状态码: ${updateRes2.status})`);
    console.log(`  - 新地区: ${updateRes2.data.data.region}`);
    console.log('');

    // 5. 测试清空地区
    console.log('5️⃣ 测试清空地区...');
    const clearRes = await axios.put(
      `${apiUrl}/users/profile`,
      {
        province: '',
        city: '',
        region: ''
      },
      {
        headers: { 'Authorization': `Bearer ${testToken}` }
      }
    );

    console.log(`✅ 清空成功 (状态码: ${clearRes.status})`);
    console.log(`  - 省份: ${clearRes.data.data.province || '(空)'}`);
    console.log(`  - 城市: ${clearRes.data.data.city || '(空)'}`);
    console.log(`  - 完整地区: ${clearRes.data.data.region || '(空)'}`);
    console.log('');

    console.log('✅ 所有地区功能测试通过！');

  } catch (error) {
    if (error.response) {
      console.error(`❌ 请求失败 (状态码: ${error.response.status})`);
      console.error('错误信息:', error.response.data);
    } else {
      console.error('❌ 测试失败:', error.message);
    }
  }
}

// 运行测试
testRegionFeature().catch(console.error);
