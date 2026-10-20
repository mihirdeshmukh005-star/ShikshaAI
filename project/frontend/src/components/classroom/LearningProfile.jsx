import { motion } from 'framer-motion';
import {
  BookOpen,
  Target,
  Award,
  CheckCircle2,
  Circle,
  TrendingUp,
  TrendingDown,
  History,
  Route,
  BrainCircuit,
} from 'lucide-react';
import { learningProfile } from '../../data/mockData';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
      <div className="w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center mb-3">
        <Icon size={16} className="text-violet-light" />
      </div>
      <p className="text-white font-display font-semibold text-[20px]">{value}</p>
      <p className="text-white/50 text-[12px] mt-0.5">{label}</p>
    </div>
  );
}

function statusBadge(status) {
  const map = {
    Completed: 'bg-emerald-500/15 text-emerald-400',
    'In Progress': 'bg-violet/15 text-violet-light',
    'Not Started': 'bg-white/10 text-white/50',
  };
  return map[status] || map['Not Started'];
}

export default function LearningProfile() {
  const {
    overallProgress,
    avgAssessmentScore,
    topicsStudiedCount,
    subjectProgress,
    topicsStudied,
    assessmentScores,
    weakConcepts,
    strongConcepts,
    learningHistory,
    currentLearningPath,
  } = learningProfile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-white font-display font-semibold text-[20px]">Student Learning Profile</h1>
        <p className="text-white/50 text-[13px] mt-1 max-w-2xl">
          A running record of what you've studied, how you're progressing, and where you're strong or need
          more practice. EduReal AI reads this profile before every session to personalize how it teaches you.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <StatCard icon={BookOpen} label="Topics Studied" value={topicsStudiedCount} />
        <StatCard icon={Target} label="Overall Progress" value={`${overallProgress}%`} />
        <StatCard icon={Award} label="Avg. Assessment Score" value={`${avgAssessmentScore}%`} />
        <StatCard icon={Route} label="Topics in Learning Path" value={currentLearningPath.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Progress by subject */}
        <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5">Progress by Subject</p>
          <div className="space-y-3.5">
            {subjectProgress.map((s) => (
              <div key={s.subject}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white/80 text-[13px] font-medium">{s.subject}</span>
                  <span className="text-white/45 text-[12px]">{s.percent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percent}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-deep to-violet-light"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Topics studied */}
        <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5">Topics Studied</p>
          <div className="space-y-2.5">
            {topicsStudied.map((t) => (
              <div key={t.topic} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-[13px] font-medium truncate">{t.topic}</p>
                  <p className="text-white/40 text-[11.5px]">{t.subject}</p>
                </div>
                <span className={`shrink-0 text-[10.5px] font-medium px-2.5 py-1 rounded-full ${statusBadge(t.status)}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Strong / weak concepts */}
        <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-emerald-400" /> Strong Concepts
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {strongConcepts.map((c) => (
              <span key={c} className="text-[12px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                {c}
              </span>
            ))}
          </div>
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
            <TrendingDown size={13} className="text-amber-400" /> Weak Concepts
          </p>
          <div className="flex flex-wrap gap-2">
            {weakConcepts.map((c) => (
              <span key={c} className="text-[12px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Assessment scores */}
        <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5">Assessment Scores</p>
          <div className="space-y-2.5">
            {assessmentScores.map((a) => (
              <div key={a.topic} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white text-[13px] font-medium truncate">{a.topic}</p>
                  <p className="text-white/40 text-[11.5px]">{a.date}</p>
                </div>
                <span
                  className={`shrink-0 text-[13px] font-semibold ${
                    a.score >= 80 ? 'text-emerald-400' : a.score >= 65 ? 'text-violet-light' : 'text-amber-400'
                  }`}
                >
                  {a.score}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Learning history */}
        <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
            <History size={13} /> Learning History
          </p>
          <div className="space-y-4">
            {learningHistory.map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <span className="w-2 h-2 rounded-full bg-violet-light shrink-0" />
                  {i !== learningHistory.length - 1 && <span className="w-px flex-1 bg-white/10 mt-1" />}
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-white text-[13px] font-medium">{h.topic}</p>
                  <p className="text-white/40 text-[11.5px] mt-0.5">
                    {h.date} · {h.duration}
                  </p>
                  <p className="text-white/55 text-[12.5px] mt-1 leading-snug">{h.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current learning path */}
        <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
          <p className="text-white/45 text-[11.5px] uppercase tracking-wide mb-3.5 flex items-center gap-1.5">
            <Route size={13} /> Current Learning Path
          </p>
          <div className="space-y-3">
            {currentLearningPath.map((step) => (
              <div key={step.title} className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />
                ) : step.status === 'current' ? (
                  <span className="w-[17px] h-[17px] rounded-full bg-violet/20 border-2 border-violet-light flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-light" />
                  </span>
                ) : (
                  <Circle size={17} className="text-white/25 shrink-0" />
                )}
                <span
                  className={`text-[13px] ${
                    step.status === 'upcoming' ? 'text-white/45' : 'text-white/85 font-medium'
                  }`}
                >
                  {step.title}
                </span>
                {step.status === 'current' && (
                  <span className="ml-auto text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-violet/15 text-violet-light shrink-0">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI personalization note */}
      <div className="rounded-2xl border border-violet/20 bg-violet/10 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet/20 flex items-center justify-center shrink-0">
          <BrainCircuit size={16} className="text-violet-light" />
        </div>
        <p className="text-white/70 text-[12.5px] leading-snug">
          <span className="text-white font-medium">How this is used: </span>
          EduReal AI checks your weak and strong concepts, past scores, and current learning path before every
          lesson, so explanations, examples, and pacing are personalized to you.
        </p>
      </div>
    </motion.div>
  );
}
