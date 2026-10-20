import { AtSign, Camera, Link2 } from 'lucide-react';
import Brand from '../Brand';

const columns = [
  {
    title: 'Product',
    links: ['How It Works', 'Features', 'About Us'],
  },
  {
    title: 'Support',
    links: ['Help Center', 'Contact'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms'],
  },
];

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-ink-950 border-t border-hair px-6 lg:px-10 py-14">
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10">
        <div>
          <Brand subtitleClass="text-white/40" />
          <p className="text-white/40 text-[13px] mt-4 max-w-[240px] leading-relaxed">
            An AI teacher that explains, listens, and adapts — so every student learns
            with confidence.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {[AtSign, Camera, Link2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="w-8 h-8 rounded-full border border-hair flex items-center justify-center text-white/50 hover:text-white hover:border-white/25 transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-white/85 text-[13px] font-semibold mb-4">{col.title}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-white/45 text-[13.5px] hover:text-white/80 transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto border-t border-hair mt-12 pt-6 text-white/35 text-[12.5px]">
        © {new Date().getFullYear()} EduReal AI. All rights reserved.
      </div>
    </footer>
  );
}
