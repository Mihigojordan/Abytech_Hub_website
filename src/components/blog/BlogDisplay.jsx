import React from 'react'
import BlogCard from './BlogCard'
import { cards } from '../../stores/Blogdata'
import { useNavigate } from 'react-router-dom'


const BlogLatest = () => {
    const navigate =  useNavigate()
    
    return (
        <div className='w-full flex-col pb-7 justify-center bg-[#0d0f15]  items-center flex gap-2' onClick={()=>navigate('/blog/2')}>
            <div className="flex flex-col justify-center w-9/12 pt-10 items-center gap-10">

                <h1 className='text-yellow-300 font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl'><span className='text-white'> Latest </span> News & Blogs</h1>

                <div className="flex items-center gap-9 justify-center flex-wrap">

                    {
                        cards.map((card, key) => {
                            if (key >= 3) {
                                return
                            }
                            return <BlogCard {...card} key={key} ></BlogCard>
                        }
                        )
                    }

                </div>


            </div>
        </div>

    )
}

export default BlogLatest