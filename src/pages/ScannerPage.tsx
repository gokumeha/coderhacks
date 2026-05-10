import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Upload, Camera, Zap, Fish, Shield, MapPin, Volume2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore, useScanStore, useLangStore } from '@/store';
import { aiService } from '@/services/ai/aiService';
import { speechService } from '@/services/speech/speechService';
import { smsService } from '@/services/sms/smsService';
import { HARBORS } from '@/data';
import type { FishScan } from '@/types';

type Stage = 'idle' | 'qr' | 'scanning' | 'analyzing' | 'complete';

const STAGE_LABELS: Record<Stage, string> = {
  idle: 'Ready to Scan',
  qr: 'QR/RFID Detected — Welcome!',
  scanning: 'Fish Scanning in Progress...',
  analyzing: 'AI Analysis Running...',
  complete: 'Analysis Complete!',
};

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-emerald-400', A: 'text-cyan-400', B: 'text-amber-400', C: 'text-rose-400',
};

const FRESHNESS_COLOR: Record<string, string> = {
  excellent: 'text-emerald-400', good: 'text-cyan-400', average: 'text-amber-400', poor: 'text-rose-400',
};

export const ScannerPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addScan } = useScanStore();
  const { language } = useLangStore();
  const [stage, setStage] = useState<Stage>('idle');
  const [result, setResult] = useState<FishScan | null>(null);
  const [recommendation, setRecommendation] = useState<Awaited<ReturnType<typeof aiService.generateRecommendation>> | null>(null);
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [showDroidCamInput, setShowDroidCamInput] = useState(false);
  const [droidCamIp, setDroidCamIp] = useState('192.168.1.100:4747');
  const [isDroidCamActive, setIsDroidCamActive] = useState(false);
  
  // Live Inference States
  const [livePrediction, setLivePrediction] = useState<string | null>(null);
  const [liveConfidence, setLiveConfidence] = useState<number>(0);
  const [liveFps, setLiveFps] = useState<number>(0);
  const [liveInferenceTime, setLiveInferenceTime] = useState<number>(0);
  
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsVideoActive(true);
      // Must wait for state to update and video element to render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera. Please check permissions or DroidCam status.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsVideoActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImgPreview(dataUrl);
      stopCamera();
      runFullScan(dataUrl);
    }
  };

  // Moving useEffect below runFullScan to fix TDZ (ReferenceError)
  const runFullScan = useCallback(async (imageData?: string) => {
    const name = user?.displayName ?? 'Fisherman';

    // Stage: QR
    setStage('qr');
    speechService.speak(speechService.getTemplateText('WELCOME_MESSAGE', language, name), language);
    await new Promise(r => setTimeout(r, 2000));

    // Stage: Scanning
    setStage('scanning');
    speechService.speak(speechService.getTemplateText('SCAN_IN_PROGRESS', language), language);
    
    await new Promise(r => setTimeout(r, 2500));

    // Stage: Analyzing
    setStage('analyzing');
    const detection = await aiService.detectFish(imageData);
    const rec = await aiService.generateRecommendation(detection.species, detection.grade, user?.uid ?? 'u1');
    setRecommendation(rec);

    const scan: FishScan = {
      id: `scan_${Date.now()}`,
      userId: user?.uid ?? 'u1',
      ...detection,
      timestamp: new Date(),
      recommendation: rec,
    };
    setResult(scan);
    addScan(scan);

    // Stage: Complete
    setStage('complete');
    await new Promise(r => setTimeout(r, 500));
    
    // Announce analysis complete
    await speechService.speak(speechService.getTemplateText('ANALYSIS_COMPLETE', language), language);
    
    // Announce recommendation
    const recText = speechService.getRecommendationText(rec.species, rec.harbor.name, rec.expectedPrice, rec.demand, rec.riskLevel, language);
    await speechService.speak(recText, language);

    // Announce Thank you
    speechService.speak(speechService.getTemplateText('THANK_YOU_MESSAGE', language), language);

    // Trigger SMS
    smsService.send(user?.phone ?? '+91 9876543210', rec.species, rec.harbor.name, rec.expectedPrice, rec.demand, language);
  }, [user, language]);

  // --- Live Inference Engine ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isProcessing = false;
    let frameCount = 0;
    let lastFpsTime = Date.now();

    if ((isVideoActive || isDroidCamActive) && stage === 'idle') {
      aiService.resetBuffer(); // Start fresh temporal smoothing
      interval = setInterval(async () => {
        if (isProcessing) return; // Skip if previous inference is still running
        
        try {
          isProcessing = true;
          let dataUrl: string | undefined;

          if (isVideoActive && videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth || 224;
            canvas.height = videoRef.current.videoHeight || 224;
            const ctx = canvas.getContext('2d');
            if (ctx && canvas.width > 0) {
              ctx.drawImage(videoRef.current, 0, 0);
              dataUrl = canvas.toDataURL('image/jpeg', 0.5); // compress
            }
          } else if (isDroidCamActive) {
            const img = document.getElementById('droidcam-stream') as HTMLImageElement;
            if (img && img.complete) {
               const canvas = document.createElement('canvas');
               canvas.width = img.width || 224;
               canvas.height = img.height || 224;
               const ctx = canvas.getContext('2d');
               if (ctx && canvas.width > 0) {
                 ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                 dataUrl = canvas.toDataURL('image/jpeg', 0.5);
               }
            }
          }

          if (dataUrl) {
            const start = Date.now();
            const res = await aiService.detectFish(dataUrl);
            const execTime = Date.now() - start;
            
            setLivePrediction(res.species);
            setLiveConfidence(res.confidence);
            setLiveInferenceTime(execTime);
            
            frameCount++;
            const now = Date.now();
            if (now - lastFpsTime >= 1000) {
              setLiveFps(frameCount);
              frameCount = 0;
              lastFpsTime = now;
            }

            // Fallback: If camera stable and confidence > 90, auto capture!
            if (res.confidence > 90 && res.species !== 'Unknown' && !res.requiresConfirmation) {
               if (isVideoActive) stopCamera();
               if (isDroidCamActive) setIsDroidCamActive(false);
               setImgPreview(dataUrl);
               runFullScan(dataUrl);
            }
          }
        } catch (e) {
          console.error("Live inference skipped frame", e);
        } finally {
          isProcessing = false;
        }
      }, 600); // Inference every 600ms (throttle)
    }

    return () => {
      if (interval) clearInterval(interval);
      setLivePrediction(null);
      setLiveConfidence(0);
    };
  }, [isVideoActive, isDroidCamActive, stage, runFullScan]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setImgPreview(reader.result as string); runFullScan(reader.result as string); };
    reader.readAsDataURL(file);
  };

  const handleOverride = async (newSpecies: string) => {
    if (!result || !user) return;
    setResult({ ...result, species: newSpecies, confidence: 100 });
    const newRec = await aiService.generateRecommendation(newSpecies, result.grade, user.uid);
    setRecommendation(newRec);
  };

  const reset = () => { 
    setStage('idle'); 
    setResult(null); 
    setRecommendation(null); 
    setImgPreview(null); 
    stopCamera(); 
    setIsDroidCamActive(false);
    setShowDroidCamInput(false);
    speechService.stop();
  };

  const progressPct = { idle: 0, qr: 20, scanning: 50, analyzing: 80, complete: 100 }[stage];

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/25 text-cyan-400 text-xs uppercase tracking-widest mb-4">
            <Zap size={12} /> AI Conveyor Belt Scanner
          </span>
          <h1 className="text-4xl font-black text-white mb-2">Fish<span className="gradient-text"> Intelligence</span></h1>
          <p className="text-slate-400">Scan your catch. AI detects species, freshness & recommends the best harbor.</p>
        </motion.div>

        {/* Conveyor Belt Animation */}
        <div className="relative h-24 rounded-2xl overflow-hidden mb-6 border border-cyan-500/20">
          <div className="absolute inset-0 conveyor-track opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center gap-8">
            {['🐟','🦐','🐡','🦈','🐠'].map((e, i) => (
              <motion.span key={i} className="text-3xl"
                animate={{ x: stage !== 'idle' && stage !== 'complete' ? [0, -400] : 0, opacity: stage !== 'idle' ? 1 : 0.3 }}
                transition={{ duration: 3, delay: i * 0.4, repeat: stage === 'scanning' || stage === 'analyzing' ? Infinity : 0, ease: 'linear' }}>
                {e}
              </motion.span>
            ))}
          </div>
          {/* Scan beam */}
          {(stage === 'scanning' || stage === 'analyzing') && (
            <div className="absolute inset-y-0 w-1 bg-cyan-400 shadow-[0_0_20px_#00e5ff] animate-shimmer" style={{ left: '45%' }} />
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Scanner panel */}
          <div className="space-y-4">
            {/* Stage indicator */}
            <div className="glass rounded-2xl border border-cyan-500/15 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-white font-semibold">{STAGE_LABELS[stage]}</span>
                <span className={`text-xs font-mono ${stage === 'complete' ? 'text-emerald-400' : 'text-cyan-400'}`}>{progressPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {(['qr','scanning','analyzing','complete'] as Stage[]).map(s => (
                  <span key={s} className={`text-xs px-2 py-1 rounded-lg ${
                    stage === s ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : progressPct > { qr:20,scanning:50,analyzing:80,complete:100 }[s]!
                      ? 'text-emerald-400' : 'text-slate-600'
                  }`}>
                    {s === 'qr' ? 'QR Scan' : s.charAt(0).toUpperCase()+s.slice(1)}
                  </span>
                ))}
              </div>
            </div>

            {/* Image preview */}
            {imgPreview && (
              <div className="glass rounded-2xl border border-cyan-500/15 overflow-hidden">
                <img src={imgPreview} alt="Fish scan" className="w-full h-48 object-cover" />
                {stage === 'scanning' && <div className="scan-line absolute inset-0" />}
              </div>
            )}

            {/* Action buttons */}
            {stage === 'idle' && !isVideoActive && !isDroidCamActive && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onClick={() => runFullScan()}
                  className="flex flex-col items-center justify-center gap-2 p-4 glass rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all group">
                  <ScanLine size={24} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-white font-medium text-center">QR Scan</span>
                </button>
                <button onClick={() => startCamera()}
                  className="flex flex-col items-center justify-center gap-2 p-4 glass rounded-2xl border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/5 transition-all group glow-cyan-sm">
                  <Camera size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-white font-medium text-center">Laptop WebCam</span>
                </button>
                <button onClick={() => setShowDroidCamInput(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 glass rounded-2xl border border-blue-500/20 hover:border-blue-400/50 hover:bg-blue-500/5 transition-all group">
                  <Camera size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-white font-medium text-center">DroidCam IP</span>
                </button>
                <button onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-4 glass rounded-2xl border border-purple-500/20 hover:border-purple-400/50 hover:bg-purple-500/5 transition-all group">
                  <Upload size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-white font-medium text-center">Upload Image</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
            )}

            {/* DroidCam Input Field */}
            {showDroidCamInput && !isDroidCamActive && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass rounded-2xl border border-blue-500/30 p-5 mt-4">
                <p className="text-sm text-slate-300 mb-3">Enter the <strong className="text-white">"Browser IP Cam"</strong> address shown on your DroidCam phone app:</p>
                <div className="flex gap-2">
                  <input value={droidCamIp} onChange={e => setDroidCamIp(e.target.value)} type="text" placeholder="192.168.1.100:4747"
                    className="flex-1 bg-navy-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-blue-500/50 transition-colors" />
                  <button onClick={() => setIsDroidCamActive(true)} className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors">
                    Connect
                  </button>
                </div>
              </motion.div>
            )}

            {/* DroidCam Live Stream UI */}
            {isDroidCamActive && (
              <div className="glass rounded-2xl border border-blue-500/30 overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.2)] mt-4">
                <div className="bg-navy-900 absolute inset-0 flex items-center justify-center -z-10">
                  <span className="text-slate-500 animate-pulse">Connecting to phone...</span>
                </div>
                <img 
                  id="droidcam-stream" 
                  src={`http://${droidCamIp.replace('http://', '')}/video?t=${Date.now()}`} 
                  alt="DroidCam Stream" 
                  className="w-full h-64 object-cover" 
                  onError={() => {
                    alert('DroidCam connection failed. Falling back to Laptop WebCam.');
                    setIsDroidCamActive(false);
                    setShowDroidCamInput(false);
                    startCamera();
                  }}
                />
                
                {/* Live AI Overlay */}
                {livePrediction && (
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col">
                      <span className="text-xs text-slate-300">Live AI Detection</span>
                      <span className={`text-xl font-black tracking-wide ${livePrediction !== 'Unknown' ? 'text-cyan-400' : 'text-rose-400'}`}>
                        {livePrediction !== 'Unknown' ? `🐟 ${livePrediction}` : 'Scanning...'}
                      </span>
                      {livePrediction !== 'Unknown' && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-cyan-400" style={{ width: `${liveConfidence}%` }} />
                          </div>
                          <span className="text-[10px] text-cyan-400">{liveConfidence}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Dev Mode Debug Panel */}
                {import.meta.env.DEV && livePrediction && (
                  <div className="absolute top-4 right-4 bg-black/80 border border-purple-500/50 rounded-lg p-2 text-[10px] font-mono text-purple-300 pointer-events-none">
                     <p className="font-bold text-white mb-1 border-b border-purple-500/30 pb-1">DEV DEBUG</p>
                     <p>FPS: {liveFps || '~'}</p>
                     <p>Infer: {liveInferenceTime}ms</p>
                     <p>Src: DroidCam</p>
                     <p>Conf: {liveConfidence}%</p>
                  </div>
                )}

                <div className="absolute inset-0 border-4 border-blue-500/30 m-4 rounded-xl border-dashed opacity-50 pointer-events-none" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button onClick={() => {
                    const cleanIp = droidCamIp.replace('http://', '');
                    const rawUrl = `http://${cleanIp}/shot.jpg?t=${Date.now()}`;
                    // Proxy the image through our Vite backend to bypass CORS and fix the broken image
                    const proxyUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
                    
                    setImgPreview(proxyUrl);
                    setIsDroidCamActive(false);
                    runFullScan(proxyUrl);
                  }} className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2">
                    <Camera size={18} /> Capture Fish
                  </button>
                  <button onClick={() => { setIsDroidCamActive(false); setShowDroidCamInput(false); }} className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-sm border border-white/10 text-white font-bold rounded-full shadow-lg transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isVideoActive && (
              <div className="glass rounded-2xl border border-emerald-500/30 overflow-hidden relative shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                
                {/* Live AI Overlay */}
                {livePrediction && (
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col">
                      <span className="text-xs text-slate-300">Live AI Detection</span>
                      <span className={`text-xl font-black tracking-wide ${livePrediction !== 'Unknown' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {livePrediction !== 'Unknown' ? `🐟 ${livePrediction}` : 'Scanning...'}
                      </span>
                      {livePrediction !== 'Unknown' && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden w-24">
                            <div className="h-full bg-emerald-400" style={{ width: `${liveConfidence}%` }} />
                          </div>
                          <span className="text-[10px] text-emerald-400">{liveConfidence}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Dev Mode Debug Panel */}
                {import.meta.env.DEV && livePrediction && (
                  <div className="absolute top-4 right-4 bg-black/80 border border-purple-500/50 rounded-lg p-2 text-[10px] font-mono text-purple-300 pointer-events-none">
                     <p className="font-bold text-white mb-1 border-b border-purple-500/30 pb-1">DEV DEBUG</p>
                     <p>FPS: {liveFps || '~'}</p>
                     <p>Infer: {liveInferenceTime}ms</p>
                     <p>Src: WebCam</p>
                     <p>Conf: {liveConfidence}%</p>
                  </div>
                )}

                <div className="absolute inset-0 border-4 border-emerald-500/30 m-4 rounded-xl border-dashed opacity-50" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <button onClick={capturePhoto} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2">
                    <Camera size={18} /> Capture Fish
                  </button>
                  <button onClick={stopCamera} className="px-6 py-2.5 bg-slate-800/80 hover:bg-slate-700 backdrop-blur-sm border border-white/10 text-white font-bold rounded-full shadow-lg transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {stage === 'complete' && (
              <button onClick={reset} className="w-full py-3 rounded-xl glass border border-cyan-500/25 text-cyan-300 text-sm hover:bg-cyan-500/10 transition-all">
                🔄 Scan Another Fish
              </button>
            )}
          </div>

          {/* Results panel */}
          <AnimatePresence mode="wait">
            {result && stage === 'complete' ? (
              <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                
                {result.error ? (
                  <div className={`glass-strong rounded-2xl border ${result.requiresConfirmation ? 'border-amber-500/30 glow-amber' : 'border-rose-500/30 glow-rose'} p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-full ${result.requiresConfirmation ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        <AlertTriangle size={24} />
                      </div>
                      <span className={`text-lg font-bold tracking-wide ${result.requiresConfirmation ? 'text-amber-400' : 'text-rose-400'}`}>
                        {result.requiresConfirmation ? 'AI Needs Confirmation' : 'Analysis Failed'}
                      </span>
                    </div>
                    <p className="text-white text-xl font-medium mb-3">{result.error}</p>
                    
                    {result.requiresConfirmation && result.topPredictions ? (
                      <div className="mt-5 space-y-3">
                        <p className="text-sm text-slate-300">Is this one of the following?</p>
                        <div className="grid gap-2">
                          {result.topPredictions.map(p => (
                            <button key={p} onClick={() => handleOverride(p)} className="px-4 py-3 bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/50 rounded-xl text-left text-white font-medium transition-all flex justify-between items-center group">
                              <span>🐟 {p}</span>
                              <span className="text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">Confirm →</span>
                            </button>
                          ))}
                          <button onClick={reset} className="px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 font-medium transition-all text-center mt-2">
                            None of these (Rescan)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm bg-navy-900/50 p-4 rounded-xl border border-white/5">
                        The AI model did not recognize this as a valid fish. Please ensure the camera is clearly pointing at marine life and try again.
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Detection Result */}
                    <div className="glass-strong rounded-2xl border border-emerald-500/25 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle size={16} className="text-emerald-400" />
                        <span className="text-emerald-400 text-sm font-semibold">Detection Complete</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Likely Species',    value: `🐟 ${result.species}`,                      cls: 'text-white' },
                          { label: 'Grade',      value: result.grade,                               cls: GRADE_COLOR[result.grade] },
                          { label: 'Freshness',  value: result.freshness,                           cls: FRESHNESS_COLOR[result.freshness] },
                          { label: 'Est. Weight',     value: `~${result.estimatedWeight} kg`,            cls: 'text-cyan-400' },
                          { label: 'AI Confidence', value: `${result.confidence}%`,                   cls: 'text-purple-400' },
                        ].map(item => (
                          <div key={item.label} className="glass rounded-xl p-3">
                            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                            <p className={`font-bold capitalize ${item.cls}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    {recommendation && (
                      <div className="glass-strong rounded-2xl border border-cyan-500/25 p-5 glow-cyan">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap size={16} className="text-cyan-400" />
                          <span className="text-cyan-400 text-sm font-semibold">AI Selling Decision</span>
                        </div>
                        <p className="text-2xl font-black text-white mb-1">Sell at</p>
                        <div className="flex items-center gap-2 text-cyan-400 mb-4">
                          <MapPin size={14} />
                          <span className="font-bold">{recommendation.harbor.name}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="glass rounded-xl p-2 text-center">
                            <p className="text-xs text-slate-400">Price</p>
                            <p className="text-emerald-400 font-bold">₹{recommendation.expectedPrice}/kg</p>
                          </div>
                          <div className="glass rounded-xl p-2 text-center">
                            <p className="text-xs text-slate-400">Demand</p>
                            <p className={`font-bold ${recommendation.demand === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>{recommendation.demand}</p>
                          </div>
                          <div className="glass rounded-xl p-2 text-center">
                            <p className="text-xs text-slate-400">Risk</p>
                            <p className={`font-bold ${recommendation.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{recommendation.riskLevel}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 flex justify-center items-center gap-1 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                            <Shield size={16} /> {recommendation.confidence}% AI Confidence
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <Fish size={48} className="text-cyan-500/30 mb-4" />
                <p className="text-slate-400">Scan a fish to see AI detection results</p>
                <p className="text-slate-600 text-sm mt-2">Species · Freshness · Grade · Recommendation</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Harbor Quick View */}
        <div className="mt-6 glass rounded-2xl border border-cyan-500/10 p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><MapPin size={16} className="text-cyan-400" /> Nearby Harbors</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {HARBORS.map(h => (
              <div key={h.id} className={`glass rounded-xl p-3 border ${h.isRecommended ? 'border-emerald-500/30' : 'border-white/5'}`}>
                {h.isRecommended && <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">✓ Recommended</span>}
                <p className="text-white text-sm font-medium mt-1">{h.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs ${h.congestion === 'LOW' ? 'text-emerald-400' : h.congestion === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'}`}>
                    ● {h.congestion}
                  </span>
                  <span className="text-xs text-slate-500">{h.activeVendors} vendors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
