import React, { Suspense, lazy } from "react";
import { BrowserRouter, createBrowserRouter, Navigate, Outlet, Route, RouterProvider, Routes } from "react-router-dom"
const HomePage = lazy(() => import("./pages/HomePage"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const BlogPage = lazy(() => import("./pages/blogs/BlogPage"));
const BlogSingle = lazy(() => import("./pages/blogs/Blogsingle"));
const ServicePage = lazy(() => import("./pages/services/ServicePage"));
const ServiceSingle = lazy(() => import("./pages/services/ServiceSingle"));
const BlogContainer = lazy(() => import("../src/pages/blogs/blogContainer"));
const AboutUs = lazy(() => import('./pages/about us/aboutUs'));
const TeamMember = lazy(() => import('./pages/Team'))

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectPrivateAdminRoute from "./components/protectors/ProtectPrivateAdminRoute";
import EmployeeeDashboard from "./pages/dashboard/EmployeeManagement";

import AdminProfileEdit from "./pages/EditProfilePage";
import PWAPushNotifications from "./pages/PWATestingPage";
import AdminProfilePage from "./pages/dashboard/AdminProfile";

// Lazy-loaded pages
const ProjectsPage = lazy(() => import("./pages/Projects/ProjectPages"));
const AdminLogin = lazy(() => import("./pages/auth/admin/Login"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
// const AdminProfilePage = lazy(() => import("./pages/dashboard/AdminProfile"));
const UnlockScreen = lazy(() => import("./pages/auth/admin/UnlockScreen"));
const ExpenseDashboard = lazy(() => import("./pages/dashboard/ExpenseDashboard"));
const ReportDashboard = lazy(() => import("./pages/dashboard/ReportManagement"));

// Lazy-loaded components
const AbyTechLocations = lazy(() => import("./pages/Location"));
const RichTextEditor = lazy(() => import("./components/RichTextEditor"));
const UpsertReportPage = lazy(() => import("./components/dashboard/report/UpsertReportPage"));
const ReportViewPage = lazy(() => import("./components/dashboard/report/ReportViewPage"));


// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const SuspenseWrapper = ({ children }) => {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: '/blogs', element: <SuspenseWrapper><BlogPage /></SuspenseWrapper> },
      { path: '/blog/:id', element: <SuspenseWrapper><BlogSingle /></SuspenseWrapper> },
      { path: '/contact-us', element: <SuspenseWrapper><ContactUs /></SuspenseWrapper> },
      { path: '/services', element: <SuspenseWrapper><ServicePage /> </SuspenseWrapper> },
      { path: '/about-us', element: <SuspenseWrapper><AboutUs /></SuspenseWrapper> },
      { path: '/service/:id', element: <SuspenseWrapper><ServiceSingle /> </SuspenseWrapper> },
      { path: '/project', element: <SuspenseWrapper><ProjectsPage /> </SuspenseWrapper> },
      { path: '/team-member', element: <SuspenseWrapper><TeamMember /> </SuspenseWrapper> },
      { path: '/location', element: <SuspenseWrapper><AbyTechLocations /> </SuspenseWrapper> },
      { path: '/pwa', element: <SuspenseWrapper><PWAPushNotifications /> </SuspenseWrapper> },
      ,
    ]
  },
  { path: '/text', element: <SuspenseWrapper><RichTextEditor /> </SuspenseWrapper> },
  {
    path:'/admin',
    element: <ProtectPrivateAdminRoute><Outlet /></ProtectPrivateAdminRoute>,
    children:[
       { index: true, element: <Navigate to={'/admin/dashboard'}></Navigate>},
       { 
        path: 'dashboard', 
        element: <SuspenseWrapper><DashboardLayout /> </SuspenseWrapper>,
        children:[
          {index:true , element:<DashboardHome />},
          {path:'expense' , element:<ExpenseDashboard />},
          {path:'employee' , element:<EmployeeeDashboard />},
          {path:'report' , element:<ReportDashboard />},
          {path:'report/create' , element:<UpsertReportPage />},
          {path:'report/edit/:id' , element:<UpsertReportPage />},
          {path:'report/view/:id' , element:<ReportViewPage />},
          {path:'profile/:id' , element:<AdminProfilePage />},
          {path:'edit-profile/:id' , element:<AdminProfileEdit />},
          // {path:'profile' , element:<AdminProfilePage />},
          
        ]
       },

    ]
  },
  {
    path: '/auth/admin/login',
    element: (
      <SuspenseWrapper>
        <AdminLogin />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/auth/admin/unlock',
    element: (
      <SuspenseWrapper>
        <UnlockScreen />
      </SuspenseWrapper>
    ),
  },
])




function App() {



  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App