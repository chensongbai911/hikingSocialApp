const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('创建 activity_photos 表...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS activity_photos (
        id VARCHAR(36) PRIMARY KEY COMMENT '照片ID',
        activity_id VARCHAR(36) NOT NULL COMMENT '活动ID',
        photo_url LONGTEXT NOT NULL COMMENT '照片URL',
        is_cover BOOLEAN DEFAULT FALSE COMMENT '是否为封面图',
        sort_order INT DEFAULT 0 COMMENT '排序（0=封面）',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
        KEY idx_activity_id (activity_id),
        KEY idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动照片表'
    `);
    console.log('✅ activity_photos 表创建成功');

  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('✅ activity_photos 表已存在');
    } else {
      console.error('❌ 错误:', error.message);
    }
  } finally {
    await conn.end();
  }
})();
