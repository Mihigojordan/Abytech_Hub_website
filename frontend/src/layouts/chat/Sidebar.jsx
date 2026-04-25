import React, { useState } from 'react';
import { MessageSquare, Users, UserPlus, Settings, LogOut, AppWindow } from 'lucide-react';
import CreateConversationModal from '../../components/dashboard/chat/ui/CreateConversationModal';
import Avatar from '../../components/dashboard/chat/ui/Avatar';
import useAdminAuth from '../../context/AdminAuthContext';
import PWASidebarInstall from '../../components/PWASidebarInstall';
import { useDashboardTheme } from '../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Sidebar layout component - left navigation bar with icons
 */
const Sidebar = ({ onConversationCreated, selectedChatId }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { user: currentUser } = useAdminAuth();
    const { bg, bg2, bg3, textC, text2, text3, border, isDark } = useDashboardTheme();

    const handleConversationCreated = (conversation) => {
        setShowCreateModal(false);
        if (onConversationCreated) {
            onConversationCreated(conversation);
        }
    };

    const SidebarButton = ({ icon: Icon, active = false, onClick, title, primary = false }) => (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            title={title}
            style={{
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: primary ? ORG : active ? 'rgba(232,98,26,.1)' : 'transparent',
                color: primary ? '#fff' : active ? ORG : text3,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: primary ? '0 4px 12px rgba(232,98,26,.3)' : 'none'
            }}
        >
            <Icon style={{ width: 20, height: 20 }} />
        </motion.button>
    );

    return (
        <>
            <div style={{ 
                width: 72, 
                background: bg2, 
                borderRight: `1px solid ${border}`, 
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 0',
                height: '100%',
                zIndex: 10
                
            }} className={` ${selectedChatId ? 'hidden' : 'flex'} md:flex`}>
                
                {/* Logo Area */}
                <div style={{ marginBottom: 40 }}>
                    <div style={{ 
                        width: 44, 
                        height: 44, 
                        background: isDark ? '#0a1e28' : '#f5efe6', 
                        borderRadius: 4, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        border: `1px solid ${border}`
                    }}>
                        <span style={{ ...bb(20, { color: ORG }) }}>A</span>
                    </div>
                </div>

                {/* Primary Actions */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <SidebarButton 
                        icon={UserPlus} 
                        primary 
                        onClick={() => setShowCreateModal(true)} 
                        title="Start New Chat" 
                    />
                    
                    <div style={{ width: 32, height: 1, background: border, margin: '10px 0' }} />
                    
                    <SidebarButton 
                        icon={MessageSquare} 
                        active 
                        title="Conversations" 
                    />
                    
                    <SidebarButton 
                        icon={Users} 
                        title="Contacts" 
                    />
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    <PWASidebarInstall variant="sidebar" />
                    
                    <SidebarButton 
                        icon={Settings} 
                        title="Settings" 
                    />

                    <div style={{ position: 'relative', marginTop: 10 }}>
                        <Avatar
                            avatar={currentUser?.profileImage}
                            initial={currentUser?.name?.charAt(0)?.toUpperCase() || currentUser?.adminName?.charAt(0)?.toUpperCase()}
                            name={currentUser?.name || currentUser?.adminName || 'User'}
                            size="md"
                            online={true}
                        />
                        <div style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            right: 0, 
                            width: 12, 
                            height: 12, 
                            background: '#10b981', 
                            borderRadius: '50%', 
                            border: `2px solid ${bg2}` 
                        }} />
                    </div>
                </div>
            </div>

            {/* Create Conversation Modal */}
            <CreateConversationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onConversationCreated={handleConversationCreated}
            />
        </>
    );
};

export default Sidebar;
