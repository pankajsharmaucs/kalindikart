'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithOtp, verifyOtp } = useAuth();

  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState('mobile'); // mobile | otp
  const [otp, setOtp] = useState(Array(5).fill(''));
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (step !== 'otp' || timer === 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
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
    // const res = await loginWithOtp(mobile); // API
    setLoading(false);

    // if (res.success) {
    setStep('otp');
    setTimer(60);
    setOtp(Array(5).fill(''));
    setTimeout(() => inputsRef.current[0]?.focus(), 100);
    // } else {
    //   setError(res.message || 'Failed to send OTP');
    // }
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
  // const handleVerifyOtp = async () => {
  //   const otpValue = otp.join('');
  //   if (otpValue.length !== 5) {
  //     setError('Enter complete OTP');
  //     return;
  //   }

  //   setLoading(true);
  //   const res = await verifyOtp({ mobile, otp: otpValue });
  //   setLoading(false);

  //   if (res.success) {
  //     router.push('/checkout');
  //   } else {
  //     setError('Invalid OTP');
  //   }
  // };

  // Mock OTP verification
  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 5) {
      setError('Enter complete OTP');
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate API call
    setLoading(false);

    if (otpValue !== '12345') {
      // Always fail for wrong OTP
      setError('Invalid OTP, but logging in for demo...');
    }

    // Save login to localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userMobile', mobile);

    // Redirect to checkout
    router.push('/checkout');
  };
  
  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = () => {
    setTimer(60);
    setOtp(Array(5).fill(''));
    inputsRef.current[0]?.focus();
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">

          <div className="card shadow-lg border-0 p-4">
            <h3 className="text-center fw-bold text-dark-gold mb-2">
              Login to Continue
            </h3>
            <p className="text-center text-muted small mb-4">
              Secure OTP-based login
            </p>

            {step === 'mobile' && (
              <form onSubmit={handleSendOtp}>
                <label className="fw-semibold mb-2">Mobile Number</label>
                <div className="input-group mb-3">
                  <span className="input-group-text">🇮🇳 +91</span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter mobile number"
                    maxLength="10"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                {error && <p className="text-danger small">{error}</p>}

                <button
                  className="btn btn-primary-gold text-white w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Login with OTP'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <>
                <p className="text-center small text-muted mb-3">
                  OTP sent to <strong>{mobile}</strong>
                </p>

                <div className="d-flex justify-content-center gap-2 mb-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputsRef.current[i] = el)}
                      type="text"
                      className="form-control text-center fw-bold fs-5"
                      style={{ width: '45px', height: '50px' }}
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleKeyDown(e, i)}
                    />
                  ))}
                </div>

                {error && <p className="text-danger small text-center">{error}</p>}

                <button
                  className="btn btn-primary-gold text-white w-100 py-2 fw-semibold"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="text-center mt-3 small">
                  {timer > 0 ? (
                    <span className="text-muted">
                      Resend OTP in <strong>{timer}s</strong>
                    </span>
                  ) : (
                    <button
                      className="btn btn-link text-dark-gold fw-semibold p-0"
                      onClick={handleResendOtp}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
