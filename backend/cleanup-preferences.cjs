const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('清除重复的偏好ID问题...');

    // 删除重复ID
    await conn.query('DELETE FROM user_preferences WHERE id = "pref-002"');
    console.log('✅ 清除了重复的 pref-002');

    // 查看当前偏好
    const [prefs] = await conn.query('SELECT * FROM user_preferences');
    console.log('\n当前用户偏好:');
    prefs.forEach(p => {
      console.log(`  - ID: ${p.id}, User: ${p.user_id}, Type: ${p.preference_type}, Value: ${p.preference_value}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await conn.end();
  }
})();
