import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import apiClient from "@/services/api/axiosClient";
import { useAuth } from "@/hooks/useAuthHook";

export type Session = {
  id: string;
  title: string;
  speaker: string;
  date: string;
  time: string;
  description: string;
  link: string;
  tags: string[];
  seatCount: number;
  availableSeats: number;
  registeredCount: number;
  isRegistered: boolean;
  creatorId: string;
};

export type Attendee = {
  sessionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
};

type ProfessionalCommunicationContextType = {
  sessions: Session[];
  attendees: Attendee[];
  addSession: (
    session: Omit<
      Session,
      "id" | "availableSeats" | "registeredCount" | "isRegistered"
    >,
  ) => Promise<{ ok: boolean; message: string }>;
  updateSession: (
    id: string,
    updatedSession: Omit<
      Session,
      "id" | "availableSeats" | "registeredCount" | "isRegistered"
    >,
  ) => Promise<{ ok: boolean; message: string }>;
  deleteSession: (id: string) => Promise<{ ok: boolean; message: string }>;
  registerStudent: (
    sessionId: string,
    studentId: string,
    studentName: string,
    studentEmail: string,
  ) => Promise<{ ok: boolean; message: string }>;
  getAttendeesForSession: (sessionId: string) => Attendee[];
  isStudentRegistered: (sessionId: string, studentId: string) => boolean;
  getAvailableSeats: (sessionId: string) => number;
  refreshSessions: () => Promise<void>;
};

const ProfessionalCommunicationContext = createContext<
  ProfessionalCommunicationContextType | undefined
>(undefined);

type ApiSession = {
  id: number;
  title: string;
  speaker: string;
  description: string;
  session_date: string;
  session_time: string;
  zoom_link?: string | null;
  seat_count: number;
  available_seats: number;
  registered_count: number;
  tags: string[];
  creator_id: string;
  is_registered: boolean;
};

const toSession = (item: ApiSession): Session => ({
  id: String(item.id),
  title: item.title,
  speaker: item.speaker,
  date: item.session_date,
  time: item.session_time,
  description: item.description,
  link: item.zoom_link ?? "",
  tags: item.tags ?? [],
  seatCount: item.seat_count,
  availableSeats: item.available_seats,
  registeredCount: item.registered_count,
  isRegistered: item.is_registered,
  creatorId: item.creator_id,
});

const getApiErrorMessage = (error: any, fallback: string): string => {
  const response = error?.response;
  const data = response?.data;
  const detail = data?.detail;

  if (!response) {
    return "Cannot reach backend server. Please ensure backend is running on http://localhost:8000.";
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const joined = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const loc = Array.isArray((item as { loc?: unknown }).loc)
            ? String(
                (item as { loc: unknown[] }).loc[
                  (item as { loc: unknown[] }).loc.length - 1
                ],
              )
            : "";
          const msg = String((item as { msg: unknown }).msg);
          return loc ? `${loc}: ${msg}` : msg;
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");

    return joined || fallback;
  }

  if (detail && typeof detail === "object" && "msg" in detail) {
    return String((detail as { msg: unknown }).msg);
  }

  if (response?.status) {
    return `Request failed (${response.status}). Please try again.`;
  }

  return fallback;
};

export function ProfessionalCommunicationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const refreshSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      return;
    }

    try {
      const response = await apiClient.get<ApiSession[]>(
        "/professional-sessions",
      );
      setSessions(response.data.map(toSession));
    } catch (error) {
      console.error("Failed to load professional sessions", error);
      setSessions([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setAttendees([]);
      return;
    }

    void refreshSessions();
  }, [refreshSessions, user]);

  const addSession = async (
    sessionData: Omit<
      Session,
      "id" | "availableSeats" | "registeredCount" | "isRegistered"
    >,
  ) => {
    try {
      await apiClient.post("/professional-sessions", {
        title: sessionData.title,
        description: sessionData.description,
        session_date: sessionData.date,
        session_time: sessionData.time,
        zoom_link: sessionData.link,
        seat_count: sessionData.seatCount,
        tags: sessionData.tags,
      });
      await refreshSessions();
      return { ok: true, message: "Session created." };
    } catch (error: any) {
      return {
        ok: false,
        message: getApiErrorMessage(error, "Failed to create session."),
      };
    }
  };

  const updateSession = async (
    id: string,
    updatedSession: Omit<
      Session,
      "id" | "availableSeats" | "registeredCount" | "isRegistered"
    >,
  ) => {
    try {
      await apiClient.put(`/professional-sessions/${id}`, {
        title: updatedSession.title,
        description: updatedSession.description,
        session_date: updatedSession.date,
        session_time: updatedSession.time,
        zoom_link: updatedSession.link,
        seat_count: updatedSession.seatCount,
        tags: updatedSession.tags,
      });
      await refreshSessions();
      return { ok: true, message: "Session updated." };
    } catch (error: any) {
      return {
        ok: false,
        message: getApiErrorMessage(error, "Failed to update session."),
      };
    }
  };

  const deleteSession = async (id: string) => {
    try {
      await apiClient.delete(`/professional-sessions/${id}`);
      await refreshSessions();
      setAttendees((prev) => prev.filter((a) => a.sessionId !== id));
      return { ok: true, message: "Session deleted." };
    } catch (error: any) {
      return {
        ok: false,
        message: getApiErrorMessage(error, "Failed to delete session."),
      };
    }
  };

  const registerStudent = async (
    sessionId: string,
    _studentId: string,
    _studentName: string,
    _studentEmail: string,
  ) => {
    try {
      await apiClient.post(`/professional-sessions/${sessionId}/register`);
      await refreshSessions();
      return { ok: true, message: "Registered successfully." };
    } catch (error: any) {
      return {
        ok: false,
        message: getApiErrorMessage(error, "Failed to register for session."),
      };
    }
  };

  const getAttendeesForSession = (sessionId: string) => {
    return attendees.filter((a) => a.sessionId === sessionId);
  };

  const isStudentRegistered = (sessionId: string, studentId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return false;
    if (session.isRegistered) return true;
    return attendees.some(
      (a) => a.sessionId === sessionId && a.studentId === studentId,
    );
  };

  const getAvailableSeats = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return 0;
    return session.availableSeats;
  };

  return (
    <ProfessionalCommunicationContext.Provider
      value={{
        sessions,
        attendees,
        addSession,
        updateSession,
        deleteSession,
        registerStudent,
        getAttendeesForSession,
        isStudentRegistered,
        getAvailableSeats,
        refreshSessions,
      }}
    >
      {children}
    </ProfessionalCommunicationContext.Provider>
  );
}

export function useProfessionalCommunication() {
  const context = useContext(ProfessionalCommunicationContext);
  if (context === undefined) {
    throw new Error(
      "useProfessionalCommunication must be used within a ProfessionalCommunicationProvider",
    );
  }
  return context;
}
