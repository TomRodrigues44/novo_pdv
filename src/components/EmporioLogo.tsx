interface EmporioLogoProps {
  className?: string;
  compact?: boolean;
}

export const EmporioLogo = ({ className = "", compact = false }: EmporioLogoProps) => (
  <img
    src="/logo-emporio.svg"
    alt="Empório das Coxinhas"
    className={`object-contain ${compact ? "h-14 w-36" : "h-24 w-56"} ${className}`}
  />
);