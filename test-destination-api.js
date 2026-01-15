// 测试目的地API
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试函数
async function testDestinationAPI () {
  console.log('========================================');
  console.log('🧪 目的地 API 测试');
  console.log('========================================\n');

  try {
    // 1. 测试获取所有目的地
    console.log('1️⃣ 测试：获取所有目的地');
    const allDest = await axios.get(`${BASE_URL}/destinations`);
    console.log(`✅ 成功！共 ${allDest.data.data.total} 个目的地`);
    console.log(`   前3个：${allDest.data.data.destinations.slice(0, 3).map(d => d.name).join(', ')}\n`);

    // 2. 测试获取热门目的地
    console.log('2️⃣ 测试：获取热门目的地');
    const popular = await axios.get(`${BASE_URL}/destinations/popular?limit=5`);
    console.log(`✅ 成功！热门目的地 TOP 5：`);
    popular.data.data.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name} - 人气分数 ${d.popularity_score}`);
    });
    console.log('');

    // 3. 测试获取附近目的地
    console.log('3️⃣ 测试：获取附近目的地（北京坐标）');
    const nearby = await axios.get(`${BASE_URL}/destinations/nearby?latitude=39.9042&longitude=116.4074&radius=50`);
    console.log(`✅ 成功！50km 内找到 ${nearby.data.data.length} 个目的地`);
    nearby.data.data.forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name} - ${d.user_distance.toFixed(1)}km`);
    });
    console.log('');

    // 4. 测试搜索目的地
    console.log('4️⃣ 测试：搜索目的地（关键词：山）');
    const search = await axios.post(`${BASE_URL}/destinations/search`, {
      keyword: '山'
    });
    console.log(`✅ 成功！找到 ${search.data.data.length} 个结果`);
    search.data.data.slice(0, 3).forEach((d, i) => {
      console.log(`   ${i + 1}. ${d.name}`);
    });
    console.log('');

    // 5. 测试获取目的地详情
    console.log('5️⃣ 测试：获取目的地详情（ID: 1）');
    const detail = await axios.get(`${BASE_URL}/destinations/1`);
    console.log(`✅ 成功！目的地详情：`);
    console.log(`   名称：${detail.data.data.name}`);
    console.log(`   位置：${detail.data.data.area}`);
    console.log(`   坐标：${detail.data.data.latitude}°N, ${detail.data.data.longitude}°E`);
    console.log(`   难度：${detail.data.data.difficulty}`);
    console.log(`   距离：${detail.data.data.distance}km`);
    console.log(`   人气：${detail.data.data.popularity_score}`);
    console.log('');

    console.log('========================================');
    console.log('✅ 所有测试通过！');
    console.log('========================================');

  } catch (error) {
    console.error('❌ 测试失败：', error.message);
    if (error.response) {
      console.error('   响应状态：', error.response.status);
      console.error('   响应数据：', error.response.data);
    }
  }
}

// 运行测试
testDestinationAPI();
