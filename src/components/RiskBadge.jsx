import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

export const RiskBadge = ({ score = 0, showScore = true }) => {
  let label = "Low Priority";
  let bg = "bg-emerald-950/50 text-emerald-300 border-emerald-800/60";
  let Icon = CheckCircle;

  if (score >= 60) {
    label = "High Review Priority";
    bg = "bg-rose-950/60 text-rose-300 border-rose-800/80 animate-pulse";
    Icon = AlertTriangle;
  } else if (score >= 30) {
    label = "Review Recommended";
    bg = "bg-amber-950/50 text-amber-300 border-amber-800/60";
    Icon = AlertCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
      {showScore && <span className="opacity-80">({score}/100)</span>}
    </span>
  );
};
