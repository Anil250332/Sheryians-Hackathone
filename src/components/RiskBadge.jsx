import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export const RiskBadge = ({ score = 0, showScore = true }) => {
  let label = "Low Priority";
  let bg = "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
  let Icon = CheckCircle;

  if (score >= 60) {
    label = "High Review Priority";
    bg = "bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] animate-pulse";
    Icon = AlertTriangle;
  } else if (score >= 30) {
    label = "Review Recommended";
    bg = "bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]";
    Icon = AlertCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${bg}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
      {showScore && <span className="opacity-90 font-mono">({score}/100)</span>}
    </span>
  );
};

export default RiskBadge;
