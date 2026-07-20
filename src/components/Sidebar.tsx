import React from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  Cpu, 
  Code2, 
  ClipboardCheck, 
  FileText, 
  BookOpenCheck,
  LogOut,
  Sparkles,
  Users,
  Trophy,
  User,
  TrendingUp,
  Briefcase,
  MessageSquare,
  Database
} from "lucide-react";
import { UserProfile, UserRole } from "../types";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, user, onLogout }: SidebarProps) {
  if (!user) return null;

  const menuItems = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN, UserRole.PARENT] },
    { id: "tutor", label: "AI Services", icon: Cpu, roles: [UserRole.STUDENT] },
    { id: "coding_mentor", label: "AI Coding Mentor", icon: Code2, roles: [UserRole.STUDENT] },
    { id: "interviews", label: "AI Interview Coach", icon: Briefcase, roles: [UserRole.STUDENT] },
    { id: "courses", label: "My Courses", icon: BookOpen, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN] },
    { id: "notes", label: "Assignments", icon: ClipboardCheck, roles: [UserRole.STUDENT] },
    { id: "quizzes", label: "Quizzes", icon: BookOpenCheck, roles: [UserRole.STUDENT, UserRole.FACULTY] },
    { id: "competitions", label: "Competitions", icon: Trophy, roles: [UserRole.STUDENT] },
    { id: "practice", label: "Problem Hub", icon: Code2, roles: [UserRole.STUDENT] },
    { id: "placement", label: "Placement Hub", icon: Briefcase, roles: [UserRole.STUDENT] },
    { id: "resume", label: "Resources", icon: FileText, roles: [UserRole.STUDENT] },
    { id: "support_chat", label: "Support Chatbot", icon: MessageSquare, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN, UserRole.PARENT] },
    { id: "study_rooms", label: "Study Rooms", icon: Users, roles: [UserRole.STUDENT] },
    { id: "leaderboard", label: "Progress", icon: TrendingUp, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN, UserRole.PARENT] },
    { id: "digital_twin", label: "Industrial Twin", icon: Database, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN] },
    { id: "profile", label: "Profile", icon: User, roles: [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN, UserRole.PARENT] },
  ];

  const adminItems = [
    { id: "admin", label: "Admin Panel", icon: Users, roles: [UserRole.ADMIN] }
  ];

  const filteredMenu = [...menuItems, ...adminItems].filter(item => item.roles.includes(user.role));

  return (
    <aside id="app-sidebar" className="w-64 bg-[#1e62ec] flex flex-col text-white shadow-lg select-none">
      {/* Brand Header */}
      <div 
        onClick={() => onViewChange("dashboard")}
        className="p-6 border-b border-white/10 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
        title="Go to Home Dashboard"
      >
        <div className="bg-white text-[#1e62ec] font-black text-xl h-9 w-9 rounded-lg flex items-center justify-center shadow-md">
          E
        </div>
        <div>
          <h1 className="font-sans font-extrabold text-lg leading-none tracking-tight text-white">EduReach Pro</h1>
          <span className="text-[10px] text-blue-100/70 font-mono">Personalized AI Academy</span>
        </div>
      </div>

      {/* Category Header */}
      <div className="px-6 pt-5 pb-2">
        <span className="text-[10px] uppercase font-bold text-blue-100/60 tracking-wider block">
          {user.role === UserRole.PARENT ? "Parent Portal" : user.role === UserRole.FACULTY ? "Instructor Portal" : "Student Portal"}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 group ${
                isActive
                  ? "bg-white/15 text-white border-l-4 border-white pl-2.5"
                  : "text-blue-100/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-colors ${
                isActive ? "text-white" : "text-blue-100/75 group-hover:text-white"
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Widget & Sign Out */}
      <div className="p-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs uppercase border border-white/30">
            {user.name.substring(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white leading-none">{user.name}</p>
            <span className="text-[9px] uppercase font-mono tracking-wide text-blue-100/70">
              {user.role} profile
            </span>
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-blue-100 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out Portal</span>
        </button>
      </div>
    </aside>
  );
}
