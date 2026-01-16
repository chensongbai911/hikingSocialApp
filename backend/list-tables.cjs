const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: '115.190.252.62',
    user: 'hiking_user',
    password: 'senbochen',
    database: 'hiking_app'
  });

  try {
    const [tables] = await conn.query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='hiking_app'");
    console.log('现有表:');
    tables.forEach(t => console.log('  -', t.TABLE_NAME));
  } finally {
    await conn.end();
  }
})();
