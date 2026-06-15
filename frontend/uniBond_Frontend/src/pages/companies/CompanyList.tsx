import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleGetCompanies, type CompanyProfile } from "@/controllers/companyController";
import { Building, MapPin, Globe, ArrowRight } from "lucide-react";

export default function CompanyList() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    handleGetCompanies()
      .then((response) => setCompanies(response))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 px-2">
         <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building className="w-6 h-6 text-blue-600"/> Partner Companies
         </h1>
         {user?.role === "company" && (
           <button onClick={() => navigate("/tasks/create")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition">
             + Post Task
           </button>
         )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading companies...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(c => (
            <div key={c.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition group flex flex-col h-full">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl mb-4">
                 {c.name.charAt(0)}
               </div>
               
               <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition truncate">{c.name}</h3>
               <p className="text-sm font-semibold text-purple-600 mb-3">{c.industry}</p>
               
               <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{c.description}</p>
               
               <div className="space-y-2 mb-6">
                 <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                   <MapPin className="w-3.5 h-3.5"/> {c.location}
                 </div>
                 {c.website && (
                   <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                     <Globe className="w-3.5 h-3.5"/> <a href={c.website} target="_blank" rel="noreferrer" className="hover:underline">{new URL(c.website).hostname}</a>
                   </div>
                 )}
               </div>
               
               <button onClick={() => navigate(`/companies/${c.id}`)} className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2">
                 View Profile & Tasks <ArrowRight className="w-4 h-4"/>
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
