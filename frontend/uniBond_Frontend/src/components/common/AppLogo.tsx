import { GraduationCap } from "lucide-react";

export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="w-8 h-8 text-blue-600" />
      <span className="text-xl font-bold text-gray-800">UniBond</span>
    </div>
  );
}