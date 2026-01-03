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
  category: 'frontend' | 'backend' | 'tools' | 'other';
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'A full-stack e-commerce solution with payment integration, user authentication, and admin dashboard.',
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe'],
    image: '/images/project1.jpg',
    link: 'https://example.com',
    github: 'https://github.com/example',
  },
  {
    id: '2',
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates and team collaboration features.',
    technologies: ['React', 'Firebase', 'Material-UI', 'Redux'],
    image: '/images/project2.jpg',
    link: 'https://example.com',
    github: 'https://github.com/example',
  },
  {
    id: '3',
    title: 'Weather Dashboard',
    description: 'A beautiful weather dashboard with location-based forecasts and interactive maps.',
    technologies: ['Vue.js', 'OpenWeather API', 'Chart.js', 'Tailwind CSS'],
    image: '/images/project3.jpg',
    link: 'https://example.com',
    github: 'https://github.com/example',
  },
  {
    id: '4',
    title: 'Social Media Analytics',
    description: 'Analytics platform for tracking social media performance with detailed insights and reports.',
    technologies: ['Python', 'Django', 'React', 'D3.js', 'PostgreSQL'],
    image: '/images/project4.jpg',
    link: 'https://example.com',
    github: 'https://github.com/example',
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
      'Handling incoming queries/Issues for the Hevo ETL platform.',
'Solved >70% cases under 24 hours.',
'Kept the referral to engineering below 30%. Keep iterating over the referred Jiras to make sure, we have KB OR Troubleshooting article created.',
'Kept improving the knowledge space by contributing more than 5 KBs a week.',
'Maintained the CSAT more than 90% overall in my tenure.'
    ],
  },
  {
    id: '5',
    company: 'Yahoo Inc',
    position: 'Product Support Engineer',
    duration: '2015 - 2018',
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
    id: '6',
    company: 'Minacs',
    position: 'Associate Analyst',
    duration: '2014 - 2014',
    location: 'Bengaluru, Karnataka',
    description: [
      'Handling incoming queries/Issues for the Hevo ETL platform.',
'Solved >70% cases under 24 hours.',
'Kept the referral to engineering below 30%. Keep iterating over the referred Jiras to make sure, we have KB OR Troubleshooting article created.',
'Kept improving the knowledge space by contributing more than 5 KBs a week.',
'Maintained the CSAT more than 90% overall in my tenure.'
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
  // Frontend
  { name: 'React', level: 90, category: 'frontend' },
  { name: 'Next.js', level: 85, category: 'frontend' },
  { name: 'TypeScript', level: 88, category: 'frontend' },
  { name: 'JavaScript', level: 92, category: 'frontend' },
  { name: 'HTML/CSS', level: 95, category: 'frontend' },
  { name: 'Tailwind CSS', level: 90, category: 'frontend' },
  { name: 'Vue.js', level: 75, category: 'frontend' },
  // Backend
  { name: 'Node.js', level: 85, category: 'backend' },
  { name: 'Python', level: 80, category: 'backend' },
  { name: 'PostgreSQL', level: 75, category: 'backend' },
  { name: 'MongoDB', level: 70, category: 'backend' },
  { name: 'Express.js', level: 85, category: 'backend' },
  // Tools
  { name: 'Git', level: 90, category: 'tools' },
  { name: 'Docker', level: 75, category: 'tools' },
  { name: 'AWS', level: 70, category: 'tools' },
  { name: 'CI/CD', level: 80, category: 'tools' },
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

export const personalInfo = {
  name: 'Arun Sundararajan',
  title: 'Product Manager',
  email: 'arunsunderraj@outlook.com',
  phone: '+91 8197882503',
  location: 'Bengaluru, Karnataka',
  bio: 'Building data platforms where customer pain, technical rigor, and execution meet.',
  socialLinks: {
    github: 'https://github.com/legolsan',
    linkedin: 'https://linkedin.com/in/arunsunderraj',
    email: 'mailto:arunsunderraj@outlook.com',
  },
};

