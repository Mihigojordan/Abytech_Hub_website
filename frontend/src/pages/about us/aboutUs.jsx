import React, { lazy, useEffect } from "react";
import { motion } from "framer-motion";

import ContentSection from "../../components/talkContent";
import Header from "../../components/header";
import About1 from "../../assets/images/about/about.png";
import { PiCertificate } from "react-icons/pi";
import { LiaCertificateSolid } from "react-icons/lia";
const Testimonials = lazy(() => import("../../components/home/testimony"));
const BlogLatest = lazy(() => import("../../components/blog/BlogDisplay.jsx"));
const SubscribeSection = lazy(() =>
  import("../../components/blog/subscribe.jsx")
);

const AboutUs = () => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);
  return (
    <div className="w-full flex-col pb-7 pt-24 justify-center bg-[#0d0f15]  items-center flex gap-2">
      <Header title={`About US`} path={`About`} />

      <div className="flex  flex-col justify-center p-4 w-full md:w-11/12 flex-wrap xl:flex-nowrap  lg:w-8/12 pt-10 items-start gap-7">
        <div className="flex justify-between gap-4 xl:gap-0 flex-wrap-reverse w-full">
          <div className="flex flex-1/2 justify-center xl:justify-start items-center relative">
            <img src={About1} className="z-[3]" alt="" />
          </div>

          <div className="flex flex-1/2  gap-14 flex-col ">
            <div className="flex w-full gap-2 flex-col">
              <h1 className="text-2xl lg:text-2xl xl:text-3xl font-bold capitalize leading-10">
                Crafting Compelling Content <br /> Since 2022
              </h1>
              <p className="text-md text-zinc-400">
                We create engaging, SEO-friendly content that connects with
                audiences and drives results.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <PiCertificate className="w-20 h-20 fill-[#ff7e61]" />
                <h1 className="text-2xl xl:text-3xl capitalize">Experienced</h1>
              </div>
              <p className="text-zinc-400 text-lg">
                With 8+ years of expertise, we craft compelling content tailored
                to your brand and audience. Our experience spans multiple
                industries, ensuring versatility and relevance in every project.
              </p>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <LiaCertificateSolid className="w-20 h-20 fill-[#ff7e61]" />
                <h1 className="text-2xl xl:text-3xl capitalize font-medium">
                  Certified
                </h1>
              </div>
              <p className="text-zinc-400 text-lg">
                Our certified team ensures high-quality, SEO-optimized content
                for maximum impact. We stay updated with the latest trends and
                best practices to keep your content competitive.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ContentSection />
      <Testimonials />

      <SubscribeSection />
    </div>
  );
};

export default AboutUs;
