import type { Role } from "@/types/user";
import type { TaskFormData } from "@/components/tasks/TaskForm";
import type { UserProfileUpdatePayload } from "@/types/user";

export type ValidationResult<T extends string = string> = {
  isValid: boolean;
  error?: string;
  errors: Partial<Record<T, string>>;
};

type RegisterFormValues = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^0\d{9}$/;
const LETTERS_AND_SPACES_REGEX = /^[A-Za-z\s'-]+$/;

const createResult = <T extends string>(errors: Partial<Record<T, string>>): ValidationResult<T> => {
  const firstError = Object.values(errors).find((value): value is string => typeof value === "string" && value.length > 0);

  return {
    isValid: !firstError,
    error: firstError,
    errors,
  };
};

export const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email.trim());

export const validateMobile = (mobile: string): boolean => MOBILE_REGEX.test(mobile.trim());

export const validateName = (value: string): boolean => LETTERS_AND_SPACES_REGEX.test(value.trim());

export const validateSearch = (query: string): { isValid: boolean; error?: string } => {
  const trimmed = query.trim();
  if (!trimmed) {
    return { isValid: false, error: "Search query is required" };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Search query must be at least 2 characters" };
  }
  return { isValid: true };
};

export const validatePost = (
  content: string,
  mediaUrl?: string,
  mediaType?: "image" | "video"
): { isValid: boolean; error?: string } => {
  const trimmedContent = content.trim();
  if (!trimmedContent && !mediaUrl) {
    return { isValid: false, error: "Post must have content or media" };
  }
  if (trimmedContent.length > 1000) {
    return { isValid: false, error: "Content must be less than 1000 characters" };
  }
  if (mediaUrl && !mediaType) {
    return { isValid: false, error: "Media type is required if media URL is provided" };
  }
  if (mediaType && !["image", "video"].includes(mediaType)) {
    return { isValid: false, error: "Invalid media type" };
  }
  return { isValid: true };
};

export const validateLogin = (
  email: string,
  password: string
): ValidationResult<"email" | "password"> => {
  const errors: Partial<Record<"email" | "password", string>> = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password.trim()) {
    errors.password = "Password is required.";
  } else if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  return createResult(errors);
};

export const validateForgotPassword = (
  email: string,
  mobile: string,
  newPassword: string,
  confirmPassword: string
): ValidationResult<"email" | "mobile" | "newPassword" | "confirmPassword"> => {
  const errors: Partial<Record<"email" | "mobile" | "newPassword" | "confirmPassword", string>> = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!mobile.trim()) {
    errors.mobile = "Registered mobile number is required.";
  } else if (!validateMobile(mobile)) {
    errors.mobile = "Mobile must be 10 digits and start with 0.";
  }

  if (!newPassword.trim()) {
    errors.newPassword = "New password is required.";
  } else if (newPassword.trim().length < 8) {
    errors.newPassword = "Password must be at least 8 characters.";
  }

  if (!confirmPassword.trim()) {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return createResult(errors);
};

export const validateRegisterForm = (
  form: RegisterFormValues,
  role: Role
): ValidationResult<string> => {
  const errors: Record<string, string> = {};
  const firstname = form.firstname?.trim() ?? "";
  const lastname = form.lastname?.trim() ?? "";
  const email = form.email?.trim() ?? "";
  const password = form.password ?? "";
  const city = form.city?.trim() ?? "";
  const country = form.country?.trim() ?? "";
  const mobile = form.mobile?.trim() ?? "";
  const school = form.school?.trim() ?? "";
  const education = form.education?.trim() ?? "";
  const companyName = form.companyName?.trim() ?? "";
  const industry = form.industry?.trim() ?? "";
  const companySize = form.companySize?.trim() ?? "";
  const industryExpertise = form.industryExpertise?.trim() ?? "";
  const yearsOfExperience = form.yearsOfExperience?.trim() ?? "";

  if (!firstname) {
    errors.firstname = "First name is required.";
  } else if (firstname.length < 2) {
    errors.firstname = "First name must be at least 2 characters.";
  } else if (!validateName(firstname)) {
    errors.firstname = "Use letters only for the first name.";
  }

  if (!lastname) {
    errors.lastname = "Last name is required.";
  } else if (lastname.length < 2) {
    errors.lastname = "Last name must be at least 2 characters.";
  } else if (!validateName(lastname)) {
    errors.lastname = "Use letters only for the last name.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!validateEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password.trim()) {
    errors.password = "Password is required.";
  } else if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!city) {
    errors.city = "City is required.";
  } else if (city.length < 2) {
    errors.city = "City must be at least 2 characters.";
  }

  if (!country) {
    errors.country = "Country is required.";
  } else if (country.length < 2) {
    errors.country = "Country must be at least 2 characters.";
  }

  if (!mobile) {
    errors.mobile = "Mobile number is required.";
  } else if (!validateMobile(mobile)) {
    errors.mobile = "Mobile must be 10 digits and start with 0.";
  }

  if (role === "student" || role === "lecturer") {
    if (!school) {
      errors.school = "School or university is required.";
    }
    if (!education) {
      errors.education = "Education level is required.";
    }
  }

  if (role === "company") {
    if (!companyName) {
      errors.companyName = "Company name is required.";
    }
    if (!industry) {
      errors.industry = "Industry is required.";
    }
    if (!companySize) {
      errors.companySize = "Company size is required.";
    }
  }

  if (role === "tech_lead") {
    if (!industryExpertise) {
      errors.industryExpertise = "Industry expertise is required.";
    }

    if (!yearsOfExperience) {
      errors.yearsOfExperience = "Years of experience is required.";
    } else if (Number.isNaN(Number(yearsOfExperience)) || Number(yearsOfExperience) < 0 || Number(yearsOfExperience) > 50) {
      errors.yearsOfExperience = "Enter a valid number between 0 and 50.";
    }
  }

  return createResult(errors);
};

export const validateTaskForm = (
  formData: TaskFormData
): ValidationResult<"title" | "description" | "contactEmail" | "skills" | "studentsNeeded" | "startDate" | "deadline" | "tags"> => {
  const errors: Partial<Record<"title" | "description" | "contactEmail" | "skills" | "studentsNeeded" | "startDate" | "deadline" | "tags", string>> = {};

  if (!formData.title.trim()) {
    errors.title = "Task title is required.";
  } else if (formData.title.trim().length < 5) {
    errors.title = "Task title should be at least 5 characters.";
  }

  if (!formData.description.trim()) {
    errors.description = "Description is required.";
  } else if (formData.description.trim().length < 20) {
    errors.description = "Description should explain the task in at least 20 characters.";
  }

  if (!formData.contactEmail.trim()) {
    errors.contactEmail = "Contact email is required.";
  } else if (!validateEmail(formData.contactEmail)) {
    errors.contactEmail = "Enter a valid contact email address.";
  }

  if (formData.skills.length === 0) {
    errors.skills = "Add at least one required skill.";
  }

  if (formData.projectType === "Group" && formData.studentsNeeded < 2) {
    errors.studentsNeeded = "Group projects should request at least 2 students.";
  }

  if (!formData.startDate) {
    errors.startDate = "Start date is required.";
  }

  if (!formData.deadline) {
    errors.deadline = "Deadline is required.";
  }

  if (formData.startDate && formData.deadline) {
    const startDate = new Date(formData.startDate);
    const deadlineDate = new Date(formData.deadline);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(deadlineDate.getTime())) {
      errors.startDate = "Enter a valid project date.";
    } else if (deadlineDate <= startDate) {
      errors.deadline = "Deadline must be after the start date.";
    }
  }

  if (formData.tags.some((tag) => tag.trim().length < 2)) {
    errors.tags = "Each tag should contain at least 2 characters.";
  }

  return createResult(errors);
};

export const validateClassroomForm = (
  title: string,
  description: string,
  maxStudents: number
): ValidationResult<"title" | "description" | "maxStudents"> => {
  const errors: Partial<Record<"title" | "description" | "maxStudents", string>> = {};

  if (!title.trim()) {
    errors.title = "Classroom title is required.";
  } else if (title.trim().length < 5) {
    errors.title = "Title should be at least 5 characters.";
  }

  if (!description.trim()) {
    errors.description = "Description is required.";
  } else if (description.trim().length < 20) {
    errors.description = "Description should be at least 20 characters.";
  }

  if (!Number.isFinite(maxStudents) || maxStudents < 1 || maxStudents > 500) {
    errors.maxStudents = "Maximum students must be between 1 and 500.";
  }

  return createResult(errors);
};

export const validateKuppyForm = (
  title: string,
  moduleName: string,
  description: string,
  startDatetime: string,
  endDatetime: string,
  maxStudents: number
): ValidationResult<"title" | "moduleName" | "description" | "startDatetime" | "endDatetime" | "maxStudents"> => {
  const errors: Partial<Record<"title" | "moduleName" | "description" | "startDatetime" | "endDatetime" | "maxStudents", string>> = {};

  if (!title.trim()) {
    errors.title = "Topic is required.";
  } else if (title.trim().length < 5) {
    errors.title = "Topic should be at least 5 characters.";
  }

  if (!moduleName.trim()) {
    errors.moduleName = "Module name is required.";
  } else if (moduleName.trim().length < 3) {
    errors.moduleName = "Module name should be at least 3 characters.";
  }

  if (!description.trim()) {
    errors.description = "Description is required.";
  } else if (description.trim().length < 15) {
    errors.description = "Description should be at least 15 characters.";
  }

  if (!startDatetime) {
    errors.startDatetime = "Start date and time are required.";
  } else {
    const scheduledStart = new Date(startDatetime);
    if (Number.isNaN(scheduledStart.getTime())) {
      errors.startDatetime = "Enter a valid start date and time.";
    } else if (scheduledStart <= new Date()) {
      errors.startDatetime = "Please schedule the session for a future time.";
    }
  }

  if (!endDatetime) {
    errors.endDatetime = "End date and time are required.";
  } else {
    const scheduledEnd = new Date(endDatetime);
    const scheduledStart = new Date(startDatetime);
    if (Number.isNaN(scheduledEnd.getTime())) {
      errors.endDatetime = "Enter a valid end date and time.";
    } else if (!Number.isNaN(scheduledStart.getTime()) && scheduledEnd <= scheduledStart) {
      errors.endDatetime = "End time must be after the start time.";
    } else if (!Number.isNaN(scheduledStart.getTime()) && scheduledEnd.getTime() - scheduledStart.getTime() < 30 * 60 * 1000) {
      errors.endDatetime = "Session duration should be at least 30 minutes.";
    }
  }

  if (!Number.isFinite(maxStudents) || maxStudents < 1 || maxStudents > 500) {
    errors.maxStudents = "Maximum students must be between 1 and 500.";
  }

  return createResult(errors);
};

export const validateKuppyRequestForm = (
  moduleName: string,
  description: string,
  requestedBefore: string,
  currentStudentCount: number
): ValidationResult<"moduleName" | "description" | "requestedBefore" | "currentStudentCount"> => {
  const errors: Partial<Record<"moduleName" | "description" | "requestedBefore" | "currentStudentCount", string>> = {};

  if (!moduleName.trim()) {
    errors.moduleName = "Module name is required.";
  } else if (moduleName.trim().length < 3) {
    errors.moduleName = "Module name should be at least 3 characters.";
  }

  if (!description.trim()) {
    errors.description = "Description is required.";
  } else if (description.trim().length < 15) {
    errors.description = "Description should be at least 15 characters.";
  }

  if (!requestedBefore) {
    errors.requestedBefore = "Needed before date is required.";
  } else {
    const neededBefore = new Date(requestedBefore);
    if (Number.isNaN(neededBefore.getTime())) {
      errors.requestedBefore = "Enter a valid deadline.";
    } else if (neededBefore <= new Date()) {
      errors.requestedBefore = "Please choose a future deadline.";
    }
  }

  if (!Number.isFinite(currentStudentCount) || currentStudentCount < 1 || currentStudentCount > 500) {
    errors.currentStudentCount = "Student count must be between 1 and 500.";
  }

  return createResult(errors);
};

export const validateKuppyOfferForm = (
  availabilityStart: string,
  availabilityEnd: string,
  description: string
): ValidationResult<"availabilityStart" | "availabilityEnd" | "description"> => {
  const errors: Partial<Record<"availabilityStart" | "availabilityEnd" | "description", string>> = {};

  if (!availabilityStart) {
    errors.availabilityStart = "Availability start is required.";
  }

  if (!availabilityEnd) {
    errors.availabilityEnd = "Availability end is required.";
  }

  if (availabilityStart && availabilityEnd) {
    const start = new Date(availabilityStart);
    const end = new Date(availabilityEnd);

    if (Number.isNaN(start.getTime())) {
      errors.availabilityStart = "Enter a valid availability start time.";
    } else if (start <= new Date()) {
      errors.availabilityStart = "Availability start must be in the future.";
    }

    if (Number.isNaN(end.getTime())) {
      errors.availabilityEnd = "Enter a valid availability end time.";
    } else if (!Number.isNaN(start.getTime()) && end <= start) {
      errors.availabilityEnd = "Availability end must be after the start time.";
    } else if (!Number.isNaN(start.getTime()) && end.getTime() - start.getTime() < 30 * 60 * 1000) {
      errors.availabilityEnd = "Offer duration should be at least 30 minutes.";
    }
  }

  if (!description.trim()) {
    errors.description = "Offer description is required.";
  } else if (description.trim().length < 10) {
    errors.description = "Offer description should be at least 10 characters.";
  }

  return createResult(errors);
};

export const validateGroupForm = (
  name: string,
  description: string
): ValidationResult<"name" | "description"> => {
  const errors: Partial<Record<"name" | "description", string>> = {};

  if (!name.trim()) {
    errors.name = "Group name is required.";
  } else if (name.trim().length < 3) {
    errors.name = "Group name should be at least 3 characters.";
  }

  if (!description.trim()) {
    errors.description = "Description is required.";
  } else if (description.trim().length < 12) {
    errors.description = "Description should be at least 12 characters.";
  }

  return createResult(errors);
};

export const validateUserProfileUpdate = (
  payload: UserProfileUpdatePayload,
  role: Role
): ValidationResult<string> => {
  const errors: Record<string, string> = {};

  if (!payload.firstname.trim()) {
    errors.firstname = "First name is required.";
  }

  if (!payload.lastname.trim()) {
    errors.lastname = "Last name is required.";
  }

  if (!payload.email.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(payload.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!payload.city.trim()) {
    errors.city = "City is required.";
  }

  if (!payload.country.trim()) {
    errors.country = "Country is required.";
  }

  if (!payload.mobile.trim()) {
    errors.mobile = "Mobile number is required.";
  } else if (!validateMobile(payload.mobile)) {
    errors.mobile = "Mobile must be 10 digits and start with 0.";
  }

  if (payload.password?.trim() && payload.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if ((role === "student" || role === "lecturer") && !payload.school?.trim()) {
    errors.school = "School or university is required.";
  }

  if ((role === "student" || role === "lecturer") && !payload.education?.trim()) {
    errors.education = "Education level is required.";
  }

  if (role === "company") {
    if (!payload.companyName?.trim()) {
      errors.companyName = "Company name is required.";
    }
    if (!payload.industry?.trim()) {
      errors.industry = "Industry is required.";
    }
    if (!payload.companySize?.trim()) {
      errors.companySize = "Company size is required.";
    }
  }

  if (role === "tech_lead") {
    if (!payload.industryExpertise?.trim()) {
      errors.industryExpertise = "Industry expertise is required.";
    }
    if (!payload.yearsOfExperience?.trim()) {
      errors.yearsOfExperience = "Years of experience is required.";
    } else if (Number.isNaN(Number(payload.yearsOfExperience)) || Number(payload.yearsOfExperience) < 0 || Number(payload.yearsOfExperience) > 50) {
      errors.yearsOfExperience = "Enter a valid number between 0 and 50.";
    }
  }

  return createResult(errors);
};
