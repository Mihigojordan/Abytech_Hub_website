import React, { lazy, useEffect } from "react";
import Header from "../../components/header";
// import { useLocation, useParams } from 'react-router-dom';
const ContentWriteServices = lazy(() =>
  import("../../components/home/contentWrite")
);
const Testimonials = lazy(() => import("../../components/home/testimony"));
const BlogLatest = lazy(() => import("../../components/blog/BlogDisplay.jsx"));

const ServicePage = () => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);
  return (
    <div className="w-full flex-col pb-7 justify-center bg-[#0d0f15]  items-center flex gap-2 mt-25">
      <Header title={`service`} path={`service`} />

      <div className="flex flex-col justify-center w-[100%] pt-10 items-center gap-10">
        <ContentWriteServices />
        <Testimonials />
        <BlogLatest />
      </div>
    </div>
  );
};

export default ServicePage;