export const stats = [
  { label: 'Years Experience', value: '6+' },
  { label: 'Projects Delivered', value: '40+' },
  { label: 'Technologies', value: '25+' },
  { label: 'API Endpoints Built', value: '150+' },
  { label: 'AI Integrations', value: '18+' },
  { label: 'Hardware Systems', value: '12+' },
  { label: 'CI/CD Pipelines', value: '20+' },
];

export const skillGroups = [
  {
    name: 'Backend',
    items: ['Python', 'FastAPI', 'Flask', 'Django', 'REST APIs', 'WebSockets', 'AsyncIO', 'PostgreSQL'],
  },
  {
    name: 'Frontend',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
  },
  {
    name: 'AI & LLM',
    items: ['OpenAI', 'LangChain', 'RAG', 'Vector Databases', 'Agent Systems', 'Prompt Engineering', 'Streaming Architectures'],
  },
  {
    name: 'DevOps',
    items: ['Docker', 'Nginx', 'Linux', 'GitHub Actions', 'CI/CD', 'PM2', 'Reverse Proxy'],
  },
  {
    name: 'Microsoft Stack',
    items: ['.NET', 'C#', 'Windows Services', 'WinForms', 'WPF'],
  },
  {
    name: 'Hardware & Embedded',
    items: ['Arduino', 'ESP32', 'NodeMCU', 'Sensors', 'Robotics', 'IoT Systems', 'MQTT'],
  },
];

export const projectTabs = [
  {
    key: 'software',
    title: 'Software Projects',
    projects: ['MeetFlash', 'BullRun', 'Orbit'],
  },
  {
    key: 'ai',
    title: 'AI Projects',
    projects: ['AI Agents', 'RAG Systems', 'LLM Assistants'],
  },
  {
    key: 'hardware',
    title: 'Hardware Projects',
    projects: ['ESP32 Systems', 'IoT Dashboards', 'Embedded Telemetry'],
  },
  {
    key: 'automation',
    title: 'Automation Projects',
    projects: ['Automation Frameworks', 'Deployment Workflows', 'Monitoring Pipelines'],
  },
];

export const projectCards = [
  {
    name: 'MeetFlash',
    tab: 'software',
    type: 'Software',
    challenge: 'Real-time meeting intelligence with low-latency capture and retrieval.',
    stack: ['Next.js', 'FastAPI', 'OpenAI', 'PostgreSQL'],
    metrics: ['99.9% uptime', 'Sub-second search', 'Multi-tenant'],
  },
  {
    name: 'BullRun',
    tab: 'software',
    type: 'Engineering platform',
    challenge: 'High-throughput workflows with resilient orchestration and monitoring.',
    stack: ['React', 'Python', 'Docker', 'GitHub Actions'],
    metrics: ['150+ endpoints', 'Automated deploys', 'Observability'],
  },
  {
    name: 'Orbit',
    tab: 'software',
    type: 'Realtime system',
    challenge: 'Event-driven architecture for live dashboards and telemetry.',
    stack: ['TypeScript', 'WebSockets', 'Redis', 'Framer Motion'],
    metrics: ['<100ms updates', 'Stream processing', 'Edge ready'],
  },
  {
    name: 'IoT Dashboards',
    tab: 'hardware',
    type: 'Hardware',
    challenge: 'Unified telemetry surfaces for devices, alerts, and field operations.',
    stack: ['Next.js', 'MQTT', 'ESP32', 'Charts'],
    metrics: ['Live sensors', 'Device mapping', 'Alert routing'],
  },
  {
    name: 'ESP32 Systems',
    tab: 'hardware',
    type: 'Embedded',
    challenge: 'Firmware and control systems designed for stable real-world deployment.',
    stack: ['ESP32', 'Arduino', 'MQTT', 'Sensors'],
    metrics: ['Low-power', 'OTA ready', 'Telemetry rich'],
  },
  {
    name: 'AI Agents',
    tab: 'ai',
    type: 'AI',
    challenge: 'Tool-using agent workflows with controlled state and observability.',
    stack: ['OpenAI', 'LangChain', 'Vector DB', 'Python'],
    metrics: ['Tool routing', 'Streaming', 'Guardrails'],
  },
  {
    name: 'RAG Systems',
    tab: 'ai',
    type: 'AI',
    challenge: 'Retrieval pipelines tuned for grounded answers and fast iteration.',
    stack: ['OpenAI', 'Embeddings', 'Vector DB', 'Evaluation'],
    metrics: ['Relevance scoring', 'Chunking strategy', 'Citations'],
  },
  {
    name: 'LLM Assistants',
    tab: 'ai',
    type: 'AI',
    challenge: 'Conversational interfaces with streaming, memory, and tool execution.',
    stack: ['Next.js', 'Streaming', 'Function Calling', 'Observability'],
    metrics: ['Low latency', 'Live tokens', 'Context aware'],
  },
  {
    name: 'IoT Dashboards',
    tab: 'hardware',
    type: 'Hardware',
    challenge: 'Unified telemetry surfaces for devices, alerts, and field operations.',
    stack: ['Next.js', 'MQTT', 'ESP32', 'Charts'],
    metrics: ['Live sensors', 'Device mapping', 'Alert routing'],
  },
  {
    name: 'ESP32 Systems',
    tab: 'hardware',
    type: 'Embedded',
    challenge: 'Firmware and control systems designed for stable real-world deployment.',
    stack: ['ESP32', 'Arduino', 'MQTT', 'Sensors'],
    metrics: ['Low-power', 'OTA ready', 'Telemetry rich'],
  },
  {
    name: 'Embedded Telemetry',
    tab: 'hardware',
    type: 'Hardware',
    challenge: 'Device telemetry, diagnostics, and field data pipelines built for clarity.',
    stack: ['ESP32', 'MQTT', 'Dashboards', 'Alerts'],
    metrics: ['Field visibility', 'Live diagnostics', 'Signal health'],
  },
  {
    name: 'Deployment Workflows',
    tab: 'automation',
    type: 'Automation',
    challenge: 'Release orchestration with consistent rollout and rollback behavior.',
    stack: ['GitHub Actions', 'Docker', 'Nginx', 'PM2'],
    metrics: ['Blue/green', 'Checks', 'Release gates'],
  },
  {
    name: 'Monitoring Pipelines',
    tab: 'automation',
    type: 'Automation',
    challenge: 'Automated telemetry and alerting for production services.',
    stack: ['Dashboards', 'Alerts', 'Logs', 'Metrics'],
    metrics: ['SLO tracking', 'Health checks', 'Traceability'],
  },
  {
    name: 'Automation Frameworks',
    tab: 'automation',
    type: 'Automation',
    challenge: 'Production-grade workflow automation for repeatable operations.',
    stack: ['Python', 'FastAPI', 'Docker', 'CI/CD'],
    metrics: ['Task orchestration', 'Retries', 'Audit logs'],
  },
];

export const timeline = [
  'Education',
  'FORVIA HELLA',
  'Mercedes-Benz Project',
  '10xTechClub',
  'Research Analyst',
  'Full-Stack Engineer',
];

export const blogPosts = [
  {
    slug: 'designing-realtime-engineering-interfaces',
    title: 'Designing Real-Time Engineering Interfaces',
    category: 'Full Stack',
    excerpt: 'How to make data-heavy systems feel calm, understandable, and premium.',
  },
  {
    slug: 'building-rag-systems-for-production',
    title: 'Building RAG Systems for Production',
    category: 'AI',
    excerpt: 'A practical blueprint for retrieval, ranking, observability, and latency.',
  },
  {
    slug: 'deploying-hardware-and-cloud-as-one-system',
    title: 'Deploying Hardware and Cloud as One System',
    category: 'Embedded',
    excerpt: 'A systems view of firmware, APIs, dashboards, and operations.',
  },
];
