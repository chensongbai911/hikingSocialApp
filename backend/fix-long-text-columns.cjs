const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    console.log('修改 activities 表...');
    await conn.query('ALTER TABLE activities MODIFY COLUMN cover_image_url LONGTEXT');
    console.log('✅ cover_image_url 已修改为 LONGTEXT');

    console.log('修改 users 表...');
    await conn.query('ALTER TABLE users MODIFY COLUMN avatar_url LONGTEXT');
    console.log('✅ avatar_url 已修改为 LONGTEXT');

    console.log('修改 user_photos 表...');
    await conn.query('ALTER TABLE user_photos MODIFY COLUMN photo_url LONGTEXT NOT NULL');
    console.log('✅ photo_url 已修改为 LONGTEXT');

    console.log('修改 messages 表 - image_url...');
    await conn.query('ALTER TABLE messages MODIFY COLUMN image_url LONGTEXT');
    console.log('✅ image_url 已修改为 LONGTEXT');

    console.log('修改 messages 表 - file_url...');
    await conn.query('ALTER TABLE messages MODIFY COLUMN file_url LONGTEXT');
    console.log('✅ file_url 已修改为 LONGTEXT');

    console.log('\n✅ 所有列都已修改为 LONGTEXT！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await conn.end();
  }
})();
