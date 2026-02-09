import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { User, Bell } from 'lucide-react';
import NotificationSettings from '../../components/dashboard/profile/admin/NotificationsSettings';


const AdminProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['profile', 'notifications'] as const;
  const initialTab = validTabs.includes(searchParams.get('tab') as any)
    ? (searchParams.get('tab') as 'profile' | 'notifications')
    : 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>(initialTab);

  // Sync activeTab with URL params
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  // Get current admin ID from auth or context
  const getCurrentAdminId = () => {
    // Try to get from localStorage or auth context
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData);
        return parsed.id || parsed._id;
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
    return null;
  };

  const adminId = getCurrentAdminId();

  const handleViewProfile = () => {
    if (adminId) {
      navigate(`/admin/dashboard/profile/${adminId}`);
    }
  };

  return (
    <div className="bg-gray-50 overflow-y-auto h-[90vh]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r h-full border-gray-200">
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-full overflow-y-auto flex-1 p-4">
          <div className="mx-auto">
            <div className="bg-white rounded border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200">
                <h1 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'profile' ? 'Profile Settings' : 'Notifications'}
                </h1>
              </div>
              <div className="p-4">
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        View Your Profile
                      </h3>
                      <p className="text-sm text-blue-700 mb-3">
                        Click the button below to view and edit your complete profile information.
                      </p>
                      <button
                        onClick={handleViewProfile}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                      >
                        Go to Profile
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Quick Settings
                      </h3>
                      <div className="space-y-3 text-sm text-gray-600">
                        <p>• Update your personal information</p>
                        <p>• Manage your profile picture</p>
                        <p>• Edit your bio and experience</p>
                        <p>• Upload documents</p>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'notifications' && <NotificationSettings />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
