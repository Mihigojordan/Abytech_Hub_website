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
  subscribeToNotifications: () => Promise.resolve(),
  unsubscribeFromNotifications: () => Promise.resolve(),
  isAuthenticated: false,
  isLocked: false,
  isLoading: true,
  isSubscribedToNotifications: false,
});

export const AdminAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribedToNotifications, setIsSubscribedToNotifications] = useState(false);

  const updateAuthState = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
    setIsLocked(authData.isLocked);
    setIsSubscribedToNotifications(!!authData.user?.subscription);
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };

  // Subscribe to push notifications
  const subscribeToNotifications = async () => {
    if (!user?.id) {
      throw new Error('User must be logged in to subscribe');
    }

    try {
      // 1. Check if browser supports notifications
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Push notifications not supported');
      }

      // 2. Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // 3. Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;

      // 4. Get VAPID public key from environment
      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error('VAPID public key not configured');
      }

      // 5. Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      // 6. Send subscription to backend
      const response = await fetch(`${API_URL}/notifications/subscribe/${user.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      const data = await response.json();
      
      // Update user state with new subscription
      setUser(data.admin);
      setIsSubscribedToNotifications(true);

      console.log('✅ Successfully subscribed to push notifications');
      return { success: true, message: 'Subscribed successfully' };
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      throw error;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromNotifications = async () => {
    if (!user?.id) {
      throw new Error('User must be logged in');
    }

    try {
      // 1. Unsubscribe from push manager
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // 2. Remove subscription from backend
      const response = await fetch(`${API_URL}/notifications/unsubscribe/${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      // Update user state
      setUser({ ...user, subscription: null });
      setIsSubscribedToNotifications(false);

      console.log('✅ Successfully unsubscribed from push notifications');
      return { success: true, message: 'Unsubscribed successfully' };
    } catch (error) {
      console.error('❌ Error unsubscribing from notifications:', error);
      throw error;
    }
  };

  // Auto-subscribe on login (optional)
  useEffect(() => {
    const autoSubscribe = async () => {
      // Only run if authenticated and not already subscribed
      if (!isAuthenticated || isLoading || !user?.id || user?.subscription) {
        return;
      }

      // Check if user wants auto-subscribe (you can add a preference)
      const autoSubscribeEnabled = localStorage.getItem('autoSubscribePush') === 'true';
      
      if (autoSubscribeEnabled) {
        try {
          await subscribeToNotifications();
        } catch (error) {
          console.warn('Auto-subscribe failed:', error);
        }
      }
    };

    autoSubscribe();
  }, [isAuthenticated, isLoading, user]);

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

  const values = {
    login,
    logout,
    lockAdmin,
    unlockAdmin,
    updateAdmin,
    deleteAdmin,
    loginWithGoogle,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    user,
    isLoading,
    isAuthenticated,
    isLocked,
    isSubscribedToNotifications,
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