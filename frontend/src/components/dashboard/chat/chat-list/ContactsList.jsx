import React from 'react';
import Avatar from '../ui/Avatar';

/**
 * Contacts list component - horizontal scrolling contacts with avatars
 */
const ContactsList = ({ contacts = [], onlineUsers = new Map() }) => {
    // Helper function to check if a contact is online
    const isContactOnline = (contactId) => {
        // Contacts can be either ADMIN or USER type
        // Check if the contact ID exists in onlineUsers Map
        return onlineUsers.has(contactId);
    };

    // Filter to show only online contacts
    const onlineContacts = contacts.filter(contact =>
        isContactOnline(contact.contactId || contact.id)
    );

    if (onlineContacts.length === 0) {
        return null; // Don't show if no one is online
    }

    return (
        <div className="px-4 py-4 bg-white border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Online ({onlineContacts.length})</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-thin">
                {onlineContacts.map((contact) => (
                    <div
                        key={contact.id}
                        className="flex flex-col items-center min-w-[60px] cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        <div className="relative">
                            <Avatar
                                avatar={contact.avatar}
                                name={contact.name}
                                size="lg"
                                online={true}
                            />
                        </div>
                        <span className="text-xs text-gray-600 mt-1 truncate max-w-[60px] text-center">
                            {contact.name?.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactsList;
