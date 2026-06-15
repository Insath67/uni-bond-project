import { useState } from "react";
import { BookOpen, Search, Plus, Calendar, DollarSign, Edit, Trash2, CheckCircle2, Users, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useCourseContext } from "@/contexts/CourseContext";

export default function CourseList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { courses, deleteCourse, getRegistrationStatus } = useCourseContext();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all');
  const [toastMessage, setToastMessage] = useState("");
  
  const isLecturer = user?.role === "lecturer" || user?.role === "admin";
  const studentId = user?.id?.toString() || "mock-student-id";

  const displayedCourses = courses.filter(c => {
    if (isLecturer) return true;
    if (activeTab === 'registered') return getRegistrationStatus(c.id, studentId) !== undefined;
    return true;
  });

  const filteredCourses = displayedCourses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this course?")) {
      deleteCourse(id);
      showToast("Course deleted successfully.");
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`${ROUTES.COURSES}/edit/${id}`);
  };

  return (
    <div className="space-y-8 pb-12 antialiased">
      {toastMessage && (
        <div className="fixed top-24 right-8 bg-black/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 z-50 animate-in fade-in slide-in-from-top-10 duration-500 border border-white/10">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Modern Learning Header - Better spacing for 3-9 layout */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-indigo-950 p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-0 -ml-40 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-blue-300 font-bold mb-4 tracking-wider uppercase text-xs">
              <GraduationCap className="h-4 w-4" />
              Learning Academy
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-4">
              Master New Skills with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">Expert-Led</span> Courses.
            </h1>
            <p className="text-base text-indigo-100/70 mb-8 leading-relaxed">
              Explore a curated collection of premium courses designed to take your expertise to the next level.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-1.5 rounded-lg border border-white/10">
                    <Users className="h-3.5 w-3.5 text-blue-300" />
                  </div>
                  <span className="text-xs font-bold text-white">5k+ Community</span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 backdrop-blur-xl p-3 rounded-[2rem] border border-white/10 shadow-inner">
            <div className="relative group w-full sm:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-300" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white/10 border border-white/10 text-white placeholder-indigo-300/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 w-full sm:w-64 transition-all font-medium"
              />
            </div>
            {isLecturer && (
              <Link
                to={ROUTES.CREATE_COURSE}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                Add Course
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        {!isLecturer && (
          <div className="flex bg-gray-200/50 p-1.5 rounded-2xl w-full md:w-max border border-white/10">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 md:flex-none px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10' : 'text-gray-500 hover:text-gray-700'}`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveTab('registered')}
              className={`flex-1 md:flex-none px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'registered' ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10' : 'text-gray-500 hover:text-gray-700'}`}
            >
              My Path
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-900">{filteredCourses.length} Courses</span>
           </div>
        </div>
      </div>

      {/* Optimized Course Grid - 3 columns for better width */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map((course) => {
            return (
              <div key={course.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative">
                
                {isLecturer && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <button 
                      onClick={(e) => handleEdit(course.id, e)}
                      className="p-2.5 bg-white shadow-xl text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(course.id, e)}
                      className="p-2.5 bg-white shadow-xl text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all transform hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="h-48 overflow-hidden relative bg-indigo-950">
                   <div className="absolute inset-0 bg-indigo-900 opacity-60 group-hover:scale-110 transition-transform duration-700"></div>
                   <div className="absolute bottom-6 left-6 right-6 z-20">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="bg-blue-500/30 backdrop-blur-md text-blue-100 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-white/10">
                            Course
                         </span>
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                        {course.title}
                      </h3>
                   </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-lg font-black items-center gap-1 border border-emerald-100">
                      <DollarSign className="h-5 w-5" />
                      {course.price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 uppercase">
                      <Calendar className="h-3 w-3" />
                      {course.dateAdded}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-8 flex-1 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-8 group-hover:bg-blue-50 transition-colors duration-300">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorName)}&background=2563eb&color=ffffff`} className="w-10 h-10 rounded-xl shadow-md" alt="Lecturer" />
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Instructor</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{course.instructorName}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link
                      to={`${ROUTES.COURSES}/${course.id}`}
                      className="w-full relative overflow-hidden group/btn inline-flex items-center justify-center gap-2 bg-gray-950 text-white font-bold py-4 rounded-xl shadow-xl transition-all duration-300 active:scale-[0.97]"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                         Explore Content
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
          <BookOpen className="h-16 w-16 text-gray-200 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-2">Portfolio Empty</h3>
          <p className="text-gray-500 font-medium leading-relaxed">We're currently preparing new educational content.<br/>Please visit us again shortly.</p>
        </div>
      )}

    </div>
  );
}
