import { AnimatePresence, motion } from 'framer-motion';
import { Play, X, Volume2 } from 'lucide-react';
import { useState } from 'react';
import teacherHero from '../../assets/teacher-hero.jpg';

export default function DemoModal({ open, onClose }) {
  const [playing, setPlaying] = useState(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="EduReal AI demo"
        >
          <motion.div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-hair bg-ink-900 shadow-2xl"
          >
            <button
              onClick={onClose}
              aria-label="Close demo"
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-video bg-ink-950">
              <img
                src={teacherHero}
                alt="AI teacher demo preview"
                className="w-full h-full object-cover object-[center_20%] opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

              {!playing ? (
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                  aria-label="Play demo"
                >
                  <span className="w-16 h-16 rounded-full bg-violet/90 group-hover:bg-violet-light flex items-center justify-center shadow-lift transition-colors">
                    <Play size={24} className="text-white ml-1" fill="white" />
                  </span>
                </button>
              ) : (
                <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl bg-ink-950/70 border border-hair px-4 py-3">
                  <Volume2 size={16} className="text-violet-light shrink-0" />
                  <div className="flex-1 flex items-center gap-[3px] h-6">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-violet-light/70 animate-pulse-slow"
                        style={{
                          height: `${8 + Math.abs(Math.sin(i)) * 16}px`,
                          animationDelay: `${i * 40}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[12px] text-white/50 shrink-0">0:12 / 0:48</span>
                </div>
              )}
            </div>

            <div className="p-5">
              <p className="text-white font-semibold text-[15px]">
                A quick look inside the classroom
              </p>
              <p className="text-white/55 text-[13.5px] mt-1">
                See how EduReal AI explains a real concept, step by step, the same way a
                dedicated teacher would in person.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
