const http = require("http");
const app = require("./server");

// We'll run a local server on port 5001 for automated test suite
const PORT = 5001;
let server;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:${PORT}${path}`);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            const data = raw ? JSON.parse(raw) : null;
            resolve({ status: res.statusCode, data });
          } catch (e) {
            resolve({ status: res.statusCode, raw });
          }
        });
      }
    );

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

let testUserToken;
let testUserId;
let recruiterToken;
let recruiterId;
let createdJobId;
let applicationId;
let targetUserId;

async function runTests() {
  console.log("=========================================");
  console.log("STARTING CAREERVERSE E2E TEST SUITE");
  console.log("=========================================\n");

  const results = [];
  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      results.push({ name, pass: true });
    } catch (err) {
      console.error(`✗ FAIL: ${name} -> ${err.message}`);
      results.push({ name, pass: false, error: err.message });
    }
  };

  const testEmail = `test_student_${Date.now()}@careerverse.example`;
  const recruiterEmail = `test_recruiter_${Date.now()}@careerverse.example`;

  // 1 & 2 & 3: Server and GET /
  await test("1-3. Root endpoint GET /", async () => {
    const res = await request("GET", "/");
    if (res.status !== 200 || !res.data.success) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 4: Register new user
  await test("4. Register new student user", async () => {
    const res = await request("POST", "/api/auth/register", {
      name: "Aaryan Test",
      email: testEmail,
      password: "Password123!",
      headline: "Full Stack Engineer",
    });
    if (res.status !== 201 || !res.data.token) throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    testUserToken = res.data.token;
    testUserId = res.data.data._id;
  });

  // 5: Duplicate registration rejection
  await test("5. Duplicate registration rejected with 409", async () => {
    const res = await request("POST", "/api/auth/register", {
      name: "Aaryan Duplicate",
      email: testEmail,
      password: "Password123!",
    });
    if (res.status !== 409) throw new Error(`Expected 409, got ${res.status}`);
  });

  // 6: Login with valid credentials
  await test("6. Login with valid credentials", async () => {
    const res = await request("POST", "/api/auth/login", {
      email: testEmail,
      password: "Password123!",
    });
    if (res.status !== 200 || !res.data.token) throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
  });

  // 7: Login with invalid credentials
  await test("7. Login with invalid credentials rejected with 401", async () => {
    const res = await request("POST", "/api/auth/login", {
      email: testEmail,
      password: "WrongPassword!",
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 8: GET /api/auth/me
  await test("8. GET /api/auth/me returns authenticated user without password", async () => {
    const res = await request("GET", "/api/auth/me", null, testUserToken);
    if (res.status !== 200 || !res.data.data.email) throw new Error(`Failed to fetch /me`);
    if (res.data.data.password) throw new Error("Security leak: password was returned in /api/auth/me");
  });

  // 9: Update profile
  await test("9. Update profile (PUT /api/users/me)", async () => {
    const res = await request(
      "PUT",
      "/api/users/me",
      {
        headline: "Senior Software Engineer & Architect",
        location: "Mumbai, India",
        about: "Passionate developer building scalable cloud systems.",
        education: "B.Tech Computer Science",
      },
      testUserToken
    );
    if (res.status !== 200 || res.data.data.headline !== "Senior Software Engineer & Architect") {
      throw new Error(`Profile update failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 10: Add skill
  await test("10. Add skill (POST /api/users/me/skills)", async () => {
    const res = await request("POST", "/api/users/me/skills", { skill: "TypeScript" }, testUserToken);
    if (res.status !== 200 || !res.data.data.includes("TypeScript")) {
      throw new Error(`Add skill failed`);
    }
  });

  // 11: Remove skill
  await test("11. Remove skill (DELETE /api/users/me/skills/:skill)", async () => {
    const res = await request("DELETE", "/api/users/me/skills/TypeScript", null, testUserToken);
    if (res.status !== 200 || res.data.data.includes("TypeScript")) {
      throw new Error(`Remove skill failed`);
    }
  });

  // 12 & 13: Education CRUD
  let educationId;
  await test("12. Add education (POST /api/users/me/education)", async () => {
    const res = await request(
      "POST",
      "/api/users/me/education",
      {
        institution: "IIT Bombay",
        degree: "B.Tech",
        fieldOfStudy: "Computer Science",
        startDate: "2020",
        endDate: "2024",
      },
      testUserToken
    );
    if (res.status !== 201 || !res.data.data.length) throw new Error(`Add education failed`);
    educationId = res.data.data[0]._id;
  });

  await test("13. Edit education (PUT /api/users/me/education/:id)", async () => {
    const res = await request(
      "PUT",
      `/api/users/me/education/${educationId}`,
      { degree: "M.Tech" },
      testUserToken
    );
    if (res.status !== 200) throw new Error(`Edit education failed`);
  });

  // 14 & 15: Experience CRUD
  let experienceId;
  await test("14. Add experience (POST /api/users/me/experience)", async () => {
    const res = await request(
      "POST",
      "/api/users/me/experience",
      {
        role: "Software Engineer",
        company: "CareerVerse Systems",
        startDate: "2024",
        current: true,
      },
      testUserToken
    );
    if (res.status !== 201 || !res.data.data.length) throw new Error(`Add experience failed`);
    experienceId = res.data.data[0]._id;
  });

  await test("15. Edit experience (PUT /api/users/me/experience/:id)", async () => {
    const res = await request(
      "PUT",
      `/api/users/me/experience/${experienceId}`,
      { role: "Senior Software Engineer" },
      testUserToken
    );
    if (res.status !== 200) throw new Error(`Edit experience failed`);
  });

  // 16 & 17: Posts CRUD
  let postId;
  await test("16. Create post (POST /api/posts)", async () => {
    const res = await request(
      "POST",
      "/api/posts",
      { content: "Hello CareerVerse! Excited to connect with fellow engineers." },
      testUserToken
    );
    if (res.status !== 201 || !res.data.data._id) throw new Error(`Create post failed`);
    postId = res.data.data._id;
  });

  await test("17. Read posts feed (GET /api/posts)", async () => {
    const res = await request("GET", "/api/posts", null, testUserToken);
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error(`Read posts failed`);
    if (!res.data.data.some((p) => p.content.includes("Hello CareerVerse"))) {
      throw new Error(`Newly created post not found in feed`);
    }
  });

  // 18 & 19: Create recruiter and post job
  await test("18. Create recruiter account safely", async () => {
    const res = await request("POST", "/api/auth/register", {
      name: "Test Recruiter",
      email: recruiterEmail,
      password: "Password123!",
      headline: "Talent Partner",
      role: "recruiter",
    });
    if (res.status !== 201) throw new Error(`Recruiter creation failed`);
    recruiterToken = res.data.token;
    recruiterId = res.data.data._id;
  });

  await test("19. Recruiter creates a job (POST /api/jobs)", async () => {
    const res = await request(
      "POST",
      "/api/jobs",
      {
        title: "Staff Cloud Architect",
        company: "Apex Innovations",
        location: "Bengaluru, India",
        type: "Full-time",
        salary: "₹35L - ₹50L",
        description: "Design and implement scalable multi-region microservices.",
        skills: ["Kubernetes", "Go", "GCP", "System Design"],
      },
      recruiterToken
    );
    if (res.status !== 201 || !res.data.data._id) throw new Error(`Job creation failed`);
    createdJobId = res.data.data._id;
  });

  // 20: Read jobs as student with search/filter
  await test("20. Read jobs with query filter (GET /api/jobs?search=Architect)", async () => {
    const res = await request("GET", "/api/jobs?search=Architect", null, testUserToken);
    if (res.status !== 200 || !res.data.data.length) throw new Error(`Filter jobs failed`);
  });

  // 21: Read job details
  await test("21. Read job details (GET /api/jobs/:id)", async () => {
    const res = await request("GET", `/api/jobs/${createdJobId}`);
    if (res.status !== 200 || res.data.data.title !== "Staff Cloud Architect") {
      throw new Error(`Job details failed`);
    }
  });

  // 22 & 23: Saved job toggle
  await test("22. Save job (POST /api/jobs/:id/save)", async () => {
    const res = await request("POST", `/api/jobs/${createdJobId}/save`, null, testUserToken);
    if (res.status !== 201 && res.status !== 200) throw new Error(`Save job failed`);
  });

  await test("23. Read saved jobs & remove saved job", async () => {
    const res1 = await request("GET", "/api/users/me/saved-jobs", null, testUserToken);
    if (res1.status !== 200 || !res1.data.data.length) throw new Error(`Get saved jobs failed`);

    const res2 = await request("DELETE", `/api/jobs/${createdJobId}/save`, null, testUserToken);
    if (res2.status !== 200) throw new Error(`Remove saved job failed`);
  });

  // 24: Apply for job
  await test("24. Apply for job (POST /api/jobs/:id/apply)", async () => {
    const res = await request(
      "POST",
      `/api/jobs/${createdJobId}/apply`,
      { coverLetter: "I would love to lead cloud architecture." },
      testUserToken
    );
    if (res.status !== 201 || !res.data.data._id) throw new Error(`Apply for job failed: ${JSON.stringify(res.data)}`);
    applicationId = res.data.data._id;
  });

  // 25: Prevent duplicate application
  await test("25. Prevent duplicate application (409 Conflict)", async () => {
    const res = await request(
      "POST",
      `/api/jobs/${createdJobId}/apply`,
      { coverLetter: "Second attempt" },
      testUserToken
    );
    if (res.status !== 409) throw new Error(`Expected 409 Conflict, got ${res.status}`);
  });

  // 26: View student applications
  await test("26. View student applications (GET /api/applications/me)", async () => {
    const res = await request("GET", "/api/applications/me", null, testUserToken);
    if (res.status !== 200 || !res.data.data.length) throw new Error(`View student applications failed`);
  });

  // 27: View recruiter applications
  await test("27. View recruiter applications (GET /api/jobs/:id/applications)", async () => {
    const res = await request("GET", `/api/jobs/${createdJobId}/applications`, null, recruiterToken);
    if (res.status !== 200 || !res.data.data.length) throw new Error(`Recruiter view applications failed`);
  });

  // 28: Update application status
  await test("28. Recruiter updates application status (PUT /api/applications/:id/status)", async () => {
    const res = await request(
      "PUT",
      `/api/applications/${applicationId}/status`,
      { status: "Shortlisted" },
      recruiterToken
    );
    if (res.status !== 200 || res.data.data.status !== "Shortlisted") {
      throw new Error(`Update application status failed`);
    }
  });

  // 29 & 30: Connections
  await test("29 & 30. Connections networking flow", async () => {
    const connList = await request("GET", "/api/connections", null, testUserToken);
    if (connList.status !== 200 || !connList.data.data.length) throw new Error(`Fetch connections failed`);
    targetUserId = connList.data.data[0].user._id;

    const connectRes = await request("POST", `/api/connections/${targetUserId}`, null, testUserToken);
    if (connectRes.status !== 201 && connectRes.status !== 200) {
      throw new Error(`Connect request failed: ${JSON.stringify(connectRes.data)}`);
    }
  });

  // 31: Dashboard endpoint
  await test("31. Dashboard data (GET /api/users/me/dashboard)", async () => {
    const res = await request("GET", "/api/users/me/dashboard", null, testUserToken);
    if (res.status !== 200 || typeof res.data.data.careerStats.profileStrength !== "number") {
      throw new Error(`Dashboard stats failed: ${JSON.stringify(res.data)}`);
    }
    console.log(`    -> Profile strength calculated: ${res.data.data.careerStats.profileStrength}%`);
    console.log(`    -> Applications count: ${res.data.data.careerStats.applicationsCount}`);
    console.log(`    -> Posts count: ${res.data.data.careerStats.postsCount}`);
  });

  // 32: AI Career Mentor endpoint
  await test("32. AI Career Mentor endpoint (POST /api/career/mentor)", async () => {
    const res = await request(
      "POST",
      "/api/career/mentor",
      { message: "What skills should I learn for senior frontend roles?" },
      testUserToken
    );
    // Either 200 (if Gemini key configured) or 503/429 (graceful handled error without crashing)
    if (res.status === 200) {
      console.log(`    -> Real Gemini Mentor response received!`);
    } else if (res.status === 503 || res.status === 429) {
      console.log(`    -> Handled gracefully (${res.status}): ${res.data.message}`);
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 33: Resume Analyzer endpoint
  await test("33. Resume Analyzer endpoint (POST /api/career/resume-analyzer)", async () => {
    const sampleResume = "John Doe. Software Engineer with 3 years experience in React, Node.js, and MongoDB. Built scalable web applications.";
    const res = await request(
      "POST",
      "/api/career/resume-analyzer",
      { text: sampleResume },
      testUserToken
    );
    if (res.status === 200) {
      console.log(`    -> Real Gemini Resume Analysis score: ${res.data.data.score}`);
    } else if (res.status === 503 || res.status === 429) {
      console.log(`    -> Handled gracefully (${res.status}): ${res.data.message}`);
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 34: Unauthorized endpoint access
  await test("34. Unauthorized access rejected with 401", async () => {
    const res = await request("GET", "/api/auth/me");
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 35: Invalid IDs handled safely
  await test("35. Invalid ObjectIDs handled safely with 400", async () => {
    const res = await request("GET", "/api/posts/not-an-id");
    if (res.status !== 400 && res.status !== 404) {
      throw new Error(`Expected 400 or 404 for malformed ID, got ${res.status}`);
    }
  });

  // 36: Projects CRUD
  let createdProjectId;
  await test("36. Projects CRUD (/api/users/me/projects)", async () => {
    const res = await request(
      "POST",
      "/api/users/me/projects",
      {
        title: "CareerVerse Platform",
        description: "An OSINT career and networking platform built with MERN stack.",
        technologies: ["React", "Node.js", "Express", "MongoDB"],
        link: "https://careerverse.example.com",
        duration: "Jan 2024 - Present"
      },
      testUserToken
    );
    if (res.status !== 200 && res.status !== 201) {
      throw new Error(`Expected 200/201, got ${res.status}: ${JSON.stringify(res.data)}`);
    }
    const projects = res.data.projects || res.data;
    if (!Array.isArray(projects) || projects.length === 0) {
      throw new Error("Projects array missing or empty after creation");
    }
    createdProjectId = projects[0]._id;
  });

  // 37: Gemini AI Profile Optimization from Resume
  await test("37. Optimize Profile from Resume via Gemini (POST /api/career/optimize-profile-from-resume)", async () => {
    const sampleResume = `
      Alex Morgan
      Full Stack Software Engineer
      San Francisco, CA | alex@example.com
      Passionate developer with 3 years of experience building modern React and Node.js applications.
      Skills: React, JavaScript, Node.js, Express, MongoDB, Docker
      Experience:
      Full Stack Developer at TechCo (2022 - Present)
      - Developed responsive web interfaces using React.
      Education:
      B.S. Computer Science, UC Berkeley (2018 - 2022)
      Projects:
      AI Code Assistant
      Technologies: React, Node.js, Gemini API
      Built an AI assistant for code analysis and review.
    `;
    const res = await request(
      "POST",
      "/api/career/optimize-profile-from-resume",
      { resumeText: sampleResume, autoApply: true },
      testUserToken
    );
    if (res.status === 200) {
      console.log(`    -> Gemini parsed headline: "${res.data.extracted?.headline}"`);
      console.log(`    -> Gemini extracted ${res.data.extracted?.projects?.length || 0} projects, ${res.data.extracted?.skills?.length || 0} skills`);
    } else if (res.status === 503 || res.status === 429) {
      console.log(`    -> Handled gracefully (${res.status}): ${res.data.message}`);
    } else {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  console.log("\n=========================================");
  console.log(`TEST SUMMARY: ${results.filter((r) => r.pass).length}/${results.length} PASSED`);
  console.log("=========================================\n");

  const anyFailed = results.some((r) => !r.pass);
  process.exit(anyFailed ? 1 : 0);
}

// Start test server and run
server = app.listen(PORT, async () => {
  try {
    await runTests();
  } catch (err) {
    console.error("Test execution fatal error:", err);
    process.exit(1);
  } finally {
    server.close();
  }
});
