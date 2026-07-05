export const NAV_LINKS = ["About", "Skills", "Experience", "Projects", "Certifications", "Contact"];

export const HERO_WORDS = ["Full Stack Developer", "AWS Cloud Enthusiast", "MERN Architect", "Serverless Builder"];

export const SKILLS = {
  Frontend: ["React.js", "Next.js", "Tailwind CSS", "Redux", "GraphQL"],
  Backend: ["Node.js", "Express.js", "Nest.js", "REST APIs", "WebSockets"],
  Cloud: ["AWS Lambda", "API Gateway", "DynamoDB", "Cognito", "S3", "EC2"],
  Database: ["MongoDB", "DynamoDB", "Firebase", "PostgreSQL"],
  DevOps: ["Docker", "CI/CD", "GitHub Actions", "Linux"],
  Security: ["JWT", "OAuth2", "AWS Cognito", "HTTPS/SSL"],
};

export const SKILL_COLORS = {
  Frontend: "#7C3AED",
  Backend: "#2563EB",
  Cloud: "#F59E0B",
  Database: "#10B981",
  DevOps: "#EF4444",
  Security: "#EC4899",
};

export const EXPERIENCE = [
  {
    role: "Backend Developer",
    company: "Rubxsol",
    period: "2023 – Present",
    desc: "Architected scalable REST & GraphQL APIs with Node.js/Express, integrated AWS Lambda and DynamoDB for serverless workloads, and reduced API latency by 40% through caching strategies.",
    color: "#7C3AED",
  },
  {
    role: "Full Stack Developer",
    company: "Radiant Solutions RS",
    period: "2022 – 2023",
    desc: "Built full-stack MERN applications, deployed cloud infrastructure on AWS EC2 & S3, implemented real-time features via WebSockets, and maintained CI/CD pipelines.",
    color: "#2563EB",
  },
  {
    role: "MERN Stack Developer",
    company: "R&H Software House",
    period: "2021 – 2022",
    desc: "Developed multiple client-facing SaaS applications, integrated Stripe payments, built admin dashboards with React & Redux, and optimized MongoDB queries for performance.",
    color: "#10B981",
  },
  {
    role: "Backend Developer Intern",
    company: "SMIT",
    period: "2020 – 2021",
    desc: "Gained hands-on experience with Node.js, Express, MongoDB, and RESTful API design. Contributed to live projects and learned agile development workflows.",
    color: "#F59E0B",
  },
];

export const PROJECTS = [
  {
    title: "Stack Collaboration & Management System",
    desc: "A centralized platform to streamline internal communication, task management, and project collaboration — integrates Slack channels, DMs, file sharing, and role-based access.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Slack API", "Tailwind CSS", "JWT", "Axios"],
    category: "Real-time",
    color: "#7C3AED",
    accent: "from-purple-600 to-purple-900",
    source_code_link: "https://github.com/Husban-Ali/",
    live_website_link: "https://management-frontend-ebon.vercel.app/login",
  },
  {
    title: "Barber Shop - Full Service Platform",
    desc: "Full barber shop management platform with online appointment booking, payments, product marketplace and customer management built with the MERN stack.",
    tech: ["React.js", "Node.js", "Express.js", "MongoDB", "Payment Gateway", "Booking System"],
    category: "E-Commerce",
    color: "#10B981",
    accent: "from-emerald-600 to-teal-900",
    source_code_link: "https://github.com/Husban-Ali/",
    live_website_link: "https://barber-frontend-eight.vercel.app/",
  },
  {
    title: "Real-Time Chat App",
    desc: "A modern real-time chat app featuring secure auth, instant messaging, voice notes and image sharing; backend built serverless with AWS Lambda, API Gateway and DynamoDB.",
    tech: ["AWS Lambda", "API Gateway", "DynamoDB", "S3", "WebSocket"],
    category: "Real-time",
    color: "#06B6D4",
    accent: "from-cyan-600 to-blue-900",
    source_code_link: "https://github.com/Husban-Ali/Husban-ChatApp.git",
    live_website_link: "https://d2j16s8yniu6t1.cloudfront.net/",
  },
  {
    title: "Luxe Store – E-commerce Platform",
    desc: "Modern responsive e-commerce app with product catalogs, secure checkout and AWS-backed media CDN — built with MERN and deployed on AWS.",
    tech: ["React.js", "AWS Lambda", "API Gateway", "DynamoDB", "S3"],
    category: "E-Commerce",
    color: "#F59E0B",
    accent: "from-amber-500 to-orange-800",
    source_code_link: "https://github.com/Husban-Ali/AWS-Ecommerce.git",
    live_website_link: "https://d2aqprnfyi3s3y.cloudfront.net/",
  },
  {
    title: "Saylani TEC",
    desc: "Official Saylani Tech website built during internship — MERN stack with Tailwind CSS, showcasing services and training programs.",
    tech: ["React.js", "Node.js", "MongoDB", "Tailwind CSS"],
    category: "Web",
    color: "#2563EB",
    accent: "from-blue-600 to-indigo-900",
    source_code_link: "https://github.com/Husban-Ali/saylani_tech.git",
    live_website_link: "https://saylanitech.com/",
  },
  {
    title: "SMIT WEBSITE",
    desc: "Dynamic site developed during internship at SMIT — responsive MERN application with course sections and student-focused modules.",
    tech: ["React.js", "Node.js", "MongoDB"],
    category: "Web",
    color: "#2563EB",
    accent: "from-blue-600 to-indigo-900",
    source_code_link: "https://github.com/MRsabcod/SMIT-Web.git",
    live_website_link: "https://smit-web-iota.vercel.app/",
  },
  {
    title: "F&H International - Import Export Website",
    desc: "Company website for import-export business: services, product portfolios, contact flows and business communications built with React and MongoDB.",
    tech: ["React", "MongoDB", "Node.js", "Express"],
    category: "Business",
    color: "#EF4444",
    accent: "from-red-600 to-rose-900",
    source_code_link: "https://github.com/Husban-Ali/fh-frontend.git",
    live_website_link: "https://fh-frontend-steel.vercel.app/",
  },
  {
    title: "Blog",
    desc: "Server-side blog app using HTML/CSS with Firebase as the database for storing posts and comments.",
    tech: ["HTML", "CSS", "Firebase"],
    category: "Web",
    color: "#EC4899",
    accent: "from-pink-600 to-rose-900",
    source_code_link: "https://github.com/Husban-Ali/patanh-bs-ban-gyi-.git",
    live_website_link: "https://husban-ali.github.io/patanh-bs-ban-gyi-/",
  },
  {
    title: "Airport Management System",
    desc: "Flight management system built in Java with Swing demonstrating OOP concepts and GUI-based operations for airlines.",
    tech: ["Java", "Swing", "OOP"],
    category: "Desktop",
    color: "#10B981",
    accent: "from-emerald-600 to-teal-900",
    source_code_link: "https://github.com/HamizMuzaffer/Airport-Management.git",
    live_website_link: "https://github.com/HamizMuzaffer/Airport-Management.git",
  },
];

export const CERTS = [
  { name: "AWS Certified Solutions Architect", level: "Associate", icon: "☁️", color: "#F59E0B" },
  { name: "AWS Certified Developer", level: "Associate", icon: "⚡", color: "#2563EB" },
  { name: "AWS Cloud Practitioner", level: "Foundational", icon: "🌐", color: "#10B981" },
  { name: "Node.js Application Development", level: "Professional", icon: "🟢", color: "#7C3AED" },
];

export const ABOUT_STATS = [
  { val: "4+", label: "Years Experience" },
  { val: "30+", label: "Projects Delivered" },
  { val: "8+", label: "AWS Services" },
  { val: "3", label: "Certifications" },
];

export const ABOUT_TAGS = ["MERN Stack", "AWS Cloud", "Serverless", "Real-Time", "GraphQL"];

export const ABOUT_SKILL_BARS = [
  { label: "Full Stack Dev", pct: 92 },
  { label: "AWS Cloud", pct: 84 },
  { label: "Real-Time Systems", pct: 78 },
  { label: "DevOps & CI/CD", pct: 70 },
];

export const CONTACT_LINKS = [
  { label: "Email", icon: "✉️", val: "syedhusbanalii@gmail.com", href: "mailto:syedhusbanalii@gmail.com" },
  { label: "LinkedIn", icon: "💼", val: "linkedin.com/in/husban-ali", href: "https://linkedin.com/in/husban-ali" },
  { label: "GitHub", icon: "🐙", val: "github.com/Husban-Ali", href: "https://github.com/Husban-Ali" },
  { label: "Phone", icon: "📱", val: "0330 2349479", href: "tel:+923302349479" },
];
