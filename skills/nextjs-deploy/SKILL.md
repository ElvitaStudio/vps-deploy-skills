# Next.js Deploy Skill

Deploy Next.js 14+ App Router applications to a VPS using PM2 as the process manager.

**Use this skill when:** the user wants to deploy, redeploy, or troubleshoot a Next.js app on a remote VPS.

---

## Stack assumptions

- Next.js 14+ with App Router
- Node.js 18+
- PM2 installed globally (`npm i -g pm2`)
- Files uploaded via SFTP (e.g. Transmit, rsync, scp)
- App lives at `/root/<project>/frontend` or `/var/www/<project>`

---

## Standard deploy flow

### 1. Upload files to server
Upload the entire project directory via SFTP **excluding** `node_modules` and `.next`.

### 2. Install dependencies & build on server
```bash
cd /root/<project>/frontend
npm install
npm run build
```

### 3. Restart PM2 process
```bash
pm2 restart <process-name>
# or if starting for the first time:
pm2 start node_modules/.bin/next --name <process-name> -- start -p <PORT>
pm2 save
```

### 4. Verify
```bash
pm2 status
pm2 logs <process-name> --lines 20
curl http://localhost:<PORT>
```

---

## Environment variables

Next.js reads `.env.local` at build time for `NEXT_PUBLIC_*` vars.  
**Always rebuild after changing `.env.local`.**

```bash
# /root/<project>/frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

Server-side vars (not prefixed with `NEXT_PUBLIC_`) are read at runtime — no rebuild needed, but PM2 restart is required.

---

## PM2 start command variants

```bash
# Standard (uses package.json start script)
pm2 start npm --name myapp -- start

# With explicit port
pm2 start node_modules/.bin/next --name myapp -- start -p 3010

# From ecosystem file (recommended for multiple apps)
pm2 start ecosystem.config.js --only myapp
```

---

## Common issues & fixes

### Port already in use
```bash
pm2 list                          # find what's on the port
pm2 delete <conflicting-process>  # or change port
lsof -i :<PORT>                   # double-check
```

### Build fails: "out of memory"
```bash
NODE_OPTIONS=--max-old-space-size=512 npm run build
```

### App shows old version after deploy
```bash
pm2 stop <name>
rm -rf .next
npm run build
pm2 start <name>
```

### `.env.local` changes not reflected
Always rebuild: `npm run build && pm2 restart <name>`

---

## Multiple Next.js apps on one server

Each app must use a **unique port**. Keep a port registry:

```
3005 - project-alpha (pm2 id: 0)
3006 - project-beta-admin (pm2 id: 1)
3010 - project-gamma (pm2 id: 2)
```

Check before assigning a new port:
```bash
pm2 list
ss -tlnp | grep LISTEN
```

---

## 🇷🇺 На русском

**Используй этот скилл** когда нужно задеплоить, передеплоить или починить Next.js приложение на VPS.

**Стандартный флоу деплоя:**
1. Загрузи файлы через SFTP (без `node_modules` и `.next`)
2. На сервере: `npm install && npm run build`
3. Перезапусти PM2: `pm2 restart <имя-процесса>`
4. Проверь: `pm2 logs <имя> --lines 20`

**Частые проблемы:**
- Порт занят → `pm2 list` + смени порт или убей конфликтующий процесс
- Старая версия показывается → удали `.next`, пересобери
- `.env.local` не применяется → обязательно пересобери после изменений
