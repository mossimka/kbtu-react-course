export type Experience = {
    period: string;
    role: string;
    company: string;
    location: string;
    description: string;
    tags: string[];
};

export const experiences: Experience[] = [
    {
        period: 'Jun 2026 — now',
        role: 'Software Engineer',
        company: 'Netcracker Technology · OSS Team',
        location: 'Remote',
        description:
            'Working on enterprise OSS solutions as a software engineer, contributing to production-minded systems and collaborating across engineering teams.',
        tags: ['Software engineering', 'OSS', 'Enterprise systems'],
    },
    {
        period: 'Dec 2025 — May 2026',
        role: 'Frontend Developer',
        company: 'Bim Consult Cloud',
        location: 'Remote',
        description:
            'Created frontend modules for an engineering platform covering analytics, learning, and project workflows.',
        tags: ['React', 'TypeScript', 'Next.js', 'MUI', 'FastAPI'],
    },
    {
        period: 'Sep 2025 — Oct 2025',
        role: 'Frontend Developer · Contract',
        company: 'AlmaWine',
        location: 'Almaty, Kazakhstan',
        description:
            'Shipped a responsive loyalty-program landing page and partnered with marketing to improve UX, SEO, and Core Web Vitals.',
        tags: ['React', 'Tailwind CSS', 'SEO', 'Performance'],
    },
    {
        period: 'Jun 2025 — Aug 2025',
        role: 'Frontend Developer · Fullstack',
        company: 'nFactorial Incubator',
        location: 'Almaty, Kazakhstan',
        description:
            'Built a high-performance collaborative app with real-time interactions, WebSockets, and carefully synchronized client state.',
        tags: ['React', 'Next.js', 'WebSockets', 'TypeScript'],
    },
];

export const skills = [
    ['Frontend', 'React · Next.js · TypeScript · JavaScript · HTML · CSS'],
    ['State & data', 'Redux · Zustand · TanStack Query · REST API · Axios'],
    ['UI systems', 'Ant Design · Tailwind CSS · MUI · Shadcn UI · Figma'],
    ['Backend basics', 'Express · Node.js · Python · FastAPI · Django · PostgreSQL · SQL'],
    ['Workflow', 'Git · Docker · Postman · Azure · Vercel'],
];
