import Logo from './Logo';

export default function Brand({ size = 40, subtitleClass = 'text-white/45' }) {
  return (
    <div className="flex items-center gap-2.5">
      <Logo size={size} />
      <div className="leading-tight">
        <p className="font-display font-bold text-[17px] text-white tracking-tight">
          Edu<span className="text-violet-light">Real</span> AI
        </p>
        <p className={`text-[11px] ${subtitleClass}`}>Your Personal AI Teacher</p>
      </div>
    </div>
  );
}
