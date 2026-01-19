# vNext 开发环境配置指南

**创建日期**: 2026-01-19
**适用于**: 阶段 0 代码优化 + Sprint 1 准备

---

## 📋 环境变量配置

### 后端环境变量

创建 `backend/.env`:

```bash
# 服务器配置
NODE_ENV=development
PORT=3000
HOST=localhost

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hiking_social_app
DB_CONNECTION_LIMIT=10

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT 配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 高德地图 API
AMAP_KEY=your-amap-api-key
AMAP_SECRET=your-amap-secret-key

# 和风天气 API
QWEATHER_KEY=your-qweather-api-key

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### 前端环境变量

创建 `frontend/.env.development`:

```bash
# API 基础路径
VITE_API_BASE_URL=http://localhost:3000

# 高德地图 Key (前端)
VITE_AMAP_KEY=your-amap-web-key

# 和风天气 Key (前端)
VITE_QWEATHER_KEY=your-qweather-web-key

# WebSocket 路径
VITE_WS_URL=ws://localhost:3000

# 是否启用 Mock
VITE_USE_MOCK=false
```

---

## 🔧 TypeScript 配置

### 后端 tsconfig.json (启用 strict)

编辑 `backend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
```

---

## 📦 ESLint 配置

### 后端 .eslintrc.json

创建 `backend/.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "no-console": ["error", { "allow": ["error"] }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
```

### 前端 .eslintrc.cjs

编辑 `frontend/.eslintrc.cjs`:

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    '@vue/typescript/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2021,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
}
```

---

## 🗄️ 数据库配置

### MySQL 配置文件

创建 `backend/src/config/database.ts`:

```typescript
import mysql from 'mysql2/promise'

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hiking_social_app',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}

export const pool = mysql.createPool(dbConfig)

// 测试连接
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ Database connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}
```

### Redis 配置文件

创建 `backend/src/config/redis.ts`:

```typescript
import Redis from 'ioredis'

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
}

export const redis = new Redis(redisConfig)

redis.on('connect', () => {
  console.log('✅ Redis connected successfully')
})

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err)
})

export default redis
```

---

## 🚀 启动脚本

### 后端 package.json scripts

确保 `backend/package.json` 有以下脚本:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "test": "jest",
    "migrate": "node -r ts-node/register src/database/migrate.ts",
    "migrate:rollback": "node -r ts-node/register src/database/rollback.ts"
  }
}
```

### 前端 package.json scripts

确保 `frontend/package.json` 有以下脚本:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .vue,.ts",
    "lint:fix": "eslint src --ext .vue,.ts --fix",
    "type-check": "vue-tsc --noEmit"
  }
}
```

---

## 📝 数据库迁移执行

### 创建迁移工具

创建 `backend/src/database/migrate.ts`:

```typescript
import fs from 'fs'
import path from 'path'
import { pool } from '../config/database'

async function migrate() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations')
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'))

    console.log(`Found ${files.length} migration files`)

    for (const file of files.sort()) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

      // 分割 SQL 语句 (按分号)
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        await pool.query(statement)
      }

      console.log(`✅ Completed: ${file}`)
    }

    console.log('🎉 All migrations completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
```

### 执行迁移

```powershell
# 进入后端目录
cd backend

# 执行迁移
npm run migrate
```

---

## ✅ 验证清单

### 后端验证

```powershell
# 1. 安装依赖
cd backend
npm install

# 2. TypeScript 编译检查
npm run build

# 3. ESLint 检查
npm run lint

# 4. 启动开发服务器
npm run dev

# 5. 测试 API (新窗口)
curl http://localhost:3000/api/health
```

### 前端验证

```powershell
# 1. 安装依赖
cd frontend
npm install

# 2. TypeScript 类型检查
npm run type-check

# 3. ESLint 检查
npm run lint

# 4. 启动开发服务器
npm run dev

# 5. 浏览器访问
# http://localhost:5173
```

---

## 🔑 API Key 申请指南

### 1. 高德地图 API Key

**步骤**:

1. 访问: https://console.amap.com/
2. 注册/登录账号
3. 进入「应用管理」→「我的应用」
4. 创建新应用:
   - 应用名称: 徒步社交 App
   - 应用类型: Web 端 (JSAPI)
5. 添加 Key:
   - 服务平台: Web端 (JSAPI)
   - 白名单: \* (开发环境)
6. 复制 Key 到 `.env` 文件

**免费额度**: 10,000 次/天

### 2. 和风天气 API Key

**步骤**:

1. 访问: https://dev.qweather.com/
2. 注册/登录账号
3. 进入「控制台」→「项目管理」
4. 创建项目:
   - 项目名称: 徒步社交 App
   - 选择免费开发版
5. 创建 Key:
   - 选择 Web API
6. 复制 Key 到 `.env` 文件

**免费额度**: 1,000 次/天

---

## 📊 开发工具推荐

### 必装 VS Code 扩展

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- MySQL (cweijan.vscode-mysql-client2)
- Thunder Client (API 测试)
- GitLens

### 数据库管理工具

- MySQL Workbench
- DBeaver
- Navicat (付费)

### API 测试工具

- Postman
- Insomnia
- Thunder Client (VS Code 扩展)

---

**配置完成后，即可开始阶段 0 的代码优化工作！**
