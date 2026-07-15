import React, { useState, useEffect } from "react";
import { 
  Award, 
  Trophy, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Check, 
  MoreVertical, 
  Play, 
  ChevronDown, 
  BookOpen, 
  Users, 
  TrendingUp 
} from "lucide-react";
import { api } from "../api";
import { UserProfile } from "../types";

interface LeaderboardProps {
  user: UserProfile;
  analytics: any;
  onActionClick: (viewId: string) => void;
}

export default function Leaderboard({ user, analytics, onActionClick }: LeaderboardProps) {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceRange, setPerformanceRange] = useState("Monthly");
  const [gradingRange, setGradingRange] = useState("Weekly");

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getLeaderboard();
        setBoard(data);
      } catch (err) {
        // Fallback demo board if API offline
        setBoard([
          { rank: 1, id: "std_1", name: "Alex Johnson", level: 4, xp: 1250, badgesCount: 3 },
          { rank: 2, id: "std_2", name: "Jessica Carter", level: 3, xp: 950, badgesCount: 2 },
          { rank: 3, id: "std_3", name: "Robert Liang", level: 2, xp: 620, badgesCount: 1 },
          { rank: 4, id: "std_4", name: "Emily Watson", level: 2, xp: 510, badgesCount: 1 }
        ]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* ── ECLASSHUB PREMIUM ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Col-1 (Left): Welcome Card & Tasks (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-6">
          {/* Welcome Card (Glassmorphism & Gradient) */}
          <div className="relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between min-h-[220px] shadow-lg border border-white/20"
               style={{
                 background: "linear-gradient(135deg, rgba(254, 219, 219, 0.9) 0%, rgba(224, 231, 255, 0.9) 50%, rgba(204, 251, 241, 0.8) 100%)",
                 boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)"
               }}>
            <div className="absolute right-4 top-4 text-3xl select-none">👋</div>
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-display font-black text-indigo-950 tracking-tight leading-tight">
                Welcome back, {user.name}
              </h3>
              <p className="text-xs text-indigo-900/75 leading-relaxed max-w-[200px]">
                Ready to accelerate your learning paths today?
              </p>
            </div>
            
            <button 
              onClick={() => onActionClick("coding_mentor")}
              className="mt-6 w-fit px-6 py-2.5 bg-black hover:bg-slate-900 text-white font-sans text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Start Lesson
            </button>
          </div>

          {/* Upcoming Class/Tasks Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 flex-1 shadow-sm flex flex-col justify-between min-h-[260px]">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-display font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Class
              </h4>
              <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 flex-1 flex flex-col justify-around">
              {/* Task 1 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Advanced Mathematics</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: "75%" }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">75% complete</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <div className="flex -space-x-1.5">
                    {["std_1", "std_2", "std_3"].map((id, idx) => (
                      <div key={idx} className="w-5 h-5 rounded-full bg-slate-350 dark:bg-slate-700 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                        {String.fromCharCode(65 + idx)}
                      </div>
                    ))}
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      20+
                    </div>
                  </div>
                  <span className="font-mono">09:00 AM - 10:30 AM</span>
                </div>
              </div>

              {/* Task 2 */}
              <div className="space-y-2 pt-2 border-t border-slate-100/50 dark:border-slate-850/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Physics Laboratory</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: "40%" }} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">40% complete</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <div className="flex -space-x-1.5">
                    {["std_2", "std_3", "std_4"].map((id, idx) => (
                      <div key={idx} className="w-5 h-5 rounded-full bg-slate-350 dark:bg-slate-700 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                        {String.fromCharCode(68 + idx)}
                      </div>
                    ))}
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-850 border border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500">
                      15+
                    </div>
                  </div>
                  <span className="font-mono">11:00 AM - 12:30 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Col-2 (Right): Charts, Gauges, Quick Stats (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between gap-6">
          
          {/* Row 2.1: Performance Overview (Subject columns) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-display font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Performance Overview
              </h4>
              
              <div className="relative">
                <select 
                  value={performanceRange} 
                  onChange={(e) => setPerformanceRange(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-1 text-xs font-bold rounded-lg text-slate-650 dark:text-slate-350 focus:outline-none cursor-pointer"
                >
                  <option>Monthly</option>
                  <option>Weekly</option>
                  <option>Annually</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Highlight summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Top Performing:</span>
                <span className="text-base font-black text-slate-800 dark:text-white block">Biology</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black text-slate-800 dark:text-white font-mono">90%</span>
                  <span className="text-[10px] text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 border border-emerald-200/25">
                    ▲ 9.5%
                  </span>
                </div>
              </div>

              {/* Subject Column bars */}
              <div className="md:col-span-3 grid grid-cols-3 gap-4 items-end h-32 pt-2 border-b border-slate-100/50 dark:border-slate-850/30">
                {/* Physics (CS: Algorithms) */}
                <div className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Physics</span>
                  <span className="text-[11px] font-bold font-mono text-rose-500">75%</span>
                  <div className="w-full bg-rose-300 rounded-t-xl transition-all duration-700" style={{ height: "75%" }} />
                </div>
                {/* Chemistry (CS: DBMS) */}
                <div className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Chemistry</span>
                  <span className="text-[11px] font-bold font-mono text-slate-550">80%</span>
                  {/* Gray diagonal stripes bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-t-xl transition-all duration-700 relative overflow-hidden" style={{ height: "80%" }}>
                    <div className="absolute inset-0 opacity-15" style={{
                      backgroundImage: "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                      backgroundSize: "8px 8px"
                    }} />
                  </div>
                </div>
                {/* Biology (CS: WebDev) */}
                <div className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Biology</span>
                  <span className="text-[11px] font-bold font-mono text-indigo-500">90%</span>
                  <div className="w-full bg-indigo-300 rounded-t-xl transition-all duration-700" style={{ height: "90%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2.2: Grading, Stats, Avatars and Video Call Mock (3 subgrids) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Grading Circular Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-5 shadow-sm flex flex-col justify-between text-center">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Grading Over View</span>
                <select 
                  value={gradingRange} 
                  onChange={(e) => setGradingRange(e.target.value)}
                  className="bg-transparent border-none text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer"
                >
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>

              {/* Gauge path SVG */}
              <div className="relative flex items-center justify-center py-4">
                <svg className="w-32 h-20" viewBox="0 0 100 60">
                  {/* Background Arc */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="#e2e8f0" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    className="dark:stroke-slate-850"
                  />
                  {/* Active Arc (93%) */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="#a5b4fc" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="125"
                    strokeDashoffset="10"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute top-10 flex flex-col items-center">
                  <span className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">93%</span>
                  <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">Grading in Sep 29, 2025</span>
                </div>
              </div>
            </div>

            {/* Quick Stats & Avatars */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Quick Stats</span>
                <button className="p-0.5 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-slate-100/50 dark:border-slate-850/30">
                <div>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">120 <span className="text-[10px] font-bold text-slate-400 font-sans">hrs</span></span>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Total Hours</span>
                </div>
                <div>
                  <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">72</span>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase">Aviqureess</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-bold text-slate-400 uppercase block">Total Students</span>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {["std_1", "std_2", "std_3", "std_4"].map((id, idx) => (
                      <div key={idx} className="w-7 h-7 rounded-full bg-slate-350 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                        {String.fromCharCode(68 + idx)}
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full bg-slate-150 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[9px] font-black text-slate-550 shadow-xs">
                      500+
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video preview call panel */}
            <div className="relative rounded-3xl overflow-hidden shadow-sm group min-h-[120px] border border-slate-100 dark:border-slate-850">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" 
                alt="Student video thumbnail" 
                className="w-full h-full object-cover brightness-90 group-hover:scale-103 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />
              {/* Floating Play Button */}
              <button className="absolute inset-0 m-auto w-10 h-10 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-slate-800 hover:scale-110 active:scale-95 shadow-md transition-all cursor-pointer">
                <Play className="h-4.5 w-4.5 fill-slate-800 text-slate-800 ml-0.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ── ADVANCED SPEC FEATURE ROW (HEATMAP, EXAM SCORE, BEHAVIOR) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* 1. Skill Heatmap (CS Specs) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Skill Heatmap</span>
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">6 Skills Active</span>
          </div>
          <p className="text-[10px] text-slate-400">Color depth indicates academic/coding proficiency indices.</p>
          
          <div className="grid grid-cols-2 gap-2 pt-2">
            {[
              { name: "Java Coding", val: 80, heat: "bg-emerald-600 text-white" },
              { name: "DSA Mastery", val: 65, heat: "bg-emerald-500 text-white" },
              { name: "SQL Database", val: 45, heat: "bg-emerald-300 text-slate-900" },
              { name: "Communication", val: 90, heat: "bg-emerald-700 text-white" },
              { name: "Aptitude Score", val: 70, heat: "bg-emerald-500/80 text-white" },
              { name: "React WebDev", val: 85, heat: "bg-emerald-600/90 text-white" }
            ].map((skill, index) => (
              <div key={index} className={`p-3 rounded-xl border border-emerald-500/10 flex flex-col justify-between ${skill.heat}`}>
                <span className="text-[10px] font-bold block truncate">{skill.name}</span>
                <span className="text-sm font-black font-mono mt-1.5 block">{skill.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Predicted Exam Score */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">AI Exam Prediction</span>
              <span className="text-[9px] bg-blue-50 dark:bg-blue-950/20 text-blue-600 px-2 py-0.5 rounded font-mono font-bold">95% Conf.</span>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Estimated Exam Score</span>
              <span className="text-3xl font-black font-mono text-blue-600 block">88%</span>
              <span className="text-[9px] text-slate-450 block">Predicted range: 85% - 92% based on streak history</span>
            </div>
          </div>
          
          <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-850 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>DSA Assessment readiness:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">High (82%)</span>
            </div>
            <div className="flex justify-between">
              <span>SQL DBMS readiness:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">Medium (65%)</span>
            </div>
          </div>
        </div>

        {/* 3. Learning Behavior Analytics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">Behavior Analytics</span>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="block font-bold text-slate-750 dark:text-slate-350">Peak Focus Hours</span>
                  <span className="text-[10px] text-slate-400 block">Most productive intervals</span>
                </div>
                <span className="font-mono font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-1 border border-indigo-200/15 rounded-lg">8 PM - 10 PM</span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <div>
                  <span className="block font-bold text-slate-750 dark:text-slate-350">Weekly Active Days</span>
                  <span className="text-[10px] text-slate-400 block">Consistency ratio</span>
                </div>
                <span className="font-mono font-bold text-purple-500 bg-purple-50 dark:bg-purple-950/20 px-2 py-1 border border-purple-200/15 rounded-lg">6 / 7 Days</span>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <div>
                  <span className="block font-bold text-slate-750 dark:text-slate-350">Avg Focus Time</span>
                  <span className="text-[10px] text-slate-400 block">Daily study commitment</span>
                </div>
                <span className="font-mono font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 border border-rose-200/15 rounded-lg">4.2 Hrs/Day</span>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-450 pt-3 border-t border-slate-100 dark:border-slate-850 leading-relaxed font-sans italic">
            💡 AI Companion: Alex is most productive during night cycles. Keep up the high level focus on Tuesdays!
          </div>
        </div>

      </div>

      {/* ── GLOBAL RANKINGS LEADERBOARD TABLE ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500 animate-bounce" />
            <div>
              <h3 className="text-sm font-display font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Global Leaderboard
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">
                Review overall student points, level positions, and completed badge collection ratios.
              </p>
            </div>
          </div>
          
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 px-2.5 py-1 border border-indigo-200 dark:border-indigo-500/10 rounded-lg font-mono font-bold uppercase tracking-wider">
            Active Season 2.0
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
            <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-500">Querying active season ranks...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-250 dark:border-slate-800 bg-slate-100/10 font-mono text-slate-400">
                  <th className="p-4 pl-6 uppercase tracking-wider font-bold">Rank</th>
                  <th className="p-4 uppercase tracking-wider font-bold">Student</th>
                  <th className="p-4 uppercase tracking-wider font-bold">Level</th>
                  <th className="p-4 uppercase tracking-wider font-bold">XP Points</th>
                  <th className="p-4 pr-6 uppercase tracking-wider font-bold">Unlocked Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 dark:divide-slate-850 text-slate-650 dark:text-slate-350">
                {board.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="p-4 pl-6 font-mono font-bold text-slate-500">
                      {student.rank === 1 ? "🥇 1" : student.rank === 2 ? "🥈 2" : student.rank === 3 ? "🥉 3" : `#${student.rank}`}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{student.name}</td>
                    <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">Lvl {student.level}</td>
                    <td className="p-4 font-mono text-amber-600 dark:text-amber-500 font-extrabold">{student.xp} XP</td>
                    <td className="p-4 pr-6 font-mono text-slate-400">
                      {student.badgesCount || (student.badges ? student.badges.length : 0)} badges unlocked
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
