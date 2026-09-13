# InterviewGuard — Railway Ready Repository

Full-stack AI-assisted interview integrity monitoring platform ready for instant dual-service deployment on **Railway**.

---

## 📁 Repository Structure

```
InterviewGuard-DevFolio/
├── frontend/                     # React 19 + Vite Frontend
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── package-lock.json
│   ├── railway.json
│   ├── netlify.toml
│   ├── .env.example
│   └── README.md
│
├── backend/                      # FastAPI + YOLOv11 + OpenCV Backend
│   ├── main.py
│   ├── requirements.txt
│   ├── yolo11n.pt
│   ├── Procfile
│   ├── railway.json
│   └── README.md
│
├── README.md
└── .gitignore
```

---

## 🚂 Railway Deployment Guide (Deploy Both Parts)

You can deploy both parts from this repository into a single Railway project with two independent services:

### Part 1: Deploy Backend Service
1. In your Railway dashboard, click **+ New** > **GitHub Repo** (or CLI / Deploy Template).
2. Set **Root Directory** to: `backend`
3. **Builder**: `Nixpacks` (auto-detected)
4. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Railway will automatically inject the `$PORT` variable and start the FastAPI service.
6. Once deployed, copy your backend's public domain (e.g., `https://backend-production-xxxx.up.railway.app`).

### Part 2: Deploy Frontend Service
1. In the same Railway project, click **+ New** > **GitHub Repo** (same repo).
2. Set **Root Directory** to: `frontend`
3. **Builder**: `Nixpacks` (auto-detected)
4. **Build Command**: `npm run build`
5. **Start Command**: `npm run start` (serves the production build via `vite preview --host 0.0.0.0 --port $PORT`)
6. Under **Variables**, add:
   - `VITE_API_URL` = `https://backend-production-xxxx.up.railway.app` (your backend URL from Part 1).
7. Generate domain for frontend and open in browser.

---

## 🛡️ Integrity & Scoring Highlights
- **Human-Assisted Review Only**: Strictly non-automated; provides assistive risk indicators only.
- **Scoring Engine (0–100)**: Skill Mismatch (max +30), Technical Depth (max +20), Profile Contradiction (max +25), Prompting/External Assistance (max +15), Observation Signals (strictly capped at max +10).
- **Risk Tiers**: LOW (0–29), MEDIUM (30–59), HIGH (60–100).
- **Zero OCR**: Intentionally omitted to eliminate high latency and invasive false positives.
