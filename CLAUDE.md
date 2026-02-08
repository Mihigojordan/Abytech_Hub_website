# Abytech Hub Website

A full-stack web application with a NestJS backend and React frontend.

## Project Structure

```
├── backend/          # NestJS API server
│   ├── src/
│   │   ├── modules/  # Feature modules
│   │   │   ├── admin-management/
│   │   │   ├── chat/
│   │   │   ├── expense-managment/
│   │   │   ├── report-management/
│   │   │   ├── research-management/
│   │   │   └── user-auth/
│   │   └── common/   # Shared utilities
│   └── prisma/       # Database schema & migrations
│
├── frontend/         # React + Vite application
│   └── src/
│       ├── api/          # API client
│       ├── components/   # React components
│       ├── context/      # React context providers
│       ├── hooks/        # Custom hooks
│       ├── layouts/      # Page layouts
│       ├── pages/        # Page components
│       ├── services/     # Service layer
│       └── utils/        # Utility functions
```

## Tech Stack

### Backend
- **Framework**: NestJS 11
- **Database**: Prisma ORM (PostgreSQL)
- **Auth**: Passport.js, JWT, Google OAuth
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Cache**: Redis (ioredis)
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion, AOS
- **Rich Text**: TipTap, Quill
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **PWA**: Workbox

## Common Commands

### Backend
```bash
cd backend
npm run start:dev     # Start dev server with hot reload
npm run build         # Build for production
npm run start:prod    # Run production build
npm run lint          # Run ESLint
npm run test          # Run tests
```

### Frontend
```bash
cd frontend
npm run dev           # Start Vite dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

## Key Conventions

- Backend follows NestJS modular architecture (controller, service, module pattern)
- Frontend uses React functional components with hooks
- API endpoints follow REST conventions
- TypeScript in backend, JSX in frontend
- Prisma for database migrations and queries

---

## Chat Feature Documentation

### Architecture Overview

The chat feature uses a real-time architecture with REST API for CRUD operations and WebSocket (Socket.io) for live messaging.

```
Frontend (React)                    Backend (NestJS)
├── ChatAppPage.tsx                 ├── chat.module.ts
├── SocketContext.jsx ──WebSocket──→├── chat.gateway.ts
├── chatService.js ────REST API────→├── chat.controller.ts
└── useMessages.js                  ├── chat.service.ts
                                    └── cache.service.ts
```

### Database Models (Prisma)

| Model | Purpose |
|-------|---------|
| Conversation | Chat room/group with `isGroup`, `name`, `avatar` |
| ConversationParticipant | Members with `role` (admin/member), `lastReadMessageId` |
| Message | Content with `type` (text/image/file/combined), `replyToMessageId` |
| MessageImage | Image attachments with `imageUrl`, `imageOrder` |
| MessageFile | File attachments with `fileName`, `fileSize`, `fileUrl` |
| MessageReader | Read receipts tracking |
| Contact | User contacts list |

**Note**: Uses polymorphic design with `ParticipantType` enum (ADMIN/USER) instead of foreign keys.

### Backend API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/chat/conversations` | List user's conversations |
| GET | `/chat/conversations/:id` | Get conversation details |
| POST | `/chat/conversations` | Create new conversation |
| GET | `/chat/conversations/:id/messages` | Fetch messages (cursor pagination) |
| POST | `/chat/conversations/:id/messages` | Send message with files |
| PATCH | `/chat/messages/:id` | Edit message |
| DELETE | `/chat/messages/:id` | Delete message |
| POST | `/chat/messages/:id/read` | Mark message as read |
| POST | `/chat/conversations/:id/mark-read` | Mark all as read |
| POST | `/chat/messages/:id/reply` | Reply to message |
| POST | `/chat/messages/forward` | Forward messages |

### WebSocket Events

**Client → Server:**
- `user:online` - Register user presence
- `typing:start` / `typing:stop` - Typing indicators

**Server → Client:**
- `message:new` - New message broadcast
- `message:edited` / `message:deleted` - Message updates
- `message:read` - Read receipt
- `user:status` - Online/offline status
- `typing:active` / `typing:inactive` - Typing indicators

### Frontend Components

```
ChatAppPage (Main Container)
├── Sidebar - Navigation icons, AdminList modal
├── ChatList - Conversation list with search
├── ChatArea - Main chat interface
│   ├── ChatHeader - Conversation info
│   ├── MessagesContainer - Scrollable messages
│   │   └── CombinedMessage (Text + Images + Files)
│   ├── EditReplyBar - Edit/Reply preview
│   └── MessageInput - Text, emoji, file upload
├── MediaViewer - Full-screen media viewer
└── ForwardModal - Forward messages
```

### Custom Hooks

- `useMessages` - Message CRUD, pagination, socket updates
- `useFileUpload` - File upload state
- `useTypingIndicator` - Typing detection and display
- `useAutoRead` - Auto-mark messages as read
- `useScrollManagement` - Scroll behavior, load more

### Key Files

**Backend:**
- `backend/src/modules/chat/chat.module.ts`
- `backend/src/modules/chat/chat.controller.ts`
- `backend/src/modules/chat/chat.service.ts`
- `backend/src/modules/chat/chat.gateway.ts`
- `backend/src/modules/chat/cache.service.ts`
- `backend/prisma/schema.prisma` (lines 376-556)

**Frontend:**
- `frontend/src/pages/dashboard/ChatAppPage.tsx`
- `frontend/src/layouts/chat/` (Sidebar, ChatList, ChatArea)
- `frontend/src/components/chat/` (Message components)
- `frontend/src/hooks/chat/` (Custom hooks)
- `frontend/src/services/chatService.js`
- `frontend/src/context/SocketContext.jsx`

---

## Environment Variables

### Backend (.env)
```
FRONTEND_URL=http://localhost:5173  # For WebSocket CORS
```

### Frontend (.env)
```
VITE_SOCKET_URL=http://localhost:3001  # Socket.io server URL
```

---

## Known Issues & Improvements Needed

### Critical Security Issues

1. **WebSocket No Authentication** - Socket connections accepted without JWT validation. User identified only after `user:online` event. Risk of identity spoofing.

### Performance Issues

2. **No Virtual Scrolling** - All messages loaded in memory, could crash with 1000+ messages.
3. **Memory Leak Risk** - CacheService has no size limits, typing indicators not always cleaned up.

### Missing Features

4. **No Contact Deletion** - `addContact()` exists but no `removeContact()`.
5. **No Group Admin Controls** - Can't change group name/avatar, no member removal.
6. **Message Search Unused** - Fulltext index exists in schema but no search endpoint.
7. **No Optimistic Updates** - Messages wait for backend confirmation before appearing.
8. **No Retry Mechanism** - Failed sends show alert(), no retry or offline queue.

### Code Quality Issues

9. **TypeScript Disabled** - `ChatAppPage.tsx` uses `@ts-nocheck` directive.
10. **Duplicate MessageContext** - Both direct hook usage and unused context provider.
11. **Cloudinary Unused** - Injected but files stored locally instead.

### Data Consistency

12. **Race Condition** - `createConversation()` duplicate check can fail under concurrency.
13. **Unread Count Discrepancy** - Two sources (API and client-side) can diverge.

---

## Recently Fixed Issues

- **CORS Wildcard** - Now uses `FRONTEND_URL` env variable
- **Hardcoded Socket URL** - Now uses `VITE_SOCKET_URL` env variable
- **Unread Endpoint No Auth** - Now uses authenticated user from request
- **N+1 Query in getContacts** - Batch fetches user details
- **N+1 Query in enrichMessages** - Already uses batch fetching
- **Edit/Reply State Not Cleared** - Now clears when switching conversations
- **Debug Console Logs** - Removed from production code
- **Forward Messages Not Enriched** - Forwarded messages now include sender details before broadcast
- **Forward Messages Real-time** - Forwarded messages broadcast to ALL participants including forwarder
- **Delete Messages Real-time** - Delete broadcasts to ALL participants for real-time sync
- **Bulk Action Handler Bug** - Fixed `allMessages` being treated as array instead of object
