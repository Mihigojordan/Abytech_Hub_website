import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import adminAuthService from '../services/adminAuthService';
import pushNotificationService from '../services/pushNotificationService';
import { getClientDescription } from '../stores/detectDevice';
import { API_URL } from '../api/api';
import { io } from 'socket.io-client';

export const AdminAuthContext = createContext({
  user: null,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  lockAdmin: () => Promise.resolve(),
  unlockAdmin: () => Promise.resolve(),
  updateAdmin: () => Promise.resolve({}),
  deleteAdmin: () => Promise.resolve(),
  loginWithGoogle: () => { },
  subscribeToNotifications: () => Promise.resolve(),
  unsubscribeFromNotifications: () => Promise.resolve(),
  unsubscribeAllDevices: () => Promise.resolve(),
  getSubscriptions: () => Promise.resolve([]),
  isAuthenticated: false,
  isLocked: false,
  isLoading: true,
  isSubscribedToNotifications: false,
  permissions: [],
  isSuperAdmin: false,
  hasPermission: () => false,
});

export const AdminAuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribedToNotifications, setIsSubscribedToNotifications] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const socketRef = useRef(null);

  const updateAuthState = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
    setIsLocked(authData.isLocked ?? false);
    if (authData.user?.permissionNames) {
      setPermissions(authData.user.permissionNames);
    }
    if (authData.user?.isSuperAdmin !== undefined) {
      setIsSuperAdmin(authData.user.isSuperAdmin);
    }
    if (!authData.isAuthenticated) {
      setIsSubscribedToNotifications(false);
      setPermissions([]);
      setIsSuperAdmin(false);
    }
  };

  const hasPermission = useCallback((permissionName) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permissionName);
  }, [permissions, isSuperAdmin]);

  // 🔧 Helper: convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };

  // 🔔 Subscribe to push notifications
  const subscribeToNotifications = async (label) => {
    if (!user?.id) throw new Error('Admin must be logged in to subscribe');

    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        throw new Error('Push notifications not supported in this browser');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Notification permission denied');

      const registration = await navigator.serviceWorker.ready;

      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error('VAPID public key not configured');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const subscriptionObject = subscription.toJSON();

      // Detect Firefox vs Chrome encoding
      const contentEncoding = subscriptionObject.keys
        ? 'aes128gcm'
        : 'aesgcm';

      await pushNotificationService.subscribe({
        userId: user.id,
        type: 'ADMIN', // UserType
        subscription: {
          endpoint: subscriptionObject.endpoint,
          p256dh: subscriptionObject.keys?.p256dh ?? null,
          auth: subscriptionObject.keys?.auth ?? null,
          contentEncoding,
        },
        label: label || getClientDescription()?.description || 'Admin Device',
      });

      setIsSubscribedToNotifications(true);
      console.log('✅ Admin subscribed to push notifications');
      return { success: true, message: 'Successfully subscribed to notifications' };
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      throw new Error(error?.message || 'Failed to subscribe to notifications');
    }
  };

  // 🔕 Unsubscribe current device
  const unsubscribeFromNotifications = async () => {
    if (!user?.id) throw new Error('Admin must be logged in');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await pushNotificationService.unsubscribeDevice({
          userId: user.id,
          type: 'ADMIN',
          endpoint,
        });
      }

      setIsSubscribedToNotifications(false);
      console.log('✅ Admin unsubscribed from push notifications');
      return { success: true, message: 'Successfully unsubscribed from notifications' };
    } catch (error) {
      console.error('❌ Error unsubscribing from notifications:', error);
      throw new Error(error?.message || 'Failed to unsubscribe from notifications');
    }
  };

  // 🔕 Unsubscribe all devices
  const unsubscribeAllDevices = async () => {
    if (!user?.id) throw new Error('Admin must be logged in');

    try {
      await pushNotificationService.unsubscribeAllDevices({
        userId: user.id,
        type: 'ADMIN',
      });

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();

      setIsSubscribedToNotifications(false);
      console.log('✅ All admin devices unsubscribed');
      return { success: true, message: 'Successfully unsubscribed all devices' };
    } catch (error) {
      console.error('❌ Error unsubscribing all devices:', error);
      throw new Error(error?.message || 'Failed to unsubscribe all devices');
    }
  };

  // 📋 Get all subscriptions
  const getSubscriptions = async () => {
    if (!user?.id) throw new Error('Admin must be logged in');

    try {
      return await pushNotificationService.getSubscriptions(user.id, 'ADMIN');
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      throw new Error(error?.message || 'Failed to fetch subscriptions');
    }
  };

  // 🔍 Check if current device is subscribed
  const checkSubscriptionStatus = async () => {
    if (!user?.id || !isAuthenticated) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const subscriptions = await pushNotificationService.getSubscriptions(user.id, 'ADMIN');
        const isSubscribed = subscriptions.some((sub) => sub.endpoint === subscription.endpoint);
        setIsSubscribedToNotifications(isSubscribed);
      } else {
        setIsSubscribedToNotifications(false);
      }
    } catch (error) {
      console.warn('Could not check subscription status:', error);
      setIsSubscribedToNotifications(false);
    }
  };

  // 🔹 Login
  const login = async (data) => {
    try {
      const response = await adminAuthService.adminLogin(data);
      if (response?.authenticated) {
        const userProfile = await adminAuthService.getAdminProfile();
        if (userProfile?.admin) {
          updateAuthState({ user: userProfile.admin, isAuthenticated: true, isLocked: false });
        }
      }
      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  // 🔹 Login with Google
  const loginWithGoogle = (popup = false, uri = null) => {
    const stateObj = { redirectUri: uri, popup };
    const stateParam = encodeURIComponent(JSON.stringify(stateObj));
    const googleUrl = uri
      ? `${API_URL}/admin/google?state=${stateParam}`
      : `${API_URL}/admin/google`;

    if (popup) {
      window.open(googleUrl, 'Google Login', 'width=500,height=600');
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

  // 🔹 Logout
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
    updateAuthState({ user: updated, isAuthenticated: true, isLocked: updated.isLocked || false });
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
        updateAuthState({ user: response.admin, isAuthenticated: true, isLocked: response.admin.isLocked || false });
      } else {
        updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      }
    } catch {
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { checkAuthStatus(); }, []);

  // 🔍 Check subscription status when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && user?.id) {
      checkSubscriptionStatus();
    }
  }, [isAuthenticated, isLoading, user?.id]);

  // 🔔 Auto-subscribe on login
  useEffect(() => {
    const autoSubscribe = async () => {
      if (!isAuthenticated || isLoading || !user?.id || isSubscribedToNotifications) return;

      try {
        const client = getClientDescription();
        await subscribeToNotifications(client?.description || 'Auto-subscribed admin device');
      } catch (error) {
        console.warn('Auto-subscribe failed:', error);
      }
    };

    autoSubscribe();
  }, [isAuthenticated, isLoading, user?.id, isSubscribedToNotifications]);

  // 🔌 Socket connection for real-time permission updates
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = API_URL.replace('/api', '');
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('registerUser', { id: user.id, type: 'ADMIN' });
    });

    socket.on('permission:updated', (data) => {
      console.log('🔑 Permission updated in real-time:', data);
      if (data.permissions) setPermissions(data.permissions);
      if (data.isSuperAdmin !== undefined) setIsSuperAdmin(data.isSuperAdmin);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user?.id]);

  const values = {
    user,
    login,
    logout,
    lockAdmin,
    unlockAdmin,
    updateAdmin,
    deleteAdmin,
    loginWithGoogle,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    unsubscribeAllDevices,
    getSubscriptions,
    isAuthenticated,
    isLocked,
    isLoading,
    isSubscribedToNotifications,
    permissions,
    isSuperAdmin,
    hasPermission,
  };

  return (
    <AdminAuthContext.Provider value={values}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthContextProvider');
  return context;
}