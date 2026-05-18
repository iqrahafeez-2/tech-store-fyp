import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../context/StoreContext';

function AuthModal() {
  const {
    authModal,
    closeAuth,
    setAuthMode,
    login,
    signup,
    showToast,
  } = useStore();

  const modalRef = useRef(null);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });

  const [remember, setRemember] = useState(true);
  const [timer, setTimer] = useState(45);

  const mode = authModal?.mode || 'login';
  const open = authModal?.open;

  const title = useMemo(() => {
    if (mode === 'signup') return 'Create Account';
    if (mode === 'forgot') return 'Forgot Password';
    if (mode === 'otp') return 'OTP Verification';
    return 'Welcome Back';
  }, [mode]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        closeAuth();
      }
    };

    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, closeAuth]);

  useEffect(() => {
    if (mode !== 'otp') {
      return undefined;
    }

    setTimer(45);

    const interval = setInterval(() => {
      setTimer((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [mode]);

  if (!open) {
    return null;
  }

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateEmail = () => {
    if (!form.email.trim() || !form.email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }

    return true;
  };

  const handleLogin = (event) => {
    event.preventDefault();

    if (!validateEmail()) return;

    if (!form.password.trim()) {
      showToast('Please enter your password', 'error');
      return;
    }

    login({
      name: form.fullName || 'Tech Store User',
      email: form.email,
      role: form.email.toLowerCase().includes('admin') ? 'admin' : 'user',
    });
  };

  const handleSignup = (event) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    if (!validateEmail()) return;

    if (form.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setAuthMode('otp');
    showToast('OTP sent successfully. Use 123456 for demo verification.', 'success');
  };

  const handleForgot = (event) => {
    event.preventDefault();

    if (!validateEmail()) return;

    setAuthMode('otp');
    showToast('Password reset OTP sent. Use 123456 for demo.', 'success');
  };

  const handleOtp = (event) => {
    event.preventDefault();

    if (form.otp !== '123456') {
      showToast('Invalid OTP. Use 123456 for demo verification.', 'error');
      return;
    }

    signup({
      name: form.fullName || 'Tech Store User',
      email: form.email || 'user@techstore.com',
      phone: form.phone,
    });
  };

  const handleBackdrop = (event) => {
    if (event.target === event.currentTarget) {
      closeAuth();
    }
  };

  return (
    <div className="auth-backdrop" onMouseDown={handleBackdrop}>
      <section className="auth-modal" ref={modalRef} aria-modal="true" role="dialog">
        <button type="button" className="auth-close" onClick={closeAuth} aria-label="Close modal">
          ×
        </button>

        <div className="auth-brand">
          <span>TS</span>
          <div>
            <strong>Tech Store</strong>
            <small>AI powered e commerce</small>
          </div>
        </div>

        <div className="auth-header">
          <span className="section-eyebrow">Secure Account</span>
          <h2>{title}</h2>
          <p>
            {mode === 'login' && 'Login to manage cart, wishlist, orders and AI recommendations.'}
            {mode === 'signup' && 'Create your account with clear validation and professional form layout.'}
            {mode === 'forgot' && 'Enter your registered email and we will send a demo OTP.'}
            {mode === 'otp' && 'Enter the 6 digit OTP sent to your email. Demo OTP is 123456.'}
          </p>
        </div>

        {mode === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <label className="form-field">
              <span className="form-label">Email Address *</span>
              <input
                className="form-input"
                type="email"
                value={form.email}
                placeholder="user@techstore.com"
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>

            <label className="form-field">
              <span className="form-label">Password *</span>
              <input
                className="form-input"
                type="password"
                value={form.password}
                placeholder="Enter password"
                onChange={(event) => updateField('password', event.target.value)}
              />
            </label>

            <div className="auth-row">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                Remember me
              </label>

              <button type="button" onClick={() => setAuthMode('forgot')}>
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Login
            </button>

            <p className="auth-switch">
              No account?{' '}
              <button type="button" onClick={() => setAuthMode('signup')}>
                Sign up
              </button>
            </p>
          </form>
        )}

        {mode === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <label className="form-field">
              <span className="form-label">Full Name *</span>
              <input
                className="form-input"
                value={form.fullName}
                placeholder="Enter full name"
                onChange={(event) => updateField('fullName', event.target.value)}
              />
            </label>

            <label className="form-field">
              <span className="form-label">Email Address *</span>
              <input
                className="form-input"
                type="email"
                value={form.email}
                placeholder="you@example.com"
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>

            <label className="form-field">
              <span className="form-label">Phone Number</span>
              <input
                className="form-input"
                value={form.phone}
                placeholder="+92 300 0000000"
                onChange={(event) => updateField('phone', event.target.value)}
              />
            </label>

            <div className="auth-two-grid">
              <label className="form-field">
                <span className="form-label">Password *</span>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField('password', event.target.value)}
                />
              </label>

              <label className="form-field">
                <span className="form-label">Confirm Password *</span>
                <input
                  className="form-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField('confirmPassword', event.target.value)}
                />
              </label>
            </div>

            <div className="password-meter">
              <span
                style={{
                  width:
                    form.password.length > 10
                      ? '100%'
                      : form.password.length > 6
                      ? '66%'
                      : form.password.length > 0
                      ? '33%'
                      : '0%',
                }}
              />
            </div>

            <label className="auth-terms">
              <input type="checkbox" defaultChecked />
              I agree to Tech Store terms and privacy policy.
            </label>

            <button type="submit" className="btn btn-primary auth-submit">
              Create Account
            </button>

            <p className="auth-switch">
              Already have an account?{' '}
              <button type="button" onClick={() => setAuthMode('login')}>
                Login
              </button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="auth-form" onSubmit={handleForgot}>
            <label className="form-field">
              <span className="form-label">Registered Email *</span>
              <input
                className="form-input"
                type="email"
                value={form.email}
                placeholder="you@example.com"
                onChange={(event) => updateField('email', event.target.value)}
              />
            </label>

            <button type="submit" className="btn btn-primary auth-submit">
              Send OTP
            </button>

            <p className="auth-switch">
              Remember password?{' '}
              <button type="button" onClick={() => setAuthMode('login')}>
                Back to login
              </button>
            </p>
          </form>
        )}

        {mode === 'otp' && (
          <form className="auth-form" onSubmit={handleOtp}>
            <label className="form-field">
              <span className="form-label">6 Digit OTP *</span>
              <input
                className="form-input otp-input"
                maxLength={6}
                value={form.otp}
                placeholder="123456"
                onChange={(event) => updateField('otp', event.target.value.replace(/\D/g, ''))}
              />
            </label>

            <div className="otp-box-row">
              {Array.from({ length: 6 }).map((_, index) => (
                <span key={index}>{form.otp[index] || '_'}</span>
              ))}
            </div>

            <p className="otp-timer">
              Resend OTP {timer > 0 ? `in 00:${String(timer).padStart(2, '0')}` : 'now'}
            </p>

            <button type="submit" className="btn btn-primary auth-submit">
              Verify OTP
            </button>

            <p className="auth-switch">
              Wrong email?{' '}
              <button type="button" onClick={() => setAuthMode('signup')}>
                Edit details
              </button>
            </p>
          </form>
        )}
      </section>

      <style>{`
        .auth-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: grid;
          place-items: center;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(10px);
          padding: 20px;
        }

        .auth-modal {
          position: relative;
          width: min(540px, 100%);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 30px;
          background: var(--surface);
          box-shadow: var(--shadow-md);
          padding: 24px;
          animation: authIn 0.22s ease both;
        }

        @keyframes authIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .auth-close {
          position: absolute;
          top: 16px;
          right: 16px;
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface-2);
          color: var(--text);
          font-size: 1.4rem;
          font-weight: 700;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .auth-brand > span {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          font-weight: 950;
        }

        .auth-brand strong {
          display: block;
          font-size: 1.05rem;
          letter-spacing: -0.04em;
        }

        .auth-brand small {
          display: block;
          color: var(--muted);
          font-size: 0.75rem;
          font-weight: 800;
        }

        .auth-header h2 {
          margin: 12px 0 8px;
          font-size: 2rem;
          letter-spacing: -0.055em;
        }

        .auth-header p {
          margin: 0;
          color: var(--text-soft);
          line-height: 1.65;
        }

        .auth-form {
          display: grid;
          gap: 14px;
          margin-top: 20px;
        }

        .auth-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: var(--text-soft);
          font-size: 0.88rem;
          font-weight: 800;
        }

        .auth-row label {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .auth-row button,
        .auth-switch button {
          border: 0;
          background: transparent;
          color: var(--primary);
          font-weight: 900;
          padding: 0;
        }

        .auth-submit {
          width: 100%;
        }

        .auth-switch {
          margin: 0;
          color: var(--text-soft);
          text-align: center;
          font-weight: 800;
        }

        .auth-two-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .password-meter {
          height: 8px;
          border-radius: 999px;
          background: var(--surface-2);
          overflow: hidden;
        }

        .password-meter span {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--warning), var(--success));
          transition: width 0.2s ease;
        }

        .auth-terms {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: var(--text-soft);
          font-size: 0.86rem;
          line-height: 1.5;
          font-weight: 750;
        }

        .otp-input {
          text-align: center;
          font-size: 1.4rem;
          font-weight: 950;
          letter-spacing: 0.25em;
        }

        .otp-box-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
        }

        .otp-box-row span {
          display: grid;
          place-items: center;
          height: 52px;
          border: 1px solid var(--border);
          border-radius: 15px;
          background: var(--surface-2);
          color: var(--text);
          font-size: 1.2rem;
          font-weight: 950;
        }

        .otp-timer {
          margin: 0;
          color: var(--muted);
          text-align: center;
          font-weight: 800;
        }

        @media (max-width: 560px) {
          .auth-modal {
            border-radius: 24px;
            padding: 20px;
          }

          .auth-two-grid {
            grid-template-columns: 1fr;
          }

          .otp-box-row span {
            height: 45px;
          }
        }
      `}</style>
    </div>
  );
}

export default AuthModal;