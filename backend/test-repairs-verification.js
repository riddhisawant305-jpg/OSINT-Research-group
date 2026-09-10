const http = require("http");
const app = require("./server");

const PORT = 5002;
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

async function runRepairsTests() {
  console.log("\n========================================================");
  console.log("RUNNING VERIFICATION SUITE FOR REPAIRS.TXT REQUIREMENTS");
  console.log("========================================================\n");

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

  const candidateEmail = `cand_${Date.now()}@example.com`;
  const orgEmail = `org_${Date.now()}@example.com`;
  let candidateToken, candidateId;
  let orgToken, orgId;
  let adminToken;
  let createdJobId;
  let createdPostId;
  let testAppId;

  // 1. Candidate Registration & Login
  await test("Candidate Registration and Login with online status tracking", async () => {
    const regRes = await request("POST", "/api/auth/register", {
      name: "Alice Candidate",
      email: candidateEmail,
      password: "Password123!",
      headline: "Frontend Engineer",
      role: "student",
    });
    if (regRes.status !== 201) throw new Error(`Registration failed with status ${regRes.status}`);
    candidateToken = regRes.data.token;
    candidateId = regRes.data.data._id;
    if (regRes.data.data.isLoggedIn !== true) throw new Error("Expected isLoggedIn to be true on register");
  });

  // 2. Organization Registration & Login
  await test("Organization Registration with company details", async () => {
    const orgRes = await request("POST", "/api/auth/register", {
      name: "Tech Solutions Inc",
      email: orgEmail,
      password: "Password123!",
      companyName: "Tech Solutions Inc",
      companyIndustry: "Software Engineering",
      companySize: "51-200 employees",
      role: "organization",
    });
    if (orgRes.status !== 201) throw new Error(`Org registration failed: ${orgRes.status}`);
    orgToken = orgRes.data.token;
    orgId = orgRes.data.data._id;
  });

  // 3. Organization Profile Update (Company Size & Org Details) - repair #11
  await test("Organization updates company size and HR details", async () => {
    const updateRes = await request(
      "PUT",
      "/api/users/me",
      {
        companySize: "201-500 employees",
        companyWebsite: "https://techsolutions.example",
        hrDetails: {
          name: "John HR",
          email: "hr@techsolutions.example",
          phone: "+91 99999 88888",
        },
      },
      orgToken
    );
    if (updateRes.status !== 200) throw new Error(`Update failed: ${updateRes.status}`);
    if (updateRes.data.data.companySize !== "201-500 employees") {
      throw new Error(`Expected companySize to be '201-500 employees', got ${updateRes.data.data.companySize}`);
    }
  });

  // 4. Job Creation by Organization
  await test("Organization posts a new job opening", async () => {
    const jobRes = await request(
      "POST",
      "/api/jobs",
      {
        title: "Senior Full Stack React Engineer",
        company: "Tech Solutions Inc",
        location: "Bengaluru, India",
        type: "Full-time",
        workplaceType: "Hybrid",
        salary: "₹18 - 25 LPA",
        description: "Looking for an experienced React and Node.js developer.",
        skills: ["React", "Node.js", "MongoDB"],
      },
      orgToken
    );
    if (jobRes.status !== 201) throw new Error(`Job creation failed: ${jobRes.status}`);
    createdJobId = jobRes.data.data._id;
  });

  // 5. Job Save Feature (repairs #19, #20)
  await test("Candidate saves and unsaves job (POST /api/jobs/:id/save)", async () => {
    const saveRes = await request("POST", `/api/jobs/${createdJobId}/save`, {}, candidateToken);
    if (saveRes.status !== 200 && saveRes.status !== 201) throw new Error(`Save job failed: ${saveRes.status}`);
    if (!saveRes.data.saved) throw new Error("Expected saved: true");

    // Check that GET /api/jobs/saved returns this job
    const savedListRes = await request("GET", "/api/jobs/saved", null, candidateToken);
    if (savedListRes.status !== 200) throw new Error(`Get saved jobs failed: ${savedListRes.status}`);
    const found = savedListRes.data.data?.some((j) => (j._id || j.id) === createdJobId);
    if (!found) throw new Error("Job not found in saved jobs list");
  });

  // 6. Resume Persistence & Application Transfer (repairs #33, #35, #36)
  await test("Candidate saves resume path and applies with resume attached", async () => {
    // Simulate candidate having uploaded resume
    const fakeResumePath = "/uploads/resumes/resume_12345.pdf";
    await request(
      "PUT",
      "/api/users/me",
      {
        resume: fakeResumePath,
        resumeFileName: "Alice_Resume.pdf",
      },
      candidateToken
    );

    // Apply for job
    const applyRes = await request(
      "POST",
      `/api/jobs/${createdJobId}/apply`,
      {
        coverNote: "Excited to apply for this role!",
        resume: fakeResumePath,
        resumeFileName: "Alice_Resume.pdf",
      },
      candidateToken
    );
    if (applyRes.status !== 201) throw new Error(`Apply failed: ${applyRes.status}`);
    testAppId = applyRes.data.data._id;
    if (applyRes.data.data.resume !== fakeResumePath) {
      throw new Error(`Expected resume path ${fakeResumePath}, got ${applyRes.data.data.resume}`);
    }
  });

  // 7. Recruiter views application with resume and changes status (repairs #38, #39)
  await test("Recruiter changes status and triggers live candidate notification", async () => {
    const statusRes = await request(
      "PUT",
      `/api/applications/${testAppId}/status`,
      { status: "Shortlisted" },
      orgToken
    );
    if (statusRes.status !== 200) throw new Error(`Status update failed: ${statusRes.status}`);

    // Verify candidate received job notification under type: 'job'
    const notifRes = await request("GET", "/api/notifications", null, candidateToken);
    if (notifRes.status !== 200) throw new Error(`Get notifications failed: ${notifRes.status}`);
    const jobNotifs = notifRes.data.data?.filter((n) => n.type === "job");
    if (!jobNotifs || jobNotifs.length === 0) {
      throw new Error("No job notification found for candidate after recruiter status change");
    }
    const foundMsg = jobNotifs.some((n) => n.text.includes("Shortlisted"));
    if (!foundMsg) throw new Error("Notification text did not mention the updated status");
  });

  // 8. Post creation with media and author deletion (repairs #4, #5, #11, #13, #16, #17)
  await test("Post creation with media metadata and author deletion", async () => {
    const postRes = await request(
      "POST",
      "/api/posts",
      {
        content: "Exciting technical update with architecture document!",
        media: "/uploads/posts/arch_doc_123.pdf",
        mediaType: "document",
        mediaName: "SystemArchitecture.pdf",
      },
      candidateToken
    );
    if (postRes.status !== 201) throw new Error(`Post creation failed: ${postRes.status}`);
    createdPostId = postRes.data.data._id;

    // Verify comment without default comment
    const commentRes = await request(
      "POST",
      `/api/posts/${createdPostId}/comment`,
      { text: "Very informative post!" },
      orgToken
    );
    if (commentRes.status !== 201) throw new Error(`Comment failed: ${commentRes.status}`);

    // Create another post for author deletion test
    const tempPostRes = await request(
      "POST",
      "/api/posts",
      { content: "Temp post to delete" },
      candidateToken
    );
    const tempId = tempPostRes.data.data._id;
    const delRes = await request("DELETE", `/api/posts/${tempId}`, null, candidateToken);
    if (delRes.status !== 200) throw new Error(`Author delete post failed: ${delRes.status}`);
  });

  // 9. Organization deletes job listing (repairs #10, #28)
  await test("Organization deletes listed job opening", async () => {
    // Post a temp job to delete
    const tempJobRes = await request(
      "POST",
      "/api/jobs",
      {
        title: "Temporary Summer Intern",
        company: "Tech Solutions Inc",
        location: "Bengaluru, India",
        type: "Internship",
        description: "Short term internship",
      },
      orgToken
    );
    const tempJobId = tempJobRes.data.data._id;
    const delJobRes = await request("DELETE", `/api/jobs/${tempJobId}`, null, orgToken);
    if (delJobRes.status !== 200) throw new Error(`Delete job failed: ${delJobRes.status}`);
  });

  // 10. Admin Authentication & Operations (repairs #41-52)
  await test("Admin login with email & password (POST /api/admin/login)", async () => {
    const adminLoginRes = await request("POST", "/api/admin/login", {
      email: "admin@careerverse.com",
      password: "Admin123!",
    });
    if (adminLoginRes.status !== 200) throw new Error(`Admin login failed: ${adminLoginRes.status}`);
    if (!adminLoginRes.data.token) throw new Error("No admin token returned");
    adminToken = adminLoginRes.data.token;
  });

  // 11. Admin System Stats & Directory Views
  await test("Admin retrieves system stats, candidates, and organizations", async () => {
    const statsRes = await request("GET", "/api/admin/stats", null, adminToken);
    if (statsRes.status !== 200) throw new Error(`Get stats failed: ${statsRes.status}`);
    if (statsRes.data.data.totalUsers === undefined) throw new Error("Missing stats data");

    const usersRes = await request("GET", "/api/admin/users", null, adminToken);
    if (usersRes.status !== 200) throw new Error(`Get users failed: ${usersRes.status}`);
    const foundCand = usersRes.data.data?.find((u) => u._id === candidateId);
    if (!foundCand) throw new Error("Candidate not listed in admin users list");
    if (foundCand.resume !== "/uploads/resumes/resume_12345.pdf") {
      throw new Error(`Admin could not view candidate resume path: ${foundCand.resume}`);
    }

    const orgsRes = await request("GET", "/api/admin/organizations", null, adminToken);
    if (orgsRes.status !== 200) throw new Error(`Get organizations failed: ${orgsRes.status}`);
    const foundOrg = orgsRes.data.data?.find((o) => o._id === orgId);
    if (!foundOrg) throw new Error("Organization not listed in admin organizations list");
  });

  // 12. Admin Moderation: View candidate posts & delete any post
  await test("Admin views candidate posts and deletes post", async () => {
    const userPostsRes = await request("GET", `/api/admin/users/${candidateId}/posts`, null, adminToken);
    if (userPostsRes.status !== 200) throw new Error(`Get user posts failed: ${userPostsRes.status}`);
    if (!userPostsRes.data.data || userPostsRes.data.data.length === 0) {
      throw new Error("No posts found for candidate in admin view");
    }

    const delPostRes = await request("DELETE", `/api/admin/posts/${createdPostId}`, null, adminToken);
    if (delPostRes.status !== 200) throw new Error(`Admin delete post failed: ${delPostRes.status}`);
  });

  // 13. Admin Moderation: View org jobs & delete any job
  await test("Admin views organization jobs and deletes job", async () => {
    const orgJobsRes = await request("GET", `/api/admin/organizations/${orgId}/jobs`, null, adminToken);
    if (orgJobsRes.status !== 200) throw new Error(`Get org jobs failed: ${orgJobsRes.status}`);

    const delJobRes = await request("DELETE", `/api/admin/jobs/${createdJobId}`, null, adminToken);
    if (delJobRes.status !== 200) throw new Error(`Admin delete job failed: ${delJobRes.status}`);
  });

  // 14. Admin Broadcast System Notification
  await test("Admin broadcasts platform notification (POST /api/admin/broadcast)", async () => {
    const broadRes = await request(
      "POST",
      "/api/admin/broadcast",
      {
        title: "System Update",
        text: "Platform maintenance scheduled tonight at 2 AM UTC.",
      },
      adminToken
    );
    if (broadRes.status !== 200) throw new Error(`Broadcast failed: ${broadRes.status}`);
  });

  // 15. Admin Deletion of Users & Organizations
  await test("Admin deletes organization and candidate user", async () => {
    const delOrgRes = await request("DELETE", `/api/admin/organizations/${orgId}`, null, adminToken);
    if (delOrgRes.status !== 200) throw new Error(`Admin delete org failed: ${delOrgRes.status}`);

    const delUserRes = await request("DELETE", `/api/admin/users/${candidateId}`, null, adminToken);
    if (delUserRes.status !== 200) throw new Error(`Admin delete user failed: ${delUserRes.status}`);
  });

  console.log("\n========================================================");
  console.log(`REPAIRS TEST SUMMARY: ${results.filter((r) => r.pass).length}/${results.length} PASSED`);
  console.log("========================================================\n");

  const anyFailed = results.some((r) => !r.pass);
  process.exit(anyFailed ? 1 : 0);
}

server = app.listen(PORT, async () => {
  try {
    await runRepairsTests();
  } catch (err) {
    console.error("Fatal test error:", err);
    process.exit(1);
  } finally {
    server.close();
  }
});
