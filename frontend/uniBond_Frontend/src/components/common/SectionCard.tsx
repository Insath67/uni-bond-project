type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({ title, children, className = "" }: Props) {
  return (
    <div className={`panel-surface rounded-3xl p-5 sm:p-6 ${className}`}>
      <h3 className="text-[1.05rem] font-bold text-[var(--text-primary)] mb-4 tracking-tight">{title}</h3>
      {children}
    </div>
  );
}
