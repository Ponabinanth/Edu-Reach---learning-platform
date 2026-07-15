import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Sparkles, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  X, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Image as ImageIcon, 
  Trash2, 
  Camera 
} from "lucide-react";
import { api } from "../api";

interface QuizChoice {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export default function AITutor() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseMarkdown, setResponseMarkdown] = useState("");
  const [customQuiz, setCustomQuiz] = useState<QuizChoice | null>(null);
  
  // Style config
  const [explanationStyle, setExplanationStyle] = useState("definition-analogy-code");
  const [language, setLanguage] = useState("English");

  // AI Provider state
  const [aiProvider, setAiProvider] = useState(() => {
    return localStorage.getItem("edureach_ai_provider") || "gemini";
  });

  useEffect(() => {
    localStorage.setItem("edureach_ai_provider", aiProvider);
  }, [aiProvider]);

  // Image upload states
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Speech Recognition (Voice to Text) states
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Speech Synthesis (Text to Speech) states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Rapid quick prompt buttons
  const sampleTopics = [
    "Binary Search Tree",
    "Tail Recursion",
    "OAuth2 JWT Flow",
    "Spring Boot Dependency Injection",
    "React Hooks vs Class Lifecycles"
  ];

  useEffect(() => {
    // Initialize Web Speech Synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    // Initialize Web Speech Recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTopic((prev) => (prev ? prev + " " + transcript : transcript));
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error: ", event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Speak response aloud
  const handleToggleSpeak = () => {
    if (!synthRef.current || !responseMarkdown) return;

    if (isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting symbols for a clean speech output
    const cleanText = responseMarkdown
      .replace(/[\#\*\_`\-\>\[\]\(\)]/g, " ")
      .substring(0, 450); // speak the summary/intro first

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt language matching
    if (language === "Spanish") utterance.lang = "es-ES";
    else if (language === "French") utterance.lang = "fr-FR";
    else if (language === "German") utterance.lang = "de-DE";
    else if (language === "Hindi") utterance.lang = "hi-IN";
    else utterance.lang = "en-US";

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  // Toggle voice-to-text recording
  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Safari or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Process uploaded photo to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAskTutor = async (customTopic?: string) => {
    const activeTopic = customTopic || topic;
    if (!activeTopic && !uploadedImage) return;

    // Cancel speech if speaking
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    setLoading(true);
    setResponseMarkdown("");
    setCustomQuiz(null);
    setQuizChecked(false);
    setSelectedAnswer(null);

    const stylePrompt = 
      explanationStyle === "analogy" 
        ? "Focus heavily on real-world analogies first to build deep conceptual intuition before writing code."
        : explanationStyle === "rigorous"
          ? "Provide a highly formal computer science definition with mathematical time/space complexity bounds."
          : "Provide an organized layout following: 1. Core Definition, 2. Textual ASCII Tree/Chart Visual Model, 3. Annotated Code Block, 4. Simple MCQ Micro-Quiz with correct option index and short explanation.";

    const imageHeader = uploadedImage ? "[PHOTO QUESTION RESOLUTION WORKSPACE]\n" : "";

    try {
      const response = await api.askAITutor(
        `${imageHeader}Explain or solve the topic: "${activeTopic}" in ${language}. 
Style instructions: ${stylePrompt}
Keep the explanations concise, clean, and highly educational in clear Markdown format.`,
        undefined,
        uploadedImage || undefined,
        aiProvider
      );
      setResponseMarkdown(response.text);
      setCustomQuiz(response.quiz || null);
      if (!customTopic) setTopic("");
    } catch (err) {
      setResponseMarkdown("Sorry, I am unable to connect to the EduReach AI generative tutors. Please try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  // Micro-Quiz Client validation if model responds with one
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizChecked, setQuizChecked] = useState(false);

  // Fallback interactive quick check
  const localQuiz: QuizChoice = {
    question: "Which traversal of a Binary Search Tree produces values in sorted, ascending order?",
    options: ["Pre-order Traversal", "Post-order Traversal", "In-order Traversal", "Level-order Traversal"],
    correctOptionIndex: 2,
    explanation: "In-order traversal visits nodes in the sequence (Left Subtree, Root, Right Subtree), which naturally follows ascending sorted keys."
  };

  const activeQuiz = customQuiz || localQuiz;

  return (
    <div className="space-y-6 animate-fade-in text-slate-700 dark:text-slate-200">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/10 p-2.5 rounded-xl text-indigo-500 dark:text-indigo-400">
              <Cpu className="h-6.5 w-6.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white font-sans flex flex-wrap items-center gap-2">
                <span>AI Personal Tutor & Voice Assistant</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-mono font-bold select-none">
                  <span>⭐</span>
                  <span>🌙</span>
                  <span>🚀</span>
                  <span>⚖️</span>
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                Solve coding snapshots, use integrated speech commands, study complex theories, and hear spoken answers aloud.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15 font-mono text-[10px] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1">
              <Mic className="h-3 w-3 animate-pulse text-indigo-500" /> Voice Assistant Enabled
            </span>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/15 font-mono text-[10px] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1">
              <Camera className="h-3 w-3" /> Photo Solving Active
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Column */}
        <div className="space-y-6">
          {/* Config Station */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans">Syllabus Explainer Config</h3>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Concept Delivery Style</label>
              <select 
                value={explanationStyle} 
                onChange={(e) => setExplanationStyle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="definition-analogy-code">Full Module (Visual + Code + Quiz)</option>
                <option value="analogy">Analogy-First (Intuitive Concept focus)</option>
                <option value="rigorous">Mathematical Rigor (Time/Space bounds)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Language Support</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Hindi</option>
              </select>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Engine Provider</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiProvider("gemini")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    aiProvider === "gemini"
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Sparkles className={`h-3.5 w-3.5 ${aiProvider === "gemini" ? "text-yellow-300 animate-pulse" : "text-indigo-500"}`} />
                  Gemini Flash
                </button>
                <button
                  type="button"
                  onClick={() => setAiProvider("groq")}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                    aiProvider === "groq"
                      ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <Cpu className={`h-3.5 w-3.5 ${aiProvider === "groq" ? "text-pink-300 animate-pulse" : "text-purple-500"}`} />
                  Groq LLaMA
                </button>
              </div>
            </div>
          </div>

          {/* Quick Topics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300 font-sans">Quick-Launch Topics</h3>
            <div className="flex flex-col gap-2">
              {sampleTopics.map((topicStr, idx) => (
                <button
                  key={idx}
                  id={`btn-tutor-sample-${idx}`}
                  onClick={() => handleAskTutor(topicStr)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 hover:text-indigo-650 dark:hover:text-indigo-400 hover:bg-indigo-50/20 transition-all truncate"
                >
                  {topicStr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Output Screen */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Workspace Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
            {/* Thumbnail Preview for uploaded image */}
            {uploadedImage && (
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800/80 w-fit animate-fade-in">
                <div className="relative h-12 w-12 rounded border border-slate-350 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img src={uploadedImage} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 block">Snapshot attachment loaded</span>
                  <button 
                    onClick={() => setUploadedImage(null)}
                    className="text-[10px] font-mono text-rose-500 hover:underline flex items-center gap-0.5 mt-0.5"
                  >
                    <Trash2 className="h-3 w-3" /> Remove Photo
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAskTutor();
              }}
              className="flex gap-2"
            >
              {/* Voice mic activation */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); handleToggleRecord(); }}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                  isRecording 
                    ? "bg-rose-950/30 border-rose-500 text-rose-400 animate-pulse" 
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/30"
                }`}
                title={isRecording ? "Stop recording voice" : "Ask by speaking"}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Photo Upload Trigger */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                className="p-2.5 rounded-lg border bg-slate-50 dark:bg-slate-955 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/30 transition-all flex items-center justify-center cursor-pointer"
                title="Attach question image"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />

              <input 
                type="text" 
                id="input-ai-tutor-query"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={isRecording ? "Listening to your voice..." : "Ask your personal tutor anything or attach a question snapshot..."}
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 focus:border-indigo-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-850 dark:text-slate-200 font-sans"
              />

              <button 
                type="submit"
                disabled={loading || (!topic && !uploadedImage)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Ask</span>
              </button>
            </form>
            
            {isRecording && (
              <span className="text-[10px] font-mono text-rose-500 dark:text-rose-400/80 animate-pulse block px-1">
                ● Recording active. Please speak clearly into your microphone...
              </span>
            )}
          </div>

          {/* Explanation Output Area */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden min-h-[380px] flex flex-col justify-between">
            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-28 space-y-4">
                  <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-500">Formulating optimal steps & visual charts...</span>
                </div>
              ) : responseMarkdown ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" /> EduReach AI Tutor Explanation
                    </span>
                    
                    {/* Voice play response button */}
                    <button
                      onClick={handleToggleSpeak}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                        isSpeaking 
                          ? "bg-rose-950/20 border-rose-500 text-rose-400" 
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/25"
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="h-3.5 w-3.5 animate-bounce" /> Stop Audio
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5" /> Read Out Loud
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Styled Markdown content */}
                  <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans space-y-3">
                    {renderMarkdown(responseMarkdown)}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-28 text-slate-400 dark:text-slate-500">
                  <Cpu className="h-12 w-12 text-slate-300 dark:text-slate-700 mb-3" />
                  <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400">Tutor Workstation Idle</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-650 max-w-sm mt-1 font-sans">
                    Select a topic, type your question, attach an image, or use the microphone to talk.
                  </p>
                </div>
              )}
            </div>

            {/* Embedded concept micro-quiz container */}
            {responseMarkdown && !loading && (
              <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-yellow-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wide">Concept Check Point</h4>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium font-sans">{activeQuiz.question}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeQuiz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      id={`btn-microquiz-opt-${idx}`}
                      onClick={() => { if (!quizChecked) setSelectedAnswer(idx); }}
                      className={`text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedAnswer === idx 
                          ? "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-650 dark:text-indigo-300 font-bold" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer === idx && <Check className="h-3.5 w-3.5 text-indigo-650 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setQuizChecked(true)}
                    disabled={selectedAnswer === null}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-[10px] font-bold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    Check Answer
                  </button>
                  {quizChecked && (
                    <span className="text-xs font-mono">
                      {selectedAnswer === activeQuiz.correctOptionIndex ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="h-4 w-4" /> Correct explanation!
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                          <X className="h-4 w-4" /> Oops! Try again.
                        </span>
                      )}
                    </span>
                  )}
                </div>

                {quizChecked && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-200 dark:border-slate-800/60 font-sans italic">
                    {activeQuiz.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Markdown parser helper function for premium design visuals
function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLanguage = "";

  return lines.map((line, idx) => {
    // Handle code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        const codeText = codeBlockLines.join("\n");
        codeBlockLines = [];
        return (
          <div key={idx} className="my-3.5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 dark:bg-black font-mono text-[11px] text-slate-300 p-4 leading-relaxed overflow-x-auto select-text">
            {codeLanguage && (
              <div className="text-[9px] uppercase font-bold text-slate-500 mb-2.5 border-b border-slate-900 pb-1.5 select-none font-sans tracking-wider">
                💡 {codeLanguage} Code Snapshot
              </div>
            )}
            <pre className="whitespace-pre">{codeText}</pre>
          </div>
        );
      } else {
        inCodeBlock = true;
        codeLanguage = line.replace("```", "").trim();
        return null;
      }
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return null;
    }

    // Handle Headers
    if (line.startsWith("### ")) {
      return <h4 key={idx} className="text-xs font-black text-slate-900 dark:text-white mt-4 mb-1.5 font-display uppercase tracking-wide">{line.replace("### ", "")}</h4>;
    }
    if (line.startsWith("## ")) {
      return <h3 key={idx} className="text-sm font-black text-slate-900 dark:text-white mt-5 mb-2 font-display border-b border-slate-100 dark:border-slate-850 pb-1">{line.replace("## ", "")}</h3>;
    }
    if (line.startsWith("# ")) {
      return <h2 key={idx} className="text-base font-black text-slate-900 dark:text-white mt-6 mb-3 font-display border-b border-slate-200 dark:border-slate-800 pb-1.5">{line.replace("# ", "")}</h2>;
    }

    // Handle bullet points
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const cleanLine = line.replace(/^[\s]*[\-\*]\s/, "");
      return (
        <ul key={idx} className="list-disc list-inside ml-4 space-y-1.5 my-1.5">
          <li className="text-xs text-slate-650 dark:text-slate-350">{parseInlineStyle(cleanLine)}</li>
        </ul>
      );
    }

    // Empty lines
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }

    // Standard paragraph
    return (
      <p key={idx} className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed my-1.5 font-sans">
        {parseInlineStyle(line)}
      </p>
    );
  });
}

function parseInlineStyle(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-extrabold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 font-mono text-[10px] text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
