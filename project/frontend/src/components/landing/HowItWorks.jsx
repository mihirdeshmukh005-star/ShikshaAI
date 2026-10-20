import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { howItWorks } from '../../data/mockData';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-ink-900 py-24 px-6 lg:px-10 border-t border-hair scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-[32px] sm:text-[38px] font-bold text-white">
            How <span className="text-violet-light">EduReal AI</span> Works
          </h2>
          <p className="text-white/55 mt-3 max-w-lg mx-auto text-[15px]">
            A simple loop that repeats every time you have a question — ask, learn,
            understand, and ask again.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 md:gap-4 relative">
          {howItWorks.map((step, i) => {
            const Icon = Icons[step.icon] || Icons.Sparkles;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative rounded-2xl border border-hair bg-ink-800/60 p-6 hover:border-violet/25 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-violet/15 flex items-center justify-center mb-5">
                  <Icon size={20} className="text-violet-light" />
                </div>
                <h3 className="text-white font-semibold text-[16px]">{step.title}</h3>
                <p className="text-white/55 text-[13.5px] mt-2 leading-relaxed">
                  {step.description}
                </p>

                {i < howItWorks.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-violet/40 z-10"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
