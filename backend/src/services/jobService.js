import { v4 as uuidv4 } from 'uuid';

const MOCK_JOBS = [
  {
    id: 'mock-1', title: 'Senior React Developer', company: 'TechCorp Solutions',
    location: 'San Francisco, CA', type: 'full-time', workMode: 'remote',
    description: 'We are looking for a Senior React Developer with 5+ years of experience. Build scalable web applications using React, TypeScript, Node.js, GraphQL, and AWS. Experience with Redux, React Query, and modern testing frameworks required.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Redux'],
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-2', title: 'Full Stack Engineer', company: 'StartupAI',
    location: 'New York, NY', type: 'full-time', workMode: 'hybrid',
    description: 'Join our team as a Full Stack Engineer working on cutting-edge AI products. Stack: React, Next.js, Python, FastAPI, PostgreSQL, Docker, Kubernetes. 3+ years experience required.',
    skills: ['React', 'Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'Docker'],
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-3', title: 'Machine Learning Engineer', company: 'DataDriven Inc',
    location: 'Austin, TX', type: 'full-time', workMode: 'on-site',
    description: 'Build and deploy ML models at scale. Requirements: Python, PyTorch, TensorFlow, scikit-learn, MLflow, Kubernetes. Experience with LLMs and vector databases is a plus.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'scikit-learn', 'MLflow', 'LLMs'],
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-4', title: 'Frontend Developer', company: 'DesignFirst',
    location: 'Seattle, WA', type: 'full-time', workMode: 'remote',
    description: 'Create stunning user interfaces with React, Vue.js, CSS animations, Tailwind CSS, and Figma. 2+ years experience. Strong eye for design and attention to detail.',
    skills: ['React', 'Vue.js', 'CSS', 'Tailwind', 'Figma', 'TypeScript'],
    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-5', title: 'Backend Node.js Engineer', company: 'CloudScale',
    location: 'Remote', type: 'full-time', workMode: 'remote',
    description: 'Design and build RESTful APIs and microservices with Node.js, Express, Fastify, PostgreSQL, Redis, and RabbitMQ. Experience with AWS or GCP required.',
    skills: ['Node.js', 'Express', 'Fastify', 'PostgreSQL', 'Redis', 'AWS'],
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-6', title: 'DevOps Engineer', company: 'Infra360',
    location: 'Chicago, IL', type: 'contract', workMode: 'hybrid',
    description: 'Manage CI/CD pipelines, Kubernetes clusters, Terraform, Ansible, Docker, and cloud infrastructure on AWS. Experience with monitoring tools (Prometheus, Grafana) required.',
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD', 'Linux'],
    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-7', title: 'Python Backend Developer', company: 'Fintech Pulse',
    location: 'Boston, MA', type: 'full-time', workMode: 'hybrid',
    description: 'Build robust financial APIs with Python, Django, FastAPI, Celery, PostgreSQL, and Redis. Knowledge of financial protocols and security best practices required.',
    skills: ['Python', 'Django', 'FastAPI', 'Celery', 'PostgreSQL', 'Redis'],
    postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-8', title: 'iOS Developer', company: 'MobileFirst',
    location: 'Los Angeles, CA', type: 'full-time', workMode: 'on-site',
    description: 'Develop high-quality iOS applications using Swift, SwiftUI, Combine, Core Data, and ARKit. 3+ years iOS development experience required.',
    skills: ['Swift', 'SwiftUI', 'iOS', 'Xcode', 'Core Data', 'ARKit'],
    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-9', title: 'Data Engineer', company: 'Analytics Pro',
    location: 'Denver, CO', type: 'full-time', workMode: 'remote',
    description: 'Design data pipelines using Apache Spark, Kafka, Airflow, dbt, Snowflake, and Python. Experience with streaming data and real-time analytics preferred.',
    skills: ['Python', 'Apache Spark', 'Kafka', 'Airflow', 'Snowflake', 'dbt'],
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-10', title: 'Junior React Intern', company: 'GrowthLabs',
    location: 'Remote', type: 'internship', workMode: 'remote',
    description: 'Exciting internship for React enthusiasts. Work with React, JavaScript, HTML, CSS, and Git. Learn from senior developers and contribute to real products.',
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    postedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-11', title: 'AI/LLM Engineer', company: 'Cognify AI',
    location: 'San Francisco, CA', type: 'full-time', workMode: 'hybrid',
    description: 'Build production LLM applications using LangChain, LangGraph, OpenAI, Anthropic, RAG pipelines, vector databases (Pinecone, Weaviate), and Python.',
    skills: ['Python', 'LangChain', 'LangGraph', 'OpenAI', 'RAG', 'Vector DB'],
    postedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-12', title: 'Go Backend Engineer', company: 'Microservices Corp',
    location: 'Austin, TX', type: 'full-time', workMode: 'remote',
    description: 'Build high-performance microservices with Go, gRPC, Protobuf, Kafka, Redis, and PostgreSQL. Strong understanding of concurrency patterns required.',
    skills: ['Go', 'gRPC', 'Protobuf', 'Kafka', 'Redis', 'PostgreSQL'],
    postedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-13', title: 'React Native Developer', company: 'AppForge',
    location: 'New York, NY', type: 'full-time', workMode: 'hybrid',
    description: 'Build cross-platform mobile apps with React Native, Expo, Redux Toolkit, and GraphQL. 3+ years React Native experience. Experience with iOS and Android deployment.',
    skills: ['React Native', 'Expo', 'Redux', 'GraphQL', 'iOS', 'Android'],
    postedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-14', title: 'Cloud Architect', company: 'CloudNative Inc',
    location: 'Seattle, WA', type: 'full-time', workMode: 'remote',
    description: 'Design multi-cloud architectures using AWS, GCP, Azure, Terraform, Kubernetes, and service mesh technologies. 8+ years experience required.',
    skills: ['AWS', 'GCP', 'Azure', 'Terraform', 'Kubernetes', 'Architecture'],
    postedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-15', title: 'Part-time Web Developer', company: 'Agency X',
    location: 'Portland, OR', type: 'part-time', workMode: 'remote',
    description: 'Work on client websites using HTML, CSS, JavaScript, WordPress, and React. Flexible hours, 20 hours per week. Portfolio required.',
    skills: ['HTML', 'CSS', 'JavaScript', 'WordPress', 'React', 'Figma'],
    postedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
  {
    id: 'mock-16', title: 'Security Engineer', company: 'SecureNet',
    location: 'Washington, DC', type: 'full-time', workMode: 'on-site',
    description: 'Implement security protocols, conduct penetration testing, manage SIEM tools, and ensure compliance with SOC2 and ISO27001 standards.',
    skills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Python', 'Linux', 'Compliance'],
    postedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    applyUrl: 'https://remotive.com/remote-jobs/software-dev',
  },
];

export async function fetchJobs(filters = {}) {
  // Always start with mock jobs — guaranteed to work
  let jobs = MOCK_JOBS.map(j => ({ ...j }));

  // Optionally enrich with live Remotive data
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=20', {
      signal: controller.signal,
      headers: { 'User-Agent': 'NexusHire/1.0' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const live = (data.jobs || []).map(job => ({
        id: `rem-${job.id}`,
        title: job.title,
        company: job.company_name,
        location: job.candidate_required_location || 'Remote',
        type: mapType(job.job_type),
        workMode: 'remote',
        description: stripHtml(job.description || '').substring(0, 500),
        skills: extractSkills((job.tags || []).join(' ') + ' ' + job.title),
        postedAt: job.publication_date,
        applyUrl: job.url,
      }));
      jobs = [...live, ...jobs];
    }
  } catch {
    // silently use mock data only
  }

  return applyFilters(jobs, filters);
}

function applyFilters(jobs, filters) {
  let out = [...jobs];

  if (filters.title) {
    const q = filters.title.toLowerCase();
    out = out.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.description.toLowerCase().includes(q)
    );
  }

  if (filters.skills?.length > 0) {
    out = out.filter(j =>
      filters.skills.some(s =>
        j.skills.some(js => js.toLowerCase().includes(s.toLowerCase())) ||
        j.description.toLowerCase().includes(s.toLowerCase())
      )
    );
  }

  if (filters.jobType && filters.jobType !== 'all') {
    out = out.filter(j => j.type === filters.jobType);
  }

  if (filters.workMode && filters.workMode !== 'all') {
    out = out.filter(j => j.workMode === filters.workMode);
  }

  if (filters.location) {
    const loc = filters.location.toLowerCase();
    out = out.filter(j => j.location.toLowerCase().includes(loc));
  }

  if (filters.datePosted && filters.datePosted !== 'any') {
    const cutoffs = { '24h': 864e5, 'week': 6048e5, 'month': 2592e6 };
    const cutoff = cutoffs[filters.datePosted];
    if (cutoff) out = out.filter(j => Date.now() - new Date(j.postedAt).getTime() <= cutoff);
  }

  return out;
}

function mapType(t) {
  return { full_time: 'full-time', part_time: 'part-time', contract: 'contract', internship: 'internship' }[t] || 'full-time';
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractSkills(text) {
  const all = ['React','Vue.js','Angular','Node.js','Python','Java','Go','TypeScript','JavaScript','SQL','PostgreSQL','MongoDB','Redis','Docker','Kubernetes','AWS','GCP','Azure','GraphQL','FastAPI','Django','Express','TensorFlow','PyTorch','LangChain','Next.js','Tailwind','Swift','Kotlin','Flutter','React Native'];
  return all.filter(s => text.toLowerCase().includes(s.toLowerCase())).slice(0, 6);
}
