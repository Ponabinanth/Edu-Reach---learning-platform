// API client for EduReach AI platform

const API_BASE = "/api";

async function request(endpoint: string, options: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Authentication
  login: (email: string, role?: string) => 
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  
  register: (email: string, name: string, role: string) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, role }),
    }),

  // Courses
  getCourses: () => request("/courses"),
  
  createCourse: (courseData: { title: string; description: string; category: string; facultyId: string; facultyName: string; tags: string[] }) =>
    request("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    }),
  
  addLesson: (courseId: string, lessonData: { title: string; content: string; videoUrl?: string; pdfUrl?: string; durationMinutes: number }) =>
    request(`/courses/${courseId}/lessons`, {
      method: "POST",
      body: JSON.stringify(lessonData),
    }),

  // Quizzes
  getQuizzes: () => request("/quizzes"),
  
  createQuiz: (quizData: { courseId: string; courseTitle: string; title: string; description: string; durationMinutes: number; questions: any[]; facultyId: string }) =>
    request("/quizzes", {
      method: "POST",
      body: JSON.stringify(quizData),
    }),
  
  submitQuiz: (quizId: string, submissionData: { studentId: string; studentName: string; answers: { [key: string]: number } }) =>
    request(`/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify(submissionData),
    }),

  // Assignments
  getAssignments: () => request("/assignments"),
  
  createAssignment: (assignData: { courseId: string; courseTitle: string; title: string; description: string; dueDate: string; facultyId: string }) =>
    request("/assignments", {
      method: "POST",
      body: JSON.stringify(assignData),
    }),
  
  submitAssignment: (assignmentId: string, submitData: { studentId: string; studentName: string; content: string; fileName?: string }) =>
    request(`/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: JSON.stringify(submitData),
    }),

  // AI Tutor & Questions
  askAITutor: (prompt: string, context?: string, image?: string, provider?: string) =>
    request("/ai/tutor", {
      method: "POST",
      body: JSON.stringify({ prompt, context, image, provider }),
    }),
  
  solveAptitude: (topic: string, questionText: string) =>
    request("/ai/aptitude", {
      method: "POST",
      body: JSON.stringify({ topic, questionText }),
    }),
  
  generateAIQuestions: (type: string, topic: string, difficulty: string, language?: string) =>
    request("/ai/generate-questions", {
      method: "POST",
      body: JSON.stringify({ type, topic, difficulty, language }),
    }),
  
  generateAIQuiz: (topic: string, difficulty: string, count: number, questionType?: string) =>
    request("/ai/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty, count, questionType }),
    }),

  // Coding Practice
  getPracticeProblems: () => request("/practice"),
  
  submitCode: (problemId: string, submitData: { studentId: string; code: string; language: string }) =>
    request(`/practice/${problemId}/submit`, {
      method: "POST",
      body: JSON.stringify(submitData),
    }),
  
  askCodeHint: (problemId: string, hintData: { code: string; language: string }) =>
    request(`/practice/${problemId}/hint`, {
      method: "POST",
      body: JSON.stringify(hintData),
    }),

  askCodingMentor: (code: string, language: string, action: string) =>
    request("/ai/coding-mentor", {
      method: "POST",
      body: JSON.stringify({ code, language, action }),
    }),

  // AI Mock Interview
  startInterview: (studentId: string, type: "HR" | "Technical" | "Company Specific", companyName?: string) =>
    request("/interviews/start", {
      method: "POST",
      body: JSON.stringify({ studentId, type, companyName }),
    }),
  
  sendInterviewMessage: (sessionId: string, text: string) =>
    request(`/interviews/${sessionId}/message`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // AI Resume Analyzer
  analyzeResume: (resumeText: string) =>
    request("/resume/analyze", {
      method: "POST",
      body: JSON.stringify({ resumeText }),
    }),

  parseResumePDF: (pdfBase64: string) =>
    request("/resume/parse", {
      method: "POST",
      body: JSON.stringify({ pdfBase64 }),
    }),

  // Career Guidance
  recommendCareer: (goalRole: string) =>
    request("/career/recommend", {
      method: "POST",
      body: JSON.stringify({ goalRole }),
    }),

  // AI Notes Generator
  generateNotes: (title: string, text: string) =>
    request("/notes/generate", {
      method: "POST",
      body: JSON.stringify({ title, text }),
    }),

  // Analytics
  getAnalytics: (studentId: string) => request(`/analytics/${studentId}`),

  // Leaderboard
  getLeaderboard: () => request("/leaderboard"),

  // Notifications
  getNotifications: (userId: string) => request(`/notifications/${userId}`),
  
  markNotificationRead: (id: string) =>
    request(`/notifications/${id}/read`, {
      method: "POST",
    }),

  // Chat Support
  getChatMessages: (userId: string) => request(`/chat/${userId}`),
  
  sendChatMessage: (chatData: { senderId: string; senderName: string; senderRole: string; receiverId: string; text: string }) =>
    request("/chat", {
      method: "POST",
      body: JSON.stringify(chatData),
    }),

  askAIChatbot: (message: string, userId?: string, provider?: string, agent?: string) =>
    request("/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, userId, provider, agent }),
    }),

  predictPerformance: (studentId: string) =>
    request("/ai/predict-performance", {
      method: "POST",
      body: JSON.stringify({ studentId }),
    }),

  generateExamPaper: (topic: string, difficulty: string, questionType?: string) =>
    request("/ai/generate-exam", {
      method: "POST",
      body: JSON.stringify({ topic, difficulty, questionType }),
    }),

  generateStudyPlan: (goal: string, userId: string) =>
    request("/ai/generate-study-plan", {
      method: "POST",
      body: JSON.stringify({ goal, userId }),
    }),

  translateContent: (text: string, targetLanguage: string) =>
    request("/ai/translate", {
      method: "POST",
      body: JSON.stringify({ text, targetLanguage }),
    }),

  evaluatePlacementReadiness: (evalData: {
    companyName: string;
    resumeText: string;
    atsScore: number;
    aptitudeScore: number;
    codingScore: number;
    interviewTranscript: any[];
    provider?: string;
  }) =>
    request("/placement/evaluate", {
      method: "POST",
      body: JSON.stringify(evalData),
    }),

  createAIResume: (resumeData: {
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    skills: string;
    experience: string;
    education: string;
    theme: string;
  }) =>
    request("/resume/create", {
      method: "POST",
      body: JSON.stringify(resumeData),
    })
};
