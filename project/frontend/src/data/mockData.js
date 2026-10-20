export const currentLesson = {
  subject: 'Physics',
  topic: "Newton's Laws of Motion",
  conceptsTotal: 5,
  conceptsDone: 3,
};

export const streak = {
  days: 12,
  week: [
    { label: 'M', done: true },
    { label: 'T', done: true },
    { label: 'W', done: true },
    { label: 'T', done: true },
    { label: 'F', done: true },
    { label: 'S', done: true },
    { label: 'S', done: false },
  ],
};

export const student = {
  name: 'Student',
  initials: 'S',
};

export const learningProfile = {
  overallProgress: 68,
  avgAssessmentScore: 78,
  topicsStudiedCount: 12,
  subjectProgress: [
    { subject: 'Physics', percent: 72 },
    { subject: 'Mathematics', percent: 80 },
    { subject: 'Chemistry', percent: 55 },
    { subject: 'Biology', percent: 40 },
  ],
  topicsStudied: [
    { subject: 'Physics', topic: "Newton's Laws of Motion", status: 'In Progress' },
    { subject: 'Physics', topic: 'Work, Energy and Power', status: 'Completed' },
    { subject: 'Mathematics', topic: 'Quadratic Equations', status: 'Completed' },
    { subject: 'Chemistry', topic: 'Periodic Table Trends', status: 'Completed' },
    { subject: 'Biology', topic: 'Cell Structure', status: 'Not Started' },
  ],
  assessmentScores: [
    { topic: "Newton's Laws of Motion", score: 82, date: '18 Aug 2026' },
    { topic: 'Quadratic Equations', score: 91, date: '12 Aug 2026' },
    { topic: 'Periodic Table Trends', score: 64, date: '05 Aug 2026' },
    { topic: 'Work, Energy and Power', score: 74, date: '29 Jul 2026' },
  ],
  weakConcepts: ['Vector Resolution', 'Balancing Chemical Equations', 'Trigonometric Identities'],
  strongConcepts: ["Newton's Second Law", 'Quadratic Formula', 'Periodic Trends — Atomic Radius'],
  learningHistory: [
    { date: '31 Aug 2026', topic: "Newton's Laws of Motion", duration: '32 min', summary: 'Reviewed F = ma with real-life examples.' },
    { date: '28 Aug 2026', topic: 'Work, Energy and Power', duration: '40 min', summary: 'Completed topic with a 74% assessment score.' },
    { date: '24 Aug 2026', topic: 'Quadratic Equations', duration: '35 min', summary: 'Practiced factoring and the quadratic formula.' },
    { date: '20 Aug 2026', topic: 'Periodic Table Trends', duration: '28 min', summary: 'Covered atomic radius and ionization energy trends.' },
  ],
  currentLearningPath: [
    { title: 'Work, Energy and Power', status: 'completed' },
    { title: 'Quadratic Equations', status: 'completed' },
    { title: "Newton's Laws of Motion", status: 'current' },
    { title: 'Circular Motion', status: 'upcoming' },
    { title: 'Gravitation', status: 'upcoming' },
  ],
};

export const sidebarNav = [
  { key: 'classroom', label: 'Classroom', icon: 'Home' },
  { key: 'my-learning', label: 'My Learning', icon: 'GraduationCap' },
  { key: 'settings', label: 'Settings', icon: 'Settings' },
];

export const quickActions = [
  {
    key: 'explain-again',
    icon: 'RotateCcw',
    title: 'Explain Again',
    description: 'Re-explain the last concept',
    response: "Let me explain that concept again using a simpler approach. Newton's Second Law tells us that the force acting on an object equals its mass multiplied by its acceleration — F = ma. The heavier the object, the more force you need to move it at the same rate.",
  },
  {
    key: 'make-simpler',
    icon: 'Sparkles',
    title: 'Make it Simpler',
    description: 'Explain in an easier way',
    response: 'Think of force as a push or pull. If you push something light, it speeds up fast. Push something heavy with the same strength, and it speeds up slowly. That relationship is exactly what F = ma describes.',
  },
  {
    key: 'give-example',
    icon: 'Lightbulb',
    title: 'Give an Example',
    description: 'Show real life examples',
    response: 'Imagine pushing an empty shopping cart versus one loaded with groceries. The empty cart accelerates quickly with a small push, but the full cart needs a much stronger push to speed up at the same rate — that difference is Newton\u2019s Second Law in action.',
  },
  {
    key: 'go-deeper',
    icon: 'Layers',
    title: 'Go Deeper',
    description: 'More detailed explanation',
    response: "Going deeper: F = ma is a vector equation, meaning the net force and the resulting acceleration always point in the same direction. If multiple forces act on an object, you sum them as vectors first to find the net force before applying the law.",
  },
];

export const initialMessages = [
  {
    id: 'm1',
    sender: 'user',
    text: "Explain Newton's Second Law of Motion.",
    time: '10:24 AM',
  },
  {
    id: 'm2',
    sender: 'ai',
    text: "Sure! Let me explain Newton's Second Law with details and examples.",
    time: '10:24 AM',
    audio: { duration: '0:45' },
  },
  {
    id: 'm3',
    sender: 'user',
    text: 'Can you give a real life example?',
    time: '10:26 AM',
  },
  {
    id: 'm4',
    sender: 'ai',
    text: 'Absolutely! Let me show you a practical example.',
    time: '10:26 AM',
    audio: { duration: '0:38' },
  },
];

export const lessonNotes = {
  title: "Newton's Second Law",
  formula: 'F = ma',
  keyConcepts: ['Force', 'Mass', 'Acceleration'],
  formulaDetail: 'F = ma',
};

export const socialProof = {
  rating: '4.9/5',
  studentsLabel: 'Loved by 50,000+ students',
};

export const stats = [
  { icon: 'Users', value: '50,000+', label: 'Happy Students' },
  { icon: 'Clock', value: '24/7', label: 'Always Available' },
  { icon: 'ShieldCheck', value: '100%', label: 'Safe & Secure' },
  { icon: 'Trophy', value: 'Top Rated', label: 'By Students & Parents' },
];

export const featureCards = [
  {
    icon: 'GraduationCap',
    title: 'Real Teacher Experience',
    description: 'Learn from a professional AI teacher who explains just like a real classroom.',
  },
  {
    icon: 'MessagesSquare',
    title: 'Ask Anything',
    description: 'Ask your doubts in text or voice and get clear, easy-to-understand explanations.',
  },
  {
    icon: 'Video',
    title: 'Learn with Visuals',
    description: 'Understand concepts better with videos, diagrams and real-life examples.',
  },
  {
    icon: 'TrendingUp',
    title: 'Personalized Learning',
    description: 'Lessons tailored to your pace, level and learning style.',
  },
];

export const howItWorks = [
  {
    icon: 'CircleHelp',
    title: 'Ask a Doubt',
    description: 'Type or speak your question on any topic.',
  },
  {
    icon: 'Brain',
    title: 'AI Teacher Prepares',
    description: 'Our AI understands your question and prepares the best explanation.',
  },
  {
    icon: 'Video',
    title: 'Learn from the Teacher',
    description: 'Watch the AI teacher explain with examples, visuals and real understanding.',
  },
  {
    icon: 'MessageCircleQuestion',
    title: 'Ask Follow-ups',
    description: 'Ask more questions and learn deeper — just like in a real classroom.',
  },
];
