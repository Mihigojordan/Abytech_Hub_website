# DECISIONS.md

## Patterns To Preserve
- Keep feature-oriented backend modules under `backend/src/modules/<feature>`.
- Keep frontend API access behind `frontend/src/services/*` instead of scattering raw axios calls through pages.
- Preserve cookie-based auth plus `withCredentials` unless the auth model is intentionally redesigned.
- Preserve the permission-name contract already used by backend and frontend:
  `meeting_management`, `hosted_website`, `research_management`, `weekly_management`, `chat_management`, `employee_management`, `expense_management`, `report_management`, `internship_management`, `salary_management`.

## Patterns To Phase Out
- Duplicate runtime ownership for the same concern:
  notifications, routing, and socket setup are all split today.
- Manual JSON parsing in controllers for multipart forms.
- Hardcoded origins and env fallbacks inside runtime code.
- Large JSON columns for structures that are starting to behave like first-class entities.

## Inferred Naming / Ownership Conventions
- Backend controllers are mounted directly from feature names and mostly use plural route prefixes when the resource is collection-shaped.
- Dashboard pages usually mirror backend module names closely, even when filenames differ slightly.
- Admin-facing service wrappers follow `<feature>Service.js` naming and usually map 1:1 to backend route prefixes.

## Decisions Made While Creating These Docs
- Treated `frontend/src/App.jsx` as the active router and `frontend/src/abt.jsx` as suspicious/dead because `main.jsx` imports `App.jsx`.
- Treated `backend/src/global/notification/*` as legacy/dead-code territory because `AppModule` does not import `global/notification/notification.module.ts`.
- Documented uncertainty where ownership is split instead of inventing a single intended architecture.
- Kept recommendations lightweight and prioritized concrete defects over style cleanup.

## Decisions Made During Internship Flow Repair
- Kept `/internship` on the existing route entry but changed `frontend/src/pages/InternshipApplicationPage.jsx` to delegate to the real wizard in `frontend/src/pages/InternsPortal.jsx`.
- Reused `frontend/src/services/internshipService.js` and aligned the wizard to the real backend public contract at `POST /internships/apply`.
- Kept Save Progress as browser-local storage only because the backend currently has no public draft/update endpoints.

## Decisions Made During Intern Management Workflow Change
- Added an explicit internship employment lifecycle on `InternshipApplication` so accepted applicants persist as `INTERN` and explicit conversion persists `FULL_TIME_EMPLOYEE`.
- Kept Employee Management separate from internship lifecycle history; explicit conversion creates or updates the user-backed employee record without removing the internship record.
- Added a separate super-admin-only employee transition action that records `FULL_TIME` or `PART_TIME` on the user-backed employee record while preserving internship-side lifecycle state.
- Kept Intern Management lifecycle-based: converted interns remain visible there after conversion, and the page now shows whether they became `FULL_TIME_EMPLOYEE` or `PART_TIME_EMPLOYEE` instead of removing them.
