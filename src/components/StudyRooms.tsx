import React, { useState, useEffect, useRef } from "react";
import { Users, Video, MessageSquare, Edit3, Trash2, Mic, Play, Monitor } from "lucide-react";

export default function StudyRooms() {
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  
  // Room registry mock list
  const rooms = [
    { id: "room_1", name: "DSA Algorithms Deep Dive", desc: "Practicing graph traversals & BST pathings", size: 4, creator: "Jessica C." },
    { id: "room_2", name: "System Design Mock Group", desc: "Designing scalable cache layers", size: 3, creator: "Robert L." },
    { id: "room_3", name: "Aptitude Formula Shortcuts", desc: "Solving quantitative equation matrices", size: 2, creator: "Dr Sarah" }
  ];

  // Canvas drawing whiteboard states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("rgb(99, 102, 241)"); // default indigo brush color
  const [brushSize, setBrushSize] = useState(3);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (activeRoom && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        // Fill canvas with dark background
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [activeRoom]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currX = e.clientX - rect.left;
    const currY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    lastPos.current = { x: currX, y: currY };
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-200">
      
      {/* Header banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white font-sans">AI Peer Study Rooms</h2>
        <p className="text-xs text-slate-400 mt-1">Study live with university peers. Share whiteboard calculations, collaborate on outlines, and host audio calls.</p>
      </div>

      {!activeRoom ? (
        /* Rooms Registry list */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800/80 bg-slate-950/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Active Peer Study Rooms</h3>
            </div>
            
            <button
              onClick={() => setActiveRoom(rooms[0])}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-mono text-[10px] font-bold transition-all cursor-pointer shadow-xs"
            >
              + Create Study Room
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {rooms.map((room) => (
              <div 
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-950/45 transition-colors cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">Created by {room.creator}</span>
                  <h4 className="text-sm font-bold text-white hover:text-indigo-455 transition-colors">{room.name}</h4>
                  <p className="text-xs text-slate-400 max-w-2xl">{room.desc}</p>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
                  <span className="text-slate-500 flex items-center gap-1">
                    🟢 {room.size} students online
                  </span>
                  <button className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/15 rounded font-mono font-bold text-[10px] transition-colors">
                    Join Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Joined Room Workspace */
        <div className="space-y-4 animate-fade-in">
          <button 
            onClick={() => setActiveRoom(null)}
            className="text-xs font-mono text-slate-450 hover:text-white transition-colors flex items-center gap-1"
          >
            ← Leave Room & Back to Lobby
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[550px]">
            
            {/* Left Column: Shared whiteboard (8 cols) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans">{activeRoom.name}</h3>
                  <p className="text-[10px] text-slate-500">Interactive peer drawings. Draw diagrams or write equations.</p>
                </div>

                {/* Whiteboard Controls toolbar */}
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    {["rgb(99, 102, 241)", "rgb(239, 68, 68)", "rgb(16, 185, 129)", "rgb(245, 158, 11)"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-5 h-5 rounded-full border border-slate-800 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: c, border: color === c ? "2px solid #fff" : "none" }}
                      />
                    ))}
                  </div>

                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value={2}>Small</option>
                    <option value={5}>Medium</option>
                    <option value={9}>Thick</option>
                  </select>

                  <button
                    onClick={clearCanvas}
                    className="p-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors text-[9px] font-mono cursor-pointer"
                  >
                    Clear Board
                  </button>
                </div>
              </div>

              {/* Whiteboard Canvas */}
              <div className="flex-1 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden relative cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={380}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full block"
                />
              </div>
            </div>

            {/* Right Column: Peer Sidebar & Notes (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Audio panel participants */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-mono text-slate-455 uppercase tracking-wider block">Voice & Video participants</h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { name: "You (Alex)", active: true, video: false },
                    { name: "Jessica Carter", active: true, video: true },
                    { name: "Robert Liang", active: false, video: false },
                    { name: "Emily Watson", active: true, video: false }
                  ].map((peer, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex flex-col gap-1.5">
                      <span className="font-bold text-slate-350 truncate">{peer.name}</span>
                      <div className="flex justify-between items-center">
                        <span className={`h-1.5 w-1.5 rounded-full ${peer.active ? "bg-emerald-500 animate-pulse" : "bg-slate-700"}`} />
                        <div className="flex gap-1">
                          <Mic className={`h-3.5 w-3.5 ${peer.active ? "text-indigo-400" : "text-slate-600"}`} />
                          <Video className={`h-3.5 w-3.5 ${peer.video ? "text-emerald-400 animate-pulse" : "text-slate-600"}`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Scratch Notes */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex-1 flex flex-col justify-between min-h-[220px]">
                <div className="space-y-2">
                  <h4 className="text-xs font-mono text-slate-455 uppercase tracking-wider block border-b border-slate-800 pb-2">Shared Chapter Notes</h4>
                  <textarea
                    placeholder="Type shared outlines or copy links here for peer review..."
                    rows={8}
                    defaultValue={`- DBMS 3NF decomposition formula:\n  If A -> B transitive, decompose R into R1(A, B) and R2(A, C).\n- Homework Quiz submission scheduled at 4:00 PM.`}
                    className="w-full bg-transparent border-none text-slate-300 focus:outline-none resize-none leading-relaxed text-xs font-mono h-36"
                  />
                </div>

                <div className="pt-2 border-t border-slate-850 flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>Autosaved locally</span>
                  <span className="text-emerald-500">🟢 Collaborating</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
