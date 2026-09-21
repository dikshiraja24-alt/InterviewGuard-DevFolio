import os
import tempfile
import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO

# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="InterviewGuard API",
    description="AI-assisted Online Interview Integrity Analysis API",
    version="4.1.0"
)

# =========================================================
# CORS
# =========================================================

cors_origins = [
    "https://interviewguard.netlify.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Read optional frontend origins from environment (e.g. FRONTEND_URL or ALLOWED_ORIGINS)
frontend_origin_env = (
    os.getenv("FRONTEND_URL")
    or os.getenv("ALLOWED_ORIGINS")
    or os.getenv("NETLIFY_URL")
)
if frontend_origin_env:
    for origin in frontend_origin_env.split(","):
        origin = origin.strip().rstrip("/")
        if origin and origin not in cors_origins:
            cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*(\.netlify\.app|\.up\.railway\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# =========================================================
# YOLO MODEL & FACE DETECTOR
# =========================================================

print("Loading YOLO model...")
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    local_weights = os.path.join(current_dir, "yolo11n.pt")
    model_source = local_weights if os.path.exists(local_weights) else "yolo11n.pt"
    yolo_model = YOLO(model_source)
    print(f"YOLO model loaded successfully from {model_source}.")
except Exception as error:
    print(f"YOLO model loading failed: {error}")
    yolo_model = None

print("Loading OpenCV face detector...")
face_detector = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

if face_detector.empty():
    print("Face detector loading failed.")
else:
    print("Face detector loaded successfully.")

# COCO dataset class IDs:
PERSON_CLASS_ID = 0
CELL_PHONE_CLASS_ID = 67

HUMAN_REVIEW_DISCLAIMER = (
    "This system provides risk indicators for interviewer review and "
    "must not make automated hiring or rejection decisions."
)

# =========================================================
# REQUEST & RESPONSE MODELS
# =========================================================

class Candidate(BaseModel):
    name: str = "Candidate"
    position: str = "General Role"
    skills: str = ""
    experience: str = ""
    interview: str = ""

class QAPair(BaseModel):
    question: str = ""
    answer: str = ""

class Signals(BaseModel):
    external_assistance: int = 0
    video_anomaly: int = 0
    lip_sync_anomaly: int = 0
    phone_detected: bool = False
    multiple_persons: bool = False
    candidate_missing: bool = False
    face_missing: bool = False
    face_visible_ratio: float = 100.0
    analyzed_frames: int = 0
    max_person_count: int = 1
    max_phone_count: int = 0


class InterviewRequest(BaseModel):
    candidate: Candidate
    qa_pairs: list[QAPair] = []
    signals: Signals = Signals()

# =========================================================
# HEALTH & STATUS ENDPOINTS
# =========================================================

@app.get("/")
def home():
    return {
        "message": "InterviewGuard API is running",
        "status": "online",
        "yolo": yolo_model is not None,
        "face_detection": not face_detector.empty(),
        "phone_detection": yolo_model is not None,
        "disclaimer": HUMAN_REVIEW_DISCLAIMER
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "InterviewGuard Backend",
        "yolo_loaded": yolo_model is not None,
        "face_detection": not face_detector.empty(),
        "phone_detection": yolo_model is not None
    }

@app.get("/yolo-status")
def yolo_status():
    return {
        "model_loaded": yolo_model is not None,
        "model": "YOLO11n",
        "person_detection": True,
        "face_detection": not face_detector.empty(),
        "phone_detection": yolo_model is not None,
        "phone_class_id": CELL_PHONE_CLASS_ID
    }

# =========================================================
# CORE COMPUTER VISION HELPERS
# =========================================================

def detect_people_and_devices(frame):
    if yolo_model is None:
        return {
            "success": False,
            "error": "YOLO model is not loaded.",
            "person_count": 0,
            "phone_count": 0,
            "multiple_persons": False,
            "no_person_detected": False,
            "external_device_detected": False,
            "external_assistance": 0,
            "video_anomaly": 0,
            "person_detections": [],
            "phone_detections": [],
            "detections": []
        }

    try:
        results = yolo_model(frame, verbose=False)
        person_count = 0
        phone_count = 0
        detections = []
        person_detections = []
        phone_detections = []

        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                if confidence < 0.40:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                if class_id == PERSON_CLASS_ID:
                    person_count += 1
                    det = {
                        "class": "person",
                        "confidence": round(confidence, 3),
                        "box": [x1, y1, x2, y2]
                    }
                    person_detections.append(det)
                    detections.append(det)
                elif class_id == CELL_PHONE_CLASS_ID:
                    phone_count += 1
                    det = {
                        "class": "cell phone",
                        "confidence": round(confidence, 3),
                        "box": [x1, y1, x2, y2]
                    }
                    phone_detections.append(det)
                    detections.append(det)

        multiple_persons = person_count >= 2
        no_person = person_count == 0
        external_device_detected = phone_count > 0

        if phone_count > 0:
            external_assistance = 90
        else:
            external_assistance = 0

        if multiple_persons and phone_count > 0:
            video_anomaly = 95
        elif phone_count > 0:
            video_anomaly = 85
        elif multiple_persons:
            video_anomaly = 80
        elif no_person:
            video_anomaly = 60
        else:
            video_anomaly = 0

        return {
            "success": True,
            "person_count": person_count,
            "phone_count": phone_count,
            "multiple_persons": multiple_persons,
            "no_person_detected": no_person,
            "external_device_detected": external_device_detected,
            "external_assistance": external_assistance,
            "video_anomaly": video_anomaly,
            "person_detections": person_detections,
            "phone_detections": phone_detections,
            "detections": detections
        }
    except Exception as error:
        return {
            "success": False,
            "error": str(error),
            "person_count": 0,
            "phone_count": 0,
            "multiple_persons": False,
            "no_person_detected": False,
            "external_device_detected": False,
            "external_assistance": 0,
            "video_anomaly": 0,
            "detections": []
        }

def detect_faces(frame):
    if face_detector.empty():
        return {
            "success": False,
            "error": "Face detector is not available.",
            "face_count": 0,
            "face_visible": False,
            "face_anomaly": 0,
            "detections": []
        }

    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(50, 50)
        )
        face_count = len(faces)

        if face_count == 1:
            face_visible = True
            face_anomaly = 0
        elif face_count == 0:
            face_visible = False
            face_anomaly = 50
        else:
            face_visible = True
            face_anomaly = 20

        detections = []
        for (x, y, w, h) in faces:
            detections.append({
                "box": [int(x), int(y), int(x + w), int(y + h)]
            })

        return {
            "success": True,
            "face_count": face_count,
            "face_visible": face_visible,
            "multiple_faces": face_count >= 2,
            "face_anomaly": face_anomaly,
            "detections": detections
        }
    except Exception as error:
        return {
            "success": False,
            "error": str(error),
            "face_count": 0,
            "face_visible": False,
            "face_anomaly": 0,
            "detections": []
        }

# =========================================================
# FRAME DETECTION ENDPOINT
# =========================================================

@app.post("/detect-frame")
async def detect_frame(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if not contents:
            return {"success": False, "error": "Empty image received."}

        np_array = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

        if frame is None:
            return {"success": False, "error": "Could not decode image."}

        vision_result = detect_people_and_devices(frame)
        face_result = detect_faces(frame)

        yolo_video_anomaly = vision_result.get("video_anomaly", 0)
        face_anomaly = face_result.get("face_anomaly", 0)
        video_anomaly = max(yolo_video_anomaly, face_anomaly)

        return {
            "success": True,
            "filename": file.filename,
            "detection": {
                "person": vision_result,
                "face": face_result,
                "person_count": vision_result.get("person_count", 0),
                "face_count": face_result.get("face_count", 0),
                "face_visible": face_result.get("face_visible", False),
                "phone_count": vision_result.get("phone_count", 0),
                "external_device_detected": vision_result.get("external_device_detected", False),
                "external_assistance": vision_result.get("external_assistance", 0),
                "multiple_persons": vision_result.get("multiple_persons", False),
                "video_anomaly": video_anomaly
            }
        }
    except Exception as error:
        return {"success": False, "error": str(error)}

# =========================================================
# RISK SCORING ENGINE (REQUIRED SPECIFICATION)
# =========================================================

def calculate_skill_mismatch_points(candidate: Candidate, interview_text: str) -> int:
    """Skill mismatch: MAX +30 points"""
    skills_text = candidate.skills.lower()
    if not skills_text.strip():
        return 0

    skills = [
        s.strip()
        for s in skills_text.replace(",", " ").split()
        if len(s.strip()) > 1
    ]
    if not skills:
        return 0

    interview_lower = interview_text.lower()
    matched = sum(1 for skill in skills if skill in interview_lower)
    mismatch_ratio = 1.0 - (matched / len(skills))
    points = round(mismatch_ratio * 30)
    return min(30, max(0, points))

def calculate_technical_depth_points(candidate: Candidate, interview_text: str) -> int:
    """Technical-depth mismatch: MAX +20 points"""
    interview_lower = interview_text.lower()
    words = interview_lower.split()
    word_count = len(words)

    if word_count == 0:
        return 20

    technical_terms = [
        "algorithm", "data structure", "complexity", "database", "sql",
        "python", "machine learning", "model", "training", "testing",
        "overfitting", "underfitting", "api", "backend", "frontend",
        "neural network", "classification", "regression", "normalization",
        "index", "query", "architecture", "framework", "optimization",
        "pipeline", "component", "state", "props", "asynchronous",
        "concurrency", "security", "scaling", "cache", "git", "rest", "docker"
    ]

    matched_terms = sum(1 for term in technical_terms if term in interview_lower)

    if word_count < 30:
        depth_deficit = 0.85
    elif word_count < 70:
        depth_deficit = 0.60
    elif word_count < 140:
        depth_deficit = 0.35
    else:
        depth_deficit = 0.15

    depth_deficit -= min(matched_terms * 0.08, 0.50)
    depth_deficit = max(0.0, min(1.0, depth_deficit))
    points = round(depth_deficit * 20)
    return min(20, max(0, points))

def calculate_profile_contradiction_points(candidate: Candidate, interview_text: str) -> int:
    """Profile contradiction: MAX +25 points"""
    skills_lower = candidate.skills.lower()
    experience_lower = candidate.experience.lower()
    interview_lower = interview_text.lower()

    beginner_signals = [
        "i don't know", "dont know", "no idea", "never used",
        "not familiar", "i have not used", "never heard", "no clue",
        "haven't used", "did not learn", "can't answer", "cannot answer"
    ]

    advanced_claims = [
        "machine learning", "deep learning", "advanced python",
        "advanced sql", "artificial intelligence", "neural network",
        "senior", "expert", "lead", "architect", "5 years", "4 years",
        "3 years", "production", "distributed systems"
    ]

    beginner_count = sum(1 for sig in beginner_signals if sig in interview_lower)
    advanced_claim = any(
        claim in skills_lower or claim in experience_lower
        for claim in advanced_claims
    )

    contradiction_pts = 0
    if advanced_claim and beginner_count > 0:
        contradiction_pts = min(25, beginner_count * 15)
    elif advanced_claim and len(candidate.experience.strip()) < 4 and len(interview_lower.split()) < 30:
        contradiction_pts = 15
    elif beginner_count >= 2:
        contradiction_pts = 10

    return min(25, max(0, contradiction_pts))

def calculate_external_assistance_points(signals: Signals) -> int:
    """Prompting / external assistance: MAX +15 points"""
    if signals.phone_detected or signals.external_assistance >= 50:
        return 15
    elif signals.external_assistance > 0:
        val = signals.external_assistance
        pts = round((val / 100) * 15) if val > 15 else val
        return min(15, max(0, pts))
    return 0

def calculate_observation_points(signals: Signals) -> int:
    """Observation signals: strictly capped at MAXIMUM +10 points"""
    raw_points = 0

    if signals.multiple_persons:
        raw_points += 4

    if signals.candidate_missing:
        raw_points += 3

    if signals.face_missing or signals.face_visible_ratio < 65:
        raw_points += 3

    if signals.video_anomaly >= 50:
        raw_points += 3
    elif signals.video_anomaly > 0:
        raw_points += 1

    if signals.lip_sync_anomaly >= 50:
        raw_points += 2

    # MUST NEVER EXCEED +10
    return min(10, raw_points)

def get_risk_level(score: int) -> str:
    """Exact required risk level thresholds: 0-29 LOW, 30-59 MEDIUM, 60-100 HIGH"""
    if score <= 29:
        return "LOW"
    elif score <= 59:
        return "MEDIUM"
    else:
        return "HIGH"

def generate_reasons(
    skill_pts: int,
    tech_pts: int,
    contra_pts: int,
    assist_pts: int,
    obs_pts: int,
    signals: Signals
) -> list[str]:
    """Generate 2-3 reasons based on actual detected signals using cautious phrasing."""
    reasons = []

    if skill_pts >= 15:
        reasons.append(
            "Potential skill mismatch detected between the candidate profile and interview responses."
        )

    if tech_pts >= 10:
        reasons.append(
            "Technical responses showed limited depth relative to the target role."
        )

    if contra_pts >= 12:
        reasons.append(
            "Potential profile contradiction detected."
        )

    if assist_pts >= 8 or signals.phone_detected:
        reasons.append(
            "Potential external-device signal detected during monitoring."
        )

    if signals.multiple_persons:
        reasons.append(
            "Potential multiple-person activity detected."
        )

    if signals.face_missing or signals.face_visible_ratio < 65:
        reasons.append(
            "Face visibility was inconsistent during the interview."
        )

    if signals.video_anomaly >= 50 or signals.candidate_missing:
        reasons.append(
            "Potential visual anomaly detected."
        )

    if not reasons:
        reasons = [
            "No major integrity anomaly detected.",
            "Candidate responses are reasonably consistent with the provided profile."
        ]

    return reasons[:3]

def get_next_action(risk_level: str) -> str:
    """Prescribed next actions. Never automatically reject."""
    if risk_level == "LOW":
        return "Continue normal interviewer review. No major integrity signal detected."
    elif risk_level == "MEDIUM":
        return "Perform manual verification and ask additional technical questions."
    else:
        return "Perform detailed manual verification before making any hiring decision."

# =========================================================
# CORE EVALUATION FUNCTION
# =========================================================

def evaluate_interview(
    candidate: Candidate,
    qa_pairs: list[QAPair],
    signals: Signals
):
    qa_text = " ".join([f"{qa.question} {qa.answer}" for qa in qa_pairs if qa.answer])
    full_interview = f"{candidate.interview} {qa_text}".strip()

    # 1. Skill mismatch (MAX +30)
    skill_pts = calculate_skill_mismatch_points(candidate, full_interview)

    # 2. Technical depth (MAX +20)
    tech_pts = calculate_technical_depth_points(candidate, full_interview)

    # 3. Profile contradiction (MAX +25)
    contra_pts = calculate_profile_contradiction_points(candidate, full_interview)

    # 4. External assistance (MAX +15)
    assist_pts = calculate_external_assistance_points(signals)

    # 5. Observations (MAX +10)
    obs_pts = calculate_observation_points(signals)

    risk_score = skill_pts + tech_pts + contra_pts + assist_pts + obs_pts
    risk_score = min(100, max(0, risk_score))

    risk_level = get_risk_level(risk_score)

    reasons = generate_reasons(
        skill_pts, tech_pts, contra_pts, assist_pts, obs_pts, signals
    )

    next_action = get_next_action(risk_level)

    evidence = {
        "potential_phone_detected": bool(signals.phone_detected or assist_pts >= 10),
        "multiple_person_activity": bool(signals.multiple_persons),
        "face_visibility_issue": bool(signals.face_missing or signals.face_visible_ratio < 65),
        "potential_visual_anomaly": bool(signals.video_anomaly >= 50 or signals.candidate_missing)
    }

    max_persons = signals.max_person_count if signals.max_person_count > 0 else (2 if signals.multiple_persons else 1)
    max_phones = signals.max_phone_count if signals.max_phone_count > 0 else (1 if signals.phone_detected else 0)

    return {
        "success": True,
        "candidate": {
            "name": candidate.name,
            "position": candidate.position,
            "skills": candidate.skills,
            "experience": candidate.experience,
            "interview": full_interview
        },
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reasons": reasons,
        "signals": {
            "skill_mismatch": skill_pts,
            "technical_depth": tech_pts,
            "profile_contradiction": contra_pts,
            "external_assistance": assist_pts,
            "observation_points": obs_pts
        },
        "evidence": evidence,
        "video": {
            "duration_seconds": 0,
            "total_frames": signals.analyzed_frames,
            "analyzed_frames": signals.analyzed_frames,
            "sampling": "Live camera sampling"
        },
        "detection": {
            "max_person_count": max_persons,
            "max_phone_count": max_phones,
            "multiple_person_ratio": 100 if signals.multiple_persons else 0,
            "no_person_ratio": 100 if signals.candidate_missing else 0,
            "face_visible_ratio": signals.face_visible_ratio,
            "face_missing_ratio": max(0.0, 100.0 - signals.face_visible_ratio),
            "external_assistance": signals.external_assistance,
            "video_anomaly": signals.video_anomaly
        },
        "video_analysis": {
            "filename": "Live Interview Session",
            "duration_seconds": 0,
            "analyzed_frames": signals.analyzed_frames,
            "max_person_count": max_persons,
            "max_phone_count": max_phones,
            "face_visible_ratio": signals.face_visible_ratio,
        },
        "next_action": next_action,
        "disclaimer": HUMAN_REVIEW_DISCLAIMER
    }

# =========================================================
# INTERVIEW ANALYSIS ENDPOINT
# =========================================================

@app.post("/analyze")
def analyze_interview(data: InterviewRequest):
    return evaluate_interview(
        candidate=data.candidate,
        qa_pairs=data.qa_pairs,
        signals=data.signals
    )

# =========================================================
# RECORDED VIDEO ANALYSIS ENDPOINT
# =========================================================

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    temp_path = None
    try:
        if not file.filename:
            return {"success": False, "error": "No video file received."}

        allowed_extensions = (".mp4", ".avi", ".mov", ".mkv", ".webm")
        if not file.filename.lower().endswith(allowed_extensions):
            return {
                "success": False,
                "error": "Unsupported video format. Use MP4, AVI, MOV, MKV or WEBM."
            }

        video_bytes = await file.read()
        if not video_bytes:
            return {"success": False, "error": "Empty video file."}

        suffix = os.path.splitext(file.filename)[1]
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        temp_file.write(video_bytes)
        temp_file.close()
        temp_path = temp_file.name

        capture = cv2.VideoCapture(temp_path)
        if not capture.isOpened():
            return {"success": False, "error": "Could not open uploaded video."}

        fps = capture.get(cv2.CAP_PROP_FPS)
        total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames < 0:
            total_frames = 0

        duration = 0.0
        if fps and fps > 0 and total_frames > 0:
            duration = total_frames / fps

        frame_interval = max(1, int(fps)) if (fps and fps > 0) else 25

        frame_index = 0
        analyzed_frames = 0

        max_person_count = 0
        max_phone_count = 0
        multiple_person_frames = 0
        no_person_frames = 0
        face_visible_frames = 0
        no_face_frames = 0
        max_external_assistance = 0
        max_video_anomaly = 0

        while True:
            success, frame = capture.read()
            if not success:
                break

            frame_index += 1

            if frame_index != 1 and (frame_index - 1) % frame_interval != 0:
                continue

            analyzed_frames += 1

            vision_result = detect_people_and_devices(frame)
            face_result = detect_faces(frame)

            p_count = int(vision_result.get("person_count", 0))
            max_person_count = max(max_person_count, p_count)
            if p_count >= 2:
                multiple_person_frames += 1
            if p_count == 0:
                no_person_frames += 1

            ph_count = int(vision_result.get("phone_count", 0))
            max_phone_count = max(max_phone_count, ph_count)

            f_visible = bool(face_result.get("face_visible", False))
            if f_visible:
                face_visible_frames += 1
            else:
                no_face_frames += 1

            ext_assist = int(vision_result.get("external_assistance", 0))
            max_external_assistance = max(max_external_assistance, ext_assist)

            y_anomaly = int(vision_result.get("video_anomaly", 0))
            f_anomaly = int(face_result.get("face_anomaly", 0))
            cur_anomaly = max(y_anomaly, f_anomaly)
            max_video_anomaly = max(max_video_anomaly, cur_anomaly)

        if fps and fps > 0 and frame_index > 0:
            duration = frame_index / fps

        if total_frames <= 0 or total_frames < frame_index:
            total_frames = frame_index

        capture.release()

        if analyzed_frames == 0:
            return {"success": False, "error": "No readable frames found in video."}

        multiple_person_ratio = round((multiple_person_frames / analyzed_frames) * 100)
        no_person_ratio = round((no_person_frames / analyzed_frames) * 100)
        face_visible_ratio = round((face_visible_frames / analyzed_frames) * 100)
        face_missing_ratio = round((no_face_frames / analyzed_frames) * 100)

        # Video Risk Scoring
        risk_score = 0
        reasons = []

        if max_phone_count > 0:
            risk_score += 35
            reasons.append("Potential external-device signal detected in the recorded video.")

        if multiple_person_ratio >= 10:
            risk_score += 40
            reasons.append("Multiple-person activity was detected in part of the recorded video.")
        elif no_person_ratio >= 20:
            risk_score += 25
            reasons.append("The interview participant was not visible in part of the recorded video.")

        if face_missing_ratio >= 30:
            risk_score += 15
            reasons.append("Face visibility was inconsistent during the recorded interview.")

        if max_external_assistance >= 50:
            risk_score += 15
            reasons.append("Potential external assistance signal was observed.")

        if max_video_anomaly >= 50:
            risk_score += 15
            reasons.append("Potential visual anomaly was detected in the recorded video.")

        risk_score = min(100, max(0, risk_score))
        risk_level = get_risk_level(risk_score)

        if not reasons:
            reasons = [
                "No major integrity anomaly detected in the sampled video frames.",
                "Participant visibility and detected environmental signals were generally consistent."
            ]

        reasons = reasons[:3]
        next_action = get_next_action(risk_level)

        return {
            "success": True,
            "filename": file.filename,
            "video": {
                "duration_seconds": round(duration, 2),
                "total_frames": total_frames,
                "analyzed_frames": analyzed_frames,
                "sampling": "Approximately 1 frame per second"
            },
            "detection": {
                "max_person_count": max_person_count,
                "max_phone_count": max_phone_count,
                "multiple_person_ratio": multiple_person_ratio,
                "no_person_ratio": no_person_ratio,
                "face_visible_ratio": face_visible_ratio,
                "face_missing_ratio": face_missing_ratio,
                "external_assistance": max_external_assistance,
                "video_anomaly": max_video_anomaly
            },
            "risk_score": risk_score,
            "risk_level": risk_level,
            "reasons": reasons,
            "next_action": next_action,
            "evidence": {
                "potential_phone_detected": max_phone_count > 0,
                "multiple_person_activity": multiple_person_frames > 0,
                "face_visibility_issue": face_missing_ratio >= 30,
                "potential_visual_anomaly": max_video_anomaly >= 50
            },
            "disclaimer": HUMAN_REVIEW_DISCLAIMER
        }
    except Exception as error:
        return {"success": False, "error": str(error)}
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

# =========================================================
# TEST LAB ENDPOINT (5 SYNTHETIC CASES RUNNING REAL ENGINE)
# =========================================================

SYNTHETIC_TEST_CASES = [
    {
        "id": 1,
        "name": "Normal Candidate",
        "description": "Strong alignment between claimed skills and technical responses with clean visual monitoring signals.",
        "candidate": Candidate(
            name="Rahul Sharma",
            position="Full Stack Developer",
            skills="Python, SQL, React, API",
            experience="2 years of software engineering",
            interview="I build web applications using React for the frontend and Python with SQL databases for the backend API. I optimize database queries and implement REST endpoints with proper testing and clean architecture."
        ),
        "signals": Signals(
            external_assistance=0,
            video_anomaly=0,
            lip_sync_anomaly=0,
            phone_detected=False,
            multiple_persons=False,
            candidate_missing=False,
            face_missing=False,
            face_visible_ratio=100.0
        ),
        "expected_level": "LOW"
    },
    {
        "id": 2,
        "name": "Skill Mismatch Scenario",
        "description": "Candidate claims specialized cloud architecture skills but responses only discuss generic basic markup with no skill keywords.",
        "candidate": Candidate(
            name="Priya Mehta",
            position="Cloud Architect",
            skills="Kubernetes, Docker, Terraform, AWS, Microservices",
            experience="3 years in cloud infrastructure",
            interview="I mostly create web pages with standard text and basic styling. I like design and browsing."
        ),
        "signals": Signals(
            external_assistance=0,
            video_anomaly=0,
            lip_sync_anomaly=0,
            phone_detected=False,
            multiple_persons=False,
            candidate_missing=False,
            face_missing=False,
            face_visible_ratio=100.0
        ),
        "expected_level": "MEDIUM"
    },
    {
        "id": 3,
        "name": "Technical Depth Deficit",
        "description": "Candidate matches basic skills but responses show limited technical depth relative to role expectations.",
        "candidate": Candidate(
            name="Vikram Rao",
            position="Software Engineer",
            skills="Python, SQL",
            experience="1 year",
            interview="I use Python and SQL every day. Python is useful and SQL is used for tables."
        ),
        "signals": Signals(
            external_assistance=0,
            video_anomaly=0,
            lip_sync_anomaly=0,
            phone_detected=False,
            multiple_persons=False,
            candidate_missing=False,
            face_missing=False,
            face_visible_ratio=100.0
        ),
        "expected_level": "LOW"
    },
    {
        "id": 4,
        "name": "Profile Contradiction Scenario",
        "description": "Candidate claims senior AI lead status but indicates lack of familiarity with core concepts while knowing terminology.",
        "candidate": Candidate(
            name="Anita Desai",
            position="Senior AI Lead",
            skills="Machine Learning, Deep Learning, Neural Networks",
            experience="Senior Machine Learning Specialist",
            interview="I know machine learning and neural networks are used for classification and regression, but i don't know machine learning algorithms in depth and never used deep learning models in real systems."
        ),
        "signals": Signals(
            external_assistance=0,
            video_anomaly=0,
            lip_sync_anomaly=0,
            phone_detected=False,
            multiple_persons=False,
            candidate_missing=False,
            face_missing=False,
            face_visible_ratio=100.0
        ),
        "expected_level": "LOW"
    },
    {
        "id": 5,
        "name": "Multiple Integrity Signals",
        "description": "Multiple integrity signals detected: skill mismatch, contradiction, external phone detection, and multiple persons present.",
        "candidate": Candidate(
            name="Siddharth Roy",
            position="Senior Backend Architect",
            skills="Distributed Systems, Cloud Architecture, Kubernetes, Microservices",
            experience="Senior Architect",
            interview="i don't know distributed systems, never used cloud architecture, no idea about microservices."
        ),
        "signals": Signals(
            external_assistance=90,
            video_anomaly=85,
            lip_sync_anomaly=0,
            phone_detected=True,
            multiple_persons=True,
            candidate_missing=False,
            face_missing=True,
            face_visible_ratio=40.0
        ),
        "expected_level": "HIGH"
    }
]

@app.post("/test-lab/run")
def run_test_lab():
    results = []
    passed_count = 0
    failed_count = 0

    for test in SYNTHETIC_TEST_CASES:
        evaluation = evaluate_interview(
            candidate=test["candidate"],
            qa_pairs=[],
            signals=test["signals"]
        )

        actual_score = evaluation["risk_score"]
        actual_level = evaluation["risk_level"]
        passed = actual_level == test["expected_level"]

        if passed:
            passed_count += 1
        else:
            failed_count += 1

        results.append({
            "id": test["id"],
            "name": test["name"],
            "description": test["description"],
            "candidate": {
                "name": test["candidate"].name,
                "position": test["candidate"].position,
                "skills": test["candidate"].skills,
                "experience": test["candidate"].experience,
                "interview": test["candidate"].interview
            },
            "signals": test["signals"].model_dump(),
            "expected_level": test["expected_level"],
            "actual_score": actual_score,
            "actual_level": actual_level,
            "reasons": evaluation["reasons"],
            "signal_breakdown": evaluation["signals"],
            "passed": passed
        })

    return {
        "success": True,
        "summary": {
            "total": len(results),
            "passed": passed_count,
            "failed": failed_count,
            "status": "ALL_PASSED" if failed_count == 0 else "SOME_FAILED"
        },
        "tests": results,
        "disclaimer": HUMAN_REVIEW_DISCLAIMER
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

