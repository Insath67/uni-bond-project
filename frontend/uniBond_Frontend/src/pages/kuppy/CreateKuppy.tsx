import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CalendarClock, GraduationCap, Users } from "lucide-react";

import SectionCard from "@/components/common/SectionCard";
import { useAuth } from "@/hooks/useAuthHook";
import { handleCreateKuppySession } from "@/controllers/kuppyController";
import { validateKuppyForm } from "@/utils/validators";

type FieldErrors = Partial<
  Record<
    | "title"
    | "moduleName"
    | "description"
    | "startDatetime"
    | "endDatetime"
    | "maxStudents",
    string
  >
>;

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }

  return "Failed to create student support session";
};

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
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
          Only lecturers can create student support sessions.
        </div>
      </SectionCard>
    );
  }

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = validateKuppyForm(
      title,
      moduleName,
      description,
      startDatetime,
      endDatetime,
      maxStudents
    );

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
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard title="Create Student Support Session">
      <form
        onSubmit={handleSubmit}
        className="panel-surface mx-auto max-w-3xl space-y-5 rounded-[1.75rem] p-5 sm:p-6"
      >
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--surface)]/80 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-[var(--brand)]/15 p-3 text-[var(--brand)]">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">
                  Lecturer Support
                </p>
                <h2 className="mt-1 text-2xl font-black text-[var(--text-primary)]">
                  Host a Student Support Session
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Create a live academic support session that students can discover,
                  join, and attend.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/kuppy")}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-[var(--brand)] hover:text-[var(--accent)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        {error ? (
          <div className="status-error">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="field-label mb-1">Session Title *</label>
            <input
              className={`field-shell ${
                fieldErrors.title ? "field-shell-error" : ""
              }`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearFieldError("title");
              }}
              placeholder="Exam revision clinic"
            />
            {fieldErrors.title ? (
              <p className="field-error mt-1">{fieldErrors.title}</p>
            ) : null}
          </div>

          <div>
            <label className="field-label mb-1">Subject / Module Name *</label>
            <input
              className={`field-shell ${
                fieldErrors.moduleName ? "field-shell-error" : ""
              }`}
              value={moduleName}
              onChange={(e) => {
                setModuleName(e.target.value);
                clearFieldError("moduleName");
              }}
              placeholder="IT2040 Software Engineering"
            />
            {fieldErrors.moduleName ? (
              <p className="field-error mt-1">{fieldErrors.moduleName}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label className="field-label mb-1">Description *</label>
          <textarea
            className={`field-shell ${
              fieldErrors.description ? "field-shell-error" : ""
            }`}
            rows={5}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              clearFieldError("description");
            }}
            placeholder="Explain what students will cover in this support session."
          />
          {fieldErrors.description ? (
            <p className="field-error mt-1">{fieldErrors.description}</p>
          ) : (
            <p className="field-hint mt-1">
              Add the learning outcome, focus area, and anything students should
              prepare before joining.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="field-label mb-1">Start Time *</label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="datetime-local"
                className={`field-shell pl-10 ${
                  fieldErrors.startDatetime ? "field-shell-error" : ""
                }`}
                value={startDatetime}
                onChange={(e) => {
                  setStartDatetime(e.target.value);
                  clearFieldError("startDatetime");
                }}
              />
            </div>
            {fieldErrors.startDatetime ? (
              <p className="field-error mt-1">{fieldErrors.startDatetime}</p>
            ) : null}
          </div>

          <div>
            <label className="field-label mb-1">End Time *</label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="datetime-local"
                className={`field-shell pl-10 ${
                  fieldErrors.endDatetime ? "field-shell-error" : ""
                }`}
                value={endDatetime}
                onChange={(e) => {
                  setEndDatetime(e.target.value);
                  clearFieldError("endDatetime");
                }}
              />
            </div>
            {fieldErrors.endDatetime ? (
              <p className="field-error mt-1">{fieldErrors.endDatetime}</p>
            ) : null}
          </div>

          <div>
            <label className="field-label mb-1">Max Students *</label>
            <div className="relative">
              <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="number"
                min="1"
                max="500"
                className={`field-shell pl-10 ${
                  fieldErrors.maxStudents ? "field-shell-error" : ""
                }`}
                value={maxStudents}
                onChange={(e) => {
                  setMaxStudents(Number(e.target.value) || 1);
                  clearFieldError("maxStudents");
                }}
              />
            </div>
            {fieldErrors.maxStudents ? (
              <p className="field-error mt-1">{fieldErrors.maxStudents}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand)]/10 p-4">
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Once published, students will be able to view this session and join if
            seats are available.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary px-4 py-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-5 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Publish Support Session"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}