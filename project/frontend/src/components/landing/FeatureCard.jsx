import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  const Icon = Icons[icon] || Icons.Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="w-full max-w-[290px] rounded-2xl border border-hair bg-ink-900/70 backdrop-blur-sm px-4 py-3.5 shadow-panel hover:border-violet/30 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center">
          <Icon size={17} className="text-violet-light" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-white">{title}</p>
          <p className="text-[12.5px] text-white/55 leading-snug mt-0.5">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
