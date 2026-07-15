import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquareCode, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Trophy, 
  Check, 
  ArrowRight, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX 
} from "lucide-react";
import { api } from "../api";
import { UserProfile } from "../types";

interface MockInterviewProps {
  user: UserProfile;
}

export default function MockInterview({ user }: MockInterviewProps) {
  const [session, setSession] = useState<any | null>(null);
  const [interviewType, setInterviewType] = useState<"HR" | "Technical" | "Company Specific" | "Group Discussion">("Technical");
  const [companyName, setCompanyName] = useState("TCS");
  const [starting, setStarting] = useState(false);

  // Chat message box
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  // Completed metrics
  const [feedback, setFeedback] = useState<any | null>(null);

  // Voice integration states
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => setIsRecording(true);
        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessageText((prev) => (prev ? prev + " " + transcript : transcript));
        };
        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);

        recognitionRef.current = rec;
      }
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    const cleanText = text.replace(/[\#\*\_`\-\>\[\]\(\)]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    if (!session || isMuted || !synthRef.current) return;
    const messages = session.messages;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "interviewer") {
      speakText(lastMsg.text);
    }
  }, [session, isMuted]);

  const toggleMute = () => {
    if (isSpeaking && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Safari or Edge.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      if (synthRef.current && isSpeaking) {
        synthRef.current.cancel();
        setIsSpeaking(false);
      }
      recognitionRef.current.start();
    }
  };

  const handleStartInterview = async () => {
    setStarting(true);
    setFeedback(null);
    try {
      const response = await api.startInterview(user.id, interviewType, companyName);
      setSession(response.session);
    } catch (err) {
      alert("Error starting mock interview: " + err);
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText || !session) return;
    setSending(true);
    const txt = messageText;
    setMessageText("");

    // optimistic update locally
    setSession({
      ...session,
      messages: [
        ...session.messages,
        { role: "student", text: txt, timestamp: new Date().toISOString() }
      ]
    });

    try {
      const response = await api.sendInterviewMessage(session.id, txt);
      setSession(response.session);
      if (response.done) {
        setFeedback(response.feedback);
      }
    } catch (err) {
      alert("Error communicating with AI interviewer: " + err);
    } finally {
      setSending(false);
    }
  };

  if (session) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Top Header bar info */}
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <MessageSquareCode className="h-5 w-5 text-indigo-400" />
            <span className="font-mono text-xs text-slate-300 font-bold uppercase">
              {session.type} Round {session.companyName ? `• ${session.companyName}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleMute}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                isMuted 
                  ? "bg-slate-950 border-slate-800 text-slate-500" 
                  : "bg-indigo-950/20 border-indigo-500/35 text-indigo-400 hover:bg-indigo-900/10"
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" /> Muted
                </>
              ) : (
                <>
                  <Volume2 className={`h-3.5 w-3.5 ${isSpeaking ? "animate-bounce" : ""}`} /> Voice On
                </>
              )}
            </button>

            <button
              onClick={() => { setSession(null); setFeedback(null); }}
              className="text-xs font-mono text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              Exit Workspace
            </button>
          </div>
        </div>

        {/* Feedback display after completion */}
        {feedback ? (
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl space-y-8 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 bg-indigo-600/10 rounded-full flex items-center justify-center text-indigo-400 mx-auto">
                <Trophy className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white font-sans">Interview Evaluation Published!</h3>
                <p className="text-xs text-slate-400">Our AI Interview Coach evaluated your face-to-face performance report.</p>
              </div>
            </div>

            {/* Score Grid indicators */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Overall Rating</span>
                <span className="text-2xl font-bold font-mono text-indigo-400">{feedback.overallScore || 0}%</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Presentation</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">{feedback.presentation || 0}%</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Communication</span>
                <span className="text-2xl font-bold font-mono text-purple-400">{feedback.communication || 0}%</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Fluency</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{feedback.fluency || 0}%</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Pronunciation</span>
                <span className="text-2xl font-bold font-mono text-amber-500">{feedback.pronunciation || 0}%</span>
              </div>
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 text-center">
                <span className="block text-[10px] text-slate-500 font-mono uppercase">Content Relevance</span>
                <span className="text-2xl font-bold font-mono text-rose-400">{feedback.contentRelevance || 0}%</span>
              </div>
            </div>

            {/* Strengths & improvements checklists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">Key Strengths</span>
                <ul className="space-y-2 text-xs">
                  {feedback.strengths?.map((str: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-850 space-y-3">
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider block">Areas to Bolster</span>
                <ul className="space-y-2 text-xs">
                  {feedback.improvements?.map((imp: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <span className="text-rose-400 font-bold">⚠</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Behavioral analysis markup */}
            {feedback.behaviorMarkup && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block mb-1">User Behavioral Analysis & Cues</span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{feedback.behaviorMarkup}</p>
              </div>
            )}

            {/* Activity Monitor Log */}
            {feedback.activityLog && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block mb-1">Interaction & Engagement Activities Monitor</span>
                <p className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">{feedback.activityLog}</p>
              </div>
            )}

            <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl">
              <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block mb-1">Synthesized Recruiter Feedback</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{feedback.summary}</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => { setSession(null); setFeedback(null); }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Start New Interview Round
              </button>
            </div>
          </div>
        ) : (
          /* Live chatbot conversation with real-time video simulation */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Feed Workspace */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* VIDEO FEED PANELS CONTAINER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* AI RECRUITER REAL-TIME FEED */}
                <div className={`relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border transition-all ${
                  isSpeaking ? "border-emerald-500 shadow-md shadow-emerald-500/10" : "border-slate-800"
                }`}>
                  <img 
                    src="/ai_interviewer_avatar.png" 
                    alt="AI Interviewer" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${isSpeaking ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                      AI Recruiter (Interviewer)
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                      {isSpeaking ? "Speaking" : "Listening"}
                    </span>
                  </div>
                  {isSpeaking && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/30 px-2 py-1 rounded-md">
                      <span className="h-1.5 w-1 bg-emerald-400 animate-pulse animate-duration-500" />
                      <span className="h-2.5 w-1 bg-emerald-400 animate-pulse animate-duration-300" style={{ animationDelay: '0.15s' }} />
                      <span className="h-2 w-1 bg-emerald-400 animate-pulse animate-duration-700" style={{ animationDelay: '0.3s' }} />
                    </div>
                  )}
                </div>

                {/* STUDENT CAMERA FEED */}
                <div className={`relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border transition-all ${
                  isRecording ? "border-rose-500 shadow-md shadow-rose-500/10" : "border-slate-800"
                }`}>
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-905/65">
                    <div className="w-14 h-14 rounded-full border border-slate-800 bg-slate-950 text-slate-400 flex items-center justify-center text-lg font-black font-mono">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${isRecording ? "bg-rose-500 animate-ping" : "bg-slate-400"}`} />
                      {user.name} (Candidate)
                    </span>
                    <span className="text-[8px] font-mono uppercase bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                      {isRecording ? "Transcribing Voice" : "Idle"}
                    </span>
                  </div>
                  {isRecording && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-[8px] font-bold uppercase tracking-widest text-white px-2 py-0.5 rounded animate-pulse">
                      REC
                    </span>
                  )}
                </div>

              </div>

              {/* Chatbox section */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[320px]">
                {/* Message scroll container */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                  {session.messages.map((msg: any, idx: number) => {
                    const isInterviewer = msg.role === "interviewer";
                    return (
                      <div key={idx} className={`flex gap-3 ${isInterviewer ? "justify-start" : "justify-end"}`}>
                        {isInterviewer && (
                          <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs shrink-0">
                            AI
                          </div>
                        )}
                        
                        <div className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                          isInterviewer 
                            ? "bg-slate-950 text-slate-200 border border-slate-850 rounded-tl-none" 
                            : "bg-indigo-600 text-white rounded-tr-none"
                        }`}>
                          <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                          <span className="block mt-1 text-[9px] font-mono text-slate-400 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {sending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs shrink-0">
                        AI
                      </div>
                      <div className="p-3 bg-slate-950 text-slate-400 border border-slate-850 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 font-mono">
                        <RefreshCw className="h-3 w-3 animate-spin" /> Interviewer is listening...
                      </div>
                    </div>
                  )}
                </div>

                {/* Message input footer */}
                <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                  <button
                    type="button"
                    onClick={handleToggleRecord}
                    className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                      isRecording 
                        ? "bg-rose-950/30 border-rose-500 text-rose-400 animate-pulse" 
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-indigo-400"
                    }`}
                    title={isRecording ? "Stop dictating" : "Dictate response"}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <input
                    type="text"
                    id="input-interview-reply"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={isRecording ? "Listening to your voice..." : "Type or speak your structured answer response..."}
                    className="flex-grow bg-slate-900 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-lg px-4 py-2 text-xs text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Visual Recruiter Analytics Column (CS Specs Feature 7, 8) */}
            <div className="space-y-6">
              
              {/* 1. Camera / Expression Simulator */}
              {(session.type === "HR" || session.type === "Group Discussion") && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                      📷 Live Expression Scanner
                    </span>
                    <span className="inline-flex items-center gap-1 text-[8px] bg-red-950/20 text-red-500 border border-red-500/10 px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                      ● Active
                    </span>
                  </div>
                  
                  {/* Visual Video stream overlay simulator */}
                  <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-850 overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-700 bg-slate-955/50">
                      <div className="w-16 h-16 rounded-full border border-slate-850 flex items-center justify-center text-xl font-bold bg-slate-900 text-slate-400 select-none">
                        {user.name.substring(0,2)}
                      </div>
                    </div>
                    <div className="absolute inset-x-6 top-8 bottom-8 border border-indigo-500/20 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="absolute inset-y-0 w-[1px] bg-indigo-500/15" />
                      <div className="absolute inset-x-0 h-[1px] bg-indigo-500/15" />
                      <div className="absolute left-0 right-0 h-[2px] bg-indigo-500/40 shadow-xs shadow-indigo-500/20 animate-pulse" style={{ top: "30%" }} />
                    </div>
                    
                    <span className="absolute bottom-2 left-2 text-[8px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-slate-350 select-none">
                      Framerate: 30fps
                    </span>
                  </div>

                  {/* Speech & Expression stats */}
                  <div className="space-y-3 pt-2 text-[10px] font-mono text-slate-400">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Confidence Level:</span>
                        <span className="font-bold text-slate-200">84% (High)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: "84%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Speech Fluency Quotient:</span>
                        <span className="font-bold text-slate-200">90% (Fluent)</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: "90%" }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Vocabulary Diversity:</span>
                        <span className="font-bold text-slate-200">76%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: "76%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Protocol Guidelines */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 text-xs text-slate-400 leading-relaxed font-sans">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Interview Protocol</h4>
                <p>EduReach AI provides multi-turn structured interview practice:</p>
                <ul className="space-y-2 list-disc list-inside text-slate-300">
                  <li>Keep responses structured and metric-driven.</li>
                  <li>After 3 conversation turns, the Recruiter will lock the evaluation panel.</li>
                  <li>Click 'Exit Workspace' above at any moment to restart round configurations.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white font-sans">AI Mock Interview Simulator</h2>
        <p className="text-xs text-slate-400 mt-1">Select HR behavioural or company-specific technical rounds. Experience live interactive messaging, and get full communication audits.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-xl mx-auto space-y-6">
        <h3 className="text-sm font-bold text-white font-sans">Configure Mock Interview</h3>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Round Category</label>
          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-200"
          >
            <option value="Technical">Technical Round (OOP, DBMS, DSA)</option>
            <option value="HR">HR Round (Behavioral, Background)</option>
            <option value="Company Specific">Company Specific Preparation</option>
            <option value="Group Discussion">AI Group Discussion Coach (Fluency & Vocabulary)</option>
          </select>
        </div>

        {interviewType === "Company Specific" && (
          <div className="space-y-1.5 animate-fade-in">
            <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Select Corporate Standard</label>
            <select
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-200"
            >
              <option>TCS</option>
              <option>Infosys</option>
              <option>Wipro</option>
              <option>Accenture</option>
              <option>Zoho</option>
            </select>
          </div>
        )}

        <button
          onClick={handleStartInterview}
          disabled={starting}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
        >
          {starting ? "Initializing session..." : "Launch Interview Simulator"}
        </button>
      </div>
    </div>
  );
}
