export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  link?: string;
  github?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string[];
  location: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  duration: string;
  location: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'Languages' | 'Frameworks' | 'Tools' | 'Other' | 'Support Engineering' | 'Support Manager' | 'Product Manager';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  technologies?: string[];
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Customer Session Analyser',
    description: 'Record keeping for all the customer interactions with the product and making insights out of it.',
    technologies: ['Python', 'Flask', 'PostgreSQL', 'Analytics'],
    image: '/images/project1.jpg',
    github: 'https://github.com/Legolasan/customer_session_analyser',
  },
  {
    id: '2',
    title: 'Zendesk Test Case Generation',
    description: 'Create test cases from the Zendesk tickets for regression and functional testing.',
    technologies: ['Python', 'Zendesk API', 'Test Automation'],
    image: '/images/project2.jpg',
    github: 'https://github.com/Legolasan/zendesk_analyser',
  },
  {
    id: '3',
    title: 'Snowflake Key Rotation',
    description: 'Rotate the Snowflake key-pairs from your terminal. Available as a PyPI package.',
    technologies: ['Python', 'Snowflake', 'CLI', 'PyPI'],
    image: '/images/project3.jpg',
    github: 'https://github.com/Legolasan/sf_rotation',
  },
  {
    id: '4',
    title: 'Weekly Reporting',
    description: 'Space where you can track your work items week over week.',
    technologies: ['Python', 'Flask', 'PostgreSQL', 'Productivity'],
    image: '/images/project4.jpg',
    github: 'https://github.com/Legolasan/weekly_reporting',
  },
];

export const experiences: Experience[] = [
  {
    id: '1',
    company: 'Hevo Data Pvt. Ltd',
    position: 'Product Manager',
    duration: '2024 - Present',
    location: 'Bengaluru, Karnataka',
    description: [
      'Defined and shipped improvements across Salesforce, HubSpot, NetSuite, Facebook Ads, Qualtrics, PostgreSQL, MySQL, MongoDB (Oplog/ChangeStreams), and SQL Server connectors. ',
      'Drove initiatives to reduce ingestion failures, optimize historical load performance, and stabilize CDC pipelines handling millions of events',
      'Designed improvements for error classification, async processing queues, offset management, and failure-recovery workflows across connectors.',
      'Led feature development for secure destinations, including private key–based authentication, and automated test-connection validation.',
      'Analyzed customer setup sessions to identify friction points in pipeline creation. Delivered actionable insights to improve onboarding flows, reduce abandonment, and increase successful destination configuration rates.'
    ],
  },
  {
    id: '2',
    company: 'Hevo Data Pvt. Ltd',
    position: 'Product Support Manager',
    duration: '2022 - 2024',
    location: 'Bengaluru, Karnataka',
    description: [
      'Improved the first response SLA coverage from 80% to >95%.',
'Improve the resolution SLA coverage from 55% to >75%.',
'Kept the fewer replies coverage above 80%.',
'Maintaining the CSAT percentage above 90% for email ticketing system and 95 and above for the Chat systems.',
'Kept the referral ratio under 30% for better balance between engineering and support teams.'
    ],
  },
  {
    id: '3',
    company: 'Hevo Data Pvt. Ltd',
    position: 'Product Support Engineer',
    duration: '2019 - 2022',
    location: 'Bengaluru, Karnataka',
    description: [
      'Handling incoming queries/Issues for the Hevo ETL platform.',
'Solved >70% cases under 24 hours.',
'Kept the referral to engineering below 30%. Keep iterating over the referred Jiras to make sure, we have KB OR Troubleshooting article created.',
'Kept improving the knowledge space by contributing more than 5 KBs a week.',
'Maintained the CSAT more than 90% overall in my tenure.'
    ],
  },
  {
    id: '4',
    company: 'Sprinklr Inc.',
    position: 'Product Support Engineer',
    duration: '2018 - 2019',
    location: 'Bengaluru, Karnataka',
    description: [
    'Provided technical support for the Sprinklr Premium Ads Serving platform, troubleshooting and resolving complex ad delivery and reporting issues for global clients.',
    'Acted as a point of contact between clients and engineering teams, facilitating timely resolution of escalated technical problems.',
    'Monitored, analyzed, and diagnosed ads platform incidents, ensuring high availability and minimal downtime for mission-critical campaigns.',
    'Created and maintained troubleshooting documentation and internal knowledge base articles to improve support team efficiency.',
    'Collaborated cross-functionally with product and development teams to provide feedback and advocate for customer-centric feature improvements.',
    ],
  },
  {
    id: '5',
    company: 'Yahoo Inc',
    position: 'Product Support Engineer',
    duration: '2015 - 2018',
    location: 'Bengaluru, Karnataka',
    description: [
    'Provided advanced technical support for Yahoo Ads platforms, handling queries and issues from global clients.',
    'Diagnosed and resolved ad delivery, targeting, and reporting issues, collaborating closely with engineering and product teams for complex escalations.',
    'Maintained a resolution SLA of over 85% for assigned support tickets, ensuring timely and effective solutions.',
    'Documented troubleshooting steps and contributed to the creation and upkeep of internal knowledge base articles.',
    'Consistently received positive CSAT feedback by demonstrating effective communication and empathy with clients.',
    ],
  },
  {
    id: '6',
    company: 'Minacs',
    position: 'Associate Analyst',
    duration: '2014 - 2014',
    location: 'Bengaluru, Karnataka',
    description: [
    'Handled customer queries and provided technical support via email for Apple iTunes services.',
    'Assisted users with account issues, purchase problems, subscription management, and troubleshooting playback errors.',
    'Collaborated with cross-functional teams to escalate and resolve complex cases efficiently.',
    'Maintained high standards of customer satisfaction by providing clear communication and timely responses.',
    'Documented recurring issues and contributed to internal knowledge base to streamline support processes.',
    ],
  },
];

export const education: Education[] = [
  {
    id: '1',
    institution: 'Park College Of Technology',
    degree: 'Bachelor of Engineering',
    field: 'Aeronautical',
    duration: '2009 - 2013',
    location: 'Coimbatore, Tamil Nadu',
  },
];

export const skills: Skill[] = [
  // Languages
  { name: 'Python', level: 50, category: 'Languages' },
  { name: 'SQL', level: 50, category: 'Languages' },
  // Frameworks
  { name: 'Flask', level: 50, category: 'Frameworks' },
  { name: 'FastAPI', level: 50, category: 'Frameworks' },
  // Tools
  { name: 'Git', level: 50, category: 'Tools' },
  { name: 'Docker', level: 50, category: 'Tools' },
  { name: 'AWS', level: 50, category: 'Tools' },
  { name: 'CI/CD', level: 50, category: 'Tools' },
  // Support Engineering
  { name: 'Customer Satisfaction', level: 100, category: 'Support Engineering' },
  { name: 'Customer Advocacy', level: 100, category: 'Support Engineering' },
  { name: 'Time Management', level: 100, category: 'Support Engineering' },
  { name: 'Escalation Handling', level: 100, category: 'Support Engineering' },
  // Support Manager
  { name: 'Customer Empathy', level: 100, category: 'Support Manager' },
  { name: 'Team Performance Management', level: 100, category: 'Support Manager' },
  { name: 'Stakeholder Management', level: 100, category: 'Support Manager' },
  { name: 'Feedback Loop', level: 100, category: 'Support Manager' },
  { name: 'Coaching & Mentorship', level: 100, category: 'Support Manager' },
  // Product Manager
  { name: 'Strategic Thinking', level: 100, category: 'Product Manager' },
  { name: 'Data Driven Decisions', level: 100, category: 'Product Manager' },
  { name: 'Communication & Leadership', level: 100, category: 'Product Manager' },
  { name: 'Prioritization', level: 100, category: 'Product Manager' },
  { name: 'Adaptability', level: 100, category: 'Product Manager' },
  { name: 'Execution', level: 100, category: 'Product Manager' },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js 14',
    excerpt: 'Learn the fundamentals of Next.js 14 and how to build modern web applications with the App Router.',
    date: '2024-01-15',
    readTime: '5 min read',
    slug: 'getting-started-with-nextjs-14',
  },
  {
    id: '2',
    title: 'Mastering TypeScript for React',
    excerpt: 'A comprehensive guide to using TypeScript effectively in React applications with best practices.',
    date: '2024-01-10',
    readTime: '8 min read',
    slug: 'mastering-typescript-for-react',
  },
  {
    id: '3',
    title: 'Building Responsive UIs with Tailwind CSS',
    excerpt: 'Tips and tricks for creating beautiful, responsive user interfaces using Tailwind CSS.',
    date: '2024-01-05',
    readTime: '6 min read',
    slug: 'building-responsive-uis-with-tailwind',
  },
];

export const tools: Tool[] = [
  {
    id: '1',
    name: 'Customer Session Analyser',
    description: 'Track and analyze customer interactions with products to derive actionable insights. Perfect for support teams and product managers.',
    category: 'Analytics',
    icon: '📊',
    link: 'https://github.com/Legolasan/customer_session_analyser',
    technologies: ['Python', 'Flask', 'PostgreSQL'],
  },
  {
    id: '2',
    name: 'Zendesk Test Case Generator',
    description: 'Automatically generate test cases from Zendesk tickets for regression and functional testing. Streamlines QA workflows.',
    category: 'Testing & QA',
    icon: '🧪',
    link: 'https://github.com/Legolasan/zendesk_analyser',
    technologies: ['Python', 'Zendesk API'],
  },
  {
    id: '3',
    name: 'Snowflake Key Rotation CLI',
    description: 'Rotate Snowflake key-pairs directly from your terminal. Published as a PyPI package for easy installation and use.',
    category: 'Security & DevOps',
    icon: '🔐',
    link: 'https://github.com/Legolasan/sf_rotation',
    technologies: ['Python', 'Snowflake', 'PyPI'],
  },
  {
    id: '4',
    name: 'Weekly Reporting Tracker',
    description: 'Personal productivity tool to track work items week over week. Stay organized and never miss important tasks.',
    category: 'Productivity',
    icon: '📝',
    link: 'https://github.com/Legolasan/weekly_reporting',
    technologies: ['Python', 'Flask', 'PostgreSQL'],
  },
];

export const personalInfo = {
  name: 'Arun Sundararajan',
  title: 'Product Manager',
  email: 'arunsunderraj@outlook.com',
  phone: '+91 8197882503',
  location: 'Bengaluru, Karnataka',
  bio: "I'm a Product Manager with a strong technical background and over ten years of experience working on data platforms. I enjoy understanding how systems break in the real world and turning those lessons into better product decisions.",
  bioExtended: [
    "At Hevo, I work on improving connector reliability, authentication flows, and onboarding across modern data stacks. My work touches platforms like Snowflake, Salesforce, HubSpot, NetSuite, and PostgreSQL.",
    "I like collaborating closely with engineers to shape ideas into simple, maintainable solutions. I'm naturally analytical and spend a lot of time thinking about edge cases and long-term scalability.",
    "My background in support helps me stay grounded in real user problems. I care about building products that are reliable, understandable, and easy to trust."
  ],
  socialLinks: {
    github: 'https://github.com/legolasan',
    linkedin: 'https://linkedin.com/in/arunsunderraj',
    email: 'mailto:arunsunderraj@outlook.com',
  },
};

