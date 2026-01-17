module.exports = {
  apps: [{
    name: 'hiking-app-backend',
    script: 'dist/server.js',
    env: {
      NODE_ENV: 'production',
      USE_API_PREFIX: 'true',
      DB_HOST: 'localhost',
      DB_PORT: '3306',
      DB_NAME: 'hiking_app',
      DB_USER: 'hiking_user',
      DB_PASSWORD: 'senbochen',
      PORT: '3000',
      API_VERSION: 'v1',
      JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
      CORS_ORIGIN: '*'
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '200M',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
