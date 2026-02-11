import { pool } from '../config/database';
import { randomUUID } from 'crypto';
import bcryptjs from 'bcryptjs';

const DEMO_EMAIL = 'demo@hikingsocial.app';
const DEMO_PASSWORD = '123456';

const seedActivities = [
  {
    id: 'demo-activity-1',
    title: '西湖晨练轻徒步',
    description: '环湖轻徒步，适合新手和慢跑爱好者，边走边拍照。',
    cover_image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&auto=format&fit=crop&q=80',
    location: '浙江省杭州市·西湖',
    latitude: 30.2529,
    longitude: 120.1500,
    start_offset_hours: 48,
    duration_hours: 3,
    difficulty: 'easy',
    max_participants: 20,
    status: 'approved',
    route_description: '断桥残雪→白堤→苏堤→花港观鱼，全程约6公里。',
    equipment_required: '舒适运动鞋、饮用水、遮阳帽',
  },
  {
    id: 'demo-activity-2',
    title: '香山红叶小环线',
    description: '秋日红叶徒步，路线平缓，适合朋友结伴出行。',
    cover_image_url: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800&h=600&auto=format&fit=crop&q=80',
    location: '北京市·香山公园',
    latitude: 39.9996,
    longitude: 116.1860,
    start_offset_hours: 72,
    duration_hours: 4,
    difficulty: 'moderate',
    max_participants: 15,
    status: 'approved',
    route_description: '香山门→碧云寺→鬼见愁→双清别墅，全程约8公里。',
    equipment_required: '登山鞋、饮用水、轻便外套',
  },
  {
    id: 'demo-activity-3',
    title: '深圳塘朗山夜景徒步',
    description: '傍晚登山看夜景，适合有一定体能基础的徒步者。',
    cover_image_url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&auto=format&fit=crop&q=80',
    location: '广东省深圳市·塘朗山',
    latitude: 22.5524,
    longitude: 113.9733,
    start_offset_hours: 36,
    duration_hours: 3,
    difficulty: 'moderate',
    max_participants: 12,
    status: 'approved',
    route_description: '塘朗山入口→主峰→观景平台，往返约5公里。',
    equipment_required: '头灯、登山鞋、饮用水、薄外套',
  },
];

async function ensureDemoUser(): Promise<string> {
  const [rows] = await pool.query<any[]>(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
    [DEMO_EMAIL]
  );
  if (rows.length > 0) {
    return rows[0].id;
  }

  const userId = randomUUID();
  const passwordHash = await bcryptjs.hash(DEMO_PASSWORD, 10);

  await pool.query(
    `INSERT INTO users (
      id, email, password_hash, nickname, avatar_url, gender, age, bio, hiking_level, is_active, is_verified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      userId,
      DEMO_EMAIL,
      passwordHash,
      '示例组织者',
      'https://picsum.photos/200/200?random=demo-organizer',
      'other',
      28,
      '热爱户外的示例用户',
      'intermediate',
      true,
      true,
    ]
  );

  return userId;
}

async function insertActivities(creatorId: string) {
  for (const item of seedActivities) {
    const [exists] = await pool.query<any[]>(
      'SELECT id FROM activities WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [item.id]
    );
    if (exists.length > 0) {
      console.log(`- 活动已存在，跳过: ${item.id}`);
      continue;
    }

    const startTime = new Date(Date.now() + item.start_offset_hours * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + item.duration_hours * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO activities (
        id, creator_id, title, description, cover_image_url, location, latitude, longitude,
        start_time, end_time, difficulty, max_participants, status, route_description, equipment_required,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        item.id,
        creatorId,
        item.title,
        item.description,
        item.cover_image_url,
        item.location,
        item.latitude,
        item.longitude,
        startTime,
        endTime,
        item.difficulty,
        item.max_participants,
        item.status,
        item.route_description,
        item.equipment_required,
      ]
    );

    console.log(`+ 已插入活动: ${item.id}`);
  }
}

async function main() {
  try {
    console.log('🚀 开始插入可加入活动数据...');
    const creatorId = await ensureDemoUser();
    await insertActivities(creatorId);
    console.log('✅ 可加入活动数据处理完成');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ 插入失败:', error?.message || error);
    process.exit(1);
  }
}

main();
