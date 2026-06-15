import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  BriefcaseBusiness,
  GraduationCap,
  ShieldCheck,
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import SectionCard from "@/components/common/SectionCard";
import DiscoverUsersList from "@/components/user/DiscoverUsersList";
import { handleGetDiscoverUsers } from "@/controllers/userController";
import type { DiscoverUser } from "@/types/user";
import { useAuth } from "@/hooks/useAuthHook";
import { useProfessionalCommunication } from "@/contexts/ProfessionalCommunicationContext";

type ProfessionalBuckets = {
  mentors: DiscoverUser[];
  industry: DiscoverUser[];
};

const MIN_DESCRIPTION_LENGTH = 15;

export default function ProfessionalCommunication() {
  const { user } = useAuth();
  const {
    sessions,
    addSession,
    updateSession,
    deleteSession,
    registerStudent,
    isStudentRegistered,
    getAvailableSeats,
  } = useProfessionalCommunication();

  const [data, setData] = useState<ProfessionalBuckets>({
    mentors: [],
    industry: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [sessionForm, setSessionForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    link: "",
    seatCount: "30",
    tags: "",
  });

  const isTechLead = user?.role === "tech_lead" || user?.role === "admin";
  const isStudent = user?.role === "student";
  const studentId = user?.id || "";
  const studentName = `${user?.firstname ?? "Student"} ${user?.lastname ?? "User"}`;
  const studentEmail = user?.email ?? "";

  useEffect(() => {
    const loadProfessionals = async () => {
      try {
        setLoading(true);
        setError("");

        const [mentors, industry] = await Promise.all([
          handleGetDiscoverUsers(8, ["lecturer"]),
          handleGetDiscoverUsers(12, ["company", "tech_lead"]),
        ]);

        setData({ mentors, industry });
      } catch (err) {
        console.error("Failed to load professional communication data", err);
        setError("Professional contacts could not be loaded right now.");
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, []);

  const totalPeople = data.mentors.length + data.industry.length;

  const orderedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
      const bDate = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
      return aDate - bDate;
    });
  }, [sessions]);

  const showToast = (message: string) => {
    setSessionMessage(message);
    window.setTimeout(() => setSessionMessage(""), 3000);
  };

  const resetSessionForm = () => {
    setSessionForm({
      title: "",
      description: "",
      date: "",
      time: "",
      link: "",
      seatCount: "30",
      tags: "",
    });
    setEditingSessionId(null);
  };

  const handleStartEdit = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    setSessionForm({
      title: session.title,
      description: session.description,
      date: session.date,
      time: session.time,
      link: session.link,
      seatCount: String(session.seatCount),
      tags: session.tags.join(", "),
    });
    setEditingSessionId(session.id);
    setFormError("");
    setShowCreateForm(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Delete this session?")) return;
    const result = await deleteSession(sessionId);
    showToast(result.message);
  };

  const handleCreateSession = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (
      !sessionForm.title.trim() ||
      !sessionForm.description.trim() ||
      !sessionForm.date ||
      !sessionForm.time ||
      !sessionForm.link.trim()
    ) {
      setFormError("Please fill all required fields.");
      return;
    }

    if (sessionForm.title.trim().length < 5) {
      setFormError("Title must be at least 5 characters.");
      return;
    }

    if (sessionForm.description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setFormError(
        `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`,
      );
      return;
    }

    if (!/^https?:\/\//i.test(sessionForm.link.trim())) {
      setFormError("Zoom link must start with http:// or https://");
      return;
    }

    const seats = Number(sessionForm.seatCount);
    if (!Number.isFinite(seats) || seats < 1) {
      setFormError("Seat count must be at least 1.");
      return;
    }

    const payload = {
      title: sessionForm.title.trim(),
      description: sessionForm.description.trim(),
      date: sessionForm.date,
      time: sessionForm.time,
      link: sessionForm.link.trim(),
      seatCount: Math.floor(seats),
      tags: sessionForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      speaker: `${user?.firstname ?? "Tech"} ${user?.lastname ?? "Lead"}`,
      creatorId: user?.id || "",
    };

    const result = editingSessionId
      ? await updateSession(editingSessionId, payload)
      : await addSession(payload);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    resetSessionForm();
    setShowCreateForm(false);
    showToast(editingSessionId ? "Session updated." : "Session created.");
  };

  const handleRegister = async (sessionId: string) => {
    if (!studentId || !studentEmail) {
      showToast("Please login as a student to register.");
      return;
    }

    const result = await registerStudent(
      sessionId,
      studentId,
      studentName,
      studentEmail,
    );
    showToast(result.message);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3 backdrop-blur">
            <MessageSquare className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Professional Communication
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Connect with lecturers, companies, and technical leaders already on
            UniBond. Open a profile, follow relevant people, and build your
            professional network from one place.
          </p>
          {isTechLead && (
            <button
              type="button"
              onClick={() => {
                setShowCreateForm((prev) => {
                  const next = !prev;
                  if (!next) {
                    resetSessionForm();
                  }
                  return next;
                });
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
              {showCreateForm ? "Close Session Form" : "Create Session"}
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-2xl font-black">{totalPeople}</p>
            <p className="mt-1 text-sm text-slate-200">
              Professional profiles available
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-2xl font-black">{data.mentors.length}</p>
            <p className="mt-1 text-sm text-slate-200">Academic mentors</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-2xl font-black">{data.industry.length}</p>
            <p className="mt-1 text-sm text-slate-200">
              Industry professionals
            </p>
          </div>
        </div>
      </div>

      {sessionMessage && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {sessionMessage}
        </div>
      )}

      {isTechLead && showCreateForm && (
        <SectionCard
          title={editingSessionId ? "Edit Session" : "Create New Session"}
        >
          <form
            onSubmit={handleCreateSession}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={sessionForm.title}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                rows={3}
                value={sessionForm.description}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
              <p
                className={`mt-1 text-xs ${sessionForm.description.trim().length < MIN_DESCRIPTION_LENGTH ? "text-red-600" : "text-emerald-600"}`}
              >
                Minimum {MIN_DESCRIPTION_LENGTH} characters (
                {sessionForm.description.trim().length}/{MIN_DESCRIPTION_LENGTH}
                )
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                value={sessionForm.date}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Time
              </label>
              <input
                type="time"
                value={sessionForm.time}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Seat Count
              </label>
              <input
                type="number"
                min={1}
                value={sessionForm.seatCount}
                onChange={(e) =>
                  setSessionForm((prev) => ({
                    ...prev,
                    seatCount: e.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Zoom Link
              </label>
              <input
                type="url"
                value={sessionForm.link}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, link: e.target.value }))
                }
                placeholder="https://zoom.us/j/..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tags (optional, comma separated)
              </label>
              <input
                type="text"
                value={sessionForm.tags}
                onChange={(e) =>
                  setSessionForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            {formError && (
              <p className="md:col-span-2 text-sm font-medium text-red-600">
                {formError}
              </p>
            )}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {editingSessionId ? "Update Session" : "Publish Session"}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      <SectionCard title="Live Professional Sessions">
        {orderedSessions.length === 0 ? (
          <p className="text-sm text-slate-500">
            No sessions yet.{" "}
            {isTechLead
              ? "Use Create Session to add the first one."
              : "Please check back later."}
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orderedSessions.map((session) => {
              const availableSeats = getAvailableSeats(session.id);
              const registered = studentId
                ? isStudentRegistered(session.id, studentId)
                : false;
              const registeredCount = session.registeredCount;
              const canRegister =
                isStudent && !registered && availableSeats > 0;

              return (
                <article
                  key={session.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {session.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {session.description}
                  </p>

                  <div className="mt-4 grid gap-2 text-sm text-slate-700">
                    <p className="inline-flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" /> Seats:{" "}
                      {availableSeats} available / {session.seatCount} total
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />{" "}
                      {session.date}
                    </p>
                    <p className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" /> {session.time}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.tags.map((tag) => (
                      <span
                        key={`${session.id}-${tag}`}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    {isTechLead ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-slate-700">
                          Registered students: {registeredCount}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(session.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteSession(session.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                        <a
                          href={session.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800"
                        >
                          <Video className="h-4 w-4" />
                          Open Zoom Link
                        </a>
                      </div>
                    ) : registered ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-emerald-700">
                          You are registered for this session.
                        </p>
                        <a
                          href={session.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800"
                        >
                          <Video className="h-4 w-4" />
                          Join Zoom Session
                        </a>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-slate-600">
                          Zoom link is visible only after registration.
                        </p>
                        {isStudent ? (
                          <button
                            type="button"
                            onClick={() => handleRegister(session.id)}
                            disabled={!canRegister}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <Users className="h-4 w-4" />
                            {availableSeats > 0
                              ? "Register Session"
                              : "Session Full"}
                          </button>
                        ) : (
                          <p className="font-medium text-slate-600">
                            Only students can register sessions.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </SectionCard>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <SectionCard title="Industry Partners">
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <BriefcaseBusiness className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p>
                Explore company representatives and tech leads who can open
                doors to tasks, partnerships, internships, and professional
                guidance.
              </p>
            </div>
            <DiscoverUsersList
              users={data.industry}
              loading={loading}
              error={error}
            />
          </SectionCard>

          <SectionCard title="Academic Mentors">
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
              <p>
                Find lecturers you can follow for guidance, subject expertise,
                and stronger academic-professional connections.
              </p>
            </div>
            <DiscoverUsersList
              users={data.mentors}
              loading={loading}
              error={error}
            />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="How It Works">
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  1. Open a profile
                </p>
                <p className="mt-1">
                  Click any person card to see their UniBond profile and recent
                  activity.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  2. Follow professionals
                </p>
                <p className="mt-1">
                  Use the follow action on profile pages to stay updated with
                  people relevant to your goals.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  3. Build connections
                </p>
                <p className="mt-1">
                  Use tasks, posts, and profile interactions together to grow
                  real academic and industry links.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Available APIs">
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-slate-900">
                    Already connected
                  </p>
                  <p className="mt-1">
                    This screen now uses `/users/discover` with role filters,
                    plus existing profile and follow APIs.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">Backend status</p>
                <p className="mt-1">
                  A new dedicated backend module was not needed because the user
                  discovery and follow system already covered this feature
                  cleanly.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
