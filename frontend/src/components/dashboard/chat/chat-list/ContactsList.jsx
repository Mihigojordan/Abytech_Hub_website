import React from 'react';
import Avatar from '../ui/Avatar';
import { useDashboardTheme } from '../../../../utils/dashboardTheme';
import { ORG, TEAL, bb, bc, ba } from '../../../../utils/homeConstants';
import { motion } from 'framer-motion';

/**
 * Contacts list component - horizontal scrolling contacts with avatars
 */
const ContactsList = ({ contacts = [], onlineUsers = new Map() }) => {
    const { bg, bg2, textC, text2, text3, border } = useDashboardTheme();

    const isContactOnline = (contactId) => onlineUsers.has(contactId);

    const onlineContacts = contacts.filter(contact =>
        isContactOnline(contact.contactId || contact.id)
    );

    if (onlineContacts.length === 0) return null;

    return (
        <div style={{ padding: '24px 20px', background: bg, borderBottom: `1px solid ${border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ ...ba(11, 700, { color: text3, letterSpacing: 1.5, textTransform: 'uppercase', margin: 0 }) }}>
                    Active Now
                </h3>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            </div>
            
            <div style={{ 
                display: 'flex', 
                gap: 20, 
                overflowX: 'auto', 
                paddingBottom: 8,
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
            }} className="no-scrollbar">
                {onlineContacts.map((contact) => (
                    <motion.div
                        key={contact.id}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            minWidth: 56, 
                            cursor: 'pointer' 
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Avatar
                                avatar={contact.avatar}
                                initial={contact.initial || contact.name?.charAt(0)}
                                name={contact.name}
                                size="lg"
                                online={true}
                            />
                            <div style={{ 
                                position: 'absolute', 
                                bottom: 2, 
                                right: 2, 
                                width: 12, 
                                height: 12, 
                                background: '#10b981', 
                                borderRadius: '50%', 
                                border: `2.5px solid ${bg}`,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }} />
                        </div>
                        <span style={{ 
                            ...ba(11, 600, { 
                                color: textC, 
                                marginTop: 10, 
                                maxWidth: 64, 
                                textAlign: 'center',
                                fontSize: '0.65rem',
                                letterSpacing: 0.3
                            }) 
                        }} className="truncate">
                            {contact.name?.split(' ')[0]}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ContactsList;
