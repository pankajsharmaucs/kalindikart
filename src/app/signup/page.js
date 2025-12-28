// app/signup/page.jsx
'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSignup = useCallback(async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!name || !email || !password || !confirmPassword) {
            setError('All fields are required.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Signup successful! You can now login.');
        } catch (err) {
            setError('A network error occurred during signup.');
        } finally {
            setLoading(false);
        }
    }, [name, email, password, confirmPassword]);

    return (
        <div className="signup-page">
            <div className="signup-wrapper">
                <header className="text-center mb-4">
                    <i className="bi bi-person-plus-fill display-4 text-primary-gold mb-2"></i>
                    <h1 className="h4 fw-bold text-dark-gold mb-1">Create Account</h1>
                    <p className="text-muted small">Fill in the details to sign up</p>
                </header>

                <div className="signup-card shadow-lg p-4 p-md-5 rounded-4">
                    {error && (
                        <div className="alert alert-danger small mb-3" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
                        </div>
                    )}

                    <form onSubmit={handleSignup}>
                        <div className="mb-3">
                            <label htmlFor="nameInput" className="form-label fw-semibold text-dark-gold small-label">Full Name</label>
                            <input
                                type="text"
                                id="nameInput"
                                placeholder="Your Name"
                                className="form-control form-control-md"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label fw-semibold text-dark-gold small-label">Email Address</label>
                            <input
                                type="email"
                                id="emailInput"
                                placeholder="name@example.com"
                                className="form-control form-control-md"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="passwordInput" className="form-label fw-semibold text-dark-gold small-label">Password</label>
                            <input
                                type="password"
                                id="passwordInput"
                                placeholder="Enter password"
                                className="form-control form-control-md"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="confirmPasswordInput" className="form-label fw-semibold text-dark-gold small-label">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPasswordInput"
                                placeholder="Confirm password"
                                className="form-control form-control-md"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="d-grid mb-3">
                            <button type="submit" className="btn btn-primary-gold text-white btn-md" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Signing Up...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-person-plus-fill me-2"></i>
                                        Create Account
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center small">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-gold fw-bold text-decoration-none hover-dark-gold">
                                Login Here
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            <style jsx global>{`
               

                .signup-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                }

                .signup-wrapper {
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }

                .signup-card {
                    background: var(--white-alpha);
                    backdrop-filter: blur(10px);
                    border-radius: 2rem;
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .signup-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                }

                .text-primary-gold { color: var(--primary-gold) !important; }
                .text-dark-gold { color: var(--dark-gold) !important; }
                .hover-dark-gold:hover { color: var(--dark-gold) !important; }

                /* Button */
                .btn-primary-gold {
                    background-color: var(--primary-gold);
                    border-color: var(--primary-gold);
                    font-weight: 600;
                    padding: 0.5rem 1rem;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                }
                .btn-primary-gold:hover {
                    background-color: var(--dark-gold);
                    border-color: var(--dark-gold);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 115, 157, 0.25);
                }

                /* Inputs */
                .form-control-md {
                    height: 2.2rem;
                    font-size: 0.9rem;
                    padding: 0.35rem 0.5rem;
                }
                .form-label.small-label {
                    font-size: 0.85rem;
                }
                .form-control:focus {
                    box-shadow: 0 0 0 0.2rem rgba(1, 169, 230, 0.25);
                    border-color: var(--primary-gold);
                }
            `}</style>
        </div>
    );
}
