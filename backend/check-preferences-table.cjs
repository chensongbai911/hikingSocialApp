const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    const [rows] = await conn.query('SHOW CREATE TABLE user_preferences');
    console.log('user_preferences 表结构:');
    console.log(rows[0]['Create Table']);
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await conn.end();
  }
})();
