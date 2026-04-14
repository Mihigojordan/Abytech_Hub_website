import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAdminAuth from '../../../context/AdminAuthContext';
import Logo from '../../../assets/tran.png';

const AdminLogin = () => {
  const { login, loginWithGoogle, isLoading: authLoading, isAuthenticated } = useAdminAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
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
    switch (name) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (touched[name] || value !== '') {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      email: true,
      password: true,
    });
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const response = await login({
        adminEmail: formData.email,
        password: formData.password,
      });
      if (response.authenticated) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        navigate(from);
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: error.message || 'An error occurred during login. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    try {
      loginWithGoogle(false);
    } catch (error) {
      setErrors({ general: 'Google login failed. Please try again.' });
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return !!formData.email && !!formData.password && !errors.email && !errors.password;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-3 sm:p-4">
      <div className=" w-[500px]">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <img src={Logo} alt="Fine Fish Logo" className="h-12 sm:h-14" />
            </div>
         
            <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'rgb(81, 96, 146)' }}>
              Admin Login
            </h2>
            <p className="text-sm text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
              <span className="text-red-500 text-sm mt-0.5">⚠</span>
              <p className="text-xs text-red-700 flex-1">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                
                disabled={isLoading || authLoading}
                className={`w-full px-3 py-2.5 text-sm border rounded-xl transition-all disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.email && touched.email
                    ? 'border-red-300 bg-red-50 focus:border-red-500'
                    : 'border-gray-300'
                }`}
                style={!(errors.email && touched.email) ? {} : {}}
                onFocus={(e) => {
                  if (!(errors.email && touched.email)) {
                    e.target.style.borderColor = 'rgb(81, 96, 146)';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(81, 96, 146, 0.1)';
                  }
                }}
                onBlur={(e) => {
                  handleBlur(e);
                  if (!(errors.email && touched.email)) {
                    e.target.style.borderColor = '';
                    e.target.style.boxShadow = '';
                  }
                }}
                placeholder="admin@example.com"
              />
              {errors.email && touched.email && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  
                  disabled={isLoading || authLoading}
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-xl transition-all disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    errors.password && touched.password
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  onFocus={(e) => {
                    if (!(errors.password && touched.password)) {
                      e.target.style.borderColor = 'rgb(81, 96, 146)';
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 3px rgba(81, 96, 146, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    handleBlur(e);
                    if (!(errors.password && touched.password)) {
                      e.target.style.borderColor = '';
                      e.target.style.boxShadow = '';
                    }
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || authLoading}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading || !isFormValid()}
              className="w-full text-white py-2.5 px-4 rounded-xl transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: 'rgb(81, 96, 146)',
                boxShadow: '0 10px 25px -5px rgba(81, 96, 146, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && !authLoading && isFormValid()) {
                  e.target.style.backgroundColor = 'rgb(71, 86, 136)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgb(81, 96, 146)';
              }}
            >
              {isLoading || authLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
              </div>
            </div>
          </form>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || authLoading}
            className="w-full flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-4 rounded-xl font-semibold hover:border-gray-400 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading || authLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign in with Google'
            )}
          </button>
        </div>
      </div>

      {/* Google One Tap */}
      <div id="g_id_onload"
        data-client_id={import.meta.env.VITE_ADMIN_CLIENT_ID}
        data-login_uri={import.meta.env.VITE_ADMIN_CALLBACK_URL}
        data-auto_prompt="false">
      </div>

      <div className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="filled_black"
        data-text="signin_with"
        data-size="large">
      </div>
    </div>
  );
};

export default AdminLogin;