import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickActionCard({ icon, title, description, onClick }) {
  const Icon = Icons[icon] || Icons.Sparkles;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className="text-left rounded-2xl border border-hair bg-ink-800/50 hover:bg-ink-800 hover:border-violet/25 p-4 transition-colors"
    >
      <div className="w-9 h-9 rounded-lg bg-violet/15 flex items-center justify-center mb-3">
        <Icon size={16} className="text-violet-light" />
      </div>
      <p className="text-white text-[13.5px] font-semibold">{title}</p>
      <p className="text-white/50 text-[12px] mt-1 leading-snug">{description}</p>
    </motion.button>
  );
}
