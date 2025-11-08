import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import adminAuthService from '../services/adminAuthService';
import { API_URL } from '../api/api';

export const AdminAuthContext = createContext({
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  lockAdmin: () => Promise.resolve(),
  unlockAdmin: () => Promise.resolve(),
  updateAdmin: () => Promise.resolve({}),
  deleteAdmin: () => Promise.resolve(),
  loginWithGoogle: () => {},
  isAuthenticated: false,
  isLocked: false,
  isLoading: true,
});

export const AdminAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
    setIsLocked(authData.isLocked);
  };

  // Login with email/password
  const login = async (data) => {
    try {
      const response = await adminAuthService.adminLogin(data);

      if (response?.authenticated) {
        const userProfile = await adminAuthService.getAdminProfile();
        if (userProfile?.admin) {
          updateAuthState({
            user: userProfile.admin,
            isAuthenticated: true,
            isLocked: false,
          });
        }
      }

      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // Login with Google
  const loginWithGoogle = (popup = false, uri = null) => {
    const redirectUri = uri;
    const stateObj = { redirectUri, popup };
    const stateParam = encodeURIComponent(JSON.stringify(stateObj));

    const googleUrl = uri
      ? `${API_URL}/admin/google?state=${stateParam}`
      : `${API_URL}/admin/google`;

    if (popup) {
      const popupWindow = window.open(
        googleUrl,
        'Google Login',
        'width=500,height=600'
      );

      window.addEventListener('message', (event) => {
        if (event.origin !== API_URL) return;
        const data = event.data;

        if (data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = data.redirect;
        } else if (data.redirect) {
          window.location.href = data.redirect;
        }
      });
    } else {
      window.location.href = googleUrl;
    }
  };

  const logout = async () => {
    try {
      const response = await adminAuthService.logout();
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      return response;
    } catch (error) {
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      throw new Error(error.message);
    }
  };

  const lockAdmin = async () => {
    try {
      const response = await adminAuthService.lockAdmin();
      updateAuthState({ user, isAuthenticated, isLocked: true });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const unlockAdmin = async (password) => {
    try {
      const response = await adminAuthService.unlockAdmin({ password });
      updateAuthState({ user, isAuthenticated, isLocked: false });
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const updateAdmin = async (updateData) => {
    if (!user?.id) throw new Error('No logged-in admin to update');
    const updated = await adminAuthService.updateAdmin(user.id, updateData);
    updateAuthState({
      user: updated,
      isAuthenticated: true,
      isLocked: updated.isLocked || false,
    });
    return updated;
  };

  const deleteAdmin = async () => {
    if (!user?.id) throw new Error('No logged-in admin to delete');
    const response = await adminAuthService.deleteAdmin(user.id);
    updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
    return response;
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await adminAuthService.getAdminProfile();
      if (response?.authenticated && response.admin) {
        updateAuthState({
          user: response.admin,
          isAuthenticated: true,
          isLocked: response.admin.isLocked || false,
        });
      } else {
        updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      }
    } catch {
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

 useEffect(() => {
  const registerPush = async () => {
    // 🧠 Run only if user is authenticated and finished loading
    if (!isAuthenticated || isLoading || !user?.id) return;

    // 🧩 Ask only if user doesn't already have a subscription
    if (user?.subscription) {
      console.log('🔔 User already subscribed to notifications');
      return;
    }

    try {
      // 🔸 1. Ask for permission first
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('🔕 Notification permission denied by user.');
        return;
      }

      // 🔸 2. Register service worker
      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const registration = await navigator.serviceWorker.register('/worker.js', { scope: '/' });

      // 🔸 3. Subscribe the user
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // 🔸 4. Send subscription to backend
      await fetch(`${API_URL}/notifications/subscribe/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription }),
      });

      console.log('✅ Push notification subscription saved for admin:', user.id);
    } catch (error) {
      console.error('❌ Error registering push notifications:', error);
    }
  };

  registerPush();

  // helper function
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }
}, [isAuthenticated, isLoading, user]);



  const values = {
    login,
    logout,
    lockAdmin,
    unlockAdmin,
    updateAdmin,
    deleteAdmin,
    loginWithGoogle,
    user,
    isLoading,
    isAuthenticated,
    isLocked,
  };

  return (
    <AdminAuthContext.Provider value={values}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthContextProvider');
  }
  return context;
}
