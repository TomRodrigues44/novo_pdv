interface EmporioLogoProps {
  className?: string;
  compact?: boolean;
}

export const EmporioLogo = ({ className = "", compact = false }: EmporioLogoProps) => (
  <div
    aria-label="Empório das Coxinhas"
    className={`flex items-center gap-3 rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-100 px-4 py-3 shadow-sm ${compact ? "min-w-40" : "min-w-56"} ${className}`}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-600 text-2xl shadow-md">
      🥟
    </div>
    <div className="leading-tight">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-800">Empório das</p>
      <p className="text-xl font-black tracking-tight text-orange-600">Coxinhas</p>
      {!compact && <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">Sabor em cada momento</p>}
    </div>
  </div>
);