module.exports = {
  apps: [{
    name: 'chat-room',
    script: 'npm',
    args: 'run preview',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}