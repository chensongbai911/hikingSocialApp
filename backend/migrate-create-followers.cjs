const mysql = require('mysql2/promise');

async function createFollowersTable() {
  const connection = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('开始创建关注者表...\n');

    // 创建 user_followers 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_followers (
        id VARCHAR(36) PRIMARY KEY COMMENT '关注关系ID',
        follower_id VARCHAR(36) NOT NULL COMMENT '粉丝用户ID',
        following_id VARCHAR(36) NOT NULL COMMENT '被关注用户ID',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',
        KEY idx_follower_id (follower_id),
        KEY idx_following_id (following_id),
        UNIQUE KEY unique_follow (follower_id, following_id),
        CONSTRAINT fk_follower_id FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_following_id FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注者表'
    `);

    console.log('✅ user_followers 表创建成功');

    // 验证表结构
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'user_followers' AND TABLE_SCHEMA = 'hiking_app'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n表结构信息:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (${col.IS_NULLABLE === 'YES' ? '可空' : '非空'}) - ${col.COLUMN_COMMENT}`);
    });

    console.log('\n✅ 数据库迁移完成！');

  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('⚠️  user_followers 表已存在');
    } else {
      console.error('❌ 创建表失败:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

createFollowersTable().catch(console.error);
