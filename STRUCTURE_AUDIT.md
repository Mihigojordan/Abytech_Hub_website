# STRUCTURE_AUDIT.md

## Important Directories
- `frontend/src/App.jsx`
  Owns the active router for public pages and `/admin/*`.
- `frontend/src/layouts`
  Owns `MainLayout` for public pages and `DashboardLayout` for admin pages.
- `frontend/src/context`
  Owns admin auth/session, socket connection, notifications, and message context.
- `frontend/src/services`
  Owns HTTP wrappers for backend modules.
- `frontend/src/pages`
  Owns route-level screens. `pages/dashboard` mirrors the admin modules.
- `frontend/src/components/dashboard`
  Owns reusable admin UI, especially report/profile/chat pieces.
- `frontend/src/hooks/chat` and `frontend/src/utils/chat`
  Own chat-specific client behavior and message shaping.
- `backend/src/modules/admin-management`
  Owns admin CRUD, login/logout, Google OAuth, profile update, lock/unlock.
- `backend/src/modules/user-auth`
  Owns non-admin user registration/login/profile.
- `backend/src/modules/chat`
  Owns chat REST APIs, chat gateway, and online presence cache.
- `backend/src/modules/notification`
  Owns persisted in-app notifications and push dispatch integration.
- `backend/src/modules/admin-management/notification`
  Owns admin push subscription endpoints under the same `/notifications` prefix.
- `backend/src/global/*`
  Shared services for email, Cloudinary, sockets, Google Drive, and an older notification implementation.

## Backend Route To Module Mapping
- `/admin` -> `modules/admin-management/admin.controller.ts`
- `/user-auth` -> `modules/user-auth/user-auth.controller.ts`
- `/chat` -> `modules/chat/chat.controller.ts`
- `/report` -> `modules/report-management/report.controller.ts`
- `/expense` -> `modules/expense-managment/expense.controller.ts`
- `/meetings` -> `modules/meeting-management/meeting.controller.ts`
- `/research` -> `modules/research-management/research.controller.ts`
- `/internships` -> `modules/internship-management/internship.controller.ts`
- `/demo-requests` -> `modules/demo-request-management/demo-request.controller.ts`
- `/weekly-goals` -> `modules/weekly-goal-management/weekly-goal.controller.ts`
- `/hosted-websites` -> `modules/hosted-website-management/hosted-website.controller.ts`
- `/salary` -> `modules/salary-management/salary.controller.ts`
- `/permissions` -> `modules/permission-management/permission.controller.ts`
- `/notifications` -> `modules/notification/notification.controller.ts`
- `/notifications/*` admin push endpoints -> `modules/admin-management/notification/notifications.controller.ts`
- `/push-notification` -> `modules/push-notification/push-notification.controller.ts`
- `/cloudinary` -> `global/cloudinary/cloudinary.controller.ts`

## Major Frontend Route To Page Mapping
- `/` -> `pages/HomePage.jsx`
- `/blogs`, `/insights` -> `pages/blogs/Insights.jsx`
- `/blog/:id` -> `pages/blogs/Blogsingle.jsx`
- `/services` -> `pages/services/Services.jsx`
- `/about-us` -> `pages/about us/aboutUs.jsx`
- `/empowering-inclusion` -> `pages/about us/Empowering.jsx`
- `/values` -> `pages/about us/OurValues.jsx`
- `/Story` -> `pages/about us/Storyimpactculturepage.jsx`
- `/Vision-mission` -> `pages/about us/VisionAndVision.jsx`
- `/who-we-are` -> `pages/about us/WhoWeArePage.jsx`
- `/training` -> `pages/Programs/Training.jsx`
- `/internship` -> `pages/InternshipApplicationPage.jsx`
- `/internship/application/portal` -> `pages/InternsPortal.jsx`
- `/contact-us` -> `pages/ContactUs.jsx`
- `/demo` -> `components/Demo.jsx`
- `/auth/admin/login` -> `pages/auth/admin/Login.jsx`
- `/auth/admin/unlock` -> `pages/auth/admin/UnlockScreen.tsx`
- `/admin/dashboard/*` -> dashboard pages in `pages/dashboard` plus some component-backed screens in `components/dashboard`

## Confusing / Duplicate Ownership
- Notifications have three separate areas:
  `backend/src/modules/notification`, `backend/src/modules/admin-management/notification`, and `backend/src/global/notification`.
- Frontend has two router files:
  active `frontend/src/App.jsx` and likely dead `frontend/src/abt.jsx`.
- Service page ownership is split:
  `pages/services/Services.jsx` is routed, while `ServicePage.jsx` and `ServiceSingle.jsx` still exist and are referenced in the dead router.
- Socket ownership is split between `SocketContext` and a second raw socket connection inside `AdminAuthContext`.
- Backend upload handling mixes local disk paths, `/uploads` URLs, and Cloudinary-hosted URLs.

## Cleanup Recommendations For Later
- Consolidate notification ownership into one persisted notification module plus one push delivery service.
- Remove or archive dead router/file variants after confirming they are not used in deployment.
- Centralize real-time connection ownership in one frontend socket layer.
- Add DTOs and validation schemas for write endpoints instead of ad hoc parsing in controllers.
- Replace large Prisma JSON fields with explicit tables where queryability matters.
