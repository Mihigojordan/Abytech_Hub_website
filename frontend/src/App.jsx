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
import AnalysisService from "./pages/services/Analysisservice";
import CybersecurityService from "./pages/services/Cybersecurityservice";
import SoftwareDevelopmentService from "./pages/services/Softwaredevelopmentservice";
import DatabaseManagementService from "./pages/services/Databasemanagementservice";
import UIUXDesignService from "./pages/services/Uiuxdesignservice";
import WebHostingService from "./pages/services/Webhostingservice";
import IoTSolutionsService from "./pages/services/otsolutionsservice";
import DevOpsAutomationService from "./pages/services/Devopsautomationservice";
import AcademicTraining from "./pages/Programs/AcademicTraining";
import AmazonCloud from "./pages/Programs/AmazonCloud";
import Apprenticeship from "./pages/Programs/Apprenticeship";
import Ciscotraining from "./pages/Programs/Ciscotraining";
import OneMonthTraining from "./pages/Programs/Onemonthtraining";
import ThreeMonthTraining from "./pages/Programs/Threemonthtraining";
import SixMonthTraining from "./pages/Programs/Sixmonthtraining";

// Pages (Lazy)
const HomePage = lazy(() => import("./pages/HomePage"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const BlogPage = lazy(() => import("./pages/blogs/BlogPage"));
const BlogSingle = lazy(() => import("./pages/blogs/Blogsingle"));
const ServicePage = lazy(() => import("./pages/services/ServicePage"));
const ServiceSingle = lazy(() => import("./pages/services/ServiceSingle"));
const BlogContainer = lazy(() => import("../src/pages/blogs/blogContainer"));

// import DashboardLayout from "./layouts/DashboardLayout";
// import ProtectPrivateAdminRoute from "./components/protectors/ProtectPrivateAdminRoute";



import PWAPushNotifications from "./pages/PWATestingPage";

import ChatApp from "./pages/dashboard/ChatAppPage";
import MeetingManagement from "./pages/dashboard/MeetingManagement";
import WeeklyGoalManagement from "./pages/dashboard/WeeklyGoalManagement";
import InternshipManagement from "./pages/dashboard/InternshipManagement";
import HostedWebsiteManagement from "./pages/dashboard/HostedWebsiteManagement";
import DemoRequestManagement from "./pages/dashboard/DemoRequestManagement";
import ResearchManagement from "./pages/dashboard/ResearchManagement";

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
const AdminProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminProfileEdit = lazy(() => import("./pages/EditProfilePage"));

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
      { path: "blog/:id", element: <SuspenseWrapper><BlogSingle /></SuspenseWrapper> },

      // service 
      { path: "services", element: <SuspenseWrapper><ServicePage /></SuspenseWrapper> },

      { path: "analysis-service", element: <SuspenseWrapper><AnalysisService /></SuspenseWrapper> },
      { path: "cyber-security", element: <SuspenseWrapper>< CybersecurityService /></SuspenseWrapper> },
      { path: "software-development", element: <SuspenseWrapper><SoftwareDevelopmentService /></SuspenseWrapper> },
      { path: "Databasemanagement", element: <SuspenseWrapper><DatabaseManagementService /></SuspenseWrapper> },
      { path: "ui&uxdesign", element: <SuspenseWrapper><UIUXDesignService /></SuspenseWrapper> },
      { path: "webandapphost", element: <SuspenseWrapper><WebHostingService /></SuspenseWrapper> },
      { path: "iotsolution", element: <SuspenseWrapper><IoTSolutionsService /></SuspenseWrapper> },
      { path: "devops", element: <SuspenseWrapper><DevOpsAutomationService /></SuspenseWrapper> },


      // about 
      { path: "about-us", element: <SuspenseWrapper><AboutUs /></SuspenseWrapper> },
      { path: "empowering-inclusion", element: <SuspenseWrapper><EmpoweringPage /></SuspenseWrapper> },
      { path: "values", element: <SuspenseWrapper><Values /></SuspenseWrapper> },
      { path: "Story", element: <SuspenseWrapper><StoryImpactCulturePage /></SuspenseWrapper> },
      { path: "Vision-mission", element: <SuspenseWrapper><MissionVisionPage /></SuspenseWrapper> },
      { path: "who-we-are", element: <SuspenseWrapper><WhoWeArePage /></SuspenseWrapper> },






      { path: "team-member", element: <SuspenseWrapper><TeamMember /></SuspenseWrapper> },


      // taining programms 
      { path: "Academic", element: <SuspenseWrapper><AcademicTraining /></SuspenseWrapper> },
      { path: "amazon", element: <SuspenseWrapper><AmazonCloud /></SuspenseWrapper> },
      { path: "Apprenticeship", element: <SuspenseWrapper><Apprenticeship /></SuspenseWrapper> },
      { path: "ciscotraining", element: <SuspenseWrapper><Ciscotraining /></SuspenseWrapper> },

      { path: "onemonth", element: <SuspenseWrapper><OneMonthTraining /></SuspenseWrapper> },
      { path: "threemonths", element: <SuspenseWrapper><ThreeMonthTraining /></SuspenseWrapper> },
      { path: "sixmonths", element: <SuspenseWrapper><SixMonthTraining /></SuspenseWrapper> },



      { path: "contact-us", element: <SuspenseWrapper><ContactUs /></SuspenseWrapper> },
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
          { path: 'expense', element: <ExpenseDashboard /> },
          { path: 'employee', element: <EmployeeeDashboard /> },
          { path: 'report', element: <ReportDashboard /> },
          { path: 'report/create', element: <UpsertReportPage /> },
          { path: 'report/edit/:id', element: <UpsertReportPage /> },
          { path: 'report/view/:id', element: <ReportViewPage /> },
          { path: 'profile/:id', element: <AdminProfilePage /> },
          { path: 'edit-profile/:id', element: <AdminProfileEdit /> },

          { path: 'chat', element: <ChatApp /> },
          { path: 'chat/:conversationId', element: <ChatApp /> },
          { path: 'weekly-goals', element: <WeeklyGoalManagement /> },
          { path: 'internships', element: <InternshipManagement /> },
          { path: 'hosted-website', element: <HostedWebsiteManagement /> },
          { path: 'demo-request', element: <DemoRequestManagement /> },
          { path: 'meetings', element: <MeetingManagement /> },
          { path: 'research', element: <ResearchManagement /> },
          // {path:'profile' , element:<AdminProfilePage />},

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
