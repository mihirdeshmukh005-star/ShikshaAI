import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Brand from '../Brand';
import StreakCard from './StreakCard';
import UserProfile from './UserProfile';
import { sidebarNav } from '../../data/mockData';

export default function Sidebar({ active, onNavigate, className = '', user }) {
  const navigate = useNavigate();

  return (
    <aside className={`flex flex-col bg-ink-900 border-r border-hair h-full ${className}`}>
      <div className="px-5 pt-6 pb-5">
        <button onClick={() => navigate('/')} className="focus-visible:outline-offset-4">
          <Brand size={36} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1" aria-label="Classroom navigation">
        {sidebarNav.map((item) => {
          const Icon = Icons[item.icon] || Icons.Circle;
          const isActive = active === item.key;
          return (
            <motion.button
              key={item.key}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate?.(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-violet/15 text-white shadow-[0_0_0_1px_rgba(124,77,255,0.25),0_0_20px_-6px_rgba(124,77,255,0.5)]'
                  : 'text-white/55 hover:text-white/85 hover:bg-white/5'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-violet-light' : ''} />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      <div className="px-3 py-3">
        <StreakCard />
      </div>

      <div className="px-3 pb-4">
        <UserProfile user={user} />
      </div>
    </aside>
  );
}
