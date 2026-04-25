import React, { lazy } from "react";
import { SW } from "./wrappers";

const AdminLogin = lazy(() => import("../pages/auth/admin/Login"));
const UnlockScreen = lazy(() => import("../pages/auth/admin/UnlockScreen"));

const authRoutes = [
  { path: "/auth/admin/login", element: <SW><AdminLogin /></SW> },
  { path: "/auth/admin/unlock", element: <SW><UnlockScreen /></SW> },
];

export default authRoutes;
