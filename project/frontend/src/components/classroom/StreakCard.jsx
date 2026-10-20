import { Flame, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { streak } from '../../data/mockData';

export default function StreakCard() {
  return (
    <div className="rounded-xl border border-hair bg-ink-800/50 p-4">
      <div className="flex items-center gap-2">
        <Flame size={16} className="text-amber-400" fill="currentColor" />
        <p className="text-white text-[13px] font-semibold">Learning Streak</p>
      </div>
      <p className="text-violet-light font-display font-bold text-[20px] mt-1.5">
        {streak.days} days
      </p>

      <div className="grid grid-cols-7 gap-1.5 mt-3.5">
        {streak.week.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-white/40">{d.label}</span>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`w-6 h-6 rounded-md flex items-center justify-center ${
                d.done ? 'bg-violet/20 text-violet-light' : 'bg-white/5 text-white/20'
              }`}
            >
              {d.done ? <Check size={12} strokeWidth={3} /> : <span className="w-1 h-1 rounded-full bg-current" />}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
