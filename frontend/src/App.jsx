import { useEffect, useRef, useState } from "react";
import "./index.css";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");


const DISCLAIMER_TEXT =
  "This system provides risk indicators for interviewer review and must not make automated hiring or rejection decisions.";

// =========================================================
// HELPER COMPONENTS
// =========================================================

function StatCard({ title, value, change, icon, positive, danger }) {
  let badgeClass = "";
  if (positive) badgeClass = "badge-positive";
  else if (danger) badgeClass = "badge-danger";

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <div className="stat-card-value">{value}</div>
      {change && <div className={`stat-card-change ${badgeClass}`}>{change}</div>}
    </div>
  );
}

function RiskBadge({ level }) {
  const lvl = (level || "LOW").toUpperCase();
  let colorStyle = {
    padding: "4px 12px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "0.5px",
    display: "inline-block",
  };

  if (lvl === "LOW") {
    colorStyle = {
      ...colorStyle,
      background: "rgba(34, 197, 94, 0.15)",
      color: "#22c55e",
      border: "1px solid rgba(34, 197, 94, 0.4)",
    };
  } else if (lvl === "MEDIUM") {
    colorStyle = {
      ...colorStyle,
      background: "rgba(245, 158, 11, 0.15)",
      color: "#f59e0b",
      border: "1px solid rgba(245, 158, 11, 0.4)",
    };
  } else {
    colorStyle = {
      ...colorStyle,
      background: "rgba(239, 68, 68, 0.15)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.4)",
    };
  }

  return <span style={colorStyle}>{lvl}</span>;
}

// =========================================================
// 1. DASHBOARD
// =========================================================

function Dashboard({ setActivePage, setAnalysisResult }) {
  const recentInterviews = [
    { name: "Rahul Sharma", role: "Full Stack Developer", score: 18, level: "LOW" },
    { name: "Priya Mehta", role: "Cloud Architect", score: 47, level: "MEDIUM" },
    { name: "Siddharth Roy", role: "Backend Architect", score: 78, level: "HIGH" },
    { name: "Sneha Joshi", role: "Data Analyst", score: 12, level: "LOW" },
  ];

  return (
    <div className="page-content" style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* WELCOME BANNER */}
      <section
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(56, 189, 248, 0.08))",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          borderRadius: "16px",
          padding: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px" }}>
            AI-ASSISTED INTERVIEW INTEGRITY
          </span>
          <h2 style={{ fontSize: "24px", margin: "8px 0 6px", color: "#ffffff" }}>
            InterviewGuard Integrity Platform
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", maxWidth: "600px" }}>
            Real-time visual monitoring, speech analysis, and cautious integrity signals to assist
            human interviewers in evaluating technical candidate responses.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button
              className="primary-btn"
              style={{ padding: "10px 20px" }}
              onClick={() => setActivePage("Live Interview")}
            >
              Start Live Interview →
            </button>
            <button
              className="secondary-btn"
              style={{ padding: "10px 20px" }}
              onClick={() => setActivePage("Recorded Interview")}
            >
              Analyze Video →
            </button>
          </div>
        </div>
        <div
          style={{
            fontSize: "56px",
            background: "rgba(99, 102, 241, 0.2)",
            borderRadius: "50%",
            width: "100px",
            height: "100px",
            display: "grid",
            placeItems: "center",
          }}
        >
          🛡️
        </div>
      </section>

      {/* STATS OVERVIEW */}
      <h3 style={{ fontSize: "16px", color: "#f8fafc", marginBottom: "14px" }}>System Overview</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>Interviews Analyzed</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#ffffff", margin: "6px 0" }}>28</div>
          <div style={{ fontSize: "12px", color: "#22c55e" }}>+9 this week</div>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>Low Risk (0–29)</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#22c55e", margin: "6px 0" }}>19</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>67.8% of interviews</div>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>Medium Risk (30–59)</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#f59e0b", margin: "6px 0" }}>6</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>Manual verification recommended</div>
        </div>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "13px", color: "#94a3b8" }}>High Risk (60–100)</div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: "#ef4444", margin: "6px 0" }}>3</div>
          <div style={{ fontSize: "12px", color: "#94a3b8" }}>Requires detailed human review</div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px", marginBottom: "28px" }}>
        {/* RECENT INTERVIEWS TABLE */}
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h4 style={{ margin: 0, fontSize: "15px", color: "#f8fafc" }}>Recent Integrity Assessments</h4>
            <span style={{ fontSize: "12px", color: "#818cf8" }}>Human review required</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.2)", color: "#94a3b8" }}>
                  <th style={{ padding: "8px 10px" }}>Candidate</th>
                  <th style={{ padding: "8px 10px" }}>Role</th>
                  <th style={{ padding: "8px 10px" }}>Risk Score</th>
                  <th style={{ padding: "8px 10px" }}>Level</th>
                </tr>
              </thead>
              <tbody>
                {recentInterviews.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => {
                      setAnalysisResult({
                        success: true,
                        candidate: {
                          name: item.name,
                          position: item.role,
                          skills: "Technical Skills",
                          experience: "Verified Profile",
                          interview: "Sample interview recording.",
                        },
                        risk_score: item.score,
                        risk_level: item.level,
                        reasons: [
                          item.score < 30
                            ? "Candidate responses are reasonably consistent with the provided profile."
                            : "Potential technical responses showed limited depth relative to the target role.",
                          item.score < 30
                            ? "No major integrity anomaly detected."
                            : "Potential skill mismatch detected between candidate profile and interview responses.",
                        ],
                        signals: {
                          skill_mismatch: item.score > 30 ? 20 : 5,
                          technical_depth: item.score > 30 ? 15 : 5,
                          profile_contradiction: item.score > 60 ? 25 : 0,
                          external_assistance: item.score > 60 ? 15 : 0,
                          observation_points: item.score > 60 ? 8 : 0,
                        },
                        evidence: {
                          potential_phone_detected: item.score > 60,
                          multiple_person_activity: false,
                          face_visibility_issue: item.score > 60,
                          potential_visual_anomaly: false,
                        },
                        next_action:
                          item.level === "LOW"
                            ? "Continue normal interviewer review. No major integrity signal detected."
                            : item.level === "MEDIUM"
                            ? "Perform manual verification and ask additional technical questions."
                            : "Perform detailed manual verification before making any hiring decision.",
                        disclaimer: DISCLAIMER_TEXT,
                      });
                      setActivePage("Analysis Result");
                    }}
                  >
                    <td style={{ padding: "12px 10px", fontWeight: "600", color: "#f8fafc" }}>{item.name}</td>
                    <td style={{ padding: "12px 10px", color: "#94a3b8" }}>{item.role}</td>
                    <td style={{ padding: "12px 10px", fontWeight: "700" }}>{item.score}/100</td>
                    <td style={{ padding: "12px 10px" }}>
                      <RiskBadge level={item.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SCORING ALLOCATION PANEL */}
        <div className="card" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#f8fafc" }}>
            Scoring Model (Max 100)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Skill Mismatch</span>
              <strong style={{ color: "#818cf8" }}>Max +30 pts</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Profile Contradiction</span>
              <strong style={{ color: "#818cf8" }}>Max +25 pts</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Technical-Depth Mismatch</span>
              <strong style={{ color: "#818cf8" }}>Max +20 pts</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Prompting / External Assist</span>
              <strong style={{ color: "#818cf8" }}>Max +15 pts</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Visual Observation Signals</span>
              <strong style={{ color: "#818cf8" }}>Max +10 pts (Capped)</strong>
            </div>
          </div>
          <div style={{ marginTop: "14px", fontSize: "12px", color: "#94a3b8" }}>
            Risk Thresholds: <strong>0–29 LOW</strong> | <strong>30–59 MEDIUM</strong> | <strong>60–100 HIGH</strong>
          </div>
        </div>
      </div>

      {/* QUICK MODE LAUNCHERS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div
          className="card"
          style={{ padding: "18px", cursor: "pointer", transition: "all 0.2s" }}
          onClick={() => setActivePage("Live Interview")}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎤</div>
          <strong style={{ color: "#f8fafc", display: "block" }}>Live AI Interview</strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Unified screen with AI Interviewer + live camera monitoring.
          </span>
        </div>

        <div
          className="card"
          style={{ padding: "18px", cursor: "pointer", transition: "all 0.2s" }}
          onClick={() => setActivePage("Recorded Interview")}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>📹</div>
          <strong style={{ color: "#f8fafc", display: "block" }}>Recorded Video Analysis</strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Upload interview videos for YOLO and OpenCV frame sampling.
          </span>
        </div>

        <div
          className="card"
          style={{ padding: "18px", cursor: "pointer", transition: "all 0.2s" }}
          onClick={() => setActivePage("Demo Mode")}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>⚡</div>
          <strong style={{ color: "#f8fafc", display: "block" }}>Demo Mode</strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Test 5 demonstration scenarios using the live analysis engine.
          </span>
        </div>

        <div
          className="card"
          style={{ padding: "18px", cursor: "pointer", transition: "all 0.2s" }}
          onClick={() => setActivePage("Test Lab")}
        >
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>✓</div>
          <strong style={{ color: "#f8fafc", display: "block" }}>Test Lab</strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Run validation suite and verify PASS/FAIL criteria.
          </span>
        </div>
      </div>

      {/* HUMAN-REVIEW DISCLAIMER */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "#94a3b8",
        }}
      >
        <span style={{ fontSize: "18px" }}>ℹ️</span>
        <div>
          <strong style={{ color: "#f8fafc" }}>Human Review Disclaimer:</strong> {DISCLAIMER_TEXT}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 2. UNIFIED LIVE INTERVIEW
// =========================================================

function LiveInterview({ setActivePage, setAnalysisResult }) {
  const [candidate, setCandidate] = useState({
    name: "Alex Johnson",
    position: "Full Stack Engineer",
    skills: "Python, SQL, React, API, Machine Learning",
    experience: "2 years software development",
  });

  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [qaList, setQaList] = useState([]);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  // Live vision signals
  const [personCount, setPersonCount] = useState(0);
  const [phoneCount, setPhoneCount] = useState(0);
  const [faceVisible, setFaceVisible] = useState(false);
  const [videoAnomaly, setVideoAnomaly] = useState(0);
  const [externalAssistance, setExternalAssistance] = useState(0);
  const [monitorAlert, setMonitorAlert] = useState("Candidate visible — monitoring active");

  // Aggregated session metrics
  const totalSampledFramesRef = useRef(0);
  const phoneDetectedFramesRef = useRef(0);
  const multiplePersonFramesRef = useRef(0);
  const candidateMissingFramesRef = useRef(0);
  const faceMissingFramesRef = useRef(0);
  const maxVideoAnomalyRef = useRef(0);
  const maxExternalAssistanceRef = useRef(0);
  const maxPersonCountRef = useRef(1);
  const maxPhoneCountRef = useRef(0);
  const interviewStartTimeRef = useRef(null);

  const candidateVideoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Generate exactly 5 questions based on role, skills, experience
  const generateFiveQuestions = () => {
    const skillsList = candidate.skills
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const generated = [];

    skillsList.forEach((skill) => {
      if (skill.includes("python")) {
        generated.push("What is the difference between mutable and immutable types in Python, and how does memory management handle them?");
        generated.push("How do you handle exceptions and resource management using context managers in Python?");
      } else if (skill.includes("sql")) {
        generated.push("Explain the operational difference between an INNER JOIN and an OUTER JOIN in SQL.");
        generated.push("How do you optimize an expensive SQL query with indexes and explain plans?");
      } else if (skill.includes("react")) {
        generated.push("What is the difference between state and props in React, and when would you use a context or reducer?");
        generated.push("Explain the React component lifecycle or useEffect dependency management.");
      } else if (skill.includes("machine learning") || skill.includes("ml")) {
        generated.push("What is overfitting in machine learning, and what techniques do you apply to reduce it?");
        generated.push("Explain how you evaluate classification models using precision, recall, and ROC curves.");
      } else if (skill.includes("api") || skill.includes("backend")) {
        generated.push("What are the key principles of RESTful API design and how do you handle idempotency?");
      }
    });

    generated.push(`What technical challenges have you solved that make you well suited for the ${candidate.position || "target"} role?`);
    generated.push("Describe a complex technical problem you encountered in your previous projects and your step-by-step resolution.");
    generated.push("How do you ensure code reliability, testing, and performance optimization in production systems?");

    const unique = [...new Set(generated)];
    const five = unique.slice(0, 5);

    const fallbacks = [
      "Tell me about a technical project you engineered and your specific contribution.",
      "How do you debug an intermittent production issue with limited logging?",
      "What steps do you take to design clean, modular, and maintainable software architecture?",
      "How do you evaluate trade-offs between speed of delivery and architectural correctness?",
      "What technical skills are you currently strengthening and why?",
    ];

    while (five.length < 5) {
      five.push(fallbacks[five.length]);
    }

    return five;
  };

  // Start Camera
  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMonitorAlert("Camera is not supported by this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraOn(true);

      if (candidateVideoRef.current) {
        candidateVideoRef.current.srcObject = stream;
        candidateVideoRef.current.play().catch(() => {});
      }
      setMonitorAlert("Candidate visible — monitoring active");
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraOn(false);
      setMonitorAlert("Camera permission denied or camera unavailable");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      cameraStreamRef.current = null;
    }
    setCameraOn(false);
  };

  // Analyze Live Frame every 1.5s
  const analyzeLiveFrame = async () => {
    const video = candidateVideoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2 || !video.videoWidth) {
      return;
    }

    try {
      const scale = Math.min(1, 640 / video.videoWidth);
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.75));
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "live-frame.jpg");

      const response = await fetch(`${API_URL}/detect-frame`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) return;

      const data = await response.json();
      const detection = data.detection || {};

      const pCount = Number(detection.person_count ?? 0);
      const phCount = Number(detection.phone_count ?? 0);
      const fVisible = Boolean(detection.face_visible ?? false);
      const vAnomaly = Number(detection.video_anomaly ?? 0);
      const extAssist = Number(detection.external_assistance ?? 0);

      setPersonCount(pCount);
      setPhoneCount(phCount);
      setFaceVisible(fVisible);
      setVideoAnomaly(vAnomaly);
      setExternalAssistance(extAssist);

      // Session aggregations
      totalSampledFramesRef.current += 1;
      maxPersonCountRef.current = Math.max(maxPersonCountRef.current, pCount);
      maxPhoneCountRef.current = Math.max(maxPhoneCountRef.current, phCount);
      if (phCount > 0) phoneDetectedFramesRef.current += 1;
      if (pCount >= 2) multiplePersonFramesRef.current += 1;
      if (pCount === 0) candidateMissingFramesRef.current += 1;
      if (!fVisible) faceMissingFramesRef.current += 1;
      maxVideoAnomalyRef.current = Math.max(maxVideoAnomalyRef.current, vAnomaly);
      maxExternalAssistanceRef.current = Math.max(maxExternalAssistanceRef.current, extAssist);

      // Cautious status text
      if (phCount > 0) {
        setMonitorAlert("Potential external-device signal detected");
      } else if (pCount >= 2) {
        setMonitorAlert("Potential multiple-person activity detected");
      } else if (pCount === 0) {
        setMonitorAlert("Candidate not visible in frame");
      } else if (!fVisible) {
        setMonitorAlert("Face visibility issue detected");
      } else if (vAnomaly >= 50) {
        setMonitorAlert("Potential visual anomaly detected");
      } else {
        setMonitorAlert("Candidate visible — monitoring active");
      }
    } catch (err) {
      console.warn("Live monitoring capture warning:", err);
    }
  };

  // AI Speech Synthesis
  const speakQuestion = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech to text
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      let transcript = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setAnswer(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  // Start interview
  const startInterview = async () => {
    if (!candidate.name.trim() || !candidate.position.trim() || !candidate.skills.trim()) {
      alert("Please fill candidate name, position, and skills before starting.");
      return;
    }

    const qList = generateFiveQuestions();
    setQuestions(qList);
    setCurrentQuestionIndex(0);
    setQaList([]);
    setAnswer("");
    setStarted(true);

    // Reset aggregation refs
    interviewStartTimeRef.current = Date.now();
    totalSampledFramesRef.current = 0;
    maxPersonCountRef.current = 1;
    maxPhoneCountRef.current = 0;
    phoneDetectedFramesRef.current = 0;
    multiplePersonFramesRef.current = 0;
    candidateMissingFramesRef.current = 0;
    faceMissingFramesRef.current = 0;
    maxVideoAnomalyRef.current = 0;
    maxExternalAssistanceRef.current = 0;

    await startCamera();
  };

  // Speak every question on question change
  useEffect(() => {
    if (started && questions.length > 0 && questions[currentQuestionIndex]) {
      const timer = setTimeout(() => {
        speakQuestion(questions[currentQuestionIndex]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [started, currentQuestionIndex, questions]);

  // Set frame sampling interval when camera starts
  useEffect(() => {
    if (started && cameraOn) {
      detectionTimerRef.current = setInterval(analyzeLiveFrame, 1500);
    }
    return () => {
      if (detectionTimerRef.current) {
        clearInterval(detectionTimerRef.current);
        detectionTimerRef.current = null;
      }
    };
  }, [started, cameraOn]);

  // Cleanup on unmount or navigation
  useEffect(() => {
    return () => {
      stopCamera();
      if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      stopListening();
    };
  }, []);

  // Finish Interview after 5 questions
  const finishInterview = async (finalQAList) => {
    stopCamera();
    if (detectionTimerRef.current) clearInterval(detectionTimerRef.current);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    stopListening();

    setAnalyzing(true);
    try {
      const totalFrames = Math.max(1, totalSampledFramesRef.current);
      const faceVisibleRatio = Math.round(
        ((totalFrames - faceMissingFramesRef.current) / totalFrames) * 100
      );

      const payload = {
        candidate: {
          name: candidate.name,
          position: candidate.position,
          skills: candidate.skills,
          experience: candidate.experience,
          interview: finalQAList.map((qa) => `${qa.question}\nAnswer: ${qa.answer}`).join("\n\n"),
        },
        qa_pairs: finalQAList,
        signals: {
          phone_detected: phoneDetectedFramesRef.current > 0,
          multiple_persons: multiplePersonFramesRef.current > 0,
          candidate_missing: candidateMissingFramesRef.current > 0,
          face_missing: faceMissingFramesRef.current > 0,
          face_visible_ratio: faceVisibleRatio,
          video_anomaly: maxVideoAnomalyRef.current,
          external_assistance: maxExternalAssistanceRef.current,
          lip_sync_anomaly: 0,
          analyzed_frames: totalFrames,
          max_person_count: Math.max(1, maxPersonCountRef.current || 1),
          max_phone_count: maxPhoneCountRef.current || 0,
        },
      };

      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const result = await res.json();

      const fullLiveResult = {
        ...result,
        video_analysis: {
          filename: "Live Camera Session",
          duration_seconds: Math.round((Date.now() - (interviewStartTimeRef.current || Date.now())) / 1000),
          analyzed_frames: totalFrames,
          max_person_count: Math.max(1, maxPersonCountRef.current || 1),
          max_phone_count: maxPhoneCountRef.current || 0,
          face_visible_ratio: faceVisibleRatio,
        },
      };

      setAnalysisResult(fullLiveResult);
      setActivePage("Analysis Result");
    } catch (err) {
      console.error("Finish interview error:", err);
      alert(`Analysis failed. Please ensure the backend server is running and accessible at ${API_URL}.`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Submit Answer
  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please enter or speak your answer before proceeding.");
      return;
    }

    const currentQA = {
      question: questions[currentQuestionIndex],
      answer: answer.trim(),
    };

    const updatedQA = [...qaList, currentQA];
    setQaList(updatedQA);
    setAnswer("");

    if (currentQuestionIndex < 4) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await finishInterview(updatedQA);
    }
  };

  // RENDER: Setup Form before starting
  if (!started) {
    return (
      <div className="page-content" style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <div className="card" style={{ padding: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "28px" }}>🎤</span>
            <div>
              <h2 style={{ fontSize: "20px", color: "#f8fafc", margin: 0 }}>Start AI Live Interview</h2>
              <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
                AI Interviewer will ask exactly 5 role-tailored questions while monitoring integrity signals.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "18px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                Candidate Name *
              </label>
              <input
                type="text"
                style={{ width: "100%", padding: "10px 12px" }}
                value={candidate.name}
                onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                Target Position *
              </label>
              <input
                type="text"
                style={{ width: "100%", padding: "10px 12px" }}
                value={candidate.position}
                onChange={(e) => setCandidate({ ...candidate, position: e.target.value })}
                placeholder="e.g. Full Stack Engineer"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                Key Technical Skills *
              </label>
              <input
                type="text"
                style={{ width: "100%", padding: "10px 12px" }}
                value={candidate.skills}
                onChange={(e) => setCandidate({ ...candidate, skills: e.target.value })}
                placeholder="e.g. Python, SQL, React, API"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
                Experience
              </label>
              <input
                type="text"
                style={{ width: "100%", padding: "10px 12px" }}
                value={candidate.experience}
                onChange={(e) => setCandidate({ ...candidate, experience: e.target.value })}
                placeholder="e.g. 2 years software engineering"
              />
            </div>
          </div>

          <div
            style={{
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "10px",
              padding: "14px 18px",
              marginTop: "20px",
              fontSize: "13px",
              color: "#c7d2fe",
            }}
          >
            <strong>Live Interview Protocol:</strong>
            <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
              <li>Camera permission will be requested upon starting.</li>
              <li>AI Interviewer speaks each of the 5 questions using voice synthesis.</li>
              <li>You may answer by speaking into the microphone or typing your answer.</li>
              <li>Live visual monitoring continuously checks presence and integrity indicators.</li>
              <li>After Question 5, the session completes and full analysis is presented.</li>
            </ul>
          </div>

          <button
            className="primary-btn"
            style={{ width: "100%", marginTop: "24px", padding: "12px", fontSize: "15px" }}
            onClick={startInterview}
          >
            Start Interview & Enable Camera →
          </button>
        </div>
      </div>
    );
  }

  // Analyzing screen
  if (analyzing) {
    return (
      <div className="page-content" style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div className="card" style={{ padding: "40px 24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚡</div>
          <h2 style={{ color: "#ffffff", marginBottom: "8px" }}>Analyzing Interview...</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Processing candidate responses, verifying technical depth against the profile, and compiling
            visual monitoring signals...
          </p>
        </div>
      </div>
    );
  }

  // ACTIVE UNIFIED LIVE INTERVIEW SCREEN
  const currentQ = questions[currentQuestionIndex] || "";

  return (
    <div className="page-content" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* HEADER WITH PROGRESS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px" }}>
            LIVE INTERVIEW IN PROGRESS
          </span>
          <h2 style={{ margin: "4px 0 0", color: "#f8fafc", fontSize: "20px" }}>
            {candidate.name} — {candidate.position}
          </h2>
        </div>
        <div
          style={{
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            padding: "6px 14px",
            borderRadius: "20px",
            fontWeight: "700",
            color: "#818cf8",
            fontSize: "14px",
          }}
        >
          Question {currentQuestionIndex + 1} of 5
        </div>
      </div>

      {/* UNIFIED STAGE: LEFT (AI INTERVIEWER) | RIGHT (CANDIDATE CAMERA) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "18px",
        }}
      >
        {/* LEFT SIDE: AI INTERVIEWER */}
        <div
          className="card"
          style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #11182d 0%, #151d35 100%)",
            border: "1px solid rgba(99, 102, 241, 0.35)",
            minHeight: "340px",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #38bdf8)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "22px",
                    boxShadow: isSpeaking ? "0 0 20px rgba(99, 102, 241, 0.8)" : "none",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  🤖
                </div>
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "16px", display: "block" }}>
                    AI Interviewer
                  </strong>
                  <span style={{ fontSize: "11px", color: isSpeaking ? "#38bdf8" : "#94a3b8" }}>
                    {isSpeaking ? "🔊 Speaking question..." : "AI Interviewer Active"}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(99, 102, 241, 0.12)",
                  color: "#818cf8",
                }}
              >
                Q{currentQuestionIndex + 1}/5
              </span>
            </div>

            <div
              style={{
                background: "rgba(11, 16, 32, 0.8)",
                border: "1px solid rgba(148, 163, 184, 0.15)",
                borderRadius: "12px",
                padding: "18px",
                margin: "12px 0",
              }}
            >
              <div style={{ fontSize: "11px", color: "#818cf8", fontWeight: "700", marginBottom: "6px" }}>
                CURRENT QUESTION
              </div>
              <p style={{ fontSize: "16px", lineHeight: "1.5", color: "#f8fafc", margin: 0 }}>
                {currentQ}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="secondary-btn"
              style={{ padding: "8px 14px", fontSize: "12px" }}
              onClick={() => speakQuestion(currentQ)}
            >
              🔊 Repeat Question
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: CANDIDATE LIVE CAMERA */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            position: "relative",
            minHeight: "340px",
            background: "#080c18",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <video
            ref={candidateVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              minHeight: "340px",
              objectFit: "cover",
              transform: "scaleX(-1)",
              display: "block",
            }}
          />

          {!cameraOn && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(11, 16, 32, 0.95)",
                color: "#94a3b8",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "36px" }}>📷</span>
              <span>Camera not active or permission pending</span>
              <button
                className="secondary-btn"
                style={{ marginTop: "8px", padding: "6px 14px", fontSize: "12px" }}
                onClick={startCamera}
              >
                Reconnect Camera
              </button>
            </div>
          )}

          {/* TOP OVERLAYS */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#ffffff",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: cameraOn ? "#22c55e" : "#ef4444",
              }}
            />
            Candidate Feed
          </div>

          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "#818cf8",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            AI Guard Active
          </div>

          {/* BOTTOM STATUS OVERLAY */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              right: "12px",
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>🛡️</span>
            <span>{monitorAlert}</span>
          </div>
        </div>
      </div>

      {/* HIDDEN CANVAS FOR FRAME GRABBING */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* LIVE MONITORING BAR (REQUIRED LIVE CARDS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <div className="card" style={{ padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>👥 Persons</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: personCount === 1 ? "#22c55e" : "#ef4444" }}>
            {personCount}
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            {personCount === 1 ? "1 Person" : personCount >= 2 ? "Multiple" : "Missing"}
          </div>
        </div>

        <div className="card" style={{ padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>📱 Phone</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: phoneCount > 0 ? "#ef4444" : "#22c55e" }}>
            {phoneCount > 0 ? "Detected" : "Clean"}
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            {phoneCount > 0 ? "Signal Flagged" : "No device"}
          </div>
        </div>

        <div className="card" style={{ padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>🙂 Face Visibility</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: faceVisible ? "#22c55e" : "#f59e0b" }}>
            {faceVisible ? "Visible" : "Issue"}
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            {faceVisible ? "In frame" : "Face not centered"}
          </div>
        </div>

        <div className="card" style={{ padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>👥 Multiple Persons</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: personCount >= 2 ? "#ef4444" : "#22c55e" }}>
            {personCount >= 2 ? "Yes" : "No"}
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Single candidate check</div>
        </div>

        <div className="card" style={{ padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>⚠️ Video Anomaly</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: videoAnomaly >= 50 ? "#ef4444" : "#22c55e" }}>
            {videoAnomaly}%
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Camera stability</div>
        </div>

        <div className="card" style={{ padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>🤖 External Assistance</div>
          <div style={{ fontSize: "20px", fontWeight: "700", color: externalAssistance >= 50 ? "#ef4444" : "#22c55e" }}>
            {externalAssistance}%
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Prompting check</div>
        </div>
      </div>

      {/* ANSWER SECTION */}
      <div className="card" style={{ padding: "20px", marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <label style={{ fontSize: "13px", fontWeight: "600", color: "#f8fafc" }}>
            Your Answer (Type or Speak)
          </label>
          {listening && (
            <span style={{ fontSize: "12px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
              Recording voice answer...
            </span>
          )}
        </div>

        <textarea
          rows={4}
          style={{ width: "100%", padding: "12px", fontSize: "14px", resize: "vertical" }}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Speak using the microphone or type your response here..."
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            {!listening ? (
              <button
                className="secondary-btn"
                style={{ padding: "10px 16px", fontSize: "13px" }}
                onClick={startListening}
              >
                🎤 Speak Answer
              </button>
            ) : (
              <button
                className="primary-btn"
                style={{ background: "#ef4444", padding: "10px 16px", fontSize: "13px" }}
                onClick={stopListening}
              >
                ⏹ Stop Listening
              </button>
            )}
          </div>

          <button
            className="primary-btn"
            style={{ padding: "10px 20px", fontSize: "14px" }}
            onClick={submitAnswer}
            disabled={!answer.trim()}
          >
            {currentQuestionIndex === 4 ? "Submit & Complete Interview →" : "Submit & Next Question →"}
          </button>
        </div>
      </div>

      {/* COMPLETED QUESTIONS SUMMARY */}
      {qaList.length > 0 && (
        <div className="card" style={{ padding: "18px" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#94a3b8" }}>
            Completed Questions ({qaList.length}/5)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {qaList.map((qa, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(11, 16, 32, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  borderRadius: "8px",
                  padding: "12px",
                  fontSize: "13px",
                }}
              >
                <strong style={{ color: "#818cf8" }}>Q{idx + 1}: {qa.question}</strong>
                <p style={{ color: "#cbd5e1", margin: "6px 0 0" }}>{qa.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// 3. RECORDED INTERVIEW / VIDEO ANALYSIS
// =========================================================

function RecordedInterview({ setActivePage, setAnalysisResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [candidateName, setCandidateName] = useState("Recorded Candidate");
  const [position, setPosition] = useState("Technical Role");
  const [statusMsg, setStatusMsg] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validExts = [".mp4", ".avi", ".mov", ".mkv", ".webm"];
    const nameLower = selected.name.toLowerCase();
    const isValid = validExts.some((ext) => nameLower.endsWith(ext));

    if (!isValid) {
      alert("Unsupported format. Please select an MP4, AVI, MOV, MKV, or WEBM video.");
      return;
    }

    setFile(selected);
    setStatusMsg(`Selected: ${selected.name} (${(selected.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const analyzeVideo = async () => {
    if (!file) {
      alert("Please select a recorded video file first.");
      return;
    }

    setLoading(true);
    setStatusMsg("Analyzing video with OpenCV and YOLO frame sampling...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/analyze-video`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Video analysis failed");
      }

      setVideoResult(data);
      setStatusMsg("Analysis completed successfully.");
    } catch (err) {
      console.error(err);
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openInAnalysisResult = () => {
    if (!videoResult) return;

    const formattedResult = {
      success: true,
      candidate: {
        name: candidateName,
        position: position,
        skills: "Extracted from Video Analysis",
        experience: "Recorded Session",
        interview: `Recorded interview video file: ${videoResult.filename}`,
      },
      risk_score: videoResult.risk_score,
      risk_level: videoResult.risk_level,
      reasons: videoResult.reasons,
      signals: {
        skill_mismatch: 0,
        technical_depth: 0,
        profile_contradiction: 0,
        external_assistance: Math.min(15, Math.round((videoResult.detection?.external_assistance || 0) * 0.15)),
        observation_points: Math.min(
          10,
          (videoResult.detection?.multiple_person_ratio > 0 ? 4 : 0) +
            (videoResult.detection?.face_missing_ratio > 25 ? 3 : 0) +
            (videoResult.detection?.video_anomaly > 40 ? 3 : 0)
        ),
      },
      evidence: videoResult.evidence,
      next_action: videoResult.next_action,
      disclaimer: videoResult.disclaimer || DISCLAIMER_TEXT,
      video_analysis: {
        filename: videoResult.filename,
        duration_seconds: videoResult.video?.duration_seconds ?? 0,
        total_frames: videoResult.video?.total_frames ?? 0,
        analyzed_frames: videoResult.video?.analyzed_frames ?? 0,
        max_person_count: videoResult.detection?.max_person_count ?? 0,
        max_phone_count: videoResult.detection?.max_phone_count ?? 0,
        multiple_person_ratio: videoResult.detection?.multiple_person_ratio ?? 0,
        face_visible_ratio: videoResult.detection?.face_visible_ratio ?? 0,
        face_missing_ratio: videoResult.detection?.face_missing_ratio ?? 0,
        video_anomaly: videoResult.detection?.video_anomaly ?? 0,
        external_assistance: videoResult.detection?.external_assistance ?? 0,
      },
    };

    setAnalysisResult(formattedResult);
    setActivePage("Analysis Result");
  };

  return (
    <div className="page-content" style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "28px" }}>📹</span>
          <div>
            <h2 style={{ fontSize: "20px", color: "#f8fafc", margin: 0 }}>Recorded Interview / Video Analysis</h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
              Upload an interview recording for automated YOLO person & phone detection, face visibility tracking, and integrity scoring.
            </p>
          </div>
        </div>

        {/* PROFILE INPUTS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
              Candidate Name (Optional)
            </label>
            <input
              type="text"
              style={{ width: "100%", padding: "10px 12px" }}
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Recorded Candidate"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#94a3b8", marginBottom: "6px" }}>
              Target Role
            </label>
            <input
              type="text"
              style={{ width: "100%", padding: "10px 12px" }}
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Software Engineer"
            />
          </div>
        </div>

        {/* UPLOAD ZONE */}
        <div
          style={{
            border: "2px dashed rgba(99, 102, 241, 0.4)",
            borderRadius: "12px",
            padding: "36px 20px",
            textAlign: "center",
            background: "rgba(99, 102, 241, 0.04)",
            cursor: "pointer",
            marginBottom: "18px",
          }}
          onClick={() => document.getElementById("recorded-video-file-input").click()}
        >
          <input
            id="recorded-video-file-input"
            type="file"
            accept=".mp4,.avi,.mov,.mkv,.webm"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div style={{ fontSize: "42px", marginBottom: "10px" }}>📁</div>
          <strong style={{ fontSize: "15px", color: "#f8fafc", display: "block" }}>
            {file ? file.name : "Click or drag video to upload"}
          </strong>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>
            Supported formats: MP4, AVI, MOV, MKV, WEBM (Frames sampled ~1 per sec)
          </span>
        </div>

        {statusMsg && (
          <div style={{ fontSize: "13px", color: loading ? "#38bdf8" : "#94a3b8", marginBottom: "16px" }}>
            {statusMsg}
          </div>
        )}

        <button
          className="primary-btn"
          style={{ width: "100%", padding: "12px", fontSize: "14px" }}
          onClick={analyzeVideo}
          disabled={!file || loading}
        >
          {loading ? "Analyzing Video Frames..." : "Run Video Analysis →"}
        </button>
      </div>

      {/* DETAILED STRUCTURED RESULTS */}
      {videoResult && (
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8" }}>ANALYSIS COMPLETE</span>
              <h3 style={{ margin: "4px 0 0", color: "#f8fafc" }}>{videoResult.filename}</h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#ffffff" }}>
                {videoResult.risk_score}/100
              </div>
              <RiskBadge level={videoResult.risk_level} />
            </div>
          </div>

          {/* METRICS GRID USING EXACT REQUIRED FIELD NAMES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Duration</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.video?.duration_seconds ?? 0}s
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Total Frames</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.video?.total_frames ?? 0}
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Analyzed Frames</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.video?.analyzed_frames ?? 0}
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Max Persons</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.max_person_count ?? 0}
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Max Phones</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.max_phone_count ?? 0}
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Multiple-Person Ratio</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.multiple_person_ratio ?? 0}%
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Face-Visible Ratio</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.face_visible_ratio ?? 0}%
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Face-Missing Ratio</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.face_missing_ratio ?? 0}%
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Video Anomaly</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.video_anomaly ?? 0}%
              </strong>
            </div>

            <div className="card" style={{ padding: "12px", background: "rgba(11, 16, 32, 0.6)" }}>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>External Assistance</div>
              <strong style={{ fontSize: "16px", color: "#f8fafc" }}>
                {videoResult.detection?.external_assistance ?? 0}%
              </strong>
            </div>
          </div>

          {/* REASONS & NEXT ACTION */}
          <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "10px", padding: "16px", marginBottom: "16px" }}>
            <strong style={{ color: "#818cf8", fontSize: "13px", display: "block", marginBottom: "8px" }}>
              Detected Observations
            </strong>
            <ul style={{ margin: "0 0 0 18px", color: "#cbd5e1", fontSize: "13px" }}>
              {videoResult.reasons?.map((r, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
            <strong style={{ color: "#818cf8", fontSize: "13px", display: "block", marginBottom: "4px" }}>
              Recommended Next Action
            </strong>
            <p style={{ margin: 0, fontSize: "13px", color: "#f8fafc" }}>{videoResult.next_action}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              ⓘ {videoResult.disclaimer || DISCLAIMER_TEXT}
            </span>
            <button className="primary-btn" style={{ padding: "10px 20px" }} onClick={openInAnalysisResult}>
              View in Full Analysis Report →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// 4. POLISHED ANALYSIS RESULT SCREEN
// =========================================================

function AnalysisResult({ result, setActivePage }) {
  const [sampleResult, setSampleResult] = useState(() => {
    if (result) return null;
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("sample") === "true") {
      return {
        success: true,
        candidate: {
          name: "Rahul Sharma",
          position: "Full Stack Engineer",
          skills: "Python, SQL, React, API",
          experience: "2 years software development",
          interview: "I develop full stack web applications using React and Python APIs with SQL databases."
        },
        risk_score: 18,
        risk_level: "LOW",
        reasons: [
          "Candidate responses are reasonably consistent with the provided profile.",
          "No major integrity anomaly detected."
        ],
        signals: {
          skill_mismatch: 8,
          technical_depth: 6,
          profile_contradiction: 0,
          external_assistance: 0,
          observation_points: 4
        },
        evidence: {
          potential_phone_detected: false,
          multiple_person_activity: false,
          face_visibility_issue: false,
          potential_visual_anomaly: false
        },
        next_action: "Continue normal interviewer review. No major integrity signal detected.",
        disclaimer: DISCLAIMER_TEXT
      };
    }
    return null;
  });

  const displayData = result || sampleResult;

  if (!displayData) {
    return (
      <div className="page-content" style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <div className="card" style={{ padding: "36px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>📊</div>
          <h2 style={{ color: "#ffffff", marginBottom: "8px" }}>No Analysis Available</h2>
          <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>
            Complete a Live Interview, upload a Recorded Video, or run Demo Mode to generate a full integrity report.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="primary-btn" onClick={() => setActivePage("Live Interview")}>
              Start Live Interview →
            </button>
            <button
              className="secondary-btn"
              onClick={() =>
                setSampleResult({
                  success: true,
                  candidate: {
                    name: "Rahul Sharma",
                    position: "Full Stack Engineer",
                    skills: "Python, SQL, React, API",
                    experience: "2 years software development",
                    interview: "I develop full stack web applications using React and Python APIs with SQL databases."
                  },
                  risk_score: 18,
                  risk_level: "LOW",
                  reasons: [
                    "Candidate responses are reasonably consistent with the provided profile.",
                    "No major integrity anomaly detected."
                  ],
                  signals: {
                    skill_mismatch: 8,
                    technical_depth: 6,
                    profile_contradiction: 0,
                    external_assistance: 0,
                    observation_points: 4
                  },
                  evidence: {
                    potential_phone_detected: false,
                    multiple_person_activity: false,
                    face_visibility_issue: false,
                    potential_visual_anomaly: false
                  },
                  video_analysis: {
                    filename: "Sample_Interview_Session.webm",
                    duration_seconds: 3,
                    analyzed_frames: 3,
                    max_person_count: 1,
                    max_phone_count: 0,
                    face_visible_ratio: 100,
                  },
                  next_action: "Continue normal interviewer review. No major integrity signal detected.",
                  disclaimer: DISCLAIMER_TEXT
                })
              }
            >
              Load Sample Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  const riskScore = displayData.risk_score ?? 0;
  const riskLevel = displayData.risk_level || "LOW";
  const candidate = displayData.candidate || {};
  const reasons = displayData.reasons || [];
  const signals = displayData.signals || {};
  const evidence = displayData.evidence || {};
  const videoAnalysis = displayData.video_analysis || (displayData.video && displayData.detection ? {
    filename: displayData.filename || "Interview Recording",
    duration_seconds: displayData.video?.duration_seconds ?? 0,
    analyzed_frames: displayData.video?.analyzed_frames ?? 0,
    max_person_count: displayData.detection?.max_person_count ?? 0,
    max_phone_count: displayData.detection?.max_phone_count ?? 0,
    face_visible_ratio: displayData.detection?.face_visible_ratio ?? 0,
  } : null);

  // Filter actual existing evidence flags
  const evidenceItems = [];
  if (evidence.potential_phone_detected) {
    evidenceItems.push({ title: "Potential Phone / External Device", desc: "Phone signal detected during video monitoring" });
  }
  if (evidence.multiple_person_activity) {
    evidenceItems.push({ title: "Multiple Person Activity", desc: "More than one person detected in the camera frame" });
  }
  if (evidence.face_visibility_issue) {
    evidenceItems.push({ title: "Face Visibility Issue", desc: "Candidate face was missing or not centered in multiple frames" });
  }
  if (evidence.potential_visual_anomaly) {
    evidenceItems.push({ title: "Potential Visual Anomaly", desc: "Environmental motion or camera signal variation flagged" });
  }

  return (
    <div className="page-content" style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px" }}>
          OFFICIAL INTEGRITY REPORT
        </span>
        <h2 style={{ margin: "4px 0 0", color: "#f8fafc", fontSize: "24px" }}>
          Candidate Interview Risk Assessment
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
          AI-assisted verification summary for human interviewer decision-making.
        </p>
      </div>

      {/* PROMINENT SCORE BANNER */}
      <div
        className="card"
        style={{
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          background: "linear-gradient(135deg, #151d35 0%, #1a2440 100%)",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px" }}>
            INTEGRITY RISK SCORE
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", margin: "6px 0" }}>
            <span style={{ fontSize: "48px", fontWeight: "800", color: "#ffffff" }}>{riskScore}</span>
            <span style={{ fontSize: "18px", color: "#94a3b8" }}>/ 100</span>
          </div>
          <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
            Candidate: <strong style={{ color: "#ffffff" }}>{candidate.name || "Candidate"}</strong> ({candidate.position || "Technical Role"})
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>ASSESSED RISK LEVEL</div>
          <RiskBadge level={riskLevel} />
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
            {riskLevel === "LOW" ? "0–29 Score Range" : riskLevel === "MEDIUM" ? "30–59 Score Range" : "60–100 Score Range"}
          </div>
        </div>
      </div>

      {/* 2-COLUMN LAYOUT: SIGNALS BREAKDOWN & REASONS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "20px", marginBottom: "24px" }}>
        {/* SIGNALS BREAKDOWN */}
        <div className="card" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#f8fafc" }}>
            Risk Signals Breakdown (Max 100)
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Skill Mismatch</span>
              <strong style={{ color: signals.skill_mismatch > 15 ? "#f59e0b" : "#818cf8" }}>
                +{signals.skill_mismatch ?? 0} / 30 pts
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Technical-Depth Deficit</span>
              <strong style={{ color: signals.technical_depth > 10 ? "#f59e0b" : "#818cf8" }}>
                +{signals.technical_depth ?? 0} / 20 pts
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Profile Contradiction</span>
              <strong style={{ color: signals.profile_contradiction > 10 ? "#f59e0b" : "#818cf8" }}>
                +{signals.profile_contradiction ?? 0} / 25 pts
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>External Assistance / Phone</span>
              <strong style={{ color: signals.external_assistance > 0 ? "#ef4444" : "#818cf8" }}>
                +{signals.external_assistance ?? 0} / 15 pts
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px" }}>
              <span>Visual Observation Signals</span>
              <strong style={{ color: signals.observation_points > 0 ? "#f59e0b" : "#818cf8" }}>
                +{signals.observation_points ?? 0} / 10 pts (Capped)
              </strong>
            </div>
          </div>
        </div>

        {/* WHY THIS RESULT? (2-3 REASONS) */}
        <div className="card" style={{ padding: "20px" }}>
          <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#f8fafc" }}>
            Why This Result?
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reasons.map((r, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(148, 163, 184, 0.15)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  color: "#cbd5e1",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span style={{ color: "#818cf8", fontWeight: "700" }}>{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EVIDENCE SECTION (ONLY SHOW REAL EVIDENCE) */}
      <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#f8fafc" }}>
          Evidence & Monitoring Signals
        </h4>
        {evidenceItems.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {evidenceItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <strong style={{ color: "#ef4444", fontSize: "13px", display: "block" }}>
                  ⚠️ {item.title}
                </strong>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>{item.desc}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#22c55e", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✓</span> No adverse visual or external device monitoring evidence flagged.
          </div>
        )}
      </div>

      {/* RECORDED VIDEO DETAILS IF PRESENT */}
      {videoAnalysis && (
        <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 14px 0", fontSize: "15px", color: "#f8fafc" }}>
            Video & Monitoring Details
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", fontSize: "12px" }}>
            <div style={{ padding: "8px", background: "rgba(11, 16, 32, 0.5)", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8" }}>Filename:</span> <strong>{videoAnalysis.filename}</strong>
            </div>
            <div style={{ padding: "8px", background: "rgba(11, 16, 32, 0.5)", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8" }}>Duration:</span> <strong>{videoAnalysis.duration_seconds}s</strong>
            </div>
            <div style={{ padding: "8px", background: "rgba(11, 16, 32, 0.5)", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8" }}>Analyzed Frames:</span> <strong>{videoAnalysis.analyzed_frames}</strong>
            </div>
            <div style={{ padding: "8px", background: "rgba(11, 16, 32, 0.5)", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8" }}>Max Persons:</span> <strong>{videoAnalysis.max_person_count}</strong>
            </div>
            <div style={{ padding: "8px", background: "rgba(11, 16, 32, 0.5)", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8" }}>Max Phones:</span> <strong>{videoAnalysis.max_phone_count}</strong>
            </div>
            <div style={{ padding: "8px", background: "rgba(11, 16, 32, 0.5)", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8" }}>Face Visible:</span> <strong>{videoAnalysis.face_visible_ratio}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDED NEXT ACTION */}
      <div
        className="card"
        style={{
          padding: "20px",
          marginBottom: "20px",
          background: "rgba(99, 102, 241, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
        }}
      >
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px" }}>
          RECOMMENDED NEXT ACTION
        </span>
        <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#ffffff", fontWeight: "500" }}>
          {result.next_action || "Continue normal interviewer review."}
        </p>
      </div>

      {/* HUMAN REVIEW DISCLAIMER */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "#94a3b8",
          marginBottom: "24px",
        }}
      >
        <span style={{ fontSize: "18px" }}>ℹ️</span>
        <div>
          <strong style={{ color: "#f8fafc" }}>Human Review Disclaimer:</strong>{" "}
          {result.disclaimer || DISCLAIMER_TEXT}
        </div>
      </div>

      {/* NAVIGATION BUTTONS */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button className="primary-btn" style={{ padding: "10px 20px" }} onClick={() => setActivePage("Live Interview")}>
          Start Another Interview →
        </button>
        <button className="secondary-btn" style={{ padding: "10px 20px" }} onClick={() => setActivePage("Dashboard")}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

// =========================================================
// 5. DEMO MODE (USES THE REAL ANALYSIS ENGINE)
// =========================================================

function DemoMode({ setActivePage, setAnalysisResult }) {
  const demoCases = [
    {
      id: 1,
      title: "Case 1: Normal Candidate",
      expectedLevel: "LOW",
      desc: "Good skill match, technical vocabulary present, clean visual signals.",
      payload: {
        candidate: {
          name: "Rahul Sharma",
          position: "Full Stack Engineer",
          skills: "Python, SQL, React, API",
          experience: "2 years software development",
          interview:
            "I develop web applications using React on the frontend and Python with SQL databases for the API. I optimize database queries and implement REST endpoints with proper testing and clean architecture.",
        },
        qa_pairs: [],
        signals: {
          external_assistance: 0,
          video_anomaly: 0,
          lip_sync_anomaly: 0,
          phone_detected: false,
          multiple_persons: false,
          candidate_missing: false,
          face_missing: false,
          face_visible_ratio: 100,
        },
      },
    },
    {
      id: 2,
      title: "Case 2: Skill Mismatch",
      expectedLevel: "MEDIUM",
      desc: "Candidate claims cloud architecture skills but responses discuss basic markup.",
      payload: {
        candidate: {
          name: "Priya Mehta",
          position: "Cloud Architect",
          skills: "Kubernetes, Docker, Terraform, AWS, Microservices",
          experience: "3 years in cloud infrastructure",
          interview:
            "I mostly create web pages with standard text and basic styling. I like design and web browsing.",
        },
        qa_pairs: [],
        signals: {
          external_assistance: 0,
          video_anomaly: 0,
          lip_sync_anomaly: 0,
          phone_detected: false,
          multiple_persons: false,
          candidate_missing: false,
          face_missing: false,
          face_visible_ratio: 100,
        },
      },
    },
    {
      id: 3,
      title: "Case 3: Profile Contradiction",
      expectedLevel: "LOW / ELEVATED",
      desc: "Claims senior AI lead expertise but admits lack of familiarity with core concepts.",
      payload: {
        candidate: {
          name: "Anita Desai",
          position: "Senior AI Lead",
          skills: "Machine Learning, Deep Learning, Neural Networks",
          experience: "Senior Machine Learning Specialist",
          interview:
            "I know machine learning and neural networks are used for classification and regression, but i don't know machine learning algorithms in depth and never used deep learning models in real systems.",
        },
        qa_pairs: [],
        signals: {
          external_assistance: 0,
          video_anomaly: 0,
          lip_sync_anomaly: 0,
          phone_detected: false,
          multiple_persons: false,
          candidate_missing: false,
          face_missing: false,
          face_visible_ratio: 100,
        },
      },
    },
    {
      id: 4,
      title: "Case 4: External Device / Phone Signal",
      expectedLevel: "ELEVATED",
      desc: "Visual monitoring flagged phone detection during interview session.",
      payload: {
        candidate: {
          name: "Arjun Patel",
          position: "Software Developer",
          skills: "Python, Java",
          experience: "1 year",
          interview: "I work on software development and use Python for scripts and backend code.",
        },
        qa_pairs: [],
        signals: {
          external_assistance: 90,
          video_anomaly: 40,
          lip_sync_anomaly: 0,
          phone_detected: true,
          multiple_persons: false,
          candidate_missing: false,
          face_missing: false,
          face_visible_ratio: 90,
        },
      },
    },
    {
      id: 5,
      title: "Case 5: Multiple-Person & Anomaly",
      expectedLevel: "HIGH",
      desc: "Multiple persons, phone signal, and profile contradiction detected.",
      payload: {
        candidate: {
          name: "Siddharth Roy",
          position: "Backend Architect",
          skills: "Distributed Systems, Cloud Architecture, Kubernetes, Microservices",
          experience: "Senior Architect",
          interview:
            "i don't know distributed systems, never used cloud architecture, no idea about microservices.",
        },
        qa_pairs: [],
        signals: {
          external_assistance: 90,
          video_anomaly: 85,
          lip_sync_anomaly: 0,
          phone_detected: true,
          multiple_persons: true,
          candidate_missing: false,
          face_missing: true,
          face_visible_ratio: 40,
        },
      },
    },
  ];

  const [selectedCase, setSelectedCase] = useState(demoCases[0]);
  const [demoResult, setDemoResult] = useState(null);
  const [running, setRunning] = useState(false);

  const runDemoAnalysis = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedCase.payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDemoResult(data);
    } catch (err) {
      console.error(err);
      alert("Demo execution failed. Make sure the backend is running.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px" }}>
          DEMONSTRATION ENVIRONMENT
        </span>
        <h2 style={{ margin: "4px 0 0", color: "#f8fafc", fontSize: "22px" }}>
          Synthetic Demo Scenarios
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
          Run synthetic demonstration cases through the live InterviewGuard scoring engine.
        </p>
      </div>

      {/* CASE SELECTOR TABS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "20px" }}>
        {demoCases.map((c) => (
          <button
            key={c.id}
            className="card"
            style={{
              padding: "12px",
              textAlign: "left",
              border: selectedCase.id === c.id ? "1px solid #818cf8" : "1px solid rgba(148, 163, 184, 0.15)",
              background: selectedCase.id === c.id ? "rgba(99, 102, 241, 0.15)" : "rgba(21, 29, 53, 0.8)",
            }}
            onClick={() => {
              setSelectedCase(c);
              setDemoResult(null);
            }}
          >
            <strong style={{ color: "#ffffff", fontSize: "13px", display: "block" }}>{c.title}</strong>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Expected: {c.expectedLevel}</span>
          </button>
        ))}
      </div>

      {/* SELECTED CASE DETAILS */}
      <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h3 style={{ margin: 0, color: "#ffffff", fontSize: "16px" }}>{selectedCase.title}</h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>{selectedCase.desc}</span>
          </div>
          <button
            className="primary-btn"
            style={{ padding: "8px 18px", fontSize: "13px" }}
            onClick={runDemoAnalysis}
            disabled={running}
          >
            {running ? "Executing Engine..." : "Run Demo Analysis →"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "12px", marginBottom: "14px" }}>
          <div style={{ background: "rgba(11, 16, 32, 0.6)", padding: "12px", borderRadius: "8px" }}>
            <span style={{ color: "#818cf8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
              Candidate Profile
            </span>
            <div><strong>Name:</strong> {selectedCase.payload.candidate.name}</div>
            <div><strong>Position:</strong> {selectedCase.payload.candidate.position}</div>
            <div><strong>Skills:</strong> {selectedCase.payload.candidate.skills}</div>
            <div><strong>Experience:</strong> {selectedCase.payload.candidate.experience}</div>
          </div>

          <div style={{ background: "rgba(11, 16, 32, 0.6)", padding: "12px", borderRadius: "8px" }}>
            <span style={{ color: "#818cf8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
              Monitoring Signals
            </span>
            <div><strong>Phone Detected:</strong> {selectedCase.payload.signals.phone_detected ? "Yes (Flagged)" : "No"}</div>
            <div><strong>Multiple Persons:</strong> {selectedCase.payload.signals.multiple_persons ? "Yes (Flagged)" : "No"}</div>
            <div><strong>Face Visibility:</strong> {selectedCase.payload.signals.face_visible_ratio}%</div>
            <div><strong>Video Anomaly:</strong> {selectedCase.payload.signals.video_anomaly}%</div>
          </div>
        </div>

        <div style={{ background: "rgba(11, 16, 32, 0.6)", padding: "12px", borderRadius: "8px", fontSize: "12px" }}>
          <span style={{ color: "#818cf8", fontWeight: "700", display: "block", marginBottom: "4px" }}>
            Interview Response
          </span>
          <p style={{ margin: 0, color: "#cbd5e1" }}>"{selectedCase.payload.candidate.interview}"</p>
        </div>
      </div>

      {/* CALCULATED RESULT CARD */}
      {demoResult && (
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8" }}>CALCULATED BY ENGINE</span>
              <h3 style={{ margin: "4px 0 0", color: "#ffffff" }}>Engine Analysis Result</h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff" }}>
                {demoResult.risk_score}/100
              </div>
              <RiskBadge level={demoResult.risk_level} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "16px", fontSize: "12px" }}>
            <div style={{ background: "rgba(11, 16, 32, 0.5)", padding: "10px", borderRadius: "6px" }}>
              <span>Skill Mismatch:</span> <strong>+{demoResult.signals.skill_mismatch}/30</strong>
            </div>
            <div style={{ background: "rgba(11, 16, 32, 0.5)", padding: "10px", borderRadius: "6px" }}>
              <span>Technical Depth:</span> <strong>+{demoResult.signals.technical_depth}/20</strong>
            </div>
            <div style={{ background: "rgba(11, 16, 32, 0.5)", padding: "10px", borderRadius: "6px" }}>
              <span>Contradiction:</span> <strong>+{demoResult.signals.profile_contradiction}/25</strong>
            </div>
            <div style={{ background: "rgba(11, 16, 32, 0.5)", padding: "10px", borderRadius: "6px" }}>
              <span>Assistance:</span> <strong>+{demoResult.signals.external_assistance}/15</strong>
            </div>
            <div style={{ background: "rgba(11, 16, 32, 0.5)", padding: "10px", borderRadius: "6px" }}>
              <span>Observations:</span> <strong>+{demoResult.signals.observation_points}/10</strong>
            </div>
          </div>

          <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", padding: "12px", marginBottom: "14px", fontSize: "13px" }}>
            <strong style={{ color: "#818cf8", display: "block", marginBottom: "6px" }}>Calculated Reasons:</strong>
            <ul style={{ margin: "0 0 0 16px", color: "#cbd5e1" }}>
              {demoResult.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: "rgba(15, 23, 42, 0.6)", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px" }}>
            <strong style={{ color: "#818cf8", display: "block", marginBottom: "4px" }}>Recommended Action:</strong>
            <span style={{ color: "#f8fafc" }}>{demoResult.next_action}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="secondary-btn"
              style={{ padding: "8px 16px", fontSize: "13px" }}
              onClick={() => {
                setAnalysisResult(demoResult);
                setActivePage("Analysis Result");
              }}
            >
              Open in Full Analysis Result →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// 6. TEST LAB (VALIDATION SUITE RUNNING REAL ENDPOINT)
// =========================================================

function TestLab() {
  const [suiteResult, setSuiteResult] = useState(null);
  const [running, setRunning] = useState(false);

  const runAllTests = async () => {
    setRunning(true);
    try {
      const res = await fetch(`${API_URL}/test-lab/run`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();
      setSuiteResult(data);
    } catch (err) {
      console.error(err);
      alert("Test execution failed. Please ensure the backend is running.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#818cf8", letterSpacing: "1px" }}>
            AUTOMATED VERIFICATION SUITE
          </span>
          <h2 style={{ margin: "4px 0 0", color: "#f8fafc", fontSize: "22px" }}>
            Test Lab — Scoring Engine Verification
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>
            Validates exactly 5 synthetic test cases covering skill mismatch, technical depth, contradictions, external device signals, and monitoring observations.
          </p>
        </div>

        <button
          className="primary-btn"
          style={{ padding: "10px 22px", fontSize: "14px" }}
          onClick={runAllTests}
          disabled={running}
        >
          {running ? "Executing Suite..." : "RUN ALL TESTS →"}
        </button>
      </div>

      {/* SUMMARY BANNER */}
      {suiteResult && (
        <div
          className="card"
          style={{
            padding: "18px 24px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background:
              suiteResult.summary?.failed === 0
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            border:
              suiteResult.summary?.failed === 0
                ? "1px solid rgba(34, 197, 94, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8" }}>TEST SUITE STATUS</span>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#ffffff", marginTop: "4px" }}>
              {suiteResult.summary?.failed === 0 ? "✓ ALL TESTS PASSED" : "✕ SOME TESTS FAILED"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "24px", textAlign: "right" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Tests Passed</div>
              <strong style={{ fontSize: "22px", color: "#22c55e" }}>
                {suiteResult.summary?.passed ?? 0}/5
              </strong>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Tests Failed</div>
              <strong style={{ fontSize: "22px", color: suiteResult.summary?.failed === 0 ? "#94a3b8" : "#ef4444" }}>
                {suiteResult.summary?.failed ?? 0}/5
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 5 TEST CARDS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {(suiteResult?.tests || [
          {
            id: 1,
            name: "Normal Candidate",
            description: "Strong alignment between claimed skills and technical responses with clean visual monitoring signals.",
            expected_level: "LOW",
          },
          {
            id: 2,
            name: "Skill Mismatch Scenario",
            description: "Candidate claims specialized cloud architecture skills but responses only discuss generic basic markup.",
            expected_level: "MEDIUM",
          },
          {
            id: 3,
            name: "Technical Depth Deficit",
            description: "Candidate matches basic skills but responses show limited technical depth relative to role expectations.",
            expected_level: "LOW",
          },
          {
            id: 4,
            name: "Profile Contradiction Scenario",
            description: "Candidate claims senior AI lead status but indicates lack of familiarity with core concepts while knowing terminology.",
            expected_level: "LOW",
          },
          {
            id: 5,
            name: "Multiple Integrity Signals",
            description: "Multiple integrity signals detected: skill mismatch, contradiction, external phone detection, and multiple persons present.",
            expected_level: "HIGH",
          },
        ]).map((t) => (
          <div key={t.id} className="card" style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
              <div>
                <strong style={{ fontSize: "15px", color: "#ffffff", display: "block" }}>
                  Test {t.id}: {t.name}
                </strong>
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: "4px 0 0" }}>{t.description}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "#818cf8",
                  }}
                >
                  Expected: {t.expected_level}
                </span>

                {t.actual_level && (
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      background: t.passed ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                      color: t.passed ? "#22c55e" : "#ef4444",
                      border: t.passed ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid rgba(239, 68, 68, 0.4)",
                    }}
                  >
                    {t.passed ? "✓ PASS" : "✕ FAIL"}
                  </span>
                )}
              </div>
            </div>

            {t.actual_score !== undefined && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "rgba(11, 16, 32, 0.6)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#cbd5e1",
                }}
              >
                <div>
                  Calculated Risk Score: <strong style={{ color: "#ffffff" }}>{t.actual_score}/100</strong> | Level: <RiskBadge level={t.actual_level} />
                </div>
                {t.signal_breakdown && (
                  <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                    Skill: +{t.signal_breakdown.skill_mismatch} | Depth: +{t.signal_breakdown.technical_depth} | Contradiction: +{t.signal_breakdown.profile_contradiction} | Assist: +{t.signal_breakdown.external_assistance} | Obs: +{t.signal_breakdown.observation_points}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* HUMAN REVIEW DISCLAIMER */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "12px",
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "13px",
          color: "#94a3b8",
          marginTop: "24px",
        }}
      >
        <span style={{ fontSize: "18px" }}>ℹ️</span>
        <div>
          <strong style={{ color: "#f8fafc" }}>Human Review Disclaimer:</strong>{" "}
          Test Lab validates scoring behavior against synthetic cases only. It does not make automated hiring or rejection decisions.
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN APP COMPONENT & NAVIGATION
// =========================================================

function App() {
  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("page");
      if (p) return p;
    }
    return "Dashboard";
  });
  const [analysisResult, setAnalysisResult] = useState(null);

  const navigateToPage = (page) => {
    setActivePage(page);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("page", page);
      window.history.replaceState(null, "", url.toString());
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Live Interview", icon: "🎤" },
    { name: "Recorded Interview", icon: "📹" },
    { name: "Analysis Result", icon: "📊" },
    { name: "Demo Mode", icon: "⚡" },
    { name: "Test Lab", icon: "✓" },
  ];

  return (
    <div className="app" style={{ display: "flex", minHeight: "100vh", background: "#0b1020" }}>
      {/* SIDEBAR */}
      <aside
        className="sidebar"
        style={{
          width: "250px",
          minHeight: "100vh",
          background: "#101828",
          color: "#ffffff",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "4px 8px 24px" }}>
          <div
            className="brand-icon"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #38bdf8)",
              display: "grid",
              placeItems: "center",
              fontSize: "18px",
              color: "#ffffff",
            }}
          >
            🛡️
          </div>
          <div>
            <h2 style={{ fontSize: "15px", color: "#ffffff", margin: 0, letterSpacing: "-0.2px" }}>InterviewGuard</h2>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>Deepfake & Integrity Alert</span>
          </div>
        </div>

        <div className="sidebar-section" style={{ flex: 1 }}>
          <p style={{ color: "#64748b", fontSize: "10px", fontWeight: "700", letterSpacing: "1px", padding: "0 10px 8px" }}>
            MAIN MODES
          </p>

          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`menu-item ${activePage === item.name ? "active" : ""}`}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                border: 0,
                borderRadius: "9px",
                padding: "11px 12px",
                marginBottom: "4px",
                background: activePage === item.name ? "rgba(99, 102, 241, 0.2)" : "transparent",
                color: activePage === item.name ? "#ffffff" : "#94a3b8",
                fontWeight: activePage === item.name ? "600" : "normal",
                borderLeft: activePage === item.name ? "3px solid #818cf8" : "3px solid transparent",
                textAlign: "left",
                fontSize: "13px",
                transition: "all 0.2s",
              }}
              onClick={() => navigateToPage(item.name)}
            >
              <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div
            style={{
              padding: "12px",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              borderRadius: "10px",
              background: "#162131",
              fontSize: "11px",
              color: "#94a3b8",
            }}
          >
            <strong style={{ color: "#ffffff", display: "block", marginBottom: "2px" }}>
              🔒 Human Review First
            </strong>
            Assistive risk indicators only. No automated rejection.
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main" style={{ marginLeft: "250px", flex: 1, minHeight: "100vh", background: "#0b1020" }}>
        {/* TOPBAR */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
            background: "rgba(11, 16, 32, 0.9)",
            backdropFilter: "blur(8px)",
            position: "sticky",
            top: 0,
            zIndex: 5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 28px",
          }}
        >
          <div>
            <span style={{ fontSize: "10px", color: "#818cf8", fontWeight: "700", letterSpacing: "1px" }}>
              INTERVIEWGUARD PLATFORM
            </span>
            <h1 style={{ fontSize: "16px", margin: 0, color: "#ffffff" }}>{activePage}</h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                color: "#22c55e",
                background: "rgba(34, 197, 94, 0.1)",
                padding: "5px 12px",
                borderRadius: "20px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
              System Online
            </div>

            <button
              className="primary-btn"
              style={{ padding: "8px 16px", fontSize: "13px" }}
              onClick={() => navigateToPage("Live Interview")}
            >
              + Start Live Interview
            </button>
          </div>
        </header>

        {/* ACTIVE PAGES */}
        <div style={{ padding: "20px 0" }}>
          {activePage === "Dashboard" && (
            <Dashboard setActivePage={navigateToPage} setAnalysisResult={setAnalysisResult} />
          )}

          {activePage === "Live Interview" && (
            <LiveInterview setActivePage={navigateToPage} setAnalysisResult={setAnalysisResult} />
          )}

          {activePage === "Recorded Interview" && (
            <RecordedInterview setActivePage={navigateToPage} setAnalysisResult={setAnalysisResult} />
          )}

          {activePage === "Analysis Result" && (
            <AnalysisResult result={analysisResult} setActivePage={navigateToPage} />
          )}

          {activePage === "Demo Mode" && (
            <DemoMode setActivePage={navigateToPage} setAnalysisResult={setAnalysisResult} />
          )}

          {activePage === "Test Lab" && <TestLab />}
        </div>
      </main>
    </div>
  );
}

export default App;
