import React from 'react';
import { motion } from 'framer-motion';
import SubscribeSection from '../../components/blog/subscribe';
import ContentSection from '../../components/talkContent';

const AboutUs = () => {
    return (
        <>
        <div className="bg-gray-900 text-white py-20">
            <div className="container mx-auto px-4">
                <motion.h2 
                    className="text-4xl font-bold mb-6 text-center text-yellow-400"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    About Us
                </motion.h2>
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <motion.div 
                        className="flex-1"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-lg leading-relaxed mb-6">
                            At Abytech, we are dedicated to delivering top-notch software solutions that drive success. 
                            With a passion for technology and innovation, we specialize in building modern, efficient, 
                            and scalable web applications that meet your business needs.
                        </p>
                        <p className="text-lg leading-relaxed mb-6">
                            Our team of experienced full-stack developers excels in both MERN and PERN stacks, 
                            leveraging the power of PostgreSQL, Sequelize, and real-time technologies to create dynamic, 
                            user-centric applications. Whether it's implementing robust search features, real-time updates, 
                            or crafting visually appealing designs, we have you covered.
                        </p>
                        <p className="text-lg leading-relaxed">
                            Trust Abytech to transform your vision into reality with tailored solutions and a commitment 
                            to excellence. We are here to support you at every step of your digital journey.
                        </p>
                    </motion.div>
                    <motion.div 
                        className="flex-1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <img 
                            src="../image/blog5.png" 
                            alt="About Us" 
                            className="rounded-2xl shadow-lg"
                        />
                    </motion.div>
                </div>
            </div>

            
        </div>
        <ContentSection />
        </>
    );
};

export default AboutUs;