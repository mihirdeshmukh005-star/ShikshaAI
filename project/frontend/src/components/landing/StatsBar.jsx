import * as Icons from 'lucide-react';
import { stats } from '../../data/mockData';

export default function StatsBar() {
  return (
    <div className="relative z-20 max-w-5xl mx-auto -mt-10 md:-mt-12 px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl border border-hair bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-panel">
        {stats.map((s) => {
          const Icon = Icons[s.icon] || Icons.Sparkles;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 px-5 py-5 bg-ink-900/60"
            >
              <div className="w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-violet-light" />
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-[15px] font-display leading-tight truncate">
                  {s.value}
                </p>
                <p className="text-white/50 text-[12px] truncate">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
