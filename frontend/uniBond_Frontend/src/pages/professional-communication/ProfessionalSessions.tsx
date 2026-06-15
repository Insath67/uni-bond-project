import { useState } from "react";
import { Search, Plus, Calendar, Clock, User, Edit, Trash2, Mail, Rocket, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useProfessionalCommunication } from "@/contexts/ProfessionalCommunicationContext";

export default function ProfessionalSessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    sessions, 
    deleteSession,
    isStudentRegistered
  } = useProfessionalCommunication();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all');
  const [toastMessage, setToastMessage] = useState("");
  
  const isTechLeader = user?.role === "tech_lead" || user?.role === "admin";
  const studentId = user?.id?.toString() || "mock-student-id";

  const displayedSessions = sessions.filter(s => {
    if (isTechLeader) return true;
    if (activeTab === 'registered') return isStudentRegistered(s.id, studentId);
    return true;
  });

  const filteredSessions = displayedSessions.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession(id);
      showToast("Session deleted successfully.");
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`${ROUTES.PROFESSIONAL_COMMUNICATION}/edit/${id}`);
  };

  return (
    <div className="space-y-8 pb-12 antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-black/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 z-50 animate-in fade-in slide-in-from-top-10 duration-500 border border-white/10">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Mail className="h-5 w-5" />
          </div>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-indigo-300 font-bold mb-4 tracking-wider uppercase text-xs">
              <Star className="h-4 w-4 fill-indigo-400" />
              Professional Hub
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-4">
              Connect with Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Visionaries.</span>
            </h1>
            <p className="text-base text-indigo-100/70 mb-8 leading-relaxed">
              Bridging the gap between theory and industry. Book sessions with senior tech leaders and accelerate your career.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-indigo-950 shadow-lg" alt="Speaker" />
                  ))}
               </div>
               <span className="text-xs font-medium text-indigo-200/60">Joined by 200+ students this month</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 backdrop-blur-xl p-3 rounded-[2rem] border border-white/10 shadow-inner">
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-300" />
              <input
                type="text"
                placeholder="Find speakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white/10 border border-white/10 text-white placeholder-indigo-300/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 w-full sm:w-64 transition-all"
              />
            </div>
            {isTechLeader && (
              <Link
                to={ROUTES.CREATE_PROFESSIONAL_SESSION}
                className="flex items-center justify-center gap-2 bg-white text-indigo-900 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl active:scale-95 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                Host session
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        {!isTechLeader && (
          <div className="flex bg-gray-200/50 p-1.5 rounded-2xl w-full md:w-max border border-white/10">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Programs
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 md:flex-none px-6 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'registered' ? 'bg-white text-indigo-600 shadow-lg shadow-indigo-500/10' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Registrations
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-6 text-sm text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-orange-500" />
            <span className="text-gray-900 font-bold">{filteredSessions.length}</span> Sessions
          </div>
        </div>
      </div>

      {/* Optimized Sessions Grid - 3 columns for better width */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredSessions.map((session) => {
            return (
              <div key={session.id} className="group relative bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(79,70,229,0.1)] transition-all duration-500 flex flex-col overflow-hidden">
                <div className="p-8 flex-1 flex flex-col">
                  
                  {/* Action Buttons */}
                  {isTechLeader && (
                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <button 
                        onClick={(e) => handleEdit(session.id, e)}
                        className="p-2.5 bg-white shadow-lg text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(session.id, e)}
                        className="p-2.5 bg-white shadow-lg text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {session.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">
                    {session.title}
                  </h3>
                  
                  <p className="text-gray-500 mb-6 flex-1 line-clamp-3 leading-relaxed text-sm">
                    {session.description}
                  </p>
                  
                  <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100 mb-6 group-hover:bg-indigo-50/50 transition-colors duration-300">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Speaker</p>
                          <p className="text-sm font-bold text-gray-900 truncate">{session.speaker}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200/50 pt-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-xs font-bold text-gray-700">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-xs font-bold text-gray-700">{session.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`${ROUTES.PROFESSIONAL_COMMUNICATION}/${session.id}`}
                      className="w-full relative overflow-hidden group/btn inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300 active:scale-[0.97]"
                    >
                      <span className="relative z-10">Reserve Spot</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
          <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-8 animate-pulse text-indigo-300">
            <Search className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Sessions Found</h3>
          <p className="text-gray-500 font-medium">Try broadening your search or check back tomorrow.</p>
        </div>
      )}

    </div>
  );
}
