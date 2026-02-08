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
