const mysql = require('mysql2/promise');

async function addRegionToUsers() {
  const connection = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('开始添加地区字段...\n');

    // 1. 添加 province 字段
    try {
      await connection.query(
        'ALTER TABLE users ADD COLUMN province VARCHAR(100) COMMENT "省份/地区" AFTER bio'
      );
      console.log('✅ 添加 province 字段成功');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  province 字段已存在');
      } else {
        throw e;
      }
    }

    // 2. 添加 city 字段
    try {
      await connection.query(
        'ALTER TABLE users ADD COLUMN city VARCHAR(100) COMMENT "城市" AFTER province'
      );
      console.log('✅ 添加 city 字段成功');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  city 字段已存在');
      } else {
        throw e;
      }
    }

    // 3. 添加 region 字段
    try {
      await connection.query(
        'ALTER TABLE users ADD COLUMN region VARCHAR(200) COMMENT "完整地区描述" AFTER city'
      );
      console.log('✅ 添加 region 字段成功');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  region 字段已存在');
      } else {
        throw e;
      }
    }

    // 4. 创建索引
    try {
      await connection.query('CREATE INDEX idx_province ON users(province)');
      console.log('✅ 创建 province 索引成功');
    } catch (e) {
      if (e.code === 'ER_DUP_KEY_NAME') {
        console.log('⚠️  province 索引已存在');
      }
    }

    try {
      await connection.query('CREATE INDEX idx_city ON users(city)');
      console.log('✅ 创建 city 索引成功');
    } catch (e) {
      if (e.code === 'ER_DUP_KEY_NAME') {
        console.log('⚠️  city 索引已存在');
      }
    }

    console.log('\n验证字段信息...\n');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = 'hiking_app'
      AND COLUMN_NAME IN ('province', 'city', 'region')
      ORDER BY ORDINAL_POSITION
    `);

    columns.forEach(col => {
      console.log(`${col.COLUMN_NAME}: ${col.COLUMN_TYPE} (nullable: ${col.IS_NULLABLE}) - ${col.COLUMN_COMMENT}`);
    });

    console.log('\n✅ 数据库迁移完成！');

  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

addRegionToUsers().catch(console.error);
