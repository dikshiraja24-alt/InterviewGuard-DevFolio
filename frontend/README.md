# InterviewGuard — Frontend Service (Railway Ready)

React 19 + Vite frontend application for the InterviewGuard platform.

---

## 🚀 Railway Deployment

- **Root Directory**: `frontend`
- **Builder**: Nixpacks (Auto-detects Node.js)
- **Build Command**: `npm run build`
- **Start Command**: `npm run start` (runs `vite preview --host 0.0.0.0 --port $PORT`)
- **Environment Variables**:
  - `VITE_API_URL`: URL of your deployed Railway FastAPI backend (e.g., `https://backend-production-xxxx.up.railway.app`)

---

## 💻 Local Development
```bash
npm install
npm run dev
```
Runs at `http://localhost:5173` connecting to backend at `http://127.0.0.1:8000`.
