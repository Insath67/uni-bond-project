import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
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

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ForgotPasswordFieldErrors>({});

  const onSubmit = async () => {
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
      email,
      mobile,
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
    <div className="min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="panel-surface w-full max-w-lg rounded-[2rem] p-8 sm:p-10">
        <button
          type="button"
          onClick={() => navigate(ROUTES.LOGIN)}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">UniBond</p>
          <h2 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">Forgot password</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Verify your account using your registered email address and mobile number,
            then set a new password to regain access.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-elevated)] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--brand-soft)] p-2 text-[var(--brand)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-[var(--text-primary)]">Account verification</p>
              <p className="text-[var(--text-secondary)]">
                Use the same mobile number that you entered when you registered your UniBond account.
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
              setFieldErrors((current) => ({ ...current, email: undefined }));
              setError("");
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
              setFieldErrors((current) => ({ ...current, mobile: undefined }));
              setError("");
            }}
            placeholder="07XXXXXXXX"
            error={fieldErrors.mobile}
            hint="Enter the mobile number you used when creating your account."
            required
            autoComplete="tel"
          />

          <Input
            label="New Password"
            name="forgot-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setFieldErrors((current) => ({ ...current, newPassword: undefined }));
              setError("");
            }}
            placeholder="Enter your new password"
            error={fieldErrors.newPassword}
            hint="Use at least 8 characters."
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm New Password"
            name="forgot-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setFieldErrors((current) => ({ ...current, confirmPassword: undefined }));
              setError("");
            }}
            placeholder="Confirm your new password"
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
          />
        </div>

        {error ? <p className="status-error mt-4">{error}</p> : null}

        {successMessage ? (
          <div className="status-success mt-4">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="btn-primary mt-5 w-full px-5 py-3 disabled:opacity-50 disabled:transform-none"
        >
          <KeyRound className="h-4 w-4" />
          {loading ? "Updating password..." : "Reset password"}
        </button>

        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
          Remembered your password?{" "}
          <button
            type="button"
            onClick={() => navigate(ROUTES.LOGIN)}
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  );
}
