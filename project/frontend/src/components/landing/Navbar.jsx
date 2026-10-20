import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Brand from '../Brand';

const links = ['Home', 'How It Works', 'About Us'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('Home');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (link) => {
    setActive(link);
    if (link === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === 'How It Works') {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (link === 'About Us') {
      document.getElementById('site-footer')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ink-950/80 backdrop-blur-md border-b border-hair' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-20">
        <button onClick={() => navigate('/')} className="focus-visible:outline-offset-4" aria-label="EduReal AI home">
          <Brand />
        </button>

        <ul className="hidden md:flex items-center gap-9">
          {links.map((link) => (
            <li key={link}>
              <button
                onClick={() => handleNavClick(link)}
                className={`relative text-[14.5px] font-medium py-1.5 transition-colors ${
                  active === link ? 'text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                {link}
                {active === link && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full bg-violet-light shadow-[0_0_10px_1px_rgba(139,92,246,0.7)]"
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="hidden sm:inline-flex text-[14px] font-semibold text-white/75 hover:text-white transition-colors px-2"
          >
            Sign In
          </button>
          <button onClick={() => navigate('/register')} className="hidden sm:inline-flex text-[14px] font-semibold text-white/75 hover:text-white transition-colors px-2">Sign Up</button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(localStorage.getItem('edureal_token') ? '/classroom' : '/login')}
            className="text-[14px] font-semibold text-white bg-violet hover:bg-violet-light rounded-full px-5 py-2.5 shadow-lift transition-colors"
          >
            Get Started
          </motion.button>
        </div>
      </nav>
    </header>
  );
}
