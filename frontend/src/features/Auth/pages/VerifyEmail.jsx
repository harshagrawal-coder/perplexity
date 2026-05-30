import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import "./VerifyEmail.scss";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing. Please check your email link.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/verify-email?token=${token}`
        );

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(response.data.message || "Verification failed.");
        }
      } catch (error) {
        setStatus("error");
        const errorMsg = error.response?.data?.message || "Something went wrong. Please try again.";
        setMessage(errorMsg);
      }
    };

    verifyEmail();
  }, [token, navigate]);

  if (status === "loading") {
    return (
      <div className="verify-page">
        <div className="verify-page__container">
          <div className="verify-page__spinner" />
          <p className="verify-page__message">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-page">
      <div className="verify-page__container">
        {status === "success" ? (
          <>
            <div className="verify-page__icon verify-page__icon--success">✓</div>
            <h1 className="verify-page__title">Email Verified!</h1>
            <p className="verify-page__message">{message}</p>
            <p className="verify-page__redirect">Redirecting to login...</p>
            <Link to="/login" className="verify-page__button">
              Go to Login
            </Link>
          </> 
        ) : (
          <>
            <div className="verify-page__icon verify-page__icon--error">✕</div>
            <h1 className="verify-page__title">Verification Failed</h1>
            <p className="verify-page__message">{message}</p>
            <Link to="/register" className="verify-page__button">
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
