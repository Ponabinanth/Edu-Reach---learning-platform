export enum UserRole {
  STUDENT = "student",
  FACULTY = "faculty",
  ADMIN = "admin",
  PARENT = "parent"
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  skills: { [key: string]: number }; // Skill scores (0-100)
  createdAt: string;
  childId?: string; // Linked student for Parent role
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown or text description
  videoUrl?: string;
  pdfUrl?: string;
  durationMinutes: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  facultyId: string;
  facultyName: string;
  lessons: Lesson[];
  enrolledStudentsCount: number;
  tags: string[];
  imageUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  facultyId: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  answers: { [questionId: string]: number };
  score: number;
  totalQuestions: number;
  aiFeedback: string;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  dueDate: string;
  facultyId: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  content: string; // Text answer or URL
  fileName?: string;
  score?: number;
  aiFeedback?: string;
  plagiarismScore?: number; // % check
  submittedAt: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string; // e.g., "Arrays", "Trees"
  starterCode: { [lang: string]: string };
  testCases: { input: string; expectedOutput: string }[];
}

export interface MockInterviewSession {
  id: string;
  studentId: string;
  type: "HR" | "Technical" | "Company Specific";
  companyName?: string; // TCS, Accenture, etc.
  messages: { role: "interviewer" | "student"; text: string; timestamp: string }[];
  feedback?: {
    overallScore: number;
    communication: number; // 0-100
    technical: number; // 0-100
    confidence: number; // 0-100
    strengths: string[];
    improvements: string[];
    summary: string;
  };
  status: "active" | "completed";
  createdAt: string;
}

export interface CareerGuidancePlan {
  id: string;
  studentId: string;
  goalRole: string; // e.g. Java Backend Developer
  roadmap: string[]; // List of topics/technologies
  certifications: string[];
  projects: string[];
  courses: string[];
  generatedAt: string;
}

export interface NoteItem {
  id: string;
  title: string;
  summary: string;
  mindMapNodes: { id: string; label: string; parentId?: string }[];
  flashcards: { question: string; answer: string }[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string; // User ID or "AI"
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "assignment" | "quiz" | "course" | "recommendation" | "system";
  read: boolean;
  createdAt: string;
}
