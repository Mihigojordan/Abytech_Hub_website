import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  User,
  ArrowLeft 
} from 'lucide-react';
import useAdminAuth from '../../../context/AdminAuthContext';
import { API_URL } from '../../../api/api';
import Logo from '../../../assets/tran.png';


const UnlockScreen = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);
  
  const { user, unlockAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Real-time validation
  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear general error when user starts typing
    if (error) {
      setError('');
    }

    // Show validation error in real-time if field has been touched
    if (touched && value !== '') {
      const validationError = validatePassword(value);
      if (validationError && validationError !== 'Password is required') {
        setError(validationError);
      }
    }
  };

  const handlePasswordBlur = () => {
    setTouched(true);
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await unlockAdmin(password);
      
      if (response) {
        // Redirect to intended page or dashboard
        const from = location.state?.from?.pathname || "/admin/dashboard";
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Unlock error:', err);
      setError(err.message || 'Invalid password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      // Logout to clear the locked state
      // This ensures the user goes back to a clean login state
      navigate('/auth/admin/login', { replace: true });
    } catch (error) {
      console.error('Error navigating back to login:', error);
      navigate('/auth/admin/login', { replace: true });
    }
  };

  // Check if form is valid
  const isFormValid = () => {
    return password && !validatePassword(password);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-4">
              <img src={Logo} alt="Fine Fish Logo" className="h-12 sm:h-14" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: 'rgb(81, 96, 146)' }}>
              Locked
            </h2>
            <p className="text-sm text-gray-600">Enter password to continue</p>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3 mb-5 p-3 rounded-2xl border" style={{ backgroundColor: 'rgba(81, 96, 146, 0.08)', borderColor: 'rgba(81, 96, 146, 0.2)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(81, 96, 146, 0.15)' }}>
              {user?.profileImg ? (
                <img 
                  src={`${API_URL}${user.profileImg}`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5" style={{ color: 'rgb(81, 96, 146)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user?.adminName || 'Admin'}</p>
              <p className="text-xs text-gray-600 truncate">{user?.adminEmail}</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Unlock Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2.5 pr-10 text-sm border rounded-xl outline-0 focus:ring-0 transition-all disabled:bg-gray-50 disabled:cursor-not-allowed ${
                    error && touched
                      ? 'border-red-300 bg-red-50 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  style={!(error && touched) ? { 
                    '--tw-ring-color': 'rgba(81, 96, 146, 0.5)',
                  } : {}}
                  onFocus={(e) => {
                    if (!(error && touched)) {
                      e.target.style.borderColor = 'rgb(81, 96, 146)';
                      e.target.style.outline = 'none';
                      e.target.style.boxShadow = '0 0 0 3px rgba(81, 96, 146, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    handlePasswordBlur();
                    if (!(error && touched)) {
                      e.target.style.borderColor = '';
                      e.target.style.boxShadow = '';
                    }
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="w-full text-white py-2.5 px-4 rounded-xl focus:ring-2 focus:ring-offset-2 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              style={{ 
                backgroundColor: 'rgb(81, 96, 146)',
                boxShadow: '0 10px 25px -5px rgba(81, 96, 146, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && isFormValid()) {
                  e.target.style.backgroundColor = 'rgb(71, 86, 136)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgb(81, 96, 146)';
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Unlocking...
                </>
              ) : (
                'Unlock'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-5 text-center">
            <button
              onClick={handleBackToLogin}
              disabled={isSubmitting}
              className="inline-flex items-center text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockScreen;