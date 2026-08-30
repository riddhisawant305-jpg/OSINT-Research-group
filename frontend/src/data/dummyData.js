export const currentUser = {
  id: 1,
  name: "Darshan Kamble",
  headline: "Frontend Developer & Career Enthusiast",
  location: "Pune, Maharashtra, India",
  about:
    "Passionate about building beautiful web experiences and helping others grow in their careers. Currently exploring AI-powered career tools and modern frontend stacks.",
  email: "darshan@careerverse.example",
  phone: "+91 98765 43210",
  education: "B.E. Computer Science, Pune University",
  skills: ["React", "JavaScript", "CSS", "UI/UX", "Problem Solving"],
  experience: [
    { role: "Frontend Developer", company: "CareerVerse", duration: "2024 - Present" },
    { role: "Web Developer Intern", company: "TechNova", duration: "2023 - 2024" },
  ],
  avatarColor: "#2563eb",
  initials: "DK",
  connections: 348,
  posts: 15,
};

export const users = [
  {
    id: 2,
    name: "Priya Sharma",
    headline: "Product Designer at DesignLab",
    location: "Mumbai, India",
    initials: "PS",
    avatarColor: "#7c3aed",
  },
  {
    id: 3,
    name: "Rahul Mehta",
    headline: "Backend Engineer at CloudBase",
    location: "Bengaluru, India",
    initials: "RM",
    avatarColor: "#0891b2",
  },
  {
    id: 4,
    name: "Ananya Iyer",
    headline: "Data Scientist at InsightsCo",
    location: "Hyderabad, India",
    initials: "AI",
    avatarColor: "#d97706",
  },
  {
    id: 5,
    name: "Vikram Singh",
    headline: "DevOps Engineer at OpsWorks",
    location: "Delhi, India",
    initials: "VS",
    avatarColor: "#dc2626",
  },
  {
    id: 6,
    name: "Sneha Patel",
    headline: "HR Manager at TalentHub",
    location: "Ahmedabad, India",
    initials: "SP",
    avatarColor: "#16a34a",
  },
  {
    id: 7,
    name: "Arjun Nair",
    headline: "Machine Learning Engineer",
    location: "Kochi, India",
    initials: "AN",
    avatarColor: "#db2777",
  },
];

export const posts = [
  {
    id: 1,
    user: users[1],
    time: "2h",
    content:
      "Excited to share that I've been working on a new design system for our products! 🎨 It's been an incredible journey of collaboration and learning.",
    likes: 124,
    comments: 18,
    shares: 6,
  },
  {
    id: 2,
    user: currentUser,
    time: "5h",
    content:
      "Just published a post about my journey with CareerVerse! Ready to help more people grow in their careers. 🚀",
    likes: 86,
    comments: 12,
    shares: 4,
  },
  {
    id: 3,
    user: users[2],
    time: "1d",
    content:
      "Pro tip: always write clean, self-documenting code. Your future self (and your teammates) will thank you! 💡",
    likes: 240,
    comments: 30,
    shares: 22,
  },
  {
    id: 4,
    user: users[3],
    time: "1d",
    content:
      "Deployed my first end-to-end machine learning pipeline to production today. Amazing feeling! 📊",
    likes: 310,
    comments: 45,
    shares: 18,
  },
  {
    id: 5,
    user: users[4],
    time: "2d",
    content:
      "Learning Docker and Kubernetes has completely transformed how I approach deployments. Highly recommended for all backend engineers!",
    likes: 156,
    comments: 22,
    shares: 12,
  },
];

export const jobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechNova",
    logo: "TN",
    logoColor: "#2563eb",
    location: "Bengaluru, India",
    type: "Full-time",
    salary: "₹25L - ₹40L",
    posted: "2d ago",
    description:
      "We're looking for a Senior Frontend Developer to lead our web application team. You'll build scalable, performant React applications and mentor junior developers.",
    skills: ["React", "TypeScript", "CSS", "Testing", "Leadership"],
    applicants: 42,
  },
  {
    id: 2,
    title: "Product Designer",
    company: "DesignLab",
    logo: "DL",
    logoColor: "#7c3aed",
    location: "Remote",
    type: "Full-time",
    salary: "₹18L - ₹30L",
    posted: "3d ago",
    description:
      "Join our design team to craft delightful, user-centered product experiences. You'll collaborate closely with product and engineering to ship world-class designs.",
    skills: ["Figma", "UI/UX", "Prototyping", "User Research"],
    applicants: 68,
  },
  {
    id: 3,
    title: "Backend Engineer",
    company: "CloudBase",
    logo: "CB",
    logoColor: "#0891b2",
    location: "Hyderabad, India",
    type: "Full-time",
    salary: "₹20L - ₹35L",
    posted: "1w ago",
    description:
      "We are hiring a Backend Engineer to build robust, scalable APIs and services. Experience with Node.js, databases, and cloud infrastructure is required.",
    skills: ["Node.js", "PostgreSQL", "AWS", "Microservices"],
    applicants: 55,
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "InsightsCo",
    logo: "IC",
    logoColor: "#d97706",
    location: "Pune, India",
    type: "Full-time",
    salary: "₹22L - ₹38L",
    posted: "4d ago",
    description:
      "Apply your ML and data analytics skills to solve real business problems. Build predictive models, analyze trends, and drive data-informed decisions.",
    skills: ["Python", "Machine Learning", "SQL", "Statistics"],
    applicants: 31,
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "OpsWorks",
    logo: "OW",
    logoColor: "#dc2626",
    location: "Delhi, India",
    type: "Contract",
    salary: "₹24L - ₹40L",
    posted: "6d ago",
    description:
      "Own our CI/CD pipelines, cloud infrastructure, and monitoring systems. You'll ensure our services are reliable, scalable, and secure.",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "AWS"],
    applicants: 27,
  },
];

export const notifications = [
  { id: 1, type: "like", user: users[1], text: "liked your post", time: "10m", read: false },
  { id: 2, type: "comment", user: users[2], text: "commented on your post: \"Great work!\"", time: "1h", read: false },
  { id: 3, type: "connection", user: users[4], text: "sent you a connection request", time: "2h", read: false },
  { id: 4, type: "job", user: null, text: "New job match: Senior Frontend Developer at TechNova", time: "5h", read: true },
  { id: 5, type: "mention", user: users[3], text: "mentioned you in a comment", time: "1d", read: true },
  { id: 6, type: "like", user: users[5], text: "liked your post", time: "2d", read: true },
];

export const unreadNotifications = notifications.filter((n) => !n.read).length;

export const messages = [
  {
    id: 1,
    user: users[1],
    preview: "Thanks! Let's connect for the design review.",
    time: "10:24 AM",
    unread: 2,
    thread: [
      { from: "them", text: "Hey! Loved your latest post about frontend dev 🚀" },
      { from: "me", text: "Thank you Priya! Means a lot coming from you." },
      { from: "them", text: "I'm putting together a design review, want to collaborate?" },
      { from: "them", text: "Thanks! Let's connect for the design review." },
    ],
  },
  {
    id: 2,
    user: users[2],
    preview: "Can you review my latest PR?",
    time: "9:02 AM",
    unread: 0,
    thread: [
      { from: "them", text: "Hey, I pushed a new API endpoint today." },
      { from: "me", text: "Nice! I'll take a look." },
      { from: "them", text: "Can you review my latest PR?" },
    ],
  },
  {
    id: 3,
    user: users[3],
    preview: "The dashboard looks great!",
    time: "Yesterday",
    unread: 0,
    thread: [
      { from: "them", text: "Great job on the ML demo!" },
      { from: "me", text: "Thanks Ananya!" },
      { from: "them", text: "The dashboard looks great!" },
    ],
  },
  {
    id: 4,
    user: users[6],
    preview: "Interview slot confirmed for Friday.",
    time: "Yesterday",
    unread: 0,
    thread: [
      { from: "them", text: "Are you available for an interview Friday?" },
      { from: "me", text: "Yes, that works for me!" },
      { from: "them", text: "Interview slot confirmed for Friday." },
    ],
  },
];

export const connections = [
  { id: 2, user: users[1], mutual: 24, connected: true },
  { id: 3, user: users[2], mutual: 41, connected: true },
  { id: 4, user: users[3], mutual: 12, connected: true },
  { id: 5, user: users[4], mutual: 33, connected: false },
  { id: 6, user: users[5], mutual: 18, connected: false },
  { id: 7, user: users[6], mutual: 7, connected: false },
];

export const careerStats = {
  profileStrength: 78,
  applicationViews: 245,
  profileViews: 189,
  searchAppearances: 120,
  interviewInvites: 4,
  connectionRequests: 23,
};

export const skillProgress = [
  { name: "React", level: 80 },
  { name: "JavaScript", level: 85 },
  { name: "CSS / UI", level: 75 },
  { name: "Problem Solving", level: 70 },
  { name: "Communication", level: 65 },
];

export const roadmap = {
  weeks: [
    { week: 1, title: "Frontend Foundations", tasks: ["HTML & CSS deep dive", "JavaScript Essentials", "Build a portfolio page"] },
    { week: 2, title: "React Core", tasks: ["Components & Props", "State & Hooks", "React Router basics"] },
    { week: 3, title: "Advanced React", tasks: ["Context API", "Custom hooks", "Performance optimization"] },
    { week: 4, title: "Build & Deploy", tasks: ["Project: Job Board clone", "Testing basics", "Deploy to production"] },
  ],
};
