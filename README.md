# vps-deploy-skills

**Battle-tested deploy skills for indie developers running Next.js + FastAPI on a VPS.**

Stop copy-pasting configs from Stack Overflow. These skills encode real production patterns — PM2 process management, Nginx reverse proxy, SSL certs, and zero-downtime deploys — into agent-readable files that work with Claude Code, Cursor, Codex, and any agent that supports the Agent Skills spec.

> Built from real projects. Not tutorials.

---

## What's inside

| Skill | What it does |
|---|---|
| [`nextjs-deploy`](./skills/nextjs-deploy/) | Build and deploy Next.js App Router apps via PM2 |
| [`fastapi-deploy`](./skills/fastapi-deploy/) | Deploy FastAPI with uvicorn + PM2, virtualenv-aware |
| [`nginx`](./skills/nginx/) | Reverse proxy configs, CORS headers, static file serving |
| [`pm2`](./skills/pm2/) | Process management, port conflict resolution, ecosystem configs |
| [`ssl-certbot`](./skills/ssl-certbot/) | Certbot SSL setup + auto-renewal for any domain |

---

## Stack

```
Frontend  →  Next.js 14+ (App Router) + TypeScript + Tailwind
Backend   →  FastAPI (Python) + uvicorn
Process   →  PM2
Proxy     →  Nginx
SSL       →  Certbot (Let's Encrypt)
Server    →  Ubuntu 22/24 VPS
Deploy    →  SFTP upload → remote build → PM2 restart
```

---

## Quick start

### With Claude Code
```bash
/plugin marketplace add your-github/vps-deploy-skills
```

### With npx
```bash
npx skills add your-github/vps-deploy-skills
```

### Manual
Clone the repo and reference the relevant `SKILL.md` in your agent's context.

---

## Who this is for

- Solo developers running multiple projects on one VPS
- Indie hackers deploying Telegram Mini Apps, SaaS tools, dashboards
- Anyone tired of debugging PM2 port conflicts and duplicate CORS headers at 2am

---

## 🇷🇺 На русском

**Боевые скиллы деплоя для indie-разработчиков на VPS.**

Прекрати копировать конфиги со Stack Overflow. Эти скиллы кодируют реальные продакшн-паттерны — PM2, Nginx, SSL, zero-downtime деплой — в файлы, которые понимают Claude Code, Cursor, Codex и любой агент со спецификацией Agent Skills.

> Сделано из реальных проектов. Не из туториалов.

**Для кого:**
- Solo-разработчики с несколькими проектами на одном VPS
- Indie-хакеры с Telegram Mini Apps, SaaS, дашбордами
- Все, кто отлаживал конфликты портов PM2 и дублирующиеся CORS-заголовки в 2 ночи

---

## Contributing

PRs welcome. If you have a battle-tested pattern that saved your project — add it.

## License

MIT
