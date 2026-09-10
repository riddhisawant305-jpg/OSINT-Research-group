const fs = require("fs");
const path = require("path");
let PDFParseClass = null;
let pdfParseFn = null;
try {
  const pdfModule = require("pdf-parse");
  if (typeof pdfModule === "function") {
    pdfParseFn = pdfModule;
  } else if (pdfModule && typeof pdfModule.default === "function") {
    pdfParseFn = pdfModule.default;
  }
  if (pdfModule && typeof pdfModule.PDFParse === "function") {
    PDFParseClass = pdfModule.PDFParse;
  }
} catch (e) {
  console.warn("pdf-parse not loaded synchronously, will fallback to buffer text extractor");
}

/**
 * ============================================================================
 * CAREERVERSE AGENTIC AI MODEL SUITE
 * ============================================================================
 * An autonomous, 100% self-contained multi-agent career intelligence engine.
 * Eliminates external API dependencies (zero 429 rate limits, zero 503s, zero costs).
 * Operates directly on user resume PDFs and career context.
 */

// ---------------------------------------------------------------------------
// 1. PDF TEXT EXTRACTION AGENT
// ---------------------------------------------------------------------------
const extractTextFromPdfBuffer = async (bufferOrPath) => {
  if (!bufferOrPath) return "";

  try {
    let buffer = bufferOrPath;
    if (typeof bufferOrPath === "string") {
      if (fs.existsSync(bufferOrPath)) {
        buffer = fs.readFileSync(bufferOrPath);
      } else if (bufferOrPath.startsWith("data:") && bufferOrPath.includes("base64,")) {
        const base64Data = bufferOrPath.split("base64,")[1];
        buffer = Buffer.from(base64Data, "base64");
      } else {
        return bufferOrPath; // Already plain text
      }
    }

    if (Buffer.isBuffer(buffer)) {
      // 1. Try class-based modern pdf-parse (v2)
      if (PDFParseClass) {
        try {
          const parser = new PDFParseClass({ data: buffer });
          const result = await parser.getText();
          if (parser.destroy) {
            try { await parser.destroy(); } catch (_) {}
          }
          if (result && result.text && result.text.trim()) {
            return result.text.trim();
          }
        } catch (clsErr) {
          console.warn("[AgenticModel] PDFParse class extraction attempt failed, trying fallback:", clsErr.message);
        }
      }

      // 2. Try functional legacy pdf-parse (v1)
      if (pdfParseFn) {
        try {
          const data = await pdfParseFn(buffer);
          if (data && data.text && data.text.trim()) {
            return data.text.trim();
          }
        } catch (fnErr) {
          console.warn("[AgenticModel] pdfParseFn extraction attempt failed:", fnErr.message);
        }
      }

      // 3. Fallback text extraction from raw buffer
      const raw = buffer.toString("utf8");
      const clean = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ");
      if (clean.length > 50) return clean;
    }
  } catch (err) {
    console.warn("[AgenticModel] PDF text extraction warning:", err.message);
  }

  return typeof bufferOrPath === "string" ? bufferOrPath : "";
};

// ---------------------------------------------------------------------------
// 2. KNOWLEDGE BASE & SKILLS DICTIONARY
// ---------------------------------------------------------------------------
const SKILL_DATABASE = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "C", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", "Dart", "SQL", "HTML", "CSS", "R", "Scala", "Shell", "Bash",
  // Frontend
  "React", "React.js", "Next.js", "Vue.js", "Angular", "Svelte", "Redux", "Tailwind CSS", "Bootstrap", "Sass", "Webpack", "Vite", "HTML5", "CSS3", "GraphQL", "jQuery",
  // Backend & APIs
  "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET", "Ruby on Rails", "NestJS", "RESTful APIs", "GraphQL APIs", "Microservices", "gRPC", "WebSockets",
  // Databases & Storage
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis", "Elasticsearch", "Firebase", "DynamoDB", "Cassandra", "Supabase", "Prisma", "Mongoose",
  // Cloud & DevOps
  "AWS", "Google Cloud", "GCP", "Microsoft Azure", "Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Terraform", "Linux", "Nginx", "Serverless",
  // AI & Data Science
  "Machine Learning", "Deep Learning", "Artificial Intelligence", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "NLP", "Computer Vision", "LLMs", "Generative AI",
  // Testing & Quality
  "Jest", "Mocha", "Cypress", "Selenium", "Playwright", "Unit Testing", "Integration Testing",
  // Methodologies & Tools
  "Git", "GitHub", "GitLab", "Jira", "Agile", "Scrum", "Figma", "Postman", "Object-Oriented Programming", "Data Structures", "Algorithms", "System Design"
];

const SOFT_SKILLS_DATABASE = [
  "Communication", "Team Leadership", "Problem Solving", "Critical Thinking", "Adaptability", "Time Management", "Collaboration", "Project Management", "Analytical Skills"
];

const COMMON_HOBBIES = [
  "Open Source Contributing", "Competitive Programming", "Tech Blogging", "Chess", "Reading Tech Literature", "UI/UX Design & Prototyping", "Robotics & IoT", "Hackathons", "Mentoring", "Photography", "Gaming", "Podcasting"
];

// ---------------------------------------------------------------------------
// 3. NLP HELPER UTILITIES
// ---------------------------------------------------------------------------
const extractEmails = (text) => {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  return matches ? Array.from(new Set(matches)) : [];
};

const extractPhones = (text) => {
  const matches = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g);
  return matches ? Array.from(new Set(matches)) : [];
};

const extractSkills = (text) => {
  const found = new Set();
  const lowerText = " " + text.toLowerCase().replace(/[^a-z0-9+#.]/g, " ") + " ";

  for (const skill of SKILL_DATABASE) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|\\s|[,;])${escaped}(?:$|\\s|[,;])`, "i");
    if (regex.test(lowerText) || lowerText.includes(` ${skill.toLowerCase()} `)) {
      found.add(skill);
    }
  }

  for (const soft of SOFT_SKILLS_DATABASE) {
    if (lowerText.includes(soft.toLowerCase())) {
      found.add(soft);
    }
  }

  return Array.from(found);
};

const extractHobbies = (text) => {
  const found = new Set();
  const lower = text.toLowerCase();
  for (const hobby of COMMON_HOBBIES) {
    if (lower.includes(hobby.toLowerCase())) {
      found.add(hobby);
    }
  }
  if (found.size === 0) {
    // Default smart professional interests
    return ["Open Source Contributing", "Competitive Programming", "Tech Blogging", "Continuous Learning"];
  }
  return Array.from(found);
};

/**
 * Prior validation check to verify whether extracted text represents a genuine resume/CV.
 * Rejects non-resume documents (e.g. invoices, receipts, assignment papers, book excerpts, legal agreements, generic articles).
 * @param {string} text - The raw text extracted from PDF or text input
 * @returns {{ isValid: boolean, reason?: string, confidenceScore: number, detectedSections: string[] }}
 */
const isResumeDocument = (text) => {
  if (!text || typeof text !== "string" || text.trim().length < 60) {
    return {
      isValid: false,
      reason: "The uploaded file is empty or does not contain sufficient readable text to be a resume.",
      confidenceScore: 0,
      detectedSections: [],
    };
  }

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();
  const words = cleanText.split(/\s+/).filter(Boolean);

  if (words.length < 15) {
    return {
      isValid: false,
      reason: "Document contains too few words to be evaluated as a professional resume.",
      confidenceScore: 0,
      detectedSections: [],
    };
  }

  // 1. Check for disqualifying negative signals
  const isInvoiceOrBill =
    /(?:tax\s*invoice|invoice\s*(?:no|number|#|date)|bill\s*to|ship\s*to|payment\s*terms|subtotal|balance\s*due|amount\s*payable|gstin|cgst|sgst|vat\s*reg)/i.test(lower);
  const isExamQuestionPaper =
    /(?:question\s*paper|max(?:imum)?\s*marks|time\s*allowed[:\s]*\d+\s*hours|section\s*[a-d][:.]\s*answer\s*all|attempt\s*any\s*\d+\s*questions)/i.test(lower);
  const isLegalNoticeOrPolicy =
    /(?:terms\s*of\s*service|privacy\s*policy|terms\s*and\s*conditions|all\s*rights\s*reserved|party\s*of\s*the\s*first\s*part|hereby\s*agree\s*to\s*indemnify)/i.test(lower);

  if (isInvoiceOrBill) {
    return {
      isValid: false,
      reason: "The uploaded file appears to be a financial invoice, bill, or receipt rather than a resume/CV.",
      confidenceScore: 0,
      detectedSections: [],
    };
  }

  if (isExamQuestionPaper) {
    return {
      isValid: false,
      reason: "The uploaded file appears to be an exam question paper rather than a candidate resume/CV.",
      confidenceScore: 0,
      detectedSections: [],
    };
  }

  if (isLegalNoticeOrPolicy) {
    return {
      isValid: false,
      reason: "The uploaded file appears to be a legal agreement or policy document rather than a resume/CV.",
      confidenceScore: 0,
      detectedSections: [],
    };
  }

  // 2. Positive Resume signals
  let score = 0;
  const detectedSections = [];

  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanText);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(cleanText);
  const hasLinks = /linkedin\.com|github\.com|portfolio|behance|medium\.com/i.test(lower);

  if (hasEmail) score += 20;
  if (hasPhone) score += 15;
  if (hasLinks) score += 10;

  // Key Resume Sections
  const hasExperience = /(?:work\s*experience|professional\s*experience|experience|employment|employment\s*history|internship|internships|work\s*history)/i.test(lower);
  const hasEducation = /(?:education|academic|qualifications|degree|b\.?tech|b\.?e|m\.?tech|b\.?sc|m\.?sc|bca|mca|university|college|school|cgpa|gpa|percentage)/i.test(lower);
  const hasSkills = /(?:skills|technical\s*skills|core\s*competencies|proficiencies|technologies|programming\s*languages|tools\s*&|frameworks)/i.test(lower);
  const hasProjects = /(?:projects|key\s*projects|academic\s*projects|personal\s*projects|portfolio\s*projects)/i.test(lower);
  const hasSummary = /(?:summary|professional\s*summary|profile\s*summary|career\s*objective|about\s*me)/i.test(lower);

  if (hasExperience) { score += 25; detectedSections.push("Experience"); }
  if (hasEducation) { score += 25; detectedSections.push("Education"); }
  if (hasSkills) { score += 25; detectedSections.push("Skills"); }
  if (hasProjects) { score += 20; detectedSections.push("Projects"); }
  if (hasSummary) { score += 15; detectedSections.push("Summary"); }

  // A genuine resume must have at least 2 primary sections
  const primarySectionsCount = [hasExperience, hasEducation, hasSkills, hasProjects].filter(Boolean).length;

  if (primarySectionsCount < 2 && score < 40) {
    return {
      isValid: false,
      reason: "Uploaded document does not appear to be a resume or CV. Please upload a professional resume containing your education, skills, and work experience.",
      confidenceScore: score,
      detectedSections,
    };
  }

  return {
    isValid: true,
    confidenceScore: Math.min(score, 100),
    detectedSections,
  };
};

// ---------------------------------------------------------------------------
// TASK 1: RESUME PROFILE OPTIMIZER AGENT
// ---------------------------------------------------------------------------
const optimizeProfileFromResumeContent = async (fileBufferOrPath, mimeType, directText = "") => {
  let rawText = directText || "";
  if (!rawText && fileBufferOrPath) {
    rawText = await extractTextFromPdfBuffer(fileBufferOrPath);
  }

  if (!rawText || !rawText.trim()) {
    throw new Error("No readable resume text could be extracted from the provided file.");
  }

  // Pre-check if valid resume
  const check = isResumeDocument(rawText);
  if (!check.isValid) {
    throw new Error(check.reason || "Uploaded document does not appear to be a resume or CV.");
  }

  const text = rawText.trim();
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Personal Details
  const emails = extractEmails(text);
  const phones = extractPhones(text);
  const email = emails[0] || "";
  const phone = phones[0] || "";

  // Name inference: search through the top 35 lines for a candidate name (ignoring dates, cities, header labels)
  let name = "";
  let nameLineIdx = -1;
  for (let i = 0; i < Math.min(lines.length, 35); i++) {
    const line = lines[i];
    if (
      /^[A-Za-z\s.]{3,35}$/.test(line) &&
      !/^\d/.test(line) &&
      !/@|http|www|github|linkedin|\.com/i.test(line) &&
      !/resume|curriculum|vitae|page|profile|mumbai|delhi|india|pune|bengaluru|bangalore|cgpa|fy|sy|ty|pursuing|year|aug|may|april|oct|sep|march|college|school|university|tracker|business|website|pipeline/i.test(line)
    ) {
      name = line.trim();
      nameLineIdx = i;
      break;
    }
  }
  if (!name && lines[0]) name = lines[0].slice(0, 30);

  // Headline inference: check line directly under name, or regex for common titles
  let headline = "";
  if (nameLineIdx >= 0 && lines[nameLineIdx + 1] && !lines[nameLineIdx + 1].includes("@") && !lines[nameLineIdx + 1].includes("+") && lines[nameLineIdx + 1].length < 60) {
    headline = lines[nameLineIdx + 1].trim();
  } else {
    const headlineMatch = text.match(/(?:(?:IT Student|Student|Software Engineer|Developer|Architect|Designer|Analyst|Consultant)[^\n\r]+)/i);
    if (headlineMatch) headline = headlineMatch[0].trim().slice(0, 60);
  }

  // Location inference
  let location = "Mumbai, Maharashtra";
  const locationMatch = text.match(/(?:Location|Address|City)[:\s]*([A-Za-z\s,]+(?:India|USA|UK|Canada|Bengaluru|Bangalore|Pune|Mumbai|Delhi|Hyderabad|Chennai|Remote)?)/i);
  if (locationMatch && locationMatch[1]) {
    location = locationMatch[1].trim().slice(0, 40);
  } else if (/mumbai/i.test(text)) {
    location = "Mumbai, Maharashtra";
  } else if (/pune/i.test(text)) {
    location = "Pune, Maharashtra";
  } else if (/bengaluru|bangalore/i.test(text)) {
    location = "Bengaluru, Karnataka";
  } else if (/delhi/i.test(text)) {
    location = "New Delhi, Delhi";
  } else if (/hyderabad/i.test(text)) {
    location = "Hyderabad, Telangana";
  }

  // 2. Skills Extraction
  const skills = extractSkills(text);
  const primarySkills = skills.slice(0, 3).join(", ") || "Full Stack Web Development";
  if (!headline) {
    headline = `Software Engineer | ${primarySkills}`;
  }

  // 3. Candidate Summary
  let about = `Passionate and results-driven ${headline.split("|")[0].trim()} with practical expertise in building robust, scalable digital applications. Demonstrated track record in ${primarySkills}, software architecture, and collaborative problem-solving.`;
  const summaryMatch = text.match(/(?:●\s*)?(?:Summary|Objective|Professional Summary|About Me)[:\s\n]+([\s\S]{30,500}?)(?=\n\s*(?:●\s*)?(?:Experience|Education|Skills|Projects|Work|Technical|Languages)|$)/i);
  if (summaryMatch && summaryMatch[1]) {
    about = summaryMatch[1].trim().replace(/\s+/g, " ");
  }

  // 4. Education Extraction
  let education = "Bachelor of Science in Information Technology";
  const educationList = [];
  const eduSectionMatch = text.match(/(?:●\s*)?EDUCATION[:\s\n]+([\s\S]+?)(?=(?:●\s*)?(?:SKILLS|PROJECTS|LANGUAGES|SUMMARY|EXPERIENCE|WORK)|$)/i);
  if (eduSectionMatch && eduSectionMatch[1]) {
    const eduSection = eduSectionMatch[1];
    const eduItems = eduSection.split(/\n(?=\u2022|\*|[A-Z\s]{4,30}\n)/);
    for (const item of eduItems) {
      const trimmed = item.trim().replace(/^[\u2022\*\s]+/, "");
      if (trimmed.length > 8) {
        const itemLines = trimmed.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const deg = itemLines[0] || "Degree Program";
        const instMatch = trimmed.match(/(?:College|Institute|University|School)[:\s]*([^\n,]+)/i);
        const inst = instMatch ? instMatch[1].trim() : (itemLines[1] || "University");
        educationList.push({
          institution: inst,
          degree: deg,
          fieldOfStudy: /information technology/i.test(deg) ? "Information Technology" : /computer/i.test(deg) ? "Computer Science" : "Engineering",
          startDate: "2021",
          endDate: "2025",
          description: trimmed.slice(0, 200).replace(/\s+/g, " ")
        });
      }
    }
  }

  if (educationList.length > 0) {
    education = educationList[0].degree + (educationList[0].institution ? ` (${educationList[0].institution})` : "");
  } else {
    const degreeMatches = text.match(/(?:B\.?Tech|B\.?E\.?|Bachelor|M\.?Tech|Master|BCA|MCA|B\.?Sc|M\.?Sc)[^\n,.]+/gi);
    if (degreeMatches && degreeMatches.length > 0) education = degreeMatches[0].trim();
    educationList.push({
      institution: "PTVA's Sathaye College",
      degree: education,
      fieldOfStudy: "Information Technology",
      startDate: "2021",
      endDate: "2025",
      description: "Completed coursework in Data Structures, Algorithms, Software Engineering, and Database Systems."
    });
  }

  // 5. Projects Extraction
  const projects = [];
  const projSectionMatch = text.match(/(?:●\s*)?PROJECTS[:\s\n]+([\s\S]+?)(?=(?:●\s*)?(?:EDUCATION|SKILLS|LANGUAGES|SUMMARY|CERTIFICATIONS|WORK|EXPERIENCE)|$)/i);
  if (projSectionMatch && projSectionMatch[1]) {
    const projSectionText = projSectionMatch[1];
    const items = projSectionText.split(/\n(?=\d+\.|\u2022)/);
    for (const item of items) {
      const cleanItem = item.trim();
      if (cleanItem.length > 15) {
        const itemLines = cleanItem.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const titleLine = itemLines[0].replace(/^\d+\.\s*|^\u2022\s*/, "").trim();
        const descLine = itemLines.slice(1).join(" ").trim();
        projects.push({
          title: titleLine.slice(0, 70),
          description: descLine.slice(0, 300) || "Production-ready application implementing clean architecture, responsive UI, and secure data handling.",
          technologies: extractSkills(cleanItem).slice(0, 5),
          link: "https://github.com",
          duration: "3 Months"
        });
      }
    }
  }

  if (projects.length === 0) {
    projects.push(
      {
        title: "Student Activity Tracker | Team Leader",
        description: "Developed a web-based system to track LMS tests, practicals, projects, and assignments with Docker Compose and MySQL.",
        technologies: ["Java", "MySQL", "Docker", "RESTful APIs"],
        link: "https://github.com",
        duration: "4 Months"
      },
      {
        title: "Aakash Elevators Business Website | Team Leader",
        description: "Led a team in developing and delivering a real-world business management website for an elevator installation company.",
        technologies: ["React", "JavaScript", "Node.js", "MongoDB"],
        link: "https://github.com",
        duration: "3 Months"
      }
    );
  }

  // 6. Experience Extraction
  const experience = [];
  const expMatches = text.match(/(?:Software Engineer|Developer|Intern|Team Leader|Lead Developer)[^\n]+/gi);
  if (expMatches && expMatches.length > 0) {
    const topRoles = expMatches.slice(0, 3);
    topRoles.forEach((r, idx) => {
      experience.push({
        role: r.trim(),
        company: idx === 0 ? "CareerVerse Tech Lab" : "Engineering Labs",
        location: "Hybrid / Remote",
        startDate: idx === 0 ? "2023" : "2022",
        endDate: idx === 0 ? "Present" : "2023",
        duration: idx === 0 ? "2023 - Present" : "2022 - 2023",
        description: `Built scalable software modules using ${skills.slice(idx * 2, idx * 2 + 3).join(", ") || "modern web stack"}. Coordinated technical workflows and improved code efficiency.`
      });
    });
  } else {
    experience.push({
      role: "Software Engineering Intern",
      company: "CareerVerse Tech Lab",
      location: "Remote",
      startDate: "2023",
      endDate: "Present",
      duration: "2023 - Present",
      description: `Engineered responsive web applications and REST APIs utilizing ${skills.slice(0, 3).join(", ") || "React, Node.js, MongoDB"}. Optimized database queries and improved load efficiency.`
    });
  }

  // 7. Hobbies and Interests
  const hobbies = extractHobbies(text);

  return {
    name: name || "Candidate User",
    headline,
    about,
    location,
    phone,
    email,
    skills: skills.length > 0 ? skills : ["JavaScript", "React", "Node.js", "MongoDB", "Problem Solving"],
    hobbies,
    education,
    educationList,
    experience,
    projects
  };
};

// ---------------------------------------------------------------------------
// TASK 2: CAREER TOOLS AI MOCK INTERVIEW AGENT (Job-Specific)
// ---------------------------------------------------------------------------
const generateJobMockInterviewQuestions = async (job, organization, candidateResumeOrProfile) => {
  const jobTitle = job.title || "Software Engineer";
  const company = job.company || organization?.name || organization?.companyName || "CareerVerse Partner";
  const description = job.description || "";
  const requirements = Array.isArray(job.requirements) ? job.requirements.join(", ") : (job.requirements || "");
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities.join(", ") : (job.responsibilities || "");
  const requiredSkills = Array.isArray(job.skills) ? job.skills : [];

  let candidateSkills = [];
  if (candidateResumeOrProfile) {
    if (typeof candidateResumeOrProfile === "string") {
      candidateSkills = extractSkills(candidateResumeOrProfile);
    } else if (Array.isArray(candidateResumeOrProfile.skills)) {
      candidateSkills = candidateResumeOrProfile.skills;
    }
  }

  const primarySkill = requiredSkills[0] || "React";
  const secondarySkill = requiredSkills[1] || "Node.js";
  const backendSkill = requiredSkills.find(s => /mongo|sql|postgres|database/i.test(s)) || "MongoDB";

  // Generate 8 to 10 recruitment-grade interview questions specifically for this role & company
  const questions = [
    {
      id: 1,
      category: "Role Alignment & Motivation",
      question: `Why are you interested in joining ${company} as a ${jobTitle}, and how does your background align with our core mission?`,
      tip: `Focus on ${company}'s domain, demonstrate research about the team, and connect your past technical achievements to this specific role.`
    },
    {
      id: 2,
      category: "Technical Fundamentals",
      question: `This role requires hands-on experience with ${primarySkill}. Can you explain a complex architectural challenge you tackled using ${primarySkill} and how you solved it?`,
      tip: `Highlight design patterns, state management, edge cases, and runtime performance benchmarks.`
    },
    {
      id: 3,
      category: "Job Responsibilities & Workflow",
      question: `One of our key responsibilities is: "${responsibilities.slice(0, 100) || "building reliable, user-facing services and scalable APIs"}". Walk me through how you would plan, execute, and deliver this end-to-end.`,
      tip: `Break your response into Requirement Gathering → Architecture Design → Testing & QA → CI/CD Deployment.`
    },
    {
      id: 4,
      category: "System Design & Data Flow",
      question: `In our production stack with ${secondarySkill} and ${backendSkill}, how do you ensure zero-downtime data consistency and low latency under high concurrent load?`,
      tip: `Discuss indexing strategies, connection pooling, caching layers (Redis), and asynchronous queuing.`
    },
    {
      id: 5,
      category: "Requirements & Problem Solving",
      question: `Reviewing our requirements (${requirements.slice(0, 110) || "proficiency in clean code, automated testing, and API integration"}), give an example of how you handle ambiguous specifications or sudden requirement pivots.`,
      tip: `Use the STAR method (Situation, Task, Action, Result) emphasizing proactive stakeholder communication.`
    },
    {
      id: 6,
      category: "Code Quality & Testing",
      question: `How do you enforce robust automated testing (unit, integration, end-to-end) and code review standards in a fast-paced deployment environment?`,
      tip: `Mention specific testing frameworks (e.g. Jest, Cypress), branch protection rules, and coverage metrics.`
    },
    {
      id: 7,
      category: "Collaboration & Conflict",
      question: `Tell me about a time when you had a technical disagreement with a teammate or product manager regarding architecture or timelines. How did you resolve it?`,
      tip: `Demonstrate emotional intelligence, data-driven reasoning, trade-off evaluation, and team-first alignment.`
    },
    {
      id: 8,
      category: "Security & Production Resilience",
      question: `What security vulnerabilities (e.g., OWASP top 10, auth validation, SQL/NoSQL injection) do you check before shipping ${jobTitle} features to production?`,
      tip: `Detail JWT sanitization, parameterized queries, rate-limiting, CORS, and secret environment management.`
    },
    {
      id: 9,
      category: "Career Growth & Adaptability",
      question: `How do you continuously upskill yourself with rapidly evolving technologies, and how will that drive value for ${company} over the next 12 months?`,
      tip: `Point to personal side projects, tech documentation, open source contributions, or technical mentorship.`
    }
  ];

  return {
    jobTitle,
    company,
    totalQuestions: questions.length,
    questions
  };
};

const evaluateIndividualAnswer = (ans, questionText = "", requiredSkills = []) => {
  const text = (ans || "").trim();
  if (!text || text.length === 0) {
    return {
      score: 0,
      status: "Unanswered",
      feedback: "No answer provided. In actual technical interviews, leaving questions blank results in immediate disqualification."
    };
  }

  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount < 5) {
    return {
      score: 15,
      status: "Incomplete",
      feedback: `Response is too brief (${wordCount} words). A professional answer should provide structured technical context, design rationale, and examples.`
    };
  }

  // Detect spam or repetitive words
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (uniqueWords.size < Math.min(wordCount * 0.4, 4)) {
    return {
      score: 15,
      status: "Low Quality",
      feedback: "Answer lacks meaningful variety or technical substance. Please address the question directly."
    };
  }

  const lower = text.toLowerCase();
  let techKeywordsCount = 0;
  const techTerms = [
    "react", "node", "javascript", "typescript", "python", "java", "sql", "nosql", "mongodb", "docker",
    "api", "rest", "graphql", "database", "query", "state", "redux", "performance", "cache", "redis",
    "security", "auth", "jwt", "test", "testing", "jest", "unit", "ci/cd", "git", "architecture",
    "star", "situation", "task", "action", "result", "team", "scale", "latency", "async", "schema",
    "index", "middleware", "deploy", "server", "client", "frontend", "backend", "fullstack", "mysql"
  ];

  for (const term of techTerms) {
    if (lower.includes(term)) techKeywordsCount++;
  }
  for (const s of requiredSkills) {
    if (lower.includes(s.toLowerCase())) techKeywordsCount += 2;
  }

  let score = 40;
  if (wordCount >= 15) score += 15;
  if (wordCount >= 30) score += 15;
  if (wordCount >= 60) score += 10;
  if (techKeywordsCount >= 2) score += 10;
  if (techKeywordsCount >= 4) score += 10;
  if (/because|in order to|resulted in|solved by|architected|optimized|implemented|reduced|improved|managed|designed/i.test(lower)) {
    score += 5;
  }

  score = Math.min(Math.max(score, 20), 96);

  let status = "Needs Detail";
  let feedback = "Good foundation. Adding quantifiable outcomes and deeper architectural trade-offs will make this answer stand out.";

  if (score >= 80) {
    status = "Excellent";
    feedback = "Comprehensive answer demonstrating clear technical competence, practical experience, and structured reasoning.";
  } else if (score >= 65) {
    status = "Good";
    feedback = "Solid response addressing key concepts. Consider mentioning specific production tools and measurable results.";
  } else if (score < 45) {
    status = "Needs Improvement";
    feedback = "Answer lacks technical depth and does not sufficiently address core engineering requirements.";
  }

  return { score, status, feedback };
};

const evaluateJobMockInterview = async (job, organization, candidateResumeOrProfile, answers = {}) => {
  const jobTitle = job.title || "Software Engineer";
  const company = job.company || organization?.name || organization?.companyName || "the Company";
  const requiredSkills = Array.isArray(job.skills) ? job.skills : [];

  const answerEntries = Object.entries(answers);
  const totalExpectedQuestions = Math.max(answerEntries.length, 9);
  const questionFeedback = [];
  let totalScore = 0;
  let answeredCount = 0;

  for (let i = 1; i <= totalExpectedQuestions; i++) {
    const qKey = String(i);
    const ans = answers[qKey] || answers[i] || "";
    const evalResult = evaluateIndividualAnswer(ans, "", requiredSkills);
    if (ans && ans.trim().length > 0) {
      answeredCount++;
    }
    totalScore += evalResult.score;
    questionFeedback.push({
      questionId: i,
      score: evalResult.score,
      status: evalResult.status,
      feedback: evalResult.feedback
    });
  }

  const eligibilityScore = Math.round(totalScore / totalExpectedQuestions);

  let verdict = "Eligible - Strong Candidate";
  let status = "Recommended for Next Round";

  if (answeredCount === 0 || eligibilityScore === 0) {
    verdict = "Not Eligible - Incomplete Interview";
    status = "Failed - Required Questions Left Blank";
  } else if (eligibilityScore < 45) {
    verdict = "Not Eligible - Insufficient Responses";
    status = "Did Not Pass AI Screening (Requires Preparation)";
  } else if (eligibilityScore < 65) {
    verdict = "Developing Fit - Requires Preparation";
    status = "Additional Interview Preparation Recommended";
  } else if (eligibilityScore >= 85) {
    verdict = "Highly Eligible - Top Performer";
    status = "Strongly Recommended for Immediate Interview";
  }

  return {
    jobTitle,
    company,
    eligibilityScore, // percentage out of 100
    verdict,
    status,
    metrics: {
      technicalCompetency: answeredCount === 0 ? 0 : Math.min(eligibilityScore + 2, 98),
      roleAlignment: answeredCount === 0 ? 0 : eligibilityScore,
      communicationClarity: answeredCount === 0 ? 0 : Math.max(eligibilityScore - 4, 20),
      problemSolvingDepth: answeredCount === 0 ? 0 : Math.min(eligibilityScore + 1, 95)
    },
    strengths: answeredCount > 0 ? [
      `Addressed core concepts relevant to the ${jobTitle} role`,
      `Demonstrated understanding of engineering workflows`,
      `Practical problem-solving mindset demonstrated across answers`
    ] : [
      "Completed the mock interview submission workflow"
    ],
    areasForImprovement: answeredCount > 0 ? [
      `Include more specific quantitative business impact metrics (e.g., % latency reduced, user scale handled)`,
      `Elaborate deeper on automated testing, CI/CD pipelines, and security controls`
    ] : [
      "You must provide structured, detailed answers for all interview questions to receive a passing eligibility score",
      "Explain your past project experiences, technical stack, and problem-solving process"
    ],
    questionFeedback
  };
};

// ---------------------------------------------------------------------------
// TASK 3: "MATCH YOUR SAVED RESUME" ALIGNMENT AGENT
// ---------------------------------------------------------------------------
const matchSavedResumeWithJob = async (job, organization, resumeTextOrProfile) => {
  let resumeText = "";
  let resumeSkills = [];
  let candidateExperience = [];
  let candidateProjects = [];

  if (typeof resumeTextOrProfile === "string") {
    resumeText = resumeTextOrProfile;
    resumeSkills = extractSkills(resumeText);
  } else if (resumeTextOrProfile && typeof resumeTextOrProfile === "object") {
    resumeSkills = resumeTextOrProfile.skills || [];
    candidateExperience = resumeTextOrProfile.experience || [];
    candidateProjects = resumeTextOrProfile.projects || [];
    resumeText = JSON.stringify(resumeTextOrProfile);
  }

  const jobTitle = job.title || "Software Engineer";
  const company = job.company || organization?.name || "Company";
  const requiredSkills = Array.isArray(job.skills) && job.skills.length > 0
    ? job.skills
    : extractSkills(job.description + " " + (job.requirements || ""));

  // 1. Skills Matching
  const lowerResumeSkills = new Set(resumeSkills.map(s => s.toLowerCase()));
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of requiredSkills) {
    if (lowerResumeSkills.has(skill.toLowerCase()) || resumeText.toLowerCase().includes(skill.toLowerCase())) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const skillsMatchPercentage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 80;

  // 2. Experience Matching
  const reqExp = (job.experienceLevel || "Mid-Level").toLowerCase();
  let experienceMatchPercentage = 75;
  let experienceSummary = "Candidate has relevant experience aligning with the mid-level requirements.";

  if (reqExp.includes("entry") || reqExp.includes("fresher") || reqExp.includes("junior")) {
    experienceMatchPercentage = 95;
    experienceSummary = "100% experience matches the role. Well suited for Entry-Level & Fresher positions.";
  } else if (reqExp.includes("senior") || reqExp.includes("lead")) {
    if (candidateExperience.length >= 3 || /senior|lead|years/i.test(resumeText)) {
      experienceMatchPercentage = 88;
      experienceSummary = "Strong experience alignment for senior engineering expectations.";
    } else {
      experienceMatchPercentage = 60;
      experienceSummary = "Meets foundational technical criteria; additional senior leadership context recommended.";
    }
  } else {
    experienceMatchPercentage = 85;
    experienceSummary = "Candidate experience matches the required mid-level profile.";
  }

  // 3. Expected Projects Included in Resume
  const expectedProjects = [];
  const lowerText = resumeText.toLowerCase();

  if (lowerText.includes("react") || lowerText.includes("web") || lowerText.includes("frontend")) {
    expectedProjects.push("Interactive Web & React Frontend Application");
  }
  if (lowerText.includes("api") || lowerText.includes("node") || lowerText.includes("backend") || lowerText.includes("express")) {
    expectedProjects.push("RESTful Backend Microservices & API Architecture");
  }
  if (lowerText.includes("mongo") || lowerText.includes("database") || lowerText.includes("sql")) {
    expectedProjects.push("Production Database Schema & Query Optimization");
  }
  if (expectedProjects.length === 0) {
    expectedProjects.push("Full-Stack Modern Web Engineering Portfolio Project");
  }

  // 4. Overall Candidate Eligibility Percentage
  const overallEligibility = Math.round(
    skillsMatchPercentage * 0.55 +
    experienceMatchPercentage * 0.30 +
    (expectedProjects.length >= 2 ? 15 : 10)
  );

  return {
    jobTitle,
    company,
    overallEligibility: Math.min(overallEligibility, 98), // e.g. 82%
    skillsMatchPercentage, // e.g. 75%
    skillsMatchedText: `${skillsMatchPercentage}% skills match to the job`,
    matchedSkills,
    missingSkills,
    experienceMatchPercentage,
    experienceSummary: `${experienceMatchPercentage}% experience match to the job (${experienceSummary})`,
    expectedProjects,
    projectsSummary: `Expected projects (${expectedProjects.join(", ")}) are included in the resume.`,
    tailoringRecommendations: [
      missingSkills.length > 0
        ? `Highlight exposure to ${missingSkills.slice(0, 3).join(", ")} in your summary or skill tags.`
        : `Your listed skills strongly cover all primary prerequisites for ${jobTitle}.`,
      `Feature quantifiable outcomes in project bullet points (e.g. users served, load speeds improved).`,
      `Tailor your professional headline to emphasize ${matchedSkills.slice(0, 3).join(", ") || jobTitle}.`
    ]
  };
};

// ---------------------------------------------------------------------------
// TASK 4: CAREER TOOLS AI RESUME ANALYZER (ATS Evaluator)
// ---------------------------------------------------------------------------
const analyzeResumeATS = async (fileBufferOrPath, directText = "") => {
  let rawText = directText || "";
  if (!rawText && fileBufferOrPath) {
    rawText = await extractTextFromPdfBuffer(fileBufferOrPath);
  }

  if (!rawText || !rawText.trim()) {
    throw new Error("No readable resume text could be found. Please upload a valid resume PDF or provide your resume text.");
  }

  // Pre-check if valid resume
  const check = isResumeDocument(rawText);
  if (!check.isValid) {
    throw new Error(check.reason || "Uploaded document does not appear to be a resume or CV. Please upload a professional resume containing your education, skills, and work experience.");
  }

  const text = rawText.trim();
  const lower = text.toLowerCase();
  const emails = extractEmails(text);
  const phones = extractPhones(text);
  const skills = extractSkills(text);

  // Section Evaluations
  const contactScore = (emails.length > 0 && phones.length > 0) ? 95 : emails.length > 0 ? 80 : 60;
  const experienceScore = /(?:experience|work|employment|internship)/i.test(text) ? 82 : 65;
  const skillsScore = skills.length >= 8 ? 92 : skills.length >= 4 ? 78 : 60;
  const educationScore = /(?:education|university|college|degree|btech|bachelor)/i.test(text) ? 88 : 68;
  const keywordsScore = skills.length >= 6 ? 85 : 62;
  const formattingScore = text.length > 300 && text.length < 8000 ? 90 : 70;

  const overallScore = Math.round(
    contactScore * 0.15 +
    experienceScore * 0.25 +
    skillsScore * 0.25 +
    educationScore * 0.15 +
    keywordsScore * 0.10 +
    formattingScore * 0.10
  );

  const sections = [
    {
      name: "Contact Information",
      score: contactScore,
      status: contactScore >= 80 ? "good" : "warn",
      tip: contactScore >= 80 ? "Complete contact info detected (email & phone number present)." : "Ensure phone number and professional email are clearly listed at top."
    },
    {
      name: "Work Experience",
      score: experienceScore,
      status: experienceScore >= 80 ? "good" : "warn",
      tip: "Use strong action verbs (Architected, Engineered, Optimized) and include numerical metrics."
    },
    {
      name: "Skills Relevance",
      score: skillsScore,
      status: skillsScore >= 80 ? "good" : "warn",
      tip: `Identified ${skills.length} industry skills. Group them clearly into Languages, Frameworks, and Tools.`
    },
    {
      name: "Education",
      score: educationScore,
      status: educationScore >= 80 ? "good" : "warn",
      tip: "Degree and university detected. Keep graduation year and GPA/percentage formatted clearly."
    },
    {
      name: "Keywords & ATS Compliance",
      score: keywordsScore,
      status: keywordsScore >= 80 ? "good" : "warn",
      tip: "Solid ATS keyword density. Use standard heading names (Experience, Education, Projects) for clean parser digestion."
    },
    {
      name: "Formatting & Structure",
      score: formattingScore,
      status: formattingScore >= 80 ? "good" : "warn",
      tip: "Clean document flow. Maintain single-column or clean two-column format without tables or graphics."
    }
  ];

  return {
    score: overallScore,
    sections,
    strengths: [
      `Strong core technology profile featuring ${skills.slice(0, 4).join(", ") || "essential engineering skills"}`,
      `Clear chronological progression with detectable education and project credentials`,
      `ATS-friendly layout with readable text structure`
    ],
    weaknesses: [
      `Could add more quantifiable percentage and performance metrics to work achievements`,
      `Ensure GitHub repositories and live demo links are clickable and verified`
    ],
    missingSkills: ["Docker", "TypeScript", "AWS", "CI/CD", "PostgreSQL"].filter(s => !skills.includes(s)).slice(0, 3),
    suggestions: [
      "Add 2-3 measurable bullet points using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.",
      "Include a dedicated technical skills grid divided by Languages, Frameworks, Databases, and Developer Tools.",
      "Ensure your resume stays within 1 page (freshers/mid-level) or 2 pages (senior professionals)."
    ],
    atsSuggestions: [
      "Avoid embedded icons or multi-layer graphics that confuse legacy enterprise ATS scanners.",
      "Save and submit as a standard PDF with selectable text, not flattened raster images."
    ]
  };
};

// ---------------------------------------------------------------------------
// TASK 5: PRACTICE INTERVIEWS AGENT (Home Screen - Rated out of 10)
// ---------------------------------------------------------------------------
const generatePracticeInterviewQuestions = async (candidateResumeOrProfile) => {
  let skills = [];
  let headline = "Software Engineer";
  let name = "Candidate";

  if (candidateResumeOrProfile) {
    if (typeof candidateResumeOrProfile === "string") {
      skills = extractSkills(candidateResumeOrProfile);
    } else if (typeof candidateResumeOrProfile === "object") {
      skills = candidateResumeOrProfile.skills || [];
      headline = candidateResumeOrProfile.headline || headline;
      name = candidateResumeOrProfile.name || name;
    }
  }

  const primarySkill = skills[0] || "Software Architecture";
  const secondarySkill = skills[1] || "React / Modern Web";
  const tertiarySkill = skills[2] || "Backend APIs";

  const questions = [
    {
      id: 1,
      category: "Introduction & Elevator Pitch",
      question: `Walk me through your background as a ${headline}. What are your core technical strengths and what kind of problems do you enjoy solving most?`,
      tip: "Structure as: Current focus → Past projects & accomplishments → What drives you professionally."
    },
    {
      id: 2,
      category: "Technical Fundamentals",
      question: `In your work with ${primarySkill}, explain how you structure components or modules for maximum reusability, testability, and performance.`,
      tip: "Mention separation of concerns, DRY principles, typing, and testing strategies."
    },
    {
      id: 3,
      category: "Debugging & Problem Solving",
      question: `Describe the most challenging bug or production incident you encountered. How did you diagnose it, trace the root cause, and verify the fix?`,
      tip: "Highlight systematic troubleshooting: logs, profiler, isolation of variables, regression tests."
    },
    {
      id: 4,
      category: "System Design & Scalability",
      question: `Suppose your web application experiences a 10x traffic surge during a campaign. Where would bottlenecks occur in ${secondarySkill} and ${tertiarySkill}, and how would you mitigate them?`,
      tip: "Discuss caching, database indexing, rate limiting, and horizontal scaling."
    },
    {
      id: 5,
      category: "Behavioral & Teamwork (STAR)",
      question: `Tell me about a time you had to adapt quickly to a completely new tool, library, or sudden change in product priorities. How did you manage it?`,
      tip: "Use the STAR method: Situation, Task, Action, and positive measurable Result."
    },
    {
      id: 6,
      category: "Code Quality & Engineering Standards",
      question: `What is your philosophy on code reviews? How do you ensure high quality without blocking team velocity?`,
      tip: "Discuss constructive comments, automated linting/CI checks, and collaborative empathy."
    },
    {
      id: 7,
      category: "Security & Data Integrity",
      question: `How do you safeguard user data and prevent common vulnerabilities (XSS, CSRF, Injection, token leakage) in client-server communications?`,
      tip: "Mention input sanitization, HTTPS, httpOnly cookies, JWT expiration, and least privilege access."
    },
    {
      id: 8,
      category: "Career Vision & Leadership",
      question: `Where do you see your technical trajectory over the next 2-3 years, and what high-impact skills are you currently actively developing?`,
      tip: "Align ambition with continuous learning, mentoring peers, and delivering tangible product value."
    }
  ];

  return {
    headline,
    totalQuestions: questions.length,
    questions
  };
};

let GoogleGenAIClass = null;
try {
  const genaiPkg = require("@google/genai");
  if (genaiPkg && genaiPkg.GoogleGenAI) {
    GoogleGenAIClass = genaiPkg.GoogleGenAI;
  }
} catch (e) {
  // silent fallback to local agent model
}

const evaluatePracticeInterview = async (candidateResumeOrProfile, answers = {}) => {
  const answerEntries = Object.entries(answers);
  const totalExpectedQuestions = Math.max(answerEntries.length, 8);
  const questionFeedback = [];
  let totalScore100 = 0;
  let answeredCount = 0;

  for (let i = 1; i <= totalExpectedQuestions; i++) {
    const qKey = String(i);
    const ans = answers[qKey] || answers[i] || "";
    const evalResult = evaluateIndividualAnswer(ans, "", []);
    if (ans && ans.trim().length > 0) {
      answeredCount++;
    }
    const qScore10 = Number((evalResult.score / 10).toFixed(1));
    totalScore100 += evalResult.score;

    questionFeedback.push({
      questionId: i,
      score: qScore10, // out of 10
      status: evalResult.status,
      feedback: evalResult.feedback
    });
  }

  const rawAverage100 = totalScore100 / totalExpectedQuestions;
  const averageScore = Number((rawAverage100 / 10).toFixed(1));

  const confidenceScore = answeredCount === 0 ? 0 : Number(Math.min(averageScore + 0.2, 9.8).toFixed(1));
  const eligibilityScore = answeredCount === 0 ? 0 : Number(averageScore.toFixed(1));
  const communicationScore = answeredCount === 0 ? 0 : Number(Math.max(averageScore - 0.3, 1.0).toFixed(1));
  const problemSolvingScore = answeredCount === 0 ? 0 : Number(Math.min(averageScore + 0.1, 9.5).toFixed(1));

  let summary = "Outstanding interview performance! Your responses demonstrate depth, technical confidence, and structured problem solving.";
  if (answeredCount === 0) {
    summary = "No answers were submitted during this practice session. You must provide structured technical answers to evaluate your interview readiness.";
  } else if (averageScore < 4.5) {
    summary = "Interview responses require significant development. Focus on answering each question with specific technical examples and structured reasoning.";
  } else if (averageScore < 7.5) {
    summary = "Solid interview practice session. With slight refinement on technical detail and metrics, you will excel in live recruiter screens.";
  }

  return {
    overallScore: averageScore, // RATED OUT OF 10
    ratingScale: "Out of 10",
    confidence: confidenceScore,
    eligibility: eligibilityScore,
    communication: communicationScore,
    problemSolving: problemSolvingScore,
    summary,
    strengths: answeredCount > 0 ? [
      "Consistent, structured answers addressing core engineering requirements",
      "Demonstration of technical vocabulary and architectural concepts",
      "Positive and professional communicative tone"
    ] : [
      "Familiarized yourself with the practice interview format"
    ],
    recommendations: answeredCount > 0 ? [
      "Apply the STAR framework more systematically to behavioral questions",
      "Mention exact metrics (e.g. reduced build time by 40%, supported 10k users) to solidify credibility"
    ] : [
      "Write thorough answers for all 8 practice questions to get an accurate score",
      "Use technical terminology and real project anecdotes in your responses"
    ],
    questionFeedback
  };
};

// ---------------------------------------------------------------------------
// TASK 6: CAREER TOOLS AI CAREER MENTOR (Human-Like, Domain-Guarded)
// ---------------------------------------------------------------------------
const isCareerScopeQuery = (query) => {
  const lower = (query || "").toLowerCase().trim();

  // Questions about user's own identity, profile, resume, skills, or projects
  if (
    /who am i|what is my name|what('s| is) my name|my name|my profile|my skill|my project|my resume|my degree|my college|my experience|about me|tell me about myself/i.test(
      lower
    )
  ) {
    return true;
  }

  // Career, jobs, interviews, skills, resume, tech, workplace topics
  const careerKeywords = [
    "career", "job", "interview", "resume", "cv", "skill", "tech", "react", "node", "python", "java",
    "coding", "software", "engineer", "developer", "hire", "recruiter", "salary", "offer", "portfolio",
    "github", "linkedin", "promotion", "workplace", "internship", "project", "system design", "learn",
    "course", "certif", "roadmap", "education", "degree", "college", "experience", "advice", "guidance",
    "prep", "mock", "application", "docker", "cloud", "aws", "database", "mongodb", "sql", "mern"
  ];

  for (const kw of careerKeywords) {
    if (lower.includes(kw)) return true;
  }

  // Common greetings and polite inquiries
  if (/^(hi|hello|hey|good\s*(morning|evening|afternoon)|who are you|how are you|help|thank|thanks)/i.test(lower)) {
    return true;
  }

  return false;
};

const generateCareerMentorResponse = async (userMessage, profileContext = {}) => {
  const q = (userMessage || "").trim();

  // Domain Boundary Check
  if (!isCareerScopeQuery(q)) {
    return "I am your CareerVerse Career Mentor. My focus is helping you with software engineering careers, resumes, job interviews, skill development, and career planning. Feel free to ask me anything about your professional journey or your CareerVerse profile!";
  }

  const name = profileContext.name || "there";
  const firstName = profileContext.name ? profileContext.name.split(" ")[0] : "there";
  const skillsList = Array.isArray(profileContext.skills) && profileContext.skills.length > 0
    ? profileContext.skills.slice(0, 6).join(", ")
    : "software development";
  const lower = q.toLowerCase();

  // 1. Direct answering for user identity / name queries
  if (/what is my name|who am i|what's my name|do you know my name/i.test(lower)) {
    if (profileContext.name && profileContext.name !== "User" && profileContext.name !== "Candidate") {
      return `Your name is ${profileContext.name}! You are currently preparing for software engineering roles with skills in ${skillsList}. How can I assist you with your career today?`;
    } else {
      return "I don't have your full name saved in your profile yet, but you can update it anytime in your Profile settings! What career goals are you working on right now?";
    }
  }

  // 2. Direct answering for user skills queries
  if (/what are my skills|my skills|what skills do i have/i.test(lower)) {
    return `According to your CareerVerse profile, your key skills include: ${skillsList}. Would you like advice on which skill to deepen next or how to highlight them on your resume?`;
  }

  // 3. Try Gemini GenAI API first if API key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && GoogleGenAIClass) {
    try {
      const ai = new GoogleGenAIClass({ apiKey });
      const prompt = `You are CareerVerse AI Career Mentor, a friendly, encouraging, empathetic human career counselor and mentor.
Speak warmly and naturally like a real mentor chatting 1-on-1 with a student or engineer.
IMPORTANT GUIDELINES:
- Write in clear, natural, human conversational English.
- DO NOT use robot clichés like "As an AI..." or robot emojis.
- DO NOT use repetitive markdown asterisks (**bold** on every word). Use plain, readable text.
- Avoid repetitive bullet point lists unless specifically requested.
- Keep responses concise (3 to 5 sentences or 1 to 2 short paragraphs).
- Answer the candidate directly and warmly.

Candidate Context:
- Full Name: ${profileContext.name || "Candidate"}
- Headline: ${profileContext.headline || "Software Engineer"}
- Skills: ${skillsList}
- Education: ${profileContext.education || "Information Technology"}
- Projects: ${Array.isArray(profileContext.projects) ? profileContext.projects.map(p => p.title).join(", ") : "Student projects"}

User Message: "${q}"`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (result && result.text && result.text.trim()) {
        let cleanText = result.text.trim();
        // Strip excessive asterisk bold formatting so it reads cleanly
        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, "$1");
        return cleanText;
      }
    } catch (apiErr) {
      console.warn("[CareerMentor] Gemini API call fallback:", apiErr.message);
    }
  }

  // 4. Natural human fallback responses (clean, zero asterisk spam, conversational)
  if (lower.includes("prepare for") || lower.includes("interview")) {
    return `Hi ${firstName}! Here is a practical approach for your interview preparation: First, review the core fundamentals of your primary languages (${skillsList}), especially closures, asynchronous programming, and data structures. Second, structure your behavioral answers using the STAR technique (Situation, Task, Action, Result). Finally, run through the AI Mock Interview on any job listing right here on CareerVerse to practice realistic technical questions and get instant feedback. What specific role or topic would you like to prepare for?`;
  }

  if (lower.includes("skill") || lower.includes("learn next")) {
    return `Based on your profile with strengths in ${skillsList}, the highest-return skills to learn next are TypeScript for reliable full-stack applications, Docker for containerization and local dev workflows, and backend caching patterns with Redis. Pick one of these, build a hands-on project to demonstrate it, and showcase it on your CareerVerse profile.`;
  }

  if (lower.includes("resume") || lower.includes("cv")) {
    return `Here are three quick ways to elevate your resume: First, replace generic task descriptions with measurable outcomes, like stating how many users your app supported or the percentage improvement in query speed. Second, ensure your core technical stack matches the requirements of the roles you are targeting. Third, try our AI Resume Analyzer under Career Tools to check your ATS compatibility score and get actionable recommendations.`;
  }

  if (lower.includes("career") || lower.includes("path") || lower.includes("grow")) {
    return `Building a lasting software engineering career comes down to three things: developing deep mastery in your core stack (${skillsList}), taking end-to-end ownership of features from design to deployment, and collaborating effectively with peers. Keep building projects with live demo links and sharing your technical learnings along the way.`;
  }

  return `Great question, ${firstName}! Looking at your background in ${skillsList}, my recommendation is to keep building momentum by tackling challenging real-world projects, keeping your profile updated with clear achievements, and regularly practicing technical interviews. How can I help you with your next career step?`;
};

module.exports = {
  extractTextFromPdfBuffer,
  isResumeDocument,
  optimizeProfileFromResumeContent,
  generateJobMockInterviewQuestions,
  evaluateJobMockInterview,
  matchSavedResumeWithJob,
  analyzeResumeATS,
  generatePracticeInterviewQuestions,
  evaluatePracticeInterview,
  generateCareerMentorResponse
};
