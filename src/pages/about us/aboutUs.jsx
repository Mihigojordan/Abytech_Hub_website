import React, { lazy } from 'react';
import { motion } from 'framer-motion';

import ContentSection from '../../components/talkContent';
import Header from '../../components/header';
import About1 from '../../assets/images/about/about.png'
import { PiCertificate } from "react-icons/pi";
import { LiaCertificateSolid } from "react-icons/lia";
const Testimonials = lazy(() => import('../../components/home/testimony'));
const BlogLatest = lazy(() => import('../../components/blog/BlogDisplay.jsx'));
const SubscribeSection = lazy(() => import('../../components/blog/subscribe.jsx'));

const AboutUs = () => {
    return (
        <div className='w-full flex-col pb-7 pt-24 justify-center bg-[#0d0f15]  items-center flex gap-2'>
            <Header title={`service`} path={`service / Single Service 1`} />

            <div className="flex  flex-col justify-center p-4 w-full md:w-11/12 flex-wrap xl:flex-nowrap  lg:w-8/12 pt-10 items-start gap-7">

                <div className="flex justify-between gap-4 xl:gap-0 flex-wrap-reverse w-full">

                    <div className="flex flex-1/2 justify-center xl:justify-start items-center relative">

                        <img src={About1} className='z-[3]' alt="" />

                    </div>

                    <div className="flex flex-1/2  gap-14 flex-col ">

                        <div className="flex w-full gap-2 flex-col">
                            <h1 className=' text-3xl  lg:text-4xl xl:text-5xl font-bold capitalize'>We Are Content Writing Since 2016</h1>
                            <p className='text-lg text-zinc-400'>Ac quis pretium consectetur urna dolor. Cursus et amet neque ullamcorper. Cursus tempus accumsan eu nibh.</p>
                        </div>

                        <div className="flex flex-col">
                            <div className='flex items-center gap-4'>
                                <PiCertificate className='w-20 h-20 fill-[#ff7e61]' />
                                <h1 className=' text-2xl xl:text-3xl capitalize'>Expeirenced</h1>
                            </div>
                            <p className='text-zinc-400 text-lg '>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                                sed do eiusmod tempor. bnfd Lorem ipsum dolor sit amet,
                                consectetur adipiscing elit, sed do eiusmod tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                        </div>
                        <div className="flex flex-col">
                            <div className='flex items-center gap-4'>
                                <LiaCertificateSolid className='w-20 h-20  fill-[#ff7e61]' />
                                <h1 className='text-2xl xl:text-3xl capitalize font-medium'>Certified</h1>
                            </div>
                            <p className='text-zinc-400 text-lg '>Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                                sed do eiusmod tempor. bnfd Lorem ipsum dolor sit amet,
                                consectetur adipiscing elit, sed do eiusmod tempor. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                        </div>

                    </div>

                </div>





            </div>

            <ContentSection />
            <Testimonials />
            <BlogLatest />
            <SubscribeSection />
        </div>
    );
};

export default AboutUs;