# Nginx Skill

Configure Nginx as a reverse proxy for Next.js + FastAPI apps on a VPS.

**Use this skill when:** the user needs to set up, modify, or debug Nginx config for a web app with a frontend and API backend on the same server.

---

## Stack assumptions

- Ubuntu 22/24 LTS
- Nginx installed via apt
- Certbot for SSL (see ssl-certbot skill)
- Configs in `/etc/nginx/sites-available/` with symlinks to `sites-enabled/`
- Frontend (Next.js) on a local port (e.g. 3010)
- Backend (FastAPI) on a local port (e.g. 8000)

---

## Standard config: frontend + API on separate subdomains

```nginx
# /etc/nginx/sites-available/myproject

# Frontend: yourdomain.com
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# API: api.yourdomain.com
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Enable config

```bash
ln -s /etc/nginx/sites-available/myproject /etc/nginx/sites-enabled/
nginx -t          # test config — always before reload
systemctl reload nginx
```

---

## CORS headers in Nginx

⚠️ Only add CORS in Nginx if your backend does NOT set them.  
If FastAPI already has `CORSMiddleware` — **do not** add CORS headers in Nginx. Duplicate headers break browsers.

```nginx
# Only if backend has NO CORS middleware:
location / {
    proxy_pass http://localhost:8000;

    add_header 'Access-Control-Allow-Origin' 'https://yourdomain.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;

    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

---

## Static file serving (for Vite/plain HTML builds)

```nginx
server {
    listen 80;
    server_name app.yourdomain.com;

    root /var/www/myapp;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|ico|svg|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Common issues & fixes

### `nginx -t` fails: unknown directive
Check for typos. Most common: missing semicolons, unclosed braces.

### 502 Bad Gateway
The upstream app isn't running.
```bash
pm2 status               # is the app alive?
curl http://localhost:<PORT>  # test directly
pm2 logs <name>          # check for startup errors
```

### 404 on API routes but frontend works
Check that `server_name` matches exactly. Wildcard `_` catches unmatched domains.

### Duplicate CORS headers error in browser
```bash
# Find who's setting the header:
curl -I https://api.yourdomain.com/endpoint | grep -i access-control
# Remove CORS from either Nginx or the backend — keep only one source
```

### `connect() failed (111: Connection refused)`
App isn't listening on the expected port.
```bash
ss -tlnp | grep <PORT>
pm2 restart <name>
```

### Changes to config not applied
```bash
nginx -t && systemctl reload nginx
# If still old: systemctl restart nginx
```

---

## Multiple projects on same server

Each project gets its own config file:
```
/etc/nginx/sites-available/anasta
/etc/nginx/sites-available/crypto
/etc/nginx/sites-available/newproject
```

Each config handles its own `server_name` set. Never put two projects in one file.

---

## 🇷🇺 На русском

**Используй этот скилл** для настройки Nginx как реверс-прокси для Next.js + FastAPI.

**Главное правило:** CORS настраивай только в одном месте — либо в Nginx, либо в FastAPI. Если в обоих — браузер получит дублирующиеся заголовки и сломается.

**Стандартный флоу:**
1. Создай конфиг в `/etc/nginx/sites-available/`
2. Сделай симлинк в `sites-enabled/`
3. Проверь: `nginx -t`
4. Примени: `systemctl reload nginx`

**502 Bad Gateway** → приложение не запущено. Проверь `pm2 status` и `pm2 logs`.
**Дубль CORS** → убери заголовки из Nginx или из FastAPI, оставь одно.
