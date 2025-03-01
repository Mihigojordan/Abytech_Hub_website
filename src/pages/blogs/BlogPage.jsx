import React, { useEffect } from 'react'
import Header from '../../components/header'
import BlogCard from '../../components/blog/BlogCard'

import Testimonials from '../../components/home/testimony'
import { cards } from '../../stores/Blogdata'
import AOS from 'aos';
import { div } from 'framer-motion/client'
import SubscribeSection from '../../components/blog/subscribe'


const BlogPage = () => {

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
        <div className='w-full flex-col pb-7 justify-center bg-[#0d0f15]  items-center flex gap-2 mt-25'  >
            <Header title={`blog`} path={`blog`} />

            <div className="flex flex-col justify-center w-full  lg:w-10/12 xl:w-11/12 pt-10 items-center gap-10">

                <h1 className='text-yellow-300 font-bold text-2xl md:text-3xl lg:text-4xl xl:text-3xl'>News <span className='text-white'>&</span> Blogs</h1>

                <div className="flex items-center gap-10 w-[100%]  justify-center  flex-wrap p-4" data-aos="fade-down">

                    {
                        cards.map((card, key) => (
                            <BlogCard {...card} key={key} ></BlogCard>
                        ))
                    }

                </div>


            </div>
                <Testimonials /> 
                <SubscribeSection />

        </div>
    )
}

export default BlogPage