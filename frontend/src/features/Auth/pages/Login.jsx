import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";
import "./Login.scss";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import { authService } from "../services/auth.services";
const loginFeatures = [
  "Continue work with a distraction-free dashboard built for speed.",
  "Keep conversations, prompts, and saved findings in one flowing workspace.",
  "Get a premium feel with responsive panels, motion, and strong contrast.",
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { loading, error, initialized, user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [verificationMessage, setVerificationMessage] = useState(
    location.state?.registrationMessage || "",
  );
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({
        ...prev,
        email: prev.email || location.state.email,
      }));
    }

    if (location.state?.registrationMessage) {
      setVerificationMessage(location.state.registrationMessage);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setResendError("");
    setResendMessage("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(formData);
      navigate("/");
    } catch {
      // error handled by redux
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setErrors((prev) => ({ ...prev, email: "Email is required to resend verification" }));
      return;
    }

    try {
      setResendLoading(true);
      setResendError("");
      const response = await authService.resendVerificationEmail(formData.email);
      setResendMessage(response.message);
      setVerificationMessage("");
    } catch (resendError) {
      setResendError(resendError.message || "Unable to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const shouldShowResendAction =
    error?.toLowerCase().includes("not verified") ||
    location.state?.verificationEmailSent === false;

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#08111d]">
        <div className="animate-spin w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AuthLayout
      pageClassName="login-page"
      eyebrow="Welcome back"
      title="Sign in to your workspace"
      description="Pick up exactly where you left off with a focused, animated experience."
      alternateLabel="New here?"
      alternateTo="/register"
      alternateCta="Create an account"
      sideLabel="Perplexity Workspace"
      sideTitle="Search, think, and ship from one sleek control room."
      sideText="A cinematic auth experience with ambient motion, layered depth, and a stronger first impression for your product."
      features={loginFeatures}
      highlights={[
        { value: "12k+", label: "Ideas organized weekly" },
        { value: "3x", label: "Faster research handoff" },
        { value: "Live", label: "Motion-rich interface" },
      ]}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {verificationMessage && (
          <div className="auth-form__api-success">{verificationMessage}</div>
        )}
        {error && <div className="auth-form__api-error">{error}</div>}
        {resendError && <div className="auth-form__api-error">{resendError}</div>}
        {resendMessage && (
          <div className="auth-form__api-success">{resendMessage}</div>
        )}
        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-form__meta">
          <label className="auth-checkbox">
            <input type="checkbox" />
            <span>Keep me signed in</span>
          </label>
        </div>

        {shouldShowResendAction && (
          <button
            className="auth-button auth-button--ghost"
            type="button"
            onClick={handleResendVerification}
            disabled={resendLoading}
          >
            {resendLoading ? "Sending verification..." : "Resend verification email"}
          </button>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
