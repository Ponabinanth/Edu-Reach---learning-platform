import React, { useState } from "react";
import { 
  Code2, 
  Sparkles, 
  Play, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Cpu, 
  FileCode, 
  Copy, 
  Check 
} from "lucide-react";
import { api } from "../api";
import { UserProfile } from "../types";

interface CodingMentorProps {
  user: UserProfile;
}

export default function CodingMentor({ user }: CodingMentorProps) {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState<string>(`def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

# Test execution
print("Index found:", binary_search([1, 3, 5, 7, 9, 11], 7))
`);
  const [action, setAction] = useState<string>("explain");
  const [loading, setLoading] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>("");
  const [compileResult, setCompileResult] = useState<any | null>(null);

  // Copilot states
  const [copilotActive, setCopilotActive] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (copilotActive) {
      if (val.trim().endsWith("def add(a, b):") || val.trim().endsWith("function add(a, b) {")) {
        setSuggestion("\n    return a + b;");
      } else if (val.trim().endsWith("public static void main")) {
        setSuggestion(" (String[] args) {\n        System.out.println(\"Hello World\");\n    }");
      } else if (val.trim().endsWith("for i in range(")) {
        setSuggestion("n):\n        print(i)");
      } else {
        setSuggestion("");
      }
    } else {
      setSuggestion("");
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      setCode(prev => prev + suggestion);
      setSuggestion("");
    }
  };
  const [copied, setCopied] = useState<boolean>(false);

  // Starter templates
  const templates: Record<string, string> = {
    python: `def fibonacci(n):
    if n <= 0:
        return []
    elif n == 1:
        return [0]
        
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print("Fibonacci(8):", fibonacci(8))
`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World from Java!");
        int sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += i;
        }
        System.out.println("Sum of 1 to 10 is: " + sum);
    }
}
`,
    javascript: `function findUnique(arr) {
    const unique = new Set(arr);
    return Array.from(unique);
}

const numbers = [1, 2, 2, 3, 4, 4, 5, 1];
console.log("Original:", numbers);
console.log("Unique elements:", findUnique(numbers));
`,
    c: `#include <stdio.h>

int main() {
    printf("Online compiler simulating C runtime.\\n");
    int num = 5;
    long long factorial = 1;
    
    for (int i = 1; i <= num; ++i) {
        factorial *= i;
    }
    
    printf("Factorial of %d = %lld\\n", num, factorial);
    return 0;
}
`
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (templates[lang]) {
      setCode(templates[lang]);
    }
  };

  const triggerMentor = async () => {
    setLoading(true);
    setExplanation("");
    setCompileResult(null);

    try {
      const response = await api.askCodingMentor(code, language, action);
      if (action === "compile") {
        setCompileResult(response.execution);
      } else {
        setExplanation(response.text);
      }
    } catch (err: any) {
      setExplanation("Unable to contact the AI Coding Mentor. Please ensure your backend is connected.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-700 dark:text-slate-200">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-600 dark:text-blue-400">
              <Code2 className="h-6.5 w-6.5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white font-sans flex items-center gap-2">
                <span>AI Coding Mentor & Compiler</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 px-2 py-0.5 border border-blue-200 dark:border-blue-500/10 rounded-full font-mono uppercase font-bold tracking-wider">
                  Interactive IDE
                </span>
              </h2>
              <p className="text-xs text-slate-550 dark:text-slate-450 mt-1 font-sans">
                Paste your code, select an action to audit bugs, generate boundary test scenarios, or run simulations in Java, Python, C, and JS.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Side: Code Editor Workspace */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs space-y-4">
          <div className="space-y-3">
            {/* Toolbar selectors */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Language:</span>
                <select 
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-550 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-2.5 py-1 text-xs font-bold rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
                >
                  <option value="python">🐍 Python</option>
                  <option value="java">☕ Java</option>
                  <option value="javascript">🌐 JavaScript</option>
                  <option value="c">📄 C Standard</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCopilotActive(!copilotActive);
                    setSuggestion("");
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border transition-all cursor-pointer ${
                    copilotActive 
                      ? "bg-indigo-950/20 border-indigo-500/35 text-indigo-400 font-bold" 
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400"
                  }`}
                  title="Toggle AI Pair Programmer Suggestions"
                >
                  <Sparkles className={`h-3 w-3 ${copilotActive ? "animate-pulse" : ""}`} />
                  <span>{copilotActive ? "Copilot On" : "Enable Copilot"}</span>
                </button>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 rounded-lg hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
                <button
                  onClick={() => handleLanguageChange(language)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 rounded-lg hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Template</span>
                </button>
              </div>
            </div>

            {/* Custom Code Editor Box */}
            <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-300 font-mono text-xs flex">
              {/* Fake Gutter Line Numbers */}
              <div className="bg-slate-900 border-r border-slate-800 text-slate-500 px-2.5 py-4 text-right select-none flex flex-col leading-relaxed min-w-[32px]">
                {Array.from({ length: Math.max(code.split("\n").length, 15) }).map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              
              {/* Textarea Code Body */}
              <div className="flex-1 relative flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  placeholder="Write or paste your custom code snippet here..."
                  rows={18}
                  className="w-full bg-transparent text-slate-200 px-4 py-4 focus:outline-none resize-none font-mono text-xs leading-relaxed overflow-y-auto"
                  style={{ tabSize: 4 }}
                />
                
                {/* Floating suggestion box */}
                {copilotActive && suggestion && (
                  <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-indigo-500/35 p-3 rounded-lg flex items-center justify-between gap-3 text-[10px] animate-fade-in shadow-xl select-none z-10">
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-mono text-indigo-400 uppercase font-black tracking-wide block">AI Pair Programmer</span>
                      <pre className="text-emerald-400 font-mono leading-tight">{suggestion}</pre>
                    </div>
                    <button
                      onClick={acceptSuggestion}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-505 text-white font-mono text-[9px] font-bold rounded-lg cursor-pointer"
                    >
                      Accept (Tab)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action trigger panels */}
          <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-855">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Select Mentor Action Focus:
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: "explain", label: "Explain Code", icon: BookOpen },
                  { id: "find-bugs", label: "Find Bugs", icon: AlertTriangle },
                  { id: "improve", label: "Refactor", icon: Sparkles },
                  { id: "generate-tests", label: "Test Cases", icon: CheckCircle },
                  { id: "compile", label: "Run Compiler", icon: Play }
                ].map((act) => {
                  const Icon = act.icon;
                  const isActive = action === act.id;
                  return (
                    <button
                      key={act.id}
                      onClick={() => setAction(act.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10"
                          : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <Icon className="h-4.5 w-4.5 mb-1" />
                      <span className="text-[10px] font-bold font-sans tracking-tight">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={triggerMentor}
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing Audit...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                  <span>Launch AI Code Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: AI Mentor Feedback Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-slate-350 min-h-[500px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-28">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
              <div className="text-center space-y-1 font-mono text-xs text-slate-500">
                <p>Establishing simulated runtime compiler...</p>
                <p>Auditing instructions line-by-line...</p>
              </div>
            </div>
          ) : action === "compile" && compileResult ? (
            /* Compiler Simulated Output Panel */
            <div className="flex-1 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-3">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase">
                    <FileCode className="h-4 w-4 text-blue-400" /> Simulated Terminal Console
                  </span>
                  <span className={`px-2 py-0.5 font-mono text-[9px] uppercase font-bold rounded ${
                    compileResult.exitCode === 0 
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                      : "bg-rose-950/40 text-rose-450 border border-rose-500/20"
                  }`}>
                    {compileResult.exitCode === 0 ? "Process Complete" : "Process Failed"}
                  </span>
                </div>

                {/* Simulated Output Terminal Screen */}
                <div className="bg-black p-4 rounded-xl border border-slate-850 font-mono text-xs leading-relaxed space-y-3 overflow-y-auto max-h-[300px]">
                  {compileResult.stdout && (
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Standard Output (stdout):</span>
                      <pre className="text-slate-100 whitespace-pre-wrap">{compileResult.stdout}</pre>
                    </div>
                  )}
                  {compileResult.stderr && (
                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-rose-500 block uppercase font-bold">Standard Error (stderr):</span>
                      <pre className="text-rose-400 whitespace-pre-wrap">{compileResult.stderr}</pre>
                    </div>
                  )}
                  {!compileResult.stdout && !compileResult.stderr && (
                    <div className="text-slate-500 italic">No console logs returned. Execution resolved cleanly.</div>
                  )}
                </div>
              </div>

              {/* Execution statistics */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 font-mono text-[10px] text-slate-500">
                <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                  <span className="block text-[8px] text-slate-550 uppercase font-bold">Exit Code</span>
                  <span className={`text-xs font-bold ${compileResult.exitCode === 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {compileResult.exitCode}
                  </span>
                </div>
                <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                  <span className="block text-[8px] text-slate-550 uppercase font-bold">Time Elapsed</span>
                  <span className="text-xs font-bold text-blue-400">{compileResult.timeMs || 40} ms</span>
                </div>
                <div className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg">
                  <span className="block text-[8px] text-slate-550 uppercase font-bold">Memory Allocation</span>
                  <span className="text-xs font-bold text-purple-400">{compileResult.memoryKb || 1200} KB</span>
                </div>
              </div>
            </div>
          ) : explanation ? (
            /* Standard AI Mentor audit output */
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4 overflow-y-auto max-h-[460px] pr-1">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 uppercase">
                    <Sparkles className="h-4 w-4 text-yellow-550 animate-pulse" /> AI Mentor Audit Report
                  </span>
                </div>

                <div className="prose prose-invert prose-xs text-xs leading-relaxed whitespace-pre-wrap text-slate-200 space-y-3 font-sans">
                  {explanation}
                </div>
              </div>
            </div>
          ) : (
            /* Idle Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <Cpu className="h-12 w-12 text-slate-850 mb-2 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-400">Mentor Workstation Idle</h4>
              <p className="text-xs text-slate-500 max-w-xs font-sans leading-relaxed">
                Paste your code structure in the editor, pick your target audit focus, and launch the compiler helper.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
