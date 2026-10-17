import React, { useRef, useState, type ReactNode } from 'react';

export type PipelineAccent = 'cyan' | 'teal' | 'emerald' | 'sky' | 'purple' | 'violet' | 'fuchsia' | 'indigo';

export interface PipelineStepItem {
  step: string;
  badge: string;
  category: string;
  title: string;
  description: string;
  icon: ReactNode;
  footerIcon: ReactNode;
  footerText: string;
  statusTag: string;
  accent: PipelineAccent;
}

interface PipelineCardProps {
  item: PipelineStepItem;
  index: number;
  total: number;
}

const ACCENT_MAP: Record<
  PipelineAccent,
  {
    text: string;
    border: string;
    borderHover: string;
    bgBadge: string;
    bgIcon: string;
    dotBg: string;
    laser: string;
    glowRgb: string;
    shadowHover: string;
    tagBorder: string;
    tagText: string;
  }
> = {
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/25',
    borderHover: 'hover:border-purple-400/70',
    bgBadge: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    bgIcon: 'from-purple-500/20 via-slate-900/90 to-slate-950 border-purple-400/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
    dotBg: 'bg-purple-400 shadow-[0_0_8px_#c084fc]',
    laser: 'via-purple-400',
    glowRgb: '168, 85, 247',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(168,85,247,0.25)]',
    tagBorder: 'border-purple-500/30 text-purple-300 bg-purple-950/40',
    tagText: 'text-purple-400',
  },
  violet: {
    text: 'text-violet-400',
    border: 'border-violet-500/25',
    borderHover: 'hover:border-violet-400/70',
    bgBadge: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
    bgIcon: 'from-violet-500/20 via-slate-900/90 to-slate-950 border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.25)]',
    dotBg: 'bg-violet-400 shadow-[0_0_8px_#a78bfa]',
    laser: 'via-violet-400',
    glowRgb: '139, 92, 246',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(139,92,246,0.25)]',
    tagBorder: 'border-violet-500/30 text-violet-300 bg-violet-950/40',
    tagText: 'text-violet-400',
  },
  fuchsia: {
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500/25',
    borderHover: 'hover:border-fuchsia-400/70',
    bgBadge: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
    bgIcon: 'from-fuchsia-500/20 via-slate-900/90 to-slate-950 border-fuchsia-400/40 shadow-[0_0_20px_rgba(217,70,239,0.25)]',
    dotBg: 'bg-fuchsia-400 shadow-[0_0_8px_#e879f9]',
    laser: 'via-fuchsia-400',
    glowRgb: '217, 70, 239',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(217,70,239,0.25)]',
    tagBorder: 'border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-950/40',
    tagText: 'text-fuchsia-400',
  },
  indigo: {
    text: 'text-indigo-400',
    border: 'border-indigo-500/25',
    borderHover: 'hover:border-indigo-400/70',
    bgBadge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    bgIcon: 'from-indigo-500/20 via-slate-900/90 to-slate-950 border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.25)]',
    dotBg: 'bg-indigo-400 shadow-[0_0_8px_#818cf8]',
    laser: 'via-indigo-400',
    glowRgb: '99, 102, 241',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(99,102,241,0.25)]',
    tagBorder: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/40',
    tagText: 'text-indigo-400',
  },
  cyan: {
    text: 'text-cyan-400',
    border: 'border-cyan-500/25',
    borderHover: 'hover:border-cyan-400/70',
    bgBadge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    bgIcon: 'from-cyan-500/20 via-slate-900/90 to-slate-950 border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]',
    dotBg: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    laser: 'via-cyan-400',
    glowRgb: '6, 182, 212',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(6,182,212,0.25)]',
    tagBorder: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/40',
    tagText: 'text-cyan-400',
  },
  teal: {
    text: 'text-teal-400',
    border: 'border-teal-500/25',
    borderHover: 'hover:border-teal-400/70',
    bgBadge: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
    bgIcon: 'from-teal-500/20 via-slate-900/90 to-slate-950 border-teal-400/40 shadow-[0_0_20px_rgba(20,184,166,0.25)]',
    dotBg: 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]',
    laser: 'via-teal-400',
    glowRgb: '20, 184, 166',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(20,184,166,0.25)]',
    tagBorder: 'border-teal-500/30 text-teal-300 bg-teal-950/40',
    tagText: 'text-teal-400',
  },
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/25',
    borderHover: 'hover:border-emerald-400/70',
    bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    bgIcon: 'from-emerald-500/20 via-slate-900/90 to-slate-950 border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    dotBg: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    laser: 'via-emerald-400',
    glowRgb: '16, 185, 129',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(16,185,129,0.25)]',
    tagBorder: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/40',
    tagText: 'text-emerald-400',
  },
  sky: {
    text: 'text-sky-400',
    border: 'border-sky-500/25',
    borderHover: 'hover:border-sky-400/70',
    bgBadge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    bgIcon: 'from-sky-500/20 via-slate-900/90 to-slate-950 border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.25)]',
    dotBg: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
    laser: 'via-sky-400',
    glowRgb: '56, 189, 248',
    shadowHover: 'hover:shadow-[0_20px_50px_-15px_rgba(56,189,248,0.25)]',
    tagBorder: 'border-sky-500/30 text-sky-300 bg-sky-950/40',
    tagText: 'text-sky-400',
  },
};

export const PipelineCard: React.FC<PipelineCardProps> = ({ item }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const theme = ACCENT_MAP[item.accent];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="relative group/card h-full flex flex-col">
      {/* Ambient background bloom on hover */}
      <div
        className="absolute -inset-1 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${theme.glowRgb}, 0.2), transparent 70%)`,
        }}
      />

      {/* Main Interactive Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex-1 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-[#070b13] border ${theme.border} ${theme.borderHover} ${theme.shadowHover} backdrop-blur-xl p-5 sm:p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 select-none shadow-[0_8px_30px_rgba(0,0,0,0.4)]`}
      >
        {/* Dynamic Cursor Spotlight Effect */}
        <div
          className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(${theme.glowRgb}, 0.15), transparent 75%)`,
          }}
        />

        {/* Top Cyber Laser Accent Line */}
        <div
          className={`absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent ${theme.laser} to-transparent pointer-events-none group-hover/card:inset-x-0 transition-all duration-500 opacity-60 group-hover/card:opacity-100`}
        />

        {/* Card Body */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header Bar: Icon on left, Step Capsule on right */}
          <div className="flex items-center justify-between mb-5">
            {/* Luminous Themed Icon Badge */}
            <div
              className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${theme.bgIcon} border flex items-center justify-center transition-all duration-300 group-hover/card:scale-105`}
            >
              <div
                className="absolute inset-0 rounded-xl blur-xs pointer-events-none opacity-40"
                style={{ backgroundColor: `rgba(${theme.glowRgb}, 0.2)` }}
              />
              <div className="relative z-10">{item.icon}</div>
            </div>

            {/* Step Capsule Badge */}
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${theme.bgBadge} backdrop-blur-md shadow-xs`}
            >
              <span>{item.badge}</span>
            </div>
          </div>

          {/* Category Pill Tag */}
          <div className="mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
              {item.category}
            </span>
          </div>

          {/* Step Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 font-heading tracking-tight group-hover/card:text-slate-100 transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-slate-300/85 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>

        {/* Clean, Perfectly Aligned Footer Strip */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-1.5 text-slate-300 min-w-0">
            <span className={`shrink-0 ${theme.tagText}`}>{item.footerIcon}</span>
            <span className="font-medium text-[11px] text-slate-200 whitespace-nowrap">{item.footerText}</span>
          </div>

          <span
            className={`shrink-0 px-2 py-0.5 rounded text-[9.5px] uppercase font-bold tracking-wider border ${theme.tagBorder} whitespace-nowrap`}
          >
            {item.statusTag}
          </span>
        </div>
      </div>
    </div>
  );
};
