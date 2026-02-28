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
  category: 'Cloud & Data' | 'AI & Automation' | 'Operations' | 'Leadership';
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

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  link: string;
  topics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
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
    company: 'Hevo Technologies Pvt Ltd',
    position: 'Technical Operations Manager',
    duration: '2022 - Present',
    location: 'Bengaluru, Karnataka',
    description: [
      'Led a 15+ member L1/L2 technical support team delivering 24x7 support for 2000+ global customers.',
      'Improved First Response Time by 35%, MTTR by 28%, and maintained >95% SLA adherence.',
      'Managed P1/P0 production escalations involving data pipelines, PostgreSQL, MySQL, Snowflake, and API integrations.',
      'Built structured incident review and RCA framework, reducing repeat issue categories by 22%.',
      'Drove AI-assisted ticket classification and knowledge base improvements, reducing repetitive queries by ~18%.'
    ],
  },
  {
    id: '2',
    company: 'Hevo Technologies Pvt Ltd',
    position: 'Product Support Engineer',
    duration: '2019 - 2022',
    location: 'Bengaluru, Karnataka',
    description: [
      'Provided L2 technical support for cloud-based ELT platform, troubleshooting data pipelines, REST APIs, and databases.',
      'Resolved complex production incidents involving authentication failures, schema drift, CDC lag, and API rate limits with >92% SLA.',
      'Led customer-facing debugging sessions with enterprise clients, analyzing logs and restoring critical data flows.',
      'Partnered with Engineering to reproduce defects, provide RCA documentation, and influence platform reliability improvements.',
      'Reduced recurring ticket volume by identifying failure patterns and contributing to automation scripts.'
    ],
  },
  {
    id: '3',
    company: 'Sprinklr',
    position: 'Product Support Engineer',
    duration: '2018 - 2019',
    location: 'Bengaluru, Karnataka',
    description: [
      'Supported Sprinklr Ads platform for enterprise customers like McDonald\'s, Nike, and Adidas.',
      'Conducted root cause analyses on recurring issues, implementing preventive measures.',
      'Managed critical product escalations, coordinating efforts across teams for prompt resolutions.',
      'Contributed to new product development by providing valuable user feedback from support perspective.',
    ],
  },
  {
    id: '4',
    company: 'Yahoo! Inc.',
    position: 'Technical Solutions Engineer',
    duration: '2015 - 2018',
    location: 'Bengaluru, Karnataka',
    description: [
      'Supported Yahoo\'s DSP and Premium Ad Serving systems, resolving campaign creation and delivery issues.',
      'Investigated ad serving failures including tracking pixel misfires, targeting mismatches, and budget pacing issues.',
      'Partnered with Product and Engineering to escalate platform defects and improve operational workflows.',
    ],
  },
  {
    id: '5',
    company: 'Minacs',
    position: 'Associate Analyst',
    duration: '2014 - 2015',
    location: 'Bengaluru, Karnataka',
    description: [
      'Handled high-volume email support for iPhone and iTunes products, consistently meeting SLAs.',
      'Diagnosed account, billing, sync, and software-related issues; routed complex cases to specialized teams.',
      'Improved turnaround time by documenting structured SOPs and knowledge articles.',
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
  // Cloud & Data
  { name: 'PostgreSQL / MySQL', level: 90, category: 'Cloud & Data' },
  { name: 'Snowflake / Redshift', level: 85, category: 'Cloud & Data' },
  { name: 'AWS / GCP / Azure', level: 80, category: 'Cloud & Data' },
  { name: 'Data Pipelines & CDC', level: 90, category: 'Cloud & Data' },
  { name: 'REST APIs & Webhooks', level: 85, category: 'Cloud & Data' },
  // AI & Automation
  { name: 'LLM Integration (OpenAI, Claude)', level: 85, category: 'AI & Automation' },
  { name: 'RAG & Vector Databases', level: 80, category: 'AI & Automation' },
  { name: 'Python CLI Tools', level: 85, category: 'AI & Automation' },
  { name: 'AI-Powered Support Tools', level: 90, category: 'AI & Automation' },
  // Operations
  { name: 'P0/P1 Incident Management', level: 95, category: 'Operations' },
  { name: 'SLA & MTTR Optimization', level: 95, category: 'Operations' },
  { name: 'Enterprise Escalations', level: 95, category: 'Operations' },
  { name: 'RCA & Production Debugging', level: 90, category: 'Operations' },
  // Leadership
  { name: 'Cross-functional Execution', level: 95, category: 'Leadership' },
  { name: 'Team Leadership (15+ members)', level: 90, category: 'Leadership' },
  { name: 'Stakeholder Alignment', level: 90, category: 'Leadership' },
  { name: 'Product Roadmap Ownership', level: 85, category: 'Leadership' },
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
    name: 'Hevo Assistant',
    description: 'Chat-to-action CLI for managing Hevo Data pipelines using natural language. Ask questions, check status, pause/resume pipelines, and more through conversation. RAG-powered with multiple LLM providers.',
    category: 'AI & DevOps',
    icon: '🤖',
    link: 'https://github.com/Legolasan/hevo-app',
    technologies: ['Python', 'OpenAI', 'Pinecone', 'RAG', 'CLI'],
  },
  {
    id: '2',
    name: 'Customer Session Analyser',
    description: 'Track and analyze customer interactions with products to derive actionable insights. Perfect for support teams and product managers.',
    category: 'Analytics',
    icon: '📊',
    link: 'https://github.com/Legolasan/customer_session_analyser',
    technologies: ['Python', 'Flask', 'PostgreSQL'],
  },
  {
    id: '3',
    name: 'Snowflake Credit Monitor',
    description: 'Streamlit dashboard to monitor and analyze Snowflake credit consumption with real-time tracking. Identify costly queries, track warehouse efficiency, and optimize cloud database costs.',
    category: 'Analytics',
    icon: '💰',
    link: 'https://github.com/Legolasan/sf_credit_monitor',
    technologies: ['Python', 'Streamlit', 'Snowflake'],
  },
  {
    id: '4',
    name: 'Zendesk Test Case Generator',
    description: 'Automatically generate test cases from Zendesk tickets for regression and functional testing. Streamlines QA workflows.',
    category: 'Testing & QA',
    icon: '🧪',
    link: 'https://github.com/Legolasan/zendesk_analyser',
    technologies: ['Python', 'Zendesk API'],
  },
  {
    id: '5',
    name: 'Snowflake Key Rotation CLI',
    description: 'Rotate Snowflake key-pairs directly from your terminal. Published as a PyPI package for easy installation and use.',
    category: 'Security & DevOps',
    icon: '🔐',
    link: 'https://github.com/Legolasan/sf_rotation',
    technologies: ['Python', 'Snowflake', 'PyPI'],
  },
  {
    id: '6',
    name: 'Weekly Reporting Tracker',
    description: 'Personal productivity tool to track work items week over week. Stay organized and never miss important tasks.',
    category: 'Productivity',
    icon: '📝',
    link: 'https://github.com/Legolasan/weekly_reporting',
    technologies: ['Python', 'Flask', 'PostgreSQL'],
  },
  {
    id: '7',
    name: 'Connector Research Platform',
    description: 'Enterprise-ready system for generating comprehensive research documents about data integration connectors. Combines multi-source knowledge retrieval with AI-powered analysis and built-in hallucination prevention.',
    category: 'AI & Documentation',
    icon: '🔬',
    link: 'https://github.com/Legolasan/connector_research',
    technologies: ['Python', 'OpenAI', 'CLI'],
  },
  {
    id: '8',
    name: 'Snowflake Query Monitor',
    description: 'Streamlit dashboard for real-time Snowflake query monitoring. Track query performance, identify bottlenecks, detect long-running queries, and analyze warehouse credit consumption.',
    category: 'Analytics',
    icon: '📈',
    link: 'https://github.com/Legolasan/sf_monitor',
    technologies: ['Python', 'Streamlit', 'Snowflake'],
  },
  {
    id: '9',
    name: 'MySQL Test Toolkit',
    description: 'Docker-based toolkit for testing ETL/CDC replication scenarios. Simulate binlog corruption, connection issues, GTID gaps, and network problems in a controlled environment.',
    category: 'Testing & QA',
    icon: '🐳',
    link: 'https://github.com/Legolasan/mysql-test-toolkit',
    technologies: ['Docker', 'MySQL', 'Shell'],
  },
  {
    id: '10',
    name: 'Multi-Agent Coding Assistant',
    description: 'AI-powered CLI that indexes codebases and deploys specialized agents for research, implementation, testing, code review, and PRD generation. Features RAG-based semantic search and customizable personas.',
    category: 'AI & Development',
    icon: '🤖',
    link: 'https://github.com/Legolasan/codebase_ai',
    technologies: ['Python', 'LangGraph', 'ChromaDB', 'Claude/GPT-4'],
  },
  {
    id: '11',
    name: 'SQL Learn',
    description: 'Interactive visual learning platform for mastering MySQL concepts. Features real-time query visualization, animated B-Tree demos, InnoDB crash recovery simulations, and step-by-step query execution explanations.',
    category: 'Learning & Education',
    icon: '🎓',
    link: 'https://github.com/Legolasan/sql_learn',
    technologies: ['Python', 'Flask', 'MySQL'],
  },
  {
    id: '12',
    name: 'Unix & Networking Lab',
    description: 'Interactive learning platform for Unix command-line and networking concepts. Practice real commands in a safe Docker sandbox environment with structured lessons from beginner to advanced.',
    category: 'Learning & Education',
    icon: '🐧',
    link: 'https://github.com/Legolasan/unix_networking',
    technologies: ['Python', 'Flask', 'Docker'],
  },
  {
    id: '13',
    name: 'Snowflake MCP Server',
    description: 'Model Context Protocol server enabling Claude to interact with Snowflake data warehouses through natural language. Execute SQL queries, list tables, describe schemas, and monitor data freshness—all through conversation.',
    category: 'AI & DevOps',
    icon: '❄️',
    link: 'https://github.com/Legolasan/snowflake_mcp',
    technologies: ['Python', 'MCP', 'Snowflake'],
  },
  {
    id: '14',
    name: 'Zendesk Ticket Analysis System',
    description: 'AI-powered customer satisfaction analysis for Zendesk support tickets. Automatically analyzes solved tickets using Claude/GPT to evaluate tonality, professionalism, empathy, and responsiveness. Provides interactive dashboards for tracking agent performance and customer satisfaction trends.',
    category: 'AI & Analytics',
    icon: '🎯',
    link: 'https://github.com/Legolasan/zendesk_ticket_training',
    technologies: ['Python', 'Flask', 'PostgreSQL', 'Claude/GPT', 'Zendesk API'],
  },
];

export const personalInfo = {
  name: 'Arun Sundararajan',
  title: 'Technical Operations Manager',
  email: 'arunsunderraj17@gmail.com',
  phone: '+91 8197882503',
  location: 'Bengaluru, Karnataka',
  bio: "Cloud SaaS leader with 13+ years spanning technical support, operations leadership, and product management. I enjoy understanding how systems break in the real world and turning those lessons into platform reliability improvements.",
  bioExtended: [
    "At Hevo, I own the roadmap for connector reliability and platform hardening across 20+ integrations, driving cross-functional execution with Engineering, Support, and SRE teams.",
    "I've progressed from hands-on troubleshooting of distributed data pipelines and databases to leading global support teams. My work spans PostgreSQL, MySQL, Snowflake, Redshift, and cloud platforms like AWS, GCP, and Azure.",
    "Strong background in incident management, enterprise escalations, and translating customer pain points into scalable engineering improvements."
  ],
  socialLinks: {
    github: 'https://github.com/legolasan',
    linkedin: 'https://linkedin.com/in/arunsunderraj',
    email: 'mailto:arunsunderraj@outlook.com',
  },
};

export const learningModules: LearningModule[] = [
  {
    id: '1',
    name: 'MySQL Learning',
    description: 'Interactive visual learning platform for mastering MySQL concepts. Learn SQL through hands-on experimentation with real-time query visualization, step-by-step explanations, and animated demonstrations.',
    category: 'Database',
    icon: '🐬',
    link: '/learn/mysql/',
    topics: ['SQL Basics', 'B-Tree Indexes', 'Joins', 'Query Optimization', 'Transactions', 'Window Functions', 'InnoDB Internals'],
    difficulty: 'All Levels',
  },
  {
    id: '2',
    name: 'Unix & Networking',
    description: 'Interactive learning platform for Unix command-line and networking concepts. Practice real commands in a safe Docker sandbox environment with structured lessons from beginner to advanced.',
    category: 'Systems',
    icon: '🐧',
    link: '/learn/unix/',
    topics: ['File System', 'Processes', 'Permissions', 'Networking', 'Shell Scripting', 'System Administration'],
    difficulty: 'All Levels',
  },
];

