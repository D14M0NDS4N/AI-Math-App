import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, BookOpen, Brain, Calculator, RefreshCw, CheckCircle, Trophy, User, Star, List, Edit3, ArrowRight, XCircle, Save, LogOut } from 'lucide-react';
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

type LeaderboardItem = {
  name: string;
  score: number;
  date: string;
};

// --- KOMPONEN UTILITAS ---
const ModuleCard = ({ title, icon: Icon, color = "cyan", children }) => (
  <div className={`bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg hover:border-${color}-500/50 transition-colors`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
        <Icon size={24} className={`text-${color}-400`} />
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
    </div>
    <div className="text-slate-300 space-y-3 leading-relaxed text-sm">
      {children}
    </div>
  </div>
);

// --- LOGIKA UTAMA APLIKASI ---

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsInstanceRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  
  // Gunakan autentikasi palsu atau asli
  const { user } = useAuth();
  const currentUser = user || "User";
  
  // State Sistem
  const [activeTab, setActiveTab] = useState("detector");
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  
  // State Deteksi & Matematika
  const [handData, setHandData] = useState(null);
  const [totalFingers, setTotalFingers] = useState(0);
  
  // State Kuis Kamera
  const [quiz, setQuiz] = useState({ num1: 2, num2: 1, answer: 3 });
  const [quizStatus, setQuizStatus] = useState("thinking"); // 'thinking', 'correct', 'wrong'
  const [quizScore, setScore] = useState(0);
  
  // Jawban Kuis
  const quizAnswerRef = useRef(3);

  useEffect(() => {
    quizAnswerRef.current = quiz.answer;
  }, [quiz.answer]);

  const totalFingersRef = useRef(0);
  const activeTabRef = useRef(activeTab);
useEffect(() => { 
  activeTabRef.current = activeTab; 
}, [activeTab]);

  // State Kuis Latihan (Ketik)
  const [practiceQ, setPracticeQ] = useState({ num1: 5, num2: 3, answer: 8 });
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceStatus, setPracticeStatus] = useState("idle"); // 'idle', 'correct', 'wrong'
  const [practiceScore, setPracticeScore] = useState(0);

  // State Leaderboard & User
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([
    { name: "Budi Santoso", score: 150, date: "02/12/2025" },
    { name: "Siti Aminah", score: 120, date: "15/01/2026" },
    { name: "Rudi Hartono", score: 90, date: "02/01/2026" },
  ]);

  // --- 1. INISIALISASI MEDIAPIPE ---
  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'),
    ]).then(() => {
      setIsModelLoading(false);
    }).catch(err => {
      console.error("Gagal memuat library MediaPipe", err);
      setIsModelLoading(false);
    });
  }, []);

  // --- 2. SETUP KAMERA ---
  useEffect(() => {
    let stream = null;

    const startWebcam = async () => {
      if (cameraActive && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: "user" },
            audio: false
          });
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
        } catch (err) {
          console.error("Error webcam:", err);
          setCameraActive(false);
        }
      }
    };

    if (cameraActive) startWebcam();
    else if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    return () => stream?.getTracks().forEach(track => track.stop());
  }, [cameraActive]);

  // --- GENERATOR SOAL KUIS ---
  const generateNewQuestion = useCallback(() => {
    const operators = ['+', '-', '*'];
    const op = operators[Math.floor(Math.random() * operators.length)];
    
    let n1, n2, ans;
    
    do {
      n1 = Math.floor(Math.random() * 10);
      n2 = Math.floor(Math.random() * 10);
      
      if (op === '+') {
        ans = n1 + n2;
      } else if (op === '-') {
        if (n1 < n2) [n1, n2] = [n2, n1];
        ans = n1 - n2;
      } else if (op === '*') {
        ans = n1 * n2;
      }
      
    } while (ans > 10 || ans < 1 || (n1 === quiz.num1 && n2 === quiz.num2));
  
    setQuiz({
      num1: n1,
      num2: n2,
      operator: op,
      answer: ans
    });
    
    setQuizStatus("thinking");
  }, [quiz.num1, quiz.num2]);

  // Generator Soal Latihan (Ketik)
  const generatePracticeQuestion = useCallback(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setPracticeQ({ num1, num2, answer: num1 + num2 });
    setPracticeInput("");
    setPracticeStatus("idle");
  }, []);

  const handlePracticeSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(practiceInput);
    if (isNaN(val)) return;

    if (val === practiceQ.answer) {
      setPracticeStatus("correct");
      setPracticeScore(s => s + 10);
      setTimeout(generatePracticeQuestion, 1500);
    } else {
      setPracticeStatus("wrong");
    }
  };

  // --- LOGIKA MATEMATIKA & JARI ---
  const calculateDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const calculateAngle = (a, b, c) => {
    const vectorBA = { x: a.x - b.x, y: a.y - b.y };
    const vectorBC = { x: c.x - b.x, y: c.y - b.y };
    const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
    const magBA = Math.sqrt(vectorBA.x ** 2 + vectorBA.y ** 2);
    const magBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
    if (magBA === 0 || magBC === 0) return 0;
    const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct / (magBA * magBC))));
    return (angleRad * 180) / Math.PI;
  };

  const countRaisedFingers = (landmarks, handedness) => {
    let count = 0;
    const fingerTips = [8, 12, 16, 20];
    const fingerPips = [6, 10, 14, 18];
  
    // Deteksi Jari Telunjuk, Tengah, Manis, Kelingking
    fingerTips.forEach((tipIdx, i) => {
      // Y lebih kecil berarti posisi ujung jari lebih tinggi dari ruas jari
      if (landmarks[tipIdx].y < landmarks[fingerPips[i]].y) {
        count++;
      }
    });
  
    // Deteksi Jempol (Logika Horizontal berdasarkan Handedness)
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    
    if (handedness === 'Left') {
      // Untuk tangan kiri, jempol terbuka jika koordinat X ujung > ruas
      if (thumbTip.x > thumbIP.x) count++;
    } else {
      // Untuk tangan kanan, jempol terbuka jika koordinat X ujung < ruas
      if (thumbTip.x < thumbIP.x) count++;
    }
  
    return count;
  };

// --- 5. PEMROSESAN FRAME MEDIAPIPE (DIPERBAIKI) ---
const onResults = useCallback((results) => {
  if (activeTabRef.current !== 'detector') return; // Cek via Ref

  const canvas = canvasRef.current;
  const video = videoRef.current;
  if (!canvas || !video) return;

  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let detectedFingers = 0;
  let detectedHandData = null;

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    results.multiHandLandmarks.forEach((landmarks, index) => {
      // Visualisasi
      window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
      window.drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1, radius: 2 });

      const handedness = results.multiHandedness[index]?.label || "Right";
      detectedFingers += countRaisedFingers(landmarks, handedness);

      if (index === 0) {
        detectedHandData = {
          distance: calculateDistance(landmarks[4], landmarks[8]).toFixed(3),
          angle: calculateAngle(landmarks[0], landmarks[5], landmarks[8]).toFixed(1),
        };
      }
    });
  }

  // Update UI secara paksa
  setTotalFingers(detectedFingers);
  setHandData(detectedHandData);

  // Periksa Jawaban
  if (detectedFingers === quizAnswerRef.current) {
    setQuizStatus('correct');
  } else if (detectedFingers > 0) {
    setQuizStatus('wrong');
  } else {
    setQuizStatus('thinking');
  }
}, []);

  // Quiz Status
  useEffect(() => {
    if (quizStatus === 'correct') {
      const timer = setTimeout(() => {
        setScore(s => s + 10);
        generateNewQuestion();
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [quizStatus, generateNewQuestion]);

  // --- 6. SISTEM AUTO-SAVE & LEADERBOARD (DIPERBAIKI) ---

  // Effect: Auto-update leaderboard jika user sudah "login"
  // Logika baru: Menggabungkan skor AI + Latihan untuk nama user yang sama
  useEffect(() => {
    const totalScore = quizScore + practiceScore;
    if (!currentUser || totalScore <= 0) return;

    setLeaderboard((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((p) => p.name === currentUser);

      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          score: totalScore,
          date: new Date().toLocaleDateString("id-ID"),
        };
      } else {
        updated.push({
          name: currentUser,
          score: totalScore,
          date: new Date().toLocaleDateString("id-ID"),
        });
      }

      return updated.sort((a, b) => b.score - a.score).slice(0, 10);
    });
  }, [quizScore, practiceScore, currentUser]);

  // --- 7. SETUP MEDIAPIPE ---
  useEffect(() => {
    // Hanya jalankan AI kalau tab detektor aktif dan kamera aktif
    if (isModelLoading || !cameraActive || activeTab !== 'detector') return;
  
    const startAI = async () => {
      if (!window.Hands) return;
  
      // Cek apakah instance sudah ada, kalau belum baru buat
      if (!handsInstanceRef.current) {
        const hands = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
  
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
  
        hands.onResults(onResults);
        handsInstanceRef.current = hands;
      }
  
      if (videoRef.current && !cameraInstanceRef.current) {
        cameraInstanceRef.current = new window.Camera(videoRef.current, {
          onFrame: async () => {
            // VALIDASI KRUSIAL: Cek apakah handsInstanceRef masih ada sebelum .send()
            if (handsInstanceRef.current && cameraActive) {
              try {
                await handsInstanceRef.current.send({ image: videoRef.current });
              } catch (e) {
                console.warn("MediaPipe abaikan frame karena cleanup");
              }
            }
          },
          width: 640, height: 480
        });
        cameraInstanceRef.current.start();
      }
    };
  
    startAI();
  
    // Cleanup: Jangan hapus Hands, cukup stop kamera saja saat ganti tab
    return () => {
      if (cameraInstanceRef.current) {
        cameraInstanceRef.current.stop();
        cameraInstanceRef.current = null;
      }
    };
  }, [isModelLoading, cameraActive, activeTab, onResults]);
  
  // Cleanup total hanya saat user benar-benar keluar aplikasi (Unmount)
  useEffect(() => {
    return () => {
      if (handsInstanceRef.current) {
        handsInstanceRef.current.close();
        handsInstanceRef.current = null;
      }
    };
  }, []);

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      
{/* Header */}
<header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
  <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">

    {/* BRAND */}
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg">
        <Brain size={28} className="text-white" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          NeuroMath
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Tugas Besar Pengantar Kecerdasan Buatan
        </p>
      </div>
    </div>

    {/* NAV + LOGOUT */}
    <div className="flex items-center gap-4 w-full md:w-auto">

      {/* NAVIGATION */}
      <nav className="flex bg-slate-900 p-1 rounded-full border border-slate-700 overflow-x-auto max-w-full">
        {[
          { id: 'detector', label: 'Kuis AI', icon: Camera },
          { id: 'practice', label: 'Latihan Soal', icon: Edit3 },
          { id: 'module', label: 'Modul Belajar', icon: BookOpen },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* LOGOUT */}
      <Link
        to="/logout"
        className="flex items-center gap-2 px-4 py-2
                   rounded-full border border-red-500/30
                   text-red-400 hover:text-red-300
                   hover:bg-red-500/10
                   transition whitespace-nowrap"
      >
        <LogOut size={18} />
        Logout
      </Link>

    </div>
  </div>
</header>

      <main className="max-w-6xl mx-auto p-6 flex-grow w-full">
        
        {/* TAMPILAN 1: KUIS AI (CAMERA) */}
        {activeTab === 'detector' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Area Kamera */}
            <div className="lg:col-span-2 space-y-4">
              <div className={`relative rounded-2xl overflow-hidden bg-black border shadow-2xl aspect-video group transition-colors duration-300 ${
                  quizStatus === 'correct' ? 'border-green-500 shadow-green-500/50' : 
                  quizStatus === 'wrong' ? 'border-red-500 shadow-red-500/50' : 
                  'border-slate-700'
                }`}>
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-800/50 backdrop-blur-sm z-10">
                    <Camera size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Kamera Dinonaktifkan</p>
                    <button 
                      onClick={() => setCameraActive(true)}
                      className="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white font-bold transition-all"
                    >
                      Aktifkan Kamera
                    </button>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] ${cameraActive ? 'block' : 'hidden'}`}
                  playsInline
                  muted
                />
                
                {cameraActive && (
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none transform scale-x-[-1]"
                  />
                )}

                {/* Overlay Feedback Status */}
                {cameraActive && (
                  <>
                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                      <div className="bg-black/60 backdrop-blur px-4 py-2 rounded-xl border border-white/10 text-right">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Terdeteksi</span>
                        <div className="text-3xl font-bold text-white flex items-center gap-2">
                          {totalFingers} <span className="text-sm font-normal text-slate-400">Jari</span>
                        </div>
                      </div>
                    </div>

                    {/* Indikator Salah */}
                    {quizStatus === 'wrong' && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/80 backdrop-blur px-4 py-2 rounded-xl border border-white/10 animate-pulse transition-all">
                         <XCircle size={20} className="text-white"/>
                         <span className="text-white font-bold">Salah, Coba Lagi!</span>
                      </div>
                    )}
                  </>
                )}
                
                {/* Overlay Jawaban Benar */}
                {quizStatus === 'correct' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-500/30 backdrop-blur-sm transition-all z-20">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl text-center transform scale-110">
                      <CheckCircle size={64} className="text-green-500 mx-auto mb-2" />
                      <h2 className="text-3xl font-black text-slate-900">BENAR!</h2>
                      <p className="text-slate-600 font-medium">Jawaban hebat!</p>
                    </div>
                  </div>
                )}

                {/* Overlay Jawaban Salah (Full Tint) */}
                {quizStatus === 'wrong' && cameraActive && (
                   <div className="absolute inset-0 pointer-events-none bg-red-500/10 z-10 animate-pulse"></div>
                )}
              </div>

              {/* Panel Kontrol Bawah Kamera */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                   <div>
                     <span className="text-slate-400 text-xs uppercase mb-1">Skor Anda</span>
                     <div className="text-3xl font-bold text-cyan-400">{quizScore}</div>
                   </div>
                   <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
  <User size={16} className="text-cyan-400"/>
  <div className="text-xs">
    <span className="block text-slate-400 text-[10px] uppercase">Nama Anda</span>
    <span className="font-bold text-white">{currentUser}</span>
  </div>
</div>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                   <div>
                     <span className="text-slate-400 text-xs uppercase mb-1">Status Sistem</span>
                     <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                       <span className="text-sm font-medium text-white">{cameraActive ? 'Tracking Aktif' : 'Offline'}</span>
                     </div>
                   </div>
                   <button onClick={() => setCameraActive(!cameraActive)} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600">
                     <RefreshCw size={18} />
                   </button>
                </div>
              </div>
            </div>

            {/* Sidebar Soal AI */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
                
                <h2 className="text-slate-300 uppercase tracking-widest text-sm font-bold mb-6">Pertanyaan AI</h2>
                
                <div className="mb-8">
  <div className="text-7xl font-black text-white drop-shadow-lg mb-2">
    {quiz.num1} <span className="text-cyan-400">{quiz.operator || '+'}</span> {quiz.num2}
  </div>
  <div className="text-2xl text-slate-400 font-serif italic">= ?</div>
</div>

                
                <button 
                  onClick={generateNewQuestion}
                  className="mt-6 w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium text-sm transition-colors border border-slate-600"
                >
                  Lewati Soal
                </button>
              </div>

              {/* Detail Teknis */}
              <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                 <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                   <Calculator size={16} className="text-cyan-400"/> Analisis Vektor
                 </h3>
                 {handData ? (
                   <div className="space-y-3 font-mono text-xs">
                     <div className="flex justify-between border-b border-slate-700 pb-2">
                       <span className="text-slate-400">Euclidean Dist</span>
                       <span className="text-cyan-400">{handData.distance}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-700 pb-2">
                       <span className="text-slate-400">Vector Angle</span>
                       <span className="text-yellow-400">{handData.angle}°</span>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center text-slate-500 text-sm py-4">
                     Menunggu tangan...
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* TAMPILAN 2: LATIHAN SOAL (KETIK) */}
        {activeTab === 'practice' && (
          <div className="max-w-xl mx-auto animate-fade-in py-10">
            <div className="text-center mb-8">
               <h2 className="text-3xl font-bold text-white mb-2">Latihan Berhitung</h2>
               <p className="text-slate-400">Tanpa kamera, cukup ketik jawaban yang benar.</p>
            </div>

            <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden relative">
              <div className="p-10 text-center">
                 <div className="text-sm font-bold text-slate-500 uppercase mb-6">Hitunglah</div>
                 <div className="text-6xl font-black text-white mb-8 flex items-center justify-center gap-4">
                   <span>{practiceQ.num1}</span>
                   <span className="text-cyan-400">+</span>
                   <span>{practiceQ.num2}</span>
                   <span className="text-slate-500">=</span>
                   <span className="text-cyan-400">?</span>
                 </div>

                 <form onSubmit={handlePracticeSubmit} className="max-w-xs mx-auto">
                   <input 
                     type="number" 
                     value={practiceInput}
                     onChange={(e) => setPracticeInput(e.target.value)}
                     className={`w-full bg-slate-900 border-2 rounded-xl text-center text-2xl font-bold py-4 mb-4 focus:outline-none transition-colors ${
                       practiceStatus === 'wrong' ? 'border-red-500 text-red-500' : 
                       practiceStatus === 'correct' ? 'border-green-500 text-green-500' : 'border-slate-600 text-white focus:border-cyan-500'
                     }`}
                     placeholder="..."
                     autoFocus
                   />
                   <button 
                     type="submit"
                     className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 rounded-xl text-white font-bold shadow-lg shadow-cyan-500/25 transition-all"
                   >
                     Jawab
                   </button>
                 </form>

                 {/* Feedback Message */}
                 <div className="mt-6 h-8">
                   {practiceStatus === 'correct' && (
                     <div className="flex items-center justify-center gap-2 text-green-400 font-bold animate-bounce">
                       <CheckCircle size={20}/> Jawaban Benar! (+10 Poin)
                     </div>
                   )}
                   {practiceStatus === 'wrong' && (
                     <div className="flex items-center justify-center gap-2 text-red-400 font-bold animate-shake">
                       <XCircle size={20}/> Salah, coba hitung lagi ya.
                     </div>
                   )}
                 </div>
              </div>
              
              <div className="bg-slate-700/50 p-4 flex justify-between items-center text-sm font-bold">
                 <div className="text-slate-400">Skor Latihan</div>
                 
                 {/* UPDATE: KONSISTENSI TOMBOL SIMPAN SAMA SEPERTI KUIS AI */}
                 <div className="flex items-center gap-3">
                    <div className="text-cyan-400 text-xl">{practiceScore}</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
  <User size={16} className="text-cyan-400"/>
  <div className="text-xs">
    <span className="block text-slate-400 text-[10px] uppercase">Nama Anda</span>
    <span className="font-bold text-white">{currentUser}</span>
  </div>
</div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* TAMPILAN 3: MODUL BELAJAR DETAIL */}
        {activeTab === 'module' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Modul Belajar Matematika Dasar</h2>
              <p className="text-slate-400">Panduan lengkap memahami angka dan penjumlahan.</p>
            </div>
            
            {/* Bagian 1: Konsep Angka */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Star size={20}/> Bab 1: Mengenal Angka
              </h3>
              
              <div className="space-y-6">
                <ModuleCard title="Apa itu Angka?" icon={BookOpen} color="yellow">
                  <p>Angka adalah simbol yang kita gunakan untuk menghitung jumlah benda. Dalam aplikasi ini, kita menggunakan jari tangan sebagai alat bantu hitung yang paling dasar.</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-center">
                        <div className="text-2xl mb-1">{'☝️'.repeat(Math.ceil(n/5))}</div>
                        <div className="text-lg font-bold text-white">{n}</div>
                        <div className="text-xs text-slate-500">{n} Jari</div>
                      </div>
                    ))}
                  </div>
                </ModuleCard>
              </div>
            </div>

            {/* Bagian 2: Penjumlahan */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Calculator size={20}/> Bab 2: Penjumlahan (Tambah-Tambahan)
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h4 className="font-bold text-white mb-4">Langkah-langkah Penjumlahan</h4>
                    <ol className="space-y-4 text-sm text-slate-300">
                      <li className="flex gap-3">
                        <span className="bg-green-500/20 text-green-400 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs">1</span>
                        <div>
                          <strong className="text-white block">Lihat Angka Pertama</strong>
                          Misalnya soal <code className="bg-slate-900 px-1 rounded">3 + 2</code>. Angka pertama adalah 3. Siapkan 3 jari.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-green-500/20 text-green-400 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs">2</span>
                        <div>
                          <strong className="text-white block">Lihat Angka Kedua</strong>
                          Angka kedua adalah 2. Tambahkan 2 jari lagi.
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-green-500/20 text-green-400 w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs">3</span>
                        <div>
                          <strong className="text-white block">Hitung Semuanya</strong>
                          Hitung total jari yang terbuka. 1, 2, 3... 4, 5. Jadi jawabannya adalah 5!
                        </div>
                      </li>
                    </ol>
                 </div>

                 <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center">
                    <h4 className="font-bold text-white mb-4 text-center">Contoh Visual</h4>
                    <div className="flex items-center justify-center gap-4 text-3xl font-bold text-white bg-slate-900 p-6 rounded-xl border border-slate-600 border-dashed">
                       <div className="text-center">
                         <span className="text-4xl">🍎</span>
                         <div className="text-sm text-slate-400 mt-2">1</div>
                       </div>
                       <span className="text-green-400">+</span>
                       <div className="text-center">
                         <span className="text-4xl">🍎🍎</span>
                         <div className="text-sm text-slate-400 mt-2">2</div>
                       </div>
                       <span className="text-slate-500">=</span>
                       <div className="text-center">
                         <span className="text-4xl">🍎🍎🍎</span>
                         <div className="text-sm text-green-400 mt-2">3</div>
                       </div>
                    </div>
                    <div className="mt-4 text-center text-sm text-slate-400">
                      "Satu apel ditambah dua apel menjadi tiga apel."
                    </div>
                 </div>
              </div>
            </div>

            {/* Bagian 3: Teknologi AI */}
            <div>
              <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2 border-b border-slate-700 pb-2">
                <Brain size={20}/> Bab 3: Teknologi di Balik Layar
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ModuleCard title="Computer Vision" icon={Camera} color="purple">
                  <p>
                    Aplikasi ini menggunakan teknologi <strong>Computer Vision</strong> untuk "melihat" tangan Anda.
                  </p>
                  <ul className="list-disc list-inside space-y-2 mt-2 text-sm ml-2">
                    <li><strong>Deteksi Landmark:</strong> Mengidentifikasi 21 titik kunci pada tangan.</li>
                    <li><strong>Geometri:</strong> Menggunakan koordinat X dan Y untuk menentukan posisi jari.</li>
                  </ul>
                </ModuleCard>

                <ModuleCard title="Logika Perhitungan Jari" icon={List} color="blue">
                  <p>
                    Bagaimana AI tahu berapa jari yang Anda angkat? Kami menggunakan logika geometri sederhana:
                  </p>
                  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 my-3 font-mono text-xs space-y-2">
                    <p className="text-green-400">// Pseudo-code</p>
                    <p>IF (UjungJari.Y &lt; RuasJari.Y) <br/>&nbsp;&nbsp;Status = TERBUKA</p>
                    <p>ELSE <br/>&nbsp;&nbsp;Status = TERTUTUP</p>
                  </div>
                </ModuleCard>
              </div>
            </div>
          </div>
        )}

        {/* TAMPILAN 4: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-yellow-500/20 rounded-full mb-4">
                <Trophy size={48} className="text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">Papan Peringkat</h2>
              <p className="text-slate-400">Siswa terbaik dengan kemampuan matematika tercepat.</p>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
              <div className="grid grid-cols-12 bg-slate-700/50 p-4 text-sm font-bold text-slate-300 uppercase tracking-wider">
                <div className="col-span-2 text-center">#</div>
                <div className="col-span-6">Nama Pemain</div>
                <div className="col-span-4 text-right">Skor Total</div>
              </div>
              <div className="divide-y divide-slate-700">
                {leaderboard.map((entry, index) => (
                  <div key={index} className="grid grid-cols-12 p-4 items-center hover:bg-slate-700/30 transition-colors">
                    <div className="col-span-2 text-center font-bold text-slate-500">
                      {index === 0 ? <span className="text-yellow-400 text-xl">🥇</span> : 
                       index === 1 ? <span className="text-slate-300 text-xl">🥈</span> : 
                       index === 2 ? <span className="text-amber-600 text-xl">🥉</span> : 
                       index + 1}
                    </div>
                    <div className="col-span-6 font-medium text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
                        <User size={14}/>
                      </div>
                      <div>
                        {entry.name}
                        <div className="text-[10px] text-slate-500 font-normal">{entry.date}</div>
                      </div>
                    </div>
                    <div className="col-span-4 text-right font-mono text-cyan-400 font-bold text-lg">
                      {entry.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center">
               <button 
                 onClick={() => setActiveTab('detector')}
                 className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white font-bold transition-all"
               >
                 Main Lagi & Kejar Skor!
               </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-800/80 backdrop-blur border-t border-slate-700 py-6 text-center mt-auto">
        <p className="text-slate-400 text-sm flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
          <span>&copy; {new Date().getFullYear()} NeuroMath.</span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="flex items-center gap-1">
            by <span className="text-cyan-400 font-bold">Arsyandi Nadhif Aljune</span>
          </span>
        </p>
      </footer>
    </div>
  );
};

export default App;