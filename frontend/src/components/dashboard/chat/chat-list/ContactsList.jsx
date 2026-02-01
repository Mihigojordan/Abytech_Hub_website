import React from 'react';
import Avatar from '../ui/Avatar';

/**
 * Contacts list component - horizontal scrolling contacts with avatars
 */
const ContactsList = ({ contacts }) => {
    return (
        <div className="px-4 py-4 bg-white border-b border-gray-200">
            <div className="flex space-x-4">
                {contacts.map((contact) => (
                    <div key={contact.id} className="flex flex-col items-center">
                        <Avatar
                            avatar={contact.avatar}
                            name={contact.name}
                            size="lg"
                        />
                        <span className="text-xs text-gray-600 mt-1">{contact.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContactsList;
