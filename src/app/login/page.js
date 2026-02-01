'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../stores/cartStore';

/* ----------------------------------------
  OTP & EMAIL LOGIN SERVICES
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

const sendEmailOtp = async (email) => {
  const res = await fetch('/api/user/send-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  return data.success;
};

const verifyEmailOtpApi = async (email, otp) => {
  const res = await fetch('/api/user/verify-email-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  return await res.json();
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { setAuth, syncLocalCartToDB } = useCartStore.getState();

  // Tabs: 'phone' or 'email'
  const [loginTab, setLoginTab] = useState('phone');
  
  // Phone login
  const [mobile, setMobile] = useState('');
  const [phoneStep, setPhoneStep] = useState('mobile');
  const [phoneOtp, setPhoneOtp] = useState(Array(5).fill(''));
  const phoneInputsRef = useRef([]);
  const [phoneTimer, setPhoneTimer] = useState(60);
  
  // Email login
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState('email');
  const [emailOtp, setEmailOtp] = useState(Array(5).fill(''));
  const emailInputsRef = useRef([]);
  const [emailTimer, setEmailTimer] = useState(60);
  
  // General
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* PHONE TIMER */
  useEffect(() => {
    if (phoneStep !== 'otp' || phoneTimer === 0) return;
    const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phoneStep, phoneTimer]);

  /* EMAIL TIMER */
  useEffect(() => {
    if (emailStep !== 'otp' || emailTimer === 0) return;
    const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [emailStep, emailTimer]);

  /* ====== PHONE LOGIN ====== */
  const handleSendPhoneOtp = async (e) => {
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

    setPhoneStep('otp');
    setPhoneTimer(60);
    setPhoneOtp(Array(5).fill(''));
    setTimeout(() => phoneInputsRef.current[0]?.focus(), 100);
  };

  const handlePhoneOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...phoneOtp];
    newOtp[index] = value;
    setPhoneOtp(newOtp);
    if (value && index < 4) {
      phoneInputsRef.current[index + 1]?.focus();
    }
  };

  const handlePhoneKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !phoneOtp[index] && index > 0) {
      phoneInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyPhoneOtp = async () => {
    const otpValue = phoneOtp.join('');
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

    login({ mobile: res.user.mobile, userId: res.user.id });
    setAuth(true, mobile);
    await syncLocalCartToDB();
    router.push('/checkout');
  };

  const handleResendPhoneOtp = async () => {
    setPhoneTimer(60);
    setPhoneOtp(Array(5).fill(''));
    phoneInputsRef.current[0]?.focus();
    await sendOtp(mobile);
  };

  /* ====== EMAIL LOGIN ====== */
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Enter valid email address');
      return;
    }

    setLoading(true);
    const success = await sendEmailOtp(email);
    setLoading(false);

    if (!success) {
      setError('Failed to send OTP');
      return;
    }

    setEmailStep('otp');
    setEmailTimer(60);
    setEmailOtp(Array(5).fill(''));
    setTimeout(() => emailInputsRef.current[0]?.focus(), 100);
  };

  const handleEmailOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);
    if (value && index < 4) {
      emailInputsRef.current[index + 1]?.focus();
    }
  };

  const handleEmailKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
      emailInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyEmailOtp = async () => {
    const otpValue = emailOtp.join('');
    if (otpValue.length !== 5) {
      setError('Enter complete OTP');
      return;
    }

    setLoading(true);
    const res = await verifyEmailOtpApi(email, otpValue);
    setLoading(false);

    if (!res.success) {
      setError('Invalid OTP');
      return;
    }

    login({ email: res.user.email, userId: res.user.id });
    setAuth(true, email);
    await syncLocalCartToDB();
    router.push('/checkout');
  };

  const handleResendEmailOtp = async () => {
    setEmailTimer(60);
    setEmailOtp(Array(5).fill(''));
    emailInputsRef.current[0]?.focus();
    await sendEmailOtp(email);
  };

  return (
    <>
      <div className="kk-login-wrapper">
        <div className="kk-login-container">
          {/* LEFT SIDE - BRANDING */}
          <div className="kk-login-left">
            <div className="kk-branding">
              <h1 className="kk-brand-title">Welcome to KalindiKart</h1>
              <p className="kk-brand-subtitle">
                Discover premium handcrafted products curated just for you
              </p>
              <div className="kk-features">
                <div className="kk-feature">
                  <i className="fas fa-shield-alt"></i>
                  <div>
                    <h6>100% Secure</h6>
                    <p>OTP-based authentication</p>
                  </div>
                </div>
                <div className="kk-feature">
                  <i className="fas fa-truck"></i>
                  <div>
                    <h6>Fast Delivery</h6>
                    <p>Quick shipping across India</p>
                  </div>
                </div>
                <div className="kk-feature">
                  <i className="fas fa-award"></i>
                  <div>
                    <h6>Premium Quality</h6>
                    <p>Handpicked artisan products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="kk-login-right">
            <div className="kk-login-card">
              {/* TABS */}
              <div className="kk-login-tabs">
                <button
                  className={`kk-tab ${loginTab === 'phone' ? 'active' : ''}`}
                  onClick={() => {
                    setLoginTab('phone');
                    setError('');
                  }}
                >
                  <i className="fas fa-mobile-alt"></i> Phone
                </button>
                <button
                  className={`kk-tab ${loginTab === 'email' ? 'active' : ''}`}
                  onClick={() => {
                    setLoginTab('email');
                    setError('');
                  }}
                >
                  <i className="fas fa-envelope"></i> Email
                </button>
              </div>

              {/* PHONE TAB */}
              {loginTab === 'phone' && (
                <>
                  <div className="kk-login-header">
                    <h2>Login with Phone</h2>
                    <p><i className="fas fa-lock me-2"></i>Secure OTP-based login</p>
                  </div>

                  {phoneStep === 'mobile' && (
                    <form onSubmit={handleSendPhoneOtp} className="kk-form">
                      <div className="kk-form-group">
                        <label><i className="fas fa-mobile-alt me-2"></i>Mobile Number</label>
                        <div className="kk-phone-input-wrapper">
                          <span className="kk-country-code">
                            <img src="https://flagcdn.com/w40/in.png" alt="IN" width="20" />
                            +91
                          </span>
                          <input
                            type="tel"
                            className="kk-phone-input"
                            placeholder="Enter 10-digit number"
                            maxLength="10"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                          />
                        </div>
                        {error && <div className="kk-error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
                      </div>

                      <button type="submit" className="kk-btn-submit" disabled={loading || mobile.length !== 10}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                        ) : (
                          <><i className="fas fa-paper-plane me-2"></i>Send OTP</>
                        )}
                      </button>

                      <div className="kk-divider"><span>OR</span></div>
                      <div className="kk-info-box">
                        <i className="fas fa-info-circle"></i>
                        <span>You'll receive a 5-digit OTP on your mobile</span>
                      </div>
                    </form>
                  )}

                  {phoneStep === 'otp' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyPhoneOtp(); }} className="kk-form">
                      <button type="button" className="kk-btn-back" onClick={() => setPhoneStep('mobile')}>
                        <i className="fas fa-arrow-left me-2"></i>Change Number
                      </button>

                      <div className="kk-otp-info">
                        <i className="fas fa-mobile-alt"></i>
                        <p>OTP sent to <strong>+91 {mobile}</strong></p>
                      </div>

                      <div className="kk-form-group">
                        <label>Enter 5-Digit OTP</label>
                        <div className="kk-otp-inputs">
                          {phoneOtp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => (phoneInputsRef.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              className="kk-otp-input"
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handlePhoneOtpChange(e.target.value, i)}
                              onKeyDown={(e) => handlePhoneKeyDown(e, i)}
                            />
                          ))}
                        </div>
                        {error && <div className="kk-error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
                      </div>

                      <button type="submit" className="kk-btn-submit" disabled={loading || phoneOtp.join('').length !== 5}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
                        ) : (
                          <><i className="fas fa-check-circle me-2"></i>Verify & Continue</>
                        )}
                      </button>

                      <div className="kk-resend">
                        {phoneTimer > 0 ? (
                          <p><i className="far fa-clock me-2"></i>Resend in <span>{phoneTimer}s</span></p>
                        ) : (
                          <button type="button" className="kk-btn-resend" onClick={handleResendPhoneOtp}>
                            <i className="fas fa-redo me-2"></i>Resend OTP
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* EMAIL TAB */}
              {loginTab === 'email' && (
                <>
                  <div className="kk-login-header">
                    <h2>Login with Email</h2>
                    <p><i className="fas fa-lock me-2"></i>Secure OTP-based login</p>
                  </div>

                  {emailStep === 'email' && (
                    <form onSubmit={handleSendEmailOtp} className="kk-form">
                      <div className="kk-form-group">
                        <label><i className="fas fa-envelope me-2"></i>Email Address</label>
                        <input
                          type="email"
                          className="kk-email-input"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoFocus
                        />
                        {error && <div className="kk-error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
                      </div>

                      <button type="submit" className="kk-btn-submit" disabled={loading || !email.includes('@')}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                        ) : (
                          <><i className="fas fa-paper-plane me-2"></i>Send OTP</>
                        )}
                      </button>

                      <div className="kk-divider"><span>OR</span></div>
                      <div className="kk-info-box">
                        <i className="fas fa-info-circle"></i>
                        <span>You'll receive a 5-digit OTP in your email</span>
                      </div>
                    </form>
                  )}

                  {emailStep === 'otp' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleVerifyEmailOtp(); }} className="kk-form">
                      <button type="button" className="kk-btn-back" onClick={() => setEmailStep('email')}>
                        <i className="fas fa-arrow-left me-2"></i>Change Email
                      </button>

                      <div className="kk-otp-info">
                        <i className="fas fa-envelope"></i>
                        <p>OTP sent to <strong>{email}</strong></p>
                      </div>

                      <div className="kk-form-group">
                        <label>Enter 5-Digit OTP</label>
                        <div className="kk-otp-inputs">
                          {emailOtp.map((digit, i) => (
                            <input
                              key={i}
                              ref={(el) => (emailInputsRef.current[i] = el)}
                              type="text"
                              inputMode="numeric"
                              className="kk-otp-input"
                              maxLength="1"
                              value={digit}
                              onChange={(e) => handleEmailOtpChange(e.target.value, i)}
                              onKeyDown={(e) => handleEmailKeyDown(e, i)}
                            />
                          ))}
                        </div>
                        {error && <div className="kk-error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
                      </div>

                      <button type="submit" className="kk-btn-submit" disabled={loading || emailOtp.join('').length !== 5}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Verifying...</>
                        ) : (
                          <><i className="fas fa-check-circle me-2"></i>Verify & Continue</>
                        )}
                      </button>

                      <div className="kk-resend">
                        {emailTimer > 0 ? (
                          <p><i className="far fa-clock me-2"></i>Resend in <span>{emailTimer}s</span></p>
                        ) : (
                          <button type="button" className="kk-btn-resend" onClick={handleResendEmailOtp}>
                            <i className="fas fa-redo me-2"></i>Resend OTP
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* FOOTER */}
              <div className="kk-login-footer">
                <p><i className="fas fa-shield-alt me-2"></i>Your information is safe and secure</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .kk-login-wrapper {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.50rem;
        }

        .kk-login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          max-width: 1200px;
          gap: 0;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
          background: white;
        }

        /* LEFT SIDE */
        .kk-login-left {
          background: linear-gradient(135deg, #ffffff 0%, #e6e9f0 100%);
          // color: white;
          padding: 4rem 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .kk-login-left::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 500px;
          height: 500px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }

        .kk-branding {
          position: relative;
          z-index: 1;
        }


        .kk-brand-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .kk-brand-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 3rem;
        }

        .kk-features {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .kk-feature {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .kk-feature i {
          font-size: 2.5rem;
          opacity: 0.9;
        }

        .kk-feature h6 {
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
        }

        .kk-feature p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        /* RIGHT SIDE */
        .kk-login-right {
          padding: 3rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .kk-login-card {
          width: 100%;
          max-width: 450px;
        }

        /* TABS */
        .kk-login-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .kk-tab {
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          color: #666;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.95rem;
        }

        .kk-tab:hover {
          border-color: #178ad6;
        }

        .kk-tab.active {
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border-color: transparent;
        }

        /* HEADER */
        .kk-login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .kk-login-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .kk-login-header p {
          color: #178ad6;
          font-weight: 500;
          margin: 0;
          font-size: 0.95rem;
        }

        /* FORM */
        .kk-form {
          margin-top: 2rem;
        }

        .kk-form-group {
          margin-bottom: 1.5rem;
        }

        .kk-form-group label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        /* PHONE INPUT */
        .kk-phone-input-wrapper {
          display: flex;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .kk-phone-input-wrapper:focus-within {
          border-color: #178ad6;
          box-shadow: 0 0 0 4px rgba(23, 138, 214, 0.1);
        }

        .kk-country-code {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 1rem;
          background: #f8f9fa;
          font-weight: 600;
          border-right: 2px solid #e0e0e0;
        }

        .kk-phone-input,
        .kk-email-input {
          border: none;
          padding: 0.875rem 1rem;
          font-size: 1rem;
          width: 100%;
          // border: 2px solid #e0e0e0;
          // border-radius: 12px;
          transition: all 0.3s ease;
        }

        .kk-email-input:focus {
          outline: none;
          border-color: #178ad6;
          box-shadow: 0 0 0 4px rgba(23, 138, 214, 0.1);
        }

        .kk-phone-input:focus {
          outline: none;
          box-shadow: none;
        }

        /* OTP INPUTS */
        .kk-otp-inputs {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }

        .kk-otp-input {
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

        .kk-otp-input:focus {
          outline: none;
          border-color: #178ad6;
          box-shadow: 0 0 0 4px rgba(23, 138, 214, 0.1);
        }

        /* BUTTONS */
        .kk-btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .kk-btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #1577b8, #20a5b3);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(23, 138, 214, 0.3);
        }

        .kk-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .kk-btn-back {
          background: transparent;
          border: 2px solid #e0e0e0;
          color: #666;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .kk-btn-back:hover {
          border-color: #178ad6;
          color: #178ad6;
          background: rgba(23, 138, 214, 0.05);
        }

        .kk-btn-resend {
          background: transparent;
          border: none;
          color: #178ad6;
          font-weight: 600;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .kk-btn-resend:hover {
          background: rgba(23, 138, 214, 0.1);
        }

        /* INFO BOXES */
        .kk-otp-info {
          background: linear-gradient(135deg, #e3f2fd, #e8f5e9);
          border-left: 4px solid #178ad6;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .kk-otp-info i {
          font-size: 1.5rem;
          color: #178ad6;
        }

        .kk-otp-info p {
          margin: 0;
          color: #333;
          font-size: 0.9rem;
        }

        .kk-info-box {
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

        .kk-info-box i {
          color: #178ad6;
        }

        /* DIVIDER */
        .kk-divider {
          text-align: center;
          margin: 1.5rem 0;
          position: relative;
        }

        .kk-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e0e0e0;
        }

        .kk-divider span {
          background: white;
          padding: 0 1rem;
          position: relative;
          color: #999;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* RESEND */
        .kk-resend {
          text-align: center;
          margin-top: 1.5rem;
        }

        .kk-resend p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }

        .kk-resend span {
          color: #178ad6;
          font-weight: 700;
        }

        /* ERROR */
        .kk-error {
          color: #dc3545;
          font-size: 0.85rem;
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
        }

        /* FOOTER */
        .kk-login-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e0e0e0;
        }

        .kk-login-footer p {
          color: #999;
          font-size: 0.85rem;
          margin: 0;
        }

        /* RESPONSIVE */
        @media (max-width: 991px) {
          .kk-login-container {
            grid-template-columns: 1fr;
          }

          .kk-login-left {
            display: none;
          }

          .kk-login-card {
            max-width: 100%;
          }
        }

        @media (max-width: 576px) {
          .kk-login-wrapper {
            padding: 0;
          }

          .kk-login-container {
            border-radius: 0;
          }

          .kk-login-right {
            padding: 2rem 1rem;
          }

          .kk-login-card {
            max-width: 100%;
          }

          .kk-otp-input {
            width: 44px;
            height: 44px;
            font-size: 1.25rem;
          }

          .kk-login-tabs {
            gap: 0.5rem;
          }

          .kk-tab {
            padding: 0.5rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}
