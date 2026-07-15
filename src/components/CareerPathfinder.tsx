import React, { useState } from "react";
import { Compass, Sparkles, RefreshCw, ChevronRight, BookOpen } from "lucide-react";
import { api } from "../api";

export default function CareerPathfinder() {
  const [goalRole, setGoalRole] = useState("Java Backend Developer");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any | null>(null);

  const rolesList = [
    "Java Backend Developer",
    "Full-Stack Web Architect",
    "DevOps Systems Engineer",
    "AI / Deep Learning Researcher",
    "Data Infrastructure Engineer"
  ];

  const handleGetRoadmap = async () => {
    setLoading(true);
    setRecommendation(null);
    try {
      const response = await api.recommendCareer(goalRole);
      setRecommendation(response.recommendation);
    } catch (err) {
      alert("Error generating career guidance: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white font-sans">Career Pathfinder & Roadmap Generator</h2>
        <p className="text-xs text-slate-400 mt-1">Select your dream professional goal, and let AI synthesize step-by-step milestones, recommended projects, industry certification guides, and relevant courses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left selector */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white font-sans font-medium">Select Career Objective</h3>
          
          <div className="space-y-2">
            {rolesList.map((roleOpt) => (
              <button
                key={roleOpt}
                id={`btn-path-role-${roleOpt.replace(/\s+/g, "-")}`}
                onClick={() => setGoalRole(roleOpt)}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                  goalRole === roleOpt 
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                    : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                {roleOpt}
              </button>
            ))}
          </div>

          <button
            onClick={handleGetRoadmap}
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            )}
            <span>Synthesize Career Roadmap</span>
          </button>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center py-24 space-y-4">
              <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-500">Retrieving standard curriculum benchmarks & certified syllabi...</p>
            </div>
          ) : recommendation ? (
            <div className="space-y-6 animate-fade-in">
              {/* Learning path milestones */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Milestone Roadmap</h3>
                
                <div className="relative border-l-2 border-slate-800 ml-3 space-y-6 pt-1">
                  {recommendation.roadmap?.map((step: string, i: number) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute -left-1.5 top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-900" />
                      <span className="block text-[10px] text-slate-500 font-mono">Phase {i + 1}</span>
                      <span className="text-xs font-medium text-slate-200 mt-0.5 block">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications and Projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wide block">Industry Certifications</span>
                  <ul className="space-y-2 text-xs">
                    {recommendation.certifications?.map((cert: string, idx: number) => (
                      <li key={idx} className="text-slate-300 leading-relaxed font-sans list-disc list-inside">
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wide block">Recommended Portfolio Projects</span>
                  <ul className="space-y-2 text-xs">
                    {recommendation.projects?.map((proj: string, idx: number) => (
                      <li key={idx} className="text-slate-300 leading-relaxed font-sans list-disc list-inside">
                        {proj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center py-24 text-slate-500">
              <Compass className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-400">Roadmap Idle</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">Select a career objective on the left and run synthesis to visualize dynamic educational roadmaps.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
