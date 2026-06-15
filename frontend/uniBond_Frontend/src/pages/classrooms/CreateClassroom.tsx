import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleCreateClassroom } from "@/controllers/classroomController";
import SectionCard from "@/components/common/SectionCard";
import { Users, AlertCircle } from "lucide-react";
import { validateClassroomForm } from "@/utils/validators";

export default function CreateClassroom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxStudents, setMaxStudents] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string; maxStudents?: string }>({});

  if (!user || user.role !== "tech_lead") {
    return (
      <SectionCard title="Access Denied">
        <p>Only Tech Leads can create classrooms.</p>
      </SectionCard>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateClassroomForm(title, description, maxStudents);
    setFieldErrors(validation.errors);
    if (!validation.isValid) {
      setError(validation.error ?? "Please correct the highlighted fields.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      await handleCreateClassroom(user.id, `${user.firstname} ${user.lastname}`, title, description, maxStudents);
      navigate("/classrooms");
    } catch (err: any) {
      setError(err.message || "Failed to create classroom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Create Classroom">
      <form onSubmit={handleSubmit} className="panel-surface space-y-4 max-w-lg mx-auto p-5 rounded-[1.75rem]">
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-soft)] pb-4">
          <div className="p-3 bg-[var(--brand-soft)] text-[var(--brand)] rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">New Classroom</h2>
            <p className="text-sm text-[var(--text-secondary)]">Create a polished learning space with clear expectations for students.</p>
          </div>
        </div>

        {error && <div className="status-error"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}

        <div>
           <label className="field-label mb-1">Title</label>
           <input className={`field-shell ${fieldErrors.title ? "field-shell-error" : ""}`} value={title} onChange={(e) => {
            setTitle(e.target.value);
            setFieldErrors((current) => ({ ...current, title: undefined }));
            setError("");
           }} placeholder="e.g. Advanced System Design" />
           {fieldErrors.title ? <p className="field-error mt-1">{fieldErrors.title}</p> : null}
        </div>
        
        <div>
          <label className="field-label mb-1">Description</label>
          <textarea 
            className={`field-shell ${fieldErrors.description ? "field-shell-error" : ""}`}
            rows={4}
            value={description} 
            onChange={(e) => {
              setDescription(e.target.value);
              setFieldErrors((current) => ({ ...current, description: undefined }));
              setError("");
            }}
            placeholder="Detailed course description..." 
          />
          {fieldErrors.description ? <p className="field-error mt-1">{fieldErrors.description}</p> : <p className="field-hint mt-1">Describe the topic, learning outcome, and who should join.</p>}
        </div>

        <div>
           <label className="field-label mb-1">Maximum Students</label>
           <input type="number" min="1" max="500" className={`field-shell ${fieldErrors.maxStudents ? "field-shell-error" : ""}`} value={maxStudents} onChange={(e) => {
            setMaxStudents(parseInt(e.target.value, 10));
            setFieldErrors((current) => ({ ...current, maxStudents: undefined }));
            setError("");
           }} />
           {fieldErrors.maxStudents ? <p className="field-error mt-1">{fieldErrors.maxStudents}</p> : null}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-4 py-2">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2 disabled:opacity-50">
            {loading ? "Creating..." : "Create Classroom"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
