import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Video, FileText, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useProfessionalCommunication } from "@/contexts/ProfessionalCommunicationContext";

export default function CreateProfessionalSession() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  const { user } = useAuth();
  const { sessions, addSession, updateSession } = useProfessionalCommunication();
  
  const isEditMode = Boolean(id);
  const existingSession = isEditMode ? sessions.find(s => s.id === id) : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    link: "",
    seatCount: "30",
    tags: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isEditMode && existingSession) {
      setFormData({
        title: existingSession.title,
        description: existingSession.description,
        date: existingSession.date,
        time: existingSession.time,
        link: existingSession.link,
        seatCount: String(existingSession.seatCount),
        tags: existingSession.tags.join(", "),
      });
    }
  }, [isEditMode, existingSession]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.title.trim()) {
      newErrors.title = "Session Title is required.";
    } else if (formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters for better clarity.";
    } else if (formData.title.length > 80) {
      newErrors.title = "Title is too long (max 80 characters).";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (formData.description.length < 30) {
      newErrors.description = "Please provide at least 30 characters describing the session.";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description is too long (max 500 characters).";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required.";
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate < today) {
        newErrors.date = "You cannot schedule a session in the past.";
      }
    }

    if (!formData.time) newErrors.time = "Time is required.";
    
    if (!formData.link.trim()) {
      newErrors.link = "Meeting Link is required.";
    } else {
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.link)) {
        newErrors.link = "Please enter a valid URL (e.g., https://meet.google.com/abc-defg-hij).";
      }
    }

    if (formData.tags) {
      const tagList = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length > 5) {
        newErrors.tags = "Maximum 5 tags allowed.";
      }
      if (tagList.some(tag => tag.length > 15)) {
        newErrors.tags = "Each tag must be under 15 characters.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const sessionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        link: formData.link.trim(),
        seatCount: Number(formData.seatCount) || 30,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        speaker: isEditMode && existingSession 
          ? existingSession.speaker 
          : `${user?.firstname || 'Current'} ${user?.lastname || 'User'}`,
        creatorId: isEditMode && existingSession
          ? existingSession.creatorId
          : (user?.id?.toString() || "mock-creator-id")
      };

      if (isEditMode && id) {
        void updateSession(id, sessionData);
      } else {
        void addSession(sessionData);
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate(ROUTES.PROFESSIONAL_COMMUNICATION);
      }, 2000);
    }, 800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (isEditMode && !existingSession) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900">Session not found</h2>
        <Link to={ROUTES.PROFESSIONAL_COMMUNICATION} className="text-indigo-600 hover:underline mt-4 inline-block">
          Return to Sessions
        </Link>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {isEditMode ? "Session Updated!" : "Session Created!"}
        </h2>
        <p className="text-gray-500 text-lg mb-8">
          {isEditMode 
            ? "Your professional communication session has been successfully updated." 
            : "Your professional communication session has been successfully scheduled and is now visible to students."}
        </p>
        <Link
          to={ROUTES.PROFESSIONAL_COMMUNICATION}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4 animate-in slide-in-from-left duration-500">
        <Link to={ROUTES.PROFESSIONAL_COMMUNICATION} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Session" : "Create New Session"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditMode ? "Update details for this session." : "Schedule a new professional communication session for students."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6" noValidate>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Session Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Navigating Tech Careers in 2026"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
                    errors.title ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                  {formData.title.length}/80
                </div>
              </div>
              {errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What will this session cover? What should students expect?"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none transition-all resize-none ${
                    errors.description ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  }`}
                />
                <div className="absolute right-4 bottom-3 text-[10px] font-bold text-gray-400">
                  {formData.description.length}/500
                </div>
              </div>
              {errors.description && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
                      errors.date ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.date && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
                      errors.time ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                    }`}
                  />
                </div>
                {errors.time && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
                    errors.link ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {errors.link && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.link}</p>}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Career, Software Engineering, Q&A"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link
              to={ROUTES.PROFESSIONAL_COMMUNICATION}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEditMode ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                isEditMode ? 'Update Session' : 'Create Session'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
