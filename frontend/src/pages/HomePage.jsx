import React, { lazy } from 'react';
import BlogLatest from '../components/blog/BlogDisplay';
import Partners from '../components/home/Partners';
import HomeAbout from '../components/home/HomeAbout';
import Values from '../components/home/Values';
import Programs from '../components/home/Programs';
import Slide from '../components/home/Slide';
import Faq from '../components/home/Faq';
import Quote from '../components/home/Quote';

const LandingPage = lazy(() => import("../components/home/landingPage"));
const WhyChooseUs = lazy(() => import("../components/home/chooseUs"));
const ContentReach = lazy(() => import("../components/home/contentReach"));

const WorkProcess = lazy(() => import("../components/home/workingProcess"));
const Testimonials = lazy(() => import("../components/home/testimony"));

const HomePage = () => {
    return (
        <>
            <LandingPage />
            <Partners />
            <HomeAbout />
            <Slide />
            <Quote />
            {/* <Values /> */}
            <WhyChooseUs />
            <ContentReach />
 
            <WorkProcess />
            <Programs />
            <Faq />
            <Testimonials />
            <BlogLatest />

        </>
    )
}

export default HomePage;
