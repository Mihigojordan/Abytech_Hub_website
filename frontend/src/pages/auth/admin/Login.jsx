import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAdminAuth from '../../../context/AdminAuthContext';
import Logo from '../../../assets/tran.png';
import { useDashboardTheme } from '../../../utils/dashboardTheme';
import { ORG, TEAL, bc, ba } from '../../../utils/homeConstants';
import ThirdPartyCookieModal from '../../../components/auth/ThirdPartyCookieModal';
import useThirdPartyCookieCheck from '../../../hooks/useThirdPartyCookieCheck';

const GOOGLE_SVG = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AdminLogin = () => {
  const { login, loginWithGoogle, isLoading: authLoading, isAuthenticated } = useAdminAuth();
  const { bg, bg3, textC, text2, text3, border } = useDashboardTheme();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const { blocked: cookiesBlocked, recheck: recheckCookies } = useThirdPartyCookieCheck();
  const [cookieModalDismissed, setCookieModalDismissed] = useState(false);
  const [recheckingCookies, setRecheckingCookies] = useState(false);

  const handleRetryCookies = async () => {
    setRecheckingCookies(true);
    const stillBlocked = await recheckCookies();
    setRecheckingCookies(false);
    if (!stillBlocked) setCookieModalDismissed(true);
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from);
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateField = (name, value) => {
    if (name === 'email') return validateEmail(value);
    if (name === 'password') return validatePassword(value);
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (touched[name] || value !== '') {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    Object.keys(newErrors).forEach((key) => { if (!newErrors[key]) delete newErrors[key]; });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsLoading(true);
    setErrors({});
    try {
      const response = await login({ adminEmail: formData.email, password: formData.password });
      if (response.authenticated) {
        navigate(location.state?.from?.pathname || '/admin/dashboard');
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    try { loginWithGoogle(false); }
    catch { setErrors({ general: 'Google login failed. Please try again.' }); setIsLoading(false); }
  };

  const isFormValid = () => !!formData.email && !!formData.password && !errors.email && !errors.password;

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px', borderRadius: 4, outline: 'none',
    background: bg3, border: `1px solid ${hasError ? '#e84040' : border}`,
    ...ba(14, 400, { color: textC }),
    transition: 'border-color .15s',
  });

  return (
    <div className="min-h-screen flex" style={{ background: bg }}>

      {/* LEFT — Brand panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between py-16 px-14 shrink-0" style={{ background: "#0b1923", width: "clamp(280px,35%,480px)", borderRight: `1px solid rgba(255,255,255,.07)` }}>
        {/* Top label */}
        <div style={{ ...bc(10, 700, { color: ORG, letterSpacing: 5, textTransform: 'uppercase' }) }}>
          ABYTECH-HUB &nbsp;·&nbsp; ADMIN
        </div>

        {/* Middle copy */}
        <div>
          <img src={Logo} alt="AbyTech" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 28 }} />
          <div style={{ fontFamily: "'Georgia,'Times New Roman',serif", fontSize: 'clamp(36px,4.5vw,64px)', fontWeight: 700, color: '#fff', lineHeight: 1.05 }}>
            Welcome<br />Back.
          </div>
          <div style={{ fontFamily: "'Georgia,'Times New Roman',serif", fontSize: 'clamp(36px,4.5vw,64px)', fontWeight: 700, color: ORG, lineHeight: 1.05, fontStyle: 'italic' }}>
            Admin.
          </div>
          <div style={{ width: 40, height: 2, background: 'rgba(255,255,255,.2)', marginTop: 20 }} />
          <p style={{ ...ba(14, 300, { color: 'rgba(255,255,255,.5)', lineHeight: 1.85, marginTop: 16 }) }}>
            Access your portal to manage operations, reports, and your team — all in one place.
          </p>
        </div>

        {/* Bottom site label */}
        <div style={{ ...bc(10, 700, { color: 'rgba(255,255,255,.3)', letterSpacing: 4, textTransform: 'uppercase' }) }}>
          ABYTECHHUB.COM
        </div>

        {/* Left edge accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg,${ORG},${TEAL})` }} />
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 py-12">
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={Logo} alt="AbyTech" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <div>
              <div style={{ ...bc(13, 700, { color: textC, letterSpacing: 1 }) }}>ABYTECH-HUB</div>
              <div style={{ ...bc(9, 600, { color: ORG, letterSpacing: 3, textTransform: 'uppercase' }) }}>Admin Portal</div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ ...bc(10, 700, { color: ORG, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 6 }) }}>Admin Login</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(32px,5vw,52px)', lineHeight: .9, letterSpacing: 2, color: textC }}>
              SIGN IN
            </div>
            <p style={{ ...ba(13, 300, { color: text2, marginTop: 8 }) }}>Enter your credentials to continue</p>
          </div>

          {/* Error banner */}
          {errors.general && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 4, background: 'rgba(232,64,64,.1)', border: '1px solid rgba(232,64,64,.3)', ...ba(13, 400, { color: '#e84040' }) }}>
              ⚠ {errors.general}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...bc(10, 700, { color: text2, letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 6 }) }}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                disabled={isLoading || authLoading}
                placeholder="admin@example.com"
                style={inputStyle(errors.email && touched.email)}
              />
              {errors.email && touched.email && (
                <div style={{ ...ba(11, 400, { color: '#e84040', marginTop: 4 }) }}>⚠ {errors.email}</div>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ ...bc(10, 700, { color: text2, letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 6 }) }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  disabled={isLoading || authLoading}
                  placeholder="••••••••"
                  style={{ ...inputStyle(errors.password && touched.password), paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  {showPassword ? <EyeOff size={15} color={text2} /> : <Eye size={15} color={text2} />}
                </button>
              </div>
              {errors.password && touched.password && (
                <div style={{ ...ba(11, 400, { color: '#e84040', marginTop: 4 }) }}>⚠ {errors.password}</div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || authLoading || !isFormValid()}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 4, border: 'none', cursor: isLoading || authLoading || !isFormValid() ? 'not-allowed' : 'pointer',
                background: ORG, opacity: isLoading || authLoading || !isFormValid() ? .5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                ...bc(13, 700, { color: '#fff', letterSpacing: 2, textTransform: 'uppercase' }),
                transition: 'opacity .15s',
              }}
            >
              {isLoading || authLoading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Sign In
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: border }} />
              <span style={{ ...bc(10, 700, { color: text3, letterSpacing: 3 }) }}>OR</span>
              <div style={{ flex: 1, height: 1, background: border }} />
            </div>
          </form>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || authLoading}
            style={{
              width: '100%', padding: '11px 0', borderRadius: 4, cursor: isLoading || authLoading ? 'not-allowed' : 'pointer',
              background: 'transparent', border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              ...ba(13, 500, { color: textC }),
              opacity: isLoading || authLoading ? .5 : 1, transition: 'border-color .15s',
            }}
          >
            {GOOGLE_SVG}
            {isLoading || authLoading ? 'Signing in…' : 'Sign in with Google'}
          </button>

        </div>
      </div>

      {/* Google One Tap (hidden) */}
      <div id="g_id_onload"
        data-client_id={import.meta.env.VITE_ADMIN_CLIENT_ID}
        data-login_uri={import.meta.env.VITE_ADMIN_CALLBACK_URL}
        data-auto_prompt="false" />
      <div className="g_id_signin" data-type="standard" data-shape="rectangular" data-theme="filled_black" data-text="signin_with" data-size="large" />

      {cookiesBlocked && !cookieModalDismissed && (
        <ThirdPartyCookieModal
          onRetry={handleRetryCookies}
          onDismiss={() => setCookieModalDismissed(true)}
          retrying={recheckingCookies}
        />
      )}
    </div>
  );
};

export default AdminLogin;
