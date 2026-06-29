import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { ROUTES } from "@/utils/constants";
import apiClient from "@/services/api/axiosClient";
import Input from "@/components/Input";
import { validateLogin } from "@/utils/validators";

const extractApiErrorMessage = (err: unknown): string => {
    const apiError = err as any;
    const detail = apiError?.response?.data?.detail;

    if (typeof detail === "string") {
        return detail;
    }

    if (Array.isArray(detail)) {
        return (
            detail
                .map((item) => item?.msg || item?.message)
                .filter(Boolean)
                .join(", ") || "Validation failed"
        );
    }

    return err instanceof Error ? err.message : "Login failed. Check credentials.";
};

type LoginFieldErrors = {
    email?: string;
    password?: string;
};

const highlights = [
    {
        title: "Find opportunities",
        description: "Connect students with internships, projects, and academic support.",
    },
    {
        title: "Build university networks",
        description: "Collaborate with universities, companies, and skilled learners.",
    },
    {
        title: "Grow your profile",
        description: "Showcase skills, tasks, groups, and professional activity.",
    },
];

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        setError("");

        const validation = validateLogin(email, password);
        setFieldErrors(validation.errors);

        if (!validation.isValid) {
            setError(validation.error ?? "Please correct the highlighted fields.");
            return;
        }

        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append("username", email.trim().toLowerCase());
            formData.append("password", password);

            const res = await apiClient.post("/users/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            const token = res.data.access_token;

            const userRes = await apiClient.get("/users/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            login(userRes.data, token);
            navigate("/");
        } catch (err: unknown) {
            setError(extractApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.2),transparent_35%)] px-4 py-8 text-[var(--text-primary)]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
                <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[var(--surface)]/70 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
                    
                    <section className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden p-10 lg:flex">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/20 via-transparent to-[var(--accent)]/20" />
                        <div className="absolute -left-24 top-20 h-64 w-64 rounded-full bg-[var(--brand)]/20 blur-3xl" />
                        <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]">
                                <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                                Student Collaboration Platform
                            </div>

                            <h1 className="mt-8 max-w-xl text-5xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
                                Welcome to{" "}
                                <span className="bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] bg-clip-text text-transparent">
                                    UniBond
                                </span>
                            </h1>

                            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-secondary)]">
                                A modern platform for students, universities, and companies to connect,
                                collaborate, and discover meaningful academic and professional opportunities.
                            </p>
                        </div>

                        <div className="relative z-10 grid gap-4">
                            {highlights.map((item, index) => (
                                <div
                                    key={item.title}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-sm font-bold text-[var(--brand)]">
                                            0{index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--text-primary)]">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="flex items-center justify-center p-6 sm:p-10">
                        <form
                            onSubmit={onSubmit}
                            className="panel-surface w-full max-w-md rounded-[2rem] p-7 sm:p-9"
                        >
                            <div className="mb-7">
                                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
                                    UniBond
                                </p>
                                <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                                    Welcome back
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                    Sign in with your approved account to continue collaborating with
                                    students, universities, and companies.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setFieldErrors((current) => ({
                                            ...current,
                                            email: undefined,
                                        }));
                                        setError("");
                                    }}
                                    placeholder="you@example.com"
                                    error={fieldErrors.email}
                                    required
                                    autoComplete="email"
                                />

                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                                            Password *
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="text-xs font-semibold text-[var(--accent)] hover:underline"
                                        >
                                            {showPassword ? "Hide" : "Show"}
                                        </button>
                                    </div>

                                    <Input
    label=""
    name="password"
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => {
        setPassword(e.target.value);
        setFieldErrors((current) => ({
            ...current,
            password: undefined,
        }));
        setError("");
    }}
    placeholder="Enter your password"
    error={fieldErrors.password}
    autoComplete="current-password"
/>
                                </div>
                            </div>

                            <div className="mt-3 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                                    className="text-sm font-semibold text-[var(--accent)] hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {error && (
                                <div
                                    className="status-error mt-4 rounded-2xl px-4 py-3 text-sm"
                                    role="alert"
                                    aria-live="polite"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary mt-6 flex w-full items-center justify-center gap-2 px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none"
                            >
                                {loading && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                )}
                                {loading ? "Logging in..." : "Login"}
                            </button>

                            <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
                                Don&apos;t have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate(ROUTES.REGISTER)}
                                    className="font-semibold text-[var(--accent)] hover:underline"
                                >
                                    Register here
                                </button>
                            </p>
                        </form>
                    </section>
                </div>
            </div>
        </main>
    );
}