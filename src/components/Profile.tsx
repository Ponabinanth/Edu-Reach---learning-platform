import React, { useState } from "react";
import { 
  User, 
  Sparkles, 
  Flame, 
  Trophy, 
  BookOpen, 
  Settings, 
  Save, 
  GraduationCap, 
  Shield, 
  Clock, 
  TrendingUp, 
  Briefcase,
  AlertCircle
} from "lucide-react";
import { UserProfile, UserRole } from "../types";
import { api } from "../api";

interface ProfileProps {
  user: UserProfile;
  onProfileUpdate: (updatedUser: UserProfile) => void;
}

export default function Profile({ user, onProfileUpdate }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [goalRole, setGoalRole] = useState(localStorage.getItem("profile_goal_role") || "Software Engineer");
  const [bio, setBio] = useState(localStorage.getItem("profile_bio") || "Passionate learner aiming to master computer science and machine learning concepts. Dedicated to building scalable systems and using generative AI to solve real-world problems.");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Calculate leveling progress (Level 1-10 progression based on XP)
  const xpForCurrentLevel = (user.level - 1) * 500;
  const xpForNextLevel = user.level * 500;
  const progressPercent = Math.min(
    Math.max(Math.round(((user.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100), 0),
    100
  );

  // Gamified badge collection library with detailed hover metadata
  const badgeLibrary = [
    { id: "Fast Learner", label: "Fast Learner", description: "Completed 3 course chapters in under 24 hours.", icon: "⚡", color: "from-amber-500 to-yellow-400" },
    { id: "Quiz Whiz", label: "Quiz Whiz", description: "Scored 100% on any standard syllabus assessment.", icon: "🧠", color: "from-blue-500 to-cyan-400" },
    { id: "Code Warrior", label: "Code Warrior", description: "Successfully passed 5 standard practice sandbox cases.", icon: "⚔️", color: "from-rose-500 to-red-400" },
    { id: "AI Enthusiast", label: "AI Enthusiast", description: "Asked the contextual AI Study Tutor more than 10 doubts.", icon: "🔮", color: "from-purple-500 to-indigo-400" },
    { id: "Interview Elite", label: "Interview Elite", description: "Achieved an overall score of 85%+ in AI Mock Interviews.", icon: "🎙️", color: "from-teal-500 to-emerald-400" },
    { id: "Streak Master", label: "Streak Master", description: "Maintained a continuous daily study streak of 5+ days.", icon: "🔥", color: "from-orange-500 to-red-500" }
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      // Update local storage configurations for demo purposes, alongside memory sync
      localStorage.setItem("profile_goal_role", goalRole);
      localStorage.setItem("profile_bio", bio);
      
      const updatedUser: UserProfile = {
        ...user,
        name: name,
        email: email,
      };
      
      // Update state in App.tsx
      onProfileUpdate(updatedUser);
      
      setSuccessMsg("Profile metrics persisted successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 border border-slate-100 p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-xl ring-4 ring-blue-100/60">
              {user.name.substring(0, 2)}
            </div>
            {user.role === UserRole.STUDENT && (
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full text-xs font-bold leading-none shadow border border-white">
                ★
              </div>
            )}
          </div>

          <div className="text-center md:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-sans">{user.name}</h2>
              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase bg-blue-50 text-blue-700 border border-blue-100">
                {user.role}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-bold">{user.email}</p>
            <p className="text-blue-600 text-xs font-bold flex items-center justify-center md:justify-start gap-1">
              <Briefcase className="h-3.5 w-3.5 text-blue-500" />
              <span>Target Career Role: {goalRole}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Settings className="h-3.5 w-3.5 text-slate-500" />
          <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Stats Column */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Level & Mastery Stats</h3>
          
          {/* Level Progress Card */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Tier</span>
                <h4 className="text-lg font-black text-slate-800 font-sans">Level {user.level}</h4>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-50/50 border border-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                {user.xp} XP
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Progress</span>
                <span>{progressPercent}% ({user.xp % 500} / 500 XP)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                Awarded for completing quizzes, sandboxes, and submitting active academic coursework assignments. Next level unlocks advanced AI-powered career maps!
              </p>
            </div>
          </div>

          {/* Core Gamified Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-xl text-center space-y-1 shadow-xs">
              <Flame className="h-5 w-5 text-orange-500 fill-orange-500 mx-auto" />
              <span className="block text-2xl font-black text-slate-850">{user.streak}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Day Streak</span>
            </div>
            
            <div className="bg-white border border-slate-100 p-4 rounded-xl text-center space-y-1 shadow-xs">
              <Trophy className="h-5 w-5 text-blue-600 mx-auto" />
              <span className="block text-2xl font-black text-slate-850">
                {user.badges ? user.badges.length : 0}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Badges Earned</span>
            </div>
          </div>

          {/* About & Bio Info Card */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-700 font-sans">Student Biography</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{bio}</p>
          </div>
        </div>

        {/* Right Info and Sliders/Inputs Columns */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            /* Editing Profile Form Pane */
            <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl space-y-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 font-sans flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <span>Configure Profile Settings</span>
              </h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Goal Career Role Target</label>
                  <input
                    type="text"
                    value={goalRole}
                    onChange={(e) => setGoalRole(e.target.value)}
                    placeholder="e.g. Google Backend Engineer"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Bio Description</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 resize-none font-medium"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{saving ? "Saving..." : "Save Settings"}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Stats Display & Badges Pane */
            <div className="space-y-6">
              {/* Skill Scorecard */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dynamic Skill Scorecard</h3>
                
                <div className="bg-white border border-slate-100 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xs">
                  {Object.entries(user.skills || { "Algorithms": 60, "Backend": 70, "React": 80, "System Design": 55 }).map(([skill, score]) => (
                    <div key={skill} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{skill}</span>
                        <span className="text-blue-600">{score} / 100</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gamified Badges Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unlocked Gamified Achievements</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {badgeLibrary.map((badge) => {
                    const isUnlocked = user.badges?.includes(badge.id) || user.badges?.includes(badge.label);
                    return (
                      <div 
                        key={badge.id}
                        className={`p-4 rounded-xl border relative overflow-hidden transition-all flex items-start gap-3 shadow-xs ${
                          isUnlocked 
                            ? "bg-white border-blue-200/50 hover:border-blue-300 shadow-sm" 
                            : "bg-slate-50/50 border-slate-100 opacity-50 grayscale"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-inner ${
                          isUnlocked ? `bg-gradient-to-br ${badge.color} text-white` : "bg-slate-200 text-slate-450"
                        }`}>
                          {badge.icon}
                        </div>
                        
                        <div className="space-y-0.5 min-w-0">
                          <h4 className={`text-xs font-bold leading-tight truncate ${isUnlocked ? "text-slate-800" : "text-slate-400"}`}>
                            {badge.label}
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-snug">{badge.description}</p>
                          <span className={`inline-block text-[9px] font-bold px-1 py-0.5 rounded ${
                            isUnlocked ? "bg-blue-50 text-blue-700 border border-blue-100/50" : "bg-slate-100 text-slate-400 border border-slate-200/50"
                          }`}>
                            {isUnlocked ? "UNLOCKED" : "LOCKED"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
