import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Maximize, Menu } from 'lucide-react';
import { api } from '../../lib/api';

export default function ClassroomHeader({ user, onOpenSidebar, onFullscreen, onEndClass }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-5 lg:px-6 py-4 border-b border-hair">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="lg:hidden w-9 h-9 rounded-lg border border-hair flex items-center justify-center text-white/70 shrink-0"
        >
          <Menu size={17} />
        </button>
        <div className="min-w-0">
          <h1 className="text-white font-display font-semibold text-[17px] sm:text-[19px] truncate">
            Hello, {user?.full_name || "Student"}! 👋
          </h1>
          <p className="text-white/50 text-[12.5px] sm:text-[13px] truncate">
            Let's continue your learning journey.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEndClass || (() => navigate('/'))}
          className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-rose-300 border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 rounded-full px-4 py-2 transition-colors"
        >
          End Class
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Notifications"
          className="relative w-9 h-9 rounded-lg border border-hair flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-light" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={onFullscreen}
          aria-label="Fullscreen"
          className="hidden sm:flex w-9 h-9 rounded-lg border border-hair items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Maximize size={16} />
        </motion.button>

      </div>
    </header>
  );
}
