import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { handleGetClassroomById } from "@/controllers/classroomController";
import type { Classroom } from "@/types/classroom";
import SectionCard from "@/components/common/SectionCard";
import { Star, ArrowLeft } from "lucide-react";

export default function ClassroomDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState<Classroom | null>(null);

  useEffect(() => {
    if (id) {
       handleGetClassroomById(id).then(res => setClassroom(res || null));
    }
  }, [id]);

  if (!classroom) return <div className="p-10 text-center">Loading or Not Found</div>;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium mb-4">
         <ArrowLeft className="w-4 h-4" /> Back to Classrooms
      </button>

      <SectionCard title={classroom.title}>
         <div className="flex items-center gap-2 mb-6 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-bold w-fit">
            <Star className="w-4 h-4 fill-current"/>
             {classroom.rating.toFixed(1)} ({classroom.totalRatings} Reviews)
         </div>

         <h3 className="text-lg font-semibold text-gray-800 mb-2">Hosted by Tech Lead {classroom.techLeadName}</h3>
         <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{classroom.description}</p>
         
         <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
            <div className="text-sm font-medium text-gray-500">
               Created {new Date(classroom.createdAt).toLocaleDateString()}
            </div>
            <div className="font-bold text-gray-900">
               {classroom.currentStudents} / {classroom.maxStudents} Students Enrolled
            </div>
         </div>
      </SectionCard>
    </div>
  );
}
