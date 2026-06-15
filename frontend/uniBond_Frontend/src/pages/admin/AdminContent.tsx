import { useState } from "react";
import SectionCard from "@/components/common/SectionCard";
import { Trash2, AlertTriangle } from "lucide-react";

export default function AdminContent() {
   const [reports, setReports] = useState([
      { id: "p1", type: "post", author: "John Doe", content: "This is a spam message with bad links...", reason: "Spam", date: "2023-11-01" },
      { id: "g1", type: "group", author: "Fake User", content: "Free crypto group", reason: "Scam", date: "2023-11-02" },
   ]);

   const removeContent = (id: string) => {
      setReports(reports.filter(r => r.id !== id));
      alert("Content removed from platform.");
   };

   const ignoreReport = (id: string) => {
      setReports(reports.filter(r => r.id !== id));
   };

   return (
      <div className="space-y-6">
         <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
         <p className="text-gray-600">Review reported posts, groups, and notices.</p>

         {reports.length === 0 ? (
            <SectionCard title="Report Queue">
               <div className="text-center py-10 text-gray-500 font-medium">
                  No pending reports. Great job!
               </div>
            </SectionCard>
         ) : (
            <div className="space-y-4">
               {reports.map((r) => (
                  <div key={r.id} className="bg-white border border-gray-200 border-l-4 border-l-red-500 rounded-lg p-5 shadow-sm">
                     <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                           <AlertTriangle className="w-5 h-5 text-red-500 mb-1" />
                           <h3 className="font-bold text-lg text-gray-900 capitalize">Reported {r.type}</h3>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold bg-gray-50 px-2 py-1 rounded">{r.date}</span>
                     </div>
                     
                     <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Author: {r.author}</p>
                        <p className="text-gray-800 leading-relaxed text-sm">{r.content}</p>
                     </div>
                     
                     <div className="flex justify-between items-center rounded-lg mt-2">
                        <p className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-md">Reason: {r.reason}</p>
                        <div className="flex gap-2">
                           <button onClick={() => ignoreReport(r.id)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-lg transition">
                              Ignore
                           </button>
                           <button onClick={() => removeContent(r.id)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-500 text-white hover:bg-red-600 rounded-lg transition shadow-sm">
                              <Trash2 className="w-4 h-4" /> Delete
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
