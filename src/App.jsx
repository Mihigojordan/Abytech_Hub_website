import React, { Suspense, lazy } from "react";
import { BrowserRouter,createBrowserRouter,Route,RouterProvider,Routes } from "react-router-dom"
const  HomePage = lazy(()=> import("./pages/HomePage"));
const  ContactUs = lazy(()=> import("./pages/ContactUs"));
const  BlogPage = lazy(()=> import("./pages/blogs/BlogPage"));
const  BlogSingle = lazy(()=> import("./pages/blogs/Blogsingle"));
const  ServicePage = lazy(()=> import( "./pages/services/ServicePage"));
const  ServiceSingle = lazy(()=> import( "./pages/services/ServiceSingle"));
const BlogContainer= lazy(()=>import("../src/pages/blogs/blogContainer"));
const AboutUs=lazy(()=>import('./pages/about us/aboutUs'));

import MainLayout from "./layouts/MainLayout";



// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

const  SuspenseWrapper = ({children})=>{
   return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path:'/',
    element: <MainLayout />,
    children:[
      {index:true ,element:<SuspenseWrapper><HomePage /></SuspenseWrapper>},
      {path:'/blogs' ,element:<SuspenseWrapper><BlogPage /></SuspenseWrapper>},
      {path:'/blog/:id' ,element:<SuspenseWrapper><BlogSingle /></SuspenseWrapper>},
      {path:'/contact-us' ,element:<SuspenseWrapper><ContactUs /></SuspenseWrapper>},
      {path:'/services',element:<SuspenseWrapper><ServicePage /> </SuspenseWrapper>},

      {path:'/about-us',element:<SuspenseWrapper><AboutUs /></SuspenseWrapper>},
 {path:'/service/:id',element:<SuspenseWrapper><ServiceSingle /> </SuspenseWrapper>},

    ]
  }
])




function App() {
  
 

  return (
    <>
   <RouterProvider router={router}></RouterProvider>
    </>
  )
}

export default App