const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    const [users] = await connection.query(
      'SELECT id, email, nickname FROM users WHERE deleted_at IS NULL LIMIT 10'
    );

    console.log('数据库中的用户:');
    users.forEach(u => {
      console.log(`  - ${u.id}: ${u.email} (${u.nickname})`);
    });

  } finally {
    await connection.end();
  }
}

checkUsers().catch(console.error);
