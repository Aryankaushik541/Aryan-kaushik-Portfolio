export const profile = {
  name: "Aryan Kaushik",
  title: "Full-Stack Developer",
  credentials: ["Certified Ethical Hacker (CEH)", "IIT Bombay Certified"],
  location: "India",
  email: "aryankaushik541@gmail.com",
  phone: "+91-7482860774",
  links: {
    github: "https://github.com/Aryankaushik541",
    linkedin: "https://www.linkedin.com/in/aryan-kaushik-811a99207",
  },
  summary:
    "Full-Stack Developer with 3+ years of experience building production-grade web applications. Skilled in React.js, Node.js, Express.js, MongoDB, and Python. Certified Ethical Hacker (CEH) with hands-on expertise in JWT authentication and RBAC. Delivered a 9-role Pharmaceutical Management System and an OpenAI-integrated AI platform.",
};

export const skillGroups = [
  { label: "Languages", items: ["JavaScript (ES6+)", "Python", "TypeScript", "C++", "Java", "PHP"] },
  { label: "Frontend", items: ["React.js", "React Native", "Angular.js", "HTML5", "CSS3", "Tailwind CSS", "Redux"] },
  { label: "Backend", items: ["Node.js", "Express.js", "Django", "DRF", "REST API", "Microservices"] },
  { label: "Databases", items: ["MongoDB", "MySQL", "PostgreSQL", "SQLite"] },
  { label: "Security", items: ["JWT", "RBAC", "bcrypt", "CSRF Protection", "Cloudflare", "Pen Testing"] },
  { label: "Tools", items: ["Git", "Docker", "Postman", "Linux", "CI/CD", "OpenAI API", "Agile / Scrum"] },
];

export const experience = [
  {
    role: "Android Development Intern",
    org: "Gowox Infotech Pvt. Ltd.",
    period: "Dec 2022 – Jan 2023",
    points: [
      "Developed 2 production Android applications using Java and Android Studio.",
      "Reduced rendering latency by approximately 25%.",
      "Delivered all sprint milestones on schedule in an Agile SDLC environment.",
    ],
  },
  {
    role: "Website Development & Database Management Intern",
    org: "Gowox Infotech Pvt. Ltd.",
    period: "Apr 2022 – May 2022",
    points: [
      "Built 3 responsive websites using HTML5, CSS3, and JavaScript.",
      "Designed MySQL databases with 5+ schemas.",
      "Implemented PHP backend services, improving data retrieval performance by ~30%.",
    ],
  },
  {
    role: "PLC & SCADA Industrial Automation Training",
    org: "SOFCON India Pvt. Ltd.",
    period: "Jul 2023 – Aug 2023",
    points: [
      "Gained hands-on experience with PLC programming and ladder logic design.",
      "Configured SCADA systems for industrial automation.",
    ],
  },
];

export const featuredProjects = [
  {
    name: "Pharmaceutical Management System",
    stack: ["React Native", "Node.js", "MongoDB", "JWT", "RBAC"],
    description: "Production pharma operations platform with 9-role RBAC authentication, real-time dashboards, and inventory tracking across 50+ SKUs.",
  },
  {
    name: "SaathiShaadi Matrimonial Platform",
    stack: ["React.js", "Node.js", "Express.js", "MongoDB Atlas"],
    description: "Live production application with a database-backed admin panel managing rate limiting, OTP, and JWT expiry.",
    url: "https://sathisadi.com",
  },
  {
    name: "MERN Portfolio – Enterprise Security",
    stack: ["React.js", "Node.js", "MongoDB", "Cloudflare", "bcrypt"],
    description: "DDoS-protected app behind Cloudflare CDN with JWT/HS512 auth, 2-step email OTP, and CSRF protection across 9 models.",
  },
  {
    name: "White Beat AI Platform",
    stack: ["React.js", "Django", "OpenAI API", "REST API"],
    description: "OpenAI-integrated automation platform with an admin monitoring panel and async fallback handling for rate limits.",
  },
];

export const education = [
  { degree: "B.Tech, Computer Science & Engineering", school: "MAKAUT", period: "2023 – 2026" },
  { degree: "Diploma, Computer Science", school: "Government Polytechnic", period: "2020 – 2023", note: "CGPA 7.5/10" },
  { degree: "Matriculation (CBSE)", school: "G.D Mission Public School, Dhokra", note: "70%" },
];

export const certifications = [
  "Certified Ethical Hacker (CEH) — Valid Jan 2021 – Jan 2026",
  "IIT Bombay: CSS, C++, Python, PHP & MySQL",
  "Virtual Platforms: React.js, Node.js, Angular.js",
  "Cisco Networking Academy: IT Essentials, Networking Essentials",
  "PLC & SCADA – NSDC (SOFCON India)",
];
