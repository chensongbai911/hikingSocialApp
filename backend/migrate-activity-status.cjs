const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('修改 activities 表的 status 列为 VARCHAR...');

    // 修改 status 列从 ENUM 改为 VARCHAR
    await conn.query(`
      ALTER TABLE activities
      MODIFY COLUMN status VARCHAR(50) COMMENT '活动状态'
    `);
    console.log('✅ status 列已修改为 VARCHAR(50)');

    // 验证修改
    const [rows] = await conn.query('DESCRIBE activities');
    const statusRow = rows.find(r => r.Field === 'status');
    console.log('\n修改后的 status 列定义:');
    console.log(`  类型: ${statusRow.Type}`);
    console.log(`  可为空: ${statusRow.Null}`);
    console.log(`  默认值: ${statusRow.Default || 'NULL'}`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await conn.end();
  }
})();
