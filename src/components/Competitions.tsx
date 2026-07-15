import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Award, 
  Clock, 
  Users, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  Play, 
  CheckCircle, 
  HelpCircle,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { UserProfile } from "../types";
import { api } from "../api";

interface CompetitionsProps {
  user: UserProfile;
}

interface CompetitionChallenge {
  id: string;
  title: string;
  description: string;
  timeLeft: string;
  durationMinutes: number;
  participantsCount: number;
  status: "active" | "upcoming" | "completed";
  prize: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }[];
  leaderboard: {
    studentName: string;
    score: number;
    completionTime: string;
    xpEarned: number;
  }[];
}

export default function Competitions({ user }: CompetitionsProps) {
  const [competitions, setCompetitions] = useState<CompetitionChallenge[]>([]);
  const [selectedComp, setSelectedComp] = useState<CompetitionChallenge | null>(null);
  
  // Game states
  const [isCompActive, setIsCompActive] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [timerSecs, setTimerSecs] = useState(600);
  
  // Submission result states
  const [compScore, setCompScore] = useState<number | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Sync / Load default competitions list
  useEffect(() => {
    // We pre-load high-engagement live global events
    const defaultCompetitions: CompetitionChallenge[] = [
      {
        id: "comp_1",
        title: "Weekly Generative AI & Prompt Mastery Sprint",
        description: "Compete globally to design the most context-efficient prompt templates for multi-step reasoning. Tests advanced generative knowledge, chain of thought methods, and alignment guardrails.",
        timeLeft: "1d 14h",
        durationMinutes: 10,
        participantsCount: 42,
        status: "active",
        prize: "1000 XP + 'AI Enthusiast' Legendary Profile Badge",
        questions: [
          {
            id: "cp1_1",
            question: "In standard Prompt Engineering, which technique relies on asking the GenAI model to write out its internal reasoning steps before outputting the final response?",
            options: [
              "Zero-Shot Prompting",
              "Chain of Thought (CoT) Prompting",
              "Few-Shot Mimicry",
              "Context Splicing"
            ],
            correctOptionIndex: 1,
            explanation: "Chain of Thought (CoT) prompting explicitly guides the model to output intermediate reasoning steps, improving accuracy on complex logic tasks."
          },
          {
            id: "cp1_2",
            question: "Which parameters are utilized to control the randomness and deterministic properties of Gemini text completion responses?",
            options: [
              "Token Window and Frequency Penalty",
              "Learning Rate and Batch Density",
              "Temperature and Top-P",
              "Max Output tokens and Embedding Weights"
            ],
            correctOptionIndex: 2,
            explanation: "Temperature and Top-P (nucleus sampling) directly control cumulative probability and distribution sharpness, determining response creativity/randomness."
          },
          {
            id: "cp1_3",
            question: "What does standard 'RAG' stand for in contextually-grounded AI assistant pipelines?",
            options: [
              "Recurrent Alignment Generator",
              "Refined Adaptive Grading",
              "Retrieval-Augmented Generation",
              "Randomized Attribute Graphing"
            ],
            correctOptionIndex: 2,
            explanation: "Retrieval-Augmented Generation (RAG) retrieves external document indices, attaching them to the prompt context to ground model generations in factual sources."
          }
        ],
        leaderboard: [
          { studentName: "Priyanjali Sen", score: 100, completionTime: "2m 15s", xpEarned: 1000 },
          { studentName: "David Vance", score: 100, completionTime: "3m 04s", xpEarned: 850 },
          { studentName: "Siddharth Roy", score: 67, completionTime: "1m 58s", xpEarned: 500 },
          { studentName: "Maya Lin", score: 67, completionTime: "2m 45s", xpEarned: 450 }
        ]
      },
      {
        id: "comp_2",
        title: "The Ultimate DSA Stack & Tree Tuning Challenge",
        description: "Put your algorithmic speed and structural optimization to the test! Solve complex tree traversal and dynamic memory stack questions against a ticking timer.",
        timeLeft: "5h 12m",
        durationMinutes: 8,
        participantsCount: 89,
        status: "active",
        prize: "800 XP + 'Code Warrior' High-Grade Badge",
        questions: [
          {
            id: "cp2_1",
            question: "What is the worst-case space complexity of a Depth-First Search (DFS) traversal on an arbitrary tree with height H?",
            options: [
              "O(1)",
              "O(log H)",
              "O(H)",
              "O(V + E)"
            ],
            correctOptionIndex: 2,
            explanation: "The call stack or explicit stack stores at most the path from root to the deepest leaf node. Hence, the worst-case space complexity is O(H)."
          },
          {
            id: "cp2_2",
            question: "Which tree traversal strategy processes nodes in the exact order: Left Subtree, Right Subtree, Root?",
            options: [
              "Pre-order Traversal",
              "In-order Traversal",
              "Post-order Traversal",
              "Breadth-First Level-Order"
            ],
            correctOptionIndex: 2,
            explanation: "Post-order traversal visits children first, processing the root node last: Left, Right, Root."
          },
          {
            id: "cp2_3",
            question: "Which sorting algorithm is guaranteed to execute with a worst-case time complexity of O(N log N)?",
            options: [
              "Quick Sort",
              "Bubble Sort",
              "Insertion Sort",
              "Merge Sort"
            ],
            correctOptionIndex: 3,
            explanation: "Merge Sort consistently divides arrays into halves and merges them, guaranteeing O(N log N) in best, average, and worst-case conditions."
          }
        ],
        leaderboard: [
          { studentName: "Ananya Sharma", score: 100, completionTime: "1m 40s", xpEarned: 800 },
          { studentName: "Vikram Malhotra", score: 100, completionTime: "2m 11s", xpEarned: 700 },
          { studentName: "Zoe Kravitz", score: 100, completionTime: "3m 30s", xpEarned: 650 },
          { studentName: "Chris Evans", score: 67, completionTime: "2m 15s", xpEarned: 400 }
        ]
      },
      {
        id: "comp_3",
        title: "Docker & Kubernetes Deployment Architecture Hack",
        description: "A deep dive into Dockerfiles, container isolation networks, multi-stage microservice builds, and Kubernetes ingress controllers. Perfect for DevOps and cloud aspiring leads.",
        timeLeft: "Starts tomorrow",
        durationMinutes: 15,
        participantsCount: 154,
        status: "upcoming",
        prize: "1200 XP + Golden Cloud Deployment Badge",
        questions: [],
        leaderboard: []
      }
    ];

    // Read custom competitions state if stored locally
    const cached = localStorage.getItem("edu_competitions");
    if (cached) {
      try {
        setCompetitions(JSON.parse(cached));
      } catch {
        setCompetitions(defaultCompetitions);
      }
    } else {
      setCompetitions(defaultCompetitions);
      localStorage.setItem("edu_competitions", JSON.stringify(defaultCompetitions));
    }
  }, []);

  // Timer loop
  useEffect(() => {
    let interval: any;
    if (isCompActive && timerSecs > 0) {
      interval = setInterval(() => {
        setTimerSecs((prev) => prev - 1);
      }, 1000);
    } else if (timerSecs === 0 && isCompActive) {
      handleFinishComp();
    }
    return () => clearInterval(interval);
  }, [isCompActive, timerSecs]);

  const handleStartComp = (comp: CompetitionChallenge) => {
    setSelectedComp(comp);
    setActiveQuestionIdx(0);
    setSelectedAnswers({});
    setTimerSecs(comp.durationMinutes * 60);
    setIsCompActive(true);
    setCompScore(null);
    setXpEarned(0);
  };

  const handleSelectOption = (qId: string, idx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [qId]: idx
    });
  };

  const handleFinishComp = () => {
    if (!selectedComp) return;
    setIsCompActive(false);
    setSubmitting(true);

    setTimeout(() => {
      // Calculate score
      let correct = 0;
      selectedComp.questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctOptionIndex) {
          correct++;
        }
      });
      const finalScore = Math.round((correct / selectedComp.questions.length) * 100);
      const secondsUsed = selectedComp.durationMinutes * 60 - timerSecs;
      const minsStr = Math.floor(secondsUsed / 60);
      const secsStr = secondsUsed % 60;
      const timeStr = `${minsStr}m ${secsStr < 10 ? '0' : ''}${secsStr}s`;
      
      const earnedXp = Math.round((finalScore / 100) * 800) + 100; // base reward
      setCompScore(finalScore);
      setXpEarned(earnedXp);

      // Dynamically add student's score to local leaderboard and persist
      const newLeaderboardEntry = {
        studentName: user.name,
        score: finalScore,
        completionTime: timeStr,
        xpEarned: earnedXp
      };

      const updatedCompetitions = competitions.map((c) => {
        if (c.id === selectedComp.id) {
          const combined = [...c.leaderboard, newLeaderboardEntry].sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.completionTime.localeCompare(b.completionTime);
          });
          return {
            ...c,
            participantsCount: c.participantsCount + 1,
            leaderboard: combined
          };
        }
        return c;
      });

      setCompetitions(updatedCompetitions);
      localStorage.setItem("edu_competitions", JSON.stringify(updatedCompetitions));
      setSubmitting(false);
    }, 1500);
  };

  const formatTimer = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (selectedComp) {
    const activeQ = selectedComp.questions[activeQuestionIdx];
    
    return (
      <div className="space-y-6 animate-fade-in text-slate-700">
        {/* Header Toolbar */}
        <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600 animate-pulse" />
            <span className="font-sans text-sm text-slate-800 font-black">{selectedComp.title}</span>
          </div>

          {isCompActive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 font-mono text-xs font-bold">
              <Clock className="h-3.5 w-3.5 animate-pulse text-orange-500" />
              <span>{formatTimer(timerSecs)}</span>
            </div>
          )}
        </div>

        {compScore !== null ? (
          /* Finished Screen */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completion metrics block */}
            <div className="lg:col-span-2 bg-white border border-slate-100 p-6 md:p-8 rounded-2xl text-center space-y-6 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 font-sans">Competition Submission Logged!</h3>
                <p className="text-xs text-slate-500">Your solutions have been graded. Your position has been updated on the challenge table below.</p>
              </div>

              <div className="flex justify-center gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center min-w-[120px]">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Correct Rate</span>
                  <span className="text-2xl font-black text-blue-600">{compScore}%</span>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center min-w-[120px]">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Rewards Awarded</span>
                  <span className="text-2xl font-black text-amber-600">+{xpEarned} XP</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={() => { setSelectedComp(null); setCompScore(null); }}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  Return to Sprints
                </button>
              </div>
            </div>

            {/* Live Competition Leaderboard column */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-600" />
                <span>Live Event Ranking Table</span>
              </h4>
              
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {competitions.find(c => c.id === selectedComp.id)?.leaderboard.map((item, idx) => {
                  const isCurrent = item.studentName === user.name;
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg flex items-center justify-between text-xs transition-all border ${
                        isCurrent 
                          ? "bg-blue-50/55 border-blue-200 text-blue-900 font-bold" 
                          : "bg-slate-50/40 text-slate-600 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          idx === 0 
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-100" 
                            : idx === 1
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : idx === 2
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-slate-100 text-slate-500 border border-slate-200/50"
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{item.studentName}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 font-mono text-[10px]">
                        <span className="text-blue-600 font-black">{item.score}%</span>
                        <span className="text-slate-400">({item.completionTime})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : submitting ? (
          <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4">
            <Clock className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Grading competition submissions & sorting leaderboard statistics...</p>
          </div>
        ) : (
          /* Active Question layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 p-6 rounded-xl space-y-5 shadow-xs">
                <div className="flex justify-between text-xs text-slate-400 font-bold">
                  <span>Syllabus Challenge {activeQuestionIdx + 1} of {selectedComp.questions.length}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 leading-relaxed">{activeQ.question}</h4>

                {/* Question Options */}
                <div className="space-y-3">
                  {activeQ.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[activeQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(activeQ.id, oIdx)}
                        className={`w-full text-left p-4 rounded-xl border text-xs transition-all flex justify-between items-center ${
                          isSelected 
                            ? "bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs" 
                            : "bg-slate-50/40 border-slate-100 text-slate-600 hover:bg-slate-100/60 hover:text-slate-800"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <ChevronRight className="h-4 w-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation row */}
              <div className="flex justify-between">
                <button
                  onClick={() => setActiveQuestionIdx(Math.max(0, activeQuestionIdx - 1))}
                  disabled={activeQuestionIdx === 0}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Previous
                </button>

                {activeQuestionIdx === selectedComp.questions.length - 1 ? (
                  <button
                    onClick={handleFinishComp}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Submit Solutions</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveQuestionIdx(Math.min(selectedComp.questions.length - 1, activeQuestionIdx + 1))}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>

            {/* Quick overview side table */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sprint Dashboard</h4>
              <div className="bg-white border border-slate-100 p-5 rounded-xl space-y-4 shadow-xs">
                <div className="grid grid-cols-3 gap-2.5">
                  {selectedComp.questions.map((q, idx) => {
                    const answered = selectedAnswers[q.id] !== undefined;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`h-10 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${
                          activeQuestionIdx === idx 
                            ? "bg-blue-600 border-blue-500 text-white" 
                            : answered 
                              ? "bg-blue-50 border-blue-200 text-blue-600" 
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        Q {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold space-y-1.5">
                  <p>• Correct submissions earn peak XP rewards</p>
                  <p>• Accuracy and speed decide rank position</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-sans">Global Competitions & Hackathons</h2>
          <p className="text-xs text-slate-500 mt-1">Compete live against student cohorts in time-sensitive programming sprints and score high rewards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {competitions.map((comp) => {
          const isUpcoming = comp.status === "upcoming";
          return (
            <div 
              key={comp.id}
              className="bg-white border border-slate-100 hover:border-slate-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                    isUpcoming 
                      ? "bg-purple-50 text-purple-700 border border-purple-100" 
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {comp.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span>{comp.timeLeft}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-800 leading-tight mt-1">{comp.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{comp.description}</p>
                
                <div className="text-[11px] font-bold text-amber-700 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                  🎁 Prize Pool: {comp.prize}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-slate-400" /> {comp.participantsCount} competing
                </span>

                <button
                  disabled={isUpcoming}
                  onClick={() => handleStartComp(comp)}
                  className={`px-4 py-1.5 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 ${
                    isUpcoming
                      ? "bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                  }`}
                >
                  <Play className="h-3 w-3" />
                  <span>{isUpcoming ? "Starts Soon" : "Enter Arena"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
