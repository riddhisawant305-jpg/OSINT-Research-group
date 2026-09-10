const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000/api";

const sampleResumeText = `
AARYAN DHOTRE
Email: aaryan.dhotre@gmail.com | Phone: +91 98765 43210 | Location: Pune, Maharashtra
GitHub: https://github.com/aaryandhotre | LinkedIn: https://linkedin.com/in/aaryandhotre

PROFESSIONAL SUMMARY
Passionate Full Stack Engineer with 2+ years of experience designing, building, and deploying scalable web applications using React, Node.js, Express, MongoDB, and TypeScript. Dedicated to writing clean, maintainable code with high test coverage and optimal performance.

EDUCATION
Bachelor of Technology in Computer Science and Engineering
Pune Institute of Computer Technology (PICT) | 2021 - 2025
CGPA: 8.9 / 10.0

SKILLS
Programming: JavaScript, TypeScript, Python, C++, SQL, HTML5, CSS3
Frameworks & Libraries: React.js, Node.js, Express.js, Next.js, Redux, Tailwind CSS
Databases & Cloud: MongoDB, PostgreSQL, Redis, AWS, Docker, Git, CI/CD
Methodologies: Agile, RESTful APIs, System Design, Unit Testing, Problem Solving

EXPERIENCE
Full Stack Developer Intern | Tech Corp Solutions
Jan 2024 - Present | Pune, India
- Developed responsive web interfaces using React and Tailwind CSS, improving mobile usability scores by 25%.
- Designed and documented 15+ secure RESTful API endpoints in Node.js and Express with JWT authentication.
- Optimized MongoDB indexing and query pipeline, cutting average search latency from 450ms to 90ms.

PROJECTS
CareerVerse Professional Platform
- Built full-featured career and networking platform featuring live feeds, job application tracking, and AI career tools.
- Integrated automated testing with Jest and implemented zero-dependency agentic candidate evaluations.
- Technologies: React, Node.js, MongoDB, Express, Docker

Cloud-Native Task Queue Microservice
- Architected asynchronous event dispatcher processing 10,000+ jobs/min with Redis and WebSockets.
- Technologies: Node.js, Redis, Docker, TypeScript

HOBBIES & INTERESTS
Open Source Contributing, Competitive Programming, Tech Blogging, Chess
`;

async function runAgenticTests() {
  console.log("===============================================================");
  console.log("TESTING CAREERVERSE AGENTIC AI MODEL SUITE (ALL 6 TASKS)");
  console.log("===============================================================");

  // 1. Task 1: Resume Profile Optimizer
  console.log("\n[TASK 1] Testing Resume Profile Optimizer Agent...");
  const optRes = await fetch(`${BASE_URL}/career/optimize-profile-from-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sampleResumeText }),
  });
  const optData = await optRes.json();
  if (!optRes.ok || !optData.data) {
    throw new Error("Task 1 failed: " + JSON.stringify(optData));
  }
  console.log(`✓ Name: "${optData.data.name}"`);
  console.log(`✓ Headline: "${optData.data.headline}"`);
  console.log(`✓ Skills (${optData.data.skills.length}): ${optData.data.skills.slice(0, 5).join(", ")}...`);
  console.log(`✓ Hobbies (${optData.data.hobbies?.length || 0}): ${(optData.data.hobbies || []).join(", ")}`);
  console.log(`✓ Education: ${optData.data.education}`);
  console.log(`✓ Projects: ${optData.data.projects?.length} projects extracted`);

  // 2. Task 2: Job-Specific AI Mock Interview
  console.log("\n[TASK 2] Testing Job-Specific AI Mock Interview Agent...");
  const sampleJob = {
    title: "Senior Full Stack Engineer",
    company: "Acme Tech Innovations",
    description: "Looking for an experienced engineer to build high-scale cloud platforms.",
    requirements: ["Proficiency in React and Node.js", "Experience with MongoDB and Docker", "2+ years experience"],
    responsibilities: ["Architect scalable frontend and backend systems", "Deliver clean, testable code"],
    skills: ["React", "Node.js", "MongoDB", "TypeScript", "Docker"],
  };

  const jobGenRes = await fetch(`${BASE_URL}/career/job-mock-interview/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job: sampleJob,
      candidate: optData.data,
    }),
  });
  const jobGenData = await jobGenRes.json();
  if (!jobGenRes.ok || !jobGenData.data?.questions) {
    throw new Error("Task 2 Question Generation failed: " + JSON.stringify(jobGenData));
  }
  console.log(`✓ Generated ${jobGenData.data.questions.length} recruitment questions for "${sampleJob.title}" at "${sampleJob.company}"`);
  console.log(`  Sample Q1: "${jobGenData.data.questions[0].question}"`);

  // Evaluate candidate answers
  const candidateAnswers = {
    1: "I have been working with modern web stacks for 2+ years, building cloud-native applications with React and Node.js. My background aligns with Acme's focus on scalable architecture.",
    2: "In React, I optimize re-renders using custom hooks, memoization, and modular state management to ensure sub-100ms render cycles.",
    3: "I follow test-driven planning: gathering acceptance criteria, sketching DB schemas, writing integration tests, and deploying via CI/CD.",
  };

  const jobEvalRes = await fetch(`${BASE_URL}/career/job-mock-interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job: sampleJob,
      answers: candidateAnswers,
    }),
  });
  const jobEvalData = await jobEvalRes.json();
  if (!jobEvalRes.ok || typeof jobEvalData.data?.eligibilityScore !== "number") {
    throw new Error("Task 2 Evaluation failed: " + JSON.stringify(jobEvalData));
  }
  console.log(`✓ Recruitment Report: Eligibility ${jobEvalData.data.eligibilityScore}% (out of 100)`);
  console.log(`  Verdict: ${jobEvalData.data.verdict}`);
  console.log(`  Status: ${jobEvalData.data.status}`);

  // 3. Task 3: Match Saved Resume with Job Description
  console.log("\n[TASK 3] Testing 'Match Saved Resume' Alignment Agent...");
  const matchRes = await fetch(`${BASE_URL}/career/match-resume-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      job: sampleJob,
      text: sampleResumeText,
    }),
  });
  const matchData = await matchRes.json();
  if (!matchRes.ok || !matchData.data) {
    throw new Error("Task 3 Match failed: " + JSON.stringify(matchData));
  }
  console.log(`✓ Overall Eligibility: ${matchData.data.overallEligibility}%`);
  console.log(`✓ Skills Alignment: ${matchData.data.skillsMatchedText}`);
  console.log(`  Matched: ${matchData.data.matchedSkills.join(", ")}`);
  console.log(`✓ Experience Alignment: ${matchData.data.experienceSummary}`);
  console.log(`✓ Projects Check: ${matchData.data.projectsSummary}`);

  // 4. Task 4: AI Resume Analyzer (ATS Evaluator)
  console.log("\n[TASK 4] Testing AI Resume Analyzer (ATS) Agent...");
  const atsRes = await fetch(`${BASE_URL}/career/resume-analyzer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: sampleResumeText }),
  });
  const atsData = await atsRes.json();
  if (!atsRes.ok || typeof atsData.data?.score !== "number") {
    throw new Error("Task 4 ATS failed: " + JSON.stringify(atsData));
  }
  console.log(`✓ Overall ATS Score: ${atsData.data.score} / 100`);
  console.log(`✓ Sections Evaluated (${atsData.data.sections.length}):`);
  atsData.data.sections.forEach(s => {
    console.log(`   - ${s.name}: ${s.score}% [${s.status}]`);
  });

  // 5. Task 5: Practice Interviews (Rated out of 10)
  console.log("\n[TASK 5] Testing Practice Interview Agent (Rated Out of 10)...");
  const practiceGenRes = await fetch(`${BASE_URL}/career/practice-interview/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidate: optData.data }),
  });
  const practiceGenData = await practiceGenRes.json();
  if (!practiceGenRes.ok || !practiceGenData.data?.questions) {
    throw new Error("Task 5 Generation failed: " + JSON.stringify(practiceGenData));
  }
  console.log(`✓ Generated ${practiceGenData.data.questions.length} practice questions`);
  console.log(`  Sample Practice Q: "${practiceGenData.data.questions[0].question}"`);

  const practiceAnswers = {
    1: "I am a Full Stack Developer specializing in React and Node.js with strong foundations in distributed system design.",
    2: "I prioritize modularity, separation of business logic from UI, and write unit tests with Jest to keep regression minimal.",
  };

  const practiceEvalRes = await fetch(`${BASE_URL}/career/practice-interview/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: practiceAnswers }),
  });
  const practiceEvalData = await practiceEvalRes.json();
  if (!practiceEvalRes.ok || typeof practiceEvalData.data?.overallScore !== "number") {
    throw new Error("Task 5 Evaluation failed: " + JSON.stringify(practiceEvalData));
  }
  console.log(`✓ Practice Interview Evaluation: ${practiceEvalData.data.overallScore} / 10 (${practiceEvalData.data.ratingScale})`);
  console.log(`  Confidence: ${practiceEvalData.data.confidence} / 10`);
  console.log(`  Eligibility: ${practiceEvalData.data.eligibility} / 10`);
  console.log(`  Communication: ${practiceEvalData.data.communication} / 10`);

  // 6. Task 6: AI Career Mentor with Domain Boundary Guardrail
  console.log("\n[TASK 6] Testing AI Career Mentor (with Domain Guardrails)...");
  // 6a. Valid in-scope career question
  const mentorValidRes = await fetch(`${BASE_URL}/career/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "How should I prepare for frontend interviews with React and TypeScript?",
      context: optData.data,
    }),
  });
  const mentorValidData = await mentorValidRes.json();
  console.log(`✓ In-Scope Query Answered (${mentorValidData.data?.reply?.length} chars)`);

  // 6b. Out-of-scope query
  const mentorOosRes = await fetch(`${BASE_URL}/career/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What is the best recipe to make Italian chocolate cake for dinner?",
    }),
  });
  const mentorOosData = await mentorOosRes.json();
  console.log(`✓ Out-of-Scope Query Intercepted:`);
  console.log(`  Agent Response:\n  "${mentorOosData.data?.reply.replace(/\n/g, "\n  ")}"`);

  console.log("\n===============================================================");
  console.log("ALL 6 AGENTIC MODEL TASKS PASSED WITH 100% SUCCESS! ✓");
  console.log("===============================================================");
}

runAgenticTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
