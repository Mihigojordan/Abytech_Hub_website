import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Send, Zap } from 'lucide-react';
import { API_URL } from '../api/api';

const PWAPushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('Hello!');
  const [notificationBody, setNotificationBody] = useState('This is a test notification');
  const [status, setStatus] = useState('');
  const [swRegistration, setSwRegistration] = useState(null);

  // VAPID public key - replace with your actual key from backend
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      initServiceWorker();
    } else {
      setStatus('Push notifications not supported');
    }
  }, []);

  const initServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      setSwRegistration(registration);
      setStatus('Service Worker ready');
      checkSubscription(registration);
    } catch (error) {
      setStatus('Service Worker error: ' + error.message);
      console.error('SW init error:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const checkSubscription = async (registration) => {
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        setSubscription(sub);
        setIsSubscribed(true);
        setStatus('Already subscribed to notifications');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribeToPush = async () => {
    try {
      setStatus('Requesting notification permission...');
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('Notification permission denied');
        return;
      }

      if (!swRegistration) {
        setStatus('Service Worker not ready yet, please try again');
        return;
      }

      setStatus('Subscribing to push notifications...');
      const sub = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setSubscription(sub);
      setIsSubscribed(true);

      setStatus('Sending subscription to server...');
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setStatus('Successfully subscribed to push notifications!');
    } catch (error) {
      setStatus('Subscription failed: ' + error.message);
      console.error('Subscribe error:', error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (subscription) {
        setStatus('Unsubscribing...');
        
        await subscription.unsubscribe();
        
        await fetch(`${API_URL}/notifications/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });

        setSubscription(null);
        setIsSubscribed(false);
        setStatus('Unsubscribed from push notifications');
      }
    } catch (error) {
      setStatus('Unsubscribe failed: ' + error.message);
      console.error('Unsubscribe error:', error);
    }
  };

  // Send notification to yourself via backend
  const sendTestNotification = async () => {
    try {
      setStatus('Sending test notification...');
      
      const response = await fetch(`${API_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notificationTitle,
          body: notificationBody,
          endpoint: subscription?.endpoint
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      setStatus('Test notification sent! Check your device.');
    } catch (error) {
      setStatus('Send failed: ' + error.message);
      console.error('Send error:', error);
    }
  };

  // Send instant local notification (no backend needed)
  const sendInstantNotification = async () => {
    try {
      if (!('Notification' in window)) {
        setStatus('Notifications not supported');
        return;
      }

      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setStatus('Notification permission denied');
          return;
        }
      }

      setStatus('Showing instant notification...');

      // Show notification directly (works even without service worker)
      const notification = new Notification(notificationTitle, {
        body: notificationBody,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'instant-test',
        requireInteraction: false,
        data: { url: '/' }
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setStatus('Instant notification shown!');
    } catch (error) {
      setStatus('Instant notification failed: ' + error.message);
      console.error('Instant notification error:', error);
    }
  };

  // Send notification via Service Worker (simulates push)
  const sendServiceWorkerNotification = async () => {
    try {
      if (!swRegistration) {
        setStatus('Service Worker not ready');
        return;
      }

      setStatus('Sending notification via Service Worker...');

      await swRegistration.showNotification(notificationTitle, {
        body: notificationBody,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'sw-test',
        requireInteraction: false,
        data: { url: '/' },
        actions: [
          { action: 'open', title: 'Open App' },
          { action: 'close', title: 'Close' }
        ]
      });

      setStatus('Service Worker notification shown!');
    } catch (error) {
      setStatus('SW notification failed: ' + error.message);
      console.error('SW notification error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-black from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              PWA Push Notifications
            </h1>
          </div>

          {/* Support Status */}
          <div className={`mb-6 p-4 rounded-lg ${
            isSupported ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`font-medium ${isSupported ? 'text-green-800' : 'text-red-800'}`}>
              {isSupported ? '✓ Push notifications supported' : '✗ Push notifications not supported'}
            </p>
          </div>

          {/* Subscription Status */}
          {isSupported && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${
                isSubscribed ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isSubscribed ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                  }`}>
                    {isSubscribed ? 'Subscribed' : 'Not Subscribed'}
                  </span>
                </div>
                {status && (
                  <p className="text-sm text-gray-600 mt-2">{status}</p>
                )}
              </div>

              {/* Subscribe/Unsubscribe Button */}
              <button
                onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                disabled={!swRegistration}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  !swRegistration 
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : isSubscribed
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <BellOff className="w-5 h-5" />
                    Unsubscribe from Notifications
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    Subscribe to Notifications
                  </>
                )}
              </button>

              {/* Test Notification Section */}
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Test Notifications
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Notification title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Body
                    </label>
                    <textarea
                      value={notificationBody}
                      onChange={(e) => setNotificationBody(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows="3"
                      placeholder="Notification message"
                    />
                  </div>

                  {/* Instant Notification Button */}
                  <button
                    onClick={sendInstantNotification}
                    className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    <Zap className="w-5 h-5" />
                    Send Instant Notification (Local)
                  </button>

                  {/* Service Worker Notification Button */}
                  <button
                    onClick={sendServiceWorkerNotification}
                    disabled={!swRegistration}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                      !swRegistration
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    Send via Service Worker (Local)
                  </button>

                  {/* Backend Push Notification Button */}
                  {isSubscribed && (
                    <button
                      onClick={sendTestNotification}
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                    >
                      <Send className="w-5 h-5" />
                      Send via Backend (Push)
                    </button>
                  )}

                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Test Options:</strong><br/>
                      • <strong>Instant:</strong> Works immediately, no setup needed<br/>
                      • <strong>Service Worker:</strong> Tests SW notifications locally<br/>
                      • <strong>Backend:</strong> Real push notification (requires subscription)
                    </p>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              {subscription && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Subscription Details
                  </h3>
                  <p className="text-xs text-gray-600 break-all">
                    {subscription.endpoint}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Setup Instructions */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Quick Test Guide:
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li><strong>1.</strong> Click "Instant Notification" - works immediately!</li>
              <li><strong>2.</strong> Wait for SW to load, then try "Service Worker"</li>
              <li><strong>3.</strong> For real push: subscribe + send via backend</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAPushNotifications;