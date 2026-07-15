import React, { useState, useEffect } from "react";
import { ClipboardCheck, Plus, Clock, HelpCircle, CheckCircle, AlertCircle, Play, ChevronRight, X, Sparkles, RefreshCw } from "lucide-react";
import { Quiz, QuizQuestion, UserProfile, UserRole } from "../types";
import { api } from "../api";

interface QuizzesProps {
  user: UserProfile;
  quizzes: Quiz[];
  onQuizAdded: () => void;
  globalLanguage?: string;
}

export default function Quizzes({ user, quizzes, onQuizAdded, globalLanguage }: QuizzesProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  
  // Timer state
  const [timerSecs, setTimerSecs] = useState(600); // 10 minutes
  const [isQuizActive, setIsQuizActive] = useState(false);

  // Result state
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic AI Quiz Builder states
  const [aiTopic, setAiTopic] = useState("Linked Lists");
  const [aiDifficulty, setAiDifficulty] = useState("Medium");
  const [qCount, setQCount] = useState(3);
  const [aiQuestionType, setAiQuestionType] = useState("mcq");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Adaptive engine states
  const [adaptiveMode, setAdaptiveMode] = useState(false);
  const [adaptiveLog, setAdaptiveLog] = useState("");

  // Exam Generator States
  const [activeQuizTab, setActiveQuizTab] = useState<"arena" | "exam">("arena");
  const [examTopic, setExamTopic] = useState("Data Structures & Algorithms");
  const [examDifficulty, setExamDifficulty] = useState("Medium");
  const [examQuestionType, setExamQuestionType] = useState("mix");
  const [examPaper, setExamPaper] = useState<any | null>(null);
  const [generatingExam, setGeneratingExam] = useState(false);
  const [showScheme, setShowScheme] = useState(false);

  const handleGenerateExam = async () => {
    if (!examTopic) return;
    setGeneratingExam(true);
    setExamPaper(null);
    setShowScheme(false);
    try {
      const response = await api.generateExamPaper(examTopic, examDifficulty, examQuestionType);
      if (response.success && response.examPaper) {
        setExamPaper(response.examPaper);
      }
    } catch (err) {
      alert("Error compiling exam paper: " + err);
    } finally {
      setGeneratingExam(false);
    }
  };

  const popularTopics = ["Linked Lists", "Dynamic Programming", "Neural Networks", "Spring Boot MVC", "Docker Containers"];

  const handleCreateAIQuiz = async () => {
    if (!aiTopic) return;
    setGeneratingQuiz(true);
    try {
      const generated = await api.generateAIQuiz(aiTopic, aiDifficulty, qCount, aiQuestionType);
      handleStartQuiz(generated);
    } catch (err) {
      alert("Failed to generate real-time assessment: " + err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Faculty state
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [newQuizDesc, setNewQuizDesc] = useState("");
  const [newQuizCourse, setNewQuizCourse] = useState("course_1");
  const [newQuizQuestions, setNewQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Faculty single question creator
  const [qText, setQText] = useState("");
  const [qOpt1, setQOpt1] = useState("");
  const [qOpt2, setQOpt2] = useState("");
  const [qOpt3, setQOpt3] = useState("");
  const [qOpt4, setQOpt4] = useState("");
  const [qCorrectIdx, setQCorrectIdx] = useState(0);
  const [qExplain, setQExplain] = useState("");

  useEffect(() => {
    let interval: any;
    if (isQuizActive && timerSecs > 0) {
      interval = setInterval(() => {
        setTimerSecs((prev) => prev - 1);
      }, 1000);
    } else if (timerSecs === 0 && isQuizActive) {
      // Auto submit on timeout
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [isQuizActive, timerSecs]);

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setActiveQuestionIdx(0);
    setSelectedAnswers({});
    setTimerSecs(quiz.durationMinutes * 60);
    setIsQuizActive(true);
    setQuizScore(null);
    setAiFeedback("");
  };

  const handleSelectOption = (questionId: string, optIdx: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optIdx
    });
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;
    setIsQuizActive(false);
    setSubmitting(true);
    try {
      const response = await api.submitQuiz(selectedQuiz.id, {
        studentId: user.id,
        studentName: user.name,
        answers: selectedAnswers
      });
      setQuizScore(response.score);
      setAiFeedback(response.aiFeedback);
      
      const score = response.score;
      if (adaptiveMode) {
        if (score >= 80) {
          setAiDifficulty("Hard");
          setAdaptiveLog(`Score was high (${score}%). Adaptive engine raised difficulty to Hard for your next quiz.`);
        } else if (score < 50) {
          setAiDifficulty("Easy");
          setAdaptiveLog(`Score was low (${score}%). Adaptive engine lowered difficulty to Easy for your next quiz.`);
        } else {
          setAiDifficulty("Medium");
          setAdaptiveLog(`Score was balanced (${score}%). Adaptive engine adjusted difficulty to Medium.`);
        }
      }
    } catch (err) {
      alert("Error grading assessment: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddQuestion = () => {
    if (!qText || !qOpt1 || !qOpt2) return;
    const newQ: QuizQuestion = {
      id: "q_" + Math.random().toString(36).substring(2, 9),
      question: qText,
      options: [qOpt1, qOpt2, qOpt3, qOpt4].filter(Boolean),
      correctOptionIndex: qCorrectIdx,
      explanation: qExplain || "Correct option selected successfully."
    };
    setNewQuizQuestions([...newQuizQuestions, newQ]);
    
    // reset fields
    setQText("");
    setQOpt1("");
    setQOpt2("");
    setQOpt3("");
    setQOpt4("");
    setQExplain("");
  };

  const handlePublishQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle || newQuizQuestions.length === 0) return;
    try {
      await api.createQuiz({
        courseId: newQuizCourse,
        courseTitle: "Syllabus Course",
        title: newQuizTitle,
        description: newQuizDesc,
        durationMinutes: 10,
        questions: newQuizQuestions,
        facultyId: user.id
      });
      setNewQuizTitle("");
      setNewQuizDesc("");
      setNewQuizQuestions([]);
      setShowCreateQuiz(false);
      onQuizAdded();
    } catch (err) {
      alert("Error publishing quiz: " + err);
    }
  };

  // Helper for rendering timer format
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (selectedQuiz) {
    const activeQuestion = selectedQuiz.questions[activeQuestionIdx];
    
    return (
      <div className="space-y-6 animate-fade-in text-slate-700">
        {/* Header toolbar */}
        <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-600" />
            <span className="font-sans text-sm text-slate-800 font-bold">{selectedQuiz.title}</span>
          </div>

          {isQuizActive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-lg text-amber-700 font-mono text-xs font-bold">
              <Clock className="h-3.5 w-3.5 animate-pulse" />
              <span>{formatTimer(timerSecs)}</span>
            </div>
          )}
        </div>

        {/* Results Screen */}
        {quizScore !== null ? (
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-2xl space-y-6 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 font-sans">Assessment Grading Completed!</h3>
              <p className="text-xs text-slate-500">Score has been locked to database profiles. XP rewards have been updated.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 inline-block">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Your Grade</span>
              <span className="text-3xl font-black text-blue-600">{quizScore}%</span>
            </div>

            <div className="text-left p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
              <span className="text-[10px] font-bold text-blue-800 uppercase flex items-center gap-1.5">
                ✦ EduReach AI Assessment Summary
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiFeedback}</p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Return to Assessment List
              </button>
            </div>
          </div>
        ) : submitting ? (
          <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4">
            <Clock className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Grading solutions and compiling feedback metrics...</p>
          </div>
        ) : (
          /* Active Question layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 p-6 rounded-xl space-y-5 shadow-xs">
                <div className="flex justify-between text-xs text-slate-400 font-bold">
                  <span>Question {activeQuestionIdx + 1} of {selectedQuiz.questions.length}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-800 leading-relaxed">{activeQuestion.question}</h4>

                {/* Question Options */}
                <div className="space-y-3">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[activeQuestion.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        id={`btn-quiz-opt-${oIdx}`}
                        onClick={() => handleSelectOption(activeQuestion.id, oIdx)}
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

                {activeQuestionIdx === selectedQuiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                  >
                    Finish Assessment
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveQuestionIdx(Math.min(selectedQuiz.questions.length - 1, activeQuestionIdx + 1))}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>

            {/* Quick overview side table */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sheet Progress</h4>
              <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-xs">
                <div className="grid grid-cols-5 gap-2.5">
                  {selectedQuiz.questions.map((q, idx) => {
                    const answered = selectedAnswers[q.id] !== undefined;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setActiveQuestionIdx(idx)}
                        className={`h-10 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${
                          activeQuestionIdx === idx 
                            ? "bg-blue-600 border-blue-500 text-white shadow-xs" 
                            : answered 
                              ? "bg-blue-50 border-blue-200 text-blue-600" 
                              : "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
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
          <h2 className="text-xl font-black text-slate-800 font-sans">Quizzes & Assessments</h2>
          <p className="text-xs text-slate-500 mt-1">Test your concepts, optimize your local skill scorecard, and receive immediate corrective AI tips.</p>
        </div>

        {user.role === UserRole.FACULTY && (
          <button 
            id="btn-create-quiz"
            onClick={() => setShowCreateQuiz(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" /> Create Assessment
          </button>
        )}
      </div>

      {/* Tab bar header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveQuizTab("arena")}
          className={`px-6 py-2.5 text-xs font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeQuizTab === "arena" 
              ? "border-blue-600 text-blue-600 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          🎓 AI Quiz Arena
        </button>
        <button
          onClick={() => setActiveQuizTab("exam")}
          className={`px-6 py-2.5 text-xs font-bold border-b-2 transition-all duration-150 cursor-pointer ${
            activeQuizTab === "exam" 
              ? "border-blue-600 text-blue-600 font-extrabold" 
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          📄 AI Exam Paper Generator
        </button>
      </div>

      {activeQuizTab === "arena" ? (
        <>
          {/* 🚀 Dynamic AI-Powered Quiz Arena Card */}
          <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 border border-blue-100/40 p-6 rounded-2xl space-y-5 relative overflow-hidden shadow-xs">
            <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100/80 border border-blue-200/50 rounded-lg text-blue-650">
                <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans">Instant AI Topic-Wise Assessment Builder</h3>
                <p className="text-[11px] text-blue-700 font-bold">Personalized multi-choice assessments generated on-demand by Gemini AI.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-1">
              {/* Topic selector */}
              <div className="space-y-2 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-500">Specify Subject Topic or Custom Concept</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Dynamic Programming, Redux state slices, Docker orchestration..."
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
                />
                {/* Quick topics capsules */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {popularTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setAiTopic(topic)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                        aiTopic === topic
                          ? "bg-blue-50 text-blue-700 border-blue-150"
                          : "bg-white text-slate-500 border-slate-200 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Adaptive Learning Toggle (CS Adaptive Engine Spec Feature 2) */}
              <div className="bg-blue-50/50 dark:bg-slate-905 border border-blue-105 dark:border-slate-850 p-4 rounded-xl flex items-center justify-between animate-fade-in">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    ⚙️ Adaptive Learning Engine
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-normal">
                    Dynamically raises or lowers question complexity depending on your scores.
                  </span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={adaptiveMode}
                    onChange={(e) => {
                      setAdaptiveMode(e.target.checked);
                      if (e.target.checked) {
                        setAdaptiveLog("Adaptive engine calibrated: ready to monitor scores.");
                      } else {
                        setAdaptiveLog("");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-650 peer-checked:bg-blue-650"></div>
                </label>
              </div>

              {adaptiveLog && (
                <div className="text-[9px] font-mono text-blue-650 dark:text-blue-400 bg-blue-50/30 p-2 rounded border border-blue-200/20">
                  💡 Engine Log: {adaptiveLog}
                </div>
              )}

              {/* Difficulty and count controls */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-405 uppercase">Difficulty</label>
                    <select
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-705 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-405 uppercase">Type</label>
                    <select
                      value={aiQuestionType}
                      onChange={(e) => setAiQuestionType(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-slate-705 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                    >
                      <option value="mcq">MCQ</option>
                      <option value="true_false">True/False</option>
                      <option value="fill_in_blanks">Blanks</option>
                      <option value="mix">Mix</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-405 uppercase">Questions</label>
                    <select
                      value={qCount}
                      onChange={(e) => setQCount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 text-slate-705 rounded-lg px-2 py-1.5 text-[11px] focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                    >
                      <option value={3}>3 Qs</option>
                      <option value={5}>5 Qs</option>
                      <option value={10}>10 Qs</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateAIQuiz}
                  disabled={generatingQuiz || !aiTopic}
                  className="w-full h-9 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-100 cursor-pointer"
                >
                  {generatingQuiz ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin text-white" />
                      <span>Synthesizing Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Generate & Start Arena</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {quizzes.map((quiz) => (
              <div 
                key={quiz.id}
                className="bg-white border border-slate-100 hover:border-slate-250 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all shadow-xs"
              >
                <div className="space-y-2.5">
                  <span className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded">
                    {quiz.courseTitle}
                  </span>
                  <h3 className="text-base font-black text-slate-800 leading-tight mt-2">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{quiz.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {quiz.durationMinutes} mins
                  </span>

                  {user.role === UserRole.STUDENT && (
                    <button
                      id={`btn-attempt-quiz-${quiz.id}`}
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      Attempt Quiz
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Controls Card */}
          <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 border border-blue-100/40 p-6 rounded-2xl space-y-5 relative overflow-hidden shadow-xs">
            <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans font-extrabold">Instant AI Academic Exam Compiler</h3>
                <p className="text-[11px] text-indigo-650 font-bold">Generates print-ready formal examination papers with MCQs, programming questions, and descriptive essays.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-slate-500">Specify Topic Benchmark (e.g. Java, Python, AI, Web Dev)</label>
                <input
                  type="text"
                  value={examTopic}
                  onChange={(e) => setExamTopic(e.target.value)}
                  placeholder="e.g. Java Object Oriented Programming, Python Data Analysis, Web Security"
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium shadow-2xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">Difficulty Tier</label>
                <select
                  value={examDifficulty}
                  onChange={(e) => setExamDifficulty(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium cursor-pointer shadow-2xs"
                >
                  <option value="Easy">Easy Benchmark</option>
                  <option value="Medium">Medium Academic</option>
                  <option value="Hard">Hard Rigorous</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500">Practice Question Types</label>
                <select
                  value={examQuestionType}
                  onChange={(e) => setExamQuestionType(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium cursor-pointer shadow-2xs"
                >
                  <option value="mix">Mix Sections (Default)</option>
                  <option value="mcq">Multiple Choice Only</option>
                  <option value="coding">Coding Challenges Only</option>
                  <option value="descriptive">Descriptive Only</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={handleGenerateExam}
                disabled={generatingExam}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
              >
                {generatingExam ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-yellow-350" />
                )}
                <span>Compile Question Paper</span>
              </button>
            </div>
          </div>

          {generatingExam && (
            <div className="py-20 bg-white border border-slate-100 rounded-2xl text-center space-y-4">
              <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Synthesizing multiple assessment sections and creating model answer scheme...</p>
            </div>
          )}

          {!generatingExam && examPaper && (
            <div className="space-y-6 animate-fade-in">
              {/* Paper Actions Toolbar */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-500">Output status: Question paper compiled successfully</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowScheme(!showScheme)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-bold cursor-pointer"
                  >
                    {showScheme ? "Hide Solutions" : "Reveal Answer & Solutions Key"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-bold cursor-pointer"
                  >
                    Print / Save PDF
                  </button>
                </div>
              </div>

              {/* Printable Question Paper layout */}
              <div className="bg-white border border-slate-150 rounded-2xl p-8 md:p-12 shadow-xs space-y-8 font-serif" id="print-exam-paper">
                <div className="text-center space-y-2 border-b-2 border-slate-800 pb-5">
                  <h4 className="text-base font-bold tracking-widest text-slate-800">EDU-REACH ACADEMIC PORTAL</h4>
                  <h5 className="text-sm font-bold text-slate-600 uppercase tracking-widest">MID-TERM SYLLABUS EVALUATION</h5>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2 uppercase">{examPaper.title}</h3>
                  <div className="flex justify-between items-center text-xs font-bold font-mono pt-3 px-4 text-slate-500">
                    <span>DURATION: {examPaper.durationMinutes} MINS</span>
                    <span>MAX MARKS: {examPaper.totalMarks} MARKS</span>
                  </div>
                </div>

                {/* Section A: MCQs */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold border-b border-slate-200 pb-1 font-mono uppercase text-slate-750">SECTION A: CONCEPTUAL MULTIPLE CHOICE QUESTIONS (15 MARKS)</h5>
                  <div className="space-y-6 pl-2">
                    {examPaper.mcqs?.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="space-y-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-800 leading-normal">
                            Q{qIdx + 1}. {q.question}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">(5 Marks)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-3">
                          {q.options?.map((opt: string, oIdx: number) => (
                            <span key={oIdx} className="text-xs text-slate-600">
                              ({String.fromCharCode(65 + oIdx)}) {opt}
                            </span>
                          ))}
                        </div>
                        {showScheme && (
                          <div className="p-3 bg-indigo-50/50 rounded-lg text-xs leading-relaxed font-sans text-indigo-900 border-l-4 border-indigo-500">
                            <strong>Correct Option: ({String.fromCharCode(65 + q.correctOptionIndex)})</strong> — {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Coding */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold border-b border-slate-200 pb-1 font-mono uppercase text-slate-750">SECTION B: SANDBOX PROGRAMMING & ALGORITHMIC LAB (20 MARKS)</h5>
                  <div className="space-y-5 pl-2">
                    {examPaper.coding?.map((c: any, cIdx: number) => (
                      <div key={cIdx} className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-800 leading-normal font-sans">
                            Q{examPaper.mcqs?.length + cIdx + 1}. {c.question}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">(20 Marks)</span>
                        </div>
                        <pre className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 overflow-x-auto leading-normal">
                          {c.starterCode}
                        </pre>
                        {showScheme && (
                          <div className="p-4 bg-indigo-50/50 rounded-xl space-y-3 font-sans text-xs border-l-4 border-indigo-500">
                            <div className="font-bold text-indigo-900">Model Solution Code (Python Reference):</div>
                            <pre className="p-3 bg-white border border-slate-150 rounded font-mono text-[10.5px] text-slate-700 overflow-x-auto">
                              {c.expectedSolution}
                            </pre>
                            <p className="text-indigo-955 leading-relaxed"><strong>Solution Logic Analysis:</strong> {c.explanation}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Descriptive */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold border-b border-slate-200 pb-1 font-mono uppercase text-slate-750">SECTION C: CRITICAL SYSTEM DESIGN & THEORY (15 MARKS)</h5>
                  <div className="space-y-5 pl-2">
                    {examPaper.descriptive?.map((d: any, dIdx: number) => (
                      <div key={dIdx} className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-bold text-slate-800 leading-normal font-sans">
                            Q{examPaper.mcqs?.length + examPaper.coding?.length + dIdx + 1}. {d.question}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">(15 Marks)</span>
                        </div>
                        {showScheme && (
                          <div className="p-4 bg-indigo-50/50 rounded-xl space-y-3 font-sans text-xs border-l-4 border-indigo-500">
                            <p className="text-indigo-955"><strong>Expected Model Essay Answer:</strong> {d.modelAnswer}</p>
                            <p className="text-indigo-955"><strong>Grading Scheme Rubrics:</strong> {d.markingCriteria}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-slate-800 font-sans">Design Assessment Quiz</h3>
            <form onSubmit={handlePublishQuiz} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Quiz Title</label>
                  <input 
                    type="text" 
                    value={newQuizTitle}
                    onChange={(e) => setNewQuizTitle(e.target.value)}
                    required
                    placeholder="e.g. Trees Traversals Assessment"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Target Course ID</label>
                  <select
                    value={newQuizCourse}
                    onChange={(e) => setNewQuizCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option value="course_1">Mastering Data Structures</option>
                    <option value="course_2">Java Backend with Spring Boot</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Summary / Guidelines</label>
                <textarea 
                  value={newQuizDesc}
                  onChange={(e) => setNewQuizDesc(e.target.value)}
                  rows={2}
                  placeholder="e.g. Standard multiple-choice chapter test..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 resize-none font-semibold"
                />
              </div>

              {/* Added questions list */}
              {newQuizQuestions.length > 0 && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Added Questions ({newQuizQuestions.length})</span>
                  {newQuizQuestions.map((q, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex items-center justify-between gap-4">
                      <span className="truncate font-semibold">{idx + 1}. {q.question}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Single question constructor */}
              <div className="p-4 bg-slate-50/50 border border-slate-200/50 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-700 font-sans">Add Question Component</h4>
                <div className="space-y-1.5">
                  <input 
                    type="text"
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    placeholder="Type the question query..."
                    className="w-full bg-white border border-slate-200 focus:outline-none focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <input 
                    type="text"
                    value={qOpt1}
                    onChange={(e) => setQOpt1(e.target.value)}
                    placeholder="Option A"
                    className="w-full bg-white border border-slate-200 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                  />
                  <input 
                    type="text"
                    value={qOpt2}
                    onChange={(e) => setQOpt2(e.target.value)}
                    placeholder="Option B"
                    className="w-full bg-white border border-slate-200 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                  />
                  <input 
                    type="text"
                    value={qOpt3}
                    onChange={(e) => setQOpt3(e.target.value)}
                    placeholder="Option C"
                    className="w-full bg-white border border-slate-200 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                  />
                  <input 
                    type="text"
                    value={qOpt4}
                    onChange={(e) => setQOpt4(e.target.value)}
                    placeholder="Option D"
                    className="w-full bg-white border border-slate-200 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Correct Option</label>
                    <select
                      value={qCorrectIdx}
                      onChange={(e) => setQCorrectIdx(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:outline-none rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-semibold"
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">AI Explanation Advice</label>
                    <input 
                      type="text"
                      value={qExplain}
                      onChange={(e) => setQExplain(e.target.value)}
                      placeholder="Why is this option correct?"
                      className="w-full bg-white border border-slate-200 focus:outline-none rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg transition-colors border border-blue-100"
                >
                  + Append Question Component
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateQuiz(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={newQuizQuestions.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                >
                  Publish Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
