import { useEffect, useState } from "react";
import { handleGetNotices } from "@/controllers/noticeController";
import type { Notice } from "@/types/notice";
import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import { Megaphone, Pin, Clock } from "lucide-react";

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    setLoading(true);
    const data = await handleGetNotices();
    // sort by pinned first, then by date desc
    data.sort((a, b) => {
       if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    setNotices(data);
    setLoading(false);
  };

  const getNoticeTheme = (type?: Notice["type"]) => {
      switch (type) {
         case "official": return "bg-red-50 text-red-700 border-red-200";
         case "department": return "bg-blue-50 text-blue-700 border-blue-200";
         case "general": return "bg-gray-50 text-gray-700 border-gray-200";
         default: return "bg-gray-50 text-gray-700 border-gray-200";
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex justify-between items-center mb-6 px-2">
         <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-600 fill-red-100"/> Notice Board
         </h1>
       </div>

      {loading ? (
        <div className="text-center py-10">Loading notices...</div>
      ) : notices.length === 0 ? (
        <SectionCard title="Notices">
           <EmptyState icon={Megaphone} title="Everything is quiet" description="There are no active notices to display." />
        </SectionCard>
      ) : (
        <div className="space-y-4">
           {notices.map(n => (
              <div key={n.id} className={`bg-white border-2 rounded-xl p-6 shadow-sm transition ${n.isPinned ? 'border-yellow-400 bg-yellow-50/10' : 'border-gray-100'}`}>
                 <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                          {n.isPinned && <Pin className="w-5 h-5 text-yellow-600 fill-yellow-200" />}
                          <h3 className="font-bold text-xl text-gray-900">{n.title}</h3>
                       </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border shrink-0 ${getNoticeTheme(n.type)}`}>
                       {n.type || "general"}
                    </span>
                 </div>
                 <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6 bg-gray-50/50 p-4 rounded-lg">{n.content}</p>
                 <div className="flex justify-between items-center mt-auto text-sm font-medium text-gray-500 bg-white pt-2">
                    <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> Posted {new Date(n.createdAt).toLocaleDateString()}</span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">By {n.authorName}</span>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
}