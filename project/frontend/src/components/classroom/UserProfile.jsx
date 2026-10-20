import { GraduationCap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export default function UserProfile({ user }) {
  const navigate = useNavigate();
  const logout = async () => {
    try { await api.logout(); } finally { navigate('/login', { replace: true }); }
  };
  return (
    <div className="w-full rounded-xl border border-hair bg-ink-800/50 px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-light to-violet-deep flex items-center justify-center shrink-0">
          <GraduationCap size={15} className="text-white" />
        </div>
        <div className="text-left flex-1 min-w-0">
          <p className="text-white text-[13px] font-medium truncate">{user?.full_name || 'Student'}</p>
          <p className="text-white/45 text-[11px] truncate">{user?.email || 'Signed in'}</p>
        </div>
        <button onClick={logout} title="Log out" className="text-white/45 hover:text-rose-300 p-1.5"><LogOut size={15}/></button>
      </div>
    </div>
  );
}
