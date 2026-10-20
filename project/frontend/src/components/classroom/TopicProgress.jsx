import { motion } from 'framer-motion';
import { currentLesson } from '../../data/mockData';

export default function TopicProgress() {
  const pct = Math.round((currentLesson.conceptsDone / currentLesson.conceptsTotal) * 100);

  return (
    <div className="rounded-2xl border border-hair bg-ink-800/50 p-4">
      <p className="text-white/45 text-[11.5px] uppercase tracking-wide">Current Topic</p>
      <p className="text-white font-display font-semibold text-[16px] mt-1">
        {currentLesson.topic}
      </p>

      <div className="mt-3.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-violet-deep to-violet-light"
        />
      </div>
      <p className="text-white/50 text-[12px] mt-2">
        {currentLesson.conceptsDone} / {currentLesson.conceptsTotal} Concepts Covered
      </p>
    </div>
  );
}
