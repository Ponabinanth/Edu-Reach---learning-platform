import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Thermometer,
  Zap,
  Settings,
  AlertTriangle,
  CheckCircle,
  Eye,
  Camera,
  Database,
  BarChart,
  RefreshCw,
  Cpu,
  Factory,
  Wrench,
  Camera as CameraIcon,
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  ArrowRight,
  TrendingUp,
  BatteryCharging
} from "lucide-react";
import { UserProfile } from "../types";

interface DigitalTwinProps {
  user: UserProfile | null;
}

export default function DigitalTwin({ user }: DigitalTwinProps) {
  const [activeTab, setActiveTab] = useState<'operations' | 'maintenance' | 'vision'>('operations');
  
  // Real-time animation states
  const [currentScan, setCurrentScan] = useState<'scanning' | 'passed' | 'failed'>('scanning');
  const [powerUsage, setPowerUsage] = useState(4.8);
  const [efficiency, setEfficiency] = useState(95);

  // Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Vision simulator
      if (Math.random() > 0.6) {
        if (Math.random() > 0.85) {
          setCurrentScan('failed');
        } else {
          setCurrentScan('passed');
        }
        setTimeout(() => setCurrentScan('scanning'), 1500);
      }
      
      // Operations simulator
      setPowerUsage(prev => Math.max(4.0, Math.min(6.0, prev + (Math.random() - 0.5) * 0.2)));
      setEfficiency(prev => Math.max(85, Math.min(99, prev + (Math.random() - 0.5) * 2)));

    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Copilot Chat State
  const [chatMessages, setChatMessages] = useState<{sender: 'bot' | 'user', text: string}[]>([
    { sender: 'bot', text: 'Hello! I am your Industrial AI Copilot. How can I assist you with factory operations today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleCopilotChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = "I'm analyzing the telemetry data to answer your query. Everything appears operational, but I'll continue monitoring.";
      
      const lowerQuery = userMsg.toLowerCase();
      
      // Exact matches from PRD
      if (lowerQuery.includes('machine b') && lowerQuery.includes('overheating')) {
        botReply = "Machine B temperature has increased by 12°C during the last two hours. The vibration level is also above the normal threshold. This indicates possible bearing wear. We recommend stopping the machine within the next 6 hours and inspecting the bearing assembly.";
      } else if (lowerQuery.includes('defective products') || lowerQuery.includes('today')) {
        botReply = "22 defective products detected today.\n• 12 Surface Cracks\n• 6 Missing Holes\n• 4 Paint Defects\n\nQuality Score: 99.1%";
      } else if (lowerQuery.includes('consumes the most power') || lowerQuery.includes('power')) {
        botReply = "Machine D consumes the most power.\n\nToday's Consumption: 84.5 kWh\n18% higher than average.\n\nRecommendation: Inspect motor efficiency.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-full animate-fade-in -m-6 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Factory className="w-7 h-7 text-indigo-600 dark:text-indigo-500" />
              Industrial Digital Twin
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time factory monitoring & AI diagnostics</p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('operations')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'operations' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Factory className="w-4 h-4 inline mr-2" /> Operations
            </button>
            <button 
              onClick={() => setActiveTab('maintenance')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'maintenance' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <Wrench className="w-4 h-4 inline mr-2" /> Maintenance
            </button>
            <button 
              onClick={() => setActiveTab('vision')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'vision' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <CameraIcon className="w-4 h-4 inline mr-2" /> Vision AI
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 3. 🏭 Digital Twin Operations Dashboard */}
          {activeTab === 'operations' && (
            <motion.div 
              key="operations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Factory className="w-16 h-16 text-blue-500" /></div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Machine 01 Status</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">Running</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs">Efficiency</p>
                      <p className="text-xl font-bold text-blue-600">{efficiency.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Power Usage</p>
                      <p className="text-xl font-bold text-amber-500">{powerUsage.toFixed(1)} kW</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs">Current Output</p>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-300">210 Units/hour</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart className="w-16 h-16 text-emerald-500" /></div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Production Analytics</h3>
                  <p className="text-xs text-slate-400 mb-1">Production Today</p>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-4">
                    <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-xs">Target</p>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-300">5000 Units</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Completed</p>
                      <p className="text-xl font-bold text-emerald-600">4210 Units</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs">Progress</p>
                      <p className="text-xl font-bold text-emerald-600">84%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-16 h-16 text-amber-500" /></div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-4">Energy Monitoring</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <p className="text-slate-400 text-xs">Today's Energy</p>
                      <p className="text-3xl font-bold text-amber-500">452 kWh</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Yesterday</p>
                      <p className="text-lg font-bold text-slate-600 dark:text-slate-400">487 kWh</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs">Savings</p>
                      <p className="text-lg font-bold text-emerald-500 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> 7%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Machine Layout */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Database className="w-4 h-4" /> Factory Machine Layout
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl flex flex-col items-center text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Machine A</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Healthy</span>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-4 rounded-xl flex flex-col items-center text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Machine B</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 mt-1">Warning</span>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl flex flex-col items-center text-center">
                    <Wrench className="w-8 h-8 text-rose-500 mb-2" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Machine C</span>
                    <span className="text-xs text-rose-600 dark:text-rose-400 mt-1">Maintenance Req</span>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 rounded-xl flex flex-col items-center text-center">
                    <Activity className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">Machine D</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Offline</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. 📈 Predictive Maintenance Module */}
          {activeTab === 'maintenance' && (
            <motion.div 
              key="maintenance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* AI Recommendation Alert */}
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-100 dark:bg-amber-900/40 p-3 rounded-full">
                      <Bot className="w-8 h-8 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-amber-800 dark:text-amber-400 font-bold text-lg mb-1 flex items-center gap-2">
                        AI Maintenance Recommendation
                        <span className="bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold uppercase">Warning</span>
                      </h3>
                      <p className="text-amber-900/80 dark:text-amber-200/80 font-medium mb-3">Motor vibration increased by 28%.</p>
                      
                      <div className="bg-white/60 dark:bg-black/20 p-3 rounded-xl space-y-2">
                        <div>
                          <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-500">Possible Cause</span>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bearing Wear</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-500">Recommendation</span>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Schedule inspection within 48 hours.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bearing Health */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
                  <Settings className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 animate-[spin_4s_linear_infinite]" />
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Bearing Health</h3>
                  <div className="flex items-end gap-2 justify-center mb-4">
                    <span className="text-4xl font-black text-emerald-500">92%</span>
                    <span className="text-sm text-slate-400 mb-1">Current Health</span>
                  </div>
                  <div className="w-full max-w-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Predicted Failure</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-500">18 Days Remaining</p>
                  </div>
                </div>

                {/* Machine Status Dashboard */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Machine Status Overview
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Asset</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-slate-200">Machine A</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-b-2 border-emerald-500">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Health</p>
                      <p className="text-lg font-bold text-emerald-600">96%</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-b-2 border-amber-500">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Temperature</p>
                      <p className="text-lg font-bold text-amber-600">58°C</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Vibration</p>
                      <p className="text-lg font-bold text-emerald-600">Low</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-b-2 border-blue-500">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Prediction</p>
                      <p className="text-lg font-bold text-blue-600">Healthy</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* 1. 📷 Vision-Based Defect Detection Module */}
          {activeTab === 'vision' && (
            <motion.div 
              key="vision"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Vision Inspector Camera Feed */}
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative aspect-video flex flex-col group">
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-white text-xs font-mono font-bold tracking-widest bg-black/50 px-2 py-1 rounded-md">CAM-01 LIVE</span>
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <span className="text-emerald-400 text-xs font-mono font-bold bg-black/50 px-2 py-1 rounded-md border border-emerald-500/30">
                      AI MODEL: YOLOv8 PRO
                    </span>
                  </div>

                  {/* Simulated Conveyor / Part */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PC9zdmc+')] opacity-20 pointer-events-none"></div>
                    
                    <motion.div 
                      className="w-48 h-48 bg-slate-800 rounded-xl border-4 border-slate-700 relative shadow-2xl"
                      animate={{ x: currentScan === 'scanning' ? [-30, 30, -30] : 0 }}
                      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    >
                      {/* Bounding Boxes */}
                      <AnimatePresence>
                        {currentScan === 'failed' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-4 border-2 border-red-500 bg-red-500/20"
                          >
                            <div className="absolute -top-6 left-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-lg">
                              SURFACE CRACK 98%
                            </div>
                            {/* Simulated crack */}
                            <svg className="absolute inset-0 w-full h-full text-red-500 opacity-50" viewBox="0 0 100 100">
                              <path d="M 20 20 L 40 50 L 30 70 L 60 90" fill="transparent" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </motion.div>
                        )}
                        {currentScan === 'passed' && (
                          <motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-4 border-2 border-emerald-500 bg-emerald-500/10"
                          >
                            <div className="absolute -top-6 left-0 bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm whitespace-nowrap shadow-lg">
                              PASSED 99%
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-md p-3 border-t border-slate-700/50 flex justify-between items-center text-xs font-mono text-slate-300">
                    <div className="flex gap-4">
                      <span>FPS: 60.0</span>
                      <span>RESOLUTION: 4K</span>
                    </div>
                    <span>Processing Time: 12ms</span>
                  </div>
                </div>

                {/* Dashboard Stats */}
                <div className="space-y-6 flex flex-col">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Production Line A
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Total Products</span>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">2500</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">Passed</span>
                        <span className="font-bold text-lg text-emerald-600 dark:text-emerald-500">2478</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                        <span className="text-rose-700 dark:text-rose-400 font-semibold text-sm">Defective</span>
                        <span className="font-bold text-lg text-rose-600 dark:text-rose-500">22</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Today's Accuracy</p>
                      <p className="text-3xl font-black text-blue-600">99.1%</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Top Defect</p>
                      <p className="text-sm font-black text-rose-500 leading-tight mt-3">Surface Crack</p>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* RIGHT SIDEBAR: INDUSTRIAL AI COPILOT */}
      <div className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30 relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">Nexus AI Copilot</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Industrial Intelligence Engine</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
          {chatMessages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1.5 mx-1">
                {msg.sender === 'user' ? 'Operator' : 'Nexus AI'} • Just now
              </span>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={handleCopilotChat} className="relative flex items-center">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Nexus AI about operations..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => setChatInput("Why is Machine B overheating?")} type="button" className="shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-medium px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
              Why is Machine B overheating?
            </button>
            <button onClick={() => setChatInput("Show today's defective products.")} type="button" className="shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-medium px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
              Show today's defective products.
            </button>
            <button onClick={() => setChatInput("Which machine consumes the most power?")} type="button" className="shrink-0 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-medium px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 transition-colors">
              Power consumption?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
