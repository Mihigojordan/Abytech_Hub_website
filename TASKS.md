# TASKS.md

## Critical Bugs
- Fix backend upload static serving mismatch between `Uploads` in `backend/src/main.ts` and the real `backend/uploads` directory.
- Lock down unauthenticated report mutations in `backend/src/modules/report-management/report.controller.ts`.
- Remove committed secrets from `frontend/.env` and `backend/.env`, rotate them, and add sanitized examples.

## Broken Or Suspicious Flows
- Add public internship draft/resume endpoints if draft persistence needs to survive browser-local storage.
- Run the Prisma migration that adds `InternshipApplication.employmentStatus` before deploying the intern/full-time separation workflow.
- Backfill or normalize older accepted internship records with `employmentStatus = null`; Intern Management now treats them as interns for conversion visibility, but the data should still be normalized in storage.
- Verify admin PWA startup flow; `frontend/src/layouts/MainLayout.jsx` always redirects PWA mode to `/admin/dashboard`.
- Verify Google admin login redirect targets; frontend login page uses `loginWithGoogle(false)` while backend callback logic relies on `FRONTEND_URL_ONLY`.
- Audit notification endpoints and consumers across `modules/notification`, `modules/admin-management/notification`, and `global/notification`.
- Check chat/socket behavior for duplicate connections caused by both `SocketProvider` and `AdminAuthContext`.
- Review report upload/view URLs end to end after the upload-path fix.

## Architecture Cleanup
- Replace manual request parsing with DTOs/class-validator on backend write endpoints.
- Standardize JWT env naming on backend; code currently reads both `Jwt_SECRET_KEY` and `Jwt_SECRET`.
- Decide whether Google Drive support is real or dead; `DriveModule` is imported but no feature module uses `DriveService`.
- Separate generated/build/runtime artifacts from source control where possible (`dist`, `dev-dist`, uploads, SQL dumps).

## UX / UI Inconsistencies
- Normalize service page routing and remove dead `ServicePage`/`ServiceSingle` ownership if unused.
- Align dashboard styling patterns; newer pages use more structured Tailwind systems than older pages.
- Replace `alert()` usage on public contact flow with the project’s existing feedback pattern.
- Review inconsistent route casing such as `/Story` and `/Vision-mission`.

## Tech Debt
- Add explicit tests around auth guards, permission assignment, and report visibility rules.
- Add a root architecture README that points to the six memory docs and app-specific run instructions.
- Reduce `// @ts-nocheck` usage in dashboard chat files.
- Remove noisy debug logging across auth, push notification, and socket code.
