const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const User = require("./models/User");
const Job = require("./models/Job");
const Post = require("./models/Post");

dotenv.config();

const sampleUsers = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@careerverse.example",
    password: "Password123!",
    headline: "Product Designer at DesignLab",
    location: "Mumbai, India",
    avatarColor: "#7c3aed",
    role: "student",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    about: "Designing user-first digital products with empathy and craft.",
    education: "B.Des, NID Ahmedabad",
  },
  {
    name: "Rahul Mehta",
    email: "rahul.mehta@careerverse.example",
    password: "Password123!",
    headline: "Backend Engineer at CloudBase",
    location: "Bengaluru, India",
    avatarColor: "#0891b2",
    role: "student",
    skills: ["Node.js", "Express", "MongoDB", "PostgreSQL", "AWS"],
    about: "Building scalable distributed systems and robust APIs.",
    education: "B.Tech Computer Science, IIT Bombay",
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@careerverse.example",
    password: "Password123!",
    headline: "Data Scientist at InsightsCo",
    location: "Hyderabad, India",
    avatarColor: "#d97706",
    role: "student",
    skills: ["Python", "Machine Learning", "SQL", "Statistics", "Pandas"],
    about: "Passionate about turning raw data into strategic business intelligence.",
    education: "M.S. Data Science, BITS Pilani",
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@careerverse.example",
    password: "Password123!",
    headline: "Recruiter at TechTalent Hub",
    location: "Delhi, India",
    avatarColor: "#dc2626",
    role: "recruiter",
    skills: ["Technical Hiring", "Talent Acquisition", "HR", "Leadership"],
    about: "Connecting elite engineering talent with high-growth startups.",
    education: "MBA, XLRI Jamshedpur",
  },
];

const sampleJobs = [
  {
    numericId: 1,
    title: "Senior Frontend Developer",
    company: "TechNova",
    logo: "TN",
    logoColor: "#2563eb",
    location: "Bengaluru, India",
    type: "Full-time",
    salary: "₹25L - ₹40L",
    description:
      "We're looking for a Senior Frontend Developer to lead our web application team. You'll build scalable, performant React applications and mentor junior developers.",
    skills: ["React", "TypeScript", "CSS", "Testing", "Leadership"],
    applicantsCount: 42,
  },
  {
    numericId: 2,
    title: "Product Designer",
    company: "DesignLab",
    logo: "DL",
    logoColor: "#7c3aed",
    location: "Remote",
    type: "Full-time",
    salary: "₹18L - ₹30L",
    description:
      "Join our design team to craft delightful, user-centered product experiences. You'll collaborate closely with product and engineering to ship world-class designs.",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    applicantsCount: 68,
  },
  {
    numericId: 3,
    title: "Backend Engineer",
    company: "CloudBase",
    logo: "CB",
    logoColor: "#0891b2",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹20L - ₹35L",
    description:
      "We are hiring a Backend Engineer to build robust, scalable APIs and services. Experience with Node.js, databases, and cloud infrastructure is required.",
    skills: ["Node.js", "PostgreSQL", "AWS", "Microservices"],
    applicantsCount: 55,
  },
  {
    numericId: 4,
    title: "Data Scientist",
    company: "InsightsCo",
    logo: "IC",
    logoColor: "#d97706",
    location: "Pune, India",
    type: "Full-time",
    salary: "₹22L - ₹38L",
    description:
      "Apply your ML and data analytics skills to solve real business problems. Build predictive models, analyze trends, and drive data-informed decisions.",
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    applicantsCount: 31,
  },
  {
    numericId: 5,
    title: "DevOps Engineer",
    company: "OpsWorks",
    logo: "OW",
    logoColor: "#dc2626",
    location: "Delhi, India",
    type: "Contract",
    salary: "₹24L - ₹40L",
    description:
      "Own our CI/CD pipelines, cloud infrastructure, and monitoring systems. You'll ensure our services are reliable, scalable, and secure.",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "AWS"],
    applicantsCount: 27,
  },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for seeding...");

    // Seed jobs if empty
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log("Seeding initial jobs...");
      await Job.insertMany(sampleJobs);
      console.log("Initial jobs seeded successfully!");
    } else {
      console.log(`Database already has ${jobCount} jobs. Skipping job seed.`);
    }

    // Seed users if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("Seeding initial community users...");
      for (const u of sampleUsers) {
        await User.create(u);
      }
      console.log("Community users seeded!");
    }

    // Seed initial posts if empty
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      const priya = await User.findOne({ email: "priya.sharma@careerverse.example" });
      const rahul = await User.findOne({ email: "rahul.mehta@careerverse.example" });

      if (priya && rahul) {
        console.log("Seeding initial community feed posts...");
        await Post.create([
          {
            author: priya._id,
            content:
              "Excited to share that I've been working on a new design system for our products! 🎨 It's been an incredible journey of collaboration and learning.",
            likes: [rahul._id],
            shares: 6,
          },
          {
            author: rahul._id,
            content:
              "Pro tip: always write clean, self-documenting code. Your future self (and your teammates) will thank you! 💡",
            likes: [priya._id],
            shares: 22,
          },
        ]);
        console.log("Feed posts seeded!");
      }
    }

    console.log("Database seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during database seed:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
