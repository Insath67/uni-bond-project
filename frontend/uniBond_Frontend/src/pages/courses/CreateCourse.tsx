import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, DollarSign, Video, FileText, CheckCircle2 } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useCourseContext } from "@/contexts/CourseContext";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  const { user } = useAuth();
  const { courses, addCourse, updateCourse } = useCourseContext();
  
  const isEditMode = Boolean(id);
  const existingCourse = isEditMode ? courses.find(c => c.id === id) : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    pdfUrl: "",
    pdfUrlsText: "",
    videoUrl: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isEditMode && existingCourse) {
      setFormData({
        title: existingCourse.title,
        description: existingCourse.description,
        price: existingCourse.price.toString(),
        pdfUrl: existingCourse.pdfUrls?.[0] ?? existingCourse.pdfUrl,
        pdfUrlsText: existingCourse.pdfUrls?.join("\n") ?? existingCourse.pdfUrl,
        videoUrl: existingCourse.videoUrl,
      });
      setPdfFiles([]);
    }
  }, [isEditMode, existingCourse]);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read PDF file"));
      reader.readAsDataURL(file);
    });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Course Title is required.";
    } else if (formData.title.length < 10) {
      newErrors.title = "Course title is too short (min 10 chars).";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required.";
    } else if (formData.description.length < 50) {
      newErrors.description = "Please provide more detail in the description (min 50 chars).";
    }
    
    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum)) {
      newErrors.price = "Enter a valid price.";
    } else if (priceNum < 0) {
      newErrors.price = "Price cannot be negative.";
    } else if (priceNum > 2000) {
      newErrors.price = "Price exceeds maximum limit ($2000).";
    }
    
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

    const pdfLinks = formData.pdfUrlsText
      .split(/\r?\n|,/) 
      .map((item) => item.trim())
      .filter(Boolean);
    const hasPdfUrl = Boolean(formData.pdfUrl.trim());
    if (hasPdfUrl) {
      pdfLinks.push(formData.pdfUrl.trim());
    }

    const hasPdfFile = pdfFiles.length > 0;

    if (pdfLinks.length === 0 && !hasPdfFile) {
      newErrors.pdfUrl = "Add at least one PDF link or upload one/more PDF files.";
    }

    if (pdfLinks.some((link) => !urlPattern.test(link))) {
      newErrors.pdfUrl = "One or more PDF links are invalid URLs.";
    }

    if (pdfFiles.length > 0) {
      if (pdfFiles.some((file) => file.type !== "application/pdf")) {
        newErrors.pdfFile = "Only PDF files are allowed.";
      } else if (pdfFiles.some((file) => file.size > 10 * 1024 * 1024)) {
        newErrors.pdfFile = "Each PDF file must be 10MB or less.";
      }
    }
    
    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = "Video Link is required.";
    } else if (!urlPattern.test(formData.videoUrl)) {
      newErrors.videoUrl = "Please enter a valid URL for the video lecture.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const linkPdfUrls = formData.pdfUrlsText
        .split(/\r?\n|,/) 
        .map((item) => item.trim())
        .filter(Boolean);
      if (formData.pdfUrl.trim()) {
        linkPdfUrls.push(formData.pdfUrl.trim());
      }

      const uploadedPdfUrls = await Promise.all(pdfFiles.map((file) => fileToDataUrl(file)));
      const allPdfUrls = [...new Set([...linkPdfUrls, ...uploadedPdfUrls])];

      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        pdfUrl: allPdfUrls[0] ?? "",
        pdfUrls: allPdfUrls,
        videoUrl: formData.videoUrl.trim(),
        instructorName: isEditMode && existingCourse 
          ? existingCourse.instructorName 
          : `${user?.firstname || 'Current'} ${user?.lastname || 'User'}`,
        creatorId: isEditMode && existingCourse
          ? existingCourse.creatorId
          : (user?.id?.toString() || "mock-creator-id")
      };

      if (isEditMode && id) {
        updateCourse(id, courseData);
      } else {
        addCourse(courseData);
      }

      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => navigate(ROUTES.COURSES), 2000);
    } catch {
      setIsSubmitting(false);
      setErrors((prev) => ({ ...prev, pdfFile: "Failed to process uploaded PDF." }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setPdfFiles(selected);
    if (errors.pdfFile || errors.pdfUrl) {
      setErrors((prev) => ({ ...prev, pdfFile: "", pdfUrl: "" }));
    }
  };

  if (showSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-2xl mx-auto border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          {isEditMode ? "Course Updated!" : "Course Created!"}
        </h2>
        <p className="text-gray-500 text-lg mb-8">
          {isEditMode 
            ? "Your course materials hit the cloud and are live." 
            : "Your new course has been successfully published for students."}
        </p>
        <Link
          to={ROUTES.COURSES}
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4 animate-in slide-in-from-left duration-500">
        <Link to={ROUTES.COURSES} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Course" : "Upload New Course"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEditMode ? "Update your course materials." : "Share your knowledge with students by uploading materials."}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6" noValidate>
          
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Advanced System Architecture"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
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
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Course Price (USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="49.99"
                  className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none transition-all ${
                    errors.price ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed explanation of what students will learn..."
                  className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-all resize-none ${
                    errors.description ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                  }`}
                />
                <div className="absolute right-4 bottom-3 text-[10px] font-bold text-gray-400">
                  {formData.description.length}/800
                </div>
              </div>
              {errors.description && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.description}</p>}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Course Materials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="pdfUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    PDF Document Links
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      id="pdfUrl"
                      name="pdfUrl"
                      value={formData.pdfUrl}
                      onChange={handleChange}
                      placeholder="https://drive.google.com/first.pdf"
                      className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none text-sm transition-all ${
                        errors.pdfUrl ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                      }`}
                    />
                  </div>
                  {errors.pdfUrl && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.pdfUrl}</p>}

                  <textarea
                    id="pdfUrlsText"
                    name="pdfUrlsText"
                    rows={4}
                    value={formData.pdfUrlsText}
                    onChange={handleChange}
                    placeholder="Paste more PDF links, one per line"
                    className="w-full mt-3 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none text-sm focus:ring-2 focus:ring-indigo-500"
                  />

                  <label htmlFor="pdfFile" className="block text-sm font-medium text-gray-700 mt-3 mb-1">
                    Or Upload Lecturer PDFs
                  </label>
                  <input
                    type="file"
                    id="pdfFile"
                    name="pdfFile"
                    accept=".pdf,application/pdf"
                    multiple
                    onChange={handlePdfFileChange}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white"
                  />
                  {pdfFiles.length > 0 && <p className="text-xs mt-1.5 text-gray-600">Selected {pdfFiles.length} PDF file(s)</p>}
                  {errors.pdfFile && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.pdfFile}</p>}
                </div>

                <div>
                  <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Lecture Video Link <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      id="videoUrl"
                      name="videoUrl"
                      value={formData.videoUrl}
                      onChange={handleChange}
                      placeholder="https://youtube.com/..."
                      className={`w-full pl-11 pr-4 py-2.5 border rounded-xl focus:outline-none text-sm transition-all ${
                        errors.videoUrl ? "border-red-300 focus:ring-red-500 bg-red-50" : "border-gray-200 focus:ring-2 focus:ring-indigo-500"
                      }`}
                    />
                  </div>
                  {errors.videoUrl && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.videoUrl}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link
              to={ROUTES.COURSES}
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
                isEditMode ? 'Update Course' : 'Publish Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
