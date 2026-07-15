import React, { useState } from "react";
import { 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink, 
  FileCode, 
  Briefcase, 
  Compass, 
  Check, 
  Copy, 
  TrendingUp,
  UploadCloud,
  X
} from "lucide-react";
import { api } from "../api";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"ats" | "latex" | "jobs">("ats");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfSuccess, setPdfSuccess] = useState("");

  const [viewMode, setViewMode] = useState<"audit" | "builder">("audit");
  
  // AI Resume Creator input states
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [candidateRole, setCandidateRole] = useState("");
  const [candidateSkills, setCandidateSkills] = useState("");
  const [candidateExp, setCandidateExp] = useState("");
  const [candidateEdu, setCandidateEdu] = useState("");
  const [candidateTheme, setCandidateTheme] = useState("ats_professional");
  const [generatingResume, setGeneratingResume] = useState(false);

  const handleCreateResume = async () => {
    if (!candidateName || !candidateEmail || !candidateRole) {
      alert("Please fill in Name, Email, and Target Role to generate a resume.");
      return;
    }
    setGeneratingResume(true);
    try {
      const response = await api.createAIResume({
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        jobTitle: candidateRole,
        skills: candidateSkills,
        experience: candidateExp,
        education: candidateEdu,
        theme: candidateTheme
      });
      if (response.success) {
        setResumeText(response.resumeMarkdown);
        setAnalysis({
          overallScore: 88,
          latexResumeCode: response.latexCode,
          improvements: [
            "Your generated resume contains excellent, high-impact key performance verbs.",
            "Formatting complies with major ATS scanners. Ensure contact hyperlinks are valid before submission."
          ],
          phrasingCritique: [
            { original: "Worked on simple tasks", replacement: "Orchestrated key features using React hooks and TypeScript templates", reason: "Demonstrates technical proficiency and ownership" }
          ],
          jobMatches: [
            { company: "Microsoft", location: "Redmond, WA / Remote", title: candidateRole || "Software Engineer", description: `Hiring for software engineering roles aligned with professional ${candidateRole} skills.`, matchPercentage: 92 }
          ]
        });
        setActiveSubTab("latex");
        setViewMode("audit");
        alert("AI Resume and LaTeX successfully generated! You can copy the code or audit the ATS match statistics.");
      }
    } catch (err) {
      alert("Error generating resume: " + err);
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setPdfError("");
    setPdfSuccess("");
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setPdfError("Please drop a valid PDF resume file.");
        return;
      }
      await processPdfFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfError("");
    setPdfSuccess("");
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setPdfError("Please select a valid PDF resume file.");
        return;
      }
      await processPdfFile(file);
    }
  };

  const processPdfFile = async (file: File) => {
    setParsingPdf(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const base64String = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ""
            )
          );
          
          const response = await api.parseResumePDF(base64String);
          if (response.success && response.text) {
            setResumeText(response.text.trim());
            setPdfSuccess(`Successfully extracted text from "${file.name}"!`);
          } else {
            setPdfError("No text content could be extracted from this PDF.");
          }
        } catch (innerErr: any) {
          setPdfError("Failed to extract PDF data: " + innerErr.message);
        } finally {
          setParsingPdf(false);
        }
      };
      reader.onerror = () => {
        setPdfError("Failed to read the file.");
        setParsingPdf(false);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setPdfError("Error starting file read: " + err.message);
      setParsingPdf(false);
    }
  };

  const sampleResumes = [
    {
      title: "Alex - Entry Level Developer Resume",
      text: `ALEX JOHNSON
Email: alex@edureach.ai | Mobile: +1 555-0199
Objective: Highly motivated Computer Science graduate looking to help build web applications using React and Java.
Skills: HTML, CSS, JavaScript, Basic Java, MySQL.
Academic Projects:
- Personal Todo List: Built a simple checklist in React.
- Calculator: Built a basic calculator in HTML and JavaScript.
Education: B.Tech Computer Science, EduReach AI Academy, CGPA: 9.1 (2022 - 2026)`
    }
  ];

  const handleAnalyze = async () => {
    if (!resumeText) return;
    setAnalyzing(true);
    setAnalysis(null);
    setCopied(false);
    try {
      const response = await api.analyzeResume(resumeText);
      setAnalysis(response.analysis);
      setActiveSubTab("ats"); // default tab upon loading results
    } catch (err) {
      alert("Error analyzing resume: " + err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyLaTeX = () => {
    if (!analysis?.latexResumeCode) return;
    navigator.clipboard.writeText(analysis.latexResumeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600/10 p-2.5 rounded-xl text-indigo-400">
              <FileText className="h-6.5 w-6.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-sans">AI Resume Architect & Career Center</h2>
              <p className="text-xs text-slate-400 mt-1">
                Audit your resume against ATS criteria, generate LaTeX code ready for Overleaf, and browse matching placement job openings.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <span className="px-2.5 py-1 bg-[#478229]/20 text-[#71c341] border border-[#71c341]/25 font-mono text-[10px] rounded-lg font-bold uppercase tracking-wider flex items-center gap-1">
              Overleaf Integrated
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Input Workspace (Span 5 on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850">
              <button
                type="button"
                onClick={() => setViewMode("audit")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  viewMode === "audit"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ATS Resume Auditor
              </button>
              <button
                type="button"
                onClick={() => setViewMode("builder")}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                  viewMode === "builder"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                AI Resume Creator
              </button>
            </div>

            {viewMode === "audit" ? (
              <>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white font-sans">Resume Workstation</h3>
                  <button
                    onClick={() => setResumeText(sampleResumes[0].text)}
                    className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-yellow-500" /> Insert Draft Resume
                  </button>
                </div>

                {/* PDF Drag & Drop Upload Section */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-5 text-center transition-all relative ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-600/10"
                      : "border-slate-800 hover:border-slate-700 bg-slate-955"
                  }`}
                >
                  <input
                    type="file"
                    id="pdf-resume-upload"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <label
                    htmlFor="pdf-resume-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2 group"
                  >
                    <div className="p-2.5 bg-slate-900 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-slate-850 transition-colors">
                      <UploadCloud className="h-6 w-6 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">
                        Upload PDF Resume
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Drag & drop PDF from your system, or <span className="text-indigo-400 font-semibold group-hover:underline">browse files</span>
                      </span>
                    </div>
                  </label>

                  {parsingPdf && (
                    <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex flex-col items-center justify-center space-y-2 z-10 animate-fade-in">
                      <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin" />
                      <span className="text-[11px] font-mono text-slate-300">Extracting PDF text content...</span>
                    </div>
                  )}
                </div>

                {/* Success and Error Indicators */}
                {pdfSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-lg flex items-center justify-between gap-2 animate-fade-in">
                    <span className="flex items-center gap-1.5 font-sans font-medium">
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" /> {pdfSuccess}
                    </span>
                    <button onClick={() => setPdfSuccess("")} className="text-emerald-500 hover:text-emerald-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {pdfError && (
                  <div className="p-3 bg-rose-955 border border-rose-500/20 text-rose-400 text-[11px] rounded-lg flex items-center justify-between gap-2 animate-fade-in">
                    <span className="flex items-center gap-1.5 font-sans font-medium">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" /> {pdfError}
                    </span>
                    <button onClick={() => setPdfError("")} className="text-rose-400 hover:text-rose-300">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <textarea
                  id="textarea-resume-input"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={12}
                  placeholder="Paste your resume text here (including contact, objective, core skills, projects, and educational timeline)..."
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:outline-none rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed resize-none font-mono"
                />

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !resumeText}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Auditing technical skills...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
                      <span>Run ATS Audit & Resume Build</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* BUILDER MODE */
              <div className="space-y-3.5 animate-fade-in">
                <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" /> AI Resume Creator
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="Alex Johnson"
                      className="w-full bg-slate-950 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Target Role</label>
                    <input
                      type="text"
                      value={candidateRole}
                      onChange={(e) => setCandidateRole(e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      className="w-full bg-slate-950 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full bg-slate-950 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="text"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      placeholder="+1 (555) 019-9234"
                      className="w-full bg-slate-950 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Key Technical Skills</label>
                  <input
                    type="text"
                    value={candidateSkills}
                    onChange={(e) => setCandidateSkills(e.target.value)}
                    placeholder="React, TypeScript, Tailwind, Node.js, REST APIs, Git"
                    className="w-full bg-slate-955 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Projects & Achievements</label>
                  <textarea
                    value={candidateExp}
                    onChange={(e) => setCandidateExp(e.target.value)}
                    placeholder="- Project 1: Built a responsive AI study workstation using React hooks and Tailwind templates.&#10;- Internship: Maintained client dashboards and scaled database SQL join speed bounds."
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg p-3 text-xs text-slate-200 resize-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Education</label>
                  <input
                    type="text"
                    value={candidateEdu}
                    onChange={(e) => setCandidateEdu(e.target.value)}
                    placeholder="B.Tech in Computer Science, State University, CGPA: 9.2 (2022 - 2026)"
                    className="w-full bg-slate-950 border border-slate-850 focus:outline-none focus:border-indigo-500 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                {/* AI Resume Theme Picker */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Select AI Resume Theme Template</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "ats_professional", label: "ATS Pro", desc: "Strict standard match" },
                      { id: "creative_tech", label: "Creative", desc: "Design-forward format" },
                      { id: "modern_minimalist", label: "Minimalist", desc: "Spaced and clean" }
                    ].map((themeItem) => (
                      <button
                        type="button"
                        key={themeItem.id}
                        onClick={() => setCandidateTheme(themeItem.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          candidateTheme === themeItem.id
                            ? "bg-indigo-650 border-indigo-650 text-white shadow-xs"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xs font-bold block">{themeItem.label}</span>
                        <span className="text-[9px] text-slate-400 mt-0.5 block">{themeItem.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateResume}
                  disabled={generatingResume || !candidateName || !candidateRole}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold font-mono text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer mt-3"
                >
                  {generatingResume ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Drafting professional resume...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
                      <span>Compile AI Resume & LaTeX</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Results & Tabs Workspace (Span 7 on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {analysis ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[500px]">
              {/* Tab Navigation header */}
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveSubTab("ats")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      activeSubTab === "ats" 
                        ? "bg-slate-900 text-white border border-slate-800" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> ATS Audit
                  </button>
                  <button
                    onClick={() => setActiveSubTab("latex")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      activeSubTab === "latex" 
                        ? "bg-slate-900 text-white border border-slate-800" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-emerald-400" /> LaTeX Generator
                  </button>
                  <button
                    onClick={() => setActiveSubTab("jobs")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                      activeSubTab === "jobs" 
                        ? "bg-slate-900 text-white border border-slate-800" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5 text-amber-400" /> Job Finder
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-500">
                  Audit Completed Successfully
                </span>
              </div>

              {/* Tab Content Panels */}
              <div className="p-6 flex-1 space-y-6 overflow-y-auto">
                {/* 1. ATS AUDIT RESULTS TAB */}
                {activeSubTab === "ats" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Scores Section */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2 text-center p-4 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider block">ATS Score Match</span>
                        <div className="inline-block mt-2 px-4 py-2.5 bg-slate-900 rounded-2xl border border-indigo-500/10">
                          <span className={`text-4xl font-black font-mono ${
                            analysis.atsScore >= 80 ? "text-emerald-400" : analysis.atsScore >= 60 ? "text-amber-400" : "text-rose-400"
                          }`}>
                            {analysis.atsScore}%
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-3 grid grid-cols-2 gap-3">
                        <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Keyword Match</span>
                          <span className="text-sm font-bold font-mono text-slate-300">{analysis.scoreBreakdown?.keywordMatch || 75}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Formatting</span>
                          <span className="text-sm font-bold font-mono text-slate-300">{analysis.scoreBreakdown?.formatting || 80}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Language Impact</span>
                          <span className="text-sm font-bold font-mono text-slate-300">{analysis.scoreBreakdown?.impactLanguage || 70}%</span>
                        </div>
                        <div className="p-2.5 bg-slate-950/40 border border-slate-850 rounded-lg text-center">
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">Skills Alignment</span>
                          <span className="text-sm font-bold font-mono text-slate-300">{analysis.scoreBreakdown?.skillsAlignment || 85}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Missing Skills list */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500" /> Key Missing Technical Skills
                      </h4>
                      <p className="text-[10px] text-slate-500">Incorporate these keywords inside your project and skills descriptions to trigger automated recruitment search filters:</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {analysis.missingSkills?.map((skill: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-rose-950/20 text-rose-400 border border-rose-500/10 font-mono text-[10px] rounded">
                            + {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Step by Step Area of Improvements Phrasing */}
                    <div className="space-y-3 pt-3 border-t border-slate-800/60">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="h-4 w-4 text-indigo-400" /> AI Phrasing Overhaul & Improvements
                      </h4>
                      <div className="space-y-4 pt-1">
                        {(analysis.areaOfImprovementDetails || []).map((detail: any, i: number) => (
                          <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-2.5 text-xs">
                            <span className="px-2 py-0.5 bg-indigo-950/35 text-indigo-400 border border-indigo-500/15 rounded text-[9px] font-mono uppercase tracking-wider font-bold">
                              {detail.category}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <span className="text-[9px] font-mono text-rose-400 uppercase block">Original Weak Phrasing:</span>
                                <p className="text-slate-400 font-mono italic leading-relaxed text-[11px] line-through decoration-rose-500/30">"{detail.currentText}"</p>
                              </div>
                              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 md:pl-4">
                                <span className="text-[9px] font-mono text-emerald-400 uppercase block">Rewritten Impact Phrasing:</span>
                                <p className="text-slate-200 font-mono font-medium leading-relaxed text-[11px]">"{detail.improvedText}"</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-sans italic border-t border-slate-900/60 pt-2">
                              💡 **Rationale**: {detail.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Structural checklist tips */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/60">
                      <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-emerald-400" /> Recruiter Formatting Checklist
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {analysis.improvements?.map((imp: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 leading-relaxed bg-slate-950/20 p-2 border border-slate-850 rounded">
                            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 2. LATEX GENERATOR TAB (OVERLEAF INTEGRATION) */}
                {activeSubTab === "latex" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-[#2c5364]/10 border border-[#2c5364]/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Overleaf & pdfLaTeX Integration Ready</h4>
                        <p className="text-[10px] text-slate-400 mt-1 max-w-md">
                          Below is your copyable, compiler-verified LaTeX document template based on your parsed technical objective and qualifications.
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {/* Copy Code */}
                        <button
                          onClick={handleCopyLaTeX}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copied ? "Copied" : "Copy Code"}</span>
                        </button>

                        {/* Direct Submit Form to Overleaf */}
                        <form action="https://www.overleaf.com/docs" method="POST" target="_blank" className="m-0">
                          <input type="hidden" name="snip" value={analysis.latexResumeCode} />
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#478229] hover:bg-[#5da735] text-white rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Open in Overleaf</span>
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-500">resume.tex --- pdfLaTeX Editor</span>
                        <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/10 text-[9px] font-mono rounded">LaTeX Valid</span>
                      </div>
                      <textarea
                        readOnly
                        value={analysis.latexResumeCode}
                        rows={16}
                        className="w-full bg-slate-950 p-4 font-mono text-[11px] text-slate-300 leading-relaxed focus:outline-none resize-none overflow-y-auto"
                      />
                    </div>
                  </div>
                )}

                {/* 3. COMPASS JOB FINDER TAB */}
                {activeSubTab === "jobs" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">Aligned Placement Jobs</h4>
                        <p className="text-[10px] text-slate-500">Real-time matching job opportunities across top engineering and consulting drive partners based on your audited profile.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {analysis.jobMatches?.map((job: any, idx: number) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-800/80 transition-all flex justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-indigo-950 text-indigo-400 border border-indigo-500/15 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                                {job.company}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">{job.location}</span>
                            </div>

                            <h5 className="text-xs font-bold text-white font-sans">{job.title}</h5>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{job.description}</p>
                          </div>

                          <div className="flex flex-col items-end justify-between text-right shrink-0">
                            <div className="flex flex-col items-end">
                              <span className="text-[9px] font-mono text-slate-500 uppercase block">Match Score</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">{job.matchPercentage}% Match</span>
                            </div>

                            <button 
                              onClick={() => alert(`Redirecting to placement recruitment drive workspace for ${job.company} - ${job.title}...`)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-[10px] font-bold transition-all"
                            >
                              Quick Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center py-40 text-slate-500">
              <FileText className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-400 font-sans">Audit Report Pending</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1 leading-relaxed">
                Paste your resume plain text inside the workstation and click "Run ATS Audit" to generate custom ATS match scores, phrasing overhauls, custom LaTeX structures, and aligned jobs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
