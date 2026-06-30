import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    ShieldCheck,
} from "lucide-react";
import Input from "@/components/Input";
import { handleForgotPassword } from "@/controllers/authController";
import { ROUTES } from "@/utils/constants";
import { validateForgotPassword } from "@/utils/validators";

type ForgotPasswordFieldErrors = {
    email?: string;
    mobile?: string;
    newPassword?: string;
    confirmPassword?: string;
};

type PasswordFieldProps = {
    label: string;
    name: string;
    value: string;
    placeholder: string;
    error?: string;
    hint?: string;
    showPassword: boolean;
    autoComplete: string;
    onToggle: () => void;
    onChange: (value: string) => void;
};

function PasswordField({
    label,
    name,
    value,
    placeholder,
    error,
    hint,
    showPassword,
    autoComplete,
    onToggle,
    onChange,
}: PasswordFieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
                {label} <span className="text-[var(--brand)]">*</span>
            </label>

            <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    <Lock className="h-4 w-4" />
                </span>

                <input
                    name={name}
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    required
                    autoComplete={autoComplete}
                    aria-invalid={Boolean(error)}
                    className={`field-shell w-full text-sm ${error ? "field-shell-error" : ""}`}
                    style={{
                        paddingLeft: "2.9rem",
                        paddingRight: "3rem",
                        paddingTop: "0.8rem",
                        paddingBottom: "0.8rem",
                    }}
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--accent)]"
                    aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>

            {error ? (
                <p className="ml-1 mt-1 text-xs font-medium text-red-400">{error}</p>
            ) : hint ? (
                <p className="ml-1 mt-1 text-xs text-[var(--text-muted)]">{hint}</p>
            ) : null}
        </div>
    );
}

const resetSteps = [
    {
        title: "Verify account",
        description: "Enter your registered email address and mobile number.",
    },
    {
        title: "Create new password",
        description: "Choose a strong password and confirm it correctly.",
    },
    {
        title: "Return to login",
        description: "After reset, sign in again using your new password.",
    },
];

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});

    const onSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        setError("");
        setSuccessMessage("");

        const validation = validateForgotPassword(
            email,
            mobile,
            newPassword,
            confirmPassword
        );

        setFieldErrors(validation.errors);

        if (!validation.isValid) {
            setError(validation.error ?? "Please correct the highlighted fields.");
            return;
        }

        const result = await handleForgotPassword(
            email.trim().toLowerCase(),
            mobile.trim(),
            newPassword,
            confirmPassword,
            setLoading,
            setError
        );

        if (!result) {
            return;
        }

        setSuccessMessage(result.message);
        setTimeout(() => navigate(ROUTES.LOGIN), 1500);
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.2),transparent_35%)] px-4 py-8 text-[var(--text-primary)]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)]/70 shadow-2xl backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
                    <section className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden p-10 lg:flex">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/20 via-transparent to-[var(--accent)]/20" />
                        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
                        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />

                        <div className="relative z-10">
                            <button
                                type="button"
                                onClick={() => navigate(ROUTES.LOGIN)}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to login
                            </button>

                            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                                <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                                Secure Password Recovery
                            </div>

                            <h1 className="mt-8 max-w-xl text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                                Reset your{" "}
                                <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
                                    UniBond
                                </span>{" "}
                                password
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
                                Verify your account details and create a new password to safely
                                regain access to your UniBond account.
                            </p>
                        </div>

                        <div className="relative z-10 rounded-3xl border border-white/10 bg-black/10 p-5 backdrop-blur">
                            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand)]">
                                Reset process
                            </h3>

                            <div className="mt-5 space-y-4">
                                {resetSteps.map((step, index) => (
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
                    </section>

                    <section className="flex items-center justify-center p-6 sm:p-10">
                        <form
                            onSubmit={onSubmit}
                            className="panel-surface w-full max-w-lg rounded-[2rem] p-7 sm:p-9"
                        >
                            <div className="mb-7">
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
                                    UniBond
                                </p>

                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                                    Forgot password
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                    Verify your account using your registered email address and mobile
                                    number, then set a new password.
                                </p>
                            </div>

                            <div className="mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-[var(--brand-soft)] p-2 text-[var(--brand)]">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>

                                    <div className="space-y-1 text-sm">
                                        <p className="font-semibold text-[var(--text-primary)]">
                                            Account verification
                                        </p>
                                        <p className="text-[var(--text-secondary)]">
                                            Use the same mobile number you entered when creating your
                                            UniBond account.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Email"
                                    name="forgot-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setFieldErrors((current) => ({
                                            ...current,
                                            email: undefined,
                                        }));
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    placeholder="you@example.com"
                                    error={fieldErrors.email}
                                    required
                                    autoComplete="email"
                                />

                                <Input
                                    label="Registered Mobile Number"
                                    name="forgot-mobile"
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => {
                                        setMobile(e.target.value);
                                        setFieldErrors((current) => ({
                                            ...current,
                                            mobile: undefined,
                                        }));
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                    placeholder="+94775078338"
                                    error={fieldErrors.mobile}
                                    hint="Enter the mobile number you used when creating your account."
                                    required
                                    autoComplete="tel"
                                />

                                <PasswordField
                                    label="New Password"
                                    name="forgot-new-password"
                                    value={newPassword}
                                    placeholder="Enter your new password"
                                    error={fieldErrors.newPassword}
                                    hint="Use at least 8 characters."
                                    showPassword={showNewPassword}
                                    autoComplete="new-password"
                                    onToggle={() => setShowNewPassword((current) => !current)}
                                    onChange={(value) => {
                                        setNewPassword(value);
                                        setFieldErrors((current) => ({
                                            ...current,
                                            newPassword: undefined,
                                        }));
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                />

                                <PasswordField
                                    label="Confirm New Password"
                                    name="forgot-confirm-password"
                                    value={confirmPassword}
                                    placeholder="Confirm your new password"
                                    error={fieldErrors.confirmPassword}
                                    showPassword={showConfirmPassword}
                                    autoComplete="new-password"
                                    onToggle={() => setShowConfirmPassword((current) => !current)}
                                    onChange={(value) => {
                                        setConfirmPassword(value);
                                        setFieldErrors((current) => ({
                                            ...current,
                                            confirmPassword: undefined,
                                        }));
                                        setError("");
                                        setSuccessMessage("");
                                    }}
                                />
                            </div>

                            {error ? (
                                <div
                                    className="status-error mt-4 rounded-2xl px-4 py-3 text-sm"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {error}
                                </div>
                            ) : null}

                            {successMessage ? (
                                <div className="status-success mt-4">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{successMessage}</span>
                                </div>
                            ) : null}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary mt-6 flex w-full items-center justify-center gap-2 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                ) : (
                                    <KeyRound className="h-4 w-4" />
                                )}

                                {loading ? "Updating password..." : "Reset password"}
                            </button>

                            <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
                                Remembered your password?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.LOGIN)}
                                    className="font-semibold text-[var(--accent)] hover:underline"
                                >
                                    Back to login
                                </button>
                            </p>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}