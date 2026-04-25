import React, { lazy } from "react";
import { SW } from "./wrappers";

const MainLayout = lazy(() => import("../layouts/MainLayout"));
const HomePage = lazy(() => import("../pages/HomePage"));
const ContactUs = lazy(() => import("../pages/ContactUs"));

const publicRoutes = [
  {
    path: "/",
    element: <SW><MainLayout /></SW>,
    children: [
      { index: true, element: <SW><HomePage /></SW> },
      { path: "contact-us", element: <SW><ContactUs /></SW> },
    ],
  },
];

export default publicRoutes;
