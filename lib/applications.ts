// Shared applications and candidate profile mock data

export type Application = {
  id: number;
  job: string;
  company: string;
  applied: string;
  resume: string;
  contact: string;
  date: string;
  documents: string[];
  candidate: CandidateProfile;
};

export type CandidateProfile = {
  name: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  nationality: string;
  summary: string;
  currentRole: string;
  company: string;
  experience: string;
  industry: string;
  degree: string;
  institution: string;
  year: string;
  grade: string;
  skills: string; // comma separated for quick pill rendering
  certifications: string; // comma separated list
  jobType: string;
  salaryExpectation: string;
  preferredLocation: string;
  availability: string;
  appliedFor: string;
  appliedDate: string;
  status: string;
  resumeFilename: string;
  coverLetter: string;
  documentsList: string[];
  rating: number;
  tier: "Platinum" | "Gold" | "Silver" | "Blue" | string;
};

export const applications: Application[] = [
  {
    id: 1,
    job: "Senior Developer",
    company: "Tech Solutions LLC",
    applied: "2 days ago",
    resume: "John Doe - Senior Developer Resume.pdf",
    contact: "john.doe@email.com",
    date: "2024-07-10 14:30",
    documents: ["CoverLetter.pdf"],
    candidate: {
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+971 50 123 4567",
      location: "Dubai, UAE",
      dateOfBirth: "1990-05-15",
      nationality: "Indian",
      summary:
        "Experienced software engineer with 5+ years of experience in developing scalable web applications. Passionate about clean code and user experience.",
      currentRole: "Senior Software Engineer",
      company: "TechCorp Solutions",
      experience: "5 years",
      industry: "Technology",
      degree: "Bachelor of Engineering in Computer Science",
      institution: "University of Dubai",
      year: "2018",
      grade: "3.8/4.0",
      skills: "JavaScript, React, Node.js, Python, AWS, Docker, Git",
      certifications: "AWS Certified Developer, Google Cloud Professional",
      jobType: "Full-time",
      salaryExpectation: "15,000 - 25,000 AED",
      preferredLocation: "Dubai, Abu Dhabi",
      availability: "2 weeks notice",
      appliedFor: "Senior Developer",
      appliedDate: "2024-07-12",
      status: "Shortlisted",
      resumeFilename: "John Doe - Senior Developer Resume.pdf",
      coverLetter: "Cover Letter - John Doe.pdf",
      documentsList: ["Reference Letter.pdf", "Certification.pdf"],
      rating: 4.5,
      tier: "Gold",
    },
  },
  {
    id: 2,
    job: "Marketing Manager",
    company: "Digital Agency",
    applied: "5 days ago",
    resume: "Jane Smith - Marketing Manager Resume.pdf",
    contact: "jane.smith@email.com",
    date: "2024-07-07 10:00",
    documents: [],
    candidate: {
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+971 50 987 6543",
      location: "Dubai Internet City, UAE",
      dateOfBirth: "1992-09-22",
      nationality: "British",
      summary:
        "Marketing professional with 3+ years experience leading omnichannel campaigns and driving measurable growth.",
      currentRole: "Marketing Manager",
      company: "Digital Agency",
      experience: "3 years",
      industry: "Marketing",
      degree: "BBA in Marketing",
      institution: "University of Birmingham",
      year: "2016",
      grade: "First Class",
      skills: "SEO, SEM, Google Analytics, HubSpot, Content Strategy, Social Media",
      certifications: "Google Ads Certified, HubSpot Inbound",
      jobType: "Full-time",
      salaryExpectation: "12,000 - 18,000 AED",
      preferredLocation: "Dubai",
      availability: "Immediate",
      appliedFor: "Marketing Manager",
      appliedDate: "2024-07-07",
      status: "Shortlisted",
      resumeFilename: "Jane Smith - Marketing Manager Resume.pdf",
      coverLetter: "Cover Letter - Jane Smith.pdf",
      documentsList: ["Portfolio.pdf"],
      rating: 4.2,
      tier: "Silver",
    },
  },
  {
    id: 3,
    job: "Project Coordinator",
    company: "Construction Co.",
    applied: "1 week ago",
    resume: "Alex Lee - Project Coordinator Resume.pdf",
    contact: "alex.lee@email.com",
    date: "2024-07-03 09:15",
    documents: ["ProjectPlan.pdf"],
    candidate: {
      name: "Alex Lee",
      email: "alex.lee@email.com",
      phone: "+971 55 123 9876",
      location: "Abu Dhabi, UAE",
      dateOfBirth: "1994-02-28",
      nationality: "Canadian",
      summary:
        "Detail-oriented project coordinator supporting construction projects and ensuring smooth execution from start to finish.",
      currentRole: "Project Coordinator",
      company: "Construction Co.",
      experience: "2+ years",
      industry: "Construction",
      degree: "BSc in Civil Engineering",
      institution: "University of Toronto",
      year: "2017",
      grade: "Honors",
      skills: "Microsoft Project, Scheduling, Vendor Management, Communication",
      certifications: "PMP (in progress)",
      jobType: "Full-time",
      salaryExpectation: "8,000 - 12,000 AED",
      preferredLocation: "Abu Dhabi",
      availability: "1 month",
      appliedFor: "Project Coordinator",
      appliedDate: "2024-07-03",
      status: "Interview Scheduled",
      resumeFilename: "Alex Lee - Project Coordinator Resume.pdf",
      coverLetter: "Cover Letter - Alex Lee.pdf",
      documentsList: ["Reference Letter.pdf"],
      rating: 4.0,
      tier: "Blue",
    },
  },
];

export function getApplicationById(id: number): Application | undefined {
  return applications.find((a) => a.id === id);
}


