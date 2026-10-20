import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Brand from '../components/Brand';
import { api } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setLoading(true); setError('');
    try {
      const data = await api.login({ email: email.trim(), password });
      localStorage.setItem('edureal_token', data.token);
      navigate(location.state?.from || '/classroom', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/')} className="mb-6 text-white/60 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16}/> Back to home
        </button>
        <div className="text-center mb-7"><Brand size={52}/><h1 className="font-display text-3xl font-bold mt-5">Welcome back</h1>
          <p className="text-white/50 mt-2">Sign in to continue to your AI classroom.</p></div>
        <form onSubmit={submit} className="rounded-3xl border border-hair bg-ink-900 p-6 shadow-panel">
          {error && <div className="mb-5 flex gap-2 items-center rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-sm text-rose-300"><AlertCircle size={16}/>{error}</div>}
          <label className="block mb-4"><span className="text-sm text-white/60">Email</span>
            <div className="relative mt-1.5"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"/>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" className="w-full rounded-2xl bg-white/[.04] border border-white/[.08] text-white px-11 py-3.5 outline-none" placeholder="you@example.com"/>
            </div>
          </label>
          <label className="block mb-6"><span className="text-sm text-white/60">Password</span>
            <div className="relative mt-1.5"><Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"/>
              <input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} autoComplete="current-password" className="w-full rounded-2xl bg-white/[.04] border border-white/[.08] text-white px-11 py-3.5 outline-none" placeholder="Your password"/>
              <button type="button" onClick={()=>setShow(v=>!v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button>
            </div>
          </label>
          <button disabled={loading} className="w-full rounded-2xl bg-violet hover:bg-violet-light py-3.5 font-semibold flex items-center justify-center gap-2">{loading?<><Loader2 size={17} className="animate-spin"/>Signing in…</>:'Sign In'}</button>
          <p className="text-center text-sm text-white/50 mt-5">New here? <Link className="text-violet-light font-semibold" to="/register">Create an account</Link></p>
        </form>
      </div>
    </div>
  );
}
