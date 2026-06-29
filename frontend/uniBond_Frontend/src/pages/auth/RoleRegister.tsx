import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { handleRegister } from "@/controllers/authController";
import { uploadCV } from "@/models/authModel";
import type { Role, User } from "@/types/user";
import { ROUTES } from "@/utils/constants";
import { validateRegisterForm } from "@/utils/validators";
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Building2,
    CheckCircle2,
    GraduationCap,
    Lock,
    Mail,
    MapPin,
    Phone,
    Upload,
    User as UserIcon,
} from "lucide-react";

const routeRoleMap: Record<string, Role> = {
    student: "student",
    lecturer: "lecturer",
    company: "company",
    "tech-lead": "tech_lead",
};

const roleContent: Record<Role, { label: string; emoji: string; title: string; description: string }> = {
    student: {
        label: "Student",
        emoji: "🎓",
        title: "Create student account",
        description: "Register as a student to find academic support, groups, tasks, and opportunities.",
    },
    lecturer: {
        label: "Lecturer",
        emoji: "📚",
        title: "Create lecturer account",
        description: "Register as a lecturer to guide students and support academic collaboration.",
    },
    company: {
        label: "Company",
        emoji: "🏢",
        title: "Create company account",
        description: "Register as a company to publish opportunities and connect with skilled students.",
    },
    tech_lead: {
        label: "Tech Lead",
        emoji: "💻",
        title: "Create tech lead account",
        description: "Register as a tech lead to mentor students and support technical learning.",
    },
    admin: {
        label: "Admin",
        emoji: "🛡️",
        title: "Create admin account",
        description: "Admin registration is not available publicly.",
    },
};

const EDUCATION_OPTIONS = [
    { value: "", label: "Select Education Level" },
    { value: "Diploma", label: "Diploma" },
    { value: "Higher Diploma", label: "Higher Diploma" },
    { value: "Bachelor", label: "Bachelor" },
    { value: "Master", label: "Master" },
];

const benefitsByRole: Record<Role, string[]> = {
    student: [
        "Build a verified student profile",
        "Join groups and academic support spaces",
        "Find internships, tasks, and collaboration opportunities",
    ],
    lecturer: [
        "Create a verified lecturer profile",
        "Support students through academic collaboration",
        "Connect with universities and learning communities",
    ],
    company: [
        "Create a verified company profile",
        "Publish internships, projects, and opportunities",
        "Connect with skilled students and future talent",
    ],
    tech_lead: [
        "Create a verified mentor profile",
        "Share technical expertise with students",
        "Support project teams and technical learning",
    ],
    admin: [],
};

type FieldProps = {
    label: string;
    icon: ReactNode;
    children: ReactNode;
    hint?: string;
    error?: string;
    required?: boolean;
};

function Field({ label, icon, children, hint, error, required }: FieldProps) {
    return (
        <div>
            {label && (
                <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                    {label} {required && <span className="text-[var(--brand)]">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[var(--text-muted)]">
                    {icon}
                </span>
                {children}
            </div>

            {error ? (
                <p className="ml-1 mt-1 text-xs font-medium text-red-400">{error}</p>
            ) : null}

            {!error && hint ? (
                <p className="ml-1 mt-1 text-xs text-[var(--text-muted)]">{hint}</p>
            ) : null}
        </div>
    );
}

type InputFieldProps = {
    name: string;
    type?: string;
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    error?: string;
};

function InputField({
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required,
    error,
}: InputFieldProps) {
    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            aria-invalid={Boolean(error)}
            className={`field-shell w-full text-sm ${error ? "field-shell-error" : ""}`}
            style={{
                paddingLeft: "2.9rem",
                paddingRight: "1rem",
                paddingTop: "0.8rem",
                paddingBottom: "0.8rem",
            }}
        />
    );
}

export default function RoleRegister() {
    const navigate = useNavigate();
    const { role: roleParam } = useParams();
    const fileRef = useRef<HTMLInputElement>(null);

    const fixedRole = roleParam ? routeRoleMap[roleParam] : undefined;
    const safeRole: Role = fixedRole ?? "student";

    const [form, setForm] = useState<Record<string, string>>({ role: safeRole });
    const [cvFile, setCvFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
    const [pendingMsg, setPendingMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setForm({ role: safeRole });
        setCvFile(null);
        setError("");
        setFieldErrors({});
        setPendingMsg("");
    }, [safeRole]);

    if (!fixedRole || fixedRole === "admin") {
        return <Navigate to={ROUTES.REGISTER} replace />;
    }

    const role = fixedRole;
    const currentRole = roleContent[role];
    const benefits = benefitsByRole[role];

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError("");
        setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

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
            education: form.education || undefined,
            companyName: form.companyName?.trim() || undefined,
            industry: form.industry?.trim() || undefined,
            companySize: form.companySize?.trim() || undefined,
            industryExpertise: form.industryExpertise?.trim() || undefined,
            yearsOfExperience: form.yearsOfExperience?.trim() || undefined,
        };

        const res = await handleRegister(userData as unknown as User, setLoading, setError);

        if (res) {
            if (cvFile && res.user?.id) {
                try {
                    await uploadCV(String(res.user.id), cvFile);
                } catch {
                    // CV upload is optional.
                }
            }

            if (res.user?.access_status === "active") {
                navigate(ROUTES.LOGIN);
            } else {
                setPendingMsg(
                    `Your ${currentRole.label.toLowerCase()} account has been created ${
                        res.user?.user_code ? `(${res.user.user_code})` : ""
                    } and is pending admin approval. You'll receive access once an admin reviews your registration.`
                );
                setForm({ role });
                setFieldErrors({});
                setCvFile(null);
            }
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.2),transparent_35%)] px-4 py-8 text-[var(--text-primary)]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)]/70 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden min-h-[720px] flex-col justify-between overflow-hidden p-10 lg:flex">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/20 via-transparent to-[var(--accent)]/20" />
                        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
                        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />

                        <div className="relative z-10">
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.REGISTER)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Choose another role
                            </button>

                            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                                <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                                {currentRole.emoji} {currentRole.label} Registration
                            </div>

                            <h1 className="mt-8 max-w-xl text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                                Join UniBond as a{" "}
                                <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
                                    {currentRole.label}
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
                                {currentRole.description}
                            </p>
                        </div>

                        <div className="relative z-10 grid gap-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={benefit}
                                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-sm font-bold text-[var(--brand)]">
                                        0{index + 1}
                                    </div>
                                    <p className="text-sm font-semibold text-[var(--text-secondary)]">
                                        {benefit}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex items-center justify-center p-6 sm:p-10">
                        <form
                            onSubmit={onSubmit}
                            className="panel-surface w-full max-w-2xl rounded-[2rem] p-7 sm:p-9"
                        >
                            <div className="mb-7">
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
                                    UniBond
                                </p>

                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                                    {currentRole.title}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                    {currentRole.description}
                                </p>

                                <div className="mt-4 inline-flex rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-4 py-2 text-sm font-bold text-[var(--brand)]">
                                    {currentRole.emoji} Account type: {currentRole.label}
                                </div>
                            </div>

                            {pendingMsg && (
                                <div className="mb-6 flex gap-3 rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-200">
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                                    <p>{pendingMsg}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label={role === "company" ? "Contact First Name" : "First Name"}
                                        icon={<UserIcon className="h-4 w-4" />}
                                        error={fieldErrors.firstname}
                                        required
                                    >
                                        <InputField
                                            name="firstname"
                                            placeholder={role === "company" ? "Contact first name" : "First Name"}
                                            value={form.firstname ?? ""}
                                            onChange={handleChange}
                                            required
                                            error={fieldErrors.firstname}
                                        />
                                    </Field>

                                    <Field
                                        label={role === "company" ? "Contact Last Name" : "Last Name"}
                                        icon={<UserIcon className="h-4 w-4" />}
                                        error={fieldErrors.lastname}
                                        required
                                    >
                                        <InputField
                                            name="lastname"
                                            placeholder={role === "company" ? "Contact last name" : "Last Name"}
                                            value={form.lastname ?? ""}
                                            onChange={handleChange}
                                            required
                                            error={fieldErrors.lastname}
                                        />
                                    </Field>
                                </div>

                                <Field
                                    label="Email Address"
                                    icon={<Mail className="h-4 w-4" />}
                                    error={fieldErrors.email}
                                    required
                                >
                                    <InputField
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email ?? ""}
                                        onChange={handleChange}
                                        required
                                        error={fieldErrors.email}
                                    />
                                </Field>

                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="block text-sm font-semibold text-[var(--text-primary)]">
                                            Password <span className="text-[var(--brand)]">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="text-xs font-semibold text-[var(--accent)] hover:underline"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>

                                    <Field
                                        label=""
                                        icon={<Lock className="h-4 w-4" />}
                                        hint="Use at least 8 characters."
                                        error={fieldErrors.password}
                                    >
                                        <InputField
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={form.password ?? ""}
                                            onChange={handleChange}
                                            required
                                            error={fieldErrors.password}
                                        />
                                    </Field>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field
                                        label="City"
                                        icon={<MapPin className="h-4 w-4" />}
                                        error={fieldErrors.city}
                                        required
                                    >
                                        <InputField
                                            name="city"
                                            placeholder="Colombo"
                                            value={form.city ?? ""}
                                            onChange={handleChange}
                                            required
                                            error={fieldErrors.city}
                                        />
                                    </Field>

                                    <Field
                                        label="Country"
                                        icon={<MapPin className="h-4 w-4" />}
                                        error={fieldErrors.country}
                                        required
                                    >
                                        <InputField
                                            name="country"
                                            placeholder="Sri Lanka"
                                            value={form.country ?? ""}
                                            onChange={handleChange}
                                            required
                                            error={fieldErrors.country}
                                        />
                                    </Field>
                                </div>

                                <Field
                                    label="Mobile Number"
                                    icon={<Phone className="h-4 w-4" />}
                                    hint="Format: 0775078338"
                                    error={fieldErrors.mobile}
                                    required
                                >
                                    <InputField
                                        name="mobile"
                                        type="tel"
                                        placeholder="0775078338"
                                        value={form.mobile ?? ""}
                                        onChange={handleChange}
                                        required
                                        error={fieldErrors.mobile}
                                    />
                                </Field>

                                {(role === "student" || role === "lecturer") && (
                                    <>
                                        <Field
                                            label={role === "student" ? "School / University" : "University / Institute"}
                                            icon={<GraduationCap className="h-4 w-4" />}
                                            error={fieldErrors.school}
                                            required
                                        >
                                            <InputField
                                                name="school"
                                                placeholder={role === "student" ? "e.g. SLIIT" : "e.g. SLIIT / University"}
                                                value={form.school ?? ""}
                                                onChange={handleChange}
                                                required
                                                error={fieldErrors.school}
                                            />
                                        </Field>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                                                Education Level <span className="text-[var(--brand)]">*</span>
                                            </label>

                                            <select
                                                name="education"
                                                value={form.education ?? ""}
                                                onChange={handleChange}
                                                aria-invalid={Boolean(fieldErrors.education)}
                                                className={`field-shell w-full px-4 py-3 text-sm ${
                                                    fieldErrors.education ? "field-shell-error" : ""
                                                }`}
                                            >
                                                {EDUCATION_OPTIONS.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {fieldErrors.education ? (
                                                <p className="ml-1 mt-1 text-xs font-medium text-red-400">
                                                    {fieldErrors.education}
                                                </p>
                                            ) : null}
                                        </div>
                                    </>
                                )}

                                {role === "company" && (
                                    <>
                                        <Field
                                            label="Company Name"
                                            icon={<Building2 className="h-4 w-4" />}
                                            error={fieldErrors.companyName}
                                            required
                                        >
                                            <InputField
                                                name="companyName"
                                                placeholder="Company name"
                                                value={form.companyName ?? ""}
                                                onChange={handleChange}
                                                required
                                                error={fieldErrors.companyName}
                                            />
                                        </Field>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field
                                                label="Industry"
                                                icon={<Briefcase className="h-4 w-4" />}
                                                error={fieldErrors.industry}
                                                required
                                            >
                                                <InputField
                                                    name="industry"
                                                    placeholder="Software Engineering"
                                                    value={form.industry ?? ""}
                                                    onChange={handleChange}
                                                    required
                                                    error={fieldErrors.industry}
                                                />
                                            </Field>

                                            <Field
                                                label="Company Size"
                                                icon={<UserIcon className="h-4 w-4" />}
                                                error={fieldErrors.companySize}
                                                required
                                            >
                                                <InputField
                                                    name="companySize"
                                                    placeholder="1-50, 50-200, 200+"
                                                    value={form.companySize ?? ""}
                                                    onChange={handleChange}
                                                    required
                                                    error={fieldErrors.companySize}
                                                />
                                            </Field>
                                        </div>
                                    </>
                                )}

                                {role === "tech_lead" && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <Field
                                            label="Industry Expertise"
                                            icon={<Briefcase className="h-4 w-4" />}
                                            error={fieldErrors.industryExpertise}
                                            required
                                        >
                                            <InputField
                                                name="industryExpertise"
                                                placeholder="Cloud, ML, DevOps"
                                                value={form.industryExpertise ?? ""}
                                                onChange={handleChange}
                                                required
                                                error={fieldErrors.industryExpertise}
                                            />
                                        </Field>

                                        <Field
                                            label="Years of Experience"
                                            icon={<UserIcon className="h-4 w-4" />}
                                            error={fieldErrors.yearsOfExperience}
                                            required
                                        >
                                            <InputField
                                                name="yearsOfExperience"
                                                type="number"
                                                placeholder="5"
                                                value={form.yearsOfExperience ?? ""}
                                                onChange={handleChange}
                                                required
                                                error={fieldErrors.yearsOfExperience}
                                            />
                                        </Field>
                                    </div>
                                )}

                                {(role === "student" || role === "tech_lead") && (
                                    <div>
                                        <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                                            Upload CV{" "}
                                            <span className="font-normal text-[var(--text-muted)]">
                                                optional, PDF or Word
                                            </span>
                                        </label>

                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border-soft)] px-4 py-4 text-sm text-[var(--text-secondary)] transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"
                                        >
                                            <Upload className="h-4 w-4" />
                                            <span className="truncate">
                                                {cvFile ? cvFile.name : "Click to select CV file"}
                                            </span>
                                        </button>

                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                                        />
                                    </div>
                                )}

                                {error && (
                                    <div
                                        className="status-error flex gap-2 rounded-2xl px-4 py-3 text-sm"
                                        role="alert"
                                        aria-live="polite"
                                    >
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p>{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading && (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    )}
                                    {loading ? "Creating account..." : `Create ${currentRole.label} Account`}
                                </button>

                                <p className="text-center text-sm text-[var(--text-secondary)]">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate(ROUTES.LOGIN)}
                                        className="font-semibold text-[var(--accent)] hover:underline"
                                    >
                                        Login here
                                    </button>
                                </p>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}