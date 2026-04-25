import React, { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { SW } from "./wrappers";
import publicRoutes from "./publicRoutes";
import adminRoutes from "./adminRoutes";
import authRoutes from "./authRoutes";

const NotFound = lazy(() => import("../pages/NotFound"));

const router = createBrowserRouter([
  ...publicRoutes,
  ...adminRoutes,
  ...authRoutes,
  { path: "*", element: <SW><NotFound /></SW> },
]);

export default router;
