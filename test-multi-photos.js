// 测试多照片功能
const testData = {
  title: '测试活动 - 多照片',
  description: '测试6张照片上传',
  location: '北京香山',
  start_time: '2024-06-01T09:00:00',
  end_time: '2024-06-01T17:00:00',
  difficulty: 'moderate',
  max_participants: 20,
  photos: [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5',
    'https://picsum.photos/800/600?random=6'
  ]
};

console.log('测试数据准备完成：');
console.log(JSON.stringify(testData, null, 2));
console.log('\n请在前端创建活动页面测试以下场景：');
console.log('1. 创建活动并上传6张照片');
console.log('2. 检查第一张照片是否作为封面');
console.log('3. 编辑活动，查看是否正确加载所有照片');
console.log('4. 修改照片（删除/新增）');
console.log('5. 保存并查看活动详情');
