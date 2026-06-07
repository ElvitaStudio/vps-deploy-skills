# FastAPI Deploy Skill

Deploy FastAPI applications with uvicorn to a VPS, managed by PM2.

**Use this skill when:** the user wants to deploy, redeploy, or troubleshoot a FastAPI backend on a remote VPS.

---

## Stack assumptions

- Python 3.10+
- Virtual environment at `.venv/` inside the project directory
- PM2 managing the uvicorn process
- App entry point: `app/main.py` with `app` as the FastAPI instance
- Environment variables loaded via `python-dotenv` (`load_dotenv()` in `main.py`)

---

## Standard deploy flow

### 1. Upload files to server
Upload project directory via SFTP **excluding** `.venv/`, `__pycache__/`, `*.pyc`.

### 2. Set up virtualenv on server (first time only)
```bash
cd /root/<project>/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

### 3. Update dependencies (subsequent deploys)
```bash
cd /root/<project>/backend
.venv/bin/pip install -r requirements.txt
```

### 4. Restart PM2 process
```bash
pm2 restart <process-name>
# or start for the first time:
pm2 start ".venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port <PORT>" \
  --name <process-name>
pm2 save
```

### 5. Verify
```bash
pm2 logs <process-name> --lines 20
curl http://localhost:<PORT>/docs
```

---

## Environment variables

Store in `.env` in the project root. Load with `python-dotenv`:

```python
# app/main.py
from dotenv import load_dotenv
load_dotenv()
```

```bash
# /root/<project>/backend/.env
DATABASE_URL=sqlite:///./data.db
SECRET_KEY=your-secret-key
TELEGRAM_BOT_TOKEN=your-token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password
```

**Never commit `.env` to git.** Add to `.gitignore`.

After changing `.env` — just `pm2 restart <name>`, no rebuild needed.

---

## PM2 start command

```bash
# Standard uvicorn via PM2
pm2 start ".venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" \
  --name myapp-backend

# With auto-reload (development only — never in production)
pm2 start ".venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" \
  --name myapp-backend-dev
```

---

## CORS configuration

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://app.yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

⚠️ **Do NOT add CORS headers in Nginx if already set in FastAPI** — duplicate headers cause browser errors. Pick one place.

---

## Common issues & fixes

### 422 Unprocessable Entity
The request body doesn't match the Pydantic model. Check:
```python
# Add default values to optional fields
class AnalyzeRequest(BaseModel):
    symbol: str
    model: str = "claude-sonnet-4-6"  # ← add defaults
```

### Module not found
```bash
# Make sure you're using the venv pip, not system pip
.venv/bin/pip install <package>
# NOT: pip install <package>
```

### Port conflict with another service
```bash
pm2 list
lsof -i :<PORT>
# change port in PM2 start command and Nginx upstream
```

### Logs show old code after deploy
```bash
pm2 restart <name>
# if still old: pm2 delete <name> → pm2 start ... → pm2 save
```

### SQLite database locked
```python
# Use check_same_thread=False for SQLite with FastAPI
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)
```

---

## 🇷🇺 На русском

**Используй этот скилл** когда нужно задеплоить, передеплоить или починить FastAPI бэкенд на VPS.

**Стандартный флоу:**
1. Загрузи файлы через SFTP (без `.venv/`, `__pycache__/`)
2. На сервере (первый раз): `python3 -m venv .venv && .venv/bin/pip install -r requirements.txt`
3. Обновить зависимости: `.venv/bin/pip install -r requirements.txt`
4. Перезапустить: `pm2 restart <имя>`

**Важно:**
- `.env` всегда на сервере, никогда в git
- После изменения `.env` → только `pm2 restart`, rebuild не нужен
- CORS настраивай либо в FastAPI, либо в Nginx — не в обоих сразу
- При 422 ошибках — добавь дефолтные значения в Pydantic модели
