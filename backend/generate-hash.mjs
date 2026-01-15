import bcrypt from 'bcryptjs';

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\\nUpdate SQL:');
  console.log(`UPDATE users SET password_hash = '${hash}' WHERE email IN ('zhangsan@test.com', 'lisi@test.com', 'wangwu@test.com', 'zhaoliu@test.com', 'sunqi@test.com', 'zhouba@test.com', 'wujiu@test.com', 'zhengshi@test.com', 'chenyi@test.com', 'huanger@test.com');`);
}

generateHash();
