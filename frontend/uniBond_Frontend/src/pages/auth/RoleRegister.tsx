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
    Eye,
    EyeOff,
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

const STUDENT_STUDY_OPTIONS = [
    { value: "", label: "Select your current study level" },
    { value: "Undergraduate Student", label: "Undergraduate Student" },
    { value: "Master's Student", label: "Master's Student" },
    { value: "PhD Student", label: "PhD Student" },
    { value: "Other", label: "Other" },
];

const LECTURER_EDUCATION_OPTIONS = [
    { value: "", label: "Select Education Level" },
    { value: "Bachelor", label: "Bachelor" },
    { value: "Master", label: "Master" },
    { value: "PhD", label: "PhD" },
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

const registrationStepsByRole: Record<Role, { title: string; description: string }[]> = {
    student: [
        {
            title: "Submit student details",
            description: "Add your institute, current study level, and course details.",
        },
        {
            title: "Admin review",
            description: "Your account will be reviewed before full platform access.",
        },
        {
            title: "Start collaborating",
            description: "Join groups, find support, tasks, and opportunities.",
        },
    ],
    lecturer: [
        {
            title: "Submit academic profile",
            description: "Add your institute and education qualification details.",
        },
        {
            title: "Lecturer verification",
            description: "Admin verifies your lecturer account before approval.",
        },
        {
            title: "Guide students",
            description: "Support academic collaboration and student learning.",
        },
    ],
    company: [
        {
            title: "Submit company details",
            description: "Add company name, industry, size, and contact information.",
        },
        {
            title: "Company verification",
            description: "Admin verifies the company before approving access.",
        },
        {
            title: "Post opportunities",
            description: "Publish internships, projects, and student opportunities.",
        },
    ],
    tech_lead: [
        {
            title: "Submit expertise details",
            description: "Add your industry expertise and years of experience.",
        },
        {
            title: "Profile review",
            description: "Admin reviews your mentor profile before approval.",
        },
        {
            title: "Start mentoring",
            description: "Support students through technical guidance and projects.",
        },
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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        setForm({ role: safeRole });
        setCvFile(null);
        setError("");
        setFieldErrors({});
        setPendingMsg("");
        setConfirmPassword("");
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, [safeRole]);

    if (!fixedRole || fixedRole === "admin") {
        return <Navigate to={ROUTES.REGISTER} replace />;
    }

    const role = fixedRole;
    const currentRole = roleContent[role];
    const benefits = benefitsByRole[role];
    const registrationSteps = registrationStepsByRole[role];

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

        if (!confirmPassword.trim()) {
            setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: "Please confirm your password.",
            }));
            setError("Please confirm your password.");
            return;
        }

        if (form.password !== confirmPassword) {
            setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: "Passwords do not match.",
            }));
            setError("Passwords do not match.");
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
            courseName: form.courseName?.trim() || undefined,
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
                setConfirmPassword("");
            }
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.2),transparent_35%)] px-4 py-8 text-[var(--text-primary)]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-start justify-center">
                <div className="grid w-full gap-8 rounded-[2rem] border border-white/10 bg-[var(--surface)]/70 p-6 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.75fr_1.25fr] lg:p-8">
                    <section className="relative hidden self-start overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-8 lg:sticky lg:top-8 lg:block">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/20 via-transparent to-[var(--accent)]/20" />
                        <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-[var(--brand)]/20 blur-3xl" />
                        <div className="absolute -bottom-24 right-8 h-64 w-64 rounded-full bg-[var(--accent)]/20 blur-3xl" />

                        <div className="relative z-10">
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.REGISTER)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Choose another role
                            </button>

                            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                                <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                                {currentRole.emoji} {currentRole.label} Registration
                            </div>

                            <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                                Join UniBond as a{" "}
                                <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
                                    {currentRole.label}
                                </span>
                            </h1>

                            <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)]">
                                {currentRole.description}
                            </p>

                            <div className="mt-8">
                                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                                    What you get
                                </h3>

                                <div className="mt-4 grid gap-3">
                                    {benefits.map((benefit, index) => (
                                        <div
                                            key={benefit}
                                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-sm font-bold text-[var(--brand)]">
                                                0{index + 1}
                                            </div>

                                            <p className="text-sm font-semibold leading-6 text-[var(--text-secondary)]">
                                                {benefit}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 rounded-3xl border border-white/10 bg-black/10 p-5 backdrop-blur">
                                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                                    Registration process
                                </h3>

                                <div className="mt-5 space-y-4">
                                    {registrationSteps.map((step, index) => (
                                        <div key={step.title} className="flex gap-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 text-xs font-black text-[var(--brand)]">
                                                {index + 1}
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                                                    {step.title}
                                                </h4>
                                                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand)]/10 p-4">
                                <p className="text-xs font-semibold leading-6 text-[var(--text-secondary)]">
                                    Your account will be available after admin approval. Make sure the
                                    details you enter are accurate.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="flex justify-center">
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
                                    <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                                        Password <span className="text-[var(--brand)]">*</span>
                                    </label>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            <Lock className="h-4 w-4" />
                                        </span>

                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={form.password ?? ""}
                                            onChange={handleChange}
                                            required
                                            aria-invalid={Boolean(fieldErrors.password)}
                                            className={`field-shell w-full text-sm ${
                                                fieldErrors.password ? "field-shell-error" : ""
                                            }`}
                                            style={{
                                                paddingLeft: "2.9rem",
                                                paddingRight: "3rem",
                                                paddingTop: "0.8rem",
                                                paddingBottom: "0.8rem",
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {fieldErrors.password ? (
                                        <p className="ml-1 mt-1 text-xs font-medium text-red-400">
                                            {fieldErrors.password}
                                        </p>
                                    ) : (
                                        <p className="ml-1 mt-1 text-xs text-[var(--text-muted)]">
                                            Use at least 8 characters.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                                        Confirm Password <span className="text-[var(--brand)]">*</span>
                                    </label>

                                    <div className="relative">
                                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            <Lock className="h-4 w-4" />
                                        </span>

                                        <input
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setFieldErrors((prev) => ({
                                                    ...prev,
                                                    confirmPassword: "",
                                                }));
                                                setError("");
                                            }}
                                            required
                                            aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                            className={`field-shell w-full text-sm ${
                                                fieldErrors.confirmPassword ? "field-shell-error" : ""
                                            }`}
                                            style={{
                                                paddingLeft: "2.9rem",
                                                paddingRight: "3rem",
                                                paddingTop: "0.8rem",
                                                paddingBottom: "0.8rem",
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((current) => !current)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide confirm password"
                                                    : "Show confirm password"
                                            }
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    {fieldErrors.confirmPassword ? (
                                        <p className="ml-1 mt-1 text-xs font-medium text-red-400">
                                            {fieldErrors.confirmPassword}
                                        </p>
                                    ) : null}
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
                                    hint="Format: +94775078338"
                                    error={fieldErrors.mobile}
                                    required
                                >
                                    <InputField
                                        name="mobile"
                                        type="tel"
                                        placeholder="+94775078338"
                                        value={form.mobile ?? ""}
                                        onChange={handleChange}
                                        required
                                        error={fieldErrors.mobile}
                                    />
                                </Field>

                                {role === "student" && (
                                    <>
                                        <Field
                                            label="University / Institute"
                                            icon={<GraduationCap className="h-4 w-4" />}
                                            error={fieldErrors.school}
                                            required
                                        >
                                            <InputField
                                                name="school"
                                                placeholder="e.g. SLIIT"
                                                value={form.school ?? ""}
                                                onChange={handleChange}
                                                required
                                                error={fieldErrors.school}
                                            />
                                        </Field>

                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                                                Current Study Level <span className="text-[var(--brand)]">*</span>
                                            </label>

                                            <select
                                                name="education"
                                                value={form.education ?? ""}
                                                onChange={handleChange}
                                                required
                                                aria-invalid={Boolean(fieldErrors.education)}
                                                className={`field-shell w-full px-4 py-3 text-sm ${
                                                    fieldErrors.education ? "field-shell-error" : ""
                                                }`}
                                            >
                                                {STUDENT_STUDY_OPTIONS.map((opt) => (
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

                                        <Field
                                            label="Course / Programme Name"
                                            icon={<GraduationCap className="h-4 w-4" />}
                                            error={fieldErrors.courseName}
                                            required
                                        >
                                            <InputField
                                                name="courseName"
                                                placeholder="e.g. BSc (Hons) in Information Technology"
                                                value={form.courseName ?? ""}
                                                onChange={handleChange}
                                                required
                                                error={fieldErrors.courseName}
                                            />
                                        </Field>
                                    </>
                                )}

                                {role === "lecturer" && (
                                    <>
                                        <Field
                                            label="University / Institute"
                                            icon={<GraduationCap className="h-4 w-4" />}
                                            error={fieldErrors.school}
                                            required
                                        >
                                            <InputField
                                                name="school"
                                                placeholder="e.g. SLIIT / University"
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
                                                required
                                                aria-invalid={Boolean(fieldErrors.education)}
                                                className={`field-shell w-full px-4 py-3 text-sm ${
                                                    fieldErrors.education ? "field-shell-error" : ""
                                                }`}
                                            >
                                                {LECTURER_EDUCATION_OPTIONS.map((opt) => (
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