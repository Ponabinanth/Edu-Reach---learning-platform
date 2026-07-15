import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Sparkles, Send, RefreshCw, X, HelpCircle, 
  BookOpen, Award, Zap, Cpu, Heart, CheckCircle,
  GraduationCap, FileText, Briefcase, Code2, ClipboardCheck, Compass, Mic, Clock
} from "lucide-react";
import { api } from "../api";
import { UserProfile } from "../types";

interface SupportChatbotProps {
  user: UserProfile;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function SupportChatbot({ user }: SupportChatbotProps) {
  const [selectedAgent, setSelectedAgent] = useState("assistant");
  const [agentMessages, setAgentMessages] = useState<Record<string, Message[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(() => {
    return localStorage.getItem("edu_ai_provider") || "gemini";
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    {
      id: "assistant",
      name: "AI Assistant",
      description: "General companion for learning, research, and coding tasks.",
      icon: MessageSquare,
      color: "bg-blue-500/10 border-blue-500/30 text-blue-500",
      themeColor: "blue",
      borderColor: "hover:border-blue-500/30",
      activeClass: "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20",
      welcome: `Welcome back, ${user.name}! I am your EduReach AI Assistant. Ask me anything about recruitment prep, coding round details, or general academic topics.`,
      faqs: [
        { label: "Placement Hub guide", text: "Can you guide me on how the Placement Hub drive simulator works and what rounds are included?" },
        { label: "LaTeX Resume help", text: "How do I create an AI resume and export the valid LaTeX code to Overleaf?" },
        { label: "Aptitude round info", text: "What topics are covered in the Aptitude mock assessment and how are they graded?" },
        { label: "Streaks & XP math", text: "How does the gamification streak system and lesson XP rewards calculation work?" }
      ]
    },
    {
      id: "interview_coach",
      name: "Interview Coach",
      description: "Practice technical/HR mock interviews with detailed feedback.",
      icon: GraduationCap,
      color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-405",
      themeColor: "indigo",
      borderColor: "hover:border-indigo-500/30",
      activeClass: "bg-indigo-650 border-indigo-650 text-white shadow-lg shadow-indigo-650/20",
      welcome: `Hello ${user.name}! I am your AI Interview Coach. Let's practice. Would you like a Technical mock interview or an HR interview?`,
      faqs: [
        { label: "Start HR Mock", text: "Start a mock HR interview for a software engineering role." },
        { label: "DSA Tree Question", text: "Ask me a medium-level data structures question on binary search trees." },
        { label: "Top HR Questions", text: "What are the most common HR interview questions and how should I answer them?" },
        { label: "How feedback works", text: "Explain how my interview answers will be evaluated and scored." }
      ]
    },
    {
      id: "resume_builder",
      name: "Resume Builder",
      description: "Audit resume content, draft sections, and optimize ATS.",
      icon: FileText,
      color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      themeColor: "emerald",
      borderColor: "hover:border-emerald-500/30",
      activeClass: "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20",
      welcome: `Hi ${user.name}! I am your AI Resume Builder. Paste your resume text or draft sections here, and I'll analyze it for ATS keywords and impact verbs.`,
      faqs: [
        { label: "Rewrite my summary", text: "Here is my summary: 'Passionate coding student looking for a junior developer job.' How can I rewrite this to be high-impact?" },
        { label: "Strong action verbs", text: "What are 10 strong action verbs I can use in my project section?" },
        { label: "Quantifying bullets", text: "How do I add quantifiable achievements to my resume if my project didn't have real users?" },
        { label: "LaTeX Template", text: "Provide a clean LaTeX resume template that compiles on Overleaf." }
      ]
    },
    {
      id: "career_advisor",
      name: "Career Advisor",
      description: "Get guidance on job roles, career paths, and certifications.",
      icon: Briefcase,
      color: "bg-violet-500/10 border-violet-500/30 text-violet-400",
      themeColor: "violet",
      borderColor: "hover:border-violet-500/30",
      activeClass: "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-600/20",
      welcome: `Hello ${user.name}! I'm your AI Career Advisor. Tell me about your favorite subjects, and let's explore matching developer career paths.`,
      faqs: [
        { label: "DevOps Engineer path", text: "What is the typical career path and skill stack required for a DevOps Engineer?" },
        { label: "Java backend certs", text: "Which industry certifications should I get to boost my backend developer profile?" },
        { label: "Standout projects", text: "Suggest a unique full-stack project that will catch a recruiter's eye." },
        { label: "Web dev roles", text: "I like design and logic. Should I focus on Frontend, Backend, or Full Stack?" }
      ]
    },
    {
      id: "coding_mentor",
      name: "Coding Mentor",
      description: "Debug code, explain syntax, and optimize algorithms.",
      icon: Code2,
      color: "bg-pink-500/10 border-pink-500/30 text-pink-400",
      themeColor: "pink",
      borderColor: "hover:border-pink-500/30",
      activeClass: "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-600/20",
      welcome: `Greetings ${user.name}! I am your AI Coding Mentor. Paste your buggy code or describe the algorithm you are trying to implement.`,
      faqs: [
        { label: "BST traversal guide", text: "Explain the two-pointer approach for the Two Sum problem with code." },
        { label: "NullPointer prevention", text: "Why do I get a NullPointerException in Java and how do I prevent it?" },
        { label: "HashMap optimization", text: "How can I optimize an O(N^2) double-loop search to O(N) using a HashMap?" },
        { label: "RESTful principles", text: "Explain REST API design principles simply with HTTP methods and status codes." }
      ]
    },
    {
      id: "exam_generator",
      name: "Exam Generator",
      description: "Create mock exams, practice MCQs, and detailed keys.",
      icon: ClipboardCheck,
      color: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      themeColor: "rose",
      borderColor: "hover:border-rose-500/30",
      activeClass: "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-600/20",
      welcome: `Hello ${user.name}! I am your AI Exam Generator. What topic and difficulty level (Beginner/Intermediate/Advanced) would you like to be tested on?`,
      faqs: [
        { label: "DSA MCQ practice", text: "Generate 3 medium-difficulty MCQs on Stacks and Queues." },
        { label: "SQL joins mock", text: "Create a practice SQL exam covering joins, subqueries, and grouping." },
        { label: "OS scheduling quiz", text: "Give me 5 True/False questions on Operating Systems: CPU Scheduling." },
        { label: "Compiler vs Interpreter", text: "What is the difference between compiler and interpreter? Generate a test question for it." }
      ]
    },
    {
      id: "notes_generator",
      name: "Notes Generator",
      description: "Summarize text, create key takeaways, and flashcards.",
      icon: BookOpen,
      color: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
      themeColor: "cyan",
      borderColor: "hover:border-cyan-500/30",
      activeClass: "bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-600/20",
      welcome: `Hi there ${user.name}! I am your AI Notes Generator. Paste the text from your study material or lecture notes, and I'll generate a structured study guide.`,
      faqs: [
        { label: "OOP four pillars", text: "Summarize the four pillars of Object-Oriented Programming (OOP) with brief definitions." },
        { label: "DBMS ACID flashcards", text: "Create 3 flashcards for database ACID properties (Atomicity, Consistency, Isolation, Durability)." },
        { label: "Networking summary", text: "Extract the key takeaways from a lesson about DNS and the TCP 3-way handshake." },
        { label: "ML paradigms notes", text: "Generate a study summary sheet for Machine Learning supervised vs unsupervised paradigms." }
      ]
    },
    {
      id: "study_planner",
      name: "Study Planner",
      description: "Create customized schedules and daily milestones.",
      icon: Clock,
      color: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      themeColor: "amber",
      borderColor: "hover:border-amber-500/30",
      activeClass: "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20",
      welcome: `Hello ${user.name}! I am your AI Study Planner. What is your learning goal (e.g. 'Master React', 'Pass DSA interview') and how many hours a week do you have?`,
      faqs: [
        { label: "React hooks schedule", text: "Create a 2-week daily study plan for a beginner learning React hooks." },
        { label: "DSA interview calendar", text: "Suggest a 4-week prep schedule for coding interviews if I have 2 hours daily." },
        { label: "Coding time balancing", text: "How can I balance college coursework with 30 minutes of daily coding practice?" },
        { label: "Spring Boot roadmap", text: "Break down the goal 'Learn Spring Boot backend development' into daily target tasks." }
      ]
    },
    {
      id: "roadmap_generator",
      name: "Roadmap Generator",
      description: "Build zero-to-hero career and technology maps.",
      icon: Compass,
      color: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      themeColor: "purple",
      borderColor: "hover:border-purple-500/30",
      activeClass: "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/20",
      welcome: `Hello ${user.name}! I am your AI Roadmap Generator. Tell me what job role or technology you want to learn, and I'll map out the exact learning path.`,
      faqs: [
        { label: "ML Engineer Roadmap", text: "Create a step-by-step roadmap to become a Machine Learning Engineer starting from scratch." },
        { label: "System Design steps", text: "Map out the stages for learning System Design and Scalability for mid-level engineers." },
        { label: "Cloud Engineer roadmap", text: "What is the sequential technology stack to learn to become an AWS Cloud Engineer?" },
        { label: "Java Developer roadmap", text: "Provide a learning roadmap for Java Spring Boot backend developer." }
      ]
    },
    {
      id: "voice_assistant",
      name: "Voice Assistant",
      description: "Concise conversational buddy optimized for read-aloud text.",
      icon: Mic,
      color: "bg-teal-500/10 border-teal-500/30 text-teal-400",
      themeColor: "teal",
      borderColor: "hover:border-teal-500/30",
      activeClass: "bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-600/20",
      welcome: `Hi ${user.name}! I'm your AI Voice Assistant. Ask me your questions. I'll provide short, conversational explanations that sound great when read out loud.`,
      faqs: [
        { label: "DNS definition", text: "Explain how Domain Name System (DNS) works in 2 simple sentences." },
        { label: "CAP Theorem speech", text: "Explain the CAP Theorem in simple words suitable for speech." },
        { label: "Big O verbal explanation", text: "Explain what Big O notation is in a conversational tone under 1 minute." },
        { label: "Recursion analogy", text: "What is recursion? Give me a short, friendly, spoken-friendly definition." }
      ]
    }
  ];

  const currentAgentData = agents.find(a => a.id === selectedAgent) || agents[0];
  const messages = agentMessages[selectedAgent] || [
    { sender: "bot", text: currentAgentData.welcome, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
  ];

  // System stats card data
  const stats = [
    { label: "Agent Engine", value: provider === "groq" ? "Groq LLaMA 3" : "Gemini 2.0 Flash", icon: Cpu, color: "text-indigo-400" },
    { label: "Live Streak", value: `${user.streak || 0} Days`, icon: Zap, color: "text-yellow-400" },
    { label: "User Level", value: `Lvl ${user.level || 1}`, icon: Award, color: "text-emerald-400" }
  ];

  const getAgentIdFromName = (name: string): string => {
    if (!name) return "assistant";
    if (name.includes("Interview Coach")) return "interview_coach";
    if (name.includes("Resume Builder")) return "resume_builder";
    if (name.includes("Career Advisor")) return "career_advisor";
    if (name.includes("Coding Mentor")) return "coding_mentor";
    if (name.includes("Exam Generator")) return "exam_generator";
    if (name.includes("Notes Generator")) return "notes_generator";
    if (name.includes("Study Planner")) return "study_planner";
    if (name.includes("Roadmap Generator")) return "roadmap_generator";
    if (name.includes("Voice Assistant")) return "voice_assistant";
    return "assistant";
  };

  // Load chat history
  useEffect(() => {
    const fetchChatLogs = async () => {
      try {
        const chatLogs = await api.getChatMessages(user.id);
        
        // Initialize empty lists with defaults
        const initialMsgs: Record<string, Message[]> = {};
        agents.forEach(a => {
          initialMsgs[a.id] = [
            { sender: "bot", text: a.welcome, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          ];
        });

        if (chatLogs && chatLogs.length > 0) {
          // Group database log messages by classified agent
          chatLogs.forEach((msg: any) => {
            if (msg.senderId === "ai_assistant" || msg.receiverId === "ai_assistant") {
              const text = msg.text;
              const sender = msg.senderId === "ai_assistant" ? "bot" : "user";
              const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const agentId = getAgentIdFromName(msg.senderName || msg.receiverName || "");
              
              // Clear default welcome message on first parsed chat log item
              if (
                initialMsgs[agentId].length === 1 && 
                initialMsgs[agentId][0].text === agents.find(a => a.id === agentId)?.welcome
              ) {
                initialMsgs[agentId] = [];
              }
              
              initialMsgs[agentId].push({ sender, text, time });
            }
          });

          // Enforce active welcome placeholders if no log history exists for a specific agent
          agents.forEach(a => {
            if (initialMsgs[a.id].length === 0) {
              initialMsgs[a.id] = [
                { sender: "bot", text: a.welcome, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
              ];
            }
          });
        }
        setAgentMessages(initialMsgs);
      } catch (err) {
        // Local error fallbacks
        const fallbackMsgs: Record<string, Message[]> = {};
        agents.forEach(a => {
          fallbackMsgs[a.id] = [
            { sender: "bot", text: `Hello ${user.name}! I am your ${a.name}. I am currently running on offline local support logs. How can I help you?`, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          ];
        });
        setAgentMessages(fallbackMsgs);
      }
    };
    fetchChatLogs();
  }, [user]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentMessages, selectedAgent]);

  const handleSendMessage = async (textToSend: string, e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!textToSend.trim() || loading) return;
    const userMsg = textToSend;
    setInput("");
    setLoading(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Add user message locally
    setAgentMessages((prev) => {
      const currentList = prev[selectedAgent] || [];
      return {
        ...prev,
        [selectedAgent]: [...currentList, { sender: "user", text: userMsg, time: timeStr }]
      };
    });

    try {
      const response = await api.askAIChatbot(userMsg, user.id, provider, selectedAgent);
      setAgentMessages((prev) => {
        const currentList = prev[selectedAgent] || [];
        return {
          ...prev,
          [selectedAgent]: [...currentList, { sender: "bot", text: response.reply, time: timeStr }]
        };
      });
    } catch (err) {
      setAgentMessages((prev) => {
        const currentList = prev[selectedAgent] || [];
        return {
          ...prev,
          [selectedAgent]: [
            ...currentList, 
            { sender: "bot", text: "I ran into a server error processing your query. Please make sure the AI services are online.", time: timeStr }
          ]
        };
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFAQClick = (faqText: string) => {
    handleSendMessage(faqText);
  };

  const clearChatHistory = () => {
    setAgentMessages((prev) => ({
      ...prev,
      [selectedAgent]: [
        { sender: "bot", text: currentAgentData.welcome, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
      ]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-450">
              <MessageSquare className="h-6.5 w-6.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-sans">EduReach AI Chatbot Hub</h2>
              <p className="text-xs text-slate-400 mt-1">
                Access specialized AI agents, practice concepts, prepare for mock drives, and audit project metrics.
              </p>
            </div>
          </div>

          <div className="flex gap-2 bg-slate-955 p-1 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setProvider("gemini"); localStorage.setItem("edu_ai_provider", "gemini"); }}
              className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                provider === "gemini" ? "bg-blue-600 text-white animate-fade-in" : "text-slate-500 hover:text-slate-350"
              }`}
            >
              Gemini LLM
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setProvider("groq"); localStorage.setItem("edu_ai_provider", "groq"); }}
              className={`px-3 py-1 text-[10px] font-bold rounded cursor-pointer transition-all ${
                provider === "groq" ? "bg-blue-600 text-white animate-fade-in" : "text-slate-500 hover:text-slate-350"
              }`}
            >
              Groq LLaMA
            </button>
          </div>
        </div>
      </div>

      {/* Specialized Agents Horizontal Scroll Tab bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-1">
          Select Specialized AI Agent:
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {agents.map((agent) => {
            const AgentIcon = agent.icon;
            const isActive = selectedAgent === agent.id;
            return (
              <button
                type="button"
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? agent.activeClass
                    : `bg-slate-50 dark:bg-slate-955 ${agent.borderColor} border-slate-200 dark:border-slate-850 text-slate-650 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white`
                }`}
              >
                <AgentIcon className="h-4 w-4 shrink-0" />
                <span>{agent.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: FAQs & Info sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Agent Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3 relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-4 -mr-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${currentAgentData.color}`}>
                <currentAgentData.icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400 block uppercase font-bold tracking-wider">Active Specialist</span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-sans">{currentAgentData.name}</h4>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans pt-1">
              {currentAgentData.description}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-450 animate-pulse" /> Support Status
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-955 p-3 rounded-lg border border-slate-200 dark:border-slate-850 text-center space-y-1">
                  <stat.icon className={`h-4.5 w-4.5 mx-auto ${stat.color}`} />
                  <span className="text-[9px] text-slate-500 block uppercase font-mono">{stat.label}</span>
                  <span className="text-[10px] text-slate-900 dark:text-white font-bold block truncate">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick FAQ Suggestion List (updates dynamically based on agent) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500 dark:text-indigo-400" /> Suggested Queries
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Click any card below to automatically ask the agent:</p>
            
            <div className="space-y-2 pt-1">
              {currentAgentData.faqs.map((faq, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={(e) => { e.preventDefault(); handleFAQClick(faq.text); }}
                  className="w-full text-left bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 hover:border-indigo-500/40 p-3 rounded-lg text-xs transition-all hover:translate-x-1 group cursor-pointer block"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 block transition-colors">
                    {faq.label}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 block mt-0.5">
                    {faq.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); clearChatHistory(); }}
            className="w-full py-2 bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Clear Conversation Logs
          </button>
        </div>

        {/* Right Side: Primary Chat Workspace (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-[520px] shadow-xs">
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-950 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                  {currentAgentData.name} Console
                </span>
              </div>
              
              <span className="text-[10px] font-mono text-slate-500">
                Connected: {provider === "groq" ? "Groq API v1" : "Gemini API v2"}
              </span>
            </div>

            {/* Chat Messages Panel */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-955">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "bot" && (
                    <div className={`h-7 w-7 rounded-lg ${currentAgentData.color} flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800`}>
                      <currentAgentData.icon className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`max-w-[75%] space-y-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-indigo-650 text-white rounded-tr-none font-medium shadow-sm"
                        : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-350 rounded-tl-none border border-slate-200 dark:border-slate-805 shadow-xs"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono block px-1">{msg.time}</span>
                  </div>

                  {msg.sender === "user" && (
                    <div className="h-7 w-7 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/15 flex items-center justify-center shrink-0">
                      <Zap className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-450" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 justify-start animate-pulse">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600/10 border border-indigo-500/15 flex items-center justify-center shrink-0">
                    <RefreshCw className="h-4 w-4 text-indigo-500 animate-spin" />
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-mono p-3 rounded-xl rounded-tl-none flex items-center gap-1.5">
                    <span>Synthesizing specialized response...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Console */}
            <form
              onSubmit={(e) => {
                handleSendMessage(input, e);
              }}
              className="p-3 bg-slate-50 dark:bg-slate-955 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center"
            >
               <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${currentAgentData.name} anything...`}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="h-9 w-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-indigo-650/15 shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

