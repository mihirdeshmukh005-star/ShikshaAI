import { useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Atom, Calculator, FlaskConical, Dna, Sparkles, Star, MessageCircle } from 'lucide-react';
import teacherHero from '../../assets/teacher-hero.jpg';
import OrbitIcon from './OrbitIcon';

const orbitItems = [
  { icon: Atom, label: 'Physics', radius: 158, duration: 24, angle: 0, y: -16 },
  { icon: Calculator, label: 'Math', radius: 158, duration: 24, angle: 90, y: 22 },
  { icon: FlaskConical, label: 'Chemistry', radius: 158, duration: 24, angle: 180, y: -16 },
  { icon: Dna, label: 'Biology', radius: 158, duration: 24, angle: 270, y: 22 },
];

export default function HologramTeacher() {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });

  const sparkles = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        top: Math.round(Math.random() * 100),
        left: Math.round(Math.random() * 100),
        size: 2 + Math.round(Math.random() * 3),
        delay: +(Math.random() * 4).toFixed(2),
        duration: +(3 + Math.random() * 3).toFixed(2),
      })),
    []
  );

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full h-[440px] sm:h-[520px] lg:h-[600px] select-none"
      style={{ perspective: '1700px' }}
    >
      {/* ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[380px] h-[380px] rounded-full bg-violet/25 blur-[110px]" />
      </div>

      {/* sparkles */}
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-violet-light/80 pointer-events-none"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      <motion.div className="relative w-full h-full preserve-3d" style={{ rotateX, rotateY }}>
        {/* holographic floor platform */}
        <div
          className="absolute left-1/2 top-1/2 w-[300px] h-[300px] preserve-3d pointer-events-none"
          style={{ transform: 'translate(-50%, -50%) translateY(150px) rotateX(78deg)' }}
        >
          <div
            className="absolute inset-0 rounded-full border border-violet/40"
            style={{ boxShadow: '0 0 70px 12px rgba(124,77,255,0.25)' }}
          />
          <div className="absolute inset-[16%] rounded-full border border-violet/25" />
          <div className="absolute inset-[34%] rounded-full bg-violet/20 blur-md" />
          <div className="absolute inset-[46%] rounded-full bg-violet-light/60 blur-sm" />
        </div>

        {/* light beam */}
        <div
          className="absolute left-1/2 top-1/2 w-[3px] h-[220px] -translate-x-1/2 bg-gradient-to-t from-violet-light/60 via-violet/25 to-transparent pointer-events-none"
          style={{ transform: 'translate(-50%, -20px)', animation: 'beam-pulse 3s ease-in-out infinite' }}
        />

        {/* orbit rings (visual) */}
        <div
          className="absolute left-1/2 top-1/2 w-[320px] h-[320px] rounded-full border border-violet/25 pointer-events-none"
          style={{ animation: 'ring-spin 26s linear infinite' }}
        />
        <div
          className="absolute left-1/2 top-1/2 w-[368px] h-[368px] rounded-full border border-violet-light/15 pointer-events-none"
          style={{ animation: 'ring-spin-rev 34s linear infinite' }}
        />

        {/* orbiting subject chips */}
        <div className="absolute left-1/2 top-1/2 w-px h-px preserve-3d" style={{ transform: 'rotateX(66deg)' }}>
          {orbitItems.map((o) => (
            <OrbitIcon
              key={o.label}
              icon={o.icon}
              label={o.label}
              radius={o.radius}
              duration={o.duration}
              angle={o.angle}
              y={o.y}
              tilt={66}
            />
          ))}
        </div>

        {/* central hologram panel: depth wrapper (static) + float wrapper (animated) */}
        <div
          className="absolute left-1/2 top-[6%] w-[220px] sm:w-[250px] lg:w-[280px] preserve-3d"
          style={{ transform: 'translateX(-50%) translateZ(70px)' }}
        >
          <div className="preserve-3d" style={{ animation: 'panel-float 7s ease-in-out infinite' }}>
            <div className="relative rounded-[28px] overflow-hidden border border-violet/40 shadow-[0_25px_90px_-20px_rgba(124,77,255,0.55)]">
              <img
                src={teacherHero}
                alt="AI teacher hologram"
                className="w-full aspect-[3/3.6] object-cover object-[62%_16%]"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/5 to-violet/15" />
              <div className="absolute inset-0 bg-gradient-to-br from-violet/20 via-transparent to-transparent mix-blend-overlay" />

              {/* scanline sweep */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div
                  className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-white/25 to-transparent"
                  style={{ animation: 'scan-move 4s linear infinite' }}
                />
              </div>

              <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10 pointer-events-none" />

              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-ink-950/70 border border-hair px-2.5 py-1 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-white/85 tracking-wide">LIVE AI TEACHER</span>
              </div>
            </div>
          </div>
        </div>

        {/* floating UI docks: depth wrapper (static translateZ) + float wrapper (animated) */}
        <div
          className="absolute left-[2%] sm:left-[6%] top-[10%] preserve-3d"
          style={{ transform: 'translateZ(110px)' }}
        >
          <div style={{ animation: 'chip-float 5s ease-in-out infinite' }}>
            <div className="rounded-2xl border border-hair bg-ink-900/85 backdrop-blur-md px-3.5 py-2.5 shadow-panel flex items-center gap-2.5 max-w-[180px]">
              <div className="w-8 h-8 rounded-lg bg-violet/15 flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-violet-light" />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-white leading-tight">Real Teacher Feel</p>
                <p className="text-[10.5px] text-white/50">Explains like a human</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute right-[0%] sm:right-[4%] top-[40%] preserve-3d"
          style={{ transform: 'translateZ(130px)' }}
        >
          <div style={{ animation: 'chip-float 6s ease-in-out infinite 1s' }}>
            <div className="rounded-2xl border border-hair bg-ink-900/85 backdrop-blur-md px-3.5 py-2.5 shadow-panel flex items-center gap-1.5">
              <Star size={13} className="text-amber-400" fill="currentColor" />
              <span className="text-[12px] font-semibold text-white">4.9/5</span>
              <span className="text-[11px] text-white/50">· 50K+ students</span>
            </div>
          </div>
        </div>

        <div
          className="absolute left-1/2 bottom-[2%] preserve-3d"
          style={{ transform: 'translateX(-50%) translateZ(150px)' }}
        >
          <div style={{ animation: 'chip-float 5.5s ease-in-out infinite 0.6s' }}>
            <div className="rounded-2xl border border-violet/30 bg-ink-900/90 backdrop-blur-md px-4 py-2.5 shadow-lift flex items-center gap-2 max-w-[240px] sm:max-w-none">
              <MessageCircle size={14} className="text-violet-light shrink-0" />
              <p className="text-[11.5px] text-white/80 whitespace-nowrap">"Can you explain Newton's Law?"</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
