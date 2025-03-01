import React,{useEffect}from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/header'
import SubscribeSection from '../../components/blog/subscribe';
import ContentSection from '../../components/talkContent';
import BlogLatest from '../../components/blog/BlogDisplay';
import Testimonials from '../../components/home/testimony'
import ExperienceComponent from './experience';
import AOS from 'aos';
import { IoBriefcase } from "react-icons/io5";
import { FiFileText } from "react-icons/fi";
import MissionVisionComponent from './mission';

const AboutUs = () => {
    useEffect(() => {
            AOS.init({ duration: 1000, once: true });
          }, []);
    
        useEffect(()=>{
       
           document.documentElement.scrollIntoView({
               behavior:'smooth',
               block:'start',
               inline:'start',
           })
           },[])
    return (
        <>
        <div className='w-full flex-col pb-7 justify-center bg-[#0d0f15]  items-center flex gap-2  mt-25'>
            <Header title={`About Us`} path={`About`} />

            <div className="flex items-center gap-14 w-full justify-center flex-wrap px-34 py-24" data-aos="fade-up">
                <div className="flex flex-col md:flex-row gap-10 w-full items-center justify-between">
                <div className="relative">
                        <img src="../image/bg2.png" alt="Content Writer" className="w-full rounded-2xl" />
                    </div>
                    <div className="flex flex-col gap-4 max-w-md">
                        <h2 className="text-white text-3xl font-bold">We Are <span className='text-yellow-300'>Content Writing</span> Since 2016</h2>
                        <p className="text-gray-400">Ac quis pretium consectetur urna dolor. Cursus et amet neque ullamcorper. Cursus tempus accumsan eu nibh.</p>
                        <div className="flex flex-col gap-6">
                            <div className="flex items-start gap-4">
                                <div className="text-orange-500"><IoBriefcase size={36} /></div>
                                <div>
                                    <h3 className="text-white font-bold text-2xl">Experienced</h3>
                                    <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="text-orange-500"><FiFileText size={36} /></div>
                                <div>
                                    <h3 className="text-white font-bold text-2xl">Certified</h3>
                                    <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                   
                </div>
                </div>
            </div>
        
        <MissionVisionComponent />
        <ExperienceComponent />
        <Testimonials /> 
        <BlogLatest />
        <SubscribeSection />
        </>
    );
};

export default AboutUs;
