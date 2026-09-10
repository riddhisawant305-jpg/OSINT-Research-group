// Automated Test Script for CareerVerse Admin & Core Functionality
const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("==================================================");
  console.log("   CAREERVERSE ADMIN & REPAIRS VERIFICATION SUITE  ");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName, detail = "") {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${testName} - ${detail}`);
    }
  }

  try {
    // 1. Backend root health check
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200 && rootData.success === true, "Root health check (GET /)");

    // 2. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@careerverse.com", password: "Admin123!" }),
    });
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && !!adminLoginData.token, "Admin login (POST /api/admin/login)", `Status: ${adminLoginRes.status}`);

    const adminToken = adminLoginData.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. Admin Stats
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, { headers: adminHeaders });
    const statsData = await statsRes.json();
    assert(
      statsRes.status === 200 &&
      statsData.data?.totalUsers > 0 &&
      statsData.data?.totalOrganizations > 0 &&
      statsData.data?.totalPosts > 0 &&
      statsData.data?.totalJobs > 0,
      "Admin stats (GET /api/admin/stats) returns non-zero counts",
      `Users: ${statsData.data?.totalUsers}, Orgs: ${statsData.data?.totalOrganizations}, Posts: ${statsData.data?.totalPosts}, Jobs: ${statsData.data?.totalJobs}`
    );

    // 4. Admin Users list
    const usersRes = await fetch(`${BASE_URL}/api/admin/users`, { headers: adminHeaders });
    const usersData = await usersRes.json();
    assert(
      usersRes.status === 200 && Array.isArray(usersData.data) && usersData.data.length > 0,
      "Admin users directory (GET /api/admin/users) returns candidates",
      `Count: ${usersData.data?.length}`
    );

    // 5. Verify candidates do not include organizations or admins
    const hasOnlyCandidates = usersData.data.every(
      (u) => u.role !== "organization" && u.role !== "recruiter" && u.role !== "admin"
    );
    assert(hasOnlyCandidates, "Admin users list contains only candidate/student accounts");

    // 6. Admin Organizations list
    const orgsRes = await fetch(`${BASE_URL}/api/admin/organizations`, { headers: adminHeaders });
    const orgsData = await orgsRes.json();
    assert(
      orgsRes.status === 200 && Array.isArray(orgsData.data) && orgsData.data.length > 0,
      "Admin organizations directory (GET /api/admin/organizations) returns companies",
      `Count: ${orgsData.data?.length}`
    );

    // 7. Admin Posts moderation list
    const postsRes = await fetch(`${BASE_URL}/api/admin/posts`, { headers: adminHeaders });
    const postsData = await postsRes.json();
    assert(
      postsRes.status === 200 && Array.isArray(postsData.data) && postsData.data.length > 0,
      "Admin posts moderation (GET /api/admin/posts) returns posts",
      `Count: ${postsData.data?.length}`
    );

    // 8. Admin Jobs moderation list
    const jobsRes = await fetch(`${BASE_URL}/api/admin/jobs`, { headers: adminHeaders });
    const jobsData = await jobsRes.json();
    assert(
      jobsRes.status === 200 && Array.isArray(jobsData.data) && jobsData.data.length > 0,
      "Admin jobs moderation (GET /api/admin/jobs) returns jobs",
      `Count: ${jobsData.data?.length}`
    );

    // 9. Student Login
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "priya.sharma@careerverse.example", password: "Password123!" }),
    });
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && !!studentLoginData.token, "Student login (POST /api/auth/login)");

    const studentToken = studentLoginData.token;

    // 10. Security check: Student token CANNOT access admin stats
    const studentStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentStatsRes.status === 403, "RBAC Security: Student cannot access admin stats (returns 403 Forbidden)");

    // 11. Security check: Student token CANNOT access admin users list
    const studentUsersRes = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentUsersRes.status === 403, "RBAC Security: Student cannot access admin users (returns 403 Forbidden)");

    // 12. Public/Authenticated feeds: Jobs list
    const publicJobsRes = await fetch(`${BASE_URL}/api/jobs`);
    const publicJobsData = await publicJobsRes.json();
    assert(publicJobsRes.status === 200 && publicJobsData.data?.length > 0, "Public jobs feed (GET /api/jobs) returns active jobs");

    // 13. Public/Authenticated feeds: Posts list
    const publicPostsRes = await fetch(`${BASE_URL}/api/posts`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const publicPostsData = await publicPostsRes.json();
    assert(publicPostsRes.status === 200 && publicPostsData.data?.length > 0, "Posts feed (GET /api/posts) returns active posts");

    // 14. Admin Broadcast System
    const broadcastRes = await fetch(`${BASE_URL}/api/admin/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: "Platform System Maintenance Complete",
        text: "Admin dashboard and platform telemetry have been verified.",
      }),
    });
    const broadcastData = await broadcastRes.json();
    assert(broadcastRes.status === 200 && broadcastData.success === true, "Admin broadcast notification (POST /api/admin/broadcast)");

    // 15. Candidates have populated counts
    const candidateSample = usersData.data[0];
    const candidateHasFields = candidateSample && ("postsCount" in candidateSample) && ("applicationsCount" in candidateSample);
    assert(candidateHasFields, "Candidate records contain computed postsCount and applicationsCount fields");

  } catch (err) {
    console.error("Test execution threw error:", err);
  }

  console.log("\n==================================================");
  console.log(`   TEST RESULTS: ${passed}/${total} TESTS PASSED`);
  console.log("==================================================");

  if (passed === total) {
    console.log("All verifications succeeded without error!");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
