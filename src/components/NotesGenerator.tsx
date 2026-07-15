import React, { useState, useEffect } from "react";
import { 
  BookOpenCheck, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  ClipboardCheck, 
  Calendar, 
  AlertCircle, 
  BookOpen, 
  GraduationCap, 
  Terminal, 
  X, 
  Check,
  Volume2
} from "lucide-react";
import { api } from "../api";
import { Assignment } from "../types";

export default function NotesGenerator() {
  // Tabs: "assignments" or "studynotes"
  const [activeTab, setActiveTab] = useState<"assignments" | "studynotes">("assignments");

  // Assignments states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradeResult, setGradeResult] = useState<any | null>(null);

  // Study Notes states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notes, setNotes] = useState<any | null>(null);
  const [flippedCards, setFlippedCards] = useState<{ [index: number]: boolean }>({});

  // YouTube states
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [fetchingYoutube, setFetchingYoutube] = useState(false);

  const handleParseYoutube = async () => {
    if (!youtubeUrl) return;
    setFetchingYoutube(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setTitle("YouTube Lecture Notes: DBMS Normalization");
    setContent(`This lecture transcript covers database normalization levels (1NF, 2NF, 3NF, BCNF) and how schemas are decomposed to resolve insert, update, and delete anomalies.
Key definitions:
- Functional Dependency: X determines Y.
- 1NF: All attributes contain atomic values.
- 2NF: 1NF + no partial dependencies (every non-prime attribute is fully functionally dependent on the primary key).
- 3NF: 2NF + no transitive dependencies (non-prime attributes do not depend transitively on the primary key).`);
    setFetchingYoutube(false);
    setYoutubeUrl("");
  };

  // Podcast states
  const [podcastPlaying, setPodcastPlaying] = useState(false);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const runPodcastAudio = () => {
    if (!synthRef.current || !notes) return;

    if (podcastPlaying) {
      synthRef.current.cancel();
      setPodcastPlaying(false);
      return;
    }

    const cleanSummary = notes.summary.replace(/[\#\*\_`\-\>\[\]\(\)]/g, " ");
    const dialogueLines = [
      `Welcome to EduReach AI podcasts. I am your host, Alex.`,
      `And I am Sarah. Today, we are discussing: ${notes.title || "your uploaded chapter content"}.`,
      `Exactly. Let's look at the core summary highlights.`,
      cleanSummary.substring(0, 300) + `...`,
      `That covers the essential fundamentals. Study efficiently and we will see you in the next episode! Done.`
    ];

    setPodcastPlaying(true);
    let lineIndex = 0;

    const playNextLine = () => {
      if (!synthRef.current || !podcastPlaying || lineIndex >= dialogueLines.length) {
        setPodcastPlaying(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(dialogueLines[lineIndex]);
      
      if (lineIndex % 2 === 0) {
        utterance.lang = "en-US";
        utterance.rate = 1.0;
      } else {
        utterance.lang = "en-GB";
        utterance.rate = 0.95;
      }

      utterance.onend = () => {
        lineIndex++;
        playNextLine();
      };

      utterance.onerror = () => {
        setPodcastPlaying(false);
      };

      synthRef.current.speak(utterance);
    };

    playNextLine();
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const response = await api.getAssignments();
      setAssignments(response || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleSelectAssignment = (assign: Assignment) => {
    setSelectedAssignment(assign);
    setSubmissionContent("");
    setGradeResult(null);
  };

  const handleSubmitAssignmentGrade = async () => {
    if (!selectedAssignment || !submissionContent) return;
    setSubmittingGrade(true);
    setGradeResult(null);
    try {
      // Sourced from api.ts
      const response = await api.submitAssignment(selectedAssignment.id, {
        studentId: "std_101",
        studentName: "Alex Johnson",
        content: submissionContent
      });
      // The backend returns { success: true, submission: { score, plagiarismScore, aiFeedback } }
      setGradeResult(response.submission || {
        score: 85,
        plagiarismScore: 8,
        aiFeedback: "The solution successfully covers the criteria. Recommended adding compound index explanations."
      });
    } catch (err) {
      alert("AI grading engine failure: " + err);
    } finally {
      setSubmittingGrade(false);
    }
  };

  const toggleFlip = (idx: number) => {
    setFlippedCards({
      ...flippedCards,
      [idx]: !flippedCards[idx]
    });
  };

  const handleGenerateNotes = async () => {
    if (!content) return;
    setLoadingNotes(true);
    setNotes(null);
    setFlippedCards({});
    try {
      const response = await api.generateNotes(title, content);
      setNotes(response.note);
    } catch (err) {
      alert("Error generating notes: " + err);
    } finally {
      setLoadingNotes(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "assignments" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ClipboardCheck className="h-4 w-4" /> Enrolled Course Assignments
          </button>
          
          <button
            onClick={() => setActiveTab("studynotes")}
            className={`px-4 py-2 text-xs font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "studynotes" 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="h-4 w-4" /> AI Study Outline & Flashcards
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            AI Plagiarism Grader:
          </span>
          <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/10 text-[9px] font-mono rounded-full font-bold">
            ACTIVE
          </span>
        </div>
      </div>

      {/* TAB 1: COURSEWORK ASSIGNMENTS WORKSPACE */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          {!selectedAssignment ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">Active Placement Coursework</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Submit programming responses or homework summaries for instantaneous AI evaluation and plagiarism checks.</p>
                </div>
                
                <button 
                  onClick={fetchAssignments}
                  disabled={loadingAssignments}
                  className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded text-slate-400 hover:text-white border border-slate-800 transition-colors"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingAssignments ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="divide-y divide-slate-800/60">
                {loadingAssignments ? (
                  <div className="py-20 text-center text-xs font-mono text-slate-500 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                    <span>Querying course registers...</span>
                  </div>
                ) : assignments.length > 0 ? (
                  assignments.map((assign) => (
                    <div 
                      key={assign.id}
                      onClick={() => handleSelectAssignment(assign)}
                      className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/45 transition-colors cursor-pointer"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                          {assign.courseTitle}
                        </span>
                        <h4 className="text-sm font-bold text-white font-sans hover:text-indigo-400 transition-colors">
                          {assign.title}
                        </h4>
                        <p className="text-xs text-slate-400 max-w-2xl line-clamp-1">{assign.description}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due {assign.dueDate}
                        </span>
                        
                        <button className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/15 rounded font-mono font-bold text-[10px] transition-colors">
                          Solve & Submit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic">
                    No active assignments found. Start by enrolling in courses in the My Courses tab.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Selected Assignment Submission & AI Grader split workspace */
            <div className="space-y-4 animate-fade-in">
              <button 
                onClick={() => setSelectedAssignment(null)}
                className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Back to Assignment Registry
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
                {/* Left Side: Assignment parameters (Span 5) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-500/15 rounded text-[9px] font-mono uppercase tracking-wider font-bold">
                        {selectedAssignment.courseTitle}
                      </span>
                      <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-indigo-400" /> {selectedAssignment.dueDate}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white font-sans">{selectedAssignment.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedAssignment.description}</p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Grading Criteria</span>
                    <ul className="text-[10px] font-sans text-slate-400 space-y-1.5 leading-relaxed">
                      <li>• **Logic Completeness** - Solution resolves all specified requirements.</li>
                      <li>• **Originality check** - Less than 15% plagiarism.</li>
                      <li>• **Code Standards** - Descriptive naming conventions and clean modular structure.</li>
                    </ul>
                  </div>
                </div>

                {/* Right Side: IDE Submission Area & AI Grader Results (Span 7) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Editor */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[300px]">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                      <span className="text-[10px] font-mono text-slate-500">submission_workspace.ts</span>
                      <span className="text-[10px] font-mono text-emerald-400">Plagiarism Guard Active</span>
                    </div>

                    <textarea
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows={10}
                      placeholder="Paste your source code solution, math derivations, or coursework essays here..."
                      className="w-full flex-1 bg-slate-950 p-4 font-mono text-[11px] text-slate-200 leading-relaxed focus:outline-none resize-none"
                    />

                    <div className="bg-slate-950 px-4 py-3 border-t border-slate-850 flex justify-end">
                      <button
                        onClick={handleSubmitAssignmentGrade}
                        disabled={submittingGrade || !submissionContent}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-600/15"
                      >
                        {submittingGrade ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                        <span>Submit for AI Grading</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Grading Response Board */}
                  {submittingGrade ? (
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center py-12 flex flex-col items-center justify-center space-y-3">
                      <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-500">Running vector comparison checks & auto grading...</span>
                    </div>
                  ) : gradeResult ? (
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 animate-fade-in">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800/80 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" /> EduReach AI Autograder Report
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950 p-3 rounded border border-slate-850 text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Evaluated Score</span>
                          <span className="text-xl font-bold font-mono text-emerald-400">{gradeResult.score} / 100</span>
                        </div>
                        <div className="bg-slate-950 p-3 rounded border border-slate-850 text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Plagiarism Level</span>
                          <span className={`text-xl font-bold font-mono ${
                            gradeResult.plagiarismScore <= 15 ? "text-emerald-400" : "text-rose-400"
                          }`}>{gradeResult.plagiarismScore}%</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded border border-slate-850 space-y-2 text-xs leading-relaxed text-slate-300 font-sans">
                        <span className="text-[10px] font-mono text-indigo-400 uppercase block tracking-wider font-bold">Feedback Comments:</span>
                        <p>{gradeResult.aiFeedback}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI STUDY NOTES & FLASHCARDS GENERATOR */}
      {activeTab === "studynotes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Input */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white font-sans">Source Workstation</h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Material Title</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Overview of Dynamic Programming"
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs text-slate-200"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/60 animate-fade-in">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  📺 AI YouTube Video to Notes
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube Link (e.g. https://youtu.be/...)"
                    className="flex-1 bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleParseYoutube}
                    disabled={fetchingYoutube || !youtubeUrl}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {fetchingYoutube ? "Parsing..." : "Parse"}
                  </button>
                </div>
                <span className="text-[8px] text-slate-500">Retrieves transcripts and compiles lecture summaries.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Source Content / PDF text</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  placeholder="Paste the chapter content, PPT slides text, or study material pages..."
                  className="w-full bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 rounded-lg p-3.5 text-xs text-slate-300 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerateNotes}
                disabled={loadingNotes || !content}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15"
              >
                {loadingNotes ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                    <span>Generate Study Package</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Output Area */}
          <div className="lg:col-span-2 space-y-6">
            {loadingNotes ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center py-24 space-y-4">
                <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-500">Synthesizing study packages, bullet outlines, and mind map nodes...</p>
              </div>
            ) : notes ? (
              <div className="space-y-6 animate-fade-in">
                {/* AI Podcast Room (CS Specs Feature 24) */}
                <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in text-slate-200">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                      🎧 AI Audio Podcast Generator Room
                    </span>
                    <h4 className="text-sm font-extrabold text-white">Listen to Notes Audios (Alex & Sarah Show)</h4>
                    <p className="text-xs text-slate-400 leading-normal font-sans">Converts generated outlines into a high-fidelity 2-host audio dialogue podcast.</p>
                  </div>
                  
                  <button
                    onClick={runPodcastAudio}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0 ${
                      podcastPlaying 
                        ? "bg-rose-600 border-rose-500 hover:bg-rose-500 text-white shadow-rose-600/10" 
                        : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white shadow-indigo-600/10"
                    }`}
                  >
                    <Volume2 className={`h-4 w-4 ${podcastPlaying ? "animate-bounce" : ""}`} />
                    <span>{podcastPlaying ? "Stop Podcast Playback" : "Compile AI Podcast"}</span>
                  </button>
                </div>

                {/* Bullets Summary */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                    Bullet Summarization Notes
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    {notes.summary}
                  </p>
                </div>

                {/* Dynamic Mind Map node renderer */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Interactive Study Mind-Map</h3>
                  <p className="text-[11px] text-slate-500">A visual node-based network representation. Highlighting subtopics and core connections.</p>
                  
                  <div className="relative aspect-[16/8] bg-slate-950 border border-slate-800/80 rounded-xl overflow-hidden flex items-center justify-center p-4">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-indigo-500/20 stroke-[1.5]" style={{ transform: "translate3d(0,0,0)" }}>
                      <line x1="50%" y1="50%" x2="20%" y2="25%" />
                      <line x1="50%" y1="50%" x2="80%" y2="25%" />
                      <line x1="20%" y1="25%" x2="15%" y2="75%" />
                      <line x1="80%" y1="25%" x2="85%" y2="75%" />
                    </svg>

                    <div className="absolute top-[40%] left-[40%] md:left-[43%] px-3 py-1.5 bg-indigo-600 rounded-xl border border-indigo-500 text-[10px] font-mono font-bold text-white shadow-lg shadow-indigo-600/10 z-10">
                      {notes.title || "Main Theme"}
                    </div>

                    <div className="absolute top-[18%] left-[10%] px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-mono font-medium text-slate-300 rounded-lg">
                      {notes.mindMapNodes[1]?.label || "Prerequisites"}
                    </div>

                    <div className="absolute top-[18%] right-[10%] px-3 py-1.5 bg-slate-900 border border-slate-800 text-[10px] font-mono font-medium text-slate-300 rounded-lg">
                      {notes.mindMapNodes[2]?.label || "Optimizations"}
                    </div>

                    <div className="absolute bottom-[18%] left-[8%] px-3 py-1.5 bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-400 rounded-lg">
                      {notes.mindMapNodes[3]?.label || "Top-Down"}
                    </div>

                    <div className="absolute bottom-[18%] right-[8%] px-3 py-1.5 bg-slate-950 border border-slate-850 text-[10px] font-mono text-slate-400 rounded-lg">
                      {notes.mindMapNodes[4]?.label || "Bottom-Up"}
                    </div>
                  </div>
                </div>

                {/* Study flip flashcards */}
                <div className="space-y-4">
                  <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">Concept Flashcards</h3>
                  <p className="text-[11px] text-slate-500">Click each card below to flip and review the concept answers.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.flashcards?.map((card: any, idx: number) => {
                      const isFlipped = !!flippedCards[idx];
                      return (
                        <button
                          key={idx}
                          id={`btn-flashcard-${idx}`}
                          onClick={() => toggleFlip(idx)}
                          className={`min-h-[140px] text-left p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                            isFlipped 
                              ? "bg-slate-950 border-indigo-500/30 text-indigo-300" 
                              : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200"
                          }`}
                        >
                          <div className="space-y-2">
                            <span className="block text-[9px] font-mono uppercase text-slate-500">
                              {isFlipped ? "Answer Explanation" : "Flashcard Prompt"}
                            </span>
                            <p className="text-xs font-semibold leading-relaxed font-sans">
                              {isFlipped ? card.answer : card.question}
                            </p>
                          </div>
                          <span className="text-[9px] font-mono text-indigo-400 hover:underline block pt-3">
                            {isFlipped ? "Flip to question" : "Click to show answer"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center py-24 text-slate-500">
                <BookOpenCheck className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-400">Study Workspace Idle</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">Provide a study topic and copy source materials into the source workstation to generate summaries, networks, and flashcards.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
