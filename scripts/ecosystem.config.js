// ecosystem.config.js
// PM2 process registry for multi-project VPS
// Run: pm2 start ecosystem.config.js
// Save: pm2 save

module.exports = {
  apps: [
    // ─── PROJECT ALPHA ───────────────────────────────────────────
    {
      name: 'alpha-frontend',       // pm2 name (used in restart/logs)
      script: 'node_modules/.bin/next',
      args: 'start -p 3010',
      cwd: '/root/alpha/frontend',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'alpha-backend',
      script: '.venv/bin/python',
      args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/root/alpha/backend',
      interpreter: 'none',
    },
    {
      name: 'alpha-bot',
      script: '.venv/bin/python',
      args: 'bot.py',
      cwd: '/root/alpha/backend',
      interpreter: 'none',
    },

    // ─── PROJECT BETA ────────────────────────────────────────────
    {
      name: 'beta-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3005',
      cwd: '/root/beta/frontend',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'beta-backend',
      script: '.venv/bin/python',
      args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8001',
      cwd: '/root/beta/backend',
      interpreter: 'none',
    },

    // ─── ADMIN PANEL (Next.js on custom port) ────────────────────
    {
      name: 'beta-admin',
      script: 'node_modules/.bin/next',
      args: 'start -p 3006',
      cwd: '/root/beta/admin',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};

/*
PORT REGISTRY — update this when adding new projects
─────────────────────────────────────────────────────
3005  alpha-frontend
3006  beta-admin
3010  beta-frontend
8000  alpha-backend
8001  beta-backend
─────────────────────────────────────────────────────
Check ports in use: ss -tlnp | grep LISTEN
*/
