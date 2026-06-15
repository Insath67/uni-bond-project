import { useEffect, useRef, useState } from "react";
import { Camera, Save, Upload, X } from "lucide-react";
import type { User, UserProfileUpdatePayload } from "@/types/user";
import { validateUserProfileUpdate } from "@/utils/validators";
import ProfileImageCropModal from "./ProfileImageCropModal";
import {
  AVATAR_ALLOWED_TYPES,
  AVATAR_MAX_SIZE_BYTES,
  IMAGE_INPUT_ACCEPT,
  readImageDimensions,
  validateImageUpload,
  type AvatarImageDimensions,
} from "@/utils/avatarCrop";

const EDUCATION_OPTIONS = ["Diploma", "Higher Diploma", "Bachelor", "Master"];

type Props = {
  user: User;
  open: boolean;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: UserProfileUpdatePayload, avatarFile?: File | null) => Promise<void> | void;
};

export default function EditProfileModal({ user, open, saving = false, onClose, onSave }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<UserProfileUpdatePayload>({
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    city: user.city || "",
    country: user.country || "",
    mobile: user.mobile || "",
    password: "",
    school: "school" in user ? user.school || "" : "",
    education: "education" in user ? user.education || "" : "",
    companyName: "companyName" in user ? user.companyName || "" : "",
    industry: "industry" in user ? user.industry || "" : "",
    companySize: "companySize" in user ? user.companySize || "" : "",
    industryExpertise: "industryExpertise" in user ? user.industryExpertise || "" : "",
    yearsOfExperience: "yearsOfExperience" in user ? user.yearsOfExperience || "" : "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || "");
  const [cropSource, setCropSource] = useState("");
  const [cropFileName, setCropFileName] = useState("");
  const [cropDimensions, setCropDimensions] = useState<AvatarImageDimensions | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const revokeObjectUrl = (value: string) => {
    if (value.startsWith("blob:")) {
      URL.revokeObjectURL(value);
    }
  };

  useEffect(() => {
    if (!open) return;
    revokeObjectUrl(avatarPreview);
    revokeObjectUrl(cropSource);
    setForm({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      city: user.city || "",
      country: user.country || "",
      mobile: user.mobile || "",
      password: "",
      school: "school" in user ? user.school || "" : "",
      education: "education" in user ? user.education || "" : "",
      companyName: "companyName" in user ? user.companyName || "" : "",
      industry: "industry" in user ? user.industry || "" : "",
      companySize: "companySize" in user ? user.companySize || "" : "",
      industryExpertise: "industryExpertise" in user ? user.industryExpertise || "" : "",
      yearsOfExperience: "yearsOfExperience" in user ? user.yearsOfExperience || "" : "",
    });
    setAvatarFile(null);
    setAvatarPreview(user.avatar || "");
    setCropSource("");
    setCropFileName("");
    setCropDimensions(null);
    setFieldErrors({});
    setFormError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, user]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(avatarPreview);
      revokeObjectUrl(cropSource);
    };
  }, [avatarPreview, cropSource]);

  if (!open) return null;

  const updateField = (name: keyof UserProfileUpdatePayload, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUserProfileUpdate(form, user.role);
    setFieldErrors(validation.errors as Record<string, string>);
    if (!validation.isValid) {
      setFormError(validation.error || "Please correct the highlighted fields.");
      return;
    }
    try {
      await onSave(form, avatarFile);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Profile update failed. Please try again.");
    }
  };

  const handleAvatarSelection = async (file?: File | null) => {
    const validation = validateImageUpload({
      file,
      allowedTypes: AVATAR_ALLOWED_TYPES,
      maxSizeBytes: AVATAR_MAX_SIZE_BYTES,
      invalidTypeMessage: "Please upload only an image file: JPG, PNG, or WebP.",
      invalidSizeMessage: "Profile photo must be smaller than 5 MB.",
    });

    if (!validation.isValid) {
      setFormError(validation.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const nextCropSource = URL.createObjectURL(file as File);

    try {
      const dimensions = await readImageDimensions(nextCropSource);
      revokeObjectUrl(cropSource);
      setCropSource(nextCropSource);
      setCropFileName((file as File).name);
      setCropDimensions(dimensions);
      setFormError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      revokeObjectUrl(nextCropSource);
      setFormError(error instanceof Error ? error.message : "Selected image could not be loaded.");
    }
  };

  const handleCropClose = () => {
    revokeObjectUrl(cropSource);
    setCropSource("");
    setCropFileName("");
    setCropDimensions(null);
  };

  const handleCroppedAvatarConfirm = (file: File) => {
    const nextPreview = URL.createObjectURL(file);
    revokeObjectUrl(avatarPreview);
    revokeObjectUrl(cropSource);
    setAvatarFile(file);
    setAvatarPreview(nextPreview);
    setCropSource("");
    setCropFileName("");
    setCropDimensions(null);
    setFormError("");
  };

  const renderInput = (
    name: keyof UserProfileUpdatePayload,
    label: string,
    type = "text",
    placeholder?: string,
  ) => (
    <div>
      <label className="field-label mb-1.5">{label}</label>
      <input
        type={type}
        value={(form[name] as string) || ""}
        onChange={(e) => updateField(name, e.target.value)}
        placeholder={placeholder}
        className={`field-shell ${fieldErrors[name] ? "field-shell-error" : ""}`}
      />
      {fieldErrors[name] ? <p className="field-error mt-1">{fieldErrors[name]}</p> : null}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="panel-surface w-full max-w-3xl rounded-[2rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Profile Settings</p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">Edit Profile</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Update your core details and role-specific profile information.</p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary h-11 w-11 p-0 shrink-0" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[1.5rem] border border-[var(--border-soft)] bg-[var(--surface-muted)] p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--surface-elevated)] border-4 border-white shadow-lg text-[var(--text-muted)]">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base font-bold text-[var(--text-primary)]">Profile Photo</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Upload a JPG, PNG, or WebP image, then crop it so it fits the profile circle neatly.
                </p>
                <div className="mt-3 flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary px-4 py-2.5">
                    <Upload className="h-4 w-4" />
                    {avatarFile ? "Change Photo" : "Upload & Crop"}
                  </button>
                  {avatarFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        revokeObjectUrl(avatarPreview);
                        setAvatarFile(null);
                        setAvatarPreview(user.avatar || "");
                      }}
                      className="btn-ghost px-4 py-2.5"
                    >
                      Remove Selection
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_INPUT_ACCEPT}
                  className="hidden"
                  onChange={(e) => {
                    void handleAvatarSelection(e.target.files?.[0] || null);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderInput("firstname", "First Name")}
            {renderInput("lastname", "Last Name")}
            {renderInput("email", "Email Address", "email", "you@example.com")}
            {renderInput("mobile", "Mobile Number", "tel", "0775078338")}
            {renderInput("city", "City")}
            {renderInput("country", "Country")}
          </div>

          {(user.role === "student" || user.role === "lecturer") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput("school", "School / University")}
              <div>
                <label className="field-label mb-1.5">Education Level</label>
                <select
                  value={form.education || ""}
                  onChange={(e) => updateField("education", e.target.value)}
                  className={`field-shell ${fieldErrors.education ? "field-shell-error" : ""}`}
                >
                  <option value="">Select Education Level</option>
                  {EDUCATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {fieldErrors.education ? <p className="field-error mt-1">{fieldErrors.education}</p> : null}
              </div>
            </div>
          )}

          {user.role === "company" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput("companyName", "Company Name")}
              {renderInput("industry", "Industry")}
              <div className="sm:col-span-2">
                {renderInput("companySize", "Company Size", "text", "e.g. 1-50, 50-200, 200+")}
              </div>
            </div>
          )}

          {user.role === "tech_lead" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderInput("industryExpertise", "Industry Expertise")}
              {renderInput("yearsOfExperience", "Years of Experience", "number")}
            </div>
          )}

          <div>
            <label className="field-label mb-1.5">New Password</label>
            <input
              type="password"
              value={form.password || ""}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="Leave blank to keep your current password"
              className={`field-shell ${fieldErrors.password ? "field-shell-error" : ""}`}
            />
            {fieldErrors.password ? <p className="field-error mt-1">{fieldErrors.password}</p> : <p className="field-hint mt-1">Only enter a password if you want to change it.</p>}
          </div>

          {formError ? <div className="status-error">{formError}</div> : null}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary px-5 py-3">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-3 disabled:opacity-60">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <ProfileImageCropModal
        open={Boolean(cropSource)}
        imageSrc={cropSource}
        fileName={cropFileName}
        dimensions={cropDimensions}
        onClose={handleCropClose}
        onConfirm={handleCroppedAvatarConfirm}
      />
    </div>
  );
}
