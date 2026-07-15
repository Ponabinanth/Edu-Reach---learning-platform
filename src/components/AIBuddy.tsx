import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MessageSquare, X, Volume2, ShieldAlert, Award } from "lucide-react";
import { UserProfile } from "../types";

interface AIBuddyProps {
  user: UserProfile;
  onActionClick: (viewId: string) => void;
}

export default function AIBuddy({ user, onActionClick }: AIBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const buddySpeech = `Hey ${user.name}! Your current study streak is looking great at ${user.streak || 4} days. I noticed you completed some binary tree structures yesterday, so today I highly recommend taking a quick practice quiz on SQL Databases to keep your skills balanced!`;

  const handleSpeak = () => {
    if (!synthRef.current) return;
    
    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(buddySpeech);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const handleAction = (viewId: string) => {
    onActionClick(viewId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 ai-font-times">
      {/* Floating pulsing face trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-650 via-indigo-600 to-purple-650 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all animate-bounce cursor-pointer relative border border-white/20"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-500 text-[8px] font-black text-white items-center justify-center">1</span>
          </span>
        </button>
      )}

      {/* Holographic Expanded Panel */}
      {isOpen && (
        <div className="w-80 rounded-3xl bg-slate-900/95 backdrop-blur-md border border-indigo-500/25 p-5 shadow-2xl animate-fade-in flex flex-col space-y-4 text-slate-200">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400">
                🤖
              </div>
              <div>
                <h4 className="text-xs font-black text-white">AI Study Companion</h4>
                <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online Companion
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (synthRef.current) synthRef.current.cancel();
                setIsSpeaking(false);
                setIsOpen(false);
              }}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Dialog Bubble */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/10 text-xs leading-relaxed text-slate-300 relative">
            <div className="absolute -top-2 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-slate-950" />
            <p>{buddySpeech}</p>
            
            <button
              onClick={handleSpeak}
              className={`mt-3 px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                isSpeaking 
                  ? "bg-rose-950/20 border-rose-500/30 text-rose-400 animate-pulse" 
                  : "bg-indigo-950/20 border-indigo-500/30 text-indigo-400"
              }`}
            >
              <Volume2 className="h-3 w-3" />
              <span>{isSpeaking ? "Mute Companion" : "Listen (Text-to-Speech)"}</span>
            </button>
          </div>

          {/* Quick study links */}
          <div className="space-y-2 pt-1">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Companion Recommendations:</span>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <button
                onClick={() => handleAction("quizzes")}
                className="p-2 bg-slate-950 border border-slate-850 rounded-xl hover:border-indigo-500 text-left hover:text-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <span className="font-bold block truncate">📝 Practice SQL</span>
                <span className="text-[8px] text-slate-500 block mt-0.5">Quiz database skills</span>
              </button>
              <button
                onClick={() => handleAction("practice")}
                className="p-2 bg-slate-950 border border-slate-850 rounded-xl hover:border-indigo-500 text-left hover:text-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <span className="font-bold block truncate">💻 DSA Challenge</span>
                <span className="text-[8px] text-slate-500 block mt-0.5">Solve algorithmic list</span>
              </button>
            </div>
          </div>

          {/* Buddy status profile footer */}
          <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-850/50 flex justify-between items-center text-[9px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-yellow-500" />
              <span>Lvl {user.level || 4} Buddy Match</span>
            </span>
            <span className="text-indigo-400">Strengths: Algorithmic Logic</span>
          </div>

        </div>
      )}
    </div>
  );
}
