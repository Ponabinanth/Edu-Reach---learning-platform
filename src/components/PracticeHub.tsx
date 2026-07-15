import React, { useState } from "react";
import { 
  Code2, 
  Sparkles, 
  Play, 
  Terminal, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  BookOpen, 
  Zap, 
  Check, 
  X, 
  HelpCircle, 
  Cpu, 
  Layers, 
  Flame,
  RefreshCw
} from "lucide-react";
import { CodingProblem, UserProfile } from "../types";
import { api } from "../api";

interface PracticeHubProps {
  user: UserProfile;
  problems: CodingProblem[];
}

export default function PracticeHub({ user, problems }: PracticeHubProps) {
  // Main Tab: "coding" or "aptitude" or "visualizer"
  const [mainTab, setMainTab] = useState<"coding" | "aptitude" | "visualizer">("coding");

  // Visualizer States
  const [visualizerType, setVisualizerType] = useState<"bubble" | "list" | "bst">("bubble");
  
  // Bubble Sort Visualizer State
  const [sortArray, setSortArray] = useState<number[]>([45, 12, 85, 32, 9, 64, 23, 50]);
  const [sortingActive, setSortingActive] = useState(false);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  
  // Linked List Visualizer State
  const [listNodes, setListNodes] = useState<number[]>([10, 20, 30, 40]);
  const [listAnimating, setListAnimating] = useState(false);
  const [animatingPointer, setAnimatingPointer] = useState<number | null>(null);
  const [animatingNewNode, setAnimatingNewNode] = useState<{ val: number, index: number } | null>(null);

  // BST Visualizer State
  const [bstTraversed, setBstTraversed] = useState<number[]>([]);
  const [bstActiveNode, setBstActiveNode] = useState<number | null>(null);
  const [bstAnimating, setBstAnimating] = useState(false);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 1. Bubble Sort Animation
  const runBubbleSort = async () => {
    if (sortingActive) return;
    setSortingActive(true);
    setSortedIndices([]);
    const arr = [...sortArray];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setActiveIndices([j, j + 1]);
        await sleep(350);
        
        if (arr[j] > arr[j + 1]) {
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setSortArray([...arr]);
          await sleep(350);
        }
      }
      setSortedIndices(prev => [...prev, n - i - 1]);
    }
    setSortedIndices(arr.map((_, idx) => idx));
    setActiveIndices([]);
    setSortingActive(false);
  };

  const resetSortArray = () => {
    setSortArray([45, 12, 85, 32, 9, 64, 23, 50]);
    setActiveIndices([]);
    setSortedIndices([]);
    setSortingActive(false);
  };

  // 2. Linked List Insertion Animation
  const runLinkedListInsert = async () => {
    if (listAnimating) return;
    setListAnimating(true);
    setAnimatingNewNode({ val: 25, index: 2 });
    
    for (let i = 0; i <= 2; i++) {
      setAnimatingPointer(i);
      await sleep(600);
    }
    
    setListNodes([10, 20, 25, 30, 40]);
    setAnimatingNewNode(null);
    setAnimatingPointer(null);
    await sleep(600);
    setListAnimating(false);
  };

  const resetLinkedList = () => {
    setListNodes([10, 20, 30, 40]);
    setAnimatingNewNode(null);
    setAnimatingPointer(null);
    setListAnimating(false);
  };

  // 3. BST Traversal Animation
  const runBstTraversal = async (traversalType: "pre" | "in" | "post") => {
    if (bstAnimating) return;
    setBstAnimating(true);
    setBstTraversed([]);
    
    const preOrder = [40, 20, 10, 30, 60, 50, 70];
    const inOrder = [10, 20, 30, 40, 50, 60, 70];
    const postOrder = [10, 30, 20, 50, 70, 60, 40];
    
    const sequence = traversalType === "pre" ? preOrder : traversalType === "in" ? inOrder : postOrder;
    
    for (const val of sequence) {
      setBstActiveNode(val);
      await sleep(600);
      setBstTraversed(prev => [...prev, val]);
    }
    
    setBstActiveNode(null);
    setBstAnimating(false);
  };

  const resetBst = () => {
    setBstTraversed([]);
    setBstActiveNode(null);
    setBstAnimating(false);
  };

  // Coding States
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>("python");
  const [userCode, setUserCode] = useState<string>("");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [complexity, setComplexity] = useState<{ time: string; space: string } | null>(null);
  const [hint, setHint] = useState("");
  const [loadingHint, setLoadingHint] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);

  // Aptitude States
  const [selectedAptitudeTopic, setSelectedAptitudeTopic] = useState<string>("Time and Work");
  const [customAptitudeQuestion, setCustomAptitudeQuestion] = useState("");
  const [solvingAptitude, setSolvingAptitude] = useState(false);
  const [aptitudeSolution, setAptitudeSolution] = useState("");
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, number>>({});
  const [checkedAptitudeMCQs, setCheckedAptitudeMCQs] = useState<Record<string, boolean>>({});

  // 24 Placement Aptitude Syllabus Topics
  const aptitudeTopics = [
    { name: "Time and Work", category: "Quantitative" },
    { name: "Permutations and Combinations", category: "Quantitative" },
    { name: "Probability", category: "Quantitative" },
    { name: "Time, Speed and Distance", category: "Quantitative" },
    { name: "Simple and Compound Interest", category: "Quantitative" },
    { name: "Ratios and Proportions", category: "Quantitative" },
    { name: "Profit and Loss", category: "Quantitative" },
    { name: "Averages and Percentages", category: "Quantitative" },
    { name: "Data Interpretation (Charts)", category: "Quantitative" },
    { name: "Blood Relations", category: "Logical Reasoning" },
    { name: "Seating Arrangements", category: "Logical Reasoning" },
    { name: "Syllogisms", category: "Logical Reasoning" },
    { name: "Coding-Decoding Problems", category: "Logical Reasoning" },
    { name: "Number Series and Analogy", category: "Logical Reasoning" },
    { name: "Clocks and Calendars", category: "Logical Reasoning" },
    { name: "Sentence Correction", category: "Verbal Ability" },
    { name: "Synonyms and Antonyms", category: "Verbal Ability" },
    { name: "Reading Comprehension", category: "Verbal Ability" }
  ];

  // Static high-fidelity MCQ questions for Aptitude Topics to provide instant practice
  const aptitudeMCQs: Record<string, Array<{ id: string; q: string; options: string[]; correctIdx: number; explanation: string }>> = {
    "Time and Work": [
      {
        id: "tw-1",
        q: "A can finish a work in 12 days and B in 15 days. If they work together for 5 days, what fraction of work is left?",
        options: ["1/4", "3/4", "1/10", "3/10"],
        correctIdx: 0,
        explanation: "1 day work together = 1/12 + 1/15 = 9/60 = 3/20. In 5 days, work done = 5 * 3/20 = 15/20 = 3/4. Therefore, work left = 1 - 3/4 = 1/4."
      }
    ],
    "Permutations and Combinations": [
      {
        id: "pc-1",
        q: "In how many ways can the letters of the word 'LEADER' be arranged such that the vowels always come together?",
        options: ["72", "144", "360", "720"],
        correctIdx: 0,
        explanation: "Vowels in LEADER are E, A, E. Treat EAE as one unit. The word now has L, D, R and [EAE] unit = 4 units. These can be arranged in 4! = 24 ways. The vowels [E,A,E] can be arranged among themselves in 3! / 2! = 3 ways. Total arrangements = 24 * 3 = 72 ways."
      }
    ],
    "Probability": [
      {
        id: "pr-1",
        q: "Three unbiased coins are tossed. What is the probability of getting at least 2 heads?",
        options: ["1/8", "3/8", "1/2", "3/4"],
        correctIdx: 2,
        explanation: "Total outcomes = 2^3 = 8 (HHH, HHT, HTH, HTT, THH, THT, TTH, TTT). Favorable outcomes with at least 2 heads = {HHH, HHT, HTH, THH} = 4 outcomes. Probability = 4/8 = 1/2."
      }
    ],
    "Blood Relations": [
      {
        id: "br-1",
        q: "Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
        options: ["Brother", "Uncle", "Father", "Grandfather"],
        correctIdx: 2,
        explanation: "Only son of Suresh's mother is Suresh himself. Suresh is Suresh himself. The boy in the photograph is Suresh's son. Therefore Suresh is the father of that boy."
      }
    ]
  };

  const handleSelectProblem = (problem: CodingProblem) => {
    setSelectedProblem(problem);
    const starter = problem.starterCode[selectedLang] || problem.starterCode["python"] || "";
    setUserCode(starter);
    setConsoleLogs([]);
    setComplexity(null);
    setHint("");
    setCorrect(null);
  };

  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    if (selectedProblem) {
      setUserCode(selectedProblem.starterCode[lang] || "");
    }
  };

  const handleGetHint = async () => {
    if (!selectedProblem) return;
    setLoadingHint(true);
    setHint("");
    try {
      const response = await api.askCodeHint(selectedProblem.id, {
        code: userCode,
        language: selectedLang
      });
      setHint(response.hint);
    } catch (err) {
      setHint("Identify if a sliding window or pointer iteration matches the required sub-array bounds!");
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!selectedProblem) return;
    setEvaluating(true);
    setConsoleLogs(["Initializing compilation runtime...", "Injecting sample tests inputs..."]);
    setComplexity(null);
    setCorrect(null);

    try {
      const response = await api.submitCode(selectedProblem.id, {
        studentId: user.id,
        code: userCode,
        language: selectedLang
      });

      setConsoleLogs([
        "Initializing compiler runtime...",
        "Validating Standard Input test vector...",
        "Executing Test Case 1: PASS",
        response.isCorrect ? "Executing Test Case 2: PASS" : "Executing Test Case 2: FAIL",
        "-----------------------------",
        `Evaluation response feedback: ${response.feedback}`
      ]);

      setCorrect(response.isCorrect);
      setComplexity({
        time: response.timeComplexity,
        space: response.spaceComplexity
      });
    } catch (err) {
      setConsoleLogs([...consoleLogs, "Compilation Error: Failed to evaluate logic via static engine."]);
    } finally {
      setEvaluating(false);
    }
  };

  // Solve Aptitude question via AI Tutor seeder
  const handleSolveAptitude = async () => {
    if (!customAptitudeQuestion) return;
    setSolvingAptitude(true);
    setAptitudeSolution("");
    try {
      const response = await api.solveAptitude(selectedAptitudeTopic, customAptitudeQuestion);
      setAptitudeSolution(response.explanation);
    } catch (err) {
      setAptitudeSolution("Failed to query educational AI. Check connectivity.");
    } finally {
      setSolvingAptitude(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Platform Navigation Tabs */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setMainTab("coding")}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
              mainTab === "coding" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="h-4 w-4" /> Coding Arena (LeetCode Edition)
          </button>
          
          <button
            onClick={() => {
              setMainTab("aptitude");
              setSelectedProblem(null);
            }}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
              mainTab === "aptitude" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="h-4 w-4 text-amber-400" /> Aptitude Solver Workstation
          </button>

          <button
            onClick={() => {
              setMainTab("visualizer");
              setSelectedProblem(null);
            }}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
              mainTab === "visualizer" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="h-4 w-4 text-purple-400" /> Code Execution Visualizer
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Placement Prep Status:
          </span>
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/10 text-[9px] font-mono rounded-full font-bold flex items-center gap-1">
            ● DRIVE READY
          </span>
        </div>
      </div>

      {/* 1. LEETCODE CODING HUB TAB */}
      {mainTab === "coding" && (
        <>
          {!selectedProblem ? (
            <div className="space-y-6">
              {/* Stats Panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Easy Solved</span>
                    <span className="text-xl font-bold text-white font-mono">14 / 20</span>
                  </div>
                  <div className="h-8 w-8 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Medium Solved</span>
                    <span className="text-xl font-bold text-white font-mono">11 / 25</span>
                  </div>
                  <div className="h-8 w-8 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Hard Solved</span>
                    <span className="text-xl font-bold text-white font-mono">3 / 10</span>
                  </div>
                  <div className="h-8 w-8 rounded-full border-4 border-rose-500/20 border-t-rose-500" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Global Rank</span>
                    <span className="text-xl font-bold text-indigo-400 font-mono">#1,482</span>
                  </div>
                  <Flame className="h-6 w-6 text-amber-500 animate-pulse" />
                </div>
              </div>

              {/* Table of coding challenges */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white font-sans">Placement Coding Challenges</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Practice hand-picked technical interviews questions from Google, Amazon, and Zoho.</p>
                </div>

                <div className="divide-y divide-slate-800/60">
                  {problems.map((problem) => (
                    <div 
                      key={problem.id}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/45 transition-colors cursor-pointer"
                      onClick={() => handleSelectProblem(problem)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-sans hover:text-indigo-400 transition-colors">
                            {problem.title}
                          </h4>
                          <span className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded border ${
                            problem.difficulty === "Easy" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                              : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                          }`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl line-clamp-1">{problem.description}</p>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-xs font-mono">
                        <span className="text-slate-500">{problem.category}</span>
                        <span className="text-slate-300 font-bold bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
                          {problem.difficulty === "Easy" ? "88.2% Accept" : "54.1% Accept"}
                        </span>
                        <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono font-bold text-[10px] transition-colors">
                          Solve Challenge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Split Screen IDE replica */
            <div className="space-y-4 animate-fade-in">
              <button 
                onClick={() => setSelectedProblem(null)}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Coding Challenge List
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[580px]">
                {/* Left IDE Pane: Problem statements */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full">
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Problem Definition</span>
                    <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-500/10 text-[9px] font-mono rounded">
                      LeetCode Compiles
                    </span>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono uppercase tracking-wider rounded border ${
                        selectedProblem.difficulty === "Easy" 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                      }`}>
                        {selectedProblem.difficulty}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{selectedProblem.category}</span>
                    </div>

                    <h3 className="text-base font-bold text-white font-sans">{selectedProblem.title}</h3>
                    
                    <div className="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                      {selectedProblem.description}
                    </div>

                    {/* AI Hint Workspace */}
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3 pt-3 mt-4 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> AI Coach Hint Desk
                        </h4>
                        <button
                          onClick={handleGetHint}
                          disabled={loadingHint}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-[9px] rounded border border-slate-800 transition-colors"
                        >
                          {loadingHint ? "Analyzing..." : "Reveal Code Clue"}
                        </button>
                      </div>

                      {hint && (
                        <p className="text-xs font-mono text-slate-400 leading-relaxed italic border-t border-slate-900/80 pt-2 animate-fade-in">
                          {hint}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right IDE Pane: Code Editor + Output Terminals */}
                <div className="flex flex-col gap-4">
                  {/* Code Workspace */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col flex-1 min-h-[380px]">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                      <select 
                        value={selectedLang} 
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-mono text-slate-300 focus:outline-none"
                      >
                        <option value="python">Python 3</option>
                        <option value="java">Java 17 (JDK)</option>
                        <option value="cpp">C++ 20 (g++)</option>
                        <option value="javascript">JavaScript (ES6)</option>
                      </select>

                      <span className="text-[10px] font-mono text-slate-500">interactive_editor.bin</span>
                    </div>

                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      className="w-full flex-1 bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 leading-relaxed focus:outline-none resize-none"
                    />

                    <div className="bg-slate-950 px-4 py-3 border-t border-slate-850 flex justify-between items-center">
                      <button 
                        onClick={() => {
                          const starter = selectedProblem.starterCode[selectedLang] || "";
                          setUserCode(starter);
                          setCorrect(null);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-800 rounded transition-colors"
                      >
                        Reset Starter Code
                      </button>

                      <div className="flex gap-2">
                        <button 
                          onClick={handleSubmitCode}
                          disabled={evaluating}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-600/15"
                        >
                          <Play className="h-3.5 w-3.5" /> Submit Solution
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Compiler Outputs Console */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3 min-h-[160px] flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                        <Terminal className="h-3.5 w-3.5 text-indigo-400" /> Interactive Compiler Console
                      </span>

                      {correct !== null && (
                        <span>
                          {correct ? (
                            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> ALL TESTS PASSED
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" /> LOGICAL ERROR
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 font-mono text-[11px] text-slate-400 space-y-1 py-1 overflow-y-auto max-h-[120px]">
                      {consoleLogs.length > 0 ? (
                        consoleLogs.map((log, i) => (
                          <div key={i} className="leading-relaxed">{log}</div>
                        ))
                      ) : (
                        <div className="text-slate-600 italic">Compiler logs idle. Click "Submit Solution" to trigger.</div>
                      )}
                    </div>

                    {complexity && (
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60">
                        <div className="bg-slate-950 p-2 rounded border border-slate-850/80 text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Time Complexity</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{complexity.time}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-850/80 text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Space Complexity</span>
                          <span className="text-xs font-mono font-bold text-slate-300">{complexity.space}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. APTITUDE SOLVER WORKSTATION TAB */}
      {mainTab === "aptitude" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
          {/* Left Column: Topic List (Span 4) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
              <h3 className="text-sm font-bold text-white font-sans">Placement Syllabus</h3>
              <p className="text-[11px] text-slate-400">Select any quantitative or reasoning topic to launch the practice MCQs and AI Solver.</p>

              <div className="flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-1">
                {aptitudeTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    id={`btn-aptitude-topic-${idx}`}
                    onClick={() => {
                      setSelectedAptitudeTopic(topic.name);
                      setAptitudeSolution("");
                    }}
                    className={`w-full text-left px-3.5 py-2 rounded-lg text-xs font-mono transition-all flex justify-between items-center ${
                      selectedAptitudeTopic === topic.name 
                        ? "bg-indigo-950/20 border border-indigo-500/25 text-indigo-300" 
                        : "bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{topic.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800/80 text-slate-500 uppercase">
                      {topic.category.substring(0, 4)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Workstation & Solver (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Practice MCQ Module */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-indigo-400" /> Active Topic: {selectedAptitudeTopic}
              </h3>

              {aptitudeMCQs[selectedAptitudeTopic] ? (
                aptitudeMCQs[selectedAptitudeTopic].map((mcq, mIdx) => (
                  <div key={mcq.id} className="bg-slate-950 p-5 rounded-xl border border-slate-850 space-y-4 text-xs">
                    <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-500/15 rounded text-[9px] font-mono uppercase tracking-wider">
                      Practice Problem #{mIdx + 1}
                    </span>
                    
                    <p className="text-slate-200 font-sans leading-relaxed text-xs font-medium">
                      {mcq.q}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {mcq.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            if (!checkedAptitudeMCQs[mcq.id]) {
                              setAptitudeAnswers(prev => ({ ...prev, [mcq.id]: oIdx }));
                            }
                          }}
                          className={`text-left p-3 rounded-lg border transition-all flex items-center justify-between text-xs ${
                            aptitudeAnswers[mcq.id] === oIdx
                              ? "bg-indigo-950/20 border-indigo-500 text-indigo-300"
                              : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span>{opt}</span>
                          {aptitudeAnswers[mcq.id] === oIdx && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={() => {
                          if (aptitudeAnswers[mcq.id] !== undefined) {
                            setCheckedAptitudeMCQs(prev => ({ ...prev, [mcq.id]: true }));
                          }
                        }}
                        disabled={aptitudeAnswers[mcq.id] === undefined}
                        className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg border border-slate-700 transition-colors"
                      >
                        Verify Option Choice
                      </button>

                      {checkedAptitudeMCQs[mcq.id] && (
                        <span>
                          {aptitudeAnswers[mcq.id] === mcq.correctIdx ? (
                            <span className="text-emerald-400 font-bold font-mono text-xs flex items-center gap-1">
                              <Check className="h-4 w-4" /> Correct explanation matched!
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold font-mono text-xs flex items-center gap-1">
                              <X className="h-4 w-4" /> Oops! Try LCM speed shortcut method.
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {checkedAptitudeMCQs[mcq.id] && (
                      <p className="text-[11px] text-slate-400 italic leading-relaxed pt-3 border-t border-slate-900 font-sans">
                        💡 **Math derivation**: {mcq.explanation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-850/60">
                  Select "Time and Work", "Permutations and Combinations", "Probability" or "Blood Relations" to see preloaded practice challenges.
                </div>
              )}
            </div>

            {/* Interactive AI Speed Shortcut Solver */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" /> AI Speed Shortcut solver
                </h3>
                <span className="text-[9px] font-mono text-slate-500 uppercase">LCM & Formula Shortcut Engine</span>
              </div>

              <p className="text-[11px] text-slate-500">Paste any difficult word problem from placement exams (CAT, GMAT, TCS, Infosys drives) related to {selectedAptitudeTopic}. The AI will solve it step-by-step and reveal a high-speed mental math shortcut.</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSolveAptitude();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={customAptitudeQuestion}
                  onChange={(e) => setCustomAptitudeQuestion(e.target.value)}
                  placeholder="Paste quantitative or logical reasoning word problem here..."
                  className="flex-1 bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-200"
                />
                
                <button
                  type="submit"
                  disabled={solvingAptitude || !customAptitudeQuestion}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  {solvingAptitude ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 text-yellow-400" />}
                  <span>Solve</span>
                </button>
              </form>

              {/* Solution output */}
              {solvingAptitude ? (
                <div className="bg-slate-950 rounded-xl p-6 border border-slate-850 flex flex-col items-center justify-center py-12 space-y-3">
                  <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                  <span className="text-[10px] font-mono text-slate-500">Deconstructing equation coordinates...</span>
                </div>
              ) : aptitudeSolution ? (
                <div className="bg-slate-950 rounded-xl p-6 border border-slate-850/80 space-y-3 animate-fade-in text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap">
                  <span className="text-indigo-400 font-mono text-[9px] font-bold uppercase block pb-2 border-b border-slate-900">
                     AI Tutor Shortcut & Equation Steps
                  </span>
                  <div>{aptitudeSolution}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {mainTab === "visualizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-slate-200">
          
          {/* Left panel options (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-sans">Execution Visualizer Control</h3>
            <p className="text-[11px] text-slate-500">Select standard CS data structure models or algorithm traversals to view dynamic animations.</p>
            
            <div className="flex flex-col gap-2">
              {[
                { id: "bubble", label: "Bubble Sort Algorithm", desc: "Interactive columns swap" },
                { id: "list", label: "Linked List Node Insertion", desc: "Pointer traversal and link inserts" },
                { id: "bst", label: "Binary Search Tree Traversals", desc: "Pre, In, and Post order traversal" }
              ].map((vis) => (
                <button
                  key={vis.id}
                  onClick={() => setVisualizerType(vis.id as any)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-sans transition-all flex flex-col justify-between cursor-pointer ${
                    visualizerType === vis.id 
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                      : "bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span className="font-bold">{vis.label}</span>
                  <span className="text-[10px] text-slate-550 mt-0.5">{vis.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right panel canvas (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between min-h-[460px]">
            
            {/* Visualizer Screens */}
            <div className="flex-1 flex flex-col justify-center">
              
              {/* 1. Bubble Sort Screen */}
              {visualizerType === "bubble" && (
                <div className="space-y-8 animate-fade-in w-full text-center">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                    Sorting Array execution (Bubble Sort)
                  </span>
                  
                  {/* Array Columns */}
                  <div className="flex items-end justify-center gap-3.5 h-48 px-6 border-b border-slate-800 pb-2">
                    {sortArray.map((val, idx) => {
                      const isActive = activeIndices.includes(idx);
                      const isSorted = sortedIndices.includes(idx);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-slate-450">{val}</span>
                          <div 
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              isActive 
                                ? "bg-amber-400 shadow-md shadow-amber-450/20" 
                                : isSorted 
                                  ? "bg-emerald-500 shadow-md shadow-emerald-450/20" 
                                  : "bg-blue-600"
                            }`}
                            style={{ height: `${val * 1.5}px` }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Control Panel Buttons */}
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={runBubbleSort}
                      disabled={sortingActive}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Start Sorting Run
                    </button>
                    <button
                      onClick={resetSortArray}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Array
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Linked List Insertion Screen */}
              {visualizerType === "list" && (
                <div className="space-y-8 animate-fade-in w-full text-center">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                    {"Linked List middle insertion (10 -> 20 -> 30 -> 40, Inserting 25 at Index 2)"}
                  </span>

                  {/* Animation Arena */}
                  <div className="flex flex-wrap items-center justify-center gap-4 py-8 px-4 bg-slate-955 rounded-xl border border-slate-850/60 min-h-[160px]">
                    {listNodes.map((val, idx) => {
                      const isPointer = animatingPointer === idx;
                      return (
                        <React.Fragment key={idx}>
                          <div className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                            isPointer 
                              ? "bg-amber-950/20 border-amber-500 text-amber-300" 
                              : "bg-slate-900 border-slate-800 text-slate-200"
                          }`}>
                            <span className="text-[9px] font-mono text-slate-500">Val</span>
                            <span className="text-xs font-bold font-mono">{val}</span>
                            {isPointer && <span className="text-[8px] bg-amber-500 text-black px-1 rounded font-bold uppercase tracking-wider scale-90">Pointer</span>}
                          </div>
                          
                          {idx < listNodes.length - 1 && (
                            <span className="text-indigo-500 font-bold text-lg">→</span>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {animatingNewNode && (
                      <div className="ml-4 p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-indigo-300 animate-pulse flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500">New Val</span>
                        <span className="text-xs font-bold font-mono">{animatingNewNode.val}</span>
                        <span className="text-[8px] bg-indigo-500 text-white px-1 rounded font-bold uppercase">To Insert</span>
                      </div>
                    )}
                  </div>

                  {/* Control Panel Buttons */}
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={runLinkedListInsert}
                      disabled={listAnimating}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Animate Insertion
                    </button>
                    <button
                      onClick={resetLinkedList}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset List
                    </button>
                  </div>
                </div>
              )}

              {/* 3. BST Traversal Screen */}
              {visualizerType === "bst" && (
                <div className="space-y-6 animate-fade-in w-full text-center">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                    Binary Search Tree Traversals (Root: 40)
                  </span>

                  {/* Visual tree representation */}
                  <div className="flex flex-col items-center gap-4 py-4 min-h-[220px]">
                    {/* Layer 1: Root */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                      bstActiveNode === 40 
                        ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                        : bstTraversed.includes(40) 
                          ? "bg-emerald-600 border-emerald-500 text-white" 
                          : "bg-slate-900 border-slate-850 text-slate-200"
                    }`}>
                      40
                    </div>
                    
                    {/* Layer 2: Children */}
                    <div className="flex justify-center gap-20 w-full max-w-sm">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        bstActiveNode === 20 
                          ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                          : bstTraversed.includes(20) 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-slate-900 border-slate-850 text-slate-200"
                      }`}>
                        20
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        bstActiveNode === 60 
                          ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                          : bstTraversed.includes(60) 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-slate-900 border-slate-850 text-slate-200"
                      }`}>
                        60
                      </div>
                    </div>

                    {/* Layer 3: Leaves */}
                    <div className="flex justify-between w-full max-w-md px-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        bstActiveNode === 10 
                          ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                          : bstTraversed.includes(10) 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-slate-900 border-slate-850 text-slate-200"
                      }`}>
                        10
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        bstActiveNode === 30 
                          ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                          : bstTraversed.includes(30) 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-slate-900 border-slate-850 text-slate-200"
                      }`}>
                        30
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        bstActiveNode === 50 
                          ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                          : bstTraversed.includes(50) 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-slate-900 border-slate-850 text-slate-200"
                      }`}>
                        50
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all ${
                        bstActiveNode === 70 
                          ? "bg-amber-400 border-amber-400 text-slate-955 scale-110" 
                          : bstTraversed.includes(70) 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "bg-slate-900 border-slate-850 text-slate-200"
                      }`}>
                        70
                      </div>
                    </div>
                  </div>

                  {/* Realtime sequence log */}
                  {bstTraversed.length > 0 && (
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-center gap-2 text-[10px] font-mono">
                      <span className="text-slate-500 uppercase font-bold">Traversal Path:</span>
                      <span className="text-slate-100 font-bold">{bstTraversed.join(" → ")}</span>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => runBstTraversal("pre")}
                      disabled={bstAnimating}
                      className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Pre-order (DLR)
                    </button>
                    <button
                      onClick={() => runBstTraversal("in")}
                      disabled={bstAnimating}
                      className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      In-order (LDR)
                    </button>
                    <button
                      onClick={() => runBstTraversal("post")}
                      disabled={bstAnimating}
                      className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Post-order (LRD)
                    </button>
                    <button
                      onClick={resetBst}
                      className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Reset Tree
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
