import React from 'react';
import useAdminAuth from '../../../../context/AdminAuthContext';
import { Bell, BellOff } from 'lucide-react';

function NotificationSettings() {
  const {
    subscribeToNotifications,
    unsubscribeFromNotifications,
    isSubscribedToNotifications,
    user,
  } = useAdminAuth();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleToggleNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSubscribedToNotifications) {
        await unsubscribeFromNotifications();
        alert('Unsubscribed from notifications');
      } else {
        await subscribeToNotifications();
        alert('Subscribed to notifications!');
      }
    } catch (err) {
      setError(err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notification Settings</h2>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Push Notifications</h3>
            <p className="text-sm text-gray-600">
              {isSubscribedToNotifications
                ? 'You will receive push notifications'
                : 'Subscribe to receive important updates'}
            </p>
          </div>

          <button
            onClick={handleToggleNotifications}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              isSubscribedToNotifications
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white disabled:opacity-50`}
          >
            {loading ? (
              'Loading...'
            ) : isSubscribedToNotifications ? (
              <>
                <BellOff size={20} />
                Unsubscribe
              </>
            ) : (
              <>
                <Bell size={20} />
                Subscribe
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationSettings;