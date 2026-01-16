module.exports = {
  apps: [
    {
      name: 'hiking-app-backend',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // 错误日志
      error_file: './logs/pm2-error.log',
      // 输出日志
      out_file: './logs/pm2-out.log',
      // 日志格式
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 自动重启
      autorestart: true,
      // 监听文件变化
      watch: false,
      // 最大内存
      max_memory_restart: '500M',
    },
  ],
};
