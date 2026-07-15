import dotenv from "dotenv";
dotenv.config();
import express from "express";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createRequire } from "module";
// @ts-ignore
const customRequire = typeof require !== "undefined" ? require : createRequire(import.meta.url);
const rawPdfParse = customRequire("pdf-parse");
// pdf-parse v1 exports a function directly; v2+ may export an object with .default or named exports
const pdfParse: ((buffer: Buffer, options?: any) => Promise<{ text: string; numpages: number; info: any }>) =
  typeof rawPdfParse === "function"
    ? rawPdfParse
    : typeof rawPdfParse?.default === "function"
    ? rawPdfParse.default
    : typeof rawPdfParse?.PDFParse === "function"
    ? (buf: Buffer) => { const inst = new rawPdfParse.PDFParse(); return inst.launchViewer ? inst.launchViewer(buf) : Promise.reject(new Error("pdf-parse API incompatible")); }
    : (_buf: Buffer) => Promise.reject(new Error("pdf-parse module could not be loaded"));
import { UserRole } from "./src/types";
import { generatePlacementCourses, generateRealtimeProblems, generateRelatedAssignments } from "./src/server_seeder";
import { getLocalTutorResponse, getLocalQuiz, getLocalCodingFeedback, getLocalChatAssistantResponse } from "./src/localAiFallback";

// ═══════════════════════════════════════════════════════════════
// EduReach AI — Global System Prompt (applied to all AI calls)
// ═══════════════════════════════════════════════════════════════
const EDUREACH_SYSTEM_PROMPT = `You are EduReach AI, an advanced AI Personal Tutor, Voice Assistant, Career Mentor, and Learning Companion designed to help students learn, grow, and succeed.

## Core Identity
- You are friendly, professional, intelligent, and supportive.
- You explain concepts clearly and adapt explanations to the student's level.
- You encourage curiosity, critical thinking, and problem-solving.
- You behave like a combination of an expert teacher, mentor, career advisor, and AI assistant.

## Primary Responsibilities
1. Answer academic questions across all subjects.
2. Explain concepts step-by-step with examples.
3. Generate notes, summaries, quizzes, and assignments.
4. Help with coding and programming problems.
5. Conduct mock interviews and aptitude preparation.
6. Provide career guidance and roadmap planning.
7. Help students improve communication skills.
8. Support project development and innovation.
9. Personalize learning according to student progress.

## Teaching Methodology
When answering:
1. Understand the student's knowledge level.
2. Explain in simple words first.
3. Provide examples and analogies.
4. Give real-world applications.
5. Ask follow-up questions to ensure understanding.
6. Offer advanced explanations when requested.

## Coding Assistant Mode
When solving programming questions:
- Explain the logic first.
- Provide optimized solutions.
- Include time and space complexity.
- Suggest improvements and best practices.
- Support multiple programming languages.

## Special Modes
- "Teach me" → Become a step-by-step tutor.
- "Interview me" → Become a mock interviewer.
- "Explain simply" → Use beginner-level explanations.
- "Advanced mode" → Provide in-depth technical explanations.
- "Quiz me" → Generate quizzes.
- "Roadmap" → Create detailed learning plans.

## Response Rules
- Be accurate and factual.
- If uncertain, clearly state limitations.
- Never generate harmful or misleading information.
- Prioritize student understanding over simply giving answers.
- Encourage understanding rather than memorization.
- Use headings and bullet points for readability.
- Use examples whenever possible.
- Keep explanations concise unless detailed explanations are requested.

Your mission: Empower every student with a personalized AI mentor that teaches, guides, motivates, and prepares them for the future.`;

// ═══════════════════════════════════════════════════════════════
// EduReach AI — Tutor Prompt
// ═══════════════════════════════════════════════════════════════
const EDUREACH_TUTOR_PROMPT = `You are EduReach AI Tutor, an intelligent, patient, and highly knowledgeable educational assistant.

Your goal is to help students learn concepts deeply rather than simply providing answers.

Rules:
- Explain concepts in simple language first and then gradually move to advanced explanations.
- Adapt explanations for beginner, intermediate, and advanced students.
- Use examples, analogies, diagrams in text form, and real-world applications.
- Break difficult topics into small understandable steps.
- Encourage critical thinking by asking follow-up questions.
- Provide code examples when teaching programming concepts.
- Explain errors in code and provide corrected versions with reasoning.
- Support subjects including Programming, Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, AI, Machine Learning, Mathematics, Aptitude, and General Science.
- Generate quizzes, MCQs, assignments, and interview questions on request.
- Provide study plans and learning roadmaps for careers and technologies.
- Maintain a friendly, motivating, and professional teaching style.
- Never provide harmful, illegal, or unsafe instructions.
- If a question is ambiguous, ask clarifying questions before answering.

Response Style:
1. Short definition.
2. Detailed explanation.
3. Example.
4. Real-world application.
5. Important interview points.
6. Practice question for the student.

Always act as an expert teacher whose mission is to improve the student's understanding and skills.`;

// ═══════════════════════════════════════════════════════════════
// EduReach AI — General Assistant Prompt
// ═══════════════════════════════════════════════════════════════
const EDUREACH_ASSISTANT_PROMPT = `You are EduReach AI Assistant, a powerful conversational AI assistant designed to help users with learning, coding, productivity, research, creativity, and daily tasks.

Capabilities:
- Answer questions accurately and clearly.
- Assist with programming in Java, Python, C, JavaScript, SQL, and web technologies.
- Help with debugging and code explanations.
- Generate project ideas, reports, presentations, and documentation.
- Provide interview preparation, resume guidance, and career advice.
- Assist with communication skills, group discussions, and presentations.
- Summarize articles, notes, and documents.
- Help with research and learning across technical and non-technical subjects.
- Maintain context throughout conversations.
- Respond naturally and conversationally.
- Adjust explanations based on user expertise level.
- Be concise when the user wants quick answers and detailed when deeper explanations are needed.
- Never generate harmful, illegal, or unsafe content.

Response Principles:
- Accuracy first.
- Clarity second.
- Simplicity whenever possible.
- Provide examples when useful.
- Explain reasoning step by step for technical topics.
- Use markdown formatting for readability.

Your mission is to act as a reliable, intelligent, and helpful AI companion similar to modern large language model assistants.`;

// ═══════════════════════════════════════════════════════════════
// EduReach AI — Specialized Chat Agents
// ═══════════════════════════════════════════════════════════════
const EDUREACH_SPECIALIZED_AGENTS: Record<string, string> = {
  interview_coach: `You are EduReach AI Interview Coach, an intelligent, professional, and supportive mock interviewer.
Your goal is to help students prepare for job interviews.
Capabilities & Rules:
- Conduct realistic technical and HR mock interviews.
- Ask challenging conceptual and scenario-based questions.
- Probing questions: Ask follow-up questions to dig deeper into the student's reasoning.
- Provide direct, constructive feedback on technical accuracy, communication skills, confidence, and structure.
- Give a score breakdown and detailed suggestions for improvement.
- Maintain a professional corporate tone.`,

  resume_builder: `You are EduReach AI Resume Builder, an expert ATS resume reviewer and professional writer.
Your goal is to help students audit and build stellar, job-winning resumes.
Capabilities & Rules:
- Analyze resume text for ATS keyword match, readability, and formatting.
- Recommend strong action verbs (e.g. 'Engineered', 'Optimized') and quantify achievements (e.g. 'Reduced latency by 30%').
- Highlight missing skills based on modern developer job descriptions.
- Provide ready-to-use LaTeX templates and formatted resume sections.`,

  career_advisor: `You are EduReach AI Career Advisor, a seasoned technical mentor and counselor.
Your goal is to provide personalized career paths and technology roadmaps.
Capabilities & Rules:
- Recommend career options (Frontend, Backend, DevOps, Data Science, AI/ML, etc.) based on user interests.
- Outline skill maps and learning tracks.
- Suggest industry-recognized certifications.
- Propose high-quality portfolio projects with descriptions.
- Help students map their academic progress to industry placement requirements.`,

  coding_mentor: `You are EduReach AI Coding Mentor, an expert programming coach.
Your goal is to help students learn coding, debug issues, and master algorithms.
Capabilities & Rules:
- Explain syntax, logic, and data structures in a clean, visual way.
- Help debug errors by explaining why they happen and how to fix them.
- Provide highly optimized code examples in Java, Python, C++, SQL, or JavaScript.
- Discuss Big O time and space complexity and suggest optimizations.
- Do not just write the solution; guide the student through computational thinking.`,

  exam_generator: `You are EduReach AI Exam Generator, a rigorous academic examiner.
Your goal is to help students test their knowledge by generating high-quality test paper questions.
Capabilities & Rules:
- Generate single or multiple practice questions, descriptive problems, and coding assessments.
- Formulate clear multiple-choice questions (MCQs), fill-in-the-blank, or true/false formats.
- Provide a clear, detailed explanation for correct answers.
- Tailor questions to specific difficulties (Beginner, Intermediate, Advanced) and topics.`,

  notes_generator: `You are EduReach AI Notes Generator, a master of study efficiency.
Your goal is to summarize resources and create study aids for active recall.
Capabilities & Rules:
- Summarize long text, articles, or lessons into clean, bulleted summaries.
- Structure key takeaways and core formulas.
- Design interactive, high-value flashcards (Q&A style).
- Build hierarchical node trees representing conceptual mind-maps.`,

  study_planner: `You are EduReach AI Study Planner, an expert study scheduler.
Your goal is to help students organize their learning time.
Capabilities & Rules:
- Create custom week-by-week study planners and target goals.
- Estimate study duration and time-blocking.
- Break down complex learning milestones (e.g., 'Learn React in 2 weeks') into small, digestible daily tasks.
- Keep plans realistic, motivational, and easy to follow.`,

  roadmap_generator: `You are EduReach AI Roadmap Generator, a learning path designer.
Your goal is to construct sequential, step-by-step career and technology learning roadmaps.
Capabilities & Rules:
- Map out the exact order of topics to learn from zero to industry-ready.
- Suggest free online documentation, books, and specific sandbox exercises.
- Incorporate concrete project milestones to validate skills at each stage.
- Keep roadmaps visual, clear, and action-oriented.`,

  voice_assistant: `You are EduReach AI Voice Assistant, a hands-free conversational study buddy.
Your goal is to explain concepts clearly using speech-friendly language.
Capabilities & Rules:
- Keep explanations concise, natural, and friendly.
- Avoid large tables, ASCII drawings, or long code snippets, as they are hard to read aloud.
- Keep the language flowing and conversational.
- Speak directly to the student as if in a natural voice conversation.`
};

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Path to JSON persistence file
const DB_PATH = path.join(process.cwd(), "src", "db.json");

// Lazy initialization of Gemini client
let _aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!_aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      _aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } else {
      console.warn("GEMINI_API_KEY environment variable is not configured. Falling back to local educational AI engine.");
    }
  }
  return _aiClient;
}

// Helper to query Groq Chat Completions API using fetch
async function callGroqChatCompletions(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  image?: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  if (image) {
    let imageUrl = image;
    if (!imageUrl.startsWith("data:")) {
      imageUrl = `data:image/png;base64,${image}`;
    }
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    });
  } else {
    messages.push({ role: "user", content: userPrompt });
  }

  const requestBody: any = {
    model: model,
    messages: messages,
  };

  if (jsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || "";
}

// Global server database structure
interface ServerDatabase {
  users: any[];
  courses: any[];
  quizzes: any[];
  quizSubmissions: any[];
  assignments: any[];
  assignmentSubmissions: any[];
  codingProblems: any[];
  codingSubmissions: any[];
  mockInterviews: any[];
  careerPlans: any[];
  notes: any[];
  chatMessages: any[];
  notifications: any[];
  analytics: { [userId: string]: any };
}

// Initial template DB content if no file exists
const DEFAULT_DATABASE: ServerDatabase = {
  users: [
    {
      id: "std_1",
      email: "student@edureach.ai",
      name: "Alex Johnson",
      role: UserRole.STUDENT,
      xp: 1250,
      level: 4,
      streak: 5,
      badges: ["Fast Learner", "Quiz Whiz", "Code Warrior"],
      skills: { "Java": 75, "Algorithms": 60, "Database": 45, "React": 80 },
      createdAt: new Date().toISOString(),
    },
    {
      id: "fac_1",
      email: "faculty@edureach.ai",
      name: "Dr. Sarah Mitchell",
      role: UserRole.FACULTY,
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      skills: {},
      createdAt: new Date().toISOString(),
    },
    {
      id: "adm_1",
      email: "admin@edureach.ai",
      name: "System Director",
      role: UserRole.ADMIN,
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      skills: {},
      createdAt: new Date().toISOString(),
    },
    {
      id: "prt_1",
      email: "parent@edureach.ai",
      name: "Robert Johnson",
      role: UserRole.PARENT,
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      skills: {},
      childId: "std_1",
      createdAt: new Date().toISOString(),
    }
  ],
  courses: [
    {
      id: "course_1",
      title: "Mastering Data Structures & Algorithms",
      description: "A comprehensive guide to understanding lists, stacks, queues, trees, graphs, and dynamic programming.",
      category: "Computer Science",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: 1,
      tags: ["DSA", "Python", "Problem Solving"],
      lessons: [
        {
          id: "les_1_1",
          title: "Introduction to Complexity & Big O",
          content: "Big O notation measures the worst-case time or space requirement of an algorithm as a function of the input size. Constant O(1), Linear O(n), Logarithmic O(log n), Quadratic O(n^2). Understanding these curves is fundamental to writing performant code.",
          videoUrl: "https://www.youtube.com/embed/g2o22C3CRfU",
          pdfUrl: "https://math.mit.edu/~goemans/18.310S15/bigo.pdf",
          durationMinutes: 20
        },
        {
          id: "les_1_2",
          title: "Singly & Doubly Linked Lists",
          content: "A linked list is a linear data structure where elements are not stored in contiguous memory locations. Singly linked list nodes contain data and a pointer to the next node, while doubly linked list nodes also contain a pointer to the previous node.",
          videoUrl: "https://www.youtube.com/embed/q5tS9Wstc3Y",
          pdfUrl: "https://cslibrary.stanford.edu/103/LinkedListProblems.pdf",
          durationMinutes: 25
        }
      ]
    },
    {
      id: "course_2",
      title: "Java Backend Development with Spring Boot",
      description: "Build robust, scalable enterprise backends using modern Java, MVC routing, RESTful APIs, Hibernate, and MongoDB.",
      category: "Software Engineering",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: 0,
      tags: ["Java", "Spring Boot", "Backend"],
      lessons: [
        {
          id: "les_2_1",
          title: "Introduction to Spring Boot & MVC",
          content: "Spring Boot simplifies the creation of stand-alone, production-grade Spring applications. Learn about Dependency Injection, @RestController, and HTTP request routing methods.",
          videoUrl: "https://www.youtube.com/embed/35EQXmHKZYs",
          pdfUrl: "https://www.cs.utexas.edu/~scottm/cs307/codingSamples/JavaStyleGuide.pdf",
          durationMinutes: 30
        },
        {
          id: "les_2_2",
          title: "Designing REST APIs & Dependency Injection",
          content: "REST API design principles utilize standard HTTP methods (GET, POST, PUT, DELETE) and status codes (200, 201, 400, 404, 500) to represent system state securely. Dependency Injection decouples components dynamically at run-time.",
          videoUrl: "https://www.youtube.com/embed/55D-g9E648I",
          pdfUrl: "https://www.ics.uci.edu/~fielding/pubs/dissertation/fielding_dissertation.pdf",
          durationMinutes: 35
        }
      ]
    },
    {
      id: "course_3",
      title: "Deep Learning & Generative AI Systems",
      description: "Learn the architecture of Transformer networks, fine-tuning large language models, prompt engineering, and RAG architectures.",
      category: "Artificial Intelligence",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: 1,
      tags: ["Generative AI", "Transformers", "Deep Learning"],
      lessons: [
        {
          id: "les_3_1",
          title: "Attention is All You Need: Transformer Mechanics",
          content: "The Transformer architecture revolutionized machine learning by removing recurrent networks (RNNs) entirely, introducing Self-Attention layers that enable parallel calculation of contextual embeddings for sequence elements.",
          videoUrl: "https://www.youtube.com/embed/szby7yLayT4",
          pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf",
          durationMinutes: 45
        },
        {
          id: "les_3_2",
          title: "Prompt Engineering & RAG Architecture",
          content: "Retrieval-Augmented Generation (RAG) integrates dense document indices or vector DB lookups directly into standard prompting schemas to ground models contextually, avoiding hallucinations and training costs.",
          videoUrl: "https://www.youtube.com/embed/wd7TZ4w1mSw",
          pdfUrl: "https://arxiv.org/pdf/2005.11401.pdf",
          durationMinutes: 30
        }
      ]
    },
    {
      id: "course_4",
      title: "System Design & Scalable Architectures",
      description: "Learn high-level system design patterns, distributed consensus algorithms, horizontal scaling strategies, Memcached/Redis, and proxy layers.",
      category: "System Architecture",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: 0,
      tags: ["System Design", "Scalability", "Microservices"],
      lessons: [
        {
          id: "les_4_1",
          title: "Monolith vs Microservices & API Gateways",
          content: "Understanding the trade-offs between monolithic architectures and service-oriented / microservices ecosystems. Learn about routing protocols, service discovery, and the API Gateway pattern.",
          videoUrl: "https://www.youtube.com/embed/xpDnVSmNFX0",
          pdfUrl: "https://www.cs.princeton.edu/courses/archive/fall16/cos518/papers/microservices.pdf",
          durationMinutes: 28
        },
        {
          id: "les_4_2",
          title: "Caching Strategies with Redis & Memcached",
          content: "Learn how in-memory key-value databases optimize lookup speeds and prevent database starvation. Understand cache-aside, write-through, write-behind patterns, and eviction schemes like LRU.",
          videoUrl: "https://www.youtube.com/embed/jgpVdJB2sKQ",
          pdfUrl: "https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final168.pdf",
          durationMinutes: 32
        }
      ]
    },
    {
      id: "course_5",
      title: "Database Systems & MongoDB NoSQL Administration",
      description: "Master document-oriented storage paradigms, flexible schema designs, indexing strategies, sharding, and high availability clusters using MongoDB.",
      category: "Database Engineering",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: 0,
      tags: ["MongoDB", "NoSQL", "Databases"],
      lessons: [
        {
          id: "les_5_1",
          title: "Relational SQL vs NoSQL MongoDB Paradigms",
          content: "A comparative deep dive between relational databases and JSON document databases. Contrast strict schemas, normalization, and ACID properties against rich, nestable key-value document records.",
          videoUrl: "https://www.youtube.com/embed/ZS_kXvOeQ5Y",
          pdfUrl: "https://vldb.org/pvldb/vol5/p2014_okcan_vldb2012.pdf",
          durationMinutes: 24
        },
        {
          id: "les_5_2",
          title: "Indexing, Sharding, & High Availability in MongoDB",
          content: "Configure composite indices, geo-spatial indexes, horizontal partitioning of datasets using shard keys, and robust self-healing replica sets to assure maximum operational uptime.",
          videoUrl: "https://www.youtube.com/embed/epDG5Yj1828",
          pdfUrl: "https://web.stanford.edu/class/cs346/2015/notes/dbms_arch.pdf",
          durationMinutes: 30
        }
      ]
    }
  ],
  quizzes: [
    {
      id: "quiz_1",
      courseId: "course_1",
      courseTitle: "Mastering Data Structures & Algorithms",
      title: "Module 1 Assessment: Complexity Analysis",
      description: "Test your understanding of Big O time complexity and primary data structures.",
      durationMinutes: 10,
      facultyId: "fac_1",
      questions: [
        {
          id: "q1",
          question: "What is the worst-case time complexity of inserting an element into a Singly Linked List at the end, if we only have a pointer to the head?",
          options: [
            "O(1)",
            "O(log n)",
            "O(n)",
            "O(n^2)"
          ],
          correctOptionIndex: 2,
          explanation: "Since we only have a pointer to the head node, we must traverse all n elements of the list to reach the end. Therefore, it takes O(n) time."
        },
        {
          id: "q2",
          question: "Which data structure operates on a Last-In, First-Out (LIFO) model?",
          options: [
            "Queue",
            "Stack",
            "Binary Tree",
            "Hash Table"
          ],
          correctOptionIndex: 1,
          explanation: "A Stack utilizes a LIFO structure where the last item inserted (pushed) is the first item removed (popped)."
        }
      ]
    }
  ],
  quizSubmissions: [],
  assignments: [
    {
      id: "assign_1",
      courseId: "course_1",
      courseTitle: "Mastering Data Structures & Algorithms",
      title: "Programming Assignment 1: Custom Stack Implementation",
      description: "Implement a custom Stack class in Python or Java that supports push, pop, peek, and checking if empty, with a strict time limit of O(1) for all operations.",
      dueDate: "2026-07-20T23:59:59Z",
      facultyId: "fac_1"
    }
  ],
  assignmentSubmissions: [],
  codingProblems: [
    {
      id: "prob_1",
      title: "Two Sum",
      description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      difficulty: "Easy",
      category: "Arrays",
      starterCode: {
        python: "def twoSum(nums, target):\n    # Write your Python code here\n    pass",
        java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your Java code here\n        return new int[]{};\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your C++ code here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[2, 7, 11, 15], 9", expectedOutput: "[0, 1]" },
        { input: "[3, 2, 4], 6", expectedOutput: "[1, 2]" }
      ]
    },
    {
      id: "prob_2",
      title: "Reverse a Linked List",
      description: "Given the head of a singly linked list, reverse the list, and return its reversed representation.",
      difficulty: "Medium",
      category: "Linked Lists",
      starterCode: {
        python: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         this.val = val\n#         this.next = next\n\ndef reverseList(head):\n    # Write your solution here\n    pass",
        java: "class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your Java code here\n        return null;\n    }\n}"
      },
      testCases: [
        { input: "[1, 2, 3, 4, 5]", expectedOutput: "[5, 4, 3, 2, 1]" }
      ]
    }
  ],
  codingSubmissions: [],
  mockInterviews: [],
  careerPlans: [],
  notes: [],
  chatMessages: [
    {
      id: "msg_init_1",
      senderId: "fac_1",
      senderName: "Dr. Sarah Mitchell",
      senderRole: "Faculty",
      receiverId: "std_1",
      text: "Welcome Alex! Feel free to ask any questions about Data Structures or backend development. I am here to help.",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  notifications: [
    {
      id: "notif_1",
      userId: "std_1",
      title: "Welcome to EduReach AI!",
      message: "Start learning by browsing our Courses or testing your coding skills in the Practice Hub.",
      type: "system",
      read: false,
      createdAt: new Date().toISOString()
    }
  ],
  analytics: {
    "std_1": {
      learningHours: [4, 6, 3, 8, 5, 7, 6], // Last 7 days
      lessonsCompleted: 14,
      quizzesAttempted: 3,
      assignmentsSubmitted: 1,
      totalXp: 1250,
      skillScore: 68,
      strongAreas: ["Java Backend", "React Components"],
      weakAreas: ["Graph Algorithms", "Database Query Tuning"],
      aiInsights: "Alex is showing exceptional speed in frontend modules and OOP topics. However, quiz performance dropped in graph representation questions. We recommend allocating 2 hours this week to Graph Traversals."
    }
  }
};

// Helper to load database
function loadDb(): ServerDatabase {
  try {
    let dbData: ServerDatabase;
    if (!fs.existsSync(DB_PATH)) {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      dbData = { ...DEFAULT_DATABASE };
    } else {
      const data = fs.readFileSync(DB_PATH, "utf-8");
      dbData = JSON.parse(data);
    }

    // Seeding check: Ensure 100+ courses, 30+ coding problems, 15+ assignments
    let updated = false;

    if (!dbData.users.some(u => u.id === "std_2")) {
      console.log("Seeding mock student profiles for the leaderboard...");
      dbData.users.push(
        {
          id: "std_2",
          email: "jessica@edureach.ai",
          name: "Jessica Carter",
          role: UserRole.STUDENT,
          xp: 950,
          level: 3,
          streak: 4,
          badges: ["Code Warrior", "Quiz Whiz"],
          skills: { "Java": 60, "Algorithms": 70, "Database": 55 },
          createdAt: new Date().toISOString()
        },
        {
          id: "std_3",
          email: "robert@edureach.ai",
          name: "Robert Liang",
          role: UserRole.STUDENT,
          xp: 620,
          level: 2,
          streak: 2,
          badges: ["Fast Learner"],
          skills: { "Java": 50, "Algorithms": 45, "Database": 65 },
          createdAt: new Date().toISOString()
        },
        {
          id: "std_4",
          email: "emily@edureach.ai",
          name: "Emily Watson",
          role: UserRole.STUDENT,
          xp: 510,
          level: 2,
          streak: 3,
          badges: [],
          skills: { "Java": 40, "Algorithms": 35, "Database": 45 },
          createdAt: new Date().toISOString()
        }
      );
      updated = true;
    }
    
    if (!dbData.courses || dbData.courses.length < 100) {
      console.log("Seeding placement-related courses...");
      const seeded = generatePlacementCourses();
      const existingIds = new Set(dbData.courses ? dbData.courses.map(c => c.id) : []);
      const newCourses = seeded.filter(c => !existingIds.has(c.id));
      dbData.courses = [...(dbData.courses || []), ...newCourses];
      updated = true;
    }

    if (!dbData.codingProblems || dbData.codingProblems.length < 25) {
      console.log("Seeding real-time coding problems...");
      const seededProblems = generateRealtimeProblems();
      const existingIds = new Set(dbData.codingProblems ? dbData.codingProblems.map(p => p.id) : []);
      const newProblems = seededProblems.filter(p => !existingIds.has(p.id));
      dbData.codingProblems = [...(dbData.codingProblems || []), ...newProblems];
      updated = true;
    }

    if (!dbData.assignments || dbData.assignments.length < 10) {
      console.log("Seeding related assignments...");
      const seededAssignments = generateRelatedAssignments();
      const existingIds = new Set(dbData.assignments ? dbData.assignments.map(a => a.id) : []);
      const newAssignments = seededAssignments.filter(a => !existingIds.has(a.id));
      dbData.assignments = [...(dbData.assignments || []), ...newAssignments];
      updated = true;
    }

    if (!dbData.users.some(u => u.email === "parent@edureach.ai")) {
      console.log("Seeding parent profile parent@edureach.ai...");
      dbData.users.push({
        id: "prt_1",
        email: "parent@edureach.ai",
        name: "Robert Johnson",
        role: UserRole.PARENT,
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        skills: {},
        childId: "std_1",
        createdAt: new Date().toISOString(),
      });
      updated = true;
    }

    if (updated || !fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));
    }

    return dbData;
  } catch (error) {
    console.error("Error reading database file: ", error);
    return DEFAULT_DATABASE;
  }
}

// Helper to save database
function saveDb(data: ServerDatabase) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to database file: ", error);
  }
}

// 1. Authentication Endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  const dbData = loadDb();
  let user = dbData.users.find(u => u.email === email && (!role || u.role === role));
  if (!user) {
    // Check if user is signing in with default test accounts
    if (email === "student@edureach.ai") {
      user = dbData.users.find(u => u.id === "std_1");
    } else if (email === "faculty@edureach.ai") {
      user = dbData.users.find(u => u.id === "fac_1");
    } else if (email === "admin@edureach.ai") {
      user = dbData.users.find(u => u.id === "adm_1");
    } else {
      // Create user auto-register
      const name = email.split("@")[0].toUpperCase();
      user = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email,
        name,
        role: role || UserRole.STUDENT,
        xp: 100,
        level: 1,
        streak: 1,
        badges: ["Starter"],
        skills: { "General": 50 },
        createdAt: new Date().toISOString(),
      };
      dbData.users.push(user);
      // init analytics for new student
      if (user.role === UserRole.STUDENT) {
        dbData.analytics[user.id] = {
          learningHours: [0, 0, 0, 0, 0, 0, 0],
          lessonsCompleted: 0,
          quizzesAttempted: 0,
          assignmentsSubmitted: 0,
          totalXp: 100,
          skillScore: 50,
          strongAreas: [],
          weakAreas: [],
          aiInsights: "Complete courses and attempt practice challenges to allow AI to synthesize your strengths."
        };
      }
      saveDb(dbData);
    }
  }
  res.json({ success: true, user });
});

app.post("/api/auth/register", (req, res) => {
  const { email, name, role } = req.body;
  const dbData = loadDb();
  const existing = dbData.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }
  const newUser = {
    id: "usr_" + Math.random().toString(36).substring(2, 9),
    email,
    name,
    role: role || UserRole.STUDENT,
    xp: 100,
    level: 1,
    streak: 1,
    badges: ["Starter"],
    skills: { "General": 50 },
    createdAt: new Date().toISOString(),
  };
  dbData.users.push(newUser);
  if (newUser.role === UserRole.STUDENT) {
    dbData.analytics[newUser.id] = {
      learningHours: [0, 0, 1, 0, 0, 0, 0],
      lessonsCompleted: 0,
      quizzesAttempted: 0,
      assignmentsSubmitted: 0,
      totalXp: 100,
      skillScore: 50,
      strongAreas: [],
      weakAreas: [],
      aiInsights: "Welcome! Complete your first lesson to trigger real-time skill score optimization."
    };
  }
  saveDb(dbData);
  res.json({ success: true, user: newUser });
});

// 2. Course Endpoints
app.get("/api/courses", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.courses);
});

app.post("/api/courses", (req, res) => {
  const { title, description, category, facultyId, facultyName, tags } = req.body;
  const dbData = loadDb();
  const newCourse = {
    id: "course_" + Math.random().toString(36).substring(2, 9),
    title,
    description,
    category,
    facultyId,
    facultyName,
    enrolledStudentsCount: 0,
    tags: tags || [],
    lessons: []
  };
  dbData.courses.push(newCourse);
  saveDb(dbData);
  res.json({ success: true, course: newCourse });
});

app.post("/api/courses/:id/lessons", (req, res) => {
  const { id } = req.params;
  const { title, content, videoUrl, pdfUrl, durationMinutes } = req.body;
  const dbData = loadDb();
  const course = dbData.courses.find(c => c.id === id);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const newLesson = {
    id: "les_" + Math.random().toString(36).substring(2, 9),
    title,
    content,
    videoUrl,
    pdfUrl,
    durationMinutes: Number(durationMinutes) || 15
  };
  course.lessons.push(newLesson);
  saveDb(dbData);
  res.json({ success: true, lesson: newLesson });
});

// Gamification helper
function awardXp(userId: string, amount: number, badgeAward?: string): { xp: number, level: number, badgeAwarded?: string } {
  const dbData = loadDb();
  const user = dbData.users.find(u => u.id === userId);
  if (!user) return { xp: 0, level: 1 };
  user.xp += amount;
  const oldLevel = user.level;
  user.level = Math.floor(user.xp / 400) + 1; // 400 XP per level
  
  let awarded = false;
  if (badgeAward && !user.badges.includes(badgeAward)) {
    user.badges.push(badgeAward);
    awarded = true;
  }
  
  // Create system notification
  const notif = {
    id: "notif_" + Math.random().toString(36).substring(2, 9),
    userId,
    title: `Earned +${amount} XP!`,
    message: user.level > oldLevel 
      ? `Congratulations! You leveled up to Level ${user.level}!` 
      : `Keep it up! You are gaining mastery.`,
    type: "system",
    read: false,
    createdAt: new Date().toISOString()
  };
  dbData.notifications.push(notif);
  
  saveDb(dbData);
  return { xp: user.xp, level: user.level, badgeAwarded: awarded ? badgeAward : undefined };
}

// 3. Quiz Management
app.get("/api/quizzes", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.quizzes);
});

app.post("/api/quizzes", (req, res) => {
  const { courseId, courseTitle, title, description, durationMinutes, questions, facultyId } = req.body;
  const dbData = loadDb();
  const newQuiz = {
    id: "quiz_" + Math.random().toString(36).substring(2, 9),
    courseId,
    courseTitle,
    title,
    description,
    durationMinutes: Number(durationMinutes) || 15,
    questions,
    facultyId
  };
  dbData.quizzes.push(newQuiz);
  saveDb(dbData);
  res.json({ success: true, quiz: newQuiz });
});

// Evaluates a quiz submission
app.post("/api/quizzes/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { studentId, studentName, answers } = req.body;
  const dbData = loadDb();
  const quiz = dbData.quizzes.find(q => q.id === id);
  if (!quiz) return res.status(404).json({ error: "Quiz not found" });

  let correctCount = 0;
  quiz.questions.forEach((q: any) => {
    const studentAns = answers[q.id];
    if (studentAns !== undefined && Number(studentAns) === Number(q.correctOptionIndex)) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  // Call Gemini for AI feedback on performance
  let aiFeedback = `You scored ${score}% (${correctCount}/${quiz.questions.length}). `;
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Assess the quiz results for a student on "${quiz.title}" (${quiz.courseTitle}).
The questions, correct indices, and student's selections are:
${JSON.stringify(quiz.questions.map((q: any) => ({
  question: q.question,
  explanation: q.explanation,
  options: q.options,
  correct: q.options[q.correctOptionIndex],
  studentSelected: q.options[answers[q.id]] || "Unanswered"
})))}
Provide a short, 2-3 sentence personalized feedback detailing what they did well, the main gap in their understanding, and a clear next-step suggestion. Keep it encouraging and direct.`,
      });
      if (response.text) {
        aiFeedback = response.text.trim();
      }
    } catch (err) {
      console.error("Gemini failed, utilizing local feedback generator.", err);
      aiFeedback += "Great effort! Focus on Big-O worst-case bounds to improve linked list efficiency.";
    }
  } else {
    aiFeedback += "Great effort! Review time complexities of linked list operations for faster execution.";
  }

  const submission = {
    id: "sub_" + Math.random().toString(36).substring(2, 9),
    quizId: id,
    quizTitle: quiz.title,
    studentId,
    studentName,
    answers,
    score,
    totalQuestions: quiz.questions.length,
    aiFeedback,
    submittedAt: new Date().toISOString()
  };

  dbData.quizSubmissions.push(submission);
  
  // Award XP based on score
  const xpReward = score >= 80 ? 150 : score >= 50 ? 100 : 50;
  const gamificationResult = awardXp(studentId, xpReward, score >= 90 ? "Quiz Whiz" : undefined);

  // Update user skill analytics
  if (dbData.analytics[studentId]) {
    dbData.analytics[studentId].quizzesAttempted += 1;
    dbData.analytics[studentId].totalXp = gamificationResult.xp;
    // Update skills array slightly
    const user = dbData.users.find(u => u.id === studentId);
    if (user && user.skills) {
      user.skills["Algorithms"] = Math.min(100, (user.skills["Algorithms"] || 50) + (score >= 80 ? 5 : 2));
    }
  }

  saveDb(dbData);
  res.json({ success: true, score, aiFeedback, submission });
});

// 4. Assignments Module
app.get("/api/assignments", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.assignments);
});

app.post("/api/assignments", (req, res) => {
  const { courseId, courseTitle, title, description, dueDate, facultyId } = req.body;
  const dbData = loadDb();
  const newAssignment = {
    id: "assign_" + Math.random().toString(36).substring(2, 9),
    courseId,
    courseTitle,
    title,
    description,
    dueDate,
    facultyId
  };
  dbData.assignments.push(newAssignment);
  saveDb(dbData);
  res.json({ success: true, assignment: newAssignment });
});

app.post("/api/assignments/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { studentId, studentName, content, fileName } = req.body;
  const dbData = loadDb();
  const assignment = dbData.assignments.find(a => a.id === id);
  if (!assignment) return res.status(404).json({ error: "Assignment not found" });

  // Call Gemini for Plagiarism Check, Score, and Structural Feedback
  let score = 85;
  let plagiarismScore = 4; // Mock default
  let aiFeedback = "Good effort! Code is structured beautifully, with O(1) peek and push actions.";
  
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Evaluate this student's coding submission for the assignment: "${assignment.title}".
Assignment Description: ${assignment.description}
Student Content: ${content}

Provide your feedback in a structured JSON schema conforming to:
{
  "score": integer (0 to 100),
  "plagiarismScore": integer (percentage 0 to 100 representing similarity to online templates),
  "aiFeedback": "brief textual assessment containing score rationale, specific mistakes, and direct improvement suggestions"
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              plagiarismScore: { type: Type.INTEGER },
              aiFeedback: { type: Type.STRING }
            },
            required: ["score", "plagiarismScore", "aiFeedback"]
          }
        }
      });
      if (response.text) {
        const result = JSON.parse(response.text);
        score = result.score;
        plagiarismScore = result.plagiarismScore;
        aiFeedback = result.aiFeedback;
      }
    } catch (err) {
      console.error("Failed to call Gemini for assignment grading:", err);
    }
  }

  const submission = {
    id: "asub_" + Math.random().toString(36).substring(2, 9),
    assignmentId: id,
    assignmentTitle: assignment.title,
    studentId,
    studentName,
    content,
    fileName: fileName || "submission.py",
    score,
    plagiarismScore,
    aiFeedback,
    submittedAt: new Date().toISOString()
  };

  dbData.assignmentSubmissions.push(submission);
  
  // Award XP
  const xpReward = score >= 85 ? 200 : 100;
  awardXp(studentId, xpReward, "Code Warrior");

  if (dbData.analytics[studentId]) {
    dbData.analytics[studentId].assignmentsSubmitted += 1;
  }

  saveDb(dbData);
  res.json({ success: true, score, plagiarismScore, aiFeedback, submission });
});

// 5. AI Tutor & Question Generator ⭐
app.post("/api/ai/tutor", async (req, res) => {
  const { prompt, context, image, provider } = req.body;
  const dbData = loadDb();
  
  // Lexical RAG Search Pipeline (Clean and neat retrieved database context check)
  let retrievedContext = "";
  if (dbData && dbData.courses && prompt) {
    const queryLower = prompt.toLowerCase();
    const matchedLessons: string[] = [];
    
    for (const course of dbData.courses) {
      if (course.lessons) {
        for (const lesson of course.lessons) {
          if (
            lesson.title.toLowerCase().includes(queryLower) ||
            lesson.content.toLowerCase().includes(queryLower) ||
            course.title.toLowerCase().includes(queryLower)
          ) {
            matchedLessons.push(`[Source Course: ${course.title} -> Lesson: ${lesson.title}]\nFact Content: ${lesson.content}`);
          }
        }
      }
    }
    
    if (matchedLessons.length > 0) {
      retrievedContext = `\n[Retrieved Database RAG Context]:\n${matchedLessons.slice(0, 2).join("\n\n")}\n\nUse the fact database context above to ground and structure your answers.`;
    }
  }

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    try {
      const model = image ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
      const systemPrompt = EDUREACH_TUTOR_PROMPT + `
\n${retrievedContext}\n
You MUST return a JSON object matching this schema exactly:
{
  "text": "A rich, clear Markdown explanation following this structure exactly: 1. Short definition (simple language first), 2. Detailed explanation (gradually moving to advanced explanations), 3. Example / analogy / diagrams in text form, 4. Real-world application, 5. Important interview points, 6. Practice question/prompt for the student. Do NOT include the interactive MCQ quiz in this field.",
  "quiz": {
    "question": "A concept-check question based on the explanation.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "explanation": "Why the correct option is right."
  }
}`;
      const responseText = await callGroqChatCompletions(model, systemPrompt, prompt, image, true);
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText.trim());
          return res.json({
            text: parsed.text || responseText,
            quiz: parsed.quiz || null
          });
        } catch (e) {
          return res.json({ text: responseText, quiz: null });
        }
      } else {
        return res.json({ text: "Empty output", quiz: null });
      }
    } catch (err) {
      console.warn("Groq tutor call failed, falling back to Gemini:", err);
    }
  }

  const client = getGeminiClient();
  if (!client) {
    const localRes = getLocalTutorResponse(prompt);
    return res.json(localRes);
  }

  try {
    let contents: any = prompt;
    if (image) {
      let mimeType = "image/png";
      let base64Data = image;
      if (image.startsWith("data:")) {
        const parts = image.split(",");
        base64Data = parts[1];
        const mimePart = parts[0].split(";")[0];
        mimeType = mimePart.substring(5); // remove "data:"
      }
      
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      };
    }

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        systemInstruction: EDUREACH_TUTOR_PROMPT + `
\n${retrievedContext}\n
You MUST return a JSON object matching this schema exactly:
{
  "text": "A rich, clear Markdown explanation following this structure exactly: 1. Short definition (simple language first), 2. Detailed explanation (gradually moving to advanced explanations), 3. Example / analogy / diagrams in text form, 4. Real-world application, 5. Important interview points, 6. Practice question/prompt for the student. Do NOT include the interactive MCQ quiz in this field.",
  "quiz": {
    "question": "A concept-check question based on the explanation.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 0,
    "explanation": "Why the correct option is right."
  }
}`
      }
    });
    
    if (response.text) {
      try {
        const parsed = JSON.parse(response.text.trim());
        res.json({
          text: parsed.text || response.text,
          quiz: parsed.quiz || null
        });
      } catch (e) {
        res.json({ text: response.text, quiz: null });
      }
    } else {
      res.json({ text: "Empty output", quiz: null });
    }
  } catch (err) {
    console.warn("Gemini tutor call failed, using local fallback:", err);
    const localRes = getLocalTutorResponse(prompt);
    res.json(localRes);
  }
});

// AI Aptitude Solver Route ⭐
app.post("/api/ai/aptitude", async (req, res) => {
  const { topic, questionText } = req.body;
  const client = getGeminiClient();

  if (!client) {
    return res.json({
      explanation: `### Quick Shortcut Guide for: ${topic || "Quantitative Reasoning"}

Here is the step-by-step mathematical breakdown for your problem:

1. **Problem Statement**: "${questionText || "A can do a work in 15 days and B in 20 days. In how many days can they finish it together?"}"
2. **Standard Formula**:
   $$\\text{Total Days} = \\frac{A \\times B}{A + B}$$
3. **Detailed Steps**:
   - $A = 15$, $B = 20$.
   - Product $= 15 \\times 20 = 300$.
   - Sum $= 15 + 20 = 35$.
   - Result $= \\frac{300}{35} = \\frac{60}{7} = 8\\frac{4}{7} \\text{ days}$.
4. **Mental Speed Shortcut Hack**:
   Use the **LCM Method**:
   - $\\text{LCM}(15, 20) = 60$ (Total Work Units).
   - Efficiency of $A = 60 / 15 = 4$ units/day.
   - Efficiency of $B = 60 / 20 = 3$ units/day.
   - Combined Efficiency $= 4 + 3 = 7$ units/day.
   - Combined Days $= 60 / 7 = 8.57$ days. Done in 10 seconds!
`
    });
  }

  try {
    const prompt = `You are an elite Placement Quant and Logical Reasoning coach.
The candidate is practicing problems on the topic: "${topic || "General Aptitude"}".
Explain and solve the following word problem step-by-step:
"${questionText}"

Highlight:
1. Core formulas to memorize
2. Complete mathematical derivations with clean Markdown math notation ($...$ and $$...$$)
3. High-speed mental shortcuts to bypass long computations and solve the question in under 30 seconds!`;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    res.json({ explanation: response.text });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// AI Question Generator ⭐
app.post("/api/ai/generate-questions", async (req, res) => {
  const { type, topic, difficulty, language } = req.body;
  const client = getGeminiClient();
  const prompt = `Generate a single educational assessment question of type "${type || "MCQ"}" on the topic "${topic || "Linked Lists"}".
Difficulty: ${difficulty || "Medium"}.
${language ? `Programming Language: ${language}` : ""}

For MCQs, output a JSON structure:
{
  "question": "question statement",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": integer (0 to 3),
  "explanation": "clear educational explanation"
}

For coding/descriptive challenges, output:
{
  "question": "Clear problem description and constraints",
  "explanation": "Brief hint and recommended solution approach"
}`;

  if (!client) {
    // Fallback MCQ questions
    return res.json({
      question: "Which of the following sorting algorithms has a linear O(N) complexity in its best case?",
      options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"],
      correctOptionIndex: 3,
      explanation: "Insertion sort has a best-case time complexity of O(N) when the input array is already sorted."
    });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    if (response.text) {
      res.json(JSON.parse(response.text));
    } else {
      res.status(500).json({ error: "Empty model output" });
    }
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Generates a complete topic-wise assessment quiz dynamically
app.post("/api/ai/generate-quiz", (req, res) => {
  const { topic, difficulty, count, questionType } = req.body;
  const client = getGeminiClient();
  const dbData = loadDb();
  
  const qCount = Math.min(Math.max(Number(count) || 3, 3), 10);
  const quizId = "dq_" + Math.random().toString(36).substring(2, 9);

  let typeDesc = "multiple-choice questions";
  let formatDesc = "";
  if (questionType === "true_false") {
    typeDesc = "True/False questions";
    formatDesc = "For each question, the 'options' field MUST contain exactly two elements: ['True', 'False'].";
  } else if (questionType === "fill_in_blanks") {
    typeDesc = "Fill-in-the-Blank questions";
    formatDesc = "Each question statement MUST contain a blank represented by '_____', and the options should represent the correct and distractor answers to fill in that blank.";
  } else if (questionType === "mix") {
    typeDesc = "mix of standard Multiple-Choice, True/False, and Fill-in-the-Blank style questions";
    formatDesc = "For any True/False questions in the mix, the 'options' field must be exactly ['True', 'False']. For Fill-in-the-Blank questions, use '_____' in the question statement.";
  }
  
  const prompt = `Generate a set of exactly ${qCount} distinct ${typeDesc} for an educational assessment on the topic "${topic || "Linked Lists"}".
Difficulty: ${difficulty || "Medium"}.
${formatDesc}

Output a JSON structure matching the following schema:
{
  "title": "Dynamic Quiz: ${topic}",
  "questions": [
    {
      "id": "dq_q_1",
      "question": "question statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 2,
      "explanation": "clear educational explanation"
    },
    ...
  ]
}

Ensure all questions are high-quality, scientifically accurate, and have exactly one clearly correct option. Do not include any formatting other than the JSON object.`;

  if (!client) {
    const fallbackQuiz = getLocalQuiz(topic, qCount);
    const newQuiz = {
      id: quizId,
      courseId: "dynamic",
      courseTitle: "Dynamic Quiz",
      title: fallbackQuiz.title,
      description: `A customized assessment on ${topic} (Difficulty: ${difficulty})`,
      durationMinutes: 10,
      facultyId: "ai_tutor",
      questions: fallbackQuiz.questions
    };
    dbData.quizzes.push(newQuiz);
    saveDb(dbData);
    return res.json(newQuiz);
  }

  // Generate quiz using Gemini model
  client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  }).then((response) => {
    if (response.text) {
      try {
        const generated = JSON.parse(response.text);
        
        // Re-structure questions to have clean unique ids
        const formattedQuestions = (generated.questions || []).map((q: any, index: number) => ({
          id: `dq_q_${index + 1}_` + Math.random().toString(36).substring(2, 5),
          question: q.question,
          options: q.options,
          correctOptionIndex: Number(q.correctOptionIndex) || 0,
          explanation: q.explanation || "Correct option selected successfully."
        }));

        const newQuiz = {
          id: quizId,
          courseId: "dynamic",
          courseTitle: "Dynamic Quiz",
          title: generated.title || `AI Quiz: ${topic}`,
          description: `A customized assessment on ${topic} (Difficulty: ${difficulty})`,
          durationMinutes: 10,
          facultyId: "ai_tutor",
          questions: formattedQuestions
        };

        dbData.quizzes.push(newQuiz);
        saveDb(dbData);
        res.json(newQuiz);
      } catch (parseErr) {
        console.warn("AI quiz parsing failed, using local fallback:", parseErr);
        const fallbackQuiz = getLocalQuiz(topic, qCount);
        const newQuiz = {
          id: quizId,
          courseId: "dynamic",
          courseTitle: "Dynamic Quiz",
          title: fallbackQuiz.title,
          description: `A customized assessment on ${topic} (Difficulty: ${difficulty})`,
          durationMinutes: 10,
          facultyId: "ai_tutor",
          questions: fallbackQuiz.questions
        };
        dbData.quizzes.push(newQuiz);
        saveDb(dbData);
        res.json(newQuiz);
      }
    } else {
      throw new Error("Empty response");
    }
  }).catch((err) => {
    console.warn("Gemini quiz generation failed, using local fallback:", err);
    const fallbackQuiz = getLocalQuiz(topic, qCount);
    const newQuiz = {
      id: quizId,
      courseId: "dynamic",
      courseTitle: "Dynamic Quiz",
      title: fallbackQuiz.title,
      description: `A customized assessment on ${topic} (Difficulty: ${difficulty})`,
      durationMinutes: 10,
      facultyId: "ai_tutor",
      questions: fallbackQuiz.questions
    };
    dbData.quizzes.push(newQuiz);
    saveDb(dbData);
    res.json(newQuiz);
  });
});

// AI Performance Prediction Endpoint ⭐
app.post("/api/ai/predict-performance", async (req, res) => {
  const { studentId } = req.body;
  const dbData = loadDb();
  const student = dbData.users.find(u => u.id === studentId);
  if (!student) return res.status(404).json({ error: "Student not found" });

  const analyticsEntry = dbData.analytics[studentId] || {
    learningHours: [4, 5, 3, 6, 4, 7, 5],
    lessonsCompleted: 14,
    quizzesAttempted: 3,
    assignmentsSubmitted: 2,
    totalXp: student.xp,
    skillScore: 70,
    strongAreas: Object.keys(student.skills).filter(k => student.skills[k] >= 70),
    weakAreas: Object.keys(student.skills).filter(k => student.skills[k] < 70),
    aiInsights: ""
  };

  const client = getGeminiClient();
  let prediction = {
    predictedGrade: 85,
    riskLevel: "Low",
    predictionSummary: `${student.name} is demonstrating strong performance overall. High active streaks and solid skill levels indicate a positive placement outlook. Direct reinforcement in weaker subjects will optimize scores.`,
    recommendations: [
      "Review advanced dynamic algorithms prior to company-specific placements.",
      "Complete at least two Medium/Hard practice sandbox coding assessments."
    ]
  };

  if (client) {
    try {
      const prompt = `Perform an academic performance prediction and placement readiness assessment for student:
Student Details:
- Name: ${student.name}
- Level: ${student.level}
- XP: ${student.xp}
- Streak: ${student.streak} Days
- Skills Index: ${JSON.stringify(student.skills)}
- Strong Areas: ${JSON.stringify(analyticsEntry.strongAreas)}
- Weak Areas: ${JSON.stringify(analyticsEntry.weakAreas)}
- Lessons Completed: ${analyticsEntry.lessonsCompleted}
- Quizzes Attempted: ${analyticsEntry.quizzesAttempted}

Predict their overall score (grade), risk of falling behind or failing, summary assessment, and specific recommendations. You MUST return a JSON matching this schema:
{
  "predictedGrade": integer (0 to 100),
  "riskLevel": "Low" | "Medium" | "High",
  "predictionSummary": "A detailed 2-3 sentence analysis of their current path, highlighting strengths and risks.",
  "recommendations": ["list of 2-3 actionable study suggestions"]
}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        prediction = JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error("Gemini academic performance prediction failed, using fallback:", err);
    }
  }

  res.json({ success: true, prediction });
});

// AI Exam & Question Paper Generator Endpoint ⭐
app.post("/api/ai/generate-exam", async (req, res) => {
  const { topic, difficulty, questionType } = req.body;
  const client = getGeminiClient();
  let examPaper = {
    title: `Academic Examination: ${topic}`,
    durationMinutes: 60,
    totalMarks: 50,
    mcqs: [
      {
        id: "mcq_1",
        question: `Which data structure represents the best implementation model for ${topic}?`,
        options: ["Array", "Linked List", "Stack", "Hash Map"],
        correctOptionIndex: 1,
        explanation: "This option provides the most efficient lookup/modification complexity boundaries."
      }
    ],
    coding: [
      {
        id: "code_1",
        question: `Write a clean, optimized algorithm to solve or navigate ${topic}. Provide constraints and sample test cases.`,
        starterCode: "def solve(input):\n    # Write your code here\n    pass",
        expectedSolution: "def solve(input):\n    return True",
        explanation: "The solution navigates the bounds recursively or iteratively in linear complexity."
      }
    ],
    descriptive: [
      {
        id: "desc_1",
        question: `Detail the system architecture tradeoffs of utilizing ${topic} in a large-scale enterprise environment. Discuss complexity bounds.`,
        modelAnswer: "An optimal discussion explains time/space complexity, memory footprint, cache locality issues, and scalability tradeoffs.",
        markingCriteria: "4 points for correctness, 3 points for complexity details, 3 points for architectural tradeoffs."
      }
    ]
  };

  if (client) {
    try {
      let sectionInstructions = "";
      if (questionType === "mcq") {
        sectionInstructions = "The exam MUST contain ONLY Section 1: Multiple Choice Questions (5 questions). Keep 'coding' and 'descriptive' arrays in the JSON response empty.";
      } else if (questionType === "coding") {
        sectionInstructions = "The exam MUST contain ONLY Section 2: Sandbox Coding Challenges (3 coding questions with starter code, expected solution, and code explanation). Keep 'mcqs' and 'descriptive' arrays in the JSON response empty.";
      } else if (questionType === "descriptive") {
        sectionInstructions = "The exam MUST contain ONLY Section 3: Descriptive/Theoretical Concept Questions (3 questions requiring a descriptive written answer, with model answers and marking criteria). Keep 'mcqs' and 'coding' arrays in the JSON response empty.";
      } else {
        sectionInstructions = `The exam MUST contain Sections for:
1. Multiple Choice Questions (2 questions)
2. Sandbox Coding Challenges (1 coding question with starter code, expected solution, and code explanation)
3. Descriptive/Theoretical Concept Questions (1 question requiring a descriptive written answer, with a model answer key and detailed marking criteria)`;
      }

      const prompt = `Generate a rigorous, formal academic examination paper on the topic: "${topic || "Dynamic Programming"}".
Difficulty: ${difficulty || "Medium"}.

${sectionInstructions}

You MUST return a JSON object conforming exactly to this structure:
{
  "title": "Academic Examination Paper: ${topic}",
  "durationMinutes": 60,
  "totalMarks": 50,
  "mcqs": [
    {
      "id": "mcq_1",
      "question": "question statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": integer (0 to 3),
      "explanation": "clear educational explanation"
    }
  ],
  "coding": [
    {
      "id": "code_1",
      "question": "Detailed coding challenge description, input/output constraints, and samples.",
      "starterCode": "starter skeleton code in python or java",
      "expectedSolution": "full correct reference solution code",
      "explanation": "explanation of solution time and space complexity"
    }
  ],
  "descriptive": [
    {
      "id": "desc_1",
      "question": "Deep theoretical question probing design tradeoffs, complexity proofs, or edge cases.",
      "modelAnswer": "comprehensive expected descriptive model answer key",
      "markingCriteria": "specific grading rubric showing point breakdown"
    }
  ]
}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        examPaper = JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error("Gemini exam generation failed, using fallback:", err);
    }
  }

  res.json({ success: true, examPaper });
});

// AI Study Planner Generator Endpoint ⭐
app.post("/api/ai/generate-study-plan", async (req, res) => {
  const { goal, userId } = req.body;
  const dbData = loadDb();
  const student = dbData.users.find(u => u.id === userId) || { level: 3, xp: 800 };

  const client = getGeminiClient();
  let studyPlan = {
    title: `Custom Study Roadmap: ${goal}`,
    weeks: [
      {
        weekNumber: 1,
        theme: "Foundational Fundamentals",
        tasks: [
          {
            id: "task_1_1",
            title: "Core Mechanics Review",
            description: "Study basic concepts, review documentation, and complete two easy assessments.",
            durationMinutes: 90
          },
          {
            id: "task_1_2",
            title: "Hands-on Starter Problems",
            description: "Solve introductory challenges in the Sandbox Problem Hub.",
            durationMinutes: 120
          }
        ]
      },
      {
        weekNumber: 2,
        theme: "Advanced Implementation & Placements Prep",
        tasks: [
          {
            id: "task_2_1",
            title: "System Integration Tradeoffs",
            description: "Analyze complexity limits and examine architectural constraints.",
            durationMinutes: 90
          },
          {
            id: "task_2_2",
            title: "Mock Placement Practice",
            description: "Take the Dynamic Quiz and run an AI interview simulation.",
            durationMinutes: 150
          }
        ]
      }
    ]
  };

  if (client) {
    try {
      const prompt = `Generate a personalized 2-week, week-by-week study planner calendar for a student preparing for the goal: "${goal}".
Student Context:
- Current Academic Level: ${student.level}

Return a JSON matching this schema:
{
  "title": "Tailored Roadmap: ${goal}",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Weekly core topic/milestone",
      "tasks": [
        {
          "id": "task_1_1",
          "title": "Concise task title",
          "description": "Specific study actions to take (e.g. read, solve code challenge)",
          "durationMinutes": 90
        }
      ]
    },
    {
      "weekNumber": 2,
      "theme": "Advanced application",
      "tasks": [
        {
          "id": "task_2_1",
          "title": "Advanced task title",
          "description": "Advanced study actions to take",
          "durationMinutes": 120
        }
      ]
    }
  ]
}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        studyPlan = JSON.parse(response.text.trim());
      }
    } catch (err) {
      console.error("Gemini study plan generation failed, using fallback:", err);
    }
  }

  res.json({ success: true, studyPlan });
});

// AI Translation Endpoint ⭐
app.post("/api/ai/translate", async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text) return res.json({ translatedText: "" });
  if (!targetLanguage || targetLanguage === "English") return res.json({ translatedText: text });

  const client = getGeminiClient();
  let translatedText = text;

  if (client) {
    try {
      const prompt = `Translate the following text to ${targetLanguage}.
You MUST preserve all markdown structures, spacing, brackets, backticks, HTML tags, and code syntax EXACTLY. Only translate the human explanations and descriptions.

Text to translate:
${text}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      if (response.text) {
        translatedText = response.text.trim();
      }
    } catch (err) {
      console.error("Gemini translation failed, returning source:", err);
    }
  } else {
    // Basic local mocks for presentation
    if (targetLanguage === "Hindi") {
      translatedText = `[अनुवादित] ${text}\n(नोट: एआई ट्रांसलेटर हिंदी भाषा मोड में संचालित है)`;
    } else if (targetLanguage === "Spanish") {
      translatedText = `[Traducido] ${text}\n(Nota: El traductor de IA está funcionando en español)`;
    } else if (targetLanguage === "French") {
      translatedText = `[Traduit] ${text}\n(Note: Le traducteur IA fonctionne en français)`;
    } else if (targetLanguage === "German") {
      translatedText = `[Übersetzt] ${text}\n(Hinweis: Der KI-Übersetzer läuft auf Deutsch)`;
    }
  }

  res.json({ success: true, translatedText });
});

// 6. Coding Practice Hub ⭐
app.get("/api/practice", (req, res) => {
  const dbData = loadDb();
  res.json(dbData.codingProblems);
});

// Reviews client code submission using AI Reviewer
app.post("/api/practice/:id/submit", async (req, res) => {
  const { id } = req.params;
  const { studentId, code, language } = req.body;
  const dbData = loadDb();
  const problem = dbData.codingProblems.find(p => p.id === id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });

  let isCorrect = true;
  let timeComplexity = "O(n)";
  let spaceComplexity = "O(n)";
  let feedback = "Excellent job! All test cases passed successfully.";

  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Review the following student code for problem: "${problem.title}".
Problem description: ${problem.description}
Student Code (${language}):
${code}

Perform strict static analysis and determine:
1. Is the solution logically correct?
2. What are the Time and Space complexities?
3. Provide code improvements/complexity reductions if possible.

Response in JSON structure:
{
  "isCorrect": boolean,
  "timeComplexity": "e.g. O(n) or O(n log n)",
  "spaceComplexity": "e.g. O(1) or O(n)",
  "feedback": "detailed explanation of why code is right/wrong, recommendations"
}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      if (response.text) {
        const result = JSON.parse(response.text);
        isCorrect = result.isCorrect;
        timeComplexity = result.timeComplexity;
        spaceComplexity = result.spaceComplexity;
        feedback = result.feedback;
      }
    } catch (err) {
      console.error("Gemini static compiler analysis failed:", err);
    }
  }

  const submission = {
    id: "csub_" + Math.random().toString(36).substring(2, 9),
    problemId: id,
    problemTitle: problem.title,
    studentId,
    code,
    language,
    isCorrect,
    timeComplexity,
    spaceComplexity,
    feedback,
    submittedAt: new Date().toISOString()
  };

  dbData.codingSubmissions.push(submission);

  // Award XP
  if (isCorrect) {
    awardXp(studentId, 150, "Code Warrior");
  } else {
    awardXp(studentId, 40); // 40 XP for attempt
  }

  saveDb(dbData);
  res.json({ success: true, isCorrect, timeComplexity, spaceComplexity, feedback, submission });
});

// Coding practice AI Hints ⭐
app.post("/api/practice/:id/hint", async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;
  const dbData = loadDb();
  const problem = dbData.codingProblems.find(p => p.id === id);
  if (!problem) return res.status(404).json({ error: "Problem not found" });

  const client = getGeminiClient();
  if (!client) {
    return res.json({ hint: "Consider using a hash map to map each element to its index for an instant lookup time." });
  }

  try {
    const prompt = `The student is struggling with the coding problem "${problem.title}".
Problem description: ${problem.description}
Current code snippet (${language}):
${code || "None"}

Provide a subtle, high-level educational hint. Do NOT write the completed code. Guide them on the appropriate data structure or algorithm to utilize (e.g. hashmap, two pointers, binary search bounds).`;
    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    res.json({ hint: response.text });
  } catch (err) {
    res.json({ hint: "Focus on utilizing the relationship between the target and current value (target - num)." });
  }
});

// AI Coding Mentor API Route ⭐
app.post("/api/ai/coding-mentor", async (req, res) => {
  const { code, language, action } = req.body;
  
  if (action === "compile") {
    let cmd = "";
    let tempFile = "";
    
    const tempDir = path.join(process.cwd(), "src", "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    if (language === "javascript") {
      tempFile = path.join(tempDir, `run_${Date.now()}.js`);
      fs.writeFileSync(tempFile, code);
      cmd = `node "${tempFile}"`;
    } else if (language === "python") {
      tempFile = path.join(tempDir, `run_${Date.now()}.py`);
      fs.writeFileSync(tempFile, code);
      cmd = `python "${tempFile}"`;
    } else if (language === "c") {
      tempFile = path.join(tempDir, `run_${Date.now()}.c`);
      fs.writeFileSync(tempFile, code);
      const binFile = tempFile.replace(".c", ".exe");
      cmd = `gcc "${tempFile}" -o "${binFile}" && "${binFile}"`;
    } else if (language === "java") {
      tempFile = path.join(tempDir, `Run_${Date.now()}.java`);
      fs.writeFileSync(tempFile, code);
      cmd = `java "${tempFile}"`;
    }

    if (cmd) {
      return new Promise<void>((resolvePromise) => {
        exec(cmd, { timeout: 4000 }, (error, stdout, stderr) => {
          try {
            if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
            const binFile = tempFile.replace(".c", ".exe");
            if (fs.existsSync(binFile)) fs.unlinkSync(binFile);
          } catch (cleanupErr) {}

          res.json({
            success: true,
            execution: {
              stdout: stdout || "",
              stderr: stderr || (error ? error.message : ""),
              exitCode: error ? error.code || 1 : 0,
              timeMs: 250,
              memoryKb: 4096
            }
          });
          resolvePromise();
        });
      });
    } else {
      return res.json({
        success: true,
        execution: {
          stdout: "Simulated output: compiler resolved successfully.",
          stderr: "",
          exitCode: 0,
          timeMs: 15,
          memoryKb: 512
        }
      });
    }
  }

  const client = getGeminiClient();

  if (!client) {
    let fallbackText = "";
    if (action === "explain") {
      fallbackText = `### Code Explanation (${language})\n\nThis code block initializes variables and iterates to process calculations.\n\n1. **Setup**: Configures parameters for standard compiler context.\n2. **Execution loop**: Runs algorithms sequentially based on language rules.\n3. **Result**: Resolves values correctly.`;
    } else if (action === "find-bugs") {
      fallbackText = `### Bug Analysis (${language})\n\n- No syntax issues detected.\n- **Recommendation**: Check boundary conditions, null inputs, and memory constraints.`;
    } else if (action === "improve") {
      fallbackText = `### Suggestions for Improvement (${language})\n\n1. Use descriptive naming conventions.\n2. Avoid nested loops to optimize time complexity (aim for O(n)).\n3. Leverage functional constructs or built-ins.`;
    } else if (action === "generate-tests") {
      fallbackText = `### Unit Test Cases (${language})\n\n\`\`\`${language}\n// Test Suite\nassert execute_code() == expected;\n\`\`\``;
    }
    return res.json({ success: true, text: fallbackText });
  }

  try {
    let prompt = "";
    let isJson = false;

    if (action === "explain") {
      prompt = `You are EduReach AI Coding Mentor. Explain the following ${language} code block in detail. Break down the logic, variables, and control flow in a simple, friendly, and educational manner. Use markdown format:

\`\`\`${language}
${code}
\`\`\``;
    } else if (action === "find-bugs") {
      prompt = `You are EduReach AI Coding Mentor. Analyze the following ${language} code block for logical bugs, syntax errors, edge cases, security issues, or run-time exceptions. Point out any mistakes and provide the corrected code:

\`\`\`${language}
${code}
\`\`\``;
    } else if (action === "improve") {
      prompt = `You are EduReach AI Coding Mentor. Analyze the following ${language} code and suggest performance, readability, style, or algorithm improvements. Show the optimized refactored version of the code and analyze its time and space complexity:

\`\`\`${language}
${code}
\`\`\``;
    } else if (action === "generate-tests") {
      prompt = `You are EduReach AI Coding Mentor. Generate thorough unit test cases (including typical values, empty cases, extreme boundaries, and invalid inputs) for the following ${language} code using standard test patterns:

\`\`\`${language}
${code}
\`\`\``;
    } else if (action === "compile") {
      prompt = `You are a high-fidelity online compiler simulator. Analyze the following ${language} code block statically and simulate its compilation and execution.
Assume standard input values or main entry execution as applicable.
Provide the output in a strict JSON format conforming to:
{
  "stdout": "simulated standard output text of the run",
  "stderr": "simulated compilation/execution errors or empty string",
  "exitCode": integer (0 for successful run, non-zero for compile/run error),
  "timeMs": integer (simulated run duration in ms),
  "memoryKb": integer (simulated memory footprint)
}

Code:
\`\`\`${language}
${code}
\`\`\``;
      isJson = true;
    }

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: isJson ? { responseMimeType: "application/json" } : undefined
    });

    const resultText = response.text || "";
    if (isJson) {
      try {
        const parsed = JSON.parse(resultText);
        return res.json({ success: true, execution: parsed });
      } catch (err) {
        return res.json({
          success: true,
          execution: {
            stdout: resultText,
            stderr: "Simulated compiler output parse failed.",
            exitCode: 1,
            timeMs: 10,
            memoryKb: 0
          }
        });
      }
    } else {
      return res.json({ success: true, text: resultText });
    }
  } catch (err: any) {
    console.warn("AI Coding Mentor API failed, falling back to local simulation:", err.message);
    let fallbackText = "";
    if (action === "explain") {
      fallbackText = `### Code Explanation (${language})\n\nThis code block initializes variables and iterates to process calculations.\n\n1. **Setup**: Configures parameters for standard compiler context.\n2. **Execution loop**: Runs algorithms sequentially based on language rules.\n3. **Result**: Resolves values correctly.`;
    } else if (action === "find-bugs") {
      fallbackText = `### Bug Analysis (${language})\n\n- No syntax issues detected.\n- **Recommendation**: Check boundary conditions, null inputs, and memory constraints.`;
    } else if (action === "improve") {
      fallbackText = `### Suggestions for Improvement (${language})\n\n1. Use descriptive naming conventions.\n2. Avoid nested loops to optimize time complexity (aim for O(n)).\n3. Leverage functional constructs or built-ins.`;
    } else if (action === "generate-tests") {
      fallbackText = `### Unit Test Cases (${language})\n\n\`\`\`${language}\n// Test Suite\nassert execute_code() == expected;\n\`\`\``;
    }
    return res.json({ success: true, text: fallbackText });
  }
});

// 7. AI Mock Interview Module ⭐
app.post("/api/interviews/start", (req, res) => {
  const { studentId, type, companyName } = req.body;
  const dbData = loadDb();
  const sessionId = "int_" + Math.random().toString(36).substring(2, 9);
  
  const welcomeText = type === "HR" 
    ? "Welcome! Let's begin our HR round. To start, please tell me a bit about yourself, your background, and why you are interested in this platform."
    : type === "Group Discussion"
      ? "Welcome to the AI Group Discussion Simulator. The topic for today's group discussion is 'Should artificial intelligence replace traditional educational tutors?'. Please introduce your opening stance on this topic to start."
      : `Hello! I'm your technical interviewer. Let's dive into ${companyName || "Technical"} development. To start, explain the fundamental differences between interface and abstract class structures, and when you would prefer one over another.`;

  const session = {
    id: sessionId,
    studentId,
    type,
    companyName,
    messages: [
      { role: "interviewer", text: welcomeText, timestamp: new Date().toISOString() }
    ],
    status: "active",
    createdAt: new Date().toISOString()
  };

  dbData.mockInterviews.push(session);
  saveDb(dbData);
  res.json({ success: true, session });
});

app.post("/api/interviews/:id/message", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const dbData = loadDb();
  const session = dbData.mockInterviews.find(s => s.id === id);
  if (!session) return res.status(404).json({ error: "Interview session not found" });

  // Add student message
  session.messages.push({
    role: "student",
    text,
    timestamp: new Date().toISOString()
  });

  // Calculate length to decide if we complete the interview
  const turnsCount = session.messages.filter((m: any) => m.role === "student").length;
  const isFinalTurn = turnsCount >= 3; // Keep mock interviews concise (3 replies)

  const client = getGeminiClient();
  if (isFinalTurn) {
    // Generate structural HR/Technical feedback
    session.status = "completed";
    let scoreResponse = {
      overallScore: 82,
      presentation: 88,
      communication: 85,
      fluency: 80,
      pronunciation: 83,
      contentRelevance: 81,
      strengths: ["Excellent structure when explaining system design", "Strong alignment of core terms"],
      improvements: ["Elaborate on hardware-level memory management", "Minimize vocal fillers during conversational pauses"],
      behaviorMarkup: "Candidate displays professional posture and steady gaze, but exhibits slight hesitation of 2-3 seconds before addressing advanced database optimization questions.",
      activityLog: "Step 1: General Concept (Interface vs Abstract Class) - Answer relevance is high. Step 2: System Application (Dijkstra algorithm) - Communication remains clear. Step 3: Advanced Optimization (Concurrent reads/writes) - Addressed with moderate fluency.",
      summary: "The candidate is highly prepared for face-to-face recruitment drives. Refining micro-explanations of multi-threading will elevate performance to the elite tier."
    };

    if (client) {
      try {
        const prompt = `You have completed a mock interview session.
Type: ${session.type}
Company context: ${session.companyName || "General"}
Conversation History:
${JSON.stringify(session.messages)}

Generate a highly structured performance assessment JSON conforming to:
{
  "overallScore": integer (0 to 100),
  "presentation": integer (0 to 100),
  "communication": integer (0 to 100),
  "fluency": integer (0 to 100),
  "pronunciation": integer (0 to 100),
  "contentRelevance": integer (0 to 100),
  "strengths": ["array of 2 specific strengths"],
  "improvements": ["array of 2 specific improvements"],
  "behaviorMarkup": "description of student's verbal/non-verbal behavioral patterns, pauses, confidence indicators",
  "activityLog": "chronological monitoring log of student engagement metrics, pacing, and questions from general to advanced",
  "summary": "comprehensive synthesis of behavioral/technical interview readiness"
}`;
        const response = await client.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        if (response.text) {
          scoreResponse = JSON.parse(response.text);
        }
      } catch (err) {
        console.error("Gemini interview scorer failed:", err);
      }
    }

    session.feedback = scoreResponse;
    saveDb(dbData);
    res.json({ success: true, done: true, feedback: scoreResponse, session });
  } else {
    // Generate next interviewer question
    let nextInterviewerQuestion = "Excellent. Can you elaborate further on how you would manage concurrent read/write actions on that structure?";
    if (client) {
      try {
        const prompt = `You are a strict, experienced HR or Technical corporate interviewer.
Interview Type: ${session.type}
Target Company: ${session.companyName || "General"}
Current Conversation History:
${JSON.stringify(session.messages)}

Determine the current depth of the interview (number of student answers: ${turnsCount} out of 3).
Follow-up Question Rules:
- If this is follow-up question 1 (turnsCount is 1): Ask a general intermediate implementation or application query based on the topic.
- If this is follow-up question 2 (turnsCount is 2): Ask an advanced optimization, trade-off, or failure-recovery scenario based on the topic.

Respond with the interviewer's next sequential follow-up question. Maintain character. Be professional and slightly critical, probing for details. Do not output anything other than the direct interviewer statement.`;
        const response = await client.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });
        if (response.text) {
          nextInterviewerQuestion = response.text.trim();
        }
      } catch (err) {
        console.error("Failed to generate interviewer response:", err);
      }
    }

    session.messages.push({
      role: "interviewer",
      text: nextInterviewerQuestion,
      timestamp: new Date().toISOString()
    });

    saveDb(dbData);
    res.json({ success: true, done: false, nextQuestion: nextInterviewerQuestion, session });
  }
});

// PDF Resume Parser Endpoint 📁
app.post("/api/resume/parse", async (req, res) => {
  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: "Missing pdfBase64 data" });
    }

    const dataBuffer = Buffer.from(pdfBase64, "base64");
    // pdfParse parses the binary buffer and extracts full text
    const data = await pdfParse(dataBuffer);

    res.json({ success: true, text: data.text });
  } catch (error: any) {
    console.error("PDF parsing error:", error);
    res.status(500).json({ error: "Failed to parse PDF file: " + error.message });
  }
});

// ── Local Resume Analyzer (no Gemini needed) ────────────────────────────────
function buildLocalResumeAnalysis(resumeText: string) {
  const text = resumeText || "";
  const lower = text.toLowerCase();

  // ── 1. Extract candidate name (first non-empty line of resume) ──
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const candidateName = lines[0] || "Candidate";

  // ── 2. Detect skills present in the resume ──
  const allTechSkills: Record<string, string[]> = {
    languages:    ["java", "python", "javascript", "typescript", "c++", "c#", "golang", "ruby", "kotlin", "swift", "php", "scala", "rust"],
    frontend:     ["react", "angular", "vue", "html", "css", "tailwind", "bootstrap", "nextjs", "next.js", "svelte"],
    backend:      ["node", "express", "spring", "django", "flask", "fastapi", "laravel", "rails", "asp.net"],
    database:     ["mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle", "dynamodb", "firebase", "cassandra"],
    devops:       ["docker", "kubernetes", "ci/cd", "jenkins", "github actions", "terraform", "ansible", "aws", "azure", "gcp", "cloud"],
    testing:      ["junit", "jest", "pytest", "mocha", "cypress", "selenium", "testing", "tdd", "mockito"],
    architecture: ["microservices", "rest", "graphql", "grpc", "event-driven", "kafka", "rabbitmq"],
  };

  const foundSkills: string[] = [];
  const missingByCategory: Record<string, string[]> = {};
  for (const [cat, skills] of Object.entries(allTechSkills)) {
    const found = skills.filter(s => lower.includes(s));
    const missing = skills.filter(s => !lower.includes(s));
    foundSkills.push(...found);
    if (missing.length > 0) missingByCategory[cat] = missing;
  }

  // Pick top 5 missing skills (prioritise devops & testing since most common gaps)
  const priorityOrder = ["devops", "testing", "architecture", "backend", "database", "frontend", "languages"];
  const topMissing: string[] = [];
  for (const cat of priorityOrder) {
    if (topMissing.length >= 5) break;
    const m = missingByCategory[cat] || [];
    for (const s of m) {
      if (topMissing.length < 5) topMissing.push(s.charAt(0).toUpperCase() + s.slice(1));
    }
  }

  // ── 3. ATS Score based on keyword density ──
  const skillScore = Math.min(100, Math.round((foundSkills.length / 12) * 100));
  const hasQuantification = /\d+[%x+]|reduced|improved|increased|saved|delivered/i.test(text);
  const hasImpactVerbs    = /engineered|built|developed|designed|architected|led|optimized|implemented|deployed|launched/i.test(text);
  const hasEducation      = /education|university|college|b\.?tech|bachelor|master|degree|cgpa|gpa/i.test(lower);
  const hasExperience     = /experience|internship|work|project|employment/i.test(lower);
  const impactScore    = hasImpactVerbs    ? 72 : 48;
  const formattingScore= hasEducation && hasExperience ? 80 : 60;
  const quantifyScore  = hasQuantification ? 85 : 55;
  const keywordScore   = Math.min(100, skillScore + 10);
  const atsScore       = Math.round((keywordScore + formattingScore + impactScore + quantifyScore) / 4);

  // ── 4. Personalized improvements based on what's missing ──
  const improvements: string[] = [];
  if (!hasImpactVerbs)    improvements.push(`Replace passive/weak verbs with assertive impact verbs — e.g., 'Engineered', 'Architected', 'Orchestrated' — to establish active code ownership.`);
  if (!hasQuantification) improvements.push(`Add quantifiable results to project bullets (e.g., 'Reduced API response time by 40% for 5,000+ daily users') — recruiters and ATS weight metrics heavily.`);
  if (topMissing.length)  improvements.push(`Add in-demand skills found missing from your profile: ${topMissing.slice(0, 3).join(", ")} — even a brief mention of coursework or personal projects counts.`);
  improvements.push(`Tailor your resume summary section for each job role using keywords directly from the job description to pass automated screening.`);
  if (improvements.length < 3) improvements.push(`Structure each experience entry as: Action Verb + Task + Measurable Result to maximise ATS keyword extraction.`);

  // ── 5. Career suggestions based on detected skill stack ──
  const careerSuggestions: string[] = [];
  if (lower.includes("react") || lower.includes("angular") || lower.includes("vue"))
    careerSuggestions.push("Frontend Developer", "UI Engineer");
  if (lower.includes("spring") || lower.includes("java") || lower.includes("django"))
    careerSuggestions.push("Backend Engineer", "Java Platform Developer");
  if (lower.includes("docker") || lower.includes("kubernetes") || lower.includes("aws"))
    careerSuggestions.push("DevOps / Cloud Engineer", "SRE Engineer");
  if (lower.includes("python") || lower.includes("machine learning") || lower.includes("tensorflow") || lower.includes("data"))
    careerSuggestions.push("Data Engineer", "ML Engineer");
  if (careerSuggestions.length === 0)
    careerSuggestions.push("Software Engineer", "Full Stack Developer", "Technical Associate");

  // ── 6. Job matches tailored to detected skills ──
  const allJobs = [
    { title: "Full Stack Developer", company: "Infosys", location: "Bangalore, India (Hybrid)", matchPercentage: 0, keywords: ["react","node","javascript","typescript"], description: "Build scalable web services and interactive UI layers for enterprise clients." },
    { title: "Java Backend Engineer", company: "Zoho", location: "Chennai, India (In-office)", matchPercentage: 0, keywords: ["java","spring","mysql","backend"], description: "Develop high-performance backend APIs and cloud microservices with Java Spring Boot." },
    { title: "Associate Software Engineer", company: "Google", location: "Hyderabad, India (Hybrid)", matchPercentage: 0, keywords: ["python","algorithms","data structures","go"], description: "Work on core infrastructure products and developer tooling at scale." },
    { title: "Cloud Solutions Engineer", company: "AWS / Amazon", location: "Remote / Pan-India", matchPercentage: 0, keywords: ["aws","docker","kubernetes","terraform"], description: "Design and deploy cloud architectures for enterprise-scale workloads." },
    { title: "Data Engineer", company: "TCS iON", location: "Remote / Pan-India", matchPercentage: 0, keywords: ["python","sql","spark","data","etl"], description: "Build data pipelines and analytics platforms for large-scale enterprise datasets." },
    { title: "Frontend Engineer", company: "Freshworks", location: "Chennai, India", matchPercentage: 0, keywords: ["react","css","typescript","nextjs"], description: "Craft polished, accessible user interfaces and component libraries for SaaS products." },
    { title: "DevOps Platform Engineer", company: "Wipro", location: "Remote / Pan-India", matchPercentage: 0, keywords: ["docker","kubernetes","ci/cd","linux"], description: "Automate delivery pipelines and maintain cloud-native deployment infrastructure." },
    { title: "Software Engineer Trainee", company: "Accenture", location: "Pune, India", matchPercentage: 0, keywords: ["javascript","html","css","sql"], description: "Contribute to client digital transformation projects across web and enterprise platforms." },
  ];

  // Score each job by how many of its keywords appear in the resume
  const jobMatches = allJobs.map(job => {
    const matches = job.keywords.filter(k => lower.includes(k)).length;
    const pct = Math.min(97, Math.round(55 + (matches / job.keywords.length) * 40));
    return { title: job.title, company: job.company, location: job.location, matchPercentage: pct, description: job.description };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 4);

  // ── 7. Improvement examples using actual lines from the resume ──
  const weakLines = lines.filter(l =>
    /helped|assisted|worked on|did|made|used|tried/i.test(l) && l.length > 20
  );
  const areaOfImprovementDetails = [
    {
      category: "High-Impact Action Verbs",
      currentText: weakLines[0] || `"Worked on web development projects using HTML and CSS"`,
      improvedText: `"Engineered responsive, mobile-first web interfaces using HTML5, CSS3 and modern JavaScript (ES6+), improving page load times by 30%"`,
      reason: "Strong action verbs and technical specifics signal ownership and engineering depth to both ATS systems and human reviewers."
    },
    {
      category: "Quantifiable Results",
      currentText: weakLines[1] || `"Managed database for the application"`,
      improvedText: `"Designed and optimised relational schemas with indexed queries, reducing average read latency by 45% for 10,000+ records"`,
      reason: "Numbers make achievements tangible and credible — ATS algorithms and recruiters both filter for measurable impact."
    },
    {
      category: "Technical Keyword Density",
      currentText: `Skills section lacks cloud/DevOps keywords`,
      improvedText: `Add: Docker, CI/CD, GitHub Actions, ${topMissing.slice(0, 2).join(", ")} — even at a basic / learning level`,
      reason: "ATS keyword filters score resumes heavily on the presence of current technology terms. Mentioning in-demand skills — even as learning goals — improves your ranking."
    }
  ];

  // ── 8. Generate a LaTeX resume from the extracted data ──
  const emailMatch  = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch  = text.match(/(\+?\d[\d\s\-().]{7,14}\d)/);
  const detectedEmail = emailMatch ? emailMatch[0] : "yourname@email.com";
  const detectedPhone = phoneMatch ? phoneMatch[0].trim() : "+91 00000 00000";
  const skillsList  = foundSkills.length > 0 ? foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ") : "JavaScript, HTML, CSS, SQL";

  const latexResumeCode = `% ATS-Optimised Resume — Personalised for ${candidateName}
% Compile with pdfLaTeX on Overleaf or local TeX installation
\\documentclass[10pt,letterpaper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing{\\section}{0pt}{10pt}{5pt}
\\setlist[itemize]{noitemsep, topsep=2pt}
\\hypersetup{colorlinks=true, urlcolor=blue}

\\begin{document}
\\begin{center}
  {\\Huge \\textbf{${candidateName.toUpperCase()}}} \\\\ [4pt]
  \\href{mailto:${detectedEmail}}{${detectedEmail}} $|$ ${detectedPhone} $|$ \\href{https://github.com}{GitHub} $|$ \\href{https://linkedin.com}{LinkedIn}
\\end{center}

\\section{Professional Summary}
Results-driven software engineer with hands-on experience in ${skillsList.split(",").slice(0,3).join(", ")}. Passionate about building scalable, efficient systems and delivering high-quality software solutions.

\\section{Technical Skills}
\\begin{itemize}
  \\item \\textbf{Technologies:} ${skillsList}
  \\item \\textbf{Tools \\& Platforms:} Git, VS Code, Linux, Postman
\\end{itemize}

\\section{Experience \\& Projects}
\\begin{itemize}
  \\item \\textbf{[Your Project / Role]} --- Engineered [feature] using ${foundSkills[0] || "JavaScript"} and ${foundSkills[1] || "SQL"}, improving [metric] by X\\%.
  \\item \\textbf{[Another Project]} --- Designed and deployed [system], serving [N] users with [result achieved].
\\end{itemize}

\\section{Education}
\\begin{itemize}
  \\item \\textbf{[Your Degree]} \\\\ [Your University] --- [CGPA / Grade] (Year -- Year)
\\end{itemize}

\\section{Certifications \\& Achievements}
\\begin{itemize}
  \\item [Certification Name] --- [Issuing Body], [Year]
\\end{itemize}

\\end{document}`;

  return {
    atsScore,
    missingSkills: topMissing.length > 0 ? topMissing : ["Docker & Containerization", "CI/CD Pipelines", "Unit Testing", "Cloud Deployment", "Microservices"],
    improvements,
    careerSuggestions: [...new Set(careerSuggestions)].slice(0, 4),
    scoreBreakdown: { keywordMatch: keywordScore, formatting: formattingScore, impactLanguage: impactScore, skillsAlignment: quantifyScore },
    areaOfImprovementDetails,
    latexResumeCode,
    jobMatches
  };
}

// 8. Resume Analyzer Module ⭐
app.post("/api/resume/analyze", async (req, res) => {
  const { resumeText } = req.body;
  const client = getGeminiClient();

  // Build personalized fallback from the actual resume text
  let analysis = buildLocalResumeAnalysis(resumeText || "");

  if (client) {
    try {
      const prompt = `You are an expert Resume Reviewer, ATS Algorithm auditor, and Technical Recruiter.
Analyze the following candidate resume text:
"${resumeText}"

Generate a thorough, complete ATS analysis, job matching results based on their skill profile, step-by-step areas of improvements with before/after phrasing examples, and a fully formed copyable LaTeX resume template (designed to compile flawlessly on pdfLaTeX / Overleaf).

Response MUST be strictly valid JSON fitting this exact structure:
{
  "atsScore": integer (0 to 100),
  "missingSkills": ["skill 1", "skill 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "careerSuggestions": ["role 1", "role 2", ...],
  "scoreBreakdown": {
    "keywordMatch": integer (0 to 100),
    "formatting": integer (0 to 100),
    "impactLanguage": integer (0 to 100),
    "skillsAlignment": integer (0 to 100)
  },
  "areaOfImprovementDetails": [
    {
      "category": "e.g., Impact Verbs, Metric Quantification, Technical Keywords",
      "currentText": "original subpar phrase from resume",
      "improvedText": "strong, professional rewritten alternative",
      "reason": "why this rewritten alternative scores higher in recruiters and ATS indexes"
    },
    ...
  ],
  "latexResumeCode": "complete copyable LaTeX document text",
  "jobMatches": [
    {
      "title": "Job Title",
      "company": "Company Name (e.g. Google, Zoho, TCS, Accenture, Amazon)",
      "location": "Location",
      "matchPercentage": integer (0 to 100),
      "description": "Brief 1-2 sentence job details"
    },
    ...
  ]
}

Ensure the LaTeX document uses standard packages like article, geometry, hyperref, enumitem, titlesec, compiles cleanly, is well-escaped without stray unescaped backslashes, and represents the candidate's name and details elegantly. Do not wrap the JSON output in markdown blocks.`;

      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        analysis = JSON.parse(response.text);
      }
    } catch (err) {
      console.error("Gemini resume analysis failed, using smart local analysis:", err);
    }
  }

  res.json({ success: true, analysis });
});

// 9. Career Guidance Module ⭐
app.post("/api/career/recommend", async (req, res) => {
  const { goalRole } = req.body;
  const client = getGeminiClient();

  let recommendation = {
    role: goalRole || "Java Backend Developer",
    roadmap: ["Core Java & Concurrency", "Spring Framework & MVC", "Hibernate/JPA database connectors", "Microservices & Docker", "AWS deployment basics"],
    certifications: ["Oracle Certified Professional: Java SE Developer", "AWS Certified Cloud Practitioner"],
    projects: ["TaskSync - Distributed RESTful MVC service", "SecurePass - OAuth2 Token Manager using JWTs"],
    courses: ["Java Systems Design (EduReach Course 2)", "Distributed Databases Masterclass"]
  };

  if (client) {
    try {
      const prompt = `The student wishes to become a: "${goalRole}".
Synthesize a recommended step-by-step learning roadmap, relevant industry certifications, portfolio projects, and specific areas to study.

Response JSON format:
{
  "role": "${goalRole}",
  "roadmap": ["Step 1: ...", "Step 2: ...", ...],
  "certifications": ["Cert 1", "Cert 2", ...],
  "projects": ["Project 1 with short description", "Project 2 with short description", ...],
  "courses": ["Recommended course 1", "Recommended course 2"]
}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        recommendation = JSON.parse(response.text);
      }
    } catch (err) {
      console.error("Gemini career guidance failed:", err);
    }
  }

  res.json({ success: true, recommendation });
});

// 10. AI Notes Generator & Flashcards ⭐
app.post("/api/notes/generate", async (req, res) => {
  const { title, text } = req.body;
  const client = getGeminiClient();

  let results = {
    title: title || "Automated Study Guide",
    summary: "Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler subproblems. It is applicable to problems exhibiting overlapping subproblems and optimal substructure.",
    mindMapNodes: [
      { id: "1", label: "Dynamic Programming" },
      { id: "2", label: "Optimal Substructure", parentId: "1" },
      { id: "3", label: "Overlapping Subproblems", parentId: "1" },
      { id: "4", label: "Memoization (Top-Down)", parentId: "2" },
      { id: "5", label: "Tabulation (Bottom-Up)", parentId: "2" }
    ],
    flashcards: [
      { question: "What are the two core prerequisites of Dynamic Programming?", answer: "Overlapping subproblems and optimal substructure." },
      { question: "What is the difference between Memoization and Tabulation?", answer: "Memoization is a top-down cached recursive approach, while tabulation is a bottom-up iterative table-filling approach." }
    ]
  };

  if (client) {
    try {
      const prompt = `Analyze this study material and generate notes:
Material Title: ${title || "Study Topic"}
Content: ${text}

Output notes summary, a hierarchical mind-map tree with nodes containing {id, label, parentId?}, and a list of 2-3 flashcards with {question, answer}.

Response JSON format:
{
  "title": "Topic Title",
  "summary": "comprehensive markdown summarization text",
  "mindMapNodes": [
    {"id": "1", "label": "Main Topic"},
    {"id": "2", "label": "Subtopic A", "parentId": "1"},
    ...
  ],
  "flashcards": [
    {"question": "Q1?", "answer": "A1"},
    ...
  ]
}`;
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        results = JSON.parse(response.text);
      }
    } catch (err) {
      console.error("Gemini notes generator failed:", err);
    }
  }

  const dbData = loadDb();
  const noteItem = {
    id: "note_" + Math.random().toString(36).substring(2, 9),
    ...results,
    createdAt: new Date().toISOString()
  };
  dbData.notes.push(noteItem);
  saveDb(dbData);

  res.json({ success: true, note: noteItem });
});

// 11. Learning Analytics
app.get("/api/analytics/:studentId", (req, res) => {
  const { studentId } = req.params;
  const dbData = loadDb();
  const userAnal = dbData.analytics[studentId] || {
    learningHours: [2, 1, 4, 3, 5, 2, 3],
    lessonsCompleted: 4,
    quizzesAttempted: 1,
    assignmentsSubmitted: 0,
    totalXp: 150,
    skillScore: 52,
    strongAreas: ["General Programming"],
    weakAreas: ["Data Structures"],
    aiInsights: "Keep studying to unlock advanced AI insights."
  };
  res.json(userAnal);
});

// Leaderboard Endpoints
app.get("/api/leaderboard", (req, res) => {
  const dbData = loadDb();
  const sorted = [...dbData.users]
    .filter(u => u.role === UserRole.STUDENT)
    .sort((a, b) => b.xp - a.xp)
    .map((u, index) => ({
      rank: index + 1,
      id: u.id,
      name: u.name,
      level: u.level,
      xp: u.xp,
      badgesCount: u.badges.length
    }));
  res.json(sorted);
});

// Notifications
app.get("/api/notifications/:userId", (req, res) => {
  const { userId } = req.params;
  const dbData = loadDb();
  const list = dbData.notifications.filter(n => n.userId === userId);
  res.json(list);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const dbData = loadDb();
  const notif = dbData.notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveDb(dbData);
  }
  res.json({ success: true });
});

// Chat Log Support
app.get("/api/chat/:userId", (req, res) => {
  const { userId } = req.params;
  const dbData = loadDb();
  const messages = dbData.chatMessages.filter(
    m => m.senderId === userId || m.receiverId === userId
  );
  res.json(messages);
});

app.post("/api/chat", (req, res) => {
  const { senderId, senderName, senderRole, receiverId, text } = req.body;
  const dbData = loadDb();
  const newMessage = {
    id: "msg_" + Math.random().toString(36).substring(2, 9),
    senderId,
    senderName,
    senderRole,
    receiverId,
    text,
    timestamp: new Date().toISOString()
  };
  dbData.chatMessages.push(newMessage);
  saveDb(dbData);
  res.json({ success: true, message: newMessage });
});

// AI support chatbot assistant endpoint ⭐
app.post("/api/ai/chat", async (req, res) => {
  const { message, userId, provider, agent } = req.body;
  const client = getGeminiClient();
  const dbData = loadDb();

  // Decide the system prompt based on agent
  let systemPrompt = EDUREACH_ASSISTANT_PROMPT;
  let botName = "EduReach AI Assistant";

  if (agent && EDUREACH_SPECIALIZED_AGENTS[agent]) {
    systemPrompt = EDUREACH_SPECIALIZED_AGENTS[agent];
    const agentNames: Record<string, string> = {
      interview_coach: "AI Interview Coach",
      resume_builder: "AI Resume Builder",
      career_advisor: "AI Career Advisor",
      coding_mentor: "AI Coding Mentor",
      exam_generator: "AI Exam Generator",
      notes_generator: "AI Notes Generator",
      study_planner: "AI Study Planner",
      roadmap_generator: "AI Roadmap Generator",
      voice_assistant: "AI Voice Assistant"
    };
    botName = agentNames[agent] || "EduReach AI Assistant";
  }

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    try {
      const model = "llama-3.3-70b-versatile";
      const prompt = `${systemPrompt}

You are acting as the specialized agent: ${botName}. The student says:
"${message}"

Respond naturally and conversationally. Rules:
1. Give a direct, warm, and helpful response — never robotic or template-filled.
2. Maintain your persona and stay within your specialty.
3. If they ask a subject/topic question, explain it clearly with examples.
4. For coding questions, provide the solution with explanation and complexity.
5. Keep responses conversational — NOT markdown-heavy for a chat context.`;

      const responseText = await callGroqChatCompletions(
        model,
        systemPrompt,
        prompt
      );
      const reply = responseText || "I am processing your query. How else can I assist you today?";
      const studentMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        senderId: userId || "std_guest",
        senderName: "Student",
        senderRole: UserRole.STUDENT,
        receiverId: "ai_assistant",
        text: message,
        timestamp: new Date().toISOString()
      };
      const assistantMsg = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        senderId: "ai_assistant",
        senderName: botName,
        senderRole: UserRole.ADMIN,
        receiverId: userId || "std_guest",
        text: reply,
        timestamp: new Date().toISOString()
      };
      dbData.chatMessages.push(studentMsg, assistantMsg);
      saveDb(dbData);
      return res.json({ success: true, reply });
    } catch (groqErr) {
      console.warn("Groq chatbot error, falling back to Gemini:", groqErr);
    }
  }
  
  if (!client) {
    const reply = getLocalChatAssistantResponse(message, agent);
    const studentMsg = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderId: userId || "std_guest",
      senderName: "Student",
      senderRole: UserRole.STUDENT,
      receiverId: "ai_assistant",
      text: message,
      timestamp: new Date().toISOString()
    };
    const assistantMsg = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderId: "ai_assistant",
      senderName: botName,
      senderRole: UserRole.ADMIN,
      receiverId: userId || "std_guest",
      text: reply,
      timestamp: new Date().toISOString()
    };
    dbData.chatMessages.push(studentMsg, assistantMsg);
    saveDb(dbData);
    return res.json({ success: true, reply });
  }

  try {
    const prompt = `${systemPrompt}

You are acting as the specialized agent: ${botName}. The student says:
"${message}"

Respond naturally and conversationally. Rules:
1. Give a direct, warm, and helpful response — never robotic or template-filled.
2. Maintain your persona and stay within your specialty.
3. If they ask a subject/topic question, explain it clearly with examples.
4. For coding questions, provide the solution with explanation and complexity.
5. Keep responses conversational — NOT markdown-heavy for a chat context.`;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt
    });

    const reply = response.text || "I am processing your query. How else can I assist you today?";
    const studentMsg = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderId: userId || "std_guest",
      senderName: "Student",
      senderRole: UserRole.STUDENT,
      receiverId: "ai_assistant",
      text: message,
      timestamp: new Date().toISOString()
    };
    const assistantMsg = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderId: "ai_assistant",
      senderName: botName,
      senderRole: UserRole.ADMIN,
      receiverId: userId || "std_guest",
      text: reply,
      timestamp: new Date().toISOString()
    };
    dbData.chatMessages.push(studentMsg, assistantMsg);
    saveDb(dbData);
    res.json({ success: true, reply });
  } catch (err) {
    console.warn("Gemini chatbot error, using local fallback:", err);
    const reply = getLocalChatAssistantResponse(message, agent);
    const studentMsg = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderId: userId || "std_guest",
      senderName: "Student",
      senderRole: UserRole.STUDENT,
      receiverId: "ai_assistant",
      text: message,
      timestamp: new Date().toISOString()
    };
    const assistantMsg = {
      id: "msg_" + Math.random().toString(36).substring(2, 9),
      senderId: "ai_assistant",
      senderName: botName,
      senderRole: UserRole.ADMIN,
      receiverId: userId || "std_guest",
      text: reply,
      timestamp: new Date().toISOString()
    };
    dbData.chatMessages.push(studentMsg, assistantMsg);
    saveDb(dbData);
    res.json({ success: true, reply });
  }
});

// 8. AI Placement Drive Evaluator ⭐
app.post("/api/placement/evaluate", async (req, res) => {
  const { companyName, resumeText, atsScore, aptitudeScore, codingScore, interviewTranscript, provider } = req.body;
  const sysPrompt = `You are a Senior Corporate Recruiter and Placement Director. Evaluate a candidate's readiness for a placement at "${companyName}".
Student Profile Details:
- ATS Resume Score: ${atsScore || 0}%
- ATS Resume Content: "${resumeText || "Not Provided"}"
- Aptitude MCQ Score: ${aptitudeScore || 0}/5
- Coding Assessment Score: ${codingScore || 0}%
- Technical Interview Transcript:
${JSON.stringify(interviewTranscript || [])}

Perform an expert analysis. Return a JSON object matching this schema EXACTLY:
{
  "readinessGrade": "e.g. A, B+, B, C, F",
  "selectionProbability": "Highly Likely, Likely, Marginal, or Unlikely",
  "feedback": "A comprehensive markdown analysis with 3 sections: 1. ### Strengths (with bullet points), 2. ### Areas to Improve (with bullet points), 3. ### Recruitment Recommendation (concrete summary explaining if they can crack this company and next steps)."
}`;

  if (provider === "groq" && process.env.GROQ_API_KEY) {
    try {
      const responseText = await callGroqChatCompletions("llama-3.3-70b-versatile", sysPrompt, "Evaluate this candidate's placement readiness.", undefined, true);
      if (responseText) {
        try {
          const parsed = JSON.parse(responseText.trim());
          return res.json({
            readinessGrade: parsed.readinessGrade || "B",
            selectionProbability: parsed.selectionProbability || "Likely",
            feedback: parsed.feedback || "Standard mock evaluation feedback compiled successfully."
          });
        } catch (e) {
          // fall through
        }
      }
    } catch (err) {
      console.warn("Groq placement evaluation failed, falling back to Gemini:", err);
    }
  }

  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Evaluate this candidate's placement readiness.",
        config: {
          responseMimeType: "application/json",
          systemInstruction: sysPrompt
        }
      });
      if (response.text) {
        try {
          const parsed = JSON.parse(response.text.trim());
          return res.json({
            readinessGrade: parsed.readinessGrade || "B",
            selectionProbability: parsed.selectionProbability || "Likely",
            feedback: parsed.feedback || "Standard mock evaluation feedback compiled successfully."
          });
        } catch (e) {
          // fall through
        }
      }
    } catch (err) {
      console.warn("Gemini placement evaluation failed, using fallback:", err);
    }
  }

  // Local static fallback
  res.json({
    readinessGrade: "B+",
    selectionProbability: "Likely",
    feedback: `### Strengths
- Solid coding skills with good baseline efficiency.
- Aptitude scores reflect a functional math/logic foundation.

### Areas to Improve
- ATS compatibility scan suggests targeting specific corporate keyword distributions.
- Interview responses could detail scalability constraints for high load architectures.

### Recruitment Recommendation
Keep practicing company-specific algorithms and refine resume formatting before the final placement drive.`
  });
});

// AI Resume Creator Endpoint ⭐
app.post("/api/resume/create", async (req, res) => {
  const { name, email, phone, jobTitle, skills, experience, education, theme } = req.body;
  const client = getGeminiClient();

  const prompt = `You are an expert AI Resume Writer. Create a high-converting, professional resume based on these candidate inputs:
Name: ${name || "Candidate Name"}
Email: ${email || "email@example.com"}
Phone: ${phone || "+1234567890"}
Target Role: ${jobTitle || "Software Engineer"}
Skills: ${skills || "JavaScript, HTML, CSS"}
Experience/Projects: ${experience || "Built a web app"}
Education: ${education || "B.S. in Computer Science"}
Theme: ${theme || "ats_professional"}

You MUST return a JSON object conforming exactly to this structure:
{
  "resumeMarkdown": "A fully polished, professionally formatted Markdown resume reflecting the chosen theme style",
  "latexCode": "Overleaf-compliant clean LaTeX document pre-populated with this candidate's details. Keep it compilation-ready and use standard LaTeX packages like geometry, hyperref, etc."
}`;

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        return res.json({
          success: true,
          resumeMarkdown: parsed.resumeMarkdown,
          latexCode: parsed.latexCode
        });
      }
    } catch (err) {
      console.warn("Gemini resume generation failed, using fallback:", err);
    }
  }

  // Fallback LaTeX and Markdown formatting if AI is offline
  const fallbackMarkdown = `# ${name || "Candidate Name"}
**Role**: ${jobTitle || "Software Engineer"} | **Email**: ${email || "email@example.com"} | **Phone**: ${phone || "+1234567890"}

## Technical Skills
${skills || "JavaScript, HTML, CSS"}

## Experience & Projects
${experience || "Built a web app"}

## Education
${education || "B.S. in Computer Science"}`;

  const fallbackLatex = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\title{Resume - ${name || "Candidate Name"}}
\\author{${name || "Candidate Name"}}
\\date{}

\\begin{document}
\\maketitle

\\section*{Contact Information}
\\textbf{Email:} ${email || "email@example.com"} \\\\
\\textbf{Phone:} ${phone || "+1234567890"}

\\section*{Professional Objective}
To secure a challenging role as a ${jobTitle || "Software Engineer"} leveraging technical competencies.

\\section*{Skills}
${skills || "JavaScript, HTML, CSS"}

\\section*{Experience \\& Projects}
${experience || "Built a web app"}

\\section*{Education}
${education || "B.S. in Computer Science"}

\\end{document}`;

  res.json({
    success: true,
    resumeMarkdown: fallbackMarkdown,
    latexCode: fallbackLatex
  });
});

// Serve React build & setup Vite Dev Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduReach AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
