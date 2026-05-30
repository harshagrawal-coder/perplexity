import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useSelector, useDispatch } from "react-redux";
import { clearError } from "../auth.slice";
import "./Register.scss";
import AuthLayout from "../components/AuthLayout";
import AuthInput from "../components/AuthInput";

const registerFeatures = [
  "Invite your team into a bold, modern workspace that feels intentionally designed.",
  "Track research, prompts, and deliverables without losing visual clarity.",
  "Use a cleaner onboarding surface that already looks product-ready.",
];

const Register = () => {
  const dispatch = useDispatch();
  const { register, loading, error } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    else if (formData.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!agreed) newErrors.agreed = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const response = await register(formData);
      navigate("/login", {
        state: {
          email: formData.email,
          registrationMessage: response.message,
          verificationEmailSent: response.verificationEmailSent,
        },
      });
    } catch {
      // error handled by redux
    }
  };
 
  return (
    <AuthLayout
      pageClassName="register-page"
      eyebrow="Create account"
      title="Build your new command center"
      description="Start with a polished onboarding screen that feels fast, premium, and alive."
      alternateLabel="Already have an account?"
      alternateTo="/login"
      alternateCta="Sign in"
      sideLabel="Launch Faster"
      sideTitle="Turn first-time visitors into engaged users with a memorable entry point."
      sideText="The register page mirrors the login experience while adding its own onboarding energy, clear hierarchy, and standout visuals."
      features={registerFeatures}
      highlights={[
        { value: "2 min", label: "Average setup time" },
        { value: "Secure", label: "Protected account flow" },
        { value: "Fluid", label: "Responsive on all screens" },
      ]}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-form__api-error">{error}</div>}
        <AuthInput
          label="Username"
          name="username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
        />

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
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>I agree to the terms and privacy policy.</span>
        </label>
        {errors.agreed && (
          <span className="auth-field__error">{errors.agreed}</span>
        )}

        <button className="auth-button" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
