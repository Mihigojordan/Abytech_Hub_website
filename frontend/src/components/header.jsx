import React from 'react'
import HeaderImage from "../assets/images/header.avif"

const Header = ({title,path}) => {
    return (
        <div className='w-full h-[40vh] -mt-8 ' style={{
            background:`linear-gradient( to right,rgba(0,0,0,0.7),rgba(0,0,0,0.5)),url(${HeaderImage})`,
            backgroundPosition: `center`,
            backgroundRepeat:`no-repeat`,
            backgroundSize:`cover`
            
            }}>

            <div className="flex flex-col h-full text-white justify-center gap-3 items-center">
            <h1 className=' text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-semibold uppercase' style={{fontSize:"2.2rem"}}>{title}</h1>
            <p className='capitalize'><span style={{color:"#ffd44d"}}>Home /</span> {path}</p>
            </div>

        </div>
    )
}

export default Header