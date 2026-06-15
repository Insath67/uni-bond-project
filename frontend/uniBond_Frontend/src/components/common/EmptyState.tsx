import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export default function EmptyState({ icon: Icon, title, description, className = "" }: Props) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}