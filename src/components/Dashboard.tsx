import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Flame, 
  BookOpen, 
  CheckCircle, 
  Trophy, 
  Clock, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Bell, 
  Award,
  BookOpenCheck,
  RefreshCw,
  Calendar,
  Send,
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { UserProfile, UserRole } from "../types";
import { api } from "../api";

interface DashboardProps {
  user: UserProfile;
  analytics: any;
  notifications: any[];
  onActionClick: (viewId: string) => void;
  onReadNotification: (id: string) => void;
  globalLanguage?: string;
}

export default function Dashboard({ user, analytics, notifications, onActionClick, onReadNotification, globalLanguage }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "recommendations" | "analytics" | "studyplanner">("overview");

  // Study Planner States
  const [studyGoal, setStudyGoal] = useState("Prepare for Google Technical Coding rounds");
  const [studyPlan, setStudyPlan] = useState<any | null>(null);
  const [loadingStudyPlan, setLoadingStudyPlan] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Real-time Translation states
  const [translatedInsights, setTranslatedInsights] = useState("");
  const [translatingInsights, setTranslatingInsights] = useState(false);

  // Faculty Dashboard States
  const [studentPredictions, setStudentPredictions] = useState<{ [id: string]: any }>({});
  const [runningPredictionId, setRunningPredictionId] = useState<string | null>(null);

  // Parent Dashboard States
  const [childProfile, setChildProfile] = useState<any | null>(null);
  const [childAnalytics, setChildAnalytics] = useState<any | null>(null);
  const [childPrediction, setChildPrediction] = useState<any | null>(null);
  const [loadingChildPrediction, setLoadingChildPrediction] = useState(false);
  const [parentMessage, setParentMessage] = useState("");
  const [parentMessageSent, setParentMessageSent] = useState(false);

  // Sync study planner details
  useEffect(() => {
    if (user.role === UserRole.STUDENT) {
      const savedPlan = localStorage.getItem(`studyplan_${user.id}`);
      if (savedPlan) {
        setStudyPlan(JSON.parse(savedPlan));
      }
      const savedCompleted = localStorage.getItem(`completedtasks_${user.id}`);
      if (savedCompleted) {
        setCompletedTasks(JSON.parse(savedCompleted));
      }
    }
  }, [user.id, user.role]);

  // Translate recommendations in real-time when globalLanguage changes
  useEffect(() => {
    const translateInsights = async () => {
      const sourceText = analytics?.aiInsights || "Alex is excelling in algorithmic logic and React patterns. We noticed a slight gap in Tree data structures during assessments. Let's practice with focused binary pathing trees.";
      if (!globalLanguage || globalLanguage === "English") {
        setTranslatedInsights("");
        return;
      }
      setTranslatingInsights(true);
      try {
        const res = await api.translateContent(sourceText, globalLanguage);
        if (res.success) {
          setTranslatedInsights(res.translatedText);
        }
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        setTranslatingInsights(false);
      }
    };
    translateInsights();
  }, [globalLanguage, analytics?.aiInsights]);

  // Load parent child stats
  useEffect(() => {
    if (user.role === UserRole.PARENT) {
      const fetchChildData = async () => {
        try {
          const childId = user.childId || "std_1";
          
          setChildProfile({
            id: "std_1",
            name: "Alex Johnson",
            level: 4,
            xp: 1250,
            streak: 5,
            badges: ["Fast Learner", "Quiz Whiz", "Code Warrior"],
            skills: { "Java": 75, "Algorithms": 60, "Database": 45, "React": 80 }
          });

          const childAnalRes = await api.getAnalytics(childId);
          setChildAnalytics(childAnalRes);

          setLoadingChildPrediction(true);
          const predRes = await api.predictPerformance(childId);
          if (predRes.success && predRes.prediction) {
            setChildPrediction(predRes.prediction);
          }
        } catch (err) {
          console.error("Parent load child data failed:", err);
        } finally {
          setLoadingChildPrediction(false);
        }
      };
      fetchChildData();
    }
  }, [user.role, user.childId]);

  const handleGenerateStudyPlan = async () => {
    if (!studyGoal.trim()) return;
    setLoadingStudyPlan(true);
    try {
      const response = await api.generateStudyPlan(studyGoal, user.id);
      if (response.success && response.studyPlan) {
        setStudyPlan(response.studyPlan);
        localStorage.setItem(`studyplan_${user.id}`, JSON.stringify(response.studyPlan));
      }
    } catch (err) {
      alert("Failed to compile customized planner: " + err);
    } finally {
      setLoadingStudyPlan(false);
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    let updated;
    if (completedTasks.includes(taskId)) {
      updated = completedTasks.filter(id => id !== taskId);
    } else {
      updated = [...completedTasks, taskId];
    }
    setCompletedTasks(updated);
    localStorage.setItem(`completedtasks_${user.id}`, JSON.stringify(updated));
  };

  const handlePredictPerformance = async (studentId: string) => {
    setRunningPredictionId(studentId);
    try {
      const response = await api.predictPerformance(studentId);
      if (response.success && response.prediction) {
        setStudentPredictions(prev => ({
          ...prev,
          [studentId]: response.prediction
        }));
      }
    } catch (err) {
      alert("Error calculating performance prediction: " + err);
    } finally {
      setRunningPredictionId(null);
    }
  };

  const handleSendParentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentMessage.trim()) return;
    setParentMessageSent(true);
    setParentMessage("");
    setTimeout(() => {
      setParentMessageSent(false);
    }, 4000);
  };

  // Custom mock data for learning hours if analytics hasn't populated yet
  const hoursData = analytics?.learningHours || [4, 6, 3, 8, 5, 7, 6];
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxHours = Math.max(...hoursData, 1);

  if (user.role === UserRole.STUDENT) {
    // Dynamic greeting time of day
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? "Morning" : hours < 17 ? "Afternoon" : "Evening";
    const greetingSubtitle = `${timeOfDay} focus time! Tackle challenging problems`;
    
    // Dynamic date in "Saturday, Jul 4" style
    const todayDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });

    return (
      <div id="student-dashboard" className="space-y-6 animate-fade-in text-slate-700 select-none">
        {/* Top Welcome Banner Card (Light styled matching screenshot) */}
        <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/60 to-blue-50/60 border border-indigo-100/40 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3 z-10">
            <h2 className="text-2xl md:text-3.5xl font-sans font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {user.name}! ☀️
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              {greetingSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {/* Amber Streak Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-xs">
                <Flame className="h-3.5 w-3.5 fill-white" />
                <span>{user.streak} Day Streak</span>
              </span>

              {/* Purple Level Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#8b5cf6] text-white rounded-lg text-xs font-bold shadow-xs">
                <Award className="h-3.5 w-3.5" />
                <span>Level {user.level}</span>
              </span>
            </div>
          </div>

          <div className="text-right font-sans z-10 md:self-center">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Date</span>
            <span className="text-lg md:text-xl font-extrabold text-slate-800 mt-1 block">{todayDate}</span>
          </div>
        </div>

        {/* Daily Boost Section with Typing Cat (Direct Screenshot Recreation) */}
        <div className="bg-[#fffdf5] border border-[#fef3c7] rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xs relative overflow-hidden">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-extrabold tracking-wide uppercase">
              Daily boost ✨
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Keep the momentum going 🔥
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
              Small wins count. Finish one lesson, one quiz, or one challenge today and keep your streak alive.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button 
                onClick={() => onActionClick("courses")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <span>📘</span> Learn one concept
              </button>
              <button 
                onClick={() => onActionClick("quizzes")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <span>🧠</span> Attempt one quiz
              </button>
              <button 
                onClick={() => onActionClick("competitions")}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs flex items-center gap-1.5 transition-all"
              >
                <span>🏆</span> Join one challenge
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs (Light styled) */}
        <div className="flex border-b border-slate-200 pt-2">
          {(["overview", "recommendations", "analytics", "studyplanner"] as const).map((tab) => (
            <button
              key={tab}
              id={`tab-dash-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold border-b-2 capitalize transition-all duration-150 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab === "studyplanner" ? "AI Study Planner" : tab}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Metrics Columns */}
            <div className="lg:col-span-2 space-y-6">
              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Courses Enrolled</span>
                    <span className="text-lg font-extrabold text-slate-800">2</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Lessons Done</span>
                    <span className="text-lg font-extrabold text-slate-800">{analytics?.lessonsCompleted || 14}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Quizzes Taken</span>
                    <span className="text-lg font-extrabold text-slate-800">{analytics?.quizzesAttempted || 3}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Challenges Joined</span>
                    <span className="text-lg font-extrabold text-slate-800">1</span>
                  </div>
                </div>
              </div>

              {/* Course Progress Section */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-black text-slate-800">Continue Studying</h3>
                  <button 
                    onClick={() => onActionClick("courses")} 
                    className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-all"
                  >
                    <span>Browse All</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-700 rounded">COMP. SCIENCE</span>
                      <h4 className="text-sm font-extrabold text-slate-800 mt-1">Mastering Data Structures & Algorithms</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Next: Introduction to Complexity & Big O</p>
                    </div>
                    <div className="w-full md:w-32 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: "65%" }} />
                      </div>
                      <span className="text-xs font-extrabold text-slate-600">65%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-200 transition-all">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-700 rounded">SW ENGINEERING</span>
                      <h4 className="text-sm font-extrabold text-slate-800 mt-1">Java Backend Development with Spring Boot</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Next: Introduction to Spring Boot & MVC</p>
                    </div>
                    <div className="w-full md:w-32 flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{ width: "20%" }} />
                      </div>
                      <span className="text-xs font-extrabold text-slate-600">20%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Knowledge Workstations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl hover-lift shadow-xs relative overflow-hidden group cursor-pointer" onClick={() => onActionClick("leaderboard")}>
                  <div className="absolute right-0 top-0 -mt-3 -mr-3 w-12 h-12 bg-amber-500/5 rounded-full blur-lg group-hover:bg-amber-500/15 transition-all pointer-events-none" />
                  <span className="text-2.5xl block filter drop-shadow-sm select-none">⭐</span>
                  <h4 className="text-xs font-black text-slate-800 mt-2 font-display">Stellar Insights</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Check academic leaderboards & target score tiers.</p>
                </div>

                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl hover-lift shadow-xs relative overflow-hidden group cursor-pointer" onClick={() => onActionClick("tutor")}>
                  <div className="absolute right-0 top-0 -mt-3 -mr-3 w-12 h-12 bg-indigo-500/5 rounded-full blur-lg group-hover:bg-indigo-500/15 transition-all pointer-events-none" />
                  <span className="text-2.5xl block filter drop-shadow-sm select-none">🌙</span>
                  <h4 className="text-xs font-black text-slate-800 mt-2 font-display">Midnight Study</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Ask AI study questions or speak voice commands 24/7.</p>
                </div>

                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl hover-lift shadow-xs relative overflow-hidden group cursor-pointer" onClick={() => onActionClick("resume")}>
                  <div className="absolute right-0 top-0 -mt-3 -mr-3 w-12 h-12 bg-emerald-500/5 rounded-full blur-lg group-hover:bg-emerald-500/15 transition-all pointer-events-none" />
                  <span className="text-2.5xl block filter drop-shadow-sm select-none">🚀</span>
                  <h4 className="text-xs font-black text-slate-800 mt-2 font-display">Placement Booster</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Parse resume PDF snapshots and analyze match coefficients.</p>
                </div>

                <div className="bg-white border border-slate-100 p-4.5 rounded-2xl hover-lift shadow-xs relative overflow-hidden group cursor-pointer" onClick={() => onActionClick("practice")}>
                  <div className="absolute right-0 top-0 -mt-3 -mr-3 w-12 h-12 bg-rose-500/5 rounded-full blur-lg group-hover:bg-rose-500/15 transition-all pointer-events-none" />
                  <span className="text-2.5xl block filter drop-shadow-sm select-none">⚖️</span>
                  <h4 className="text-xs font-black text-slate-800 mt-2 font-display">Aptitude Scale</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal font-sans">Balance quantitative calculations & step formulas.</p>
                </div>
              </div>

              {/* Daily Learning Missions (CS Gamification Specs Feature 19) */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-900/60 dark:to-indigo-950/20 border border-indigo-150 dark:border-indigo-500/10 p-6 rounded-2xl shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-white">Active Learning Missions</h3>
                      <p className="text-[10px] text-slate-400 font-sans">Complete tasks to earn XP points & keep your daily streak alive!</p>
                    </div>
                  </div>
                  <span className="text-xs bg-indigo-650 text-white font-mono font-bold px-3 py-1 rounded-xl shadow-md select-none">
                    4 Day Streak 🔥
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "mission_dsa", task: "Solve 5 DSA problems", prog: "2 / 5", status: "In Progress", xp: 150, btn: "practice" },
                    { id: "mission_sql", task: "Complete one SQL quiz", prog: "1 / 1", status: "Claim Reward", xp: 100, btn: "quizzes" },
                    { id: "mission_vid", task: "Watch one YouTube tutorial", prog: "0 / 1", status: "Start Mission", xp: 50, btn: "studynotes" }
                  ].map((mission) => {
                    const isClaimable = mission.status === "Claim Reward";
                    const isComplete = mission.prog === "1 / 1" && !isClaimable;
                    return (
                      <div key={mission.id} className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-850/80 p-4.5 rounded-xl flex flex-col justify-between shadow-xs">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase rounded ${
                              isClaimable 
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" 
                                : isComplete 
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                            }`}>
                              {mission.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">+{mission.xp} XP</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-normal">{mission.task}</h4>
                          <span className="text-[10px] font-mono text-slate-400 block">Progress: {mission.prog}</span>
                        </div>

                        <button 
                          onClick={() => {
                            if (isClaimable) {
                              alert(`Claimed +${mission.xp} XP points!`);
                            } else {
                              onActionClick(mission.btn);
                            }
                          }}
                          className={`mt-4 w-full py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase transition-all shadow-xs cursor-pointer ${
                            isClaimable
                              ? "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/10"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-350"
                          }`}
                        >
                          {isClaimable ? "Claim XP" : "Navigate"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Study Recommendations */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-base font-black text-slate-800">AI Highly Recommended Today</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 hover:border-blue-250 transition-all">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Weak Area Identified: Graphs</span>
                    <h4 className="text-sm font-extrabold text-slate-800 mt-1">Binary Search Tree Explanation</h4>
                    <p className="text-xs text-slate-500 mt-1">Improve your topic score by letting our AI tutor explain tree search traversals visually.</p>
                    <button 
                      onClick={() => onActionClick("tutor")} 
                      className="mt-3 text-xs text-blue-650 hover:text-blue-500 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Launch AI Tutor</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 hover:border-purple-250 transition-all">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wide">Practice Goal: DSA Challenge</span>
                    <h4 className="text-sm font-extrabold text-slate-800 mt-1">Interactive Code: Two Sum</h4>
                    <p className="text-xs text-slate-500 mt-1">Complete our recommended Array challenge to gain +150 XP and practice Big-O bounds.</p>
                    <button 
                      onClick={() => onActionClick("practice")} 
                      className="mt-3 text-xs text-purple-650 hover:text-purple-500 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Code Solution</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50/40 rounded-xl border border-slate-100 hover:border-amber-250 transition-all animate-fade-in">
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">Simulated Recruitment Drive</span>
                    <h4 className="text-sm font-extrabold text-slate-800 mt-1">Google & Amazon Mock Drives</h4>
                    <p className="text-xs text-slate-500 mt-1">Complete simulated recruitment tracks with real ATS scanning, aptitude rounds, and AI chat interviews.</p>
                    <button 
                      onClick={() => onActionClick("placement")} 
                      className="mt-3 text-xs text-amber-650 hover:text-amber-500 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Start Mock Drive</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Column (Badges & Notifications) */}
            <div className="space-y-6">
              {/* Gamification / Badges */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-black text-slate-800">Unlocked Badges</h3>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {user.badges.map((badge, index) => {
                    const icons = ["🔥", "🧠", "💻", "⭐", "🚀"];
                    return (
                      <div key={index} className="flex flex-col items-center p-2.5 bg-slate-50/60 border border-slate-100 rounded-lg text-center">
                        <span className="text-xl mb-1">{icons[index % icons.length]}</span>
                        <span className="text-[9px] font-bold text-slate-600 line-clamp-1">{badge}</span>
                      </div>
                    );
                  })}
                  {user.badges.length === 0 && (
                    <p className="text-xs text-slate-400 italic col-span-3 text-center py-4">No badges unlocked yet. Score high on quizzes to earn!</p>
                  )}
                </div>
              </div>

              {/* Notifications / Platform Alerts */}
              <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-800">Alerts & Tips</h3>
                  </div>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-600 text-white rounded-full">
                      {notifications.filter(n => !n.read).length} New
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-lg border text-xs transition-colors ${
                        notif.read 
                          ? "bg-slate-50/50 border-slate-100 text-slate-400" 
                          : "bg-blue-50/40 border-blue-100 text-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-800">{notif.title}</span>
                        {!notif.read && (
                          <button 
                            onClick={() => onReadNotification(notif.id)} 
                            className="text-[10px] font-bold text-blue-600 hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-slate-500 leading-normal">{notif.message}</p>
                      <span className="block mt-1 text-[8px] font-mono text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">Your inbox is clear.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-6 shadow-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              <h3 className="text-lg font-bold text-slate-800 font-sans">Personalized AI Roadmap Insights</h3>
            </div>
            
            <div className="p-4 bg-blue-50/50 border border-blue-100/60 rounded-xl">
              <h4 className="text-sm font-bold text-blue-800 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                EduReach AI Core Performance Diagnostics
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-sans">
                {translatingInsights 
                  ? "Translating Core Diagnostics..." 
                  : (translatedInsights || analytics?.aiInsights || "Alex is excelling in algorithmic logic and React patterns. We noticed a slight gap in Tree data structures during assessments. Let's practice with focused binary pathing trees.")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50/40 rounded-xl border border-slate-100 space-y-4">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 rounded uppercase">
                  Top Strengths
                </span>
                <ul className="space-y-2 text-xs">
                  {analytics?.strongAreas?.map((area: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{area}</span>
                    </li>
                  )) || (
                    <li className="text-slate-400 italic">Play more practice challenges to track strengths.</li>
                  )}
                </ul>
              </div>

              <div className="p-5 bg-slate-50/40 rounded-xl border border-slate-100 space-y-4">
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-rose-50 text-rose-700 border border-rose-100 rounded uppercase">
                  Opportunities for Growth
                </span>
                <ul className="space-y-2 text-xs">
                  {analytics?.weakAreas?.map((area: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600 font-medium">
                      <span className="text-rose-600 font-bold">⚠</span>
                      <span>{area}</span>
                    </li>
                  )) || (
                    <li className="text-slate-400 italic">No explicit weak topics spotted yet. Great job!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Custom SVG Learning Hours Chart */}
            <div className="bg-white border border-slate-100 p-6 rounded-xl lg:col-span-2 shadow-xs">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-600" />
                Active Learning Hours (Last 7 Days)
              </h3>
              
              <div className="h-64 flex items-end justify-between gap-2.5 pt-8 px-4 border-b border-slate-100">
                {hoursData.map((hours: number, i: number) => {
                  const heightPercent = (hours / maxHours) * 80; // Scale to max 80% container height
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                      {/* Tooltip */}
                      <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform bg-slate-800 text-white font-mono text-[10px] font-bold px-2 py-1 rounded">
                        {hours} hrs
                      </span>
                      {/* Bar */}
                      <div 
                        className="w-full max-w-[40px] bg-blue-600 group-hover:bg-blue-500 rounded-t-md transition-all duration-500"
                        style={{ height: `${heightPercent || 4}%` }}
                      />
                      {/* Label */}
                      <span className="text-[10px] font-bold text-slate-400 mt-2.5">{daysOfWeek[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom SVG Topic Mastery Radar/Skill Map Mockup */}
            <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Topic Skill Index (%)
                </h3>
                <div className="space-y-4">
                  {Object.entries(user.skills).map(([skill, score]) => (
                    <div key={skill} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{skill}</span>
                        <span className="text-blue-600">{score}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full" style={{ width: `${score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                <span>Calculated dynamically based on homework assignments, coding tests, and quizzes.</span>
              </div>
            </div>
          </div>
        )}

          {activeTab === "studyplanner" && (
            <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-6 shadow-xs text-slate-700 animate-fade-in">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600 animate-pulse" />
                <h3 className="text-lg font-bold text-slate-800 font-sans">AI Personalized Study Planner</h3>
              </div>
              
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Enter Learning Goal or Target Exam</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    placeholder="e.g. Master React and Node.js backend integration, Prepare for upcoming SQL assessment"
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 focus:outline-none focus:border-blue-500 text-xs rounded-xl text-slate-800"
                  />
                  <button
                    onClick={handleGenerateStudyPlan}
                    disabled={loadingStudyPlan}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {loadingStudyPlan ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                    )}
                    <span>Generate Plan</span>
                  </button>
                </div>
              </div>

              {loadingStudyPlan && (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                  <p className="text-xs font-mono text-slate-400">Gemini is analyzing your skills and synthesizing weekly milestones...</p>
                </div>
              )}

              {!loadingStudyPlan && studyPlan && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base">{studyPlan.title}</h4>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 border border-emerald-200 rounded-full font-bold uppercase">
                      AI Compiled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {studyPlan.weeks?.map((week: any) => {
                      const totalTasks = week.tasks?.length || 0;
                      const doneTasks = week.tasks?.filter((t: any) => completedTasks.includes(t.id)).length || 0;
                      const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
                      
                      return (
                        <div key={week.weekNumber} className="bg-slate-50/60 border border-slate-100 p-5 rounded-xl space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Week {week.weekNumber}</span>
                              <h5 className="text-sm font-extrabold text-slate-800 mt-0.5">{week.theme}</h5>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{completionRate}% Done</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${completionRate}%` }} />
                          </div>

                          {/* Tasks list */}
                          <div className="space-y-2.5 pt-2">
                            {week.tasks?.map((task: any) => {
                              const isChecked = completedTasks.includes(task.id);
                              return (
                                <div
                                  key={task.id}
                                  onClick={() => toggleTaskCompleted(task.id)}
                                  className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                                    isChecked 
                                      ? "bg-slate-100/50 border-slate-200/80 text-slate-400" 
                                      : "bg-white border-slate-100 text-slate-700 hover:border-slate-200"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}} // toggled on click
                                    className="mt-0.5 pointer-events-none"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start gap-2">
                                      <span className={`text-xs font-bold ${isChecked ? "line-through text-slate-400" : "text-slate-800"}`}>
                                        {task.title}
                                      </span>
                                      <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                                        {task.durationMinutes}m
                                      </span>
                                    </div>
                                    <p className={`text-[10px] mt-0.5 ${isChecked ? "text-slate-400" : "text-slate-500"}`}>
                                      {task.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!loadingStudyPlan && !studyPlan && (
                <div className="py-16 text-center text-slate-400">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-slate-400">Planner Idle</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1">Enter your learning goal above and let Gemini compile a custom roadmap with weekly milestones and checkboxes.</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

  // PARENT DASHBOARD VIEW
  if (user.role === UserRole.PARENT) {
    const todayDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric"
    });

    return (
      <div id="parent-dashboard" className="space-y-6 animate-fade-in text-slate-700 select-none">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-50/60 via-amber-50/60 to-yellow-50/60 border border-amber-100 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 z-10">
            <h2 className="text-2xl md:text-3.5xl font-sans font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Parent Workspace: {user.name} 🏠
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              Monitoring active progress and placement readiness for: <strong className="text-slate-800">{childProfile?.name || "Alex Johnson"}</strong>
            </p>
          </div>
          <div className="text-right font-sans z-10">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Report Date</span>
            <span className="text-lg md:text-xl font-extrabold text-slate-800 mt-1 block">{todayDate}</span>
          </div>
        </div>

        {/* Child Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <Flame className="h-5 w-5 fill-orange-500" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Child Streak</span>
              <span className="text-lg font-extrabold text-slate-800">{childProfile?.streak || 5} Days</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Academic Level</span>
              <span className="text-lg font-extrabold text-slate-800">Level {childProfile?.level || 4}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Badges Earned</span>
              <span className="text-lg font-extrabold text-slate-800">{childProfile?.badges?.length || 3}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-xl flex items-center gap-3 shadow-xs">
            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Weekly Study Time</span>
              <span className="text-lg font-extrabold text-slate-800">39 Hours</span>
            </div>
          </div>
        </div>

        {/* Prediction & Diagnostics Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* AI Advisor Panel */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-5">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <span>AI Parent Advisor & Performance Prediction</span>
                </h3>
                {childPrediction && (
                  <span className={`px-2.5 py-0.5 text-[9px] font-extrabold uppercase border rounded-full ${
                    childPrediction.riskLevel === "Low" 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                      : childPrediction.riskLevel === "Medium"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {childPrediction.riskLevel} Risk Profile
                  </span>
                )}
              </div>

              {loadingChildPrediction ? (
                <div className="py-12 text-center space-y-2">
                  <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 font-mono">Running academic predictive regression analysis...</p>
                </div>
              ) : childPrediction ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wide">Predicted Final Readiness Grade</h4>
                      <p className="text-xs text-slate-600 mt-1">Based on quiz scores, sandbox coding tasks, and streak factors.</p>
                    </div>
                    <span className="text-3.5xl font-black text-orange-600 font-mono pr-2">{childPrediction.predictedGrade}%</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-800">Child Diagnostic Assessment:</span>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{childPrediction.predictionSummary}</p>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-extrabold text-slate-800">Reclaimed Growth Suggestions (For Parents):</span>
                    <ul className="space-y-2 text-xs">
                      {childPrediction.recommendations?.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-600 font-medium font-sans">
                          <span className="text-orange-500 font-bold shrink-0">❖</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No academic diagnostics calculated yet.</p>
              )}
            </div>

            {/* Topic skill progress indexes */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Child Course Syllabus Mastery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {childProfile && Object.entries(childProfile.skills).map(([skill, score]: any) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">{skill}</span>
                      <span className="text-orange-600">{score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Instructor Contact Form */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-600" />
                <h3 className="text-base font-black text-slate-800">Contact Course Instructor</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Send a direct notification query to **Dr. Sarah Mitchell** regarding curriculum progress or performance concerns.
              </p>

              {parentMessageSent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center space-y-1">
                  <span className="block font-bold">✓ Message Routed Successfully!</span>
                  <span className="text-slate-500 text-[10px]">Your instructor will reply directly to your registered portal.</span>
                </div>
              ) : (
                <form onSubmit={handleSendParentMessage} className="space-y-3">
                  <textarea
                    rows={4}
                    value={parentMessage}
                    onChange={(e) => setParentMessage(e.target.value)}
                    required
                    placeholder="Enter your query or request a consultation meeting..."
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500 text-xs rounded-xl p-3 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FACULTY DASHBOARD VIEW
  const mockStudentsList = [
    { id: "std_1", name: "Alex Johnson", email: "student@edureach.ai", level: 4, xp: 1250, skills: { "Java": 75, "Algorithms": 60, "Database": 45, "React": 80 } },
    { id: "std_2", name: "Jessica Carter", email: "jessica@edureach.ai", level: 3, xp: 950, skills: { "Java": 55, "Algorithms": 70, "Database": 65, "React": 40 } },
    { id: "std_3", name: "Robert Liang", email: "robert@edureach.ai", level: 2, xp: 620, skills: { "Java": 40, "Algorithms": 45, "Database": 35, "React": 50 } }
  ];

  return (
    <div id="faculty-dashboard" className="space-y-6 animate-fade-in text-slate-700">
      <div className="bg-gradient-to-r from-purple-50/60 via-indigo-50/60 to-blue-50/60 border border-indigo-100/40 rounded-2xl p-6 md:p-8 shadow-xs">
        <h2 className="text-2xl font-black text-slate-800 font-sans">Instructor Workspace: {user.name} 🎓</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-xl">
          Coordinate syllabus uploads, track student quiz scores, review programming homework submissions, and generate custom examinations using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button 
          onClick={() => onActionClick("courses")} 
          className="bg-white border border-slate-100 hover:border-blue-500 p-6 rounded-xl text-left shadow-xs transition-all group cursor-pointer"
        >
          <BookOpen className="h-7 w-7 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
          <h3 className="text-lg font-black text-slate-800 mt-4 font-sans">Manage Courses</h3>
          <p className="text-xs text-slate-500 mt-2">Create new course syllabus frameworks, upload explanatory PDFs, and post educational videos.</p>
        </button>

        <button 
          onClick={() => onActionClick("quizzes")} 
          className="bg-white border border-slate-100 hover:border-purple-500 p-6 rounded-xl text-left shadow-xs transition-all group cursor-pointer"
        >
          <CheckCircle className="h-7 w-7 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
          <h3 className="text-lg font-black text-slate-800 mt-4 font-sans">Quizzes & AI Generator</h3>
          <p className="text-xs text-slate-500 mt-2">Generate multiple-choice assessments dynamically via AI on custom educational topics.</p>
        </button>

        <button 
          onClick={() => onActionClick("leaderboard")} 
          className="bg-white border border-slate-100 hover:border-emerald-500 p-6 rounded-xl text-left shadow-xs transition-all group cursor-pointer"
        >
          <Trophy className="h-7 w-7 text-emerald-600 group-hover:scale-110 transition-transform duration-200" />
          <h3 className="text-lg font-black text-slate-800 mt-4 font-sans">Leaderboard & Analytics</h3>
          <p className="text-xs text-slate-500 mt-2">View active students list, track total levels, Streaks, XP badges, and general growth graphs.</p>
        </button>
      </div>

      {/* AI Performance Roster Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          <span>AI Placement Performance Predictor (Active Roster)</span>
        </h3>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">
          Select a student from your active database. Gemini AI will evaluate their current homework scores, sandbox milestones, streaks, and skill ratings to predict their academic readiness grade and risk factors.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-mono">
                <th className="py-2.5 pr-4">Student</th>
                <th className="py-2.5 px-4">Stats & Level</th>
                <th className="py-2.5 px-4">Predicted Score</th>
                <th className="py-2.5 px-4">Risk Profile</th>
                <th className="py-2.5 pl-4 text-right">Academic Diagnostic Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {mockStudentsList.map((std) => {
                const pred = studentPredictions[std.id];
                const isRunning = runningPredictionId === std.id;
                
                return (
                  <React.Fragment key={std.id}>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3.5 pr-4 font-bold text-slate-900">{std.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        Level {std.level} ({std.xp} XP)
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                        {pred ? `${pred.predictedGrade}%` : "Not Run"}
                      </td>
                      <td className="py-3.5 px-4">
                        {pred ? (
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase border rounded-full ${
                            pred.riskLevel === "Low" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : pred.riskLevel === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {pred.riskLevel}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3.5 pl-4 text-right">
                        <button
                          onClick={() => handlePredictPerformance(std.id)}
                          disabled={isRunning}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isRunning ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3 text-yellow-300" />
                          )}
                          <span>Run Predictor</span>
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Prediction Results Panel */}
                    {pred && (
                      <tr>
                        <td colSpan={5} className="py-3 px-5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="space-y-3.5 py-2 font-sans animate-fade-in">
                            <div className="flex gap-2 items-center text-xs font-bold text-indigo-800">
                              <AlertTriangle className="h-4 w-4 text-indigo-600" />
                              <span>AI Diagnostics Analysis:</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-sans">{pred.predictionSummary}</p>
                            
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Faculty Recommendation Checklist:</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                {pred.recommendations?.map((rec: string, rIdx: number) => (
                                  <div key={rIdx} className="flex gap-2 items-center p-2 bg-white border border-slate-100 rounded-lg">
                                    <span className="text-indigo-500 font-bold">✓</span>
                                    <span className="text-slate-600 font-medium font-sans">{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
