import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, User, ArrowLeft } from 'lucide-react';
import useAdminAuth from '../../../context/AdminAuthContext';
import { API_URL } from '../../../api/api';
import Logo from '../../../assets/tran.png';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bc, ba } from '../../../utils/homeConstants';

const UnlockScreen = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const { user, unlockAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { bg, bg2, bg3, textC, text2, border } = useDashboardTheme();

  const validatePassword = (pw: string) => {
    if (!pw) return 'Password is required';
    if (pw.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (error) setError('');
    if (touched && value !== '') {
      const validationError = validatePassword(value);
      if (validationError && validationError !== 'Password is required') setError(validationError);
    }
  };

  const handlePasswordBlur = () => {
    setTouched(true);
    const validationError = validatePassword(password);
    if (validationError) setError(validationError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const validationError = validatePassword(password);
    if (validationError) { setError(validationError); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const response = await unlockAdmin(password);
      if (response) {
        const from = (location.state as any)?.from?.pathname || '/admin/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => navigate('/auth/admin/login', { replace: true });
  const isFormValid = () => !!password && !validatePassword(password);

  const initials = (user?.adminName || 'A')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: bg }}>
      {/* Decorative slashes */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: ORG, clipPath: 'polygon(62% 0%,74% 0%,58% 100%,46% 100%)', opacity: .05 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ background: TEAL, clipPath: 'polygon(66% 0%,70% 0%,54% 100%,50% 100%)', opacity: .04 }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 10 }}>

        {/* Card */}
        <div style={{ background: bg2, border: `1px solid ${border}`, borderRadius: 4, padding: '36px 32px' }}>

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 4, background: `rgba(232,98,26,.1)`, border: `1px solid rgba(232,98,26,.25)`, marginBottom: 16 }}>
              <img src={Logo} alt="AbyTech" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
            <div style={{ ...bc(10, 700, { color: ORG, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 6 }) }}>
              Screen Locked
            </div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, lineHeight: .9, letterSpacing: 2, color: textC }}>
              UNLOCK
            </div>
            <p style={{ ...ba(13, 300, { color: text2, marginTop: 8 }) }}>Enter your password to continue</p>
          </div>

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 4, background: bg3, border: `1px solid ${border}`, marginBottom: 24 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {user?.profileImg ? (
                <img src={`${API_URL}${user.profileImg}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ ...bc(12, 700, { color: '#fff' }) }}>{initials}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...ba(13, 600, { color: textC, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }) }}>
                {user?.adminName || 'Admin'}
              </div>
              <div style={{ ...ba(11, 400, { color: text2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }) }}>
                {user?.adminEmail}
              </div>
            </div>
            <Lock size={14} color={text2} />
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 4, background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', marginBottom: 16, ...ba(13, 400, { color: '#e84040' }) }}>
              <AlertCircle size={14} color="#e84040" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ ...bc(10, 700, { color: text2, letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 6 }) }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  disabled={isSubmitting}
                  autoFocus
                  autoComplete="current-password"
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '10px 40px 10px 12px', borderRadius: 4, outline: 'none',
                    background: bg3, border: `1px solid ${error && touched ? '#e84040' : border}`,
                    ...ba(14, 400, { color: textC }), transition: 'border-color .15s',
                    opacity: isSubmitting ? .6 : 1,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  {showPassword ? <EyeOff size={15} color={text2} /> : <Eye size={15} color={text2} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 4, border: 'none',
                cursor: isSubmitting || !isFormValid() ? 'not-allowed' : 'pointer',
                background: ORG, opacity: isSubmitting || !isFormValid() ? .5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                ...bc(13, 700, { color: '#fff', letterSpacing: 2, textTransform: 'uppercase' }),
                transition: 'opacity .15s',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Unlocking…
                </>
              ) : 'Unlock Screen'}
            </button>
          </form>

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              onClick={handleBackToLogin}
              disabled={isSubmitting}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                ...ba(12, 400, { color: text2 }), transition: 'color .15s',
              }}
            >
              <ArrowLeft size={13} />
              Back to Login
            </button>
          </div>
        </div>

        {/* Site label */}
        <div style={{ textAlign: 'center', marginTop: 20, ...bc(9, 700, { color: 'rgba(255,255,255,.18)', letterSpacing: 4, textTransform: 'uppercase' }) }}>
          ABYTECHHUB.COM
        </div>
      </div>
    </div>
  );
};

export default UnlockScreen;
