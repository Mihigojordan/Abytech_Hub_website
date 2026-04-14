# PROJECT_BRIEF.md

## What This Project Appears To Be
Abytech Hub is a combined marketing site and internal admin platform. The public side presents company pages, services, blog/insights, contact, and an internship application entry point. The admin side manages staff profiles, reports, expenses, meetings, research, internship applications, hosted websites, salaries, weekly goals, permissions, notifications, and real-time chat.

## Main User Types
- Public visitor
- Internship applicant
- Admin employee
- Super admin
- Authenticated non-admin chat/user account via `user-auth` endpoints

## Frontend Summary
- Single Vite app in `frontend/`
- Public routes and admin dashboard live in the same router
- Admin access is guarded by `ProtectPrivateAdminRoute`
- Session/permission state is held in `AdminAuthContext`
- API access is mostly centralized through `src/services/*`
- Real-time features use Socket.IO plus a notification context

## Backend Summary
- Single NestJS app in `backend/`
- Feature modules are mounted directly from `AppModule`
- Prisma/MySQL is the main persistence layer
- Admin/user auth is cookie-based JWT, with Google OAuth for admins
- File uploads go through Multer helpers, then some flows forward files to Cloudinary
- Real-time behavior is split between a global socket gateway and a chat-specific gateway

## Current Implementation Status
- Public marketing pages exist and are mostly static/content-heavy.
- The admin dashboard is substantially implemented and backed by API modules.
- Chat, permissions, notifications, weekly goals, internships, meetings, research, and reports all have both frontend and backend code.
- Some public pages are unfinished or disconnected from backend flows.
- There is visible ownership drift: duplicate routers, duplicate notification implementations, unused integration modules, and mixed JS/TS conventions.

## Key Integrations
- Prisma/MySQL
- Cloudinary
- Google OAuth for admin login
- Brevo transactional email
- Web Push / VAPID
- Socket.IO
- EmailJS on the public contact page
- Google Maps embed

## Major Risks / Gaps
- Secrets are committed in repo `.env` files.
- Upload/static file handling is inconsistent between local disk paths, Cloudinary URLs, and `/uploads` serving.
- Auth and permission boundaries are inconsistent across some backend endpoints.
- Notification/socket responsibilities are spread across multiple modules/contexts.
- The internship public flow is likely unfinished on the frontend despite backend support existing.
