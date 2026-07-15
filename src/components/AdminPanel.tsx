import React from "react";
import { Users, FileSpreadsheet, FileDown, ShieldAlert, Sparkles } from "lucide-react";

export default function AdminPanel() {
  const mockStudents = [
    { id: "std_1", name: "Alex Johnson", email: "student@edureach.ai", level: 4, xp: 1250 },
    { id: "std_2", name: "Jessica Carter", email: "jessica@edureach.ai", level: 3, xp: 950 },
    { id: "std_3", name: "Robert Liang", email: "robert@edureach.ai", level: 2, xp: 620 }
  ];

  const mockFaculty = [
    { id: "fac_1", name: "Dr. Sarah Mitchell", email: "faculty@edureach.ai", department: "Computer Science" }
  ];

  const handleExportReport = (type: "excel" | "pdf") => {
    // Standard mock file exporter
    const element = document.createElement("a");
    const file = new Blob([`EduReach AI Academic Report\nExport Date: ${new Date().toLocaleDateString()}\nStatus: Active\n\nStudents:\n` + 
      mockStudents.map(s => `${s.name} - Level ${s.level} - ${s.xp} XP`).join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = type === "excel" ? "EduReach_Placement_Report.csv" : "EduReach_Placement_Report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
          <ShieldAlert className="h-5.5 w-5.5 text-indigo-400" />
          <span>System Administrator Dashboard</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Global directory lookup, role allocations, system activity logs, and comprehensive placements reports downloads.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users lists directories column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-sans">Active Student Directories</h3>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 font-mono">
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Rank Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {mockStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-950/10">
                      <td className="p-3 font-mono text-slate-500">{std.id}</td>
                      <td className="p-3 font-medium text-white">{std.name}</td>
                      <td className="p-3 font-mono text-slate-400">{std.email}</td>
                      <td className="p-3 font-mono">Level {std.level} ({std.xp} XP)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800/80 bg-slate-950/20 flex items-center gap-1.5">
              <Users className="h-4.5 w-4.5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white font-sans">Faculty & Instructors</h3>
            </div>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 font-mono">
                    <th className="p-3">ID</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {mockFaculty.map((fac) => (
                    <tr key={fac.id} className="hover:bg-slate-950/10">
                      <td className="p-3 font-mono text-slate-500">{fac.id}</td>
                      <td className="p-3 font-medium text-white">{fac.name}</td>
                      <td className="p-3 font-mono text-slate-400">{fac.email}</td>
                      <td className="p-3">{fac.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Global actions sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white font-sans">Syllabus Placement Reports</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">Compile active mock placements scores, homework averages, and dynamic student ratings into offline reports.</p>
            
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleExportReport("excel")}
                className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/15 text-emerald-400 font-mono text-xs font-bold rounded-lg border border-emerald-500/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export CSV Placement Sheet
              </button>
              <button
                onClick={() => handleExportReport("pdf")}
                className="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-mono text-xs font-bold rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <FileDown className="h-4 w-4" /> Export Plaintext PDF Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
