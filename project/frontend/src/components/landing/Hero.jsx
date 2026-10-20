import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, ChevronDown } from 'lucide-react';
import HologramTeacher from './HologramTeacher';
import DemoModal from './DemoModal';
import { socialProof } from '../../data/mockData';
import StatsBar from './StatsBar';

export default function Hero() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative pt-20 bg-ink-950 overflow-hidden">
      {/* Ambient background: gradient mesh + drifting grid floor, replaces the flat hero photo */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(60% 50% at 18% 20%, rgba(124,77,255,0.20), transparent 60%), radial-gradient(50% 45% at 85% 15%, rgba(88,101,242,0.16), transparent 60%), radial-gradient(70% 60% at 65% 90%, rgba(139,92,246,0.14), transparent 60%)',
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] bg-grid-floor opacity-[0.12]"
          style={{
            maskImage: 'linear-gradient(to top, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
            animation: 'grid-drift 6s linear infinite',
          }}
        />
        <div className="absolute inset-0 bg-noise opacity-[0.12] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink-950" />
      </div>

      <div className="relative min-h-[94vh] flex items-center">
        <div className="relative max-w-7xl mx-auto w-full px-6 lg:px-10 py-16">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-4 items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-violet-light">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-light animate-pulse" />
                Welcome to EduReal AI
              </span>

              <h1 className="font-display text-[40px] sm:text-[54px] lg:text-[60px] font-bold leading-[1.05] text-white mt-6 text-balance">
                Learn Like
                <br />
                You Have a
                <br />
                <span className="bg-gradient-to-r from-violet-light via-[#B79CFF] to-violet-light bg-clip-text text-transparent bg-[length:200%_auto]" style={{ animation: 'gradient-pan 6s ease-in-out infinite' }}>
                  Real Teacher.
                </span>
              </h1>

              <p className="mt-6 text-white/65 text-[16px] leading-relaxed max-w-md mx-auto lg:mx-0">
                Ask doubts, get explanations, understand concepts deeply and learn at
                your own pace — with a teacher who is always here for you.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/classroom')}
                  className="group relative inline-flex items-center gap-2 rounded-full bg-violet px-6 py-3.5 text-white font-semibold text-[15px] shadow-lift transition-colors hover:bg-violet-light"
                >
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 blur-lg bg-violet-light/50 transition-opacity -z-10" />
                  <Play size={16} fill="white" />
                  Start Learning
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="group inline-flex items-center gap-2.5 text-white/85 hover:text-white font-medium text-[15px] transition-colors"
                >
                  <span className="w-10 h-10 rounded-full border border-white/25 flex items-center justify-center group-hover:border-violet-light/60 group-hover:bg-violet/10 transition-colors">
                    <Play size={13} fill="currentColor" className="ml-0.5" />
                  </span>
                  Watch Demo
                </button>
              </div>

              <div className="mt-9 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-3">
                  {['#8B5CF6', '#6D3DF5', '#5865F2', '#9F7AEA'].map((c, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full border-2 border-ink-950 flex items-center justify-center text-[11px] font-semibold text-white"
                      style={{ background: c }}
                    >
                      {['AK', 'RS', 'JM', 'PV'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className="text-amber-400" fill="currentColor" />
                    ))}
                    <span className="text-white/85 text-[13px] font-semibold ml-1">
                      {socialProof.rating}
                    </span>
                  </div>
                  <p className="text-white/50 text-[12.5px] mt-0.5">{socialProof.studentsLabel}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="relative z-10"
            >
              <HologramTeacher />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="hidden lg:flex justify-center mt-4"
          >
            <div className="flex flex-col items-center gap-1 text-white/35">
              <span className="text-[11px] tracking-wide">Scroll to explore</span>
              <ChevronDown size={16} className="animate-bounce" />
            </div>
          </motion.div>
        </div>
      </div>

      <StatsBar />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
