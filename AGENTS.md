# AGENTS.md

## Stack Summary
- Frontend: React 18 + Vite 6 + React Router 7, mostly JavaScript with a few TypeScript files, Tailwind CSS v4, axios, socket.io-client, Vite PWA.
- Backend: NestJS 11 + Prisma + MySQL, cookie-based JWT auth, Socket.IO gateways, Cloudinary uploads, Brevo email, Google OAuth, web-push.
- Persistence: Prisma schema in `backend/prisma/schema.prisma`, generated client in `backend/generated/prisma`.

## How To Run
- Frontend dev: `cd frontend && npm run dev`
- Frontend build: `cd frontend && npm run build`
- Frontend lint: `cd frontend && npm run lint`
- Backend dev: `cd backend && npm run start:dev`
- Backend build: `cd backend && npm run build`
- Backend tests: `cd backend && npm run test`
- Backend e2e: `cd backend && npm run test:e2e`

## Environment Notes
- Frontend reads: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_VAPID_PUBLIC_KEY`, `VITE_ADMIN_CLIENT_ID`, `VITE_ADMIN_CALLBACK_URL`, EmailJS keys.
- Backend code reads: `DATABASE_URL`, `PORT`, `FRONTEND_URL`, `FRONTEND_URL_ONLY`, `Jwt_SECRET_KEY`, `Jwt_SECRET`, `ADMIN_CLIENT_ID`, `ADMIN_CLIENT_SECRET`, `ADMIN_CALLBACK_URL`, `GOOGLE_SERVICE_ACCOUNT_KEY`, `CLOUDINARY_*`, `BREVO_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `VAPID_*`, `APP_URL`.
- Secrets are currently committed in `.env` files. Do not copy them into new docs or code comments.

## Key Module Ownership
- Frontend app shell/routing: `frontend/src/App.jsx`, `frontend/src/main.jsx`
- Frontend auth/session: `frontend/src/context/AdminAuthContext.jsx`
- Frontend shared API client: `frontend/src/api/api.ts`
- Frontend dashboard shell: `frontend/src/layouts/DashboardLayout.tsx`
- Frontend chat: `frontend/src/pages/dashboard/ChatAppPage.tsx`, `frontend/src/hooks/chat`, `frontend/src/components/dashboard/chat`
- Frontend services: `frontend/src/services/*`
- Backend bootstrap: `backend/src/main.ts`, `backend/src/app.module.ts`
- Backend auth/admin: `backend/src/modules/admin-management`
- Backend user auth: `backend/src/modules/user-auth`
- Backend feature modules: `backend/src/modules/*`
- Backend guards: `backend/src/guards/*`
- Backend uploads: `backend/src/common/utils/file-upload.utils.ts`, `backend/uploads/`

## Conventions Observed
- Frontend uses route-level pages in `src/pages`, shared UI in `src/components`, and thin service wrappers over axios in `src/services`.
- Backend modules generally keep `controller + service + module` together under `src/modules/<feature>`.
- Auth is cookie-based. Frontend axios is configured with `withCredentials: true`.
- Data validation is mostly manual inside controllers/services; DTO/class-validator patterns are not consistently used.
- JSON blobs in Prisma are used heavily for nested structures instead of dedicated relational tables.
- Code style is mixed JS/TS and mixed naming. Preserve local conventions inside the file you touch rather than trying to normalize the whole repo.

## Edit Safety Rules
- Start by reading the feature module/page end to end. There is existing drift and duplicate ownership.
- Do not assume `git status` only shows your work. This repo is already dirty.
- Avoid broad refactors across frontend and backend in one pass unless the contract is fully understood.
- Be careful around auth, permissions, chat, notifications, and uploads. These areas have cross-cutting behavior.
- Do not casually delete `frontend/src/abt.jsx`, `backend/src/global/notification/*`, or similar suspicious files without confirming they are truly unused in the current deployment path.
- Do not run backend lint as-is if you are trying to avoid file churn; its script uses `--fix`.

## What Not To Change Casually
- `frontend/src/context/AdminAuthContext.jsx` and `frontend/src/context/SocketContext.jsx`
- `backend/src/guards/*`
- `backend/src/modules/chat/*`
- `backend/src/modules/notification/*` and `backend/src/modules/admin-management/notification/*`
- `backend/src/common/utils/file-upload.utils.ts`
- Prisma model names and JSON field shapes used by existing pages

## Validation Before Finishing
- Re-read imports and file paths in every file you touched.
- Prefer `frontend` lint for safe validation when touching frontend code.
- Prefer `backend` build for safe TypeScript validation when touching backend code.
- If you touch markdown/docs only, at minimum verify the referenced paths and commands still exist.
- Report any pre-existing failures separately from failures caused by your changes.
