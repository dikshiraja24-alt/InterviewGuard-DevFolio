# InterviewGuard — Backend Service (Railway Ready)

FastAPI-powered interview integrity analysis engine utilizing YOLOv11 and OpenCV for real-time visual signal detection, speech response analysis, and cautious integrity scoring.

---

## 🚀 Railway Deployment

- **Root Directory**: `backend`
- **Builder**: Nixpacks (Auto-detects Python)
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Port Variable**: Railway automatically injects `$PORT`.
- **Model Handling**: `yolo11n.pt` is included directly in this directory for instant, offline model loading. If omitted, Ultralytics downloads it automatically.
- **Dependencies**: Uses `opencv-python-headless` to eliminate missing `libGL.so.1` issues on Linux containers.

### Environment Variables (Optional):
- `FRONTEND_URL` / `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend origins (Railway domain `*.up.railway.app` and `*.netlify.app` are allowed by default).

---

## 📡 Endpoints
- `GET /health` — Service health & model status
- `POST /detect-frame` — Live camera frame detection (person, phone, face)
- `POST /analyze` — Full interview evaluation (5 Q&A pairs + signals)
- `POST /analyze-video` — Upload recorded video for frame-sampled analysis (~1 fps)
- `POST /test-lab/run` — Run automated 5-case scoring test suite
