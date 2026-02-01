// Emoji list for EmojiPicker
export const emojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
    '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
    '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
    '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫',
    '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳',
    '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭',
    '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️',
    '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '❤️',
    '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️',
    '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔥', '✨', '💫'
];

// Users array - all participants in the chat
export const users = [
    { id: 1, name: 'You', isCurrentUser: true },
    { id: 2, name: 'Patrick Hendricks' },
    { id: 3, name: 'Mark Messer' },
    { id: 4, name: 'Steve Walker' },
    { id: 5, name: 'John Howard' },
    { id: 6, name: 'Doris Brown' },
    { id: 7, name: 'Admin' },
    { id: 8, name: 'Albert Rodarte' },
    { id: 9, name: 'Mirta George' },
    { id: 10, name: 'Paul Haynes' }
];

// Current logged-in user ID
export const currentUserId = 1;

// Message types
export const MESSAGE_TYPES = {
    TEXT: 'text',
    IMAGE: 'image',
    FILE: 'file',
    COMBINED: 'combined'
};

// Default avatar colors
export const AVATAR_COLORS = [
    'bg-indigo-200',
    'bg-indigo-300',
    'bg-purple-200',
    'bg-blue-200',
    'bg-green-200',
    'bg-pink-200',
    'bg-yellow-200',
    'bg-red-200'
];

// Get avatar color based on initial or ID
export const getAvatarColor = (initial, id) => {
    const index = initial ? initial.charCodeAt(0) % AVATAR_COLORS.length : id % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
};
