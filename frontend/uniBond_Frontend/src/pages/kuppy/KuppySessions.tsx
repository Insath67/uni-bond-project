import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  MessageSquareText,
  Radio,
  ThumbsUp,
  TimerReset,
  UserCheck,
  Users,
} from "lucide-react";

import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import { useAuth } from "@/hooks/useAuthHook";
import {
  handleConfirmKuppyOffer,
  handleCreateKuppyOffer,
  handleCreateKuppyRequest,
  handleGetKuppyRequests,
  handleGetKuppySessions,
  handleJoinKuppySession,
  handleLeaveKuppySession,
  handleRemoveKuppyVote,
  handleVoteKuppyRequest,
} from "@/controllers/kuppyController";
import type { KuppyRequest, KuppySession } from "@/types/kuppy";
import { validateKuppyOfferForm, validateKuppyRequestForm } from "@/utils/validators";

type RequestFieldErrors = Partial<Record<"moduleName" | "description" | "requestedBefore" | "currentStudentCount", string>>;
type OfferFieldErrors = Partial<Record<"availabilityStart" | "availabilityEnd" | "description", string>>;

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const statusClassNames: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  selected: "bg-blue-100 text-blue-700",
  scheduled: "bg-blue-100 text-blue-700",
  live: "bg-orange-100 text-orange-700",
  completed: "bg-slate-200 text-slate-700",
  withdrawn: "bg-slate-200 text-slate-600",
  cancelled: "bg-rose-100 text-rose-700",
};

const getStatusClasses = (status: string) => statusClassNames[status] || "bg-slate-200 text-slate-700";

export default function KuppySessions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<KuppySession[]>([]);
  const [requests, setRequests] = useState<KuppyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerError, setBannerError] = useState("");
  const [bannerSuccess, setBannerSuccess] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [moduleName, setModuleName] = useState("");
  const [description, setDescription] = useState("");
  const [requestedBefore, setRequestedBefore] = useState("");
  const [currentStudentCount, setCurrentStudentCount] = useState(1);
  const [requestFieldErrors, setRequestFieldErrors] = useState<RequestFieldErrors>({});

  const [offerForms, setOfferForms] = useState<Record<string, { availabilityStart: string; availabilityEnd: string; description: string }>>({});
  const [offerFieldErrors, setOfferFieldErrors] = useState<Record<string, OfferFieldErrors>>({});

  const loadData = async () => {
    setLoading(true);
    setBannerError("");

    try {
      const [sessionData, requestData] = await Promise.all([handleGetKuppySessions(), handleGetKuppyRequests()]);
      setSessions(sessionData);
      setRequests(requestData);
    } catch (err: any) {
      setBannerError(err.message || "Failed to load Kuppy data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (key: string, action: () => Promise<void>, successMessage: string) => {
    try {
      setBusyKey(key);
      setBannerError("");
      setBannerSuccess("");
      await action();
      setBannerSuccess(successMessage);
      await loadData();
    } catch (err: any) {
      setBannerError(err.message || "The Kuppy action could not be completed.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateKuppyRequestForm(moduleName, description, requestedBefore, currentStudentCount);
    setRequestFieldErrors(validation.errors);

    if (!validation.isValid) {
      setBannerError(validation.error ?? "Please correct the request form.");
      return;
    }

    await runAction(
      "create-request",
      async () => {
        await handleCreateKuppyRequest(
          moduleName.trim(),
          description.trim(),
          new Date(requestedBefore).toISOString(),
          currentStudentCount
        );
        setModuleName("");
        setDescription("");
        setRequestedBefore("");
        setCurrentStudentCount(1);
        setRequestFieldErrors({});
      },
      "Kuppy request created successfully."
    );
  };

  const handleVoteToggle = async (request: KuppyRequest) => {
    if (!user) return;
    const hasVoted = request.votes.includes(user.id);

    await runAction(
      `vote-${request.id}`,
      async () => {
        if (hasVoted) {
          await handleRemoveKuppyVote(request.id);
        } else {
          await handleVoteKuppyRequest(request.id);
        }
      },
      hasVoted ? "Your vote was removed." : "Your vote was added."
    );
  };

  const handleOfferSubmit = async (requestId: string, e: React.FormEvent) => {
    e.preventDefault();
    const form = offerForms[requestId] || { availabilityStart: "", availabilityEnd: "", description: "" };
    const validation = validateKuppyOfferForm(form.availabilityStart, form.availabilityEnd, form.description);
    setOfferFieldErrors((current) => ({ ...current, [requestId]: validation.errors }));

    if (!validation.isValid) {
      setBannerError(validation.error ?? "Please correct the lecturer offer form.");
      return;
    }

    await runAction(
      `offer-${requestId}`,
      async () => {
        await handleCreateKuppyOffer(
          requestId,
          new Date(form.availabilityStart).toISOString(),
          new Date(form.availabilityEnd).toISOString(),
          form.description.trim()
        );
        setOfferForms((current) => ({
          ...current,
          [requestId]: { availabilityStart: "", availabilityEnd: "", description: "" },
        }));
        setOfferFieldErrors((current) => ({ ...current, [requestId]: {} }));
      },
      "Lecturer availability was added."
    );
  };

  const updateOfferForm = (requestId: string, field: "availabilityStart" | "availabilityEnd" | "description", value: string) => {
    setOfferForms((current) => ({
      ...current,
      [requestId]: {
        availabilityStart: current[requestId]?.availabilityStart || "",
        availabilityEnd: current[requestId]?.availabilityEnd || "",
        description: current[requestId]?.description || "",
        [field]: value,
      },
    }));
    setOfferFieldErrors((current) => ({
      ...current,
      [requestId]: { ...current[requestId], [field]: undefined },
    }));
    setBannerError("");
  };

  const handleConfirmOffer = async (requestId: string, offerId: string) => {
    await runAction(
      `confirm-${offerId}`,
      async () => {
        await handleConfirmKuppyOffer(requestId, offerId);
      },
      "Kuppy offer confirmed and session scheduled."
    );
  };

  const handleJoinLeave = async (session: KuppySession, isJoined: boolean) => {
    await runAction(
      `${isJoined ? "leave" : "join"}-${session.id}`,
      async () => {
        if (isJoined) {
          await handleLeaveKuppySession(session.id);
        } else {
          await handleJoinKuppySession(session.id);
        }
      },
      isJoined ? "You left the Kuppy session." : "You joined the Kuppy session."
    );
  };

  const isLecturer = user?.role === "lecturer";
  const isStudent = user?.role === "student";
  const openRequestsCount = requests.filter((request) => request.status === "open").length;
  const upcomingSessionsCount = sessions.filter((session) => session.status === "scheduled").length;
  const liveSessionsCount = sessions.filter((session) => session.status === "live").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[var(--accent)]" />
            Peer Kuppy Sessions
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Students can request support and vote demand. Lecturers can publish sessions or answer requests with availability.
          </p>
        </div>

        {isLecturer ? (
          <button onClick={() => navigate("/kuppy/create")} className="btn-primary px-5 py-3 rounded-2xl shadow-sm">
            + Host a Lecturer Kuppy
          </button>
        ) : null}
      </div>

      <div
        className="overflow-hidden rounded-[2rem] border p-6 shadow-sm lg:p-7"
        style={{
          borderColor: "color-mix(in srgb, var(--accent) 16%, var(--border-soft))",
          background: `
            radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--brand-soft) 88%, transparent) 0%, transparent 34%),
            radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--accent-soft) 92%, transparent) 0%, transparent 30%),
            linear-gradient(135deg, color-mix(in srgb, var(--surface-elevated) 92%, transparent) 0%, color-mix(in srgb, var(--surface) 96%, transparent) 100%)
          `,
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)] xl:items-center">
          <div className="relative">
            <div
              className="pointer-events-none absolute -left-10 top-0 h-28 w-28 rounded-full blur-3xl"
              style={{ background: "color-mix(in srgb, var(--accent-soft) 85%, transparent)" }}
            />
            <div className="relative space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent) 18%, var(--border-soft))",
                  background: "color-mix(in srgb, var(--accent-soft) 58%, var(--surface-elevated))",
                  color: "var(--accent)",
                }}
              >
                <Layers3 className="h-3.5 w-3.5" />
                Kuppy Workflow
              </div>

              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl font-bold leading-tight text-[var(--text-primary)] lg:text-[2.7rem]">
                  Request support, match the right lecturer, and run smoother Kuppy sessions.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-[var(--text-secondary)] lg:text-lg">
                  Students can raise demand early, lecturers can answer with real availability, and confirmed sessions stay easy to track until they start and finish.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{
                    borderColor: "color-mix(in srgb, var(--brand) 16%, var(--border-soft))",
                    background: "color-mix(in srgb, var(--brand-soft) 52%, var(--surface-elevated))",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">For students</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">Request sessions, vote demand, confirm offers</p>
                </div>
                <div
                  className="rounded-2xl border px-4 py-3"
                  style={{
                    borderColor: "color-mix(in srgb, var(--accent) 16%, var(--border-soft))",
                    background: "color-mix(in srgb, var(--accent-soft) 52%, var(--surface-elevated))",
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">For lecturers</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">Publish direct sessions or answer student requests</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {[
              {
                label: "Open Requests",
                value: openRequestsCount,
                hint: openRequestsCount === 1 ? "needs lecturer attention" : "need lecturer attention",
                icon: MessageSquareText,
                accentColor: "var(--brand)",
                accentSoft: "var(--brand-soft)",
              },
              {
                label: "Upcoming",
                value: upcomingSessionsCount,
                hint: upcomingSessionsCount === 1 ? "session scheduled" : "sessions scheduled",
                icon: TimerReset,
                accentColor: "var(--accent)",
                accentSoft: "var(--accent-soft)",
              },
              {
                label: "Live",
                value: liveSessionsCount,
                hint: liveSessionsCount === 1 ? "session happening now" : "sessions happening now",
                icon: Radio,
                accentColor: "var(--success)",
                accentSoft: "var(--success-soft)",
              },
            ].map(({ label, value, hint, icon: Icon, accentColor, accentSoft }) => (
              <div
                key={label}
                className="group rounded-[1.6rem] border p-4 transition-transform duration-200 hover:-translate-y-0.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--border-soft) 88%, transparent)",
                  background: "color-mix(in srgb, var(--surface-elevated) 88%, transparent)",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--text-muted)]">Kuppy status</p>
                  </div>
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                    style={{
                      color: accentColor,
                      borderColor: `color-mix(in srgb, ${accentColor} 18%, var(--border-soft))`,
                      background: `color-mix(in srgb, ${accentSoft} 78%, var(--surface-elevated))`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-4xl font-bold leading-none text-[var(--text-primary)]">{value}</p>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      color: accentColor,
                      background: `color-mix(in srgb, ${accentSoft} 88%, transparent)`,
                    }}
                  >
                    {hint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bannerError ? (
        <div className="status-error">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {bannerError}
        </div>
      ) : null}

      {bannerSuccess ? (
        <div className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          {bannerSuccess}
        </div>
      ) : null}

      {loading ? (
        <SectionCard title="Kuppy Sessions">
          <div className="py-14 text-center text-[var(--text-secondary)]">Loading Kuppy data...</div>
        </SectionCard>
      ) : (
        <>
          {isStudent ? (
            <SectionCard title="Request a Kuppy">
              <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="field-label mb-1">Module name *</label>
                  <input className={`field-shell ${requestFieldErrors.moduleName ? "field-shell-error" : ""}`} value={moduleName} onChange={(e) => {
                    setModuleName(e.target.value);
                    setRequestFieldErrors((current) => ({ ...current, moduleName: undefined }));
                    setBannerError("");
                  }} placeholder="IT2040 Software Engineering" />
                  {requestFieldErrors.moduleName ? <p className="field-error mt-1">{requestFieldErrors.moduleName}</p> : null}
                </div>

                <div>
                  <label className="field-label mb-1">Need before *</label>
                  <input type="datetime-local" className={`field-shell ${requestFieldErrors.requestedBefore ? "field-shell-error" : ""}`} value={requestedBefore} onChange={(e) => {
                    setRequestedBefore(e.target.value);
                    setRequestFieldErrors((current) => ({ ...current, requestedBefore: undefined }));
                    setBannerError("");
                  }} />
                  {requestFieldErrors.requestedBefore ? <p className="field-error mt-1">{requestFieldErrors.requestedBefore}</p> : null}
                </div>

                <div className="lg:col-span-2">
                  <label className="field-label mb-1">Description *</label>
                  <textarea className={`field-shell ${requestFieldErrors.description ? "field-shell-error" : ""}`} rows={4} value={description} onChange={(e) => {
                    setDescription(e.target.value);
                    setRequestFieldErrors((current) => ({ ...current, description: undefined }));
                    setBannerError("");
                  }} placeholder="Explain which lesson, topic, or assessment needs support and what kind of help students expect." />
                  {requestFieldErrors.description ? <p className="field-error mt-1">{requestFieldErrors.description}</p> : <p className="field-hint mt-1">Add enough detail so lecturers can decide whether they can cover the topic well.</p>}
                </div>

                <div>
                  <label className="field-label mb-1">Current student count *</label>
                  <input type="number" min="1" max="500" className={`field-shell ${requestFieldErrors.currentStudentCount ? "field-shell-error" : ""}`} value={currentStudentCount} onChange={(e) => {
                    setCurrentStudentCount(Number(e.target.value) || 1);
                    setRequestFieldErrors((current) => ({ ...current, currentStudentCount: undefined }));
                    setBannerError("");
                  }} />
                  {requestFieldErrors.currentStudentCount ? <p className="field-error mt-1">{requestFieldErrors.currentStudentCount}</p> : null}
                </div>

                <div className="flex items-end justify-end">
                  <button type="submit" disabled={busyKey === "create-request"} className="btn-primary px-5 py-3 rounded-2xl disabled:opacity-60">
                    {busyKey === "create-request" ? "Submitting..." : "Create Request"}
                  </button>
                </div>
              </form>
            </SectionCard>
          ) : null}

          <SectionCard title="Live and Upcoming Sessions">
            {sessions.length === 0 ? (
              <EmptyState icon={GraduationCap} title="No Kuppy sessions yet" description="Confirmed or lecturer-hosted Kuppy sessions will appear here." />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sessions.map((session) => {
                  const isJoined = Boolean(user && session.participants.some((participant) => participant.userId === user.id));
                  const isOwnerLecturer = user?.id === session.lecturerId;
                  const canJoin = isStudent && session.status === "scheduled" && !isJoined && session.participants.length < session.maxStudents;
                  const canLeave = isStudent && session.status === "scheduled" && isJoined;

                  return (
                    <div key={session.id} className="rounded-[1.6rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{session.moduleName}</p>
                          <h3 className="mt-1 text-xl font-bold text-[var(--text-primary)]">{session.title}</h3>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(session.status)}`}>{session.status}</span>
                      </div>

                      <p className="mt-3 text-sm text-[var(--text-secondary)]">{session.description}</p>

                      <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                          {formatDateTime(session.scheduledStart)} to {formatDateTime(session.scheduledEnd)}
                        </div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-[var(--text-muted)]" />
                          Lecturer: <span className="font-semibold text-[var(--text-primary)]">{session.lecturer.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[var(--text-muted)]" />
                          {session.participants.length} / {session.maxStudents} students confirmed
                        </div>
                      </div>

                      {session.participants.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {session.participants.slice(0, 6).map((participant) => (
                            <span key={participant.userId} className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                              {participant.user.fullName}
                            </span>
                          ))}
                          {session.participants.length > 6 ? (
                            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                              +{session.participants.length - 6} more
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--border-soft)] pt-4">
                        {isOwnerLecturer ? (
                          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">You are hosting this session</span>
                        ) : null}
                        {canJoin ? (
                          <button onClick={() => handleJoinLeave(session, false)} disabled={busyKey === `join-${session.id}`} className="btn-primary px-4 py-2 rounded-xl disabled:opacity-60">
                            {busyKey === `join-${session.id}` ? "Joining..." : "Join Session"}
                          </button>
                        ) : null}
                        {canLeave ? (
                          <button onClick={() => handleJoinLeave(session, true)} disabled={busyKey === `leave-${session.id}`} className="btn-secondary px-4 py-2 rounded-xl disabled:opacity-60">
                            {busyKey === `leave-${session.id}` ? "Leaving..." : "Leave Before Start"}
                          </button>
                        ) : null}
                        {isStudent && !canJoin && !canLeave ? (
                          <span className="text-sm text-[var(--text-secondary)]">
                            {session.status === "live"
                              ? "Session already started."
                              : session.status === "completed"
                                ? "Session completed."
                                : session.participants.length >= session.maxStudents
                                  ? "Session is full."
                                  : "You are not eligible to join this session."}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title={isLecturer ? "Student Requests Inbox" : "Student Request Board"}>
            {requests.length === 0 ? (
              <EmptyState icon={MessageSquareText} title="No Kuppy requests yet" description="Student requests and lecturer availability offers will show up here." />
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const hasVoted = Boolean(user && request.votes.includes(user.id));
                  const selectedOffer = request.offers.find((offer) => offer.id === request.selectedOfferId);
                  const canConfirmOffer = isStudent && user?.id === request.studentId && request.status === "open";
                  const offerForm = offerForms[request.id] || { availabilityStart: "", availabilityEnd: "", description: "" };
                  const currentOfferErrors = offerFieldErrors[request.id] || {};

                  return (
                    <div key={request.id} className="rounded-[1.6rem] border border-[var(--border-soft)] bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                              {request.moduleName}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(request.status)}`}>{request.status}</span>
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{request.voteCount} votes</span>
                          </div>

                          <div>
                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{request.student.fullName}'s Kuppy request</h3>
                            <p className="mt-2 text-sm text-[var(--text-secondary)]">{request.description}</p>
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                            <span className="flex items-center gap-2">
                              <Clock3 className="w-4 h-4 text-[var(--text-muted)]" />
                              Need before {formatDateTime(request.requestedBefore)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[var(--text-muted)]" />
                              {request.currentStudentCount} students interested
                            </span>
                          </div>
                        </div>

                        {isStudent ? (
                          <button
                            onClick={() => handleVoteToggle(request)}
                            disabled={busyKey === `vote-${request.id}`}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 ${hasVoted ? "bg-indigo-100 text-indigo-700" : "bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--accent-soft)]"}`}
                          >
                            <span className="inline-flex items-center gap-2">
                              <ThumbsUp className="w-4 h-4" />
                              {busyKey === `vote-${request.id}` ? "Saving..." : hasVoted ? "Voted" : "Vote"}
                            </span>
                          </button>
                        ) : null}
                      </div>

                      {selectedOffer ? (
                        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                          <p className="text-sm font-semibold text-blue-800">Confirmed lecturer offer</p>
                          <p className="mt-1 text-sm text-blue-700">{selectedOffer.lecturer.fullName} will hold this Kuppy from {formatDateTime(selectedOffer.availabilityStart)} to {formatDateTime(selectedOffer.availabilityEnd)}.</p>
                        </div>
                      ) : null}

                      {request.offers.length > 0 ? (
                        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {request.offers.map((offer) => (
                            <div key={offer.id} className="rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-muted)] p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--text-primary)]">{offer.lecturer.fullName}</p>
                                  <p className="text-xs text-[var(--text-secondary)] capitalize">{offer.lecturer.role.replace("_", " ")}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize ${getStatusClasses(offer.status)}`}>{offer.status}</span>
                              </div>

                              <p className="mt-3 text-sm text-[var(--text-secondary)]">{offer.description}</p>
                              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                                Available from {formatDateTime(offer.availabilityStart)} to {formatDateTime(offer.availabilityEnd)}
                              </p>

                              {canConfirmOffer && offer.status === "open" ? (
                                <button onClick={() => handleConfirmOffer(request.id, offer.id)} disabled={busyKey === `confirm-${offer.id}`} className="mt-4 btn-primary px-4 py-2 rounded-xl disabled:opacity-60">
                                  {busyKey === `confirm-${offer.id}` ? "Confirming..." : "Confirm This Lecturer"}
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-soft)] px-4 py-5 text-sm text-[var(--text-secondary)]">
                          No lecturer availability has been added for this request yet.
                        </div>
                      )}

                      {isLecturer && request.status === "open" ? (
                        <form onSubmit={(e) => handleOfferSubmit(request.id, e)} className="mt-5 border-t border-[var(--border-soft)] pt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="field-label mb-1">Availability start *</label>
                            <input type="datetime-local" className={`field-shell ${currentOfferErrors.availabilityStart ? "field-shell-error" : ""}`} value={offerForm.availabilityStart} onChange={(e) => updateOfferForm(request.id, "availabilityStart", e.target.value)} />
                            {currentOfferErrors.availabilityStart ? <p className="field-error mt-1">{currentOfferErrors.availabilityStart}</p> : null}
                          </div>

                          <div>
                            <label className="field-label mb-1">Availability end *</label>
                            <input type="datetime-local" className={`field-shell ${currentOfferErrors.availabilityEnd ? "field-shell-error" : ""}`} value={offerForm.availabilityEnd} onChange={(e) => updateOfferForm(request.id, "availabilityEnd", e.target.value)} />
                            {currentOfferErrors.availabilityEnd ? <p className="field-error mt-1">{currentOfferErrors.availabilityEnd}</p> : null}
                          </div>

                          <div>
                            <label className="field-label mb-1">Short description *</label>
                            <textarea className={`field-shell ${currentOfferErrors.description ? "field-shell-error" : ""}`} rows={3} value={offerForm.description} onChange={(e) => updateOfferForm(request.id, "description", e.target.value)} placeholder="Explain what you will cover in this slot." />
                            {currentOfferErrors.description ? <p className="field-error mt-1">{currentOfferErrors.description}</p> : null}
                          </div>

                          <div className="lg:col-span-3 flex justify-end">
                            <button type="submit" disabled={busyKey === `offer-${request.id}`} className="btn-primary px-4 py-2 rounded-xl disabled:opacity-60">
                              {busyKey === `offer-${request.id}` ? "Submitting..." : "Offer Availability"}
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
