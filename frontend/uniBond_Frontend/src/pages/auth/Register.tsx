import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { handleRegister } from "@/controllers/authController";
import { uploadCV } from "@/models/authModel";
import type { Role, User } from "@/types/user";
import { ROUTES } from "@/utils/constants";
import { validateRegisterForm } from "@/utils/validators";
import {
  User as UserIcon, Mail, Lock, Phone, MapPin, Building2,
  GraduationCap, Briefcase, ChevronDown, Upload, CheckCircle2, AlertCircle,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const ROLE_OPTIONS: { value: Role; label: string; emoji: string }[] = [
  { value: "student",   label: "Student",   emoji: "🎓" },
  { value: "lecturer",  label: "Lecturer",  emoji: "📚" },
  { value: "company",   label: "Company",   emoji: "🏢" },
  { value: "tech_lead", label: "Tech Lead", emoji: "💻" },
  { value: "admin",     label: "Admin",     emoji: "🛡️" },
];

const EDUCATION_OPTIONS = [
  { value: "",               label: "Select Education Level" },
  { value: "Diploma",        label: "Diploma" },
  { value: "Higher Diploma", label: "Higher Diploma" },
  { value: "Bachelor",       label: "Bachelor" },
  { value: "Master",         label: "Master" },
];

// ── sub-components ────────────────────────────────────────────────────────────
function Field({
  label, icon, children, hint, error,
}: { label: string; icon: React.ReactNode; children: React.ReactNode; hint?: string; error?: string }) {
  return (
    <div>
      <label className="field-label mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-3 text-[var(--text-muted)] pointer-events-none">{icon}</span>
        {children}
      </div>
      {error ? <p className="field-error mt-1 ml-1">{error}</p> : null}
      {!error && hint ? <p className="field-hint mt-1 ml-1">{hint}</p> : null}
    </div>
  );
}

function InputField({
  name, type = "text", placeholder, value, onChange, required, error,
}: {
  name: string; type?: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; error?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      aria-invalid={Boolean(error)}
      className={`w-full text-sm field-shell ${error ? "field-shell-error" : ""}`}
      style={{ paddingLeft: "2.9rem", paddingRight: "1rem", paddingTop: "0.8rem", paddingBottom: "0.8rem" }}
    />
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Record<string, string>>({ role: "student" });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [pendingMsg, setPendingMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const role = form.role as Role;
  const selectedRole = ROLE_OPTIONS.find(r => r.value === role)!;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setError("");
    setFieldErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async () => {
    setError("");
    setPendingMsg("");
    const validation = validateRegisterForm(form, role);
    setFieldErrors(validation.errors);
    if (!validation.isValid) {
      setError(validation.error ?? "Please correct the highlighted fields.");
      return;
    }

    const userData = {
      firstname: form.firstname.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role,
      city: form.city.trim(),
      country: form.country.trim(),
      mobile: form.mobile.trim(),
      school: form.school?.trim() || undefined,
      education: form.education,
      companyName: form.companyName?.trim(),
      industry: form.industry?.trim(),
      companySize: form.companySize?.trim(),
      industryExpertise: form.industryExpertise?.trim(),
      yearsOfExperience: form.yearsOfExperience?.trim(),
    };

    const res = await handleRegister(userData as unknown as User, setLoading, setError);
    if (res) {
      // Upload CV if provided
      if (cvFile && res.user?.id) {
        try { await uploadCV(String(res.user.id), cvFile); } catch { /* non-fatal */ }
      }

      if (res.user?.access_status === "active") {
        navigate(ROUTES.LOGIN);
      } else {
        setPendingMsg(
          `Your account has been created (${res.user?.user_code ?? ""}) and is pending admin approval. ` +
          `You'll receive access once an admin reviews your registration.`
        );
        setForm({ role });
        setFieldErrors({});
        setCvFile(null);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="panel-surface w-full max-w-lg rounded-[2rem] p-8 sm:p-10">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-slate-500 mt-1">Join UniBond – fill in your details below</p>
        </div>

        {/* Pending success message */}
        {pendingMsg && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{pendingMsg}</p>
          </div>
        )}

        <div className="space-y-4">

          {/* Role Selector */}
          <div className="relative">
            <label className="field-label mb-1.5">I am a…</label>
            <button
              type="button"
              onClick={() => setRoleOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 field-shell text-sm font-medium"
            >
              <span>{selectedRole.emoji} {selectedRole.label}</span>
              <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${roleOpen ? "rotate-180" : ""}`} />
            </button>
            {roleOpen && (
              <div className="absolute z-20 mt-1 w-full panel-surface rounded-xl overflow-hidden">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, role: opt.value }));
                      setFieldErrors({});
                      setRoleOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition ${opt.value === role ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] font-semibold" : "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" icon={<UserIcon className="w-4 h-4" />} error={fieldErrors.firstname}>
              <InputField name="firstname" placeholder="First Name" value={form.firstname ?? ""} onChange={handleChange} required error={fieldErrors.firstname} />
            </Field>
            <Field label="Last Name" icon={<UserIcon className="w-4 h-4" />} error={fieldErrors.lastname}>
              <InputField name="lastname" placeholder="Last Name" value={form.lastname ?? ""} onChange={handleChange} required error={fieldErrors.lastname} />
            </Field>
          </div>

          {/* Email & Password */}
          <Field label="Email Address" icon={<Mail className="w-4 h-4" />} error={fieldErrors.email}>
            <InputField name="email" type="email" placeholder="you@example.com" value={form.email ?? ""} onChange={handleChange} required error={fieldErrors.email} />
          </Field>

          <Field label="Password" icon={<Lock className="w-4 h-4" />} hint="Use at least 8 characters." error={fieldErrors.password}>
            <InputField name="password" type="password" placeholder="••••••••" value={form.password ?? ""} onChange={handleChange} required error={fieldErrors.password} />
          </Field>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" icon={<MapPin className="w-4 h-4" />} error={fieldErrors.city}>
              <InputField name="city" placeholder="Colombo" value={form.city ?? ""} onChange={handleChange} required error={fieldErrors.city} />
            </Field>
            <Field label="Country" icon={<MapPin className="w-4 h-4" />} error={fieldErrors.country}>
              <InputField name="country" placeholder="Sri Lanka" value={form.country ?? ""} onChange={handleChange} required error={fieldErrors.country} />
            </Field>
          </div>

          {/* Mobile */}
          <Field label="Mobile Number" icon={<Phone className="w-4 h-4" />} hint="Format: 0775078338 (10 digits, starts with 0)" error={fieldErrors.mobile}>
            <InputField name="mobile" type="tel" placeholder="0775078338" value={form.mobile ?? ""} onChange={handleChange} required error={fieldErrors.mobile} />
          </Field>

          {/* Student / Lecturer fields */}
          {(role === "student" || role === "lecturer") && (
            <>
              <Field label="School / University" icon={<GraduationCap className="w-4 h-4" />} error={fieldErrors.school}>
                <InputField name="school" placeholder="e.g. University of Colombo" value={form.school ?? ""} onChange={handleChange} required error={fieldErrors.school} />
              </Field>
              <div>
                <label className="field-label mb-1.5">Education Level</label>
                <select
                  name="education"
                  value={form.education ?? ""}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.education)}
                  className={`w-full px-4 py-2.5 text-sm field-shell ${fieldErrors.education ? "field-shell-error" : ""}`}
                >
                  {EDUCATION_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {fieldErrors.education ? <p className="field-error mt-1 ml-1">{fieldErrors.education}</p> : null}
              </div>
            </>
          )}

          {/* Company fields */}
          {role === "company" && (
            <>
              <Field label="Company Name" icon={<Building2 className="w-4 h-4" />} error={fieldErrors.companyName}>
                <InputField name="companyName" placeholder="Sysco LABS" value={form.companyName ?? ""} onChange={handleChange} required error={fieldErrors.companyName} />
              </Field>
              <Field label="Industry" icon={<Briefcase className="w-4 h-4" />} error={fieldErrors.industry}>
                <InputField name="industry" placeholder="Software Engineering" value={form.industry ?? ""} onChange={handleChange} required error={fieldErrors.industry} />
              </Field>
              <Field label="Company Size" icon={<UserIcon className="w-4 h-4" />} error={fieldErrors.companySize}>
                <InputField name="companySize" placeholder="e.g. 1-50, 50-200, 200+" value={form.companySize ?? ""} onChange={handleChange} required error={fieldErrors.companySize} />
              </Field>
            </>
          )}

          {/* Tech Lead fields */}
          {role === "tech_lead" && (
            <>
              <Field label="Industry Expertise" icon={<Briefcase className="w-4 h-4" />} error={fieldErrors.industryExpertise}>
                <InputField name="industryExpertise" placeholder="e.g. Cloud, ML, DevOps" value={form.industryExpertise ?? ""} onChange={handleChange} required error={fieldErrors.industryExpertise} />
              </Field>
              <Field label="Years of Experience" icon={<UserIcon className="w-4 h-4" />} error={fieldErrors.yearsOfExperience}>
                <InputField name="yearsOfExperience" type="number" placeholder="5" value={form.yearsOfExperience ?? ""} onChange={handleChange} required error={fieldErrors.yearsOfExperience} />
              </Field>
            </>
          )}

          {/* CV Upload */}
          <div>
            <label className="field-label mb-1.5">
              Upload CV <span className="text-[var(--text-muted)] font-normal">(optional - PDF or Word)</span>
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-xl transition text-sm text-[var(--text-secondary)] border-[var(--border-soft)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"
            >
              <Upload className="w-4 h-4" />
              {cvFile ? cvFile.name : "Click to select CV file"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={e => setCvFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="status-error">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="btn-primary w-full py-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-sm text-center text-[var(--text-secondary)]">
            Already have an account?{" "}
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
