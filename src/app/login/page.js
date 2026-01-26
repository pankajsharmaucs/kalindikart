'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../stores/cartStore';

/* ----------------------------------------
   TEMP MOCK SERVICES (replace later)
---------------------------------------- */
const sendOtp = async (mobile) => {
  const res = await fetch('/api/user/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile }),
  });

  const data = await res.json();
  return data.success;
};

const verifyOtpApi = async (mobile, otp) => {
  const res = await fetch('/api/user/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, otp }),
  });

  return await res.json();
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { setAuth, syncLocalCartToDB } = useCartStore.getState();

  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState('mobile');
  const [otp, setOtp] = useState(Array(5).fill(''));
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (step !== 'otp' || timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  /* ---------------- SEND OTP ---------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    const success = await sendOtp(mobile);
    setLoading(false);

    if (!success) {
      setError('Failed to send OTP');
      return;
    }

    setStep('otp');
    setTimer(60);
    setOtp(Array(5).fill(''));
    setTimeout(() => inputsRef.current[0]?.focus(), 100);
  };

  /* ---------------- OTP INPUT ---------------- */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 4) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 5) {
      setError('Enter complete OTP');
      return;
    }

    setLoading(true);
    const res = await verifyOtpApi(mobile, otpValue);
    setLoading(false);

    if (!res.success) {
      setError('Invalid OTP');
      return;
    }

    // ✅ FINAL LOGIN
    login({
      mobile: res.user.mobile,
      userId: res.user.id,
    });

    setAuth(true, mobile); // mobile = user_id
    await syncLocalCartToDB();

    router.push('/checkout');
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = async () => {
    setTimer(60);
    setOtp(Array(5).fill(''));
    inputsRef.current[0]?.focus();
    await sendOtp(mobile);
  };

  return (
    <>
      <div className="login-page-wrapper">
        <div className="container-fluid">
          <div className="row min-vh-100">
            {/* Left Side - Branding */}
            <div className="col-lg-6 d-none d-lg-flex login-left-side">
              <div className="branding-content">
                <div className="brand-logo mb-4">
                  <img src="/main/kalindikart_logo.png" alt="KalindiKart" />
                </div>
                <h1 className="brand-title">Welcome to KalindiKart</h1>
                <p className="brand-subtitle">
                  Discover premium handcrafted products curated just for you
                </p>
                <div className="features-list mt-5">
                  <div className="feature-item">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                      <h6>100% Secure</h6>
                      <p>OTP-based authentication</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-truck"></i>
                    <div>
                      <h6>Fast Delivery</h6>
                      <p>Quick shipping across India</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-award"></i>
                    <div>
                      <h6>Premium Quality</h6>
                      <p>Handpicked artisan products</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="col-lg-6 d-flex align-items-center justify-content-center login-right-side">
              <div className="login-form-container">
                {/* Mobile Logo */}
                <div className="d-lg-none text-center mb-4">
                  <img src="/main/kalindikart_logo.png" alt="KalindiKart" style={{ height: '60px' }} />
                </div>

                <div className="login-card">
                  {/* Header */}
                  <div className="login-header">
                    <h2 className="login-title">Login to Continue</h2>
                    <p className="login-subtitle">
                      <i className="fas fa-lock me-2"></i>Secure OTP-based login
                    </p>
                  </div>

                  {/* Mobile Number Step */}
                  {step === 'mobile' && (
                    <form onSubmit={handleSendOtp} className="login-form">
                      <div className="form-group">
                        <label className="form-label">
                          <i className="fas fa-mobile-alt me-2"></i>Mobile Number
                        </label>
                        <div className="mobile-input-wrapper">
                          <span className="country-code">
                            <img src="https://flagcdn.com/w40/in.png" alt="IN" width="24" />
                            +91
                          </span>
                          <input
                            type="tel"
                            className="form-control mobile-input"
                            placeholder="Enter your 10-digit mobile number"
                            maxLength="10"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                          />
                        </div>
                        {error && (
                          <div className="error-message">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading || mobile.length !== 10}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Send OTP
                          </>
                        )}
                      </button>

                      <div className="divider">
                        <span>OR</span>
                      </div>

                      <div className="info-box">
                        <i className="fas fa-info-circle"></i>
                        <span>You'll receive a 5-digit OTP on your mobile number</span>
                      </div>
                    </form>
                  )}

                  {/* OTP Verification Step */}
                  {step === 'otp' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="login-form">
                      <button
                        type="button"
                        className="btn-back"
                        onClick={() => setStep('mobile')}
                      >
                        <i className="fas fa-arrow-left me-2"></i>Change Number
                      </button>

                      <div className="otp-info-box">
                        <i className="fas fa-mobile-alt"></i>
                        <p>
                          OTP sent to <strong>+91 {mobile}</strong>
                        </p>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Enter 5-Digit OTP</label>
                        <div className="otp-inputs">
                          {otp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => (inputsRef.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              className="otp-input"
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleOtpChange(e.target.value, i)}
                              onKeyDown={(e) => handleKeyDown(e, i)}
                            />
                          ))}
                        </div>
                        {error && (
                          <div className="error-message">
                            <i className="fas fa-exclamation-circle me-2"></i>
                            {error}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="btn-submit"
                        disabled={loading || otp.join('').length !== 5}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Verifying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check-circle me-2"></i>
                            Verify & Continue
                          </>
                        )}
                      </button>

                      <div className="resend-section">
                        {timer > 0 ? (
                          <p className="timer-text">
                            <i className="far fa-clock me-2"></i>
                            Resend OTP in <span className="timer-count">{timer}s</span>
                          </p>
                        ) : (
                          <button type="button" className="btn-resend" onClick={handleResendOtp}>
                            <i className="fas fa-redo me-2"></i>
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </form>
                  )}

                  {/* Footer */}
                  <div className="login-footer">
                    <p>
                      <i className="fas fa-shield-alt me-2"></i>
                      Your information is safe and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* ============= PAGE WRAPPER ============= */
        .login-page-wrapper {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        /* ============= LEFT SIDE - BRANDING ============= */
        .login-left-side {
          background: linear-gradient(135deg, #178ad6 0%, #27bbc9 100%);
          color: white;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .login-left-side::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 500px;
          height: 500px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .branding-content {
          position: relative;
          z-index: 1;
          max-width: 500px;
          margin: auto;
        }

        .brand-logo img {
          height: 80px;
          filter: brightness(0) invert(1);
        }

        .brand-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .brand-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .feature-item i {
          font-size: 2.5rem;
          opacity: 0.9;
        }

        .feature-item h6 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .feature-item p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
        }

        /* ============= RIGHT SIDE - FORM ============= */
        .login-right-side {
          padding: 2rem;
          background: white;
        }

        .login-form-container {
          width: 100%;
          max-width: 480px;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          color: #178ad6;
          font-size: 0.95rem;
          font-weight: 500;
          margin: 0;
        }

        /* Form */
        .login-form {
          margin-top: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        /* Mobile Input */
        .mobile-input-wrapper {
          display: flex;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .mobile-input-wrapper:focus-within {
          border-color: #178ad6;
          box-shadow: 0 0 0 4px rgba(23, 138, 214, 0.1);
        }

        .country-code {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          border-right: 2px solid #e0e0e0;
        }

        .mobile-input {
          border: none;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          flex: 1;
        }

        .mobile-input:focus {
          outline: none;
          box-shadow: none;
        }

        /* OTP Inputs */
        .otp-inputs {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .otp-input {
          width: 56px;
          height: 56px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          transition: all 0.3s ease;
        }

        .otp-input:focus {
          outline: none;
          border-color: #178ad6;
          box-shadow: 0 0 0 4px rgba(23, 138, 214, 0.1);
        }

        /* Submit Button */
        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #1577b8, #20a5b3);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(23, 138, 214, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Back Button */
        .btn-back {
          background: transparent;
          border: 2px solid #e0e0e0;
          color: #666;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .btn-back:hover {
          border-color: #178ad6;
          color: #178ad6;
          background: rgba(23, 138, 214, 0.05);
        }

        /* Info Boxes */
        .otp-info-box {
          background: linear-gradient(135deg, #e3f2fd, #e8f5e9);
          border-left: 4px solid #178ad6;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .otp-info-box i {
          font-size: 1.5rem;
          color: #178ad6;
        }

        .otp-info-box p {
          margin: 0;
          color: #333;
          font-size: 0.9rem;
        }

        .info-box {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: #666;
        }

        .info-box i {
          color: #178ad6;
        }

        /* Divider */
        .divider {
          text-align: center;
          margin: 1.5rem 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e0e0e0;
        }

        .divider span {
          background: white;
          padding: 0 1rem;
          position: relative;
          color: #999;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Resend Section */
        .resend-section {
          text-align: center;
          margin-top: 1.5rem;
        }

        .timer-text {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .timer-count {
          color: #178ad6;
          font-weight: 700;
        }

        .btn-resend {
          background: transparent;
          border: none;
          color: #178ad6;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.95rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .btn-resend:hover {
          background: rgba(23, 138, 214, 0.1);
        }

        /* Error Message */
        .error-message {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
        }

        /* Footer */
        .login-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .login-footer p {
          color: #999;
          font-size: 0.85rem;
          margin: 0;
        }

        /* ============= RESPONSIVE ============= */
        @media (max-width: 991px) {
          .login-card {
            padding: 2rem 1.5rem;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .otp-input {
            width: 48px;
            height: 48px;
            font-size: 1.25rem;
          }
        }

        @media (max-width: 576px) {
          .login-right-side {
            padding: 1rem;
          }

          .login-card {
            padding: 1.5rem 1rem;
            box-shadow: none;
          }

          .otp-input {
            width: 44px;
            height: 44px;
          }

          .brand-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
}
