"use client";

type ViewHeaderProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle?: string;
  className?: string;
};

export function ViewHeader({
  icon: Icon,
  title,
  subtitle,
  className = "",
}: ViewHeaderProps) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${className}`}>
      <Icon className="text-2xl text-emerald-300" size={24} />
      <div>
        <h2 className="text-2xl font-bold text-emerald-300">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
