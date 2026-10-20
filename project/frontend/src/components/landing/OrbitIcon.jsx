export default function OrbitIcon({ icon: Icon, label, radius, duration, delay = 0, angle, y = 0, tilt = 66 }) {
  return (
    <div
      className="absolute inset-0 preserve-3d"
      style={{ animation: `orbit-spin ${duration}s linear infinite`, animationDelay: `-${delay}s` }}
    >
      <div
        className="absolute top-0 left-0 preserve-3d"
        style={{ transform: `rotate(${angle}deg) translateX(${radius}px) translateY(${y}px)` }}
      >
        <div
          className="preserve-3d"
          style={{ animation: `orbit-spin-reverse ${duration}s linear infinite`, animationDelay: `-${delay}s` }}
        >
          <div style={{ transform: `translate(-50%, -50%) rotateX(${-tilt}deg)` }}>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-11 h-11 rounded-xl bg-ink-900/80 border border-violet/30 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_-4px_rgba(139,92,246,0.6)]">
                <Icon size={18} className="text-violet-light" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-medium text-white/70 bg-ink-950/70 px-2 py-0.5 rounded-full border border-hair whitespace-nowrap">
                {label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
