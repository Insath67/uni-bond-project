export interface Classroom {
  id: string;
  techLeadId: string;
  techLeadName: string;
  title: string;
  description: string;
  maxStudents: number;
  currentStudents: number;
  rating: number;
  totalRatings: number;
  createdAt: string;
  enrolledStudents: string[]; // array of student IDs
}
