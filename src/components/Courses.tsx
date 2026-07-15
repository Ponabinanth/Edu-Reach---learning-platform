import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Plus, 
  Video, 
  FileText, 
  Clock, 
  ChevronRight, 
  Play, 
  ArrowLeft, 
  Sparkles, 
  Cpu, 
  BookOpenCheck,
  CheckCircle2,
  Trash2,
  ListRestart,
  RefreshCw
} from "lucide-react";
import { Course, Lesson, UserProfile, UserRole } from "../types";
import { api } from "../api";

interface CoursesProps {
  user: UserProfile;
  courses: Course[];
  onCourseAdded: () => void;
  onLessonAdded: () => void;
  globalLanguage?: string;
}

export default function Courses({ user, courses, onCourseAdded, onLessonAdded, globalLanguage }: CoursesProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Lesson Translation States
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedContent, setTranslatedContent] = useState("");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const translateActiveLesson = async () => {
      if (!activeLesson) return;
      if (!globalLanguage || globalLanguage === "English") {
        setTranslatedTitle("");
        setTranslatedContent("");
        return;
      }

      setTranslating(true);
      try {
        const titleRes = await api.translateContent(activeLesson.title, globalLanguage);
        const contentRes = await api.translateContent(activeLesson.content, globalLanguage);
        if (titleRes.success && contentRes.success) {
          setTranslatedTitle(titleRes.translatedText);
          setTranslatedContent(contentRes.translatedText);
        }
      } catch (err) {
        console.error("Courses translation error:", err);
      } finally {
        setTranslating(false);
      }
    };
    translateActiveLesson();
  }, [activeLesson, globalLanguage]);
  
  // Modals / forms
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCategory, setCourseCategory] = useState("Computer Science");
  const [courseTags, setCourseTags] = useState("");

  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [lessonPdf, setLessonPdf] = useState("");
  const [lessonDuration, setLessonDuration] = useState("15");

  // AI Doubt resolver inside lesson
  const [aiLessonPrompt, setAiLessonPrompt] = useState("");
  const [aiLessonExplanation, setAiLessonExplanation] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Quick enroll simulation state
  const [enrolledList, setEnrolledList] = useState<string[]>(["course_1"]);

  const handleEnroll = (courseId: string) => {
    if (!enrolledList.includes(courseId)) {
      setEnrolledList([...enrolledList, courseId]);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseDesc) return;
    try {
      await api.createCourse({
        title: courseTitle,
        description: courseDesc,
        category: courseCategory,
        facultyId: user.id,
        facultyName: user.name,
        tags: courseTags.split(",").map(t => t.trim()).filter(Boolean)
      });
      setCourseTitle("");
      setCourseDesc("");
      setCourseTags("");
      setShowAddCourse(false);
      onCourseAdded();
    } catch (err) {
      alert("Error creating course: " + err);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !lessonTitle || !lessonContent) return;
    try {
      await api.addLesson(selectedCourse.id, {
        title: lessonTitle,
        content: lessonContent,
        videoUrl: lessonVideo || undefined,
        pdfUrl: lessonPdf || undefined,
        durationMinutes: Number(lessonDuration) || 15
      });
      setLessonTitle("");
      setLessonContent("");
      setLessonVideo("");
      setLessonPdf("");
      setShowAddLesson(false);
      onLessonAdded();
      
      // Update selected course view with the newly added lesson locally
      setSelectedCourse({
        ...selectedCourse,
        lessons: [
          ...selectedCourse.lessons,
          {
            id: Math.random().toString(),
            title: lessonTitle,
            content: lessonContent,
            videoUrl: lessonVideo || undefined,
            pdfUrl: lessonPdf || undefined,
            durationMinutes: Number(lessonDuration) || 15
          }
        ]
      });
    } catch (err) {
      alert("Error adding lesson: " + err);
    }
  };

  const askAiDoubt = async () => {
    if (!aiLessonPrompt || !activeLesson) return;
    setLoadingAi(true);
    setAiLessonExplanation("");
    try {
      const response = await api.askAITutor(
        `On the lesson "${activeLesson.title}", the student asks: "${aiLessonPrompt}".
Lesson content for reference:
${activeLesson.content}
Give a quick 3-4 sentence comprehensive, clear answer.`,
        activeLesson.content
      );
      setAiLessonExplanation(response.text);
    } catch (err) {
      setAiLessonExplanation("Sorry, I could not query the AI model at this moment. Reviewing lesson material is recommended.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (selectedCourse) {
    const isEnrolled = enrolledList.includes(selectedCourse.id) || user.role !== UserRole.STUDENT;

    return (
      <div className="space-y-6 animate-fade-in text-slate-700">
        {/* Back navigation */}
        <button 
          onClick={() => { setSelectedCourse(null); setActiveLesson(null); }}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Library</span>
        </button>

        {/* Course detail header */}
        <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 border border-slate-100 p-6 md:p-8 rounded-2xl relative overflow-hidden shadow-xs">
          <div className="absolute right-0 top-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase">
                {selectedCourse.category}
              </span>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-2.5">
                {selectedCourse.title}
              </h2>
              <p className="text-slate-650 text-xs font-semibold mt-2 max-w-2xl">{selectedCourse.description}</p>
              
              <div className="flex items-center gap-4 mt-4 text-xs font-bold text-slate-400">
                <span>By {selectedCourse.facultyName}</span>
                <span>•</span>
                <span>{selectedCourse.lessons.length} Lesson{selectedCourse.lessons.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div>
              {user.role === UserRole.STUDENT ? (
                isEnrolled ? (
                  <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold rounded-xl text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" /> Enrolled
                  </span>
                ) : (
                  <button 
                    onClick={() => handleEnroll(selectedCourse.id)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                  >
                    Enroll Now
                  </button>
                )
              ) : (
                <button 
                  onClick={() => setShowAddLesson(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Lesson
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Syllabus / Lesson List column */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Syllabus Chapters</h3>
            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 shadow-xs">
              {selectedCourse.lessons.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  id={`lesson-item-${idx}`}
                  disabled={!isEnrolled}
                  onClick={() => { setActiveLesson(lesson); setAiLessonExplanation(""); }}
                  className={`w-full text-left p-4 flex items-center justify-between gap-4 transition-all ${
                    activeLesson?.id === lesson.id 
                      ? "bg-blue-50 text-blue-700 border-l-3 border-blue-600 font-bold" 
                      : isEnrolled 
                        ? "text-slate-600 hover:bg-slate-50 hover:text-slate-800" 
                        : "text-slate-400 cursor-not-allowed bg-slate-50/50"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold text-slate-400">Chapter {idx + 1}</span>
                    <h4 className="text-xs font-bold truncate mt-0.5">{lesson.title}</h4>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-slate-400 font-bold">
                      <Clock className="h-3 w-3" /> {lesson.durationMinutes} mins
                    </span>
                  </div>
                  {isEnrolled && <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />}
                </button>
              ))}

              {selectedCourse.lessons.length === 0 && (
                <p className="p-6 text-xs text-slate-500 italic text-center">No lessons added to this course syllabus yet.</p>
              )}
            </div>
          </div>

          {/* Active Lesson Interactive Material Viewer column */}
          <div className="lg:col-span-2 space-y-6">
            {activeLesson ? (
              <div className="space-y-6 animate-fade-in">
                {/* PDF or Video Material Players */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeLesson.videoUrl && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden p-4">
                      <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1 mb-2">
                        <Video className="h-3.5 w-3.5" /> Video Lecture Demonstration
                      </span>
                      {activeLesson.videoUrl.includes("youtube.com") || activeLesson.videoUrl.includes("youtu.be") ? (
                        <div className="relative mt-1.5 aspect-video rounded-lg overflow-hidden border border-slate-200 bg-black shadow-xs">
                          <iframe
                            className="w-full h-full"
                            src={activeLesson.videoUrl}
                            title={activeLesson.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        /* Video Player Embed Simulator */
                        <div className="relative mt-2 aspect-video bg-white border border-slate-200 rounded-lg flex items-center justify-center group overflow-hidden">
                          <Play className="h-10 w-10 text-slate-650 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all pointer-events-none z-10" />
                          <div className="absolute inset-0 bg-blue-50/10 group-hover:bg-blue-50/20 transition-all" />
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 font-bold text-[9px] rounded uppercase">HTML5 demo</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeLesson.pdfUrl && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden p-4">
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Download Study Material PDF
                      </span>
                      {/* PDF Simulator */}
                      <div className="relative mt-2 aspect-video bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center p-4 text-center shadow-2xs">
                        <FileText className="h-8 w-8 text-slate-400 mb-1" />
                        <span className="text-[11px] font-bold text-slate-700 line-clamp-1">
                          {translating ? "Translating..." : (translatedTitle || activeLesson.title)}.pdf
                        </span>
                        <a 
                          href={activeLesson.pdfUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="mt-2.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] rounded border border-slate-200 transition-colors shadow-2xs"
                        >
                          View PDF Link
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson text explanation block */}
                <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-xs">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Lesson Reference Notes</h3>
                    {globalLanguage && globalLanguage !== "English" && (
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] font-bold rounded-full font-sans uppercase animate-pulse">
                        Auto-Translated to {globalLanguage}
                      </span>
                    )}
                  </div>
                  <div className="prose max-w-none text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans font-medium">
                    {translating 
                      ? "Translating notes to target language..." 
                      : (translatedContent || activeLesson.content)}
                  </div>
                </div>

                {/* Dynamic AI Doubt Resolver panel */}
                <div className="bg-gradient-to-r from-blue-50/40 to-indigo-50/40 border border-blue-100 p-6 rounded-xl space-y-4 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-blue-600 animate-pulse" />
                    <h4 className="text-sm font-black text-slate-800 font-sans">Ask AI Doubt Resolver Contextually</h4>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">Type any question regarding this chapter and our model will solve it based on the lesson notes.</p>
                  
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      id="input-ai-doubt"
                      value={aiLessonPrompt}
                      onChange={(e) => setAiLessonPrompt(e.target.value)}
                      placeholder="e.g. Can you explain the difference between singly and doubly linked lists simply?"
                      className="flex-1 bg-white border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-medium shadow-2xs"
                    />
                    <button 
                      onClick={askAiDoubt}
                      disabled={loadingAi}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {loadingAi ? "Resolving..." : "Solve"}
                    </button>
                  </div>

                  {aiLessonExplanation && (
                    <div className="p-4 bg-white rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed font-sans space-y-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-blue-600 font-bold uppercase text-[10px]">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" /> AI Response
                      </div>
                      <p className="font-medium">{aiLessonExplanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-8 rounded-xl text-center py-16 flex flex-col items-center shadow-xs">
                <BookOpenCheck className="h-12 w-12 text-slate-350 mb-4" />
                <h4 className="text-sm font-bold text-slate-700">No Chapter Selected</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">
                  {isEnrolled 
                    ? "Select a lesson chapter from the syllabus table on the left to review the notes, watch explanation lectures, and use AI doubts solvers."
                    : "Please enroll in this course first to unlock syllabus chapters and active AI study mentors."
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Lesson Modal */}
        {showAddLesson && (
          <div className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-100 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-black text-slate-800 font-sans">Add Lesson Chapter</h3>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Lesson Title</label>
                  <input 
                    type="text" 
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                    placeholder="e.g. Graph Representation & Traversals"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    required
                    placeholder="15"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Reference Content / Explanations</label>
                  <textarea 
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    required
                    rows={4}
                    placeholder="Type detailed learning notes and programming templates..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 resize-none font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Video Demo URL (Optional)</label>
                    <input 
                      type="text" 
                      value={lessonVideo}
                      onChange={(e) => setLessonVideo(e.target.value)}
                      placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">PDF URL (Optional)</label>
                    <input 
                      type="text" 
                      value={lessonPdf}
                      onChange={(e) => setLessonPdf(e.target.value)}
                      placeholder="e.g. https://www.w3.org/pdf.pdf"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddLesson(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                  >
                    Save Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // BROWSE COURSE CATALOGUE LIST
  return (
    <div className="space-y-6 animate-fade-in text-slate-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 font-sans">Educational Course Catalogue</h2>
          <p className="text-xs text-slate-500 mt-1">Explore our standard academic courses guided by expert staff and instant generative learning tutors.</p>
        </div>

        {user.role === UserRole.FACULTY && (
          <button 
            id="btn-create-course"
            onClick={() => setShowAddCourse(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Plus className="h-4 w-4" /> Create Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const isEnrolled = enrolledList.includes(course.id) || user.role !== UserRole.STUDENT;
          return (
            <div 
              key={course.id} 
              className="bg-white border border-slate-100 hover:border-slate-250 p-5 rounded-2xl flex flex-col justify-between space-y-4 group transition-all shadow-xs"
            >
              <div className="space-y-2.5">
                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase">
                  {course.category}
                </span>
                <h3 className="text-base font-bold text-slate-850 leading-snug group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">{course.description}</p>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {course.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">
                  {course.lessons.length} lesson{course.lessons.length !== 1 ? 's' : ''}
                </span>
                
                <button
                  id={`btn-view-course-${course.id}`}
                  onClick={() => { setSelectedCourse(course); if (course.lessons.length > 0) setActiveLesson(course.lessons[0]); }}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-750 text-xs font-bold rounded-lg border border-slate-200 transition-colors shadow-2xs"
                >
                  {isEnrolled ? "Study Course" : "Enroll & Study"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-slate-850 font-sans">Create Educational Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Course Syllabus Title</label>
                <input 
                  type="text" 
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  required
                  placeholder="e.g. Masterclass on Database Query Optimization"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500">Short Summary</label>
                <textarea 
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  required
                  rows={3}
                  placeholder="Provide an overview describing study outcomes, frameworks, and prerequisites..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 resize-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Category</label>
                  <select
                    value={courseCategory}
                    onChange={(e) => setCourseCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  >
                    <option>Computer Science</option>
                    <option>Software Engineering</option>
                    <option>Data & Analytics</option>
                    <option>Cloud Computing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    value={courseTags}
                    onChange={(e) => setCourseTags(e.target.value)}
                    placeholder="SQL, Indexing, Performance"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:outline-none rounded-lg px-3.5 py-2 text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddCourse(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
