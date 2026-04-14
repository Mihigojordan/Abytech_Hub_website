# BUGS.md

## 1. Uploads Static Path Does Not Match Real Directory
- Area: Backend uploads / file serving
- Observed evidence: `backend/src/main.ts` serves `join(__dirname, '..', 'Uploads')`, while the repo contains `backend/uploads/` and Multer writes to `process.cwd()/uploads/...` in `backend/src/common/utils/file-upload.utils.ts`.
- Probable cause: Case and base-path drift between bootstrap code and upload helper.
- Suggested fix direction: Serve the real `uploads` directory from process cwd or a single shared constant.
- Confidence: high

## 2. Report Update/Delete/Reply Endpoints Are Not Properly Guarded
- Area: Backend auth / reports
- Observed evidence: `backend/src/modules/report-management/report.controller.ts` protects `POST /report` and `GET /report`, but `PUT /report/:id`, `DELETE /report/:id`, and `POST /report/:id/reply` have no `@UseGuards(AdminJwtAuthGuard)`. The reply endpoint trusts `adminId` from request body.
- Probable cause: Permission/auth checks were added only to the list/create flow.
- Suggested fix direction: Require authenticated admin context on all report mutations and source admin identity from JWT, not request body.
- Confidence: high

## 3. Public Internship Flow Has No Server-Side Draft API
- Area: Frontend public internship flow / backend contract
- Observed evidence: the repaired `/internship` flow now submits through `POST /internships/apply`, but the backend exposes no public create-draft, update-draft, or resume endpoint.
- Probable cause: backend internship module only implements public final submission plus admin management endpoints.
- Suggested fix direction: if resumable drafts are required across devices or sessions, add a public draft lifecycle endpoint set and attach the frontend wizard to it.
- Confidence: high

## 4. Internship Acceptance Previously Auto-Created Employee/Admin Accounts
- Area: Backend internship admission workflow
- Observed evidence: `backend/src/modules/internship-management/internship.service.ts` used to call `adminService.registerAdmin(...)` inside `updateStatus(..., 'ACCEPTED')`.
- Probable cause: intern admission and employee onboarding were coupled into a single acceptance action.
- Current state: accepted applicants now persist `employmentStatus = INTERN`, explicit conversion changes `employmentStatus` to `FULL_TIME_EMPLOYEE` or `PART_TIME_EMPLOYEE`, and Intern Management keeps converted interns visible as part of internship lifecycle history instead of dropping them from the page.
- Confidence: high

## 5. PWA Mode Forces Navigation Into Admin Dashboard
- Area: Frontend app shell / public routing
- Observed evidence: `frontend/src/layouts/MainLayout.jsx` checks display-mode standalone and immediately navigates to `/admin/dashboard`.
- Probable cause: PWA was treated as admin-only without isolating public install paths.
- Suggested fix direction: gate that redirect behind auth or a dedicated admin-PWA entry condition.
- Confidence: high

## 6. Secrets Are Committed In Source Control
- Area: Security / environment management
- Observed evidence: live-looking credentials and keys are present in `backend/.env` and `frontend/.env`.
- Probable cause: local development secrets were committed directly.
- Suggested fix direction: rotate secrets, replace with `.env.example`, and remove sensitive values from version control.
- Confidence: high

## 7. Dual Socket Ownership Can Cause Duplicate Real-Time Connections
- Area: Frontend real-time state
- Observed evidence: `frontend/src/main.jsx` wraps the app in `SocketProvider`, but `frontend/src/context/AdminAuthContext.jsx` also opens a separate raw `socket.io-client` connection for permission updates.
- Probable cause: permission real-time support was added outside the shared socket abstraction.
- Suggested fix direction: route permission events through `SocketContext` or a single real-time layer.
- Confidence: medium

## 8. JWT Secret Naming Is Inconsistent
- Area: Backend auth/config
- Observed evidence: most guards/modules use `Jwt_SECRET_KEY`, while `backend/src/modules/notification/notification.module.ts` registers JWT with `process.env.Jwt_SECRET`.
- Probable cause: partial rename of env variables.
- Suggested fix direction: standardize on one env name and update module registration plus docs.
- Confidence: medium

## 9. Legacy Router File Creates Confusion About Active Routes
- Area: Frontend routing ownership
- Observed evidence: `frontend/src/main.jsx` imports `App.jsx`, but `frontend/src/abt.jsx` contains a second full router with overlapping routes and outdated page wiring.
- Probable cause: an older router variant was left in source.
- Suggested fix direction: confirm it is unused, then remove or archive it to prevent future edits going to the wrong file.
- Confidence: medium

## 10. Google Drive Integration Appears Unused
- Area: Backend integrations / dead code
- Observed evidence: `DriveModule` is imported in `backend/src/app.module.ts`, but `rg` finds no feature module consuming `DriveService`.
- Probable cause: abandoned or incomplete integration.
- Suggested fix direction: either wire it into a real flow or remove it from runtime imports.
- Confidence: medium
