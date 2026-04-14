import React, { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Protectors
import ProtectPrivateAdminRoute from "./components/protectors/ProtectPrivateAdminRoute";
import EmpoweringPage from "./pages/about us/Empowering";
import Values from "./pages/about us/OurValues";
import StoryImpactCulturePage from "./pages/about us/Storyimpactculturepage";
import MissionVisionPage from "./pages/about us/VisionAndVision";
import Whoweare from "./components/home/Whoweare";
import WhoWeArePage from "./pages/about us/WhoWeArePage";
const Services = lazy(() => import("./pages/services/Services"));
const Training = lazy(() => import("./pages/Programs/Training"));
const InternshipApplicationPage = lazy(() => import("./pages/InternshipApplicationPage"));
const DemoPage = lazy(() => import("./components/Demo"));

// Pages (Lazy)
const HomePage = lazy(() => import("./pages/HomePage"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const BlogPage = lazy(() => import("./pages/blogs/Insights"));
const BlogSingle = lazy(() => import("./pages/blogs/Blogsingle"));
const ServicePage = lazy(() => import("./pages/services/ServicePage"));
const ServiceSingle = lazy(() => import("./pages/services/ServiceSingle"));
const BlogContainer = lazy(() => import("../src/pages/blogs/blogContainer"));

// import DashboardLayout from "./layouts/DashboardLayout";
// import ProtectPrivateAdminRoute from "./components/protectors/ProtectPrivateAdminRoute";



import PWAPushNotifications from "./pages/PWATestingPage";

import ChatApp from "./pages/dashboard/ChatAppPage";
import MeetingManagement from "./pages/dashboard/MeetingManagement";
import MeetingFormPage from "./pages/dashboard/MeetingFormPage";
import MeetingViewPage from "./pages/dashboard/MeetingViewPage";
import WeeklyGoalManagement from "./pages/dashboard/WeeklyGoalManagement";
import WeeklyGoalFormPage from "./pages/dashboard/WeeklyGoalFormPage";
import WeeklyGoalViewPage from "./pages/dashboard/WeeklyGoalViewPage";
import InternshipManagement from "./pages/dashboard/InternshipManagement";
import InternManagement from "./pages/dashboard/InternManagement";
import InternshipViewPage from "./pages/dashboard/InternshipViewPage";
import HostedWebsiteManagement from "./pages/dashboard/HostedWebsiteManagement";
import DemoRequestManagement from "./pages/dashboard/DemoRequestManagement";
import ResearchManagement from "./pages/dashboard/ResearchManagement";
import ResearchFormPage from "./pages/dashboard/ResearchFormPage";
import ResearchViewPage from "./pages/dashboard/ResearchViewPage";
import SalaryManagement from "./pages/dashboard/SalaryManagement";
import useAdminAuth from "./context/AdminAuthContext";
const InternsPortal = lazy(() => import("./pages/InternsPortal"));
// Permission route wrapper — redirects to dashboard if no permission
const PermissionRoute = ({ permission, children }) => {
  const { hasPermission, isLoading, isSuperAdmin } = useAdminAuth();
  if (isLoading) return null;
  if (isSuperAdmin) return children; // Super admins bypass check
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

// Super Admin route wrapper
const SuperAdminRoute = ({ children }) => {
  const { isSuperAdmin, isLoading } = useAdminAuth();
  if (isLoading) return null;
  if (!isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

// Lazy-loaded pages
const ProjectsPage = lazy(() => import("./pages/Projects/ProjectPages"));
const AboutUs = lazy(() => import("./pages/about us/aboutUs"));
const TeamMember = lazy(() => import("./pages/Team"));
const AbyTechLocations = lazy(() => import("./pages/Location"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/auth/admin/Login"));
const UnlockScreen = lazy(() => import("./pages/auth/admin/UnlockScreen"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const ExpenseDashboard = lazy(() => import("./pages/dashboard/ExpenseDashboard"));

const EmployeeeDashboard = lazy(() => import("./pages/dashboard/EmployeeManagement"));
const ReportDashboard = lazy(() => import("./pages/dashboard/ReportManagement"));
const UpsertReportPage = lazy(() => import("./components/dashboard/report/UpsertReportPage"));
const ReportViewPage = lazy(() => import("./components/dashboard/report/ReportViewPage"));
const AdminProfilePage = lazy(() => import("./components/dashboard/profile/admin/ProfileSettings"));
const AdminProfileEdit = lazy(() => import("./pages/EditProfilePage"));
const PermissionManagement = lazy(() => import("./pages/dashboard/PermissionManagement"));

// Loading UI
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <p>Loading...</p>
  </div>
);

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
);

// Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      { path: "blogs", element: <SuspenseWrapper><BlogPage /></SuspenseWrapper> },
      { path: "insights", element: <SuspenseWrapper><BlogPage /></SuspenseWrapper> },
      { path: "blog/:id", element: <SuspenseWrapper><BlogSingle /></SuspenseWrapper> },

      // services
      { path: "services", element: <SuspenseWrapper><Services /></SuspenseWrapper> },

      // about 
      { path: "about-us", element: <SuspenseWrapper><AboutUs /></SuspenseWrapper> },
      { path: "empowering-inclusion", element: <SuspenseWrapper><EmpoweringPage /></SuspenseWrapper> },
      { path: "values", element: <SuspenseWrapper><Values /></SuspenseWrapper> },
      { path: "Story", element: <SuspenseWrapper><StoryImpactCulturePage /></SuspenseWrapper> },
      { path: "Vision-mission", element: <SuspenseWrapper><MissionVisionPage /></SuspenseWrapper> },
      { path: "who-we-are", element: <SuspenseWrapper><WhoWeArePage /></SuspenseWrapper> },

      { path: "team-member", element: <SuspenseWrapper><TeamMember /></SuspenseWrapper> },

      // training programs
      { path: "training", element: <SuspenseWrapper><Training /></SuspenseWrapper> },

      // internship application
      { path: "internship", element: <SuspenseWrapper><InternshipApplicationPage /></SuspenseWrapper> },
      { path: "internship/application/portal", element: <SuspenseWrapper><InternsPortal /></SuspenseWrapper> },


      { path: "contact-us", element: <SuspenseWrapper><ContactUs /></SuspenseWrapper> },

      // demo
      { path: "demo", element: <SuspenseWrapper><DemoPage /></SuspenseWrapper> },
    ],
  },


  {
    path: '/admin',
    element: <ProtectPrivateAdminRoute><Outlet /></ProtectPrivateAdminRoute>,
    children: [
      { index: true, element: <Navigate to={'/admin/dashboard'}></Navigate> },
      {
        path: 'dashboard',
        element: <SuspenseWrapper><DashboardLayout /> </SuspenseWrapper>,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: 'expense', element: <PermissionRoute permission="expense_management"><ExpenseDashboard /></PermissionRoute> },
          { path: 'employee', element: <PermissionRoute permission="employee_management"><EmployeeeDashboard /></PermissionRoute> },
          { path: 'interns', element: <PermissionRoute permission="internship_management"><InternManagement /></PermissionRoute> },
          { path: 'report', element: <ReportDashboard /> },
          { path: 'report/create', element: <UpsertReportPage /> },
          { path: 'report/edit/:id', element: <UpsertReportPage /> },
          { path: 'report/view/:id', element: <ReportViewPage /> },
          { path: 'profile/:id', element: <AdminProfilePage /> },
          { path: 'edit-profile/:id', element: <AdminProfileEdit /> },
          { path: 'permissions', element: <SuperAdminRoute><PermissionManagement /></SuperAdminRoute> },

          { path: 'chat', element: <PermissionRoute permission="chat_management"><ChatApp /></PermissionRoute> },
          { path: 'chat/:conversationId', element: <PermissionRoute permission="chat_management"><ChatApp /></PermissionRoute> },
          { path: 'weekly-goals', element: <PermissionRoute permission="weekly_management"><WeeklyGoalManagement /></PermissionRoute> },
          { path: 'weekly-goals/new', element: <PermissionRoute permission="weekly_management"><WeeklyGoalFormPage /></PermissionRoute> },
          { path: 'weekly-goals/edit/:id', element: <PermissionRoute permission="weekly_management"><WeeklyGoalFormPage /></PermissionRoute> },
          { path: 'weekly-goals/view/:id', element: <PermissionRoute permission="weekly_management"><WeeklyGoalViewPage /></PermissionRoute> },
          { path: 'internships', element: <PermissionRoute permission="internship_management"><InternshipManagement /></PermissionRoute> },
          { path: 'internships/view/:id', element: <PermissionRoute permission="internship_management"><InternshipViewPage /></PermissionRoute> },
          { path: 'hosted-website', element: <PermissionRoute permission="hosted_website"><HostedWebsiteManagement /></PermissionRoute> },
          { path: 'demo-request', element: <DemoRequestManagement /> },
          { path: 'meetings', element: <PermissionRoute permission="meeting_management"><MeetingManagement /></PermissionRoute> },
          { path: 'meetings/create', element: <PermissionRoute permission="meeting_management"><MeetingFormPage /></PermissionRoute> },
          { path: 'meetings/edit/:id', element: <PermissionRoute permission="meeting_management"><MeetingFormPage /></PermissionRoute> },
          { path: 'meetings/view/:id', element: <PermissionRoute permission="meeting_management"><MeetingViewPage /></PermissionRoute> },
          { path: 'research', element: <PermissionRoute permission="research_management"><ResearchManagement /></PermissionRoute> },
          { path: 'research/create', element: <PermissionRoute permission="research_management"><ResearchFormPage /></PermissionRoute> },
          { path: 'research/edit/:id', element: <PermissionRoute permission="research_management"><ResearchFormPage /></PermissionRoute> },
          { path: 'research/view/:id', element: <PermissionRoute permission="research_management"><ResearchViewPage /></PermissionRoute> },
          { path: 'salary', element: <PermissionRoute permission="salary_management"> <SalaryManagement /></PermissionRoute> },
        ]
      }
    ]
  },
  {
    path: "/auth/admin/login",
    element: <SuspenseWrapper><AdminLogin /></SuspenseWrapper>,
  },
  {
    path: "/auth/admin/unlock",
    element: <SuspenseWrapper><UnlockScreen /></SuspenseWrapper>,
  },
]);

function App() {
  return (
    <>
      {/* Global SEO fallback */}
      <Helmet>
        {/* ================= BASIC SEO ================= */}
        <title>Abytech Hub | Software Development & IT Solutions</title>
        <meta
          name="description"
          content="Abytech Hub is a technology company offering software development, web apps, mobile apps, and IT solutions for businesses worldwide."
        />
        <meta
          name="keywords"
          content="Abytech Hub, software company, web development, mobile app development, IT services, SaaS, cloud solutions, tech startup"
        />
        <meta name="author" content="Abytech Hub" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

        {/* ================= TECHNICAL ================= */}
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://www.abytechhub.com/" />

        {/* ================= SITE VERIFICATION ================= */}
        <meta name="google-site-verification" content="-LMjiH9KxsBHfNQlrwQ_74lrOnEhnoo20txjfX8Q-YM" />
        <meta name="msvalidate.01" content="46612E2DF0D2FF38E493BF6AF1D32223" />
        <meta name="yandex-verification" content="f1047e0f1c4393af" />

        {/* ================= OPEN GRAPH ================= */}
        <meta property="og:site_name" content="Abytech Hub" />
        <meta property="og:title" content="Abytech Hub | Software Development & IT Solutions" />
        <meta
          property="og:description"
          content="We design and build scalable software solutions that help businesses grow."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.abytechhub.com/" />
        <meta property="og:image" content="https://www.abytechhub.com/assets/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_US" />

        {/* ================= TWITTER ================= */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@abytechhub" />
        <meta name="twitter:creator" content="@abytechhub" />
        <meta name="twitter:title" content="Abytech Hub | Software Development & IT Solutions" />
        <meta
          name="twitter:description"
          content="Innovative software, web, and mobile solutions by Abytech Hub."
        />
        <meta name="twitter:image" content="https://www.abytechhub.com/assets/og-image.png" />

        {/* ================= MOBILE & UI ================= */}
        <meta name="theme-color" content="#0d6efd" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Abytech Hub" />

        {/* ================= ICONS ================= */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ================= SECURITY ================= */}
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <script type="application/ld+json">{`
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Abytech Hub",
  "url": "https://www.abytechhub.com/",
  "logo": "https://www.abytechhub.com/assets/og-image.png",
  "sameAs": [
    "https://www.linkedin.com/company/abytechhub",
    "https://twitter.com/abytechhub",
    "https://www.facebook.com/abytechhub"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "Customer Service"
  }
}
`}</script>
        <link rel="alternate" href="https://www.abytechhub.com/" hrefLang="en-us" />
      </Helmet>

      <RouterProvider router={router} />

    </>

  );
}

export default App;
