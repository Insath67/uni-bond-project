import { useState } from "react";
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
        return detail
            .map((item) => item?.msg || item?.message)
            .filter(Boolean)
            .join(", ") || "Validation failed";
    }

    return err instanceof Error ? err.message : "Login failed. Check credentials.";
};

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
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
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });
            const token = res.data.access_token;
            
            const userRes = await apiClient.get("/users/me", {
                headers: { Authorization: `Bearer ${token}` }
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
        <div className="min-h-screen px-4 py-12 flex items-center justify-center">
            <div className="panel-surface w-full max-w-md rounded-[2rem] p-8 sm:p-10">
            <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">UniBond</p>
                <h2 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">Welcome back</h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in with your approved account to continue collaborating with students, universities, and companies.</p>
            </div>
            <div className="flex flex-col gap-4">
                <Input 
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((current) => ({ ...current, email: undefined }));
                        setError("");
                    }}
                    placeholder="you@example.com"
                    error={fieldErrors.email}
                    required
                    autoComplete="email"
                />
                <Input 
                    label="Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((current) => ({ ...current, password: undefined }));
                        setError("");
                    }}
                    placeholder="Enter your password"
                    error={fieldErrors.password}
                    required
                    autoComplete="current-password"
                />
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

            {error && <p className="status-error mt-4">{error}</p>}

            <button onClick={onSubmit} disabled={loading} className="btn-primary px-5 py-3 mt-5 w-full disabled:opacity-50 disabled:transform-none">
                {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm mt-4 text-center text-[var(--text-secondary)]">
                Don't have an account?{" "}
                <button
                    onClick={() => navigate(ROUTES.REGISTER)}
                    className="font-semibold text-[var(--accent)] hover:underline"
                >
                    Register here
                </button>
            </p>
            </div>
        </div>
    );
}
