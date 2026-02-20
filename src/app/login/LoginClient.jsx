'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCartStore } from '../../stores/cartStore';
import "./login.css"

/* =======================
   OTP & LOGIN SERVICES
======================= */
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

const sendEmailOtpApi = async (email) => {
  const res = await fetch('/api/user/login-email-otp', {
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

/* =======================
   OTP HANDLER HELPERS
======================= */
const handleOtpChange = (value, index, otpArr, setOtpArr, ref) => {
  if (!/^\d?$/.test(value)) return;
  const newOtp = [...otpArr];
  newOtp[index] = value;
  setOtpArr(newOtp);
  if (value && index < otpArr.length - 1) {
    ref.current[index + 1]?.focus();
  }
};

const handleOtpKeyDown = (e, index, otpArr, ref) => {
  if (e.key === 'Backspace' && !otpArr[index] && index > 0) {
    ref.current[index - 1]?.focus();
  }
};

/* =======================
   LOGIN PAGE
======================= */
export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const { setAuth, syncLocalCartToDB } = useCartStore.getState();

  /* ---------- STATE ---------- */
  const [loginTab, setLoginTab] = useState('phone');

  // PHONE
  const [mobile, setMobile] = useState('');
  const [phoneStep, setPhoneStep] = useState('mobile');
  const [phoneOtp, setPhoneOtp] = useState(Array(5).fill(''));
  const phoneInputsRef = useRef([]);
  const [phoneTimer, setPhoneTimer] = useState(60);

  // EMAIL
  const [email, setEmail] = useState('pspankajsharma222@gmail.com');
  const [emailStep, setEmailStep] = useState('email');
  const [emailOtp, setEmailOtp] = useState(Array(5).fill(''));
  const emailInputsRef = useRef([]);
  const [emailTimer, setEmailTimer] = useState(60);

  // GENERAL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------- TIMERS ---------- */
  useEffect(() => {
    if (phoneStep !== 'otp' || phoneTimer === 0) return;
    const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [phoneStep, phoneTimer]);

  useEffect(() => {
    if (emailStep !== 'otp' || emailTimer === 0) return;
    const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [emailStep, emailTimer]);

  /* ---------- PHONE HANDLERS ---------- */
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


  /* ---------- PHONE HANDLERS ---------- */
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

    // 1. Save to AuthContext (Internal state)
    login({ mobile: res.user.mobile, userId: res.user.id });

    // 2. Save to CartStore & LocalStorage
    // We use the mobile number as the unique 'auth identifier'
    setAuth(true, res.user.mobile);
    localStorage.setItem('userMobile', res.user.mobile);
    localStorage.removeItem('userEmail'); // Clean up email if logging in with phone

    await syncLocalCartToDB();
    router.push(redirect || '/');
  };

  /* ---------- EMAIL HANDLERS ---------- */
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

    // 1. Save to AuthContext
    login({ email: res.user.email, userId: res.user.id });

    // 2. Save to CartStore & LocalStorage
    // We use the email as the unique 'auth identifier'
    setAuth(true, res.user.email);
    localStorage.setItem('userEmail', res.user.email);
    localStorage.removeItem('userMobile'); // Clean up mobile if logging in with email

    await syncLocalCartToDB();
    router.push(redirect || '/');
  };

  /* ---------- EMAIL HANDLERS ---------- */
  const handleSendEmailOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter valid email address');
      return;
    }
    setLoading(true);
    const success = await sendEmailOtpApi(email);
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


  const handleResendEmailOtp = async () => {
    setEmailTimer(60);
    setEmailOtp(Array(5).fill(''));
    emailInputsRef.current[0]?.focus();
    await sendEmailOtpApi(email);
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
                              onChange={(e) =>
                                handleOtpChange(e.target.value, i, phoneOtp, setPhoneOtp, phoneInputsRef)
                              }
                              onKeyDown={(e) =>
                                handleOtpKeyDown(e, i, phoneOtp, phoneInputsRef)
                              }
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


                    </form>
                  )}

                  {emailStep === 'otp' && (
                    <form className="kk-form" onSubmit={e => { e.preventDefault(); handleVerifyEmailOtp(); }}>
                      <button type="button" className="kk-btn-back" onClick={() => setEmailStep('email')}>← Change Email</button>
                      <div className="kk-otp-info">OTP sent to {email}</div>
                      <div className="kk-otp-inputs">
                        {emailOtp.map((d, i) => (
                          <input key={i} ref={el => emailInputsRef.current[i] = el} maxLength="1"
                            className="kk-otp-input"
                            value={d}
                            onChange={e => handleOtpChange(e.target.value, i, emailOtp, setEmailOtp, emailInputsRef)}
                            onKeyDown={e => handleOtpKeyDown(e, i, emailOtp, emailInputsRef)}
                          />
                        ))}
                      </div>
                      {error && <div className="kk-error">{error}</div>}
                      <button className="kk-btn-submit">{loading ? 'Verifying...' : 'Verify & Continue'}</button>
                      <div className="kk-resend">
                        {emailTimer > 0 ? `Resend in ${emailTimer}s` : <button onClick={handleResendEmailOtp}>Resend OTP</button>}
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
        </div >
      </div >

      
    </>
  );
}
