import React, { lazy } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { SW, PermissionRoute, SuperAdminRoute } from "./wrappers";
import ProtectPrivateAdminRoute from "../components/protectors/ProtectPrivateAdminRoute";

const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const DashboardHome = lazy(() => import("../pages/dashboard/DashboardHome"));
const ExpenseDashboard = lazy(() => import("../pages/dashboard/ExpenseDashboard"));
const EmployeeeDashboard = lazy(() => import("../pages/dashboard/EmployeeManagement"));
const ReportDashboard = lazy(() => import("../pages/dashboard/ReportManagement"));
const UpsertReportPage = lazy(() => import("../components/dashboard/report/UpsertReportPage"));
const ReportViewPage = lazy(() => import("../components/dashboard/report/ReportViewPage"));
const AdminProfilePage = lazy(() => import("../pages/dashboard/AdminProfile"));
const AdminProfileEdit = lazy(() => import("../pages/EditProfilePage"));
const PermissionManagement = lazy(() => import("../pages/dashboard/PermissionManagement"));
const ChatApp = lazy(() => import("../pages/dashboard/ChatAppPage"));
const MeetingManagement = lazy(() => import("../pages/dashboard/MeetingManagement"));
const MeetingFormPage = lazy(() => import("../pages/dashboard/MeetingFormPage"));
const MeetingViewPage = lazy(() => import("../pages/dashboard/MeetingViewPage"));
const WeeklyGoalManagement = lazy(() => import("../pages/dashboard/WeeklyGoalManagement"));
const WeeklyGoalFormPage = lazy(() => import("../pages/dashboard/WeeklyGoalFormPage"));
const WeeklyGoalViewPage = lazy(() => import("../pages/dashboard/WeeklyGoalViewPage"));
const InternshipManagement = lazy(() => import("../pages/dashboard/InternshipManagement"));
const InternManagement = lazy(() => import("../pages/dashboard/InternManagement"));
const InternshipViewPage = lazy(() => import("../pages/dashboard/InternshipViewPage"));
const HostedWebsiteManagement = lazy(() => import("../pages/dashboard/HostedWebsiteManagement"));
const DemoRequestManagement = lazy(() => import("../pages/dashboard/DemoRequestManagement"));
const ResearchManagement = lazy(() => import("../pages/dashboard/ResearchManagement"));
const ResearchFormPage = lazy(() => import("../pages/dashboard/ResearchFormPage"));
const ResearchViewPage = lazy(() => import("../pages/dashboard/ResearchViewPage"));
const SalaryManagement = lazy(() => import("../pages/dashboard/SalaryManagement"));
const DataExportPage = lazy(() => import("../pages/dashboard/DataExportPage"));

const adminRoutes = [
  {
    path: "/admin",
    element: <ProtectPrivateAdminRoute><Outlet /></ProtectPrivateAdminRoute>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      {
        path: "dashboard",
        element: <SW><DashboardLayout /></SW>,
        children: [
          { index: true, element: <SW><DashboardHome /></SW> },
          { path: "expense", element: <PermissionRoute permission="expense_management"><SW><ExpenseDashboard /></SW></PermissionRoute> },
          { path: "employee", element: <PermissionRoute permission="employee_management"><SW><EmployeeeDashboard /></SW></PermissionRoute> },
          { path: "interns", element: <PermissionRoute permission="internship_management"><SW><InternManagement /></SW></PermissionRoute> },
          { path: "report", element: <SW><ReportDashboard /></SW> },
          { path: "report/create", element: <SW><UpsertReportPage /></SW> },
          { path: "report/edit/:id", element: <SW><UpsertReportPage /></SW> },
          { path: "report/view/:id", element: <SW><ReportViewPage /></SW> },
          { path: "profile/:id", element: <SW><AdminProfilePage /></SW> },
          { path: "edit-profile/:id", element: <SW><AdminProfileEdit /></SW> },
          { path: "permissions", element: <SuperAdminRoute><SW><PermissionManagement /></SW></SuperAdminRoute> },
          { path: "chat", element: <PermissionRoute permission="chat_management"><SW><ChatApp /></SW></PermissionRoute> },
          { path: "chat/:conversationId", element: <PermissionRoute permission="chat_management"><SW><ChatApp /></SW></PermissionRoute> },
          { path: "weekly-goals", element: <PermissionRoute permission="weekly_management"><SW><WeeklyGoalManagement /></SW></PermissionRoute> },
          { path: "weekly-goals/new", element: <PermissionRoute permission="weekly_management"><SW><WeeklyGoalFormPage /></SW></PermissionRoute> },
          { path: "weekly-goals/edit/:id", element: <PermissionRoute permission="weekly_management"><SW><WeeklyGoalFormPage /></SW></PermissionRoute> },
          { path: "weekly-goals/view/:id", element: <PermissionRoute permission="weekly_management"><SW><WeeklyGoalViewPage /></SW></PermissionRoute> },
          { path: "internships", element: <PermissionRoute permission="internship_management"><SW><InternshipManagement /></SW></PermissionRoute> },
          { path: "internships/view/:id", element: <PermissionRoute permission="internship_management"><SW><InternshipViewPage /></SW></PermissionRoute> },
          { path: "hosted-website", element: <PermissionRoute permission="hosted_website"><SW><HostedWebsiteManagement /></SW></PermissionRoute> },
          { path: "demo-request", element: <SW><DemoRequestManagement /></SW> },
          { path: "meetings", element: <PermissionRoute permission="meeting_management"><SW><MeetingManagement /></SW></PermissionRoute> },
          { path: "meetings/create", element: <PermissionRoute permission="meeting_management"><SW><MeetingFormPage /></SW></PermissionRoute> },
          { path: "meetings/edit/:id", element: <PermissionRoute permission="meeting_management"><SW><MeetingFormPage /></SW></PermissionRoute> },
          { path: "meetings/view/:id", element: <PermissionRoute permission="meeting_management"><SW><MeetingViewPage /></SW></PermissionRoute> },
          { path: "research", element: <PermissionRoute permission="research_management"><SW><ResearchManagement /></SW></PermissionRoute> },
          { path: "research/create", element: <PermissionRoute permission="research_management"><SW><ResearchFormPage /></SW></PermissionRoute> },
          { path: "research/edit/:id", element: <PermissionRoute permission="research_management"><SW><ResearchFormPage /></SW></PermissionRoute> },
          { path: "research/view/:id", element: <PermissionRoute permission="research_management"><SW><ResearchViewPage /></SW></PermissionRoute> },
          { path: "salary", element: <PermissionRoute permission="salary_management"><SW><SalaryManagement /></SW></PermissionRoute> },
          { path: "data-export", element: <PermissionRoute permission="data_export_management"><SW><DataExportPage /></SW></PermissionRoute> },
        ],
      },
    ],
  },
];

export default adminRoutes;
