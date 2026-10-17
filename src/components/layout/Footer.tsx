import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#060911] text-slate-400 border-t border-white/[0.08] overflow-hidden py-10 sm:py-12">
      {/* Top Cyber Laser Line */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />

      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Brand & Live Status */}
          <div className="flex flex-wrap items-center gap-3.5 justify-center md:justify-start">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)] group-hover:border-purple-300 transition-all bg-slate-950 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="ProctorVision Logo"
                  className="w-full h-full object-cover scale-110 group-hover:scale-120 transition-transform duration-300"
                />
              </div>
              <span className="text-base font-bold tracking-tight text-white font-heading">
                Proctor<span className="text-purple-400">Vision</span>
              </span>
            </Link>


          </div>

          {/* Clean Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-300/80">
            <Link to="/student" className="hover:text-purple-400 transition-colors">
              Student Portal
            </Link>
            <Link to="/teacher" className="hover:text-purple-400 transition-colors">
              Teacher Console
            </Link>
            <a href="#features" className="hover:text-purple-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-purple-400 transition-colors">
              Pipeline
            </a>
          </nav>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-400/40 text-slate-300 hover:text-white transition-all text-xs font-mono cursor-pointer"
            aria-label="Back to top"
          >
            <span>Top</span>
            <ArrowUp className="w-3 h-3 text-purple-400 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-center sm:text-left">
          <p className="text-slate-500">
            © 2026 ProctorVision. On-device exam integrity.
          </p>
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Privacy First</span>
            <span>•</span>
            <span>Zero Video Stream</span>
            <span>•</span>
            <span>Client WASM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
