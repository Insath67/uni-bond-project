import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, DollarSign, CheckCircle2, Lock, Bot, ShieldCheck, FileText, Video, Loader2, Upload, AlertCircle, Edit } from "lucide-react";
import { ROUTES } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuthHook";
import { useCourseContext } from "@/contexts/CourseContext";

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { courses, getRegistrationStatus, registerForCourse } = useCourseContext();

  const [toastMessage, setToastMessage] = useState("");
  
  // Payment & AI flow state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [aiStep, setAiStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  /* AI Steps: 
    0: Input form
    1: "Connecting to Agent..."
    2: "Analyzing Receipt Document..."
    3: "Verifying Transaction..."
    4: "Approved!" 
  */

  const isLecturer = user?.role === "lecturer" || user?.role === "admin";
  const studentId = user?.id?.toString() || "mock-student-id";
  const studentName = `${user?.firstname || 'Guest'} ${user?.lastname || 'User'}`;

  const course = courses.find(c => c.id === id);
  const regStatus = course ? getRegistrationStatus(course.id, studentId) : undefined;
  const isUnlocked = regStatus?.status === "approved";

  useEffect(() => {
    if (aiStep > 0 && aiStep < 4) {
      const timer = setTimeout(() => {
        setAiStep((prev) => (prev + 1) as typeof aiStep);
      }, 1500); // 1.5 seconds per step
      return () => clearTimeout(timer);
    } else if (aiStep === 4) {
      // Verification complete, finalize registration!
      setTimeout(() => {
        if (course) {
          // Provide a local object URL or mock URL for the receipt link in context
          const mockReceiptUrl = slipImage ? URL.createObjectURL(slipImage) : "https://mock-slip-url.com";
          registerForCourse(course.id, studentId, studentName, mockReceiptUrl);
          setIsPaymentModalOpen(false);
          setAiStep(0);
          showToast("Payment verified by AI! Course materials unlocked.");
        }
      }, 1500);
    }
  }, [aiStep, course, studentId, studentName, slipImage, registerForCourse]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const openPaymentModal = () => {
    setBankName("");
    setReferenceId("");
    setPaymentDate("");
    setSlipImage(null);
    setFormErrors({});
    setIsPaymentModalOpen(true);
  };

  const startAIVerification = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!bankName.trim()) errors.bankName = "Bank Name is required.";
    if (!referenceId.trim()) errors.referenceId = "Reference ID is required.";
    if (!paymentDate) errors.paymentDate = "Payment Date is required.";
    if (!slipImage) errors.slipImage = "Payment Slip image is required.";
    else if (!slipImage.type.startsWith("image/")) errors.slipImage = "File must be an image (PNG/JPG).";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setAiStep(1); // Start the animation
  };

  if (!course) {
    return (
      <div className="bg-white rounded-xl p-16 text-center border border-gray-100 max-w-2xl mx-auto mt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h3>
        <p className="text-gray-500 mb-6">This course is unavailable or the link is incorrect.</p>
        <Link 
          to={ROUTES.COURSES}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-indigo-700 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Elegant Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-3xl shadow-lg p-8 md:p-12 flex flex-col justify-end relative overflow-hidden mt-6 mb-8">
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400 opacity-20 rounded-full filter blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>
        
        <Link to={ROUTES.COURSES} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors hidden md:flex items-center justify-center border border-white/20 z-10">
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        
        <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md rounded-full px-4 py-1.5 text-white text-sm font-medium flex items-center gap-2 border border-white/20 z-10 shadow-sm">
           {isUnlocked ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4 opacity-80" />}
           {isUnlocked ? "Access Granted" : "Locked Content"}
        </div>

        <div className="relative z-10 mt-12 md:mt-6">
          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wider mb-4 shadow-sm">
            Premium Course
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-md max-w-2xl">
            {course.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-6 text-white/90 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/10">
              <Calendar className="h-4 w-4 text-indigo-200" /> {course.dateAdded}
            </span>
          </div>
        </div>
      </div>

      {/* Unified Professional Content Box */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 relative z-20 -mt-12 backdrop-blur-xl bg-white/95">
        <div className="max-w-3xl mx-auto">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Course Description</h2>
          <div className="prose prose-indigo max-w-none text-gray-600 space-y-4 mb-10 text-lg leading-relaxed">
            {course.description.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="mb-10 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">What's Included</h4>
            <ul className="flex flex-wrap gap-4 text-sm text-gray-700 font-medium">
              <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"><Video className="h-4 w-4 text-indigo-500" /> Video Lectures</li>
              <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"><FileText className="h-4 w-4 text-blue-500" /> Downloadable PDF Notes</li>
              <li className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"><Bot className="h-4 w-4 text-purple-500" /> AI Payment Verification</li>
            </ul>
          </div>

          <hr className="border-gray-100 mb-10" />

          {/* Instructor & Action Area */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-gray-50/80 p-6 md:p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
            
            <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto text-center md:text-left">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20"></div>
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructorName)}&background=eef2ff&color=4f46e5`} 
                  alt={course.instructorName}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-md relative z-10"
                />
              </div>
              <div>
                <p className="font-black text-xl text-gray-900">{course.instructorName}</p>
                <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Course Instructor</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  <DollarSign className="h-4 w-4 drop-shadow-sm" />
                  {course.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto min-w-[280px] space-y-3">
              {isLecturer ? (
                <div className="bg-indigo-50 p-5 items-center justify-center flex flex-col rounded-xl border border-indigo-100 text-indigo-800 font-medium">
                  <p className="mb-3 font-bold">Lecturer Dashboard</p>
                  <Link to={`${ROUTES.COURSES}/edit/${course.id}`} className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-3 rounded-lg border border-indigo-200 shadow-sm hover:bg-indigo-50 transition-all">
                    <Edit className="h-4 w-4" /> Edit Course
                  </Link>
                </div>
              ) : (
                <>
                  {!isUnlocked ? (
                    <button
                      onClick={openPaymentModal}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all active:scale-[0.98]"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      Pay & Unlock Course
                    </button>
                  ) : (
                    <div className="w-full flex flex-col gap-3">
                      <div className="w-full flex items-center justify-center gap-2 py-3 text-emerald-700 font-bold bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        Purchased
                      </div>
                      <Link
                        to={`${ROUTES.COURSES}/${course.id}/watch`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-white text-indigo-600 font-bold py-3.5 rounded-xl border-2 border-indigo-100 shadow-sm hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-[0.98]"
                      >
                        <BookOpen className="h-5 w-5" />
                        Go to Course Materials
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* AI Payment Verification Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            
            {/* Header */}
            <div className="bg-gray-900 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              <Bot className="h-10 w-10 mx-auto text-indigo-400 mb-2 relative z-10" />
              <h3 className="text-xl font-bold relative z-10">UniBond AI Cashier</h3>
              <p className="opacity-70 mt-1 text-sm relative z-10">Secure Payment Verification</p>
            </div>
            
            <div className="p-8">
              {aiStep === 0 ? (
                /* Step 0: Input */
                <form onSubmit={startAIVerification} className="space-y-5 animate-in slide-in-from-bottom-2 max-h-[70vh] overflow-y-auto px-1 -mx-1">
                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 sticky top-0 z-10">
                    <span className="font-medium text-gray-600">Total Amount</span>
                    <span className="text-2xl font-black text-gray-900">${course.price.toFixed(2)}</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Bank Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Bank of Ceylon"
                        value={bankName}
                        onChange={(e) => { setBankName(e.target.value); setFormErrors(prev => ({...prev, bankName: ''})); }}
                        className={`w-full px-4 py-3 border-2 ${formErrors.bankName ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl focus:ring-0 outline-none text-sm transition-colors bg-gray-50/50`}
                      />
                      {formErrors.bankName && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.bankName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Reference ID</label>
                        <input
                          type="text"
                          placeholder="e.g. TRX-12345"
                          value={referenceId}
                          onChange={(e) => { setReferenceId(e.target.value); setFormErrors(prev => ({...prev, referenceId: ''})); }}
                          className={`w-full px-4 py-3 border-2 ${formErrors.referenceId ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl focus:ring-0 outline-none text-sm transition-colors bg-gray-50/50`}
                        />
                        {formErrors.referenceId && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.referenceId}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Date</label>
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => { setPaymentDate(e.target.value); setFormErrors(prev => ({...prev, paymentDate: ''})); }}
                          className={`w-full px-4 py-3 border-2 ${formErrors.paymentDate ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'} rounded-xl focus:ring-0 outline-none text-sm transition-colors bg-gray-50/50`}
                        />
                        {formErrors.paymentDate && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.paymentDate}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Upload Payment Slip Image</label>
                      <div className={`border-2 border-dashed ${formErrors.slipImage ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'} rounded-xl p-6 text-center transition-colors cursor-pointer group relative bg-gray-50/50`}>
                        {slipImage ? (
                          <div className="flex items-center justify-center gap-2 text-indigo-700 font-medium">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="truncate max-w-[200px]">{slipImage.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2 group-hover:text-indigo-500 transition-colors" />
                            <p className="text-sm text-gray-600 font-medium">Click or drag image here</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => { 
                            if(e.target.files && e.target.files[0]) {
                              setSlipImage(e.target.files[0]);
                              setFormErrors(prev => ({...prev, slipImage: ''}));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        />
                      </div>
                      {formErrors.slipImage && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {formErrors.slipImage}</p>}
                    </div>

                    <p className="text-xs text-gray-500 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                       <Bot className="h-4 w-4 shrink-0 mt-0.5" />
                       <span>Our AI will securely scan your uploaded payment slip to verify the transaction details mapped to this course.</span>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      Verify Payment
                    </button>
                  </div>
                </form>
              ) : (
                /* AI Steps 1-4: Processing Animation */
                <div className="py-8 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-300">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-100 flex items-center justify-center">
                      {aiStep === 4 ? (
                        <CheckCircle2 className="h-12 w-12 text-green-500 animate-in zoom-in duration-300" />
                      ) : (
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                      )}
                    </div>
                    {aiStep < 4 && (
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-bold text-gray-900 transition-all duration-300">
                      {aiStep === 1 && "Connecting to AI..."}
                      {aiStep === 2 && "Analyzing Document..."}
                      {aiStep === 3 && "Verifying Ledger..."}
                      {aiStep === 4 && "Payment Approved!"}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium">
                      {aiStep === 1 && "Establishing secure connection"}
                      {aiStep === 2 && "Extracting OCR data from receipt URL"}
                      {aiStep === 3 && "Matching transaction ID"}
                      {aiStep === 4 && "Generating access tokens..."}
                    </p>
                  </div>

                  {/* Progress Bar indicator */}
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
                      style={{ width: `${(aiStep / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
