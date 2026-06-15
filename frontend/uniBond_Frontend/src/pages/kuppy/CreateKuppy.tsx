import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, GraduationCap } from "lucide-react";

import SectionCard from "@/components/common/SectionCard";
import { useAuth } from "@/hooks/useAuthHook";
import { handleCreateKuppySession } from "@/controllers/kuppyController";
import { validateKuppyForm } from "@/utils/validators";

type FieldErrors = Partial<Record<"title" | "moduleName" | "description" | "startDatetime" | "endDatetime" | "maxStudents", string>>;

export default function CreateKuppy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [startDatetime, setStartDatetime] = useState("");
  const [endDatetime, setEndDatetime] = useState("");
  const [maxStudents, setMaxStudents] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (!user || user.role !== "lecturer") {
    return (
      <SectionCard title="Access Denied">
        <p>Only lecturers can create Kuppy sessions.</p>
      </SectionCard>
    );
  }

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateKuppyForm(title, moduleName, description, startDatetime, endDatetime, maxStudents);
    setFieldErrors(validation.errors);

    if (!validation.isValid) {
      setError(validation.error ?? "Please correct the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await handleCreateKuppySession(
        title.trim(),
        moduleName.trim(),
        description.trim(),
        new Date(startDatetime).toISOString(),
        new Date(endDatetime).toISOString(),
        maxStudents
      );
      navigate("/kuppy");
    } catch (err: any) {
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Create Kuppy Session">
      <form onSubmit={handleSubmit} className="panel-surface space-y-4 max-w-2xl mx-auto p-5 rounded-[1.75rem]">
        <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-soft)] pb-4">
          <div className="p-3 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Host a Lecturer Kuppy</h2>
            <p className="text-sm text-[var(--text-secondary)]">Create a live session students can discover, join, and attend.</p>
          </div>
        </div>

        {error ? <div className="status-error"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label mb-1">Session title *</label>
            <input className={`field-shell ${fieldErrors.title ? "field-shell-error" : ""}`} value={title} onChange={(e) => {
              setTitle(e.target.value);
              clearFieldError("title");
            }} placeholder="Exam revision clinic" />
            {fieldErrors.title ? <p className="field-error mt-1">{fieldErrors.title}</p> : null}
          </div>

          <div>
            <label className="field-label mb-1">Module name *</label>
            <input className={`field-shell ${fieldErrors.moduleName ? "field-shell-error" : ""}`} value={moduleName} onChange={(e) => {
              setModuleName(e.target.value);
              clearFieldError("moduleName");
            }} placeholder="IT2040 Software Engineering" />
            {fieldErrors.moduleName ? <p className="field-error mt-1">{fieldErrors.moduleName}</p> : null}
          </div>
        </div>

        <div>
          <label className="field-label mb-1">Description *</label>
          <textarea className={`field-shell ${fieldErrors.description ? "field-shell-error" : ""}`} rows={4} value={description} onChange={(e) => {
            setDescription(e.target.value);
            clearFieldError("description");
          }} placeholder="Explain what students will cover in this session." />
          {fieldErrors.description ? <p className="field-error mt-1">{fieldErrors.description}</p> : <p className="field-hint mt-1">Add the lesson outcome, focus area, and anything students should prepare.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="field-label mb-1">Start time *</label>
            <input type="datetime-local" className={`field-shell ${fieldErrors.startDatetime ? "field-shell-error" : ""}`} value={startDatetime} onChange={(e) => {
              setStartDatetime(e.target.value);
              clearFieldError("startDatetime");
            }} />
            {fieldErrors.startDatetime ? <p className="field-error mt-1">{fieldErrors.startDatetime}</p> : null}
          </div>

          <div>
            <label className="field-label mb-1">End time *</label>
            <input type="datetime-local" className={`field-shell ${fieldErrors.endDatetime ? "field-shell-error" : ""}`} value={endDatetime} onChange={(e) => {
              setEndDatetime(e.target.value);
              clearFieldError("endDatetime");
            }} />
            {fieldErrors.endDatetime ? <p className="field-error mt-1">{fieldErrors.endDatetime}</p> : null}
          </div>

          <div>
            <label className="field-label mb-1">Max students *</label>
            <input type="number" min="1" max="500" className={`field-shell ${fieldErrors.maxStudents ? "field-shell-error" : ""}`} value={maxStudents} onChange={(e) => {
              setMaxStudents(Number(e.target.value) || 1);
              clearFieldError("maxStudents");
            }} />
            {fieldErrors.maxStudents ? <p className="field-error mt-1">{fieldErrors.maxStudents}</p> : null}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-4 py-2">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary px-5 py-2 disabled:opacity-50">
            {loading ? "Creating..." : "Publish Session"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
