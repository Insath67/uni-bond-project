import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { handleGetCompanyById, type CompanyProfile } from "@/controllers/companyController";
import { handleGetTasks } from "@/controllers/taskController";
import type { Task } from "@/types/task";
import SectionCard from "@/components/common/SectionCard";
import { MapPin, Globe, ArrowLeft, Briefcase, Star } from "lucide-react";

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        handleGetCompanyById(id),
        handleGetTasks()
      ])
        .then(([companyResponse, allTasks]) => {
          setCompany(companyResponse || null);
          setTasks(allTasks.filter(t => t.companyId === id));
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="text-center py-10">Loading company details...</div>;
  if (!company) return <div className="text-center py-10">Company Not Found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium">
         <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Company Header */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
        <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
           <div className="w-24 h-24 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-4xl shadow-md">
             {company.name.charAt(0)}
           </div>
           
           <div className="flex-1">
             <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-extrabold text-gray-900">{company.name}</h1>
               <span className="bg-purple-100 text-purple-700 font-bold text-xs px-2.5 py-1 rounded-md uppercase tracking-wide">
                 {company.industry}
               </span>
             </div>
             
             <p className="text-gray-700 mb-4 max-w-2xl leading-relaxed">{company.description}</p>
             
             <div className="flex gap-4 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400"/> {company.location}</div>
                {company.website && (
                  <div className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Globe className="w-4 h-4"/> <a href={company.website} target="_blank" rel="noreferrer">{new URL(company.website).hostname}</a>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Tasks Feed */}
         <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 px-2">
               <Briefcase className="w-5 h-5 text-blue-600"/> Tasks & Opportunities ({tasks.length})
            </h2>
            
            {tasks.length === 0 ? (
              <div className="bg-white border rounded-xl p-8 text-center text-gray-500 border-dashed">
                 No tasks currently open by this company.
              </div>
            ) : (
              tasks.map(t => (
                <div key={t.id} className="bg-white border rounded-xl p-5 hover:border-blue-300 transition shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-lg text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/tasks/${t.id}`)}>{t.title}</h3>
                     <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100">
                       {t.stipend || "Unpaid"}
                     </span>
                  </div>
                  <div className="flex gap-2">
                     <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">{t.category}</span>
                     <span className="text-xs font-semibold text-gray-600">{t.projectType}</span>
                  </div>
                  <p className="text-gray-600 text-sm my-3 line-clamp-2">{t.description}</p>
                  
                  <div className="flex justify-between items-center mt-4 border-t border-gray-100 pt-3">
                     <div className="text-xs font-medium text-gray-500">
                       Deadline: {new Date(t.deadline).toLocaleDateString()}
                     </div>
                     <button onClick={() => navigate(`/tasks/${t.id}`)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                       View Details &rarr;
                     </button>
                  </div>
                </div>
              ))
            )}
         </div>

         {/* Sidebar - Reviews / Info */}
         <div className="space-y-6">
            <SectionCard title="Company Reviews">
               <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-yellow-400">
                    <Star className="w-5 h-5 fill-current"/>
                    <Star className="w-5 h-5 fill-current"/>
                    <Star className="w-5 h-5 fill-current"/>
                    <Star className="w-5 h-5 fill-current"/>
                    <Star className="w-5 h-5 fill-current opacity-30"/>
                  </div>
                  <span className="text-lg font-bold text-gray-900">4.1</span>
                  <span className="text-sm text-gray-500">(12 reviews)</span>
               </div>
               
               <div className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800 text-sm">John D.</span>
                      <span className="text-xs text-gray-500">3 mos ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Great internship experience. Learned a lot about scaling backends.</p>
                 </div>
                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800 text-sm">Sarah K.</span>
                      <span className="text-xs text-gray-500">5 mos ago</span>
                    </div>
                    <p className="text-sm text-gray-600">Good stipend but tasks can be quite challenging.</p>
                 </div>
               </div>
            </SectionCard>
         </div>
      </div>
    </div>
  );
}
