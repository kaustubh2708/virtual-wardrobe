import { formatINR } from '../../lib/wardrobeUtils';

export default function BudgetBar({ total, spent, planned }) {
  const remaining = total - spent - planned;
  const spentPct = Math.min((spent / total) * 100, 100);
  const plannedPct = Math.min((planned / total) * 100, 100 - spentPct);

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold">Monthly Budget</span>
        <span className="text-lg font-extrabold text-primary">{formatINR(total)}</span>
      </div>

      {/* Bar */}
      <div className="h-3 bg-border rounded-full overflow-hidden flex mb-3">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${spentPct}%` }}
        />
        <div
          className="h-full bg-primary/30 transition-all duration-500"
          style={{ width: `${plannedPct}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        <LegendItem colour="bg-primary" label="Spent" value={formatINR(spent)} />
        <LegendItem colour="bg-primary/30" label="Planned" value={formatINR(planned)} />
        <LegendItem colour="bg-success/20" label="Remaining" value={formatINR(Math.max(remaining, 0))} highlight />
      </div>
    </div>
  );
}

function LegendItem({ colour, label, value, highlight }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${colour}`} />
      <div>
        <p className="text-[10px] text-muted uppercase tracking-wide">{label}</p>
        <p className={`text-xs font-bold ${highlight ? 'text-success' : 'text-primary'}`}>{value}</p>
      </div>
    </div>
  );
}
