import React, { lazy } from 'react';
import BlogLatest from '../components/blog/BlogDisplay';

const LandingPage = lazy(() => import('../components/home/landingPage'));
const WhyChooseUs = lazy(() => import('../components/home/chooseUs'));
const ClientsSection = lazy(() => import('../components/home/clients'));
const ContentReach = lazy(() => import('../components/home/contentReach'));
const ContentWriteServices = lazy(() => import('../components/home/contentWrite'));
const WorkProcess = lazy(() => import('../components/home/workingProcess'));
const ContentSection = lazy(() => import('../components/home/talkContent'));
const LatestProjects = lazy(() => import('../components/home/project'));
const Testimonials = lazy(() => import('../components/home/testimony'));


const HomePage = () => {
    return (
        <>
            <LandingPage />
            <WhyChooseUs />
<ContentReach />
            <ContentWriteServices />
            <WorkProcess />
          
            <Testimonials />
            <BlogLatest />

        </>
    )
}


export default HomePage