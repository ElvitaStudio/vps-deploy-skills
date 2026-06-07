# PM2 Skill

Manage Node.js and Python processes on a VPS with PM2.

**Use this skill when:** the user needs to start, stop, restart, debug, or configure PM2 processes for any app on the server.

---

## Essential commands

```bash
pm2 list                          # show all processes + status + ports
pm2 status                        # alias for list
pm2 logs <name> --lines 50        # tail logs
pm2 logs <name> --err --lines 50  # errors only
pm2 restart <name>                # restart without downtime
pm2 stop <name>                   # stop process
pm2 delete <name>                 # remove from PM2 registry
pm2 save                          # persist process list across reboots
pm2 startup                       # generate systemd startup command
```

---

## Starting processes

### Next.js app
```bash
pm2 start node_modules/.bin/next --name myapp -- start -p 3010
# or
pm2 start npm --name myapp -- start -- -p 3010
```

### FastAPI / Python
```bash
pm2 start ".venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" \
  --name myapp-backend
```

### Telegram bot (Python)
```bash
pm2 start ".venv/bin/python bot.py" --name myapp-bot
```

### Static file server (fallback)
```bash
pm2 start "npx serve dist -p 3020" --name myapp-static
```

---

## ecosystem.config.js (recommended for multiple apps)

```js
module.exports = {
  apps: [
    {
      name: 'myapp-frontend',
      script: 'node_modules/.bin/next',
      args: 'start -p 3010',
      cwd: '/root/myapp/frontend',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'myapp-backend',
      script: '.venv/bin/python',
      args: '-m uvicorn app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/root/myapp/backend',
      interpreter: 'none',
    },
    {
      name: 'myapp-bot',
      script: '.venv/bin/python',
      args: 'bot.py',
      cwd: '/root/myapp/backend',
      interpreter: 'none',
    },
  ],
};
```

```bash
pm2 start ecosystem.config.js
pm2 restart ecosystem.config.js --only myapp-frontend
pm2 save
```

---

## Port management (critical for multi-project servers)

Before adding a new process, always check what's running:

```bash
pm2 list
ss -tlnp | grep LISTEN
```

Keep a manual port registry (add as comment in ecosystem.config.js or README):
```
3005  →  project-alpha frontend
3006  →  project-alpha admin
3010  →  project-beta frontend
8000  →  project-alpha backend
8001  →  project-beta backend
```

### Find what's using a port
```bash
lsof -i :3010
ss -tlnp | grep 3010
```

### Kill a process occupying a port
```bash
kill -9 $(lsof -t -i :3010)
```

---

## Common issues & fixes

### Process keeps crashing (status: errored)
```bash
pm2 logs <name> --err --lines 100  # read the actual error
# Common causes: port conflict, missing .env, syntax error in app
```

### Changes not reflected after restart
PM2 caches the start command. If you changed the port or script path:
```bash
pm2 delete <name>
pm2 start <new-command> --name <name>
pm2 save
```

### `pm2 save` not persisting after reboot
```bash
pm2 startup   # run this, then copy-paste the output command as root
pm2 save
```

### Process starts but immediately exits
```bash
pm2 logs <name>   # check stdout/stderr for startup error
# For Python: check if .venv exists and has all dependencies
# For Next.js: check if .next/ build exists
```

### Wrong working directory
PM2 must be started from the correct `cwd`. Use `--cwd` flag or ecosystem.config.js `cwd` field.

---

## 🇷🇺 На русском

**Используй этот скилл** для управления процессами через PM2.

**Самые нужные команды:**
- `pm2 list` — список процессов
- `pm2 logs <имя> --lines 50` — логи
- `pm2 restart <имя>` — перезапуск
- `pm2 save` — сохранить после изменений

**Правило портов:** перед добавлением нового процесса всегда проверяй `pm2 list` и `ss -tlnp`. Конфликт портов — самая частая причина сбоя деплоя.

**Процесс падает сразу после старта** → `pm2 logs <имя> --err` покажет причину. Чаще всего: нет `.env`, нет `.next` билда, или не установлены зависимости в `.venv`.
