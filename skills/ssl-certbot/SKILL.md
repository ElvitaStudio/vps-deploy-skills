# SSL Certbot Skill

Set up free SSL certificates with Let's Encrypt and Certbot for any domain on a VPS.

**Use this skill when:** the user needs to add HTTPS to a domain, renew certificates, or troubleshoot SSL issues.

---

## Stack assumptions

- Ubuntu 22/24 LTS
- Nginx already configured and running (see nginx skill)
- Domain DNS A-record pointing to the server IP
- Port 80 open and accessible from the internet

---

## Install Certbot (first time only)

```bash
apt update
apt install -y certbot python3-certbot-nginx
```

---

## Get certificate for a domain

```bash
# Single domain
certbot --nginx -d yourdomain.com

# Domain + www
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Multiple subdomains at once
certbot --nginx \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -d api.yourdomain.com \
  -d admin.yourdomain.com
```

Certbot will:
1. Verify domain ownership via HTTP challenge
2. Issue the certificate
3. Automatically update your Nginx config with SSL settings
4. Set up HTTP → HTTPS redirect

---

## Verify certificate

```bash
certbot certificates                     # list all certs + expiry dates
curl -I https://yourdomain.com           # check HTTPS works
openssl s_client -connect yourdomain.com:443 -brief  # check cert details
```

---

## Auto-renewal

Certbot installs a systemd timer automatically. Verify it:

```bash
systemctl status certbot.timer
# or test renewal:
certbot renew --dry-run
```

Certs renew automatically when <30 days remain. No manual action needed.

---

## Manual renewal (if needed)

```bash
certbot renew
systemctl reload nginx   # reload nginx after renewal
```

---

## Add new subdomain to existing cert

```bash
certbot --nginx -d existing.com -d api.existing.com -d newsubdomain.existing.com
# Include ALL domains (existing + new) in one command — Certbot replaces the cert
```

---

## Common issues & fixes

### `Connection refused` on port 80
Certbot needs port 80 open for the HTTP challenge.
```bash
ufw status
ufw allow 80
ufw allow 443
```

### DNS not propagated yet
```bash
dig yourdomain.com +short      # should return your server IP
# If wrong/empty: update DNS A-record, wait 5-30 min, retry
```

### Nginx config broken after Certbot
```bash
nginx -t         # identify syntax errors
# Certbot modifies your config — check the file for duplicate listen directives
```

### Certificate for wrong domain
```bash
certbot delete --cert-name wrongdomain.com
# Then re-run certbot for correct domain
```

### Rate limit hit (too many cert requests)
Let's Encrypt limits: 5 certs per domain per week.  
Use `--staging` flag to test without hitting limits:
```bash
certbot --nginx --staging -d yourdomain.com
```

### Renewal fails: port 80 blocked by Nginx config
```bash
# Make sure Nginx serves /.well-known/acme-challenge/ on port 80
# Certbot handles this automatically if you used --nginx flag
certbot renew --nginx
```

---

## What Certbot adds to Nginx config

After running `certbot --nginx`, your config gets:
```nginx
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

And a redirect block:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

---

## 🇷🇺 На русском

**Используй этот скилл** для настройки бесплатного SSL через Let's Encrypt.

**Быстрый старт:**
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

**Авторенью работает автоматически** — systemd таймер проверяет каждые 12 часов. Проверь: `certbot renew --dry-run`.

**Главные проблемы:**
- DNS не указывает на сервер → `dig yourdomain.com +short` должен вернуть IP сервера
- Порт 80 закрыт → `ufw allow 80 && ufw allow 443`
- Добавляешь новый поддомен → перечисли ВСЕ домены в одной команде certbot, иначе старые потеряются
