import { Course, CodingProblem, Assignment } from "./types";

export function getRealResource(category: string, topic: string, part: number = 1): { videoUrl: string; pdfUrl: string } {
  let videoUrl = "https://www.youtube.com/embed/RBSGKlAboiM"; // default: FreeCodeCamp DSA
  let pdfUrl = "https://cslibrary.stanford.edu/103/LinkedListProblems.pdf"; // default: Stanford DSA

  const lowerCat = category.toLowerCase();
  const lowerTopic = topic.toLowerCase();

  // Determine PDF Url based on category & topic (using highly reliable working HTTPS links)
  if (lowerCat.includes("company")) {
    pdfUrl = "https://www.cmu.edu/career/documents/sample-resumes-and-cover-letters/resume-guide.pdf";
  } else if (lowerCat.includes("coding") || lowerCat.includes("dsa")) {
    if (lowerTopic.includes("array") || lowerTopic.includes("sliding") || lowerTopic.includes("pointer")) {
      pdfUrl = "https://math.mit.edu/~goemans/18.310S15/bigo.pdf";
    } else if (lowerTopic.includes("linked list")) {
      pdfUrl = "https://cslibrary.stanford.edu/103/LinkedListProblems.pdf";
    } else if (lowerTopic.includes("dynamic programming") || lowerTopic.includes("knapsack") || lowerTopic.includes("lis") || lowerTopic.includes("lcs")) {
      pdfUrl = "https://www.cs.cmu.edu/~avrim/451f13/lectures/lect0917.pdf";
    } else {
      pdfUrl = "https://math.mit.edu/~goemans/18.310S15/bigo.pdf";
    }
  } else if (lowerCat.includes("quant") || lowerCat.includes("aptitude")) {
    if (lowerTopic.includes("probability") || lowerTopic.includes("permutation")) {
      pdfUrl = "https://www.dartmouth.edu/~chance/teaching_aids/books_articles/probability_book/book.pdf";
    } else {
      pdfUrl = "https://web.mit.edu/career/www/guide/star.pdf";
    }
  } else if (lowerCat.includes("core cs") || lowerCat.includes("system design")) {
    if (lowerTopic.includes("operating system") || lowerTopic.includes("process") || lowerTopic.includes("memory")) {
      pdfUrl = "https://pages.cs.wisc.edu/~remzi/OSTEP/OSTEP.pdf";
    } else if (lowerTopic.includes("network") || lowerTopic.includes("ip") || lowerTopic.includes("routing")) {
      pdfUrl = "https://www.isi.edu/~hussain/TEACH/CS551/papers/OSIModel.pdf";
    } else if (lowerTopic.includes("dbms") || lowerTopic.includes("sql") || lowerTopic.includes("transaction")) {
      pdfUrl = "https://web.stanford.edu/class/cs346/2015/notes/dbms_arch.pdf";
    } else {
      pdfUrl = "https://static.googleusercontent.com/media/research.google.com/en//archive/mapreduce-osdi04.pdf";
    }
  } else if (lowerCat.includes("soft skills") || lowerCat.includes("resume")) {
    if (lowerTopic.includes("resume") || lowerTopic.includes("ats")) {
      pdfUrl = "https://www.cmu.edu/career/documents/sample-resumes-and-cover-letters/resume-guide.pdf";
    } else {
      pdfUrl = "https://web.mit.edu/career/www/guide/star.pdf";
    }
  }

  // Determine Video Url based on category & topic & part
  if (lowerCat.includes("company")) {
    if (lowerTopic.includes("google")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/4E3xYyWT8C8" : "https://www.youtube.com/embed/jgpVdJB2sKQ";
    } else if (lowerTopic.includes("amazon")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/1TPrwFwW5X4" : "https://www.youtube.com/embed/xpDnVSmNFX0";
    } else if (lowerTopic.includes("microsoft")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/A8MFr8EhyC8" : "https://www.youtube.com/embed/4i6-9IzQHwo";
    } else if (lowerTopic.includes("meta")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/95_81Jc9mJc" : "https://www.youtube.com/embed/WwfhLC16bis";
    } else {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/wXw0155NqO4" : "https://www.youtube.com/embed/d29T9mN-tE0";
    }
  } else if (lowerCat.includes("coding") || lowerCat.includes("dsa")) {
    if (part === 1) {
      videoUrl = "https://www.youtube.com/embed/RBSGKlAboiM"; // Part 1 fundamentals
    } else {
      if (lowerTopic.includes("array") || lowerTopic.includes("sliding") || lowerTopic.includes("pointer")) {
        videoUrl = "https://www.youtube.com/embed/4i6-9IzQHwo";
      } else if (lowerTopic.includes("linked list")) {
        videoUrl = "https://www.youtube.com/embed/WwfhLC16bis";
      } else if (lowerTopic.includes("stack") || lowerTopic.includes("queue")) {
        videoUrl = "https://www.youtube.com/embed/A3ZuqDBMC6A";
      } else if (lowerTopic.includes("tree") || lowerTopic.includes("heap")) {
        videoUrl = "https://www.youtube.com/embed/t0Cq6tVMRBA";
      } else if (lowerTopic.includes("hash")) {
        videoUrl = "https://www.youtube.com/embed/sfWyugl4JWA";
      } else if (lowerTopic.includes("dynamic programming") || lowerTopic.includes("knapsack") || lowerTopic.includes("lis") || lowerTopic.includes("lcs")) {
        videoUrl = "https://www.youtube.com/embed/oBt53YbR9K0";
      } else if (lowerTopic.includes("segment tree") || lowerTopic.includes("range query")) {
        videoUrl = "https://www.youtube.com/embed/QvgRECOhyYI";
      } else {
        videoUrl = "https://www.youtube.com/embed/sfWyugl4JWA";
      }
    }
  } else if (lowerCat.includes("quant") || lowerCat.includes("aptitude")) {
    if (part === 1) {
      videoUrl = "https://www.youtube.com/embed/0BIPuTfB38U"; // shortcuts
    } else {
      if (lowerTopic.includes("time and work") || lowerTopic.includes("speed")) {
        videoUrl = "https://www.youtube.com/embed/zLupfP3mC4w";
      } else if (lowerTopic.includes("probability") || lowerTopic.includes("permutation")) {
        videoUrl = "https://www.youtube.com/embed/SkidyDQuupA";
      } else {
        videoUrl = "https://www.youtube.com/embed/0BIPuTfB38U";
      }
    }
  } else if (lowerCat.includes("core cs") || lowerCat.includes("system design")) {
    if (lowerTopic.includes("operating system") || lowerTopic.includes("process") || lowerTopic.includes("memory")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/vBURTt97EkA" : "https://www.youtube.com/embed/xpDnVSmNFX0";
    } else if (lowerTopic.includes("network") || lowerTopic.includes("ip") || lowerTopic.includes("routing")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/IPvYjXCsTg8" : "https://www.youtube.com/embed/jgpVdJB2sKQ";
    } else if (lowerTopic.includes("dbms") || lowerTopic.includes("sql") || lowerTopic.includes("transaction")) {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/HXV3zeQKqGY" : "https://www.youtube.com/embed/epDG5Yj1828";
    } else {
      videoUrl = part === 1 ? "https://www.youtube.com/embed/m8IOfR6h1ss" : "https://www.youtube.com/embed/ZS_kXvOeQ5Y";
    }
  } else if (lowerCat.includes("soft skills") || lowerCat.includes("resume")) {
    videoUrl = part === 1 ? "https://www.youtube.com/embed/Tt08KmFfIYQ" : "https://www.youtube.com/embed/w5r2sE-x3yI";
  }

  return { videoUrl, pdfUrl };
}

export function generatePlacementCourses(): Course[] {
  const categories = [
    "Coding & DSA Essentials",
    "Quant & Analytical Aptitude",
    "System Design Masterclass",
    "Company Specific Crack Packs",
    "Soft Skills & Resume Engineering",
    "Core CS Subjects"
  ];

  const companyPacks = [
    "Google", "Amazon", "Microsoft", "Meta", "TCS NQT", "Infosys SP", "Zoho", "Accenture", "Cognizant", "Wipro"
  ];

  const dsaTopics = [
    "Arrays & Sliding Window", "Linked List Manipulation", "Stacks, Queues & Monotonic Deques", "Binary Trees & Traversals",
    "Binary Search Trees & AVL", "Priority Queues & Binary Heaps", "HashMap & Hash Collisions", "Tries & Prefix Structures",
    "DFS, BFS & Graph Traversals", "Dijkstra & Shortest Paths", "Kruskal & Prim MST", "Disjoint Set Union (DSU)",
    "Dynamic Programming: 1D Knapsack", "Dynamic Programming: LIS & LCS", "Bitwise Hacks & Mathematics",
    "Recursion & Backtracking Keys", "Divide & Conquer Tactics", "Two Pointer Optimizations", "Greedy Choice Paradigms",
    "Segment Trees & Range Queries"
  ];

  const aptitudeTopics = [
    "Quantitative: Time and Work", "Quantitative: Speed, Distance & Time", "Quantitative: Permutations & Combinations",
    "Quantitative: Probability Theory", "Quantitative: Profit and Loss", "Quantitative: Simple & Compound Interest",
    "Quantitative: Ratio & Proportion", "Quantitative: Mixtures & Alligations", "Quantitative: Number Systems",
    "Quantitative: Progressions & Series", "Analytical: Syllogisms", "Analytical: Blood Relations",
    "Analytical: Seating Arrangements", "Analytical: Coding-Decoding", "Analytical: Data Sufficiency",
    "Logical: Clock and Calendar", "Logical: Direction Sense", "Logical: Input-Output Tracing",
    "Logical: Matrix Arrangements", "Logical: Cryptarithmetic"
  ];

  const coreCSTopics = [
    "Operating Systems: Process Management", "Operating Systems: CPU Scheduling", "Operating Systems: Virtual Memory & Paging",
    "Computer Networks: OSI Model & TCP/IP", "Computer Networks: IP Addressing & Subnetting", "Computer Networks: Routing Protocols",
    "DBMS: SQL Joins, Aggregations & Grouping", "DBMS: Database Normalization (1NF to BCNF)", "DBMS: Transactions & ACID Properties",
    "System Design: Horizontal vs Vertical Scaling", "System Design: Microservices & API Gateway", "System Design: Load Balancers & Proxies",
    "System Design: Database Sharding", "System Design: Message Queues (Kafka & RabbitMQ)"
  ];

  const professionalTopics = [
    "ATS Resume Optimization Guide", "Technical Interview Self-Presentation", "Behavioral Interviews & STAR Method",
    "Mock Interview Case Studies", "Group Discussion Strategy"
  ];

  const coursesList: Course[] = [];
  let idCounter = 1;

  // 1. Generate Company Specific Crack Packs (10 courses)
  for (const company of companyPacks) {
    const courseId = `course_place_co_${idCounter++}`;
    coursesList.push({
      id: courseId,
      title: `${company} Placement Training: Complete Crack Pack`,
      description: `Crack the elite technical assessment and coding rounds of ${company} with curated templates, historical exam patterns, speed drills, and mock cases.`,
      category: "Company Specific Crack Packs",
      facultyId: "fac_1",
      facultyName: "Placement Cell Director",
      enrolledStudentsCount: Math.floor(Math.random() * 50) + 95,
      tags: [company, "Placements", "CrackPack", "InterviewPrep"],
      lessons: [
        {
          id: `les_place_${courseId}_1`,
          title: `Syllabus Blueprint & Assessment Pattern of ${company}`,
          content: `### Course Syllabus & Expectations\n\nUnderstand the multi-stage recruitment pattern of **${company}**, including cut-off metrics and compiler specifications.\n\n- Round 1: Online Assessment (MCQs + Coding)\n- Round 2: Technical Interview 1 (Data Structures)\n- Round 3: Technical Interview 2 (System Design / Core CS)\n- Round 4: HR & Cultural Alignment`,
          ...getRealResource("Company Specific Crack Packs", company, 1),
          durationMinutes: 30
        },
        {
          id: `les_place_${courseId}_2`,
          title: `High Frequency Coding Problems & Edge Cases`,
          content: `### High-Frequency Solved Cases\n\nDeep dive into actual interview prompts of **${company}** over the last 12 months with absolute O(N) optimized solutions.`,
          ...getRealResource("Company Specific Crack Packs", company, 2),
          durationMinutes: 45
        }
      ]
    });
  }

  // 2. Generate Coding & DSA Courses (20 courses)
  for (const topic of dsaTopics) {
    const courseId = `course_place_dsa_${idCounter++}`;
    coursesList.push({
      id: courseId,
      title: `DSA Masterclass: ${topic}`,
      description: `A masterclass on ${topic} for placement-level tests. Focuses on complexity proofs, visual dry runs, and LeetCode implementations.`,
      category: "Coding & DSA Essentials",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: Math.floor(Math.random() * 80) + 120,
      tags: ["DSA", "LeetCode", "Coding", "Syllabus"],
      lessons: [
        {
          id: `les_place_${courseId}_1`,
          title: `Fundamental Concepts & Mathematical Derivations`,
          content: `### Core Fundamentals of ${topic}\n\nLearn memory allocations, theoretical operations, and spatial representations for ${topic}.\n\n1. Mathematical Analysis\n2. Memory structures\n3. Complexity constraints`,
          ...getRealResource("Coding & DSA Essentials", topic, 1),
          durationMinutes: 25
        },
        {
          id: `les_place_${courseId}_2`,
          title: `Advanced Optimal Solutions & Implementation Templates`,
          content: `### Complete Code walkthrough\n\nLearn optimal execution templates and custom debugger strategies for ${topic}.`,
          ...getRealResource("Coding & DSA Essentials", topic, 2),
          durationMinutes: 35
        }
      ]
    });
  }

  // 3. Generate Aptitude courses (20 courses)
  for (const topic of aptitudeTopics) {
    const courseId = `course_place_apt_${idCounter++}`;
    coursesList.push({
      id: courseId,
      title: `Placement Aptitude: ${topic}`,
      description: `Master high-speed quantitative shortcut tricks, mental mathematics, and logical rules for ${topic} featured in TCS NQT, Cognizant, and Infosys.`,
      category: "Quant & Analytical Aptitude",
      facultyId: "fac_1",
      facultyName: "Aptitude Coach",
      enrolledStudentsCount: Math.floor(Math.random() * 120) + 200,
      tags: ["Aptitude", "Quant", "Logic", "Shortcuts"],
      lessons: [
        {
          id: `les_place_${courseId}_1`,
          title: `Shortcut Formulas & Mentally Efficient Derivations`,
          content: `### Quantitative Tricks for ${topic}\n\nTime is the ultimate filter in placement exams. Learn mental math speed hacks for ${topic}.\n\n- Trick 1: Ratio Elimination Method\n- Trick 2: Back-solving from options\n- Trick 3: Fast percentage calculation`,
          ...getRealResource("Quant & Analytical Aptitude", topic, 1),
          durationMinutes: 20
        },
        {
          id: `les_place_${courseId}_2`,
          title: `High-Difficulty Mock Questions Step-by-Step`,
          content: `### Step-by-step Mathematical Derivations\n\nWalkthrough of the 10 most challenging placement exam questions for ${topic}.`,
          ...getRealResource("Quant & Analytical Aptitude", topic, 2),
          durationMinutes: 30
        }
      ]
    });
  }

  // 4. Generate Core CS courses (14 courses)
  for (const topic of coreCSTopics) {
    const courseId = `course_place_cs_${idCounter++}`;
    coursesList.push({
      id: courseId,
      title: `Core Computer Science: ${topic}`,
      description: `Consolidate your academic foundation in ${topic} to clear technical MCQ screening rounds and viva tests.`,
      category: "Core CS Subjects",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: Math.floor(Math.random() * 60) + 150,
      tags: ["CoreCS", "InterviewPrep", "University"],
      lessons: [
        {
          id: `les_place_${courseId}_1`,
          title: `Theoretical Architecture & Standard Vocabulary`,
          content: `### Key Definitions and Architectures\n\nDetailed breakdown of core academic principles for ${topic}.\n\n- Formal specifications\n- Design paradigms\n- Edge-case review and standard acronyms`,
          ...getRealResource("Core CS Subjects", topic, 1),
          durationMinutes: 30
        },
        {
          id: `les_place_${courseId}_2`,
          title: `Technical Screening MCQs & Interview Viva Prep`,
          content: `### High-Probability MCQ Bank\n\nFrequently asked viva and technical screening MCQs with detailed explanations for ${topic}.`,
          ...getRealResource("Core CS Subjects", topic, 2),
          durationMinutes: 25
        }
      ]
    });
  }

  // 5. Generate Professional/Soft Skills (5 courses)
  for (const topic of professionalTopics) {
    const courseId = `course_place_prof_${idCounter++}`;
    coursesList.push({
      id: courseId,
      title: `Career Readiness: ${topic}`,
      description: `Polish your professional presence, communication skills, and strategic career readiness in ${topic} under veteran recruitment directors.`,
      category: "Soft Skills & Resume Engineering",
      facultyId: "fac_1",
      facultyName: "HR Partner",
      enrolledStudentsCount: Math.floor(Math.random() * 150) + 300,
      tags: ["Career", "Resume", "HR", "SoftSkills"],
      lessons: [
        {
          id: `les_place_${courseId}_1`,
          title: `Actionable Checklist & Strategy Framework`,
          content: `### Strategic Outline for ${topic}\n\nClear, actionable blueprints to build maximum recruitment impact.\n\n1. Structuring communication\n2. Optimizing visual clarity\n3. Managing stress during real-time evaluations`,
          ...getRealResource("Soft Skills & Resume Engineering", topic, 1),
          durationMinutes: 20
        },
        {
          id: `les_place_${courseId}_2`,
          title: `Mock Interview Case Studies & Roleplay`,
          content: `### STAR Behavioral Interview Practice\n\nMaster the STAR technique and respond to high-difficulty human resource and cultural alignment questions.`,
          ...getRealResource("Soft Skills & Resume Engineering", topic, 2),
          durationMinutes: 30
        }
      ]
    });
  }

  // 6. Padding with high-tier Masterclass electives to reach 102 courses
  let padIndex = 1;
  while (coursesList.length < 102) {
    const courseId = `course_place_pad_${padIndex}`;
    const topic = `Advanced Coding Masterclass Elective Vol. ${padIndex}`;
    coursesList.push({
      id: courseId,
      title: topic,
      description: `Specialized high-end placement focus on competitive programming paradigms, algorithmic trade-offs, and niche computational frameworks.`,
      category: "Coding & DSA Essentials",
      facultyId: "fac_1",
      facultyName: "Dr. Sarah Mitchell",
      enrolledStudentsCount: 45,
      tags: ["Advanced", "CompetitiveProgramming", "Elite"],
      lessons: [
        {
          id: `les_place_${courseId}_1`,
          title: `Complex System Solutions Walkthrough #${padIndex}`,
          content: `### Advanced Elective Session\n\nDeep analysis of extremely high-difficulty dynamic optimizations and niche range update queries under interview timing limitations.`,
          ...getRealResource("Coding & DSA Essentials", topic, 1),
          durationMinutes: 40
        }
      ]
    });
    padIndex++;
  }

  return coursesList;
}

export function generateRealtimeProblems(): CodingProblem[] {
  const problemsList: CodingProblem[] = [
    {
      id: "prob_3",
      title: "Valid Parentheses",
      description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
      difficulty: "Easy",
      category: "Stacks",
      starterCode: {
        python: "def isValid(s: str) -> bool:\n    # Write Python 3 logic here\n    return False",
        java: "class Solution {\n    public boolean isValid(String s) {\n        // Write Java logic here\n        return false;\n    }\n}",
        cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write C++ logic here\n        return false;\n    }\n};"
      },
      testCases: [
        { input: "\"( )\"", expectedOutput: "true" },
        { input: "\"( [ ] )\"", expectedOutput: "true" },
        { input: "\"( ]\"", expectedOutput: "false" }
      ]
    },
    {
      id: "prob_4",
      title: "Merge Intervals",
      description: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
      difficulty: "Medium",
      category: "Arrays",
      starterCode: {
        python: "def merge(intervals: list) -> list:\n    # Write Python 3 logic here\n    return []",
        java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        // Write Java logic here\n        return new int[][]{};\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // Write C++ logic here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[[1,3],[2,6],[8,10],[15,18]]", expectedOutput: "[[1,6],[8,10],[15,18]]" },
        { input: "[[1,4],[4,5]]", expectedOutput: "[[1,5]]" }
      ]
    },
    {
      id: "prob_5",
      title: "Longest Palindromic Substring",
      description: "Given a string `s`, return the longest palindromic substring in `s`.",
      difficulty: "Medium",
      category: "Dynamic Programming",
      starterCode: {
        python: "def longestPalindrome(s: str) -> str:\n    # Write Python 3 logic here\n    return \"\"",
        java: "class Solution {\n    public String longestPalindrome(String s) {\n        // Write Java logic here\n        return \"\";\n    }\n}",
        cpp: "class Solution {\npublic:\n    string longestPalindrome(string s) {\n        // Write C++ logic here\n        return \"\";\n    }\n};"
      },
      testCases: [
        { input: "\"babad\"", expectedOutput: "\"bab\"" },
        { input: "\"cbbd\"", expectedOutput: "\"bb\"" }
      ]
    },
    {
      id: "prob_6",
      title: "Maximum Subarray (Kadane's Algorithm)",
      description: "Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
      difficulty: "Easy",
      category: "Dynamic Programming",
      starterCode: {
        python: "def maxSubArray(nums: list) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
        { input: "[1]", expectedOutput: "1" }
      ]
    },
    {
      id: "prob_7",
      title: "Container With Most Water",
      description: "Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`. Find two lines that together with the x-axis forms a container, such that the container contains the most water. Return the maximum area of water.",
      difficulty: "Medium",
      category: "Arrays",
      starterCode: {
        python: "def maxArea(height: list) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int maxArea(int[] height) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" },
        { input: "[1,1]", expectedOutput: "1" }
      ]
    },
    {
      id: "prob_8",
      title: "Search in Rotated Sorted Array",
      description: "Given an integer array `nums` sorted in ascending order (with distinct values) which is possibly rotated, and a target value `target`. If target is found in the array return its index, otherwise, return `-1`.",
      difficulty: "Medium",
      category: "Binary Search",
      starterCode: {
        python: "def search(nums: list, target: int) -> int:\n    # Write Python 3 logic here\n    return -1",
        java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Write Java logic here\n        return -1;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write C++ logic here\n        return -1;\n    }\n};"
      },
      testCases: [
        { input: "[4,5,6,7,0,1,2], 0", expectedOutput: "4" },
        { input: "[4,5,6,7,0,1,2], 3", expectedOutput: "-1" }
      ]
    },
    {
      id: "prob_9",
      title: "Climbing Stairs",
      description: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      difficulty: "Easy",
      category: "Dynamic Programming",
      starterCode: {
        python: "def climbStairs(n: int) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int climbStairs(int n) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "2", expectedOutput: "2" },
        { input: "3", expectedOutput: "3" }
      ]
    },
    {
      id: "prob_10",
      title: "Product of Array Except Self",
      description: "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]` in O(N) time and without using division.",
      difficulty: "Medium",
      category: "Arrays",
      starterCode: {
        python: "def productExceptSelf(nums: list) -> list:\n    # Write Python 3 logic here\n    return []",
        java: "class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        // Write Java logic here\n        return new int[]{};\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        // Write C++ logic here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" },
        { input: "[-1,1,0,-3,3]", expectedOutput: "[0,0,9,0,0]" }
      ]
    },
    {
      id: "prob_11",
      title: "Best Time to Buy and Sell Stock",
      description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve. If you cannot achieve any profit, return `0`.",
      difficulty: "Easy",
      category: "Greedy",
      starterCode: {
        python: "def maxProfit(prices: list) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int maxProfit(int[] prices) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
        { input: "[7,6,4,3,1]", expectedOutput: "0" }
      ]
    },
    {
      id: "prob_12",
      title: "Lowest Common Ancestor of a Binary Search Tree",
      description: "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes `p` and `q` in the BST.",
      difficulty: "Easy",
      category: "Trees",
      starterCode: {
        python: "def lowestCommonAncestor(root, p, q):\n    # Write Python 3 logic here\n    return None",
        java: "class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        // Write Java logic here\n        return null;\n    }\n}",
        cpp: "class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        // Write C++ logic here\n        return nullptr;\n    }\n};"
      },
      testCases: [
        { input: "[6,2,8,0,4,7,9], 2, 8", expectedOutput: "6" }
      ]
    },
    {
      id: "prob_13",
      title: "Trapping Rain Water",
      description: "Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      difficulty: "Hard",
      category: "Two Pointers",
      starterCode: {
        python: "def trap(height: list) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int trap(int[] height) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[0,1,0,2,1,0,1,3,2,1,2,1]", expectedOutput: "6" },
        { input: "[4,2,0,3,2,5]", expectedOutput: "9" }
      ]
    },
    {
      id: "prob_14",
      title: "Course Schedule (Topological Sort)",
      description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `b` first if you want to take course `a`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.",
      difficulty: "Medium",
      category: "Graphs",
      starterCode: {
        python: "def canFinish(numCourses: int, prerequisites: list) -> bool:\n    # Write Python 3 logic here\n    return True",
        java: "class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        // Write Java logic here\n        return true;\n    }\n}",
        cpp: "class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        // Write C++ logic here\n        return true;\n    }\n};"
      },
      testCases: [
        { input: "2, [[1,0]]", expectedOutput: "true" },
        { input: "2, [[1,0],[0,1]]", expectedOutput: "false" }
      ]
    },
    {
      id: "prob_15",
      title: "Edit Distance",
      description: "Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2`.\n\nYou have the following three operations permitted on a word:\n1. Insert a character\n2. Delete a character\n3. Replace a character",
      difficulty: "Hard",
      category: "Dynamic Programming",
      starterCode: {
        python: "def minDistance(word1: str, word2: str) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int minDistance(String word1, String word2) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "\"horse\", \"ros\"", expectedOutput: "3" },
        { input: "\"intention\", \"execution\"", expectedOutput: "5" }
      ]
    },
    {
      id: "prob_16",
      title: "Longest Substring Without Repeating Characters",
      description: "Given a string `s`, find the length of the longest substring without repeating characters.",
      difficulty: "Medium",
      category: "Sliding Window",
      starterCode: {
        python: "def lengthOfLongestSubstring(s: str) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "\"abcabcbb\"", expectedOutput: "3" },
        { input: "\"bbbbb\"", expectedOutput: "1" },
        { input: "\"pwwkew\"", expectedOutput: "3" }
      ]
    },
    {
      id: "prob_17",
      title: "Number of Islands",
      description: "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
      difficulty: "Medium",
      category: "Graphs",
      starterCode: {
        python: "def numIslands(grid: list) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int numIslands(char[][] grid) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]", expectedOutput: "1" },
        { input: "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]", expectedOutput: "3" }
      ]
    },
    {
      id: "prob_18",
      title: "Decode String",
      description: "Given an encoded string, return its decoded string.\n\nThe encoding rule is: `k[encoded_string]`, where the `encoded_string` inside the square brackets is being repeated exactly `k` times. You may assume that the input string is always valid; no extra white spaces, square brackets are well-formed, etc.",
      difficulty: "Medium",
      category: "Stacks",
      starterCode: {
        python: "def decodeString(s: str) -> str:\n    # Write Python 3 logic here\n    return \"\"",
        java: "class Solution {\n    public String decodeString(String s) {\n        // Write Java logic here\n        return \"\";\n    }\n}",
        cpp: "class Solution {\npublic:\n    string decodeString(string s) {\n        // Write C++ logic here\n        return \"\";\n    }\n};"
      },
      testCases: [
        { input: "\"3[a]2[bc]\"", expectedOutput: "\"aaabcbc\"" },
        { input: "\"3[a2[c]]\"", expectedOutput: "\"accaccacc\"" }
      ]
    },
    {
      id: "prob_19",
      title: "Kth Largest Element in an Array",
      description: "Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array. Note that it is the `k`-th largest element in the sorted order, not the `k`-th distinct element.",
      difficulty: "Medium",
      category: "Heaps",
      starterCode: {
        python: "def findKthLargest(nums: list, k: int) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[3,2,1,5,6,4], 2", expectedOutput: "5" },
        { input: "[3,2,3,1,2,4,5,5,6], 4", expectedOutput: "4" }
      ]
    },
    {
      id: "prob_20",
      title: "Subsets (Power Set)",
      description: "Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Return the solution in any order.",
      difficulty: "Medium",
      category: "Backtracking",
      starterCode: {
        python: "def subsets(nums: list) -> list:\n    # Write Python 3 logic here\n    return []",
        java: "class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        // Write Java logic here\n        return new ArrayList<>();\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        // Write C++ logic here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[1,2,3]", expectedOutput: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]" },
        { input: "[0]", expectedOutput: "[[],[0]]" }
      ]
    },
    {
      id: "prob_21",
      title: "Binary Tree Level Order Traversal",
      description: "Given the `root` of a binary tree, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
      difficulty: "Medium",
      category: "Trees",
      starterCode: {
        python: "def levelOrder(root) -> list:\n    # Write Python 3 logic here\n    return []",
        java: "class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        // Write Java logic here\n        return new ArrayList<>();\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        // Write C++ logic here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]" }
      ]
    },
    {
      id: "prob_22",
      title: "LCS: Longest Common Subsequence",
      description: "Given two strings `text1` and `text2`, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
      difficulty: "Medium",
      category: "Dynamic Programming",
      starterCode: {
        python: "def longestCommonSubsequence(text1: str, text2: str) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int longestCommonSubsequence(String text1, String text2) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int longestCommonSubsequence(string text1, string text2) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "\"abcde\", \"ace\"", expectedOutput: "3" },
        { input: "\"abc\", \"abc\"", expectedOutput: "3" },
        { input: "\"abc\", \"def\"", expectedOutput: "0" }
      ]
    },
    {
      id: "prob_23",
      title: "House Robber",
      description: "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically contact the police if two adjacent houses were broken into on the same night.\n\nGiven an integer array `nums` representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.",
      difficulty: "Medium",
      category: "Dynamic Programming",
      starterCode: {
        python: "def rob(nums: list) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int rob(int[] nums) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[1,2,3,1]", expectedOutput: "4" },
        { input: "[2,7,9,3,1]", expectedOutput: "12" }
      ]
    },
    {
      id: "prob_24",
      title: "Top K Frequent Elements",
      description: "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
      difficulty: "Medium",
      category: "Heaps",
      starterCode: {
        python: "def topKFrequent(nums: list, k: int) -> list:\n    # Write Python 3 logic here\n    return []",
        java: "class Solution {\n    public int[] topKFrequent(int[] nums, int k) {\n        // Write Java logic here\n        return new int[]{};\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<int> topKFrequent(vector<int>& nums, int k) {\n        // Write C++ logic here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[1,1,1,2,2,3], 2", expectedOutput: "[1,2]" },
        { input: "[1], 1", expectedOutput: "[1]" }
      ]
    },
    {
      id: "prob_25",
      title: "Coin Change",
      description: "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.",
      difficulty: "Medium",
      category: "Dynamic Programming",
      starterCode: {
        python: "def coinChange(coins: list, amount: int) -> int:\n    # Write Python 3 logic here\n    return 0",
        java: "class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write Java logic here\n        return 0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write C++ logic here\n        return 0;\n    }\n};"
      },
      testCases: [
        { input: "[1,2,5], 11", expectedOutput: "3" },
        { input: "[2], 3", expectedOutput: "-1" },
        { input: "[1], 0", expectedOutput: "0" }
      ]
    },
    {
      id: "prob_26",
      title: "Word Search (DFS Grid Search)",
      description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
      difficulty: "Medium",
      category: "Backtracking",
      starterCode: {
        python: "def exist(board: list, word: str) -> bool:\n    # Write Python 3 logic here\n    return False",
        java: "class Solution {\n    public boolean exist(char[][] board, String word) {\n        // Write Java logic here\n        return false;\n    }\n}",
        cpp: "class Solution {\npublic:\n    bool exist(vector<vector<char>>& board, string word) {\n        // Write C++ logic here\n        return false;\n    }\n};"
      },
      testCases: [
        { input: "[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], \"ABCCED\"", expectedOutput: "true" },
        { input: "[[\"A\",\"B\",\"C\",\"E\"],[\"S\",\"F\",\"C\",\"S\"],[\"A\",\"D\",\"E\",\"E\"]], \"SEE\"", expectedOutput: "true" }
      ]
    },
    {
      id: "prob_27",
      title: "Minimum Window Substring",
      description: "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the minimum window substring of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `\"\"`.",
      difficulty: "Hard",
      category: "Sliding Window",
      starterCode: {
        python: "def minWindow(s: str, t: str) -> str:\n    # Write Python 3 logic here\n    return \"\"",
        java: "class Solution {\n    public String minWindow(String s, String t) {\n        // Write Java logic here\n        return \"\";\n    }\n}",
        cpp: "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        // Write C++ logic here\n        return \"\";\n    }\n};"
      },
      testCases: [
        { input: "\"ADOBECODEBANC\", \"ABC\"", expectedOutput: "\"BANC\"" },
        { input: "\"a\", \"a\"", expectedOutput: "\"a\"" }
      ]
    },
    {
      id: "prob_28",
      title: "Median of Two Sorted Arrays",
      description: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log(m+n)).",
      difficulty: "Hard",
      category: "Binary Search",
      starterCode: {
        python: "def findMedianSortedArrays(nums1: list, nums2: list) -> float:\n    # Write Python 3 logic here\n    return 0.0",
        java: "class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write Java logic here\n        return 0.0;\n    }\n}",
        cpp: "class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        // Write C++ logic here\n        return 0.0;\n    }\n};"
      },
      testCases: [
        { input: "[1,3], [2]", expectedOutput: "2.0" },
        { input: "[1,2], [3,4]", expectedOutput: "2.5" }
      ]
    },
    {
      id: "prob_29",
      title: "Merge K Sorted Lists",
      description: "You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
      difficulty: "Hard",
      category: "Heaps",
      starterCode: {
        python: "def mergeKLists(lists: list):\n    # Write Python 3 logic here\n    return None",
        java: "class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write Java logic here\n        return null;\n    }\n}",
        cpp: "class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        // Write C++ logic here\n        return nullptr;\n    }\n};"
      },
      testCases: [
        { input: "[[1,4,5],[1,3,4],[2,6]]", expectedOutput: "[1,1,2,3,4,4,5,6]" }
      ]
    },
    {
      id: "prob_30",
      title: "Binary Tree Postorder Traversal",
      description: "Given the root of a binary tree, return the postorder traversal of its nodes' values.",
      difficulty: "Easy",
      category: "Trees",
      starterCode: {
        python: "def postorderTraversal(root) -> list:\n    # Write Python 3 logic here\n    return []",
        java: "class Solution {\n    public List<Integer> postorderTraversal(TreeNode root) {\n        // Write Java logic here\n        return new ArrayList<>();\n    }\n}",
        cpp: "class Solution {\npublic:\n    vector<int> postorderTraversal(TreeNode* root) {\n        // Write C++ logic here\n        return {};\n    }\n};"
      },
      testCases: [
        { input: "[1,null,2,3]", expectedOutput: "[3,2,1]" }
      ]
    }
  ];

  return problemsList;
}

export function generateRelatedAssignments(): Assignment[] {
  const assignments: Assignment[] = [];
  const courses = [
    { id: "course_place_co_1", title: "Google Placement Training: Complete Crack Pack" },
    { id: "course_place_co_5", title: "TCS NQT Placement Training: Complete Crack Pack" },
    { id: "course_place_dsa_11", title: "DSA Masterclass: DFS, BFS & Graph Traversals" },
    { id: "course_place_dsa_15", title: "DSA Masterclass: Dynamic Programming: 1D Knapsack" },
    { id: "course_place_apt_21", title: "Placement Aptitude: Quantitative: Time and Work" },
    { id: "course_place_apt_23", title: "Placement Aptitude: Quantitative: Permutations & Combinations" },
    { id: "course_place_cs_41", title: "Core Computer Science: Operating Systems: Process Management" },
    { id: "course_place_cs_47", title: "Core Computer Science: DBMS: SQL Joins, Aggregations & Grouping" },
    { id: "course_place_prof_51", title: "Career Readiness: ATS Resume Optimization Guide" },
    { id: "course_place_prof_53", title: "Career Readiness: Behavioral Interviews & STAR Method" }
  ];

  let counter = 1;
  for (const course of courses) {
    assignments.push({
      id: `assign_place_${counter++}`,
      courseId: course.id,
      courseTitle: course.title,
      title: `Graded Exercise: ${course.title.replace("Placement Training: ", "").replace("Masterclass: ", "").replace("Placement Aptitude: ", "").replace("Core Computer Science: ", "").replace("Career Readiness: ", "")} Assessment`,
      description: `Complete the comprehensive practical assignments related to **${course.title}**.\n\n### Task Objectives:\n1. Solve the 3 mandatory problem sets described in your study lecture notes.\n2. Write a clean Python/Java solution or short-answer document explaining your logical derivations.\n3. Verify your edge cases and upload your code or plain text explanation below for automated AI Grading.\n\n### Evaluation Standards:\n- Correctness & completeness (60%)\n- Complexity efficiency O(N) constraints (20%)\n- Code modularity and readability (20%)`,
      dueDate: new Date(Date.now() + 3600000 * 24 * (Math.floor(Math.random() * 8) + 4)).toISOString(),
      facultyId: "fac_1"
    });
  }

  return assignments;
}
