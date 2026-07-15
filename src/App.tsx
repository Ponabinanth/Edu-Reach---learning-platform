import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  Bell, 
  Flame, 
  X, 
  ChevronRight, 
  LogIn,
  LogOut,
  ChevronDown,
  PanelLeft,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  Key,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Search,
  Check,
  Play,
  BookOpen,
  Star,
  ArrowRight,
  Award,
  Users,
  Clock,
  Briefcase
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Courses from "./components/Courses";
import AITutor from "./components/AITutor";
import PracticeHub from "./components/PracticeHub";
import Quizzes from "./components/Quizzes";
import MockInterview from "./components/MockInterview";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import CareerPathfinder from "./components/CareerPathfinder";
import NotesGenerator from "./components/NotesGenerator";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";
import Profile from "./components/Profile";
import Competitions from "./components/Competitions";
import PlacementHub from "./components/PlacementHub";
import SupportChatbot from "./components/SupportChatbot";
import CodingMentor from "./components/CodingMentor";
import StudyRooms from "./components/StudyRooms";
import AIBuddy from "./components/AIBuddy";

import { UserProfile, UserRole, Course, Quiz, CodingProblem } from "./types";
import { api } from "./api";

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [globalLanguage, setGlobalLanguage] = useState<string>("English");

  // Initialize and synchronize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);
  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Public eLEARNING Landing states
  const [searchCategory, setSearchCategory] = useState<string>("courses");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<any | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Disable body scroll when authentication modal is open
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAuthModal]);
  
  // Platform dataset state loaded from server
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Auth fields
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.STUDENT);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // AI Chatbot assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<{ sender: "user" | "bot"; text: string; time: string }[]>([]);
  const [chatbotInput, setChatbotInput] = useState("");
  const [chatbotLoading, setChatbotLoading] = useState(false);

  // Sync data with server
  const loadData = async (studentId: string) => {
    try {
      const coursesRes = await api.getCourses();
      setCourses(coursesRes);

      const quizRes = await api.getQuizzes();
      setQuizzes(quizRes);

      const probRes = await api.getPracticeProblems();
      setProblems(probRes);

      const notifRes = await api.getNotifications(studentId);
      setNotifications(notifRes);

      const analRes = await api.getAnalytics(studentId);
      setAnalytics(analRes);

      // Fetch chatbot messages
      try {
        const chatLogs = await api.getChatMessages(studentId);
        if (chatLogs && chatLogs.length > 0) {
          const botLogs = chatLogs
            .filter((msg: any) => msg.senderId === "ai_assistant" || msg.receiverId === "ai_assistant")
            .map((msg: any) => ({
              sender: msg.senderId === "ai_assistant" ? "bot" : "user",
              text: msg.text,
              time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }));
          if (botLogs.length > 0) {
            setChatbotMessages(botLogs);
          } else {
            setChatbotMessages([
              { sender: "bot", text: "Hello! I am your EduReach Pro Support Assistant. How can I help you navigate the platform today? ☀️", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]);
          }
        } else {
          setChatbotMessages([
            { sender: "bot", text: "Hello! I am your EduReach Pro Support Assistant. How can I help you navigate the platform today? ☀️", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]);
        }
      } catch (chatErr) {
        console.warn("Could not load chatbot messages:", chatErr);
      }
    } catch (err) {
      console.warn("Could not sync background server db: fallback local states loaded.", err);
    }
  };

  // Pre-fetch public catalogs on mount for responsive landing views
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const coursesRes = await api.getCourses();
        if (coursesRes && coursesRes.length > 0) setCourses(coursesRes);
        const quizRes = await api.getQuizzes();
        if (quizRes && quizRes.length > 0) setQuizzes(quizRes);
        const probRes = await api.getPracticeProblems();
        if (probRes && probRes.length > 0) setProblems(probRes);
      } catch (err) {
        console.warn("Public preview fetch failed:", err);
      }
    };
    fetchPublicData();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail) return;
    setAuthLoading(true);
    try {
      const response = await api.login(authEmail, authRole);
      if (response.success) {
        setUser(response.user);
        await loadData(response.user.id);
      }
    } catch (err) {
      alert("Verification Failed. Please check role settings.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authName) return;
    setAuthLoading(true);
    try {
      const response = await api.register(authEmail, authName, authRole);
      if (response.success) {
        setUser(response.user);
        await loadData(response.user.id);
      }
    } catch (err) {
      alert("Email already exists.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickLogin = async (email: string, role: UserRole) => {
    setAuthLoading(true);
    try {
      const response = await api.login(email, role);
      if (response.success) {
        setUser(response.user);
        await loadData(response.user.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCourses([]);
    setQuizzes([]);
    setProblems([]);
    setNotifications([]);
    setAnalytics(null);
    setCurrentView("dashboard");
    setIsChatOpen(false);
  };

  const handleSendChatbotMessage = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!chatbotInput.trim() || chatbotLoading) return;
    const userMsg = chatbotInput;
    setChatbotInput("");
    setChatbotLoading(true);
    
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatbotMessages((prev) => [...prev, { sender: "user", text: userMsg, time: nowStr }]);
    
    try {
      const response = await api.askAIChatbot(userMsg, user?.id);
      setChatbotMessages((prev) => [...prev, { sender: "bot", text: response.reply, time: nowStr }]);
    } catch (err) {
      setChatbotMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I encountered an issue. Please try again in a moment.", time: nowStr }]);
    } finally {
      setChatbotLoading(false);
    }
  };

  const markReadNotif = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      if (user) {
        const notifRes = await api.getNotifications(user.id);
        setNotifications(notifRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to filter live registry catalogs based on guest search consoles
  const getSearchResults = () => {
    if (!searchKeyword) return [];
    const query = searchKeyword.toLowerCase();
    if (searchCategory === "courses") {
      const filtered = courses.filter(
        c => c.title.toLowerCase().includes(query) || c.description?.toLowerCase().includes(query)
      );
      if (filtered.length > 0) return filtered;
      return [
        { title: "Advanced Data Structures & Algorithms", description: "Master arrays, list manipulations, priority queues, binary trees, DSU, dynamic programming, and segments trees." },
        { title: "High-Level System Design Architectures", description: "Scaling, Microservices API, database sharding, normalizations, and Kafka messaging." },
        { title: "Quantitative Aptitude Mastery", description: "Time & work, probability theory, progressions, permutations and combos." }
      ].filter(item => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    } else if (searchCategory === "quizzes") {
      const filtered = quizzes.filter(
        q => q.title.toLowerCase().includes(query) || q.topic?.toLowerCase().includes(query)
      );
      if (filtered.length > 0) return filtered;
      return [
        { title: "DBMS Joins & Normalization Exam", description: "Test skills in SQL Joins, Aggregations, Groupings, and 1NF to BCNF Normalization." },
        { title: "OS CPU Scheduling & Virtual Memory Challenge", description: "Multiple choice questionnaire on process schedules and virtual memory paging." },
        { title: "Computer Networks & OSI Model Quiz", description: "Advanced assessment on IP Subnetting, OSI Model layers, and TCP/IP routing protocols." }
      ].filter(item => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    } else if (searchCategory === "problems") {
      const filtered = problems.filter(
        p => p.title.toLowerCase().includes(query) || p.difficulty?.toLowerCase().includes(query)
      );
      if (filtered.length > 0) return filtered;
      return [
        { title: "Two Sum: Linear Hash Map Optimization", description: "Solve the classic Array-based problem in O(N) time with HashMap indexing." },
        { title: "LRU Cache Memory eviction strategy", description: "Compile a custom Least Recently Used Cache container using dual pointers and nodes." },
        { title: "Merge K Sorted Singly Linked Lists", description: "Solve range arrays of sorted nodes using binary divide and conquer paradigms." }
      ].filter(item => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    }
    return [];
  };

  // Render view dispatcher
  const renderActiveView = () => {
    if (!user) return null;
    switch (currentView) {
      case "dashboard":
        return (
          <Dashboard 
            user={user} 
            analytics={analytics} 
            notifications={notifications} 
            onActionClick={(viewId) => setCurrentView(viewId)}
            onReadNotification={markReadNotif}
            globalLanguage={globalLanguage}
          />
        );
      case "courses":
        return (
          <Courses 
            user={user} 
            courses={courses} 
            onCourseAdded={() => loadData(user.id)}
            onLessonAdded={() => loadData(user.id)}
            globalLanguage={globalLanguage}
          />
        );
      case "tutor":
        return <div className="ai-font-times"><AITutor /></div>;
      case "practice":
        return <div className="ai-font-times"><PracticeHub user={user} problems={problems} /></div>;
      case "quizzes":
        return (
          <div className="ai-font-times">
            <Quizzes 
              user={user} 
              quizzes={quizzes} 
              onQuizAdded={() => loadData(user.id)}
              globalLanguage={globalLanguage}
            />
          </div>
        );
      case "interviews":
        return <div className="ai-font-times"><MockInterview user={user} /></div>;
      case "resume":
        return <div className="ai-font-times"><ResumeAnalyzer /></div>;
      case "placement":
        return <div className="ai-font-times"><PlacementHub user={user} /></div>;
      case "support_chat":
        return <div className="ai-font-times"><SupportChatbot user={user} /></div>;
      case "career":
        return <div className="ai-font-times"><CareerPathfinder /></div>;
      case "notes":
        return <div className="ai-font-times"><NotesGenerator /></div>;
      case "competitions":
        return <Competitions user={user} />;
      case "profile":
        return <Profile user={user} onProfileUpdate={(updatedUser) => setUser(updatedUser)} />;
      case "leaderboard":
        return <Leaderboard user={user} analytics={analytics} onActionClick={(viewId) => setCurrentView(viewId)} />;
      case "coding_mentor":
        return <div className="ai-font-times"><CodingMentor user={user} /></div>;
      case "study_rooms":
        return <StudyRooms />;
      case "admin":
        return <AdminPanel />;
      default:
        return (
          <div className="p-8 text-slate-400 italic">This module is locked. Upgrade active rank tiers to access.</div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-[#f8fafc] font-sans text-slate-700 flex ${user ? "h-screen overflow-hidden" : ""}`}>
      {user ? (
        /* ENTIRE APPLICATION DASHBOARD MAIN WRAPPER */
        <>
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            user={user} 
            onLogout={handleLogout}
          />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Toolbar Navigation Header */}
            <header className="h-16 border-b border-slate-100 bg-white px-6 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                  <PanelLeft className="h-5 w-5" />
                </button>
                <div className="h-4 w-px bg-slate-200" />
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>
                    {user.role === UserRole.PARENT ? "Parent Portal" : user.role === UserRole.FACULTY ? "Instructor Portal" : "Student Portal"}
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-800 capitalize font-bold">{currentView}</span>
                </h2>
              </div>

              {/* Toolbar Right tools */}
              <div className="flex items-center gap-3.5 relative">
                {/* Global Language Selector (Translation API) */}
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1 bg-white text-xs text-slate-700 shadow-3xs">
                  <span className="text-xs">🌐</span>
                  <select
                    value={globalLanguage}
                    onChange={(e) => setGlobalLanguage(e.target.value)}
                    className="bg-transparent border-none outline-none font-bold text-slate-800 text-[11px] cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                  </select>
                </div>

                {user.role === UserRole.STUDENT && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs text-amber-700 font-bold shadow-xs">
                    <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span>{user.streak} Day Streak</span>
                  </div>
                )}

                {/* Light/Dark Mode toggle button */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
                >
                  {theme === "light" ? (
                    <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                  ) : (
                    <Moon className="h-4.5 w-4.5 text-indigo-400 fill-indigo-400" />
                  )}
                </button>

                {/* Notifications Alert Dropdown trigger */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all relative bg-white"
                  >
                    <Bell className="h-4.5 w-4.5" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2.5 w-72 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-40 divide-y divide-slate-100">
                      <div className="p-3 flex justify-between items-center bg-slate-50">
                        <span className="text-xs font-bold text-slate-700">Live Alerts Desk</span>
                        <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-700">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                        {notifications.map((notif) => (
                          <div key={notif.id} className="p-3 hover:bg-slate-50 text-xs text-slate-600">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-800">{notif.title}</span>
                              {!notif.read && (
                                <button 
                                  onClick={() => markReadNotif(notif.id)}
                                  className="text-[9px] font-bold text-blue-600 hover:underline"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            <p className="text-slate-500 mt-1">{notif.message}</p>
                          </div>
                        ))}
                        {notifications.length === 0 && (
                          <p className="p-4 text-xs text-slate-400 italic text-center">Alerts dashboard is clear.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Main scrollable body view containers */}
            <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
              {renderActiveView()}
            </main>

            {/* Interactive site-wide AI Study Buddy */}
            <AIBuddy user={user} onActionClick={(viewId) => setCurrentView(viewId)} />
          </div>
        </>
      ) : (
        /* IMMERSIVE LANDING AND AUTHENTICATION PORTAL - eLEARNING STYLE */
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col relative select-none animate-fade-in">
          
          {/* 1. TOP INFORMATION BAR 📞 */}
          <div className="bg-[#091e42] text-slate-300 text-xs py-2 px-6 flex justify-between items-center border-b border-white/5 z-20">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Phone className="h-3.5 w-3.5 text-blue-400" />
                <span>+91 8668188435</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                <Mail className="h-3.5 w-3.5 text-blue-400" />
                <span><a href="mailto:edureach18@gmail.com" className="hover:text-white">edureach18@gmail.com</a></span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <a href="mailto:edureach18@gmail.com" className="hover:text-blue-400 transition-colors" title="Facebook - edureach18@gmail.com"><Facebook className="h-3.5 w-3.5" /></a>
              <a href="mailto:edureach18@gmail.com" className="hover:text-blue-400 transition-colors" title="Twitter - edureach18@gmail.com"><Twitter className="h-3.5 w-3.5" /></a>
              <a href="mailto:edureach18@gmail.com" className="hover:text-blue-400 transition-colors" title="LinkedIn - edureach18@gmail.com"><Linkedin className="h-3.5 w-3.5" /></a>
              <a href="mailto:edureach18@gmail.com" className="hover:text-blue-400 transition-colors" title="Instagram - edureach18@gmail.com"><Instagram className="h-3.5 w-3.5" /></a>
              <a href="mailto:edureach18@gmail.com" className="hover:text-blue-400 transition-colors" title="YouTube - edureach18@gmail.com"><Youtube className="h-3.5 w-3.5" /></a>
            </div>
          </div>

          {/* 2. WHITE HEADER NAVBAR 🌐 */}
          <header className="sticky top-0 bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center z-30 shadow-xs">
            {/* Logo Section */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
              <div className="bg-blue-600 text-white rounded-lg p-1.5 flex items-center justify-center shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h1 className="font-display font-black text-2xl tracking-tight text-blue-900">
                EDUREACH PRO
              </h1>
            </div>

            {/* Nav Menu Links */}
            <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-600">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 transition-all cursor-pointer">Home</button>
              <button 
                onClick={() => {
                  const el = document.getElementById("about-section");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="hover:text-blue-600 transition-all cursor-pointer"
              >
                About Us
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("courses-section");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="hover:text-blue-600 transition-all cursor-pointer"
              >
                Courses
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("instructors-section");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="hover:text-blue-600 transition-all cursor-pointer"
              >
                Instructors
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById("categories-section");
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-blue-600 transition-all cursor-pointer"
              >
                Careers
              </button>
            </nav>

            {/* Join Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsRegistering(true);
                setShowAuthModal(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all text-white text-xs font-bold font-mono uppercase tracking-widest rounded-lg shadow-md shadow-blue-600/15 cursor-pointer"
            >
              Join Us
            </button>
          </header>

          {/* 3. HERO SLIDER BANNER WITH GRADUATION GRAPHIC AND WAVY BOTTOM EDGE 🎓 */}
          <section className="relative min-h-[480px] md:min-h-[580px] flex items-center justify-center text-white px-6 md:px-12 py-20 overflow-hidden" style={{
            backgroundImage: `linear-gradient(to right, rgba(9, 30, 66, 0.94), rgba(26, 90, 219, 0.88)), url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}>
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay z-0" />
            
            <div className="max-w-4xl mx-auto text-center space-y-6 z-10 animate-slide-up">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white/10 text-blue-200 border border-white/20 uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300 fill-yellow-300 animate-pulse" /> Learn From Home
              </span>
              
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-none tracking-tight text-white drop-shadow-sm">
                Education Courses
              </h2>
              
              <p className="text-sm md:text-base text-slate-100 max-w-2xl mx-auto font-medium leading-relaxed">
                Empower your career with professional syllabus curricula, instant AI coding feedback, quiz matrices, and robust resume analyzers powered by Gemini.
              </p>

              {/* INTERACTIVE SEARCH CONSOLE WIDGET */}
              <div className="max-w-2xl mx-auto bg-white p-3.5 rounded-xl md:rounded-2xl shadow-2xl flex flex-col sm:flex-row items-stretch gap-2.5 border border-slate-100 text-slate-800">
                <div className="relative flex items-center min-w-[130px] border-b sm:border-b-0 sm:border-r border-slate-200 px-2">
                  <select 
                    value={searchCategory}
                    onChange={(e) => {
                      setSearchCategory(e.target.value);
                      setSelectedPreviewItem(null);
                    }}
                    className="w-full bg-transparent font-sans font-bold text-xs text-slate-700 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="courses">🎓 Courses</option>
                    <option value="quizzes">📝 Quizzes</option>
                    <option value="problems">💻 Problems</option>
                  </select>
                </div>

                <div className="flex-1 flex items-center px-2">
                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                  <input 
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setSelectedPreviewItem(null);
                    }}
                    placeholder={`Search by skill title, topic, or keyword...`}
                    className="w-full bg-transparent font-sans text-xs text-slate-700 px-2.5 py-2 focus:outline-none"
                  />
                  {searchKeyword && (
                    <button onClick={() => setSearchKeyword("")} className="text-slate-400 hover:text-slate-700">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (searchKeyword) {
                      const matched = getSearchResults();
                      if (matched.length > 0) {
                        setSelectedPreviewItem(matched[0]);
                      } else {
                        alert("No matches found. Try other keywords!");
                      }
                    } else {
                      alert("Please type a search keyword first!");
                    }
                  }}
                  className="px-6 py-3 bg-[#ff4f5a] hover:bg-[#ff3542] hover:scale-102 active:scale-98 transition-all text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#ff4f5a]/20"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Search</span>
                </button>
              </div>

              {/* LIVE SEARCH RESULTS DISPLAY (HIGH FIDELITY MICRO-INTERACTION) */}
              {searchKeyword && (
                <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/20 text-slate-800 text-left space-y-1.5 shadow-xl animate-fade-in max-h-48 overflow-y-auto z-20 relative">
                  <span className="text-[9px] font-mono font-black text-blue-600 uppercase tracking-widest px-2.5">
                    Live Registry Matches:
                  </span>
                  <div className="divide-y divide-slate-100">
                    {getSearchResults().map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedPreviewItem(item)}
                        className={`p-2.5 rounded-lg text-xs hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between ${
                          selectedPreviewItem?.title === item.title ? "bg-blue-50/80 border-l-2 border-blue-600 font-bold" : ""
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-sans font-bold text-slate-900 block">{item.title}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{item.description}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-blue-500 shrink-0" />
                      </div>
                    ))}
                    {getSearchResults().length === 0 && (
                      <p className="p-3 text-xs text-slate-500 italic text-center">No exact matches in catalog database. Try "arrays", "SQL", or "quantitative".</p>
                    )}
                  </div>
                </div>
              )}

              {/* SEARCH RESULT DETAIL PREVIEW PANEL */}
              {selectedPreviewItem && (
                <div className="max-w-2xl mx-auto bg-white border border-slate-100 p-5 rounded-xl shadow-2xl text-slate-800 text-left animate-fade-in space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-mono uppercase tracking-wider font-bold">
                      {searchCategory.toUpperCase()} Preview
                    </span>
                    <button onClick={() => setSelectedPreviewItem(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-950 font-sans">{selectedPreviewItem.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedPreviewItem.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400">Join to access complete workspace modules</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setIsRegistering(true); setShowAuthModal(true); }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase font-mono rounded transition-colors cursor-pointer"
                    >
                      Enroll & Solve Now
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BEAUTIFUL RAGGED TORN WAVE SHAPE MASK (RECREATING THEMEWAGON EXACT VISUAL EDGE) */}
            <div className="absolute bottom-0 left-0 right-0 overflow-hidden line-height-0 pointer-events-none select-none">
              <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="relative block w-full h-[40px] md:h-[65px] text-white fill-current">
                <path d="M0,32L24,37.3C48,43,96,53,144,48C192,43,240,21,288,26.7C336,32,384,64,432,69.3C480,75,528,53,576,42.7C624,32,672,32,720,42.7C768,53,816,75,864,80C912,85,960,75,1008,64C1056,53,1104,43,1152,48C1200,53,1248,75,1296,80C1344,85,1392,75,1416,69.3L1440,64L1440,120L1416,120C1392,120,1344,120,1296,120C1248,120,1200,120,1152,120C1104,120,1056,120,1008,120C960,120,912,120,864,120C816,120,768,120,720,120C672,120,624,120,576,120C528,120,480,120,432,120C384,120,336,120,288,120C240,120,192,120,144,120C96,120,48,120,24,120L0,120Z"></path>
              </svg>
            </div>
          </section>

          {/* 4. "ABOUT US" INTERACTIVE SECTION (EXACT RECREATION OF SCREENSHOT GRAPHICS) 📝 */}
          <section id="about-section" className="py-20 bg-white px-6 md:px-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column Graphic with overlay cap mockup */}
              <div className="lg:col-span-6 relative flex justify-center">
                <div className="relative max-w-md w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800" 
                    alt="Graduation Academic"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                  
                  {/* Decorative float badges */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-slate-200/50 shadow-lg flex items-center gap-3">
                    <div className="h-9 w-9 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-950 block">AI Accredited</span>
                      <span className="text-[10px] text-slate-500 block">Personalized Syllabi</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-4 bg-blue-600 text-white rounded-2xl p-4 shadow-xl hidden sm:block max-w-[150px] text-center border border-blue-400/20">
                  <span className="block text-2xl font-black font-display">100%</span>
                  <span className="text-[10px] font-bold text-blue-100 uppercase block tracking-wider mt-1">Simulated JWT Security Pass</span>
                </div>
              </div>

              {/* Right Column Typography content */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-xs font-bold text-[#ff4f5a] tracking-widest uppercase flex items-center gap-1">
                    ABOUT US <span className="text-slate-300">--- --- ---</span>
                  </span>
                  <h3 className="text-3xl md:text-4.5xl font-display font-black text-[#091e42] leading-tight mt-3">
                    First Choice For Online Education Anywhere
                  </h3>
                </div>

                <p className="text-sm text-slate-500 leading-relaxed">
                  EduReach Pro is a professional full-stack platform featuring custom personalized coursework syllabi, instant automated grader evaluations, anti-plagiarism guards, and interactive PDF resume analyzers. Empowering students with modern technologies.
                </p>

                {/* Bullet point grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Interactive Syllabus</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Structured modules in system design & backend.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">AI Plagiarism AutoGrader</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Submit code blocks for instant scoring feedback.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Gemini PDF Resume Extractor</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Drag-and-drop system PDFs to extract details.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3.5 w-3.5 text-emerald-600 font-bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Real-time Competition Arena</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Participate in global leaderboards live.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => { setIsRegistering(true); setShowAuthModal(true); }}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 hover:scale-103 transition-all text-white text-xs font-bold font-mono uppercase tracking-wider rounded-lg shadow-lg shadow-blue-600/15 cursor-pointer"
                  >
                    Get Started Now
                  </button>
                  <button 
                    onClick={() => {
                      const el = document.getElementById("courses-section");
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    View Course Registers
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* 5. POPULAR CATEGORIES SECTION 🌟 */}
          <section id="categories-section" className="py-20 bg-slate-50 px-6 md:px-12 border-t border-slate-100">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-xs font-bold text-[#ff4f5a] tracking-widest uppercase">
                  CAREER PATHS
                </span>
                <h3 className="text-3xl font-display font-black text-[#091e42]">
                  Explore Our Specialized Divisions
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Tackle highly targeted curriculum sets and test banks constructed to clear placement drives.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Cat 1 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 hover-lift-glow text-center space-y-4">
                  <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 font-sans">Coding & DSA Essentials</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Arrays, dynamic programming, and binary search trees.</p>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block hover:underline cursor-pointer" onClick={() => setShowAuthModal(true)}>Explore Div →</span>
                </div>

                {/* Cat 2 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 hover-lift-glow text-center space-y-4">
                  <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 font-sans">Quant & Aptitude</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Probability, permutations, and compound analytics.</p>
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block hover:underline cursor-pointer" onClick={() => setShowAuthModal(true)}>Explore Div →</span>
                </div>

                {/* Cat 3 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 hover-lift-glow text-center space-y-4">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Database className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 font-sans">System Design</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Horizontal scaling, message queues, and normalizations.</p>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block hover:underline cursor-pointer" onClick={() => setShowAuthModal(true)}>Explore Div →</span>
                </div>

                {/* Cat 4 */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 hover-lift-glow text-center space-y-4">
                  <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                    <Key className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 font-sans">Resume Resources</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">PDF uploaders, ATS checkers, and Star interview prep.</p>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block hover:underline cursor-pointer" onClick={() => setShowAuthModal(true)}>Explore Div →</span>
                </div>

              </div>
            </div>
          </section>

          {/* 6. POPULAR COURSES PREVIEW SECTION 🏆 */}
          <section id="courses-section" className="py-20 bg-white px-6 md:px-12">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-xs font-bold text-[#ff4f5a] tracking-widest uppercase">
                  POPULAR COURSES
                </span>
                <h3 className="text-3xl font-display font-black text-[#091e42]">
                  Featured Student Course registries
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Pick a structured course to enroll. Clicking a card will let you explore details or log in.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Course 1 */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl overflow-hidden hover-lift-glow flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 font-bold text-blue-600 uppercase">
                        <Award className="h-3 w-3" /> Core Track
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 12 Weeks
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#091e42] leading-tight">Advanced Data Structures & Algorithms</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Master sliding window arrays, linked lists, graphs, Dijkstra pathing, and segment trees.</p>
                    
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/50">
                      <div className="flex text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">(4.9 rating)</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">Dr. Sarah Jenkins</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowAuthModal(true); }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-[9px] uppercase tracking-wider rounded cursor-pointer"
                    >
                      Join Course
                    </button>
                  </div>
                </div>

                {/* Course 2 */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl overflow-hidden hover-lift-glow flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 font-bold text-blue-600 uppercase">
                        <Award className="h-3 w-3" /> Technical Division
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 8 Weeks
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#091e42] leading-tight">High-Level System Design Architectures</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">Horizontal and vertical scaling, Microservices patterns, database sharding, normalizations, and Kafka messaging.</p>
                    
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/50">
                      <div className="flex text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">(4.8 rating)</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">Prof. Alan Turing</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowAuthModal(true); }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono text-[9px] uppercase tracking-wider rounded cursor-pointer"
                    >
                      Join Course
                    </button>
                  </div>
                </div>

                {/* Course 3 */}
                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl overflow-hidden hover-lift-glow flex flex-col justify-between">
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 font-bold text-blue-600 uppercase">
                        <Award className="h-3 w-3" /> Career Prep
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 4 Weeks
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#091e42] leading-tight">Professional Resume & Placement Engineering</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">ATS optimizations, self-presentation case studies, STAR method techniques, and live resume PDF extractions.</p>
                    
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/50">
                      <div className="flex text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">(5.0 rating)</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900">Alex Johnson</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setShowAuthModal(true); }}
                      className="px-3.5 py-1.5 bg-[#06BBCC] hover:bg-[#05a5b5] text-white font-bold font-mono text-[9px] uppercase tracking-wider rounded cursor-pointer"
                    >
                      Join Course
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 6.5. MEET OUR INSTRUCTORS (EXACT RECREATION OF THEMEWAGON INSTRUCTORS LIST WITH OVERLAY HOVER POP EFFECTS) */}
          <section id="instructors-section" className="py-20 bg-slate-50 px-6 md:px-12 border-t border-slate-100">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="text-center space-y-3">
                <span className="text-xs font-bold text-[#ff4f5a] tracking-widest uppercase">
                  INSTRUCTORS
                </span>
                <h3 className="text-3xl font-display font-black text-[#091e42]">
                  Meet Our Expert Faculty Members
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Learn from top-tier computer scientists, award-winning lecturers, and industry recruitment specialists.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Instructor 1 */}
                <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  {/* Image container with zoom & overlay */}
                  <div className="relative overflow-hidden aspect-[4/5] bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400" 
                      alt="Dr. Sarah Jenkins"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    {/* Social Hover Overlay - slides up from bottom */}
                    <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-full flex items-center justify-center shadow-md transition-colors"><Facebook className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-400 hover:text-white text-blue-400 rounded-full flex items-center justify-center shadow-md transition-colors"><Twitter className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-[#06BBCC] hover:text-white text-[#06BBCC] rounded-full flex items-center justify-center shadow-md transition-colors"><Linkedin className="h-4 w-4" /></a>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-sm font-black text-[#091e42]">Dr. Sarah Jenkins</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Lead Algorithmist & DSA Chair</p>
                  </div>
                </div>

                {/* Instructor 2 */}
                <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/5] bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400" 
                      alt="Prof. Alan Turing"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-full flex items-center justify-center shadow-md transition-colors"><Facebook className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-400 hover:text-white text-blue-400 rounded-full flex items-center justify-center shadow-md transition-colors"><Twitter className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-[#06BBCC] hover:text-white text-[#06BBCC] rounded-full flex items-center justify-center shadow-md transition-colors"><Linkedin className="h-4 w-4" /></a>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-sm font-black text-[#091e42]">Prof. Alan Turing</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Systems Architect Researcher</p>
                  </div>
                </div>

                {/* Instructor 3 */}
                <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/5] bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400" 
                      alt="Alex Johnson"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-full flex items-center justify-center shadow-md transition-colors"><Facebook className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-400 hover:text-white text-blue-400 rounded-full flex items-center justify-center shadow-md transition-colors"><Twitter className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-[#06BBCC] hover:text-white text-[#06BBCC] rounded-full flex items-center justify-center shadow-md transition-colors"><Linkedin className="h-4 w-4" /></a>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-sm font-black text-[#091e42]">Alex Johnson</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Placement & Interview Consultant</p>
                  </div>
                </div>

                {/* Instructor 4 */}
                <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative overflow-hidden aspect-[4/5] bg-slate-100">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400" 
                      alt="Elena Rostova"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-blue-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-600 hover:text-white text-blue-600 rounded-full flex items-center justify-center shadow-md transition-colors"><Facebook className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-blue-400 hover:text-white text-blue-400 rounded-full flex items-center justify-center shadow-md transition-colors"><Twitter className="h-4 w-4" /></a>
                      <a href="#" className="h-8 w-8 bg-white hover:bg-[#06BBCC] hover:text-white text-[#06BBCC] rounded-full flex items-center justify-center shadow-md transition-colors"><Linkedin className="h-4 w-4" /></a>
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <h4 className="text-sm font-black text-[#091e42]">Elena Rostova</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Applied Machine Learning Expert</p>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 7. SECURE AUTHENTICATION MODAL DIALOG WITH FAST-PASS DEMO KEYS 🔑 */}
          {/* Modal has been moved to root level below */}

          {/* 8. FOOTER BANNER 📡 */}
          <footer className="mt-auto bg-[#091e42] text-slate-400 py-12 px-6 md:px-12 border-t border-slate-800">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-blue-600 text-white rounded-lg p-1">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-display font-black text-lg text-white">EDUREACH PRO</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  The primary workspace division for simulated placement drives, automated assessment scoring, and Gemini-based resume parsing.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">Quick Links</h4>
                <ul className="text-[11px] space-y-2">
                  <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
                  <li><button onClick={() => {
                    const el = document.getElementById("about-section");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
                  <li><button onClick={() => {
                    const el = document.getElementById("courses-section");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} className="hover:text-white transition-colors cursor-pointer">Courses</button></li>
                  <li><button onClick={() => setShowAuthModal(true)} className="hover:text-white transition-colors cursor-pointer">Enrollment</button></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">Interactive Modules</h4>
                <ul className="text-[11px] space-y-2">
                  <li><span className="hover:text-white transition-colors cursor-pointer" onClick={() => setShowAuthModal(true)}>Coding Problems</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer" onClick={() => setShowAuthModal(true)}>Aptitude Assessments</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer" onClick={() => setShowAuthModal(true)}>Resume Analysis Report</span></li>
                  <li><span className="hover:text-white transition-colors cursor-pointer" onClick={() => setShowAuthModal(true)}>Study outlines & Flashcards</span></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">Newsletter</h4>
                <p className="text-[11px]">Join our newsletter to stay updated on simulated placement tests.</p>
                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 items-center">
                  <input type="email" placeholder="Email Address" className="bg-transparent text-[11px] text-slate-300 focus:outline-none px-2 w-full" />
                  <button onClick={() => alert("Successfully Subscribed!")} className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded cursor-pointer">SignUp</button>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto pt-8 mt-8 border-t border-slate-800 text-center text-[10px] space-y-2">
              <p>© {new Date().getFullYear()} EduReach Pro Educational Suite. Powered by Gemini Generative Architectures & simulated JWT tokens.</p>
              <div className="flex justify-center gap-4 text-slate-500">
                <a href="#" className="hover:text-slate-300">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-300">Terms of Use</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-300">Sitemap</a>
              </div>
            </div>
          </footer>

          {/* Floating AI Chatbot Widget */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isChatOpen ? (
              <div className="w-80 h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up mb-4 text-slate-800 dark:text-slate-200 font-sans">
                {/* Header */}
                <div className="bg-[#1e62ec] text-white p-4 flex justify-between items-center shadow-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-yellow-300 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-black leading-none font-display">Support AI Assistant</h4>
                      <span className="text-[9px] text-blue-100/80 font-mono mt-0.5 block">EduReach virtual helper</span>
                    </div>
                  </div>
                  <button type="button" onClick={(e) => { e.preventDefault(); setIsChatOpen(false); }} className="text-white hover:text-red-200 cursor-pointer bg-transparent border-none">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Messages Box */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                  {chatbotMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-[#1e62ec] text-white rounded-tr-none font-medium" 
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-750 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-slate-400 mt-1 px-1 font-mono">{msg.time}</span>
                    </div>
                  ))}
                  {chatbotLoading && (
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono px-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span>AI is formulating...</span>
                    </div>
                  )}
                </div>
                 {/* Input Area */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSendChatbotMessage();
                  }}
                  className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 items-center"
                >
                  <input
                    type="text"
                    value={chatbotInput}
                    onChange={(e) => setChatbotInput(e.target.value)}
                    placeholder="Type support query..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200"
                  />
                  <button 
                    type="submit"
                    disabled={chatbotLoading || !chatbotInput.trim()}
                    className="h-8 w-8 bg-[#1e62ec] hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : null}

            {/* Bubble Button */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setIsChatOpen(!isChatOpen); }}
              className="h-12 w-12 bg-[#1e62ec] hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-108 transition-all relative border border-white/10 cursor-pointer"
              title="Support Chatbot Assistant"
            >
              {isChatOpen ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />}
              {!isChatOpen && chatbotMessages.length <= 1 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center animate-bounce">1</span>
              )}
            </button>
          </div>

        </div>
      )}
      {showAuthModal && (
        <div className="fixed inset-0 bg-[#091e42]/80 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl relative text-slate-850 dark:text-slate-200 max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1 pb-4 border-b border-slate-100">
              <div className="inline-flex h-10 w-10 bg-blue-100 text-blue-600 rounded-xl items-center justify-center mb-1.5 shadow-xs">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 font-sans">
                {isRegistering ? "Create Your Academic Profile" : "Secure Portal Sign In"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isRegistering ? "Deploy custom email profiles with simulated JWT tokens." : "Select an instant fast-pass role key for immediate full-stack entry."}
              </p>
            </div>

            {/* Authentication input form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (isRegistering) {
                  await handleRegister(e);
                } else {
                  await handleLogin(e);
                }
                setShowAuthModal(false);
              }} 
              className="space-y-4 pt-4"
            >
              {isRegistering && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Display Name</label>
                  <input 
                    type="text" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Email Address</label>
                <input 
                  type="email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  placeholder="student@edureach.ai"
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Institutional Role</label>
                <select
                  value={authRole}
                  onChange={(e) => setAuthRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-500 rounded-lg px-3 py-2.5 text-xs text-slate-800 cursor-pointer"
                >
                  <option value={UserRole.STUDENT}>Student Profile (Default)</option>
                  <option value={UserRole.FACULTY}>Faculty Profile</option>
                  <option value={UserRole.ADMIN}>System Administrator</option>
                  <option value={UserRole.PARENT}>Parent Profile</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-blue-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>{isRegistering ? "Deploy Profile" : "Secure JWT Sign In"}</span>
              </button>
            </form>

            <div className="flex justify-between items-center text-[11px] pt-3">
              <button 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-blue-600 hover:underline font-bold"
              >
                {isRegistering ? "Already have account? Sign In" : "Register custom profile"}
              </button>
            </div>

            {/* FAST PASS BUTTONS - CRITICAL FOR ASSESSMENTS */}
            <div className="space-y-2 pt-5 mt-5 border-t border-slate-100">
              <span className="text-[10px] uppercase font-mono font-black text-slate-400 block tracking-widest text-center">Fast-Pass Demo Keys (1-Click)</span>
              <div className="grid grid-cols-1 gap-2">
                
                <button
                  id="btn-demo-student"
                  onClick={async () => {
                    await handleQuickLogin("student@edureach.ai", UserRole.STUDENT);
                    setShowAuthModal(false);
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Student Profile
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-blue-500" />
                </button>

                <button
                  id="btn-demo-faculty"
                  onClick={async () => {
                    await handleQuickLogin("faculty@edureach.ai", UserRole.FACULTY);
                    setShowAuthModal(false);
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Faculty Profile
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-purple-500" />
                </button>

                <button
                  id="btn-demo-admin"
                  onClick={async () => {
                    await handleQuickLogin("admin@edureach.ai", UserRole.ADMIN);
                    setShowAuthModal(false);
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Administrator Profile
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-emerald-500" />
                </button>

                <button
                  id="btn-demo-parent"
                  onClick={async () => {
                    await handleQuickLogin("parent@edureach.ai", UserRole.PARENT);
                    setShowAuthModal(false);
                  }}
                  className="px-4 py-2 bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500" /> Parent Profile
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-orange-500" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
