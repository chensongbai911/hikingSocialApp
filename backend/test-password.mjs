import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'senbochen',
  database: 'hiking_app'
});

async function test() {
  const [users] = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = ?',
    ['zhangsan@test.com']
  );

  if (users.length === 0) {
    console.log('❌ 用户不存在');
    return;
  }

  const user = users[0];
  console.log('用户信息:', {
    id: user.id,
    email: user.email,
    passwordHash: user.password_hash.substring(0, 30) + '...'
  });

  const password = 'password123';
  console.log('\\n测试密码:', password);

  const isValid = await bcrypt.compare(password, user.password_hash);
  console.log('密码验证结果:', isValid ? '✅ 成功' : '❌ 失败');

  // 生成新的哈希进行比较
  const newHash = await bcrypt.hash(password, 10);
  console.log('\\n新生成的哈希:', newHash.substring(0, 30) + '...');

  const testNew = await bcrypt.compare(password, newHash);
  console.log('新哈希验证结果:', testNew ? '✅ 成功' : '❌ 失败');

  await pool.end();
}

test().catch(console.error);
