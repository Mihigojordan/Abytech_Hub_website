import React from 'react'
import { useNavigate } from 'react-router-dom'

const BlogCard = ({image,title,description}) => {
    const navigate = useNavigate()
  return (
    <div className='flex w-full sm:w-9/12 cursor-pointer md:w-1/3 xl:w-3/12 flex-auto transition duration-200 ease-in-out  flex-col gap-3 group' onClick={()=>navigate('/blog/1')} >
        <div className="flex w-full h-64 relative">
        <img src={image} className='w-full h-full object-cover ' alt="" />
        <button className='absolute top-1.5 left-1.5 p-2 capitalize text-white  font-medium text-sm bg-amber-400 group-hover:text-white cursor-pointer group-hover:bg-red-400 transition duration-200 ease-in-out'>content tips</button>
        </div>

        <h1 className='text-xl md:text-xl xl:text-2xl capitalize group-hover:text-amber-400 transition duration-200 ease-in-out '>{title}</h1>
        <p className='text-md md:text-md text-gray-400 line-clamp-3 '>{description}</p>

    </div>
  )
}

export default BlogCard