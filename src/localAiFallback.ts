// Local fallback simulation engine for EduReach AI

interface QuizQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface TutorResponse {
  text: string;
  quiz: QuizQuestion;
}

const LOCAL_QUIZ_DATABASE: Record<string, Quiz> = {
  "linked lists": {
    title: "Singly & Doubly Linked Lists Assessment",
    questions: [
      {
        question: "What is the time complexity to insert a new node at the beginning of a singly linked list?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctOptionIndex: 0,
        explanation: "Inserting at the beginning only requires adjusting the next pointer of the new node to point to the current head, then updating the head pointer. This takes constant time O(1)."
      },
      {
        question: "In a doubly linked list, what additional pointer does each node contain compared to a singly linked list?",
        options: ["Pointer to the next node", "Pointer to the previous node", "Pointer to the root node", "Pointer to the head node"],
        correctOptionIndex: 1,
        explanation: "A doubly linked list node contains two pointers: 'next' (points to the subsequent node) and 'prev' (points to the antecedent node)."
      },
      {
        question: "Which of the following is a key disadvantage of linked lists compared to arrays?",
        options: ["Static sizing", "Random access is O(1)", "Random access is O(n)", "Frequent memory reallocation during resizing"],
        correctOptionIndex: 2,
        explanation: "Arrays support random access in O(1) time. Linked lists must be traversed sequentially from the head node, which makes random access O(n)."
      }
    ]
  },
  "dynamic programming": {
    title: "Dynamic Programming & Optimization Concepts",
    questions: [
      {
        question: "What are the two key attributes that a problem must exhibit to be solved using Dynamic Programming?",
        options: [
          "Greedy choice property & optimal substructure",
          "Overlapping subproblems & optimal substructure",
          "Divide and conquer structure & recursive definition",
          "Linear scalability & subproblem dependencies"
        ],
        correctOptionIndex: 1,
        explanation: "Dynamic programming requires overlapping subproblems (recomputing the same sub-problems repeatedly) and optimal substructure (optimal solution to the global problem can be constructed from optimal solutions to subproblems)."
      },
      {
        question: "What is the difference between Memoization and Tabulation?",
        options: [
          "Memoization is top-down (recursive); Tabulation is bottom-up (iterative)",
          "Memoization is bottom-up (iterative); Tabulation is top-down (recursive)",
          "Memoization is O(N^2); Tabulation is O(N)",
          "Memoization uses no additional space; Tabulation uses an auxiliary array"
        ],
        correctOptionIndex: 0,
        explanation: "Memoization caches recursive results (top-down), while Tabulation fills a table/array sequentially from base cases upwards (bottom-up)."
      },
      {
        question: "In the 0/1 Knapsack problem, why does the greedy approach fail?",
        options: [
          "Items cannot be divided; we must take a full item or leave it",
          "The sorting of weight ratio takes O(N^2) complexity",
          "The knapsack capacity is constant",
          "The item values must be sorted descending"
        ],
        correctOptionIndex: 0,
        explanation: "Since items cannot be split, a greedy choice based on value-to-weight ratio may result in suboptimal space usage. DP searches the full combination space to find the absolute optimum."
      }
    ]
  },
  "neural networks": {
    title: "Neural Networks & Deep Learning Core",
    questions: [
      {
        question: "Which activation function is defined as f(x) = max(0, x)?",
        options: ["Sigmoid", "Tanh", "ReLU", "Softmax"],
        correctOptionIndex: 2,
        explanation: "ReLU (Rectified Linear Unit) outputs x if x is positive, and 0 otherwise, which corresponds mathematically to f(x) = max(0, x)."
      },
      {
        question: "What issue does the vanishing gradient problem cause during backpropagation?",
        options: [
          "Gradients grow exponentially, causing numerical instability",
          "Weights in early layers change very slowly, slowing or stalling learning",
          "The model overfits the training set rapidly",
          "The learning rate increases automatically"
        ],
        correctOptionIndex: 1,
        explanation: "As gradients are propagated backward, repeated multiplication of small fractional derivatives causes the gradient to vanish, meaning early layers learn extremely slowly."
      },
      {
        question: "What is the primary function of a Softmax activation layer in classification?",
        options: [
          "Normalize weights to prevent exploding values",
          "Convert raw outputs (logits) into a probability distribution over classes",
          "Add non-linear boundaries between neural weights",
          "Introduce dropouts to avoid network memorization"
        ],
        correctOptionIndex: 1,
        explanation: "Softmax scales outputs such that they lie in range [0, 1] and sum up to 1.0, representing a categorical probability distribution."
      }
    ]
  },
  "spring boot mvc": {
    title: "Spring Boot MVC Routing & Architecture",
    questions: [
      {
        question: "Which annotation combination is shorthand for @Controller and @ResponseBody?",
        options: ["@RestController", "@ServiceController", "@WebController", "@HttpController"],
        correctOptionIndex: 0,
        explanation: "@RestController is a convenience annotation that marks a class as a controller where every method returns a domain object directly as HTTP response body serialized to JSON/XML."
      },
      {
        question: "What is the purpose of Spring MVC's DispatcherServlet?",
        options: [
          "Manage application database connection pools",
          "Act as the Front Controller, routing incoming requests to handlers",
          "Compile Java classes into runtime bytecode",
          "Perform user authentication checks"
        ],
        correctOptionIndex: 1,
        explanation: "DispatcherServlet acts as the central coordinator for HTTP request processing, receiving requests and dispatching them to the correct Spring MVC Controllers."
      },
      {
        question: "How do you bind an HTTP request query parameter to a controller method argument?",
        options: ["@PathVariable", "@RequestParam", "@RequestBody", "@QueryAttribute"],
        correctOptionIndex: 1,
        explanation: "@RequestParam binds query parameters (e.g. ?name=Alex) to Java method variables. @PathVariable binds segment values directly within the URL route."
      }
    ]
  },
  "docker containers": {
    title: "Docker Containerization & Orchestration Basics",
    questions: [
      {
        question: "What is the difference between a Docker Image and a Docker Container?",
        options: [
          "An image is a read-only blueprint; a container is a runnable instance of that blueprint",
          "An image runs on Windows; a container runs on Linux",
          "Containers are compiled; images are interpreted",
          "Containers are saved to DockerHub; images reside only on local host filesystems"
        ],
        correctOptionIndex: 0,
        explanation: "A Docker Image is a static, read-only template with instructions for creating a container. A Container is the active, isolated process running that image."
      },
      {
        question: "Which Dockerfile instruction specifies the default command executed when a container starts?",
        options: ["RUN", "CMD", "ENV", "EXPOSE"],
        correctOptionIndex: 1,
        explanation: "CMD defines the default command and arguments to execute when the container is run. RUN is used during the image build step to install dependencies."
      },
      {
        question: "What Docker concept allows persistent file storage independent of a container's lifecycle?",
        options: ["Layers", "Volumes", "Port Mapping", "Networks"],
        correctOptionIndex: 1,
        explanation: "Docker Volumes bypass the copy-on-write filesystem of containers and write directly to the host filesystem, preserving data when containers are deleted."
      }
    ]
  },
  "operating systems": {
    title: "Operating Systems Core Concepts",
    questions: [
      {
        question: "What is the primary purpose of Virtual Memory in an Operating System?",
        options: [
          "To allow execution of processes larger than the physical RAM",
          "To increase CPU cache transfer rates",
          "To prevent unauthorized remote access to process threads",
          "To bypass context switching overheads entirely"
        ],
        correctOptionIndex: 0,
        explanation: "Virtual memory maps process addresses to physical RAM and swap storage, enabling the execution of programs that exceed physical memory size."
      },
      {
        question: "Which CPU scheduling algorithm is inherently non-preemptive?",
        options: [
          "First-Come, First-Served (FCFS)",
          "Round Robin (RR)",
          "Shortest Remaining Time First (SRTF)",
          "Preemptive Priority Scheduling"
        ],
        correctOptionIndex: 0,
        explanation: "FCFS schedules execution in order of arrival and runs them to completion or until they block, making it non-preemptive."
      },
      {
        question: "What condition is NOT required for a Deadlock state to occur?",
        options: [
          "Preemption of locked resources",
          "Mutual exclusion",
          "Hold and wait",
          "Circular dependency"
        ],
        correctOptionIndex: 0,
        explanation: "Coffman deadlock conditions require Mutual Exclusion, Hold & Wait, Circular Dependency, and No Preemption. Allowing resource preemption breaks deadlocks."
      }
    ]
  },
  "dbms": {
    title: "Database Management Systems (DBMS)",
    questions: [
      {
        question: "What does the 'I' in ACID properties of transactions stand for?",
        options: [
          "Isolation",
          "Consistency",
          "Integrity",
          "Iteration"
        ],
        correctOptionIndex: 0,
        explanation: "Isolation ensures concurrent execution of transactions leaves the database in the same state as if they ran sequentially."
      },
      {
        question: "Which database normal form requires removing transitive dependencies?",
        options: [
          "Third Normal Form (3NF)",
          "First Normal Form (1NF)",
          "Second Normal Form (2NF)",
          "Boyce-Codd Normal Form (BCNF)"
        ],
        correctOptionIndex: 0,
        explanation: "3NF requires a table to be in 2NF and have no non-key attribute transitively dependent on the primary key."
      },
      {
        question: "What is the primary difference between a clustered and non-clustered index?",
        options: [
          "A clustered index defines the physical storage order of rows; non-clustered does not",
          "Non-clustered is faster for large sequential table scans",
          "Clustered index has no root nodes",
          "A table can support up to 16 clustered indexes"
        ],
        correctOptionIndex: 0,
        explanation: "A clustered index sorts rows physically in the database, allowing only one clustered index per table."
      }
    ]
  },
  "computer networks": {
    title: "Computer Networks & Protocols",
    questions: [
      {
        question: "Which TCP/IP protocol suite layer handles packet routing across logical subnet boundaries?",
        options: [
          "Network Layer (IP)",
          "Transport Layer (TCP)",
          "Application Layer (HTTP)",
          "Physical Layer"
        ],
        correctOptionIndex: 0,
        explanation: "The Network Layer routes packets logically across networks using IP addresses."
      },
      {
        question: "What is a main difference between TCP and UDP?",
        options: [
          "TCP is connection-oriented and reliable; UDP is connectionless and lightweight",
          "UDP guarantees ordered delivery",
          "TCP is faster than UDP",
          "UDP is used exclusively for FTP"
        ],
        correctOptionIndex: 0,
        explanation: "TCP uses handshakes and sequence numbers to guarantee delivery, whereas UDP transmits immediately with minimal overhead."
      },
      {
        question: "Which TCP port is the default configuration for secure HTTPS connections?",
        options: [
          "443",
          "80",
          "22",
          "8080"
        ],
        correctOptionIndex: 0,
        explanation: "HTTPS defaults to port 443, while standard HTTP defaults to port 80."
      }
    ]
  },
  "java": {
    title: "Java Programming & JVM Fundamentals",
    questions: [
      {
        question: "Which JVM memory space stores objects and arrays allocated at runtime?",
        options: [
          "Heap Space",
          "Call Stack",
          "Method Area",
          "PC Registers"
        ],
        correctOptionIndex: 0,
        explanation: "Objects are allocated on the Heap space, which is shared across threads and managed by the Garbage Collector."
      },
      {
        question: "What does the 'volatile' keyword guarantee in Java multi-threaded execution?",
        options: [
          "Thread visibility of modifications across CPU registers/caches",
          "Re-entrant locks on class objects",
          "Atomicity of arithmetic expressions",
          "Automatic thread termination"
        ],
        correctOptionIndex: 0,
        explanation: "Volatile tells JVM to read/write the value directly from/to main memory, ensuring immediate visibility to other threads."
      },
      {
        question: "What is a characteristic of Checked Exceptions in Java?",
        options: [
          "They must be caught or declared in the method signature at compile time",
          "They inherit from RuntimeException",
          "They represent fatal JVM crashes",
          "They are bypassed by the Java Compiler"
        ],
        correctOptionIndex: 0,
        explanation: "Checked exceptions are verified by the compiler and must be declared via 'throws' or caught using try-catch blocks."
      }
    ]
  },
  "blockchain": {
    title: "Blockchain & Cryptography Fundamentals",
    questions: [
      {
        question: "What problem does Blockchain solve to prevent copying digital tokens?",
        options: [
          "Double-Spending problem",
          "Encryption speed limitations",
          "Server replication overhead",
          "Database connection timeouts"
        ],
        correctOptionIndex: 0,
        explanation: "Double-spending is the risk of spending a single digital token twice. Blockchains prevent this through consensus-validated chronological ledgers."
      },
      {
        question: "Which consensus mechanism operates by validators locking stakes of tokens rather than computing hashes?",
        options: [
          "Proof of Stake (PoS)",
          "Proof of Work (PoW)",
          "Proof of Authority (PoA)",
          "Proof of History (PoH)"
        ],
        correctOptionIndex: 0,
        explanation: "PoS validates blocks based on stake locked by participants, avoiding the computational overhead of PoW."
      },
      {
        question: "What is a Smart Contract in a blockchain network?",
        options: [
          "A self-executing contract program written directly in code on the blockchain ledger",
          "A digitally signed PDF document",
          "An AI negotiator on crypto exchanges",
          "A secure hardware wallet"
        ],
        correctOptionIndex: 0,
        explanation: "Smart contracts are decentralized programs that run exactly as written on the ledger once state triggers evaluate to true."
      }
    ]
  }
};

const DEFAULT_QUIZ: Quiz = {
  title: "General Assessment Challenge",
  questions: [
    {
      question: "Which data structure operates on a Last-In, First-Out (LIFO) access strategy?",
      options: ["Queue", "Stack", "Priority Queue", "Hash Table"],
      correctOptionIndex: 1,
      explanation: "A stack is a linear structure where insertions and deletions happen at the same end (the top), adhering to Last-In, First-Out (LIFO)."
    },
    {
      question: "What is the primary benefit of using a Hash Map?",
      options: [
        "Elements are always kept sorted",
        "Provides O(1) average-time complexity for search, insertion, and deletion",
        "Requires zero memory overhead",
        "Guarantees thread safety in concurrent environments"
      ],
      correctOptionIndex: 1,
      explanation: "Hash maps use hashing to map keys directly to buckets, enabling near-instant search, insertion, and lookup in O(1) average time."
    },
    {
      question: "Which sorting algorithm achieves O(n log n) worst-case time complexity and is stable?",
      options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Selection Sort"],
      correctOptionIndex: 2,
      explanation: "Merge Sort recursively divides the collection, sorting halves, and merging. It guarantees O(n log n) runtime in all cases and preserves ordering of equal elements (stable)."
    }
  ]
};

// Generates fallback AI Tutor responses
export function getLocalTutorResponse(prompt: string): TutorResponse {
  const rawPrompt = prompt.trim();

  // ── Extract actual user question from the wrapped frontend prompt ──
  // Frontend sends: 'Explain or solve the topic: "USER QUESTION" in English.\nStyle instructions: ...'
  let userQuestion = rawPrompt;
  const topicMatch = rawPrompt.match(/explain or solve the topic:\s*["""'](.+?)["""'](?:\s+in\s+\w+)?/i)
    || rawPrompt.match(/explain or solve the topic:\s*(.+?)(?:\s+in\s+english|\.\s*style|\n)/i);
  if (topicMatch) userQuestion = topicMatch[1].trim();

  userQuestion = userQuestion
    .replace(/style instructions?:.*$/is, "")
    .replace(/keep the explanations?.*/is, "")
    .replace(/\[PHOTO QUESTION RESOLUTION WORKSPACE\]/gi, "")
    .replace(/^["""']|["""']$/g, "")
    .trim();

  const normQ = userQuestion.toLowerCase().replace(/[\r\n\t]/g, " ").trim();
  let explanation = "";
  let quiz: QuizQuestion;

  // ── Special Mode: "Quiz me on [topic]" ──
  if (normQ.startsWith("quiz me")) {
    const qTopic = normQ.replace(/^quiz me\s*(on\s*|about\s*)?/i, "").trim() || "Computer Science";
    explanation = `## Quiz Time: ${qTopic}\n\nHere is a quick challenge! Think carefully before checking the answer. 📝`;
    quiz = { question: `Which statement best describes the core purpose of ${qTopic}?`, options: ["To minimize lines of code", "To solve specific problems efficiently with the right tools", "To avoid third-party libraries", "To make programs run everywhere"], correctOptionIndex: 1, explanation: `The primary goal of ${qTopic} is to solve specific problems efficiently — selecting the right approach, data structure, or algorithm.` };
    return { text: explanation, quiz };
  }

  // ── Special Mode: Roadmap / Learning Path ──
  if (normQ.includes("roadmap") || normQ.includes("learning path") || normQ.includes("how to learn") || normQ.startsWith("how do i become") || normQ.startsWith("how to become")) {
    const rTopic = userQuestion.replace(/roadmap\s*(for)?|how to learn|how do i become|learning path/gi, "").trim() || "Software Engineering";
    explanation = `## 🗺️ Learning Roadmap: ${rTopic}\n\n### Phase 1 — Foundations (Weeks 1–4)\n- Core concepts and terminology\n- Beginner tutorials and official docs\n- Build your first small project\n\n### Phase 2 — Core Skills (Weeks 5–10)\n- Deep-dive into essential topics\n- Daily practice problems (LeetCode, HackerRank)\n- Study real-world open-source projects\n\n### Phase 3 — Applied Projects (Weeks 11–16)\n- Build 2–3 portfolio projects\n- Contribute to open-source\n- Take a certification course\n\n### Phase 4 — Job Ready (Weeks 17–24)\n- System design and interview patterns\n- Mock interviews and feedback\n- Polish GitHub + LinkedIn profile\n\n💡 **Tip:** 30 minutes daily beats 5 hours once a week!`;
    quiz = { question: `What is the most effective strategy for learning ${rTopic}?`, options: ["Rush through everything fast", "Skip difficult phases", "Daily consistent practice with hands-on projects", "Only read theory"], correctOptionIndex: 2, explanation: "Consistent daily practice combined with hands-on project-building is the most effective way to retain new technical skills." };
    return { text: explanation, quiz };
  }

  // ── Special Mode: Mock Interview ──
  if (normQ.includes("interview me") || normQ.includes("mock interview") || normQ.startsWith("ask me questions")) {
    explanation = `## 🎯 Mock Interview — Let's Begin!\n\nI am your interviewer now. Take your time and type your answers. 🎤\n\n---\n\n**Q1 (Introduction):**\nTell me about yourself — your background, skills, and what you are currently working on.\n\n---\n\n**Q2 (Technical):**\nExplain the difference between a Stack and a Queue. When would you use each?\n\n---\n\n**Q3 (Problem Solving):**\nGiven an array of integers, how would you find two numbers that sum to a target value? Walk me through your approach and state the time complexity.\n\n---\n\n*Type your answers and I will provide feedback and improvement suggestions!* 💼`;
    quiz = { question: "In a technical interview, what should you do FIRST when given a coding problem?", options: ["Start coding immediately", "Clarify requirements and discuss your approach before coding", "Ask for solution hints", "Write the most complex solution to impress"], correctOptionIndex: 1, explanation: "Always clarify requirements and walk through your approach first. Interviewers evaluate your thinking process, not just the final code." };
    return { text: explanation, quiz };
  }

  // Detect simple vs advanced mode flags
  const isSimple = normQ.includes("explain simply") || normQ.includes("in simple") || normQ.includes("for beginners") || normQ.includes("eli5");
  const isAdvanced = normQ.includes("advanced") || normQ.includes("in depth") || normQ.includes("deep dive");

  // Clean up for topic matching — strip filler phrases
  const normTopic = normQ
    .replace(/explain simply|for beginners|in simple words|advanced mode|in depth|deep dive|tell me about|tell general about|what is|what are|how does|how do|teach me about|explain|describe|define/gi, "")
    .replace(/\?/g, "").trim() || userQuestion;

  let topicName = userQuestion;
  let quiz2: QuizQuestion | undefined;


  // 1. Simple Greetings & General talk
  if (normTopic === "hi" || normTopic === "hello" || normTopic === "hey" || normTopic === "greetings" || normTopic === "yo") {
    explanation = `Hello! I am your AI Personal Study Tutor. 😊

How is your day going? What is on your mind today? Are we exploring a new coding concept or debugging some code? 

Let me know what topic you'd like to explore, and we'll dive right in! 🚀`;

    quiz = {
      question: "Which of the following is the best way to utilize your AI Tutor?",
      options: [
        "Ask for conceptual explanations of algorithms",
        "Request detailed code implementations",
        "Upload a question screenshot for visual explanation",
        "All of the above"
      ],
      correctOptionIndex: 3,
      explanation: "You can type questions, request code implementations, or upload snapshot attachments to get visual assistance."
    };
    return { text: explanation, quiz };
  }

  // 2. Specific CS Topics checks (from our local pre-seeded database)
  if (normTopic.includes("binary search tree") || normTopic.includes("bst")) {
    topicName = "Binary Search Tree (BST)";
    explanation = `### 1. Core Definition
A **Binary Search Tree (BST)** is a node-based binary tree data structure which has the following properties:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- The left and right subtrees must each also be a binary search tree.

### 2. Textual ASCII Tree Model
\`\`\`
       [8] (Root)
      /   \\
    [3]   [10]
   /   \\      \\
 [1]   [6]    [14]
      /   \\   /
    [4]   [7] [13]
\`\`\`

### 3. Annotated Code Block (Python)
\`\`\`python
class Node:
    def __init__(self, key):
        self.left = None
        self.right = None
        self.val = key

def insert(root, key):
    # If the tree is empty, return a new node
    if root is None:
        return Node(key)
    
    # Otherwise, recur down the tree
    if key < root.val:
        root.left = insert(root.left, key)
    else:
        root.right = insert(root.right, key)
        
    return root
\`\`\`
*Average Search/Insertion Time Complexity: O(log N)*`;
    
    quiz = {
      question: "Which traversal of a Binary Search Tree visits nodes in ascending sorted order?",
      options: ["Pre-order Traversal", "In-order Traversal", "Post-order Traversal", "Level-order Traversal"],
      correctOptionIndex: 1,
      explanation: "In-order traversal visits (Left, Root, Right). Since all values left are smaller and right are larger, in-order yields keys in sorted order."
    };
    return { text: explanation, quiz };
  }

  if (normTopic.includes("recursion") || normTopic.includes("recursive")) {
    topicName = "Recursion & Tail Recursion";
    explanation = `### 1. Core Definition
**Recursion** is a programming method where a function solves a problem by calling itself.
**Tail Recursion** occurs when the recursive call is the *absolute final operation* of the function. No operations (like addition or multiplication) occur after the recursion returns. This allows compilers to optimize stack frames using Tail Call Optimization (TCO).

### 2. Stack Frame Visual comparison
\`\`\`
Non-Tail (Factorial 3):             Tail Factorial (Accumulator):
[fact(3)] -> 3 * fact(2)            [fact_tail(3, 1)]
  [fact(2)] -> 2 * fact(1)          [fact_tail(2, 3)] (Stack frame replaced!)
    [fact(1)] -> 1                  [fact_tail(1, 6)]
      (Returns bubble back up)      (Directly returns 6)
\`\`\`

### 3. Annotated Code Block (Java)
\`\`\`java
public class RecursionDemo {
    // Non-tail recursive factorial
    public static int factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1); // Multiplication happens AFTER return!
    }

    // Tail-recursive factorial using accumulator
    public static int tailFactorial(int n, int accumulator) {
        if (n <= 1) return accumulator;
        return tailFactorial(n - 1, n * accumulator); // Clean tail call
    }
}
\`\`\`
*Space Complexity: O(1) for Tail Call Optimization (TCO), compared to O(N) for standard recursion.*`;

    quiz = {
      question: "Why is tail recursion preferred in programming languages that support Tail Call Optimization (TCO)?",
      options: [
        "It runs on multiple CPUs simultaneously",
        "It avoids stack overflow errors by running in O(1) space",
        "It eliminates the need for base cases",
        "It compiles Java code to native machine instructions faster"
      ],
      correctOptionIndex: 1,
      explanation: "TCO reuses the current stack frame for recursive calls, avoiding stack memory growth and preventing stack overflow errors."
    };
    return { text: explanation, quiz };
  }

  if (normTopic.includes("jwt") || normTopic.includes("oauth2")) {
    topicName = "OAuth2 & JWT Security Flow";
    explanation = `### 1. Core Definition
**JSON Web Token (JWT)** is a compact URL-safe means of representing claims between two parties.
The token consists of three parts:
- **Header**: Signature algorithm type.
- **Payload**: Claims/user identification data.
- **Signature**: Generated by hashing header and payload with a secret key.

### 2. OAuth2 JWT Auth Flow Chart
\`\`\`
[ Client ] === 1. Sends Credentials ===> [ Auth Server ]
[ Client ] <== 2. Returns Signed JWT ==== [ Auth Server ]
  ||
  || (Attach JWT: 'Authorization: Bearer <token>')
  \\/
[ Resource API ] === 3. Decrypts/Validates Signature ===> Success (200 OK)
\`\`\`

### 3. Annotated Code Block (TypeScript Node)
\`\`\`typescript
import jwt from "jsonwebtoken";

// Generating signed JWT payload
const payload = { userId: "std_101", role: "STUDENT" };
const secret = "edu-secret-key-999";
const token = jwt.sign(payload, secret, { expiresIn: "1h" });

// Verifying JWT authorization header
try {
  const decoded = jwt.verify(token, secret);
  console.log("Access Granted. Payload:", decoded);
} catch (error) {
  console.error("Access Denied: Invalid signature");
}
\`\`\`
*Security Paradigm: JWTs are stateless. The resource API doesn't query a sessions database.*`;

    quiz = {
      question: "Which section of a JSON Web Token (JWT) contains user roles, claims, and expiration timestamps?",
      options: ["Header", "Signature", "Payload", "Salt Buffer"],
      correctOptionIndex: 2,
      explanation: "The payload section of the token stores user-specific claims (such as ID, roles, and 'exp' fields) in unencrypted JSON format."
    };
    return { text: explanation, quiz };
  }

  // 3. Broad topic knowledge base — natural conversational responses
  const broadTopics: Array<{ keys: string[]; text: string; quizQ: string; opts: string[]; correct: number; exp: string }> = [
    {
      keys: ["cloud computing", "cloud"],
      text: `Cloud computing is the delivery of computing services — including servers, storage, databases, networking, software, and analytics — over the internet ("the cloud") to offer faster innovation, flexible resources, and economies of scale.

There are three main service models:
- **IaaS (Infrastructure as a Service)** — You rent raw compute, storage, and networking. Example: AWS EC2, Google Compute Engine.
- **PaaS (Platform as a Service)** — You get a managed platform to deploy apps without worrying about the underlying infrastructure. Example: Heroku, Google App Engine.
- **SaaS (Software as a Service)** — You use software hosted entirely in the cloud. Example: Gmail, Zoom, Salesforce.

And three deployment models:
- **Public Cloud** — Shared infrastructure managed by providers like AWS, Azure, or GCP.
- **Private Cloud** — Dedicated infrastructure for one organization (higher security).
- **Hybrid Cloud** — A mix of both, allowing data and apps to move between them.

**Key benefits:** No upfront hardware cost, automatic scaling, global availability, and pay-as-you-go pricing.

**Real-world example:** When you stream a Netflix show, it's served from AWS cloud servers distributed globally — that's cloud computing in action.`,
      quizQ: "Which cloud service model gives you a ready-to-use platform to deploy code without managing servers?",
      opts: ["IaaS", "PaaS", "SaaS", "On-Premise"],
      correct: 1,
      exp: "PaaS (Platform as a Service) abstracts away the underlying infrastructure and gives developers a platform to build, test, and deploy applications directly."
    },
    {
      keys: ["operating system", "os", "kernel"],
      text: `An **Operating System (OS)** is the core software that manages computer hardware and provides services to application programs. It acts as an intermediary between the user and hardware.

**Core responsibilities:**
- **Process Management** — Scheduling CPU time for running programs using algorithms like Round Robin or Priority Scheduling.
- **Memory Management** — Allocating RAM to processes, managing virtual memory and paging.
- **File System** — Organizing data on disk (NTFS, ext4, APFS).
- **Device Drivers** — Abstracting hardware interfaces so apps don't need to handle them directly.
- **Security & Access Control** — Managing user permissions and system calls.

**Examples:** Windows 11, macOS Ventura, Linux (Ubuntu, Fedora), Android (Linux kernel-based).

**The Kernel** is the innermost layer of the OS — it runs in privileged mode and has direct access to hardware. Everything else (shell, GUI, apps) runs in user mode and communicates with the kernel via system calls.`,
      quizQ: "What is the role of the kernel in an operating system?",
      opts: ["It provides the graphical user interface", "It manages hardware resources and runs in privileged mode", "It handles only file storage operations", "It compiles source code to machine code"],
      correct: 1,
      exp: "The kernel is the core of the OS running in privileged (ring 0) mode, directly managing CPU, memory, and I/O resources on behalf of all user processes."
    },
    {
      keys: ["networking", "network", "tcp", "ip", "http", "dns"],
      text: `Computer networking is the practice of connecting computers to share data and resources.

**The OSI Model** (7 layers, top to bottom):
1. **Application** — HTTP, FTP, DNS (what the user interacts with)
2. **Presentation** — Encryption, data formatting (TLS/SSL)
3. **Session** — Managing connections (TCP sessions)
4. **Transport** — TCP (reliable, ordered) vs UDP (fast, unreliable)
5. **Network** — IP addressing and routing
6. **Data Link** — MAC addresses, Ethernet
7. **Physical** — Cables, Wi-Fi signals

**Key protocols:**
- **HTTP/HTTPS** — Web page requests and responses
- **TCP/IP** — Reliable data transmission across the internet
- **DNS** — Translates domain names (google.com) → IP addresses (142.250.x.x)
- **UDP** — Used for video streaming and gaming where speed > reliability

**How a web request works:**
You type google.com → DNS lookup → TCP connection (3-way handshake: SYN, SYN-ACK, ACK) → HTTP GET request → Server responds with HTML.`,
      quizQ: "Which transport protocol guarantees ordered, reliable delivery of packets?",
      opts: ["UDP", "IP", "TCP", "ARP"],
      correct: 2,
      exp: "TCP (Transmission Control Protocol) ensures reliable, ordered delivery using acknowledgements (ACKs) and retransmission of lost packets, unlike UDP which is faster but unreliable."
    },
    {
      keys: ["machine learning", "ml", "artificial intelligence", "ai", "deep learning", "neural network"],
      text: `**Machine Learning (ML)** is a branch of Artificial Intelligence where systems learn patterns from data and improve over time without being explicitly programmed.

**Three main types:**
- **Supervised Learning** — Train on labeled data (input → expected output). Examples: spam classification, image recognition.
- **Unsupervised Learning** — Find hidden patterns in unlabeled data. Examples: customer segmentation, anomaly detection.
- **Reinforcement Learning** — Agent learns by trial and error, receiving rewards/penalties. Examples: game AI, robot navigation.

**Deep Learning** uses multi-layer Neural Networks:
- Input Layer → Hidden Layers → Output Layer
- Each layer learns increasingly abstract features (edges → shapes → faces in image recognition).

**Popular algorithms:**
- Linear/Logistic Regression — simple predictions
- Decision Trees / Random Forests — interpretable classifiers
- CNNs (Convolutional Neural Networks) — image tasks
- Transformers (BERT, GPT) — language tasks

**Tools:** Python, TensorFlow, PyTorch, scikit-learn, HuggingFace.`,
      quizQ: "In supervised learning, what does the training data consist of?",
      opts: ["Only input features with no labels", "Input features paired with correct output labels", "Randomly generated data", "Reward signals from the environment"],
      correct: 1,
      exp: "Supervised learning trains on labeled datasets where each input example is paired with the correct output, allowing the model to learn the input-output mapping."
    },
    {
      keys: ["database", "sql", "nosql", "postgresql", "mysql", "mongodb"],
      text: `A **database** is an organized collection of structured data, typically stored and accessed electronically.

**SQL (Relational) Databases** store data in tables with rows and columns:
- Data has a fixed schema (structure defined upfront)
- Relationships enforced via foreign keys
- ACID transactions (Atomic, Consistent, Isolated, Durable)
- Examples: PostgreSQL, MySQL, SQLite, Oracle

**NoSQL Databases** are flexible and schema-less:
- **Document stores** (MongoDB) — JSON-like documents
- **Key-Value stores** (Redis) — fast in-memory lookups
- **Column stores** (Cassandra) — wide-column, great for analytics
- **Graph databases** (Neo4j) — nodes and edges for relationships

**When to use what:**
- SQL → Strong consistency, complex joins, financial data
- NoSQL → High scalability, unstructured data, real-time apps

**Indexing** is how databases speed up queries — instead of scanning every row (O(n)), an index lets the DB jump to the right location (O(log n) with B-trees).`,
      quizQ: "Which type of database is best suited for storing JSON-like documents without a fixed schema?",
      opts: ["Relational (SQL)", "Document NoSQL (MongoDB)", "Graph Database", "Key-Value Store"],
      correct: 1,
      exp: "Document-oriented NoSQL databases like MongoDB store data as flexible JSON/BSON documents, allowing different documents to have different fields — ideal for rapidly evolving data structures."
    },
    {
      keys: ["git", "version control", "github", "branching"],
      text: `**Git** is the most widely used distributed version control system. It tracks changes to source code over time, enabling collaboration among teams.

**Key concepts:**
- **Repository (Repo)** — The project folder tracked by Git
- **Commit** — A snapshot of your changes with a message
- **Branch** — A parallel line of development (main, feature/login, hotfix/bug)
- **Merge** — Combining changes from one branch into another
- **Pull Request (PR)** — A request to merge your branch into main, reviewed by teammates

**Common workflow (GitHub Flow):**
\`\`\`
main ──────────────────────────────── (production)
         \  feature/login branch
          ──── commit ──── commit ──── PR → merged
\`\`\`

**Essential commands:**
- \`git init\` — Initialize a new repo
- \`git clone <url>\` — Copy a remote repo locally
- \`git add . && git commit -m "message"\` — Stage and save changes
- \`git push origin main\` — Upload to remote
- \`git pull\` — Fetch and merge latest changes
- \`git merge feature/branch\` — Merge a branch`,
      quizQ: "What does a Git commit represent?",
      opts: ["Deleting a file from the repository", "A snapshot of all tracked changes at a point in time", "Syncing with a remote repository", "Creating a new branch"],
      correct: 1,
      exp: "A Git commit is a saved snapshot of the repository's tracked file changes at a specific moment, along with an author, timestamp, and descriptive message."
    },
    {
      keys: ["api", "rest", "restful", "graphql", "endpoint"],
      text: `An **API (Application Programming Interface)** is a contract between two pieces of software that defines how they can talk to each other.

**REST (Representational State Transfer)** is the most common API style for the web:
- Uses HTTP methods: **GET** (read), **POST** (create), **PUT/PATCH** (update), **DELETE** (remove)
- Resources are identified by URLs: \`GET /api/users/42\`
- Stateless — every request contains all needed information
- Responds with JSON (usually)

**Example REST flow:**
\`\`\`
Client               Server
  |--- GET /api/courses --->|   (fetch all courses)
  |<-- 200 OK, [JSON] ------|   (server responds)
  |--- POST /api/enroll --->|   (enroll in a course)
  |<-- 201 Created ---------|   (success)
\`\`\`

**GraphQL** (by Facebook/Meta) is an alternative:
- Single endpoint (\`/graphql\`)
- Client specifies exactly what data it needs — no over-fetching or under-fetching
- Great for complex, nested data like social feeds

**Status codes you must know:**
- 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error`,
      quizQ: "Which HTTP method is used to update an existing resource in a REST API?",
      opts: ["GET", "POST", "PUT or PATCH", "DELETE"],
      correct: 2,
      exp: "PUT replaces the entire resource; PATCH applies a partial update. Both are used for updating existing resources in RESTful APIs."
    },
    {
      keys: ["system design", "scalability", "load balancer", "microservices", "architecture"],
      text: `**System Design** is the process of defining the architecture, components, and data flow of a system to satisfy specified requirements at scale.

**Key concepts every engineer should know:**

**Scalability:**
- **Horizontal scaling** — Add more servers (scale out). Preferred for web apps.
- **Vertical scaling** — Add more power to one server (scale up). Has limits.

**Load Balancing** — Distributes incoming traffic across multiple servers.
- Algorithms: Round Robin, Least Connections, IP Hash

**Caching** — Store frequently accessed data in fast memory (Redis, Memcached) to avoid hitting the database every request.

**Database Design:**
- **Sharding** — Split database rows across multiple DB servers
- **Replication** — Copy data to multiple DB replicas for read scaling

**Microservices** — Break a monolithic app into small independent services (User Service, Payment Service, Notification Service) that communicate via APIs or message queues (Kafka, RabbitMQ).

**CAP Theorem:** In a distributed system, you can only guarantee two of three: Consistency, Availability, Partition Tolerance.`,
      quizQ: "What is horizontal scaling?",
      opts: ["Upgrading the CPU and RAM of a single server", "Adding more servers to distribute the load", "Compressing database tables", "Moving data to faster storage"],
      correct: 1,
      exp: "Horizontal scaling (scaling out) adds more machines/instances to handle increased load, as opposed to vertical scaling which upgrades the existing server's resources."
    },
    {
      keys: ["python", "flask", "django", "fastapi"],
      text: `**Python** is one of the most popular programming languages worldwide, known for its simplicity, readability, and massive ecosystem.

**Why Python?**
- Clean, readable syntax — great for beginners and experts alike
- Huge standard library + thousands of third-party packages (pip)
- Dominant in Data Science, Machine Learning, and Scripting
- Strong presence in web backend development

**Web Frameworks:**
- **Django** — Batteries-included full-stack framework. ORM, admin panel, auth built-in. Best for complex apps.
- **Flask** — Lightweight and flexible micro-framework. Ideal for small APIs and microservices.
- **FastAPI** — Modern, fast, async-first. Auto-generates API docs (Swagger). Great for high-performance APIs.

**Python strengths:**
- Data science: pandas, NumPy, matplotlib
- ML/AI: TensorFlow, PyTorch, scikit-learn
- Automation: Selenium, Beautiful Soup, Scrapy
- DevOps: Ansible, Fabric

**Quick syntax example:**
\`\`\`python
# List comprehension (Python's superpower)
scores = [88, 92, 45, 76, 99]
passed = [s for s in scores if s >= 60]  # [88, 92, 76, 99]
print(f"Passed: {len(passed)} students")
\`\`\``,
      quizQ: "Which Python web framework is best known for being fully-featured with a built-in ORM and admin panel?",
      opts: ["Flask", "FastAPI", "Django", "Tornado"],
      correct: 2,
      exp: "Django is a high-level, batteries-included framework with built-in ORM, authentication, admin interface, and URL routing — ideal for complex, data-driven web applications."
    },
    {
      keys: ["security", "cybersecurity", "encryption", "hashing", "ssl", "tls", "https"],
      text: `**Cybersecurity** is the practice of protecting systems, networks, and data from digital attacks.

**Encryption vs Hashing:**
- **Encryption** — Reversible transformation. Used to protect data in transit. Example: AES-256, RSA. TLS/HTTPS encrypts web traffic.
- **Hashing** — One-way function. Used to verify data integrity and store passwords. Example: bcrypt, SHA-256. You cannot reverse a hash.

**Common vulnerabilities (OWASP Top 10):**
- **SQL Injection** — Attacker inserts SQL commands in input fields
- **XSS (Cross-Site Scripting)** — Injecting malicious scripts into web pages
- **CSRF** — Tricking users into performing unintended actions
- **Broken Authentication** — Weak session management or password storage

**Authentication best practices:**
- Hash passwords with bcrypt (never store plain text)
- Use HTTPS everywhere (TLS 1.3)
- Implement JWT with expiry for stateless auth
- Enable Multi-Factor Authentication (MFA)
- Rate-limit login endpoints to prevent brute-force

**SSL/TLS** creates an encrypted tunnel between browser and server. The padlock icon in your browser means TLS is active.`,
      quizQ: "Why is bcrypt preferred over MD5 for storing passwords?",
      opts: ["MD5 is reversible; bcrypt is not", "bcrypt is intentionally slow and salted, making brute-force attacks harder", "bcrypt produces shorter hashes", "MD5 is deprecated by all browsers"],
      correct: 1,
      exp: "bcrypt is specifically designed for password hashing — it's slow (configurable cost factor) and automatically salts hashes, making rainbow table and brute-force attacks computationally expensive."
    },
  ];

  // Match broad topics
  for (const topic of broadTopics) {
    if (topic.keys.some(k => normTopic.includes(k))) {
      quiz = {
        question: topic.quizQ,
        options: topic.opts,
        correctOptionIndex: topic.correct,
        explanation: topic.exp
      };
      return { text: topic.text, quiz };
    }
  }

  // 4. Truly generic fallback — natural conversational response
  const topicWords = topicName.replace(/[?!.,]/g, "").trim();
  explanation = `Great question! Let me explain **${topicWords}** clearly.

${topicWords} is an important concept that comes up frequently in software engineering and computer science. Here's what you need to know:

**Core idea:** The goal of ${topicWords} is to solve a specific class of problems efficiently — whether that's organizing data, optimizing performance, managing resources, or improving developer productivity.

**How it's typically applied:**
- In back-end systems, it helps handle scale and reliability.
- In front-end development, it improves user experience and rendering performance.
- In system design, it's used to make architectural decisions that support long-term maintainability.

**Getting deeper:** If you'd like a detailed explanation with code examples, diagrams, or a step-by-step breakdown, just tell me more specifically what you'd like to know — for example, "explain how ${topicWords} works in Python" or "show me an example of ${topicWords} in system design". I'm here to help! 😊`;

  quiz = {
    question: `When learning about ${topicWords}, what is the most effective approach?`,
    options: [
      "Memorize definitions without understanding the context",
      "Understand the core problem it solves, then explore examples and code",
      "Skip fundamentals and jump straight to advanced topics",
      "Only read theoretical documentation"
    ],
    correctOptionIndex: 1,
    explanation: "The most effective learning strategy is to understand why a concept exists (the problem it solves), explore practical examples, and then practice with real code."
  };

  return { text: explanation, quiz };
}

function selectFallbackQuiz(topic: string): Quiz {
  const t = topic || "Computer Science";
  return {
    title: `AI generated Quiz: ${t}`,
    questions: [
      {
        question: `Which of the following is a primary design goal or core concept when architecting ${t}?`,
        options: [
          `Optimizing efficiency, scalability, and robust security in ${t} modules`,
          "Hardcoding execution states without validation",
          "Maximizing runtime latency and server overhead",
          "Decoupling active backups to increase failure rates"
        ],
        correctOptionIndex: 0,
        explanation: `The primary goal of ${t} is to optimize systems, allocate resources efficiently, and maintain high performance and security.`
      },
      {
        question: `In the context of ${t}, what is the main trade-off of introducing redundancy or replication?`,
        options: [
          "Increased reliability at the expense of additional storage/synchronization overhead",
          "Lower initial hardware cost with higher network latency",
          "Instant compilation with zero physical memory footprint",
          "Eliminating the need for consistency checking"
        ],
        correctOptionIndex: 0,
        explanation: `Replication in ${t} increases availability and durability, but demands coordination protocols and storage capacity.`
      },
      {
        question: `Which of the following practices is considered a standard best-practice when deploying solutions for ${t}?`,
        options: [
          "Thorough automated testing, optimization, and modular isolation of components",
          "Ignoring operational log records and debugging warnings",
          "Bypassing security reviews to accelerate production deployments",
          "Running all user processes with root privileges"
        ],
        correctOptionIndex: 0,
        explanation: `Modern implementations of ${t} emphasize secure configuration, modular decoupling, and continuous testing.`
      }
    ]
  };
}

// Generates fallback dynamic quizzes
export function getLocalQuiz(topic: string, count: number): Quiz {
  const norm = (topic || "").toLowerCase();
  
  let matchKey = "";
  for (const key of Object.keys(LOCAL_QUIZ_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      matchKey = key;
      break;
    }
  }

  const selected = matchKey ? LOCAL_QUIZ_DATABASE[matchKey] : selectFallbackQuiz(topic);
  
  // Format matching count requested
  const questionsList = [...selected.questions];
  const fallbackSource = matchKey ? LOCAL_QUIZ_DATABASE[matchKey] : selectFallbackQuiz(topic);
  while (questionsList.length < count) {
    // Add copies from selected base if too short
    questionsList.push(fallbackSource.questions[questionsList.length % fallbackSource.questions.length]);
  }
  
  const finalQuestions = questionsList.slice(0, count).map((q, idx) => ({
    id: `dq_q_${idx + 1}_` + Math.random().toString(36).substring(2, 5),
    question: q.question,
    options: [...q.options],
    correctOptionIndex: q.correctOptionIndex,
    explanation: q.explanation
  }));

  return {
    title: selected.title || `AI generated Quiz: ${topic || "Computer Science"}`,
    questions: finalQuestions
  };
}

// Fallback logic for coding submission feedback
export function getLocalCodingFeedback(problemTitle: string, code: string, language: string) {
  const size = code.length;
  let isCorrect = true;
  let feedback = "All test cases passed. Code compiles successfully and outputs the expected response.";
  let time = "O(N)";
  let space = "O(1)";

  if (size < 40) {
    isCorrect = false;
    feedback = "Submission failed: Your code is too short or incomplete. Please write a fully compiling function.";
  } else if (code.includes("for") && code.includes("HashMap") || code.includes("map")) {
    time = "O(N)";
    space = "O(N)";
    feedback = "Nice solution! Using a hash lookup reduces nested traversal iterations to O(N) time with O(N) space.";
  } else if (code.includes("for") && (code.match(/for/g) || []).length >= 2) {
    time = "O(N^2)";
    space = "O(1)";
    feedback = "Correct result! However, the nested loops increase time complexity to O(N^2). Consider hashing to search in linear time.";
  }

  return {
    isCorrect,
    timeComplexity: time,
    spaceComplexity: space,
    feedback
  };
}

// Support chatbot fallback helper
export function getLocalChatAssistantResponse(message: string, agent?: string): string {
  const norm = message.trim().toLowerCase();
  
  if (norm.length === 0) {
    return "I didn't catch that. Could you please type a question or topic? ☀️";
  }

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

  // Greetings
  if (norm === "hello" || norm === "hi" || norm === "hey" || norm === "yo" || norm === "greetings") {
    if (agent && agentNames[agent]) {
      return `Hello! 👋 I am your ${agentNames[agent]} in offline fallback mode. How can I help you with my specialized features today? 🚀`;
    }
    return "Hey there! 👋 I'm EduReach AI Assistant — your learning companion. I can explain concepts, write code, check resumes, or help with placement preparation. What can I do for you today? 🚀";
  }

  if (norm.includes("thank") || norm.includes("thanks") || norm.includes("awesome") || norm.includes("great")) {
    return "You're very welcome! That's what I'm here for 😊 Keep up the great work — consistency is the key to mastery. Let me know if there's anything else I can help you learn or build!";
  }

  if (norm.includes("how are you") || norm.includes("how's it going")) {
    return "I'm doing great and fully charged to help you today! 🔋 Whether it's algorithms, system design, a mock interview, or a career roadmap — I'm ready. What are we working on? 🧠";
  }

  if (norm.includes("who are you") || norm.includes("what are you") || norm.includes("what can you do")) {
    return "I'm EduReach AI — an advanced AI tutor, career mentor, and learning companion built to help students like you grow and succeed. I can:\n\n📚 Explain any subject or concept\n💻 Help with coding in any language\n🎯 Conduct mock interviews\n🗺️ Build personalized career roadmaps\n📝 Generate notes and quizzes\n🎤 Work as your voice-enabled study buddy\n\nJust ask me anything! 😊";
  }

  // Specific platform features
  if (norm.includes("badge")) {
    return "Academic badges represent your milestones! You can unlock badges like 'Fast Learner' (completing lessons quickly), 'Quiz Whiz' (high scores on quizzes), and 'Code Warrior' (solving coding tasks). Check them out on your Profile page! ⭐";
  }
  if (norm.includes("streak")) {
    return "Your daily streak shows how many consecutive days you've been active. You can keep it alive by completing a lesson, taking a quiz, or solving a coding problem today! Keep up the momentum! 🔥";
  }
  if (norm.includes("quiz") || norm.includes("assessment")) {
    return "Quizzes evaluate your progress. In the 'Quizzes' tab, you can take pre-built curriculum assessments or use the AI builder to construct custom, topic-specific quizzes with dynamic scoring. 🧠";
  }
  if (norm.includes("tutor") || norm.includes("explain")) {
    return "The AI Personal Tutor provides detailed explanations, textual ASCII visual models, and annotated code snippets. You can launch it from the 'AI Services' tab or dashboard recommendations! 🌙";
  }
  if (norm.includes("course") || norm.includes("lesson")) {
    return "Our courses cover Data Structures, Spring Boot Backend development, Deep Learning, and System Design. Go to the 'My Courses' tab to browse lessons, watch videos, and read outlines! 📘";
  }
  if (norm.includes("theme") || norm.includes("dark") || norm.includes("light")) {
    return "You can toggle the system theme (Light or Dark Mode) by clicking the Sun/Moon icon in the top toolbar header! It adapts all colors instantly. 🎨";
  }
  if (norm.includes("problem") || norm.includes("code") || norm.includes("coding")) {
    return "The 'Problem Hub' lets you solve coding problems, submit solutions for automatic code-complexity checks, and request hints. It's a great way to prepare for placement drives! 🚀";
  }
  if (norm.includes("resume") || norm.includes("pdf")) {
    return "Upload your resume in the 'Resources' tab (Resume Analyzer) to parse text, calculate ATS scores, and receive tailored improvement tips for top developer roles! 💼";
  }

  // Natural conversational topic responses for the chat assistant
  const chatTopics: Array<{ keys: string[]; response: string }> = [
    {
      keys: ["cloud computing", "cloud"],
      response: "Cloud computing is the delivery of servers, storage, databases, and software over the internet — instead of owning physical hardware. The three big service models are IaaS (raw infrastructure like AWS EC2), PaaS (managed platform like Heroku), and SaaS (ready-to-use software like Gmail). The major providers are AWS, Google Cloud, and Microsoft Azure. Key benefits are pay-as-you-go pricing, global reach, and automatic scaling. 🌐"
    },
    {
      keys: ["machine learning", "ml", "artificial intelligence", "ai", "deep learning"],
      response: "Machine Learning is a type of AI where systems learn patterns from data rather than following explicit rules. The three main paradigms are: Supervised Learning (labeled data — e.g., spam detection), Unsupervised Learning (unlabeled data — e.g., clustering customers), and Reinforcement Learning (reward-based — e.g., game AI). Deep Learning uses multi-layer neural networks and powers things like ChatGPT, image recognition, and voice assistants. Popular tools: Python, PyTorch, TensorFlow. 🤖"
    },
    {
      keys: ["docker", "container", "kubernetes"],
      response: "Docker is a containerization platform that packages your app and its dependencies into a lightweight, portable container. Unlike virtual machines, containers share the host OS kernel, making them much faster to start. A Docker image is the blueprint; a container is the running instance. Kubernetes (K8s) is an orchestration system that manages clusters of containers — handling scaling, load balancing, and self-healing. Together, Docker + Kubernetes power most modern cloud deployments. 🐳"
    },
    {
      keys: ["react", "angular", "vue", "frontend"],
      response: "React is a JavaScript library by Meta for building interactive UIs using reusable components. It uses a Virtual DOM to efficiently update only the parts of the page that changed. Key concepts: components, props (inputs), state (dynamic data), and hooks (useState, useEffect). React's ecosystem includes Next.js for server-side rendering and React Native for mobile apps. Angular (by Google) and Vue are popular alternatives. 🖥️"
    },
    {
      keys: ["spring boot", "java", "backend", "api"],
      response: "Spring Boot is a Java framework that simplifies building production-ready REST APIs and microservices. It auto-configures most things so you can focus on business logic. Key annotations: @RestController (defines API endpoints), @Service (business logic), @Repository (database layer), @Autowired (dependency injection). Combined with Spring Data JPA, you can talk to databases with almost no boilerplate SQL. 🍃"
    },
    {
      keys: ["binary search tree", "bst", "linked list", "data structure", "algorithm"],
      response: "Data structures are ways to organize data so it can be used efficiently. A Linked List connects nodes via pointers — O(1) insert at head, O(n) search. A Binary Search Tree keeps sorted data with O(log n) average search. A Hash Map gives O(1) average lookup. Choosing the right structure is everything: arrays for indexed access, queues for FIFO, stacks for LIFO, and graphs for relationship networks. 📊"
    },
    {
      keys: ["git", "github", "version control"],
      response: "Git is a distributed version control system that tracks code changes over time. Every developer has a full copy of the repository. Core workflow: `git add` (stage changes) → `git commit -m 'message'` (save snapshot) → `git push` (upload to remote). Branching lets multiple features be developed in parallel without interfering. Pull Requests on GitHub/GitLab are how teams review and merge code. 🔀"
    },
    {
      keys: ["sql", "database", "postgresql", "mysql", "mongodb", "nosql"],
      response: "SQL databases (PostgreSQL, MySQL) store data in structured tables with relationships enforced by foreign keys — great for complex queries and ACID transactions. NoSQL databases (MongoDB, Redis, Cassandra) are more flexible — MongoDB uses JSON-like documents, Redis is an in-memory key-value store for caching, Cassandra handles massive write loads. Rule of thumb: SQL for structured, relational data; NoSQL for scale and flexibility. 🗄️"
    },
    {
      keys: ["recursion", "recursive"],
      response: "Recursion is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs a base case (stopping condition) and a recursive case. Classic examples: factorial, Fibonacci, tree traversal, merge sort. The risk is stack overflow if recursion goes too deep. Tail recursion (where the recursive call is the last operation) can be optimized by some runtimes to avoid stack growth. 🔁"
    },
    {
      keys: ["security", "cybersecurity", "encryption", "hashing"],
      response: "Encryption transforms data so only authorized parties can read it (reversible — used for secure transmission). Hashing is a one-way transformation used to verify integrity and store passwords — you can't reverse a hash. Always use bcrypt for passwords, never MD5. HTTPS uses TLS to encrypt web traffic. Common vulnerabilities to protect against: SQL injection, XSS, CSRF, broken authentication. 🔐"
    },
    {
      keys: ["networking", "tcp", "http", "dns", "ip"],
      response: "Networking is how computers communicate. HTTP/HTTPS is the protocol for web requests. TCP ensures reliable, ordered delivery (used for web, email). UDP is faster but lossy (used for video streaming, gaming). DNS translates human-readable domain names to IP addresses. When you visit a website: DNS lookup → TCP 3-way handshake → HTTP request → server response. The OSI model has 7 layers from Physical (cables) to Application (HTTP). 🌐"
    },
    {
      keys: ["system design", "scalability", "microservices", "load balancer"],
      response: "System design is about building software that can handle scale, reliability, and growth. Key patterns: Load Balancers distribute traffic across servers. Caching (Redis) reduces database load. Sharding splits your database horizontally. Microservices break a monolith into independent deployable services. Message queues (Kafka, RabbitMQ) decouple services. The CAP Theorem says distributed systems can guarantee only 2 of: Consistency, Availability, Partition Tolerance. ⚙️"
    },
  ];

  for (const topic of chatTopics) {
    if (topic.keys.some(k => norm.includes(k))) {
      return topic.response;
    }
  }

  // Natural generic fallback for anything else
  const cleanQ = message.replace(/[?!]/g, "").trim();
  return `That's a great question about "${cleanQ}"! 😊

This is an area that spans multiple disciplines in software engineering and computer science. The key things to understand are:

- **What problem it solves** — Every tool, pattern, or concept exists to address a specific pain point.
- **How it's applied in real systems** — Look for it in popular open-source projects or production architectures.
- **Trade-offs** — Every design decision has pros and cons; understanding them is what separates good engineers from great ones.

For a deep-dive explanation with code examples and diagrams, head over to the **AI Tutor** in the AI Services tab — just type your question there and it'll give you a full breakdown! 🚀`;
}



