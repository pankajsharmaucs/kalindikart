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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card shadow-lg border-0 p-4">

            <h3 className="text-center fw-bold mb-2">Login to Continue</h3>
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
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ''))
                    }
                  />
                </div>

                {error && <p className="text-danger small">{error}</p>}

                <button
                  className="btn btn-primary-gold w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? 'Sending OTP...' : 'Login with OTP'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp();
                }}
              >
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

                {error && (
                  <p className="text-danger small text-center">{error}</p>
                )}

                <button
                  type="submit" 
                  className="btn btn-primary-gold w-100 py-2 fw-semibold"
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
                      type="button"
                      className="btn btn-link fw-semibold p-0"
                      onClick={handleResendOtp}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
