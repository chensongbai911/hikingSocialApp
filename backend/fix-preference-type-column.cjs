const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('修改 user_preferences 表的 preference_type 列为 VARCHAR...');
    await conn.query(`
      ALTER TABLE user_preferences
      MODIFY COLUMN preference_type VARCHAR(100) COMMENT '偏好类型'
    `);
    console.log('✅ preference_type 已修改为 VARCHAR(100)');

    // 验证修改
    const [rows] = await conn.query('SHOW CREATE TABLE user_preferences');
    console.log('\n修改后的表结构:');
    console.log(rows[0]['Create Table']);
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await conn.end();
  }
})();
