export type KuppyRequestStatus = "open" | "scheduled" | "completed";
export type KuppyOfferStatus = "open" | "selected" | "withdrawn";
export type KuppySessionStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface KuppyUserSummary {
  id: string;
  firstname: string;
  lastname: string;
  fullName: string;
  role: string;
}

export interface KuppyParticipant {
  userId: string;
  joinedAt: string;
  user: KuppyUserSummary;
}

export interface KuppyOffer {
  id: string;
  requestId: string;
  lecturerId: string;
  availabilityStart: string;
  availabilityEnd: string;
  description: string;
  status: KuppyOfferStatus;
  createdAt: string;
  lecturer: KuppyUserSummary;
}

export interface KuppyRequest {
  id: string;
  studentId: string;
  moduleName: string;
  description: string;
  requestedBefore: string;
  currentStudentCount: number;
  status: KuppyRequestStatus;
  selectedOfferId?: string;
  createdAt: string;
  updatedAt: string;
  student: KuppyUserSummary;
  votes: string[];
  voteCount: number;
  offers: KuppyOffer[];
}

export interface KuppySession {
  id: string;
  lecturerId: string;
  requestId?: string;
  title: string;
  moduleName: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  maxStudents: number;
  status: KuppySessionStatus;
  autoDeleteAt?: string;
  createdAt: string;
  lecturer: KuppyUserSummary;
  participants: KuppyParticipant[];
}
