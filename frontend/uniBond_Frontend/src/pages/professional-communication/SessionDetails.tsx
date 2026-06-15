import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Video, Users, Mail, X, Edit, Trash2 } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useProfessionalCommunication } from "@/contexts/ProfessionalCommunicationContext";

export default function SessionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { 
    sessions, 
    deleteSession, 
    registerStudent, 
    isStudentRegistered, 
    getAttendeesForSession 
  } = useProfessionalCommunication();

  const [toastMessage, setToastMessage] = useState("");
  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);

  // Treat tech_lead and admin as tech leaders
  const isTechLeader = user?.role === "tech_lead" || user?.role === "admin";
  const studentId = user?.id?.toString() || "mock-student-id";
  const studentName = `${user?.firstname || 'Guest'} ${user?.lastname || 'User'}`;
  const studentEmail = user?.email || "student@example.com";

  const session = sessions.find((s) => s.id === id);
  const registered = session ? isStudentRegistered(session.id, studentId) : false;
  const attendees = session ? getAttendeesForSession(session.id) : [];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session && confirm("Are you sure you want to delete this session?")) {
      deleteSession(session.id);
      navigate(ROUTES.PROFESSIONAL_COMMUNICATION);
    }
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session) {
      registerStudent(session.id, studentId, studentName, studentEmail);
      showToast(`Registered successfully! An email with the session link has been sent to ${studentEmail}`);
    }
  };

  if (!session) {
    return (
      <div className="bg-white rounded-xl p-16 text-center border border-gray-100 max-w-2xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h3>
        <p className="text-gray-500 mb-6">This session may have been deleted or the URL is incorrect.</p>
        <Link 
          to={ROUTES.PROFESSIONAL_COMMUNICATION}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <Mail className="h-5 w-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Elegant Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-3xl shadow-lg p-8 md:p-12 flex flex-col justify-end relative overflow-hidden mt-6 mb-8">
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
        
        <Link to={ROUTES.PROFESSIONAL_COMMUNICATION} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors hidden md:flex items-center justify-center border border-white/20 z-10">
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        
        <div className="relative z-10 mt-12 md:mt-6">
          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 shadow-sm">
            Professional Session
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-md max-w-2xl">
            {session.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-6 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <Calendar className="h-4 w-4 text-indigo-200" /> {session.date}
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <Clock className="h-4 w-4 text-indigo-200" /> {session.time}
            </span>
          </div>
        </div>
      </div>

      {/* Unified Professional Content Box */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 relative z-20 -mt-12 backdrop-blur-xl bg-white/95">
        <div className="max-w-3xl mx-auto">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About this Session</h2>
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-4 mb-10 text-lg leading-relaxed">
            {session.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {session.tags.length > 0 && (
            <div className="mb-12">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Tags & Topics</h3>
              <div className="flex flex-wrap gap-2">
                {session.tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <hr className="border-gray-100 mb-10" />

          {/* Speaker and Action Area */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-50/80 p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
            
            <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto text-center md:text-left">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20"></div>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.speaker)}&background=eef2ff&color=4f46e5`} 
                  alt={session.speaker}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md relative z-10"
                />
              </div>
              <div>
                <p className="font-black text-xl text-gray-900">{session.speaker}</p>
                <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Industry Professional</p>
              </div>
            </div>

            <div className="w-full md:w-auto min-w-[280px] space-y-3">
              {isTechLeader ? (
                <>
                  <button
                    onClick={() => setIsAttendeesModalOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-bold py-3.5 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm"
                  >
                    <Users className="h-5 w-5" />
                    View Registered Students ({attendees.length})
                  </button>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Link
                      to={`${ROUTES.PROFESSIONAL_COMMUNICATION}/edit/${session.id}`}
                      className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-bold py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 hover:bg-red-100 transition-all shadow-sm"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {!registered ? (
                    <>
                      <button
                        onClick={handleRegister}
                        className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-[0.98]"
                      >
                        <Mail className="h-5 w-5" />
                        Register Now
                      </button>
                      <p className="text-xs text-center text-gray-500 font-medium mt-3">
                        Registration link will be sent to your email.
                      </p>
                    </>
                  ) : (
                    <div className="w-full flex flex-col gap-3">
                      <div className="w-full flex items-center justify-center gap-2 py-3 text-emerald-700 font-bold bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                        Registered Successfully
                      </div>
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-3.5 rounded-xl border-2 border-indigo-100 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-[0.98]"
                      >
                        <Video className="h-5 w-5" />
                        Join Session Call
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Attendees Modal for Tech Leaders */}
      {isAttendeesModalOpen && isTechLeader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold">Registered Students</h3>
                <p className="text-sm text-indigo-100 mt-1 truncate max-w-sm">
                  {session.title}
                </p>
              </div>
              <button 
                onClick={() => setIsAttendeesModalOpen(false)}
                className="p-2 text-white hover:bg-indigo-500 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {attendees.length > 0 ? (
                <ul className="space-y-4">
                  {attendees.map((attendee, index) => (
                    <li key={index} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                      <div className="h-10 w-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {attendee.studentName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{attendee.studentName}</p>
                        <p className="text-sm text-gray-500">{attendee.studentEmail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No students have registered yet.</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsAttendeesModalOpen(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
