import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Download, AlertTriangle, MonitorPlay } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useCourseContext } from "@/contexts/CourseContext";

export default function CourseContentView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { courses, getRegistrationStatus } = useCourseContext();
  
  const isLecturer = user?.role === "lecturer" || user?.role === "admin";
  const studentId = user?.id?.toString() || "mock-student-id";

  const course = courses.find(c => c.id === id);
  const regStatus = course ? getRegistrationStatus(course.id, studentId) : undefined;
  const isUnlocked = isLecturer || regStatus?.status === "approved";
  const pdfLinks = course
    ? ((course.pdfUrls && course.pdfUrls.length > 0 ? course.pdfUrls : [course.pdfUrl]).filter(Boolean))
    : [];

  if (!course) {
    return (
      <div className="bg-white rounded-xl p-16 text-center border border-gray-100 max-w-2xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h3>
        <p className="text-gray-500 mb-6">This course is unavailable or the link is incorrect.</p>
        <Link to={ROUTES.COURSES} className="text-indigo-600 font-medium hover:underline">
          Back to Courses
        </Link>
      </div>
    );
  }

  // Security Check
  if (!isUnlocked) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-t-4 border-red-500 max-w-2xl mx-auto mt-20">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-tight">Access Denied</h2>
        <p className="text-gray-500 text-lg mb-8">
          You must purchase this course and have your payment verified by the AI Agent before accessing these materials.
        </p>
        <Link
          to={`${ROUTES.COURSES}/${course.id}`}
          className="inline-flex items-center justify-center bg-gray-900 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:bg-gray-800 transition-all"
        >
          Go to Registration Page
        </Link>
      </div>
    );
  }

  // To embed YouTube videos safely instead of just an an external link, we try to convert watch?v= format
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
  };

  const embedVideoUrl = getEmbedUrl(course.videoUrl);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link to={`${ROUTES.COURSES}/${course.id}`} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-lg">
              {course.title}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              Course Content Viewer
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {pdfLinks.length > 0 && (
            <a
              href={pdfLinks[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl transition-colors border border-blue-200"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="shrink-0">Download PDF Notes ({pdfLinks.length})</span>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Video Player Area */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative group aspect-video">
            <iframe 
              src={embedVideoUrl} 
              title="Course Video"
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
            {/* Fallback overlay if iframe is blocked by mock URLs */}
            {!course.videoUrl.includes("youtube") && !course.videoUrl.includes("vimeo") && (
               <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-700 pointer-events-none">
                 <MonitorPlay className="h-16 w-16 text-gray-600 mb-4" />
                 <h3 className="text-xl font-bold text-white mb-2">Video Player Simulation</h3>
                 <p className="text-gray-400 text-sm max-w-sm">
                   External link provided: {course.videoUrl}. If this was a real YouTube/Vimeo link, it would be embedded here natively.
                 </p>
                 <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-6 pointer-events-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700">Open External Video</a>
               </div>
            )}
          </div>
          
          <div className="mt-6 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-gray-900 mb-2">About this Lesson</h3>
             <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </div>
        </div>

        {/* Sidebar References */}
        <div className="space-y-6">
           {/* Instructor Card */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Instructor</h3>
             <div className="flex items-center gap-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorName)}&background=eef2ff&color=4f46e5`} 
                  alt="Lecturer" 
                  className="w-16 h-16 rounded-full border-4 border-indigo-50 shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{course.instructorName}</h4>
                  <p className="text-sm text-gray-500 font-medium">Verified Lecturer</p>
                </div>
             </div>
           </div>

           {/* PDF Viewer Mini-card */}
           <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-sm text-white sticky top-24">
             <BookOpen className="h-10 w-10 text-blue-200 mb-4 opacity-80" />
             <h3 className="font-bold text-xl mb-2">Course Materials</h3>
             <p className="text-blue-100 text-sm mb-6 opacity-90 leading-relaxed">
                Make sure to download the PDF presentation slides to follow along with the video lecture.
             </p>
             <div className="space-y-2">
               {pdfLinks.map((link, index) => (
                 <a
                   key={`${course.id}-pdf-${index}`}
                   href={link}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full flex items-center justify-center gap-2 bg-white text-indigo-700 font-bold py-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors"
                 >
                   <Download className="h-5 w-5" /> Open PDF {index + 1}
                 </a>
               ))}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
