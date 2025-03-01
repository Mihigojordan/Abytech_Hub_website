import React from 'react';

const SubscribeSection = () => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-[50vh] bg-cover bg-center relative text-white">
             <div
        className="absolute inset-0 bg-black bg-opacity-100"
        style={{
          backgroundImage: "url('../image/blog6.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
            <div className="absolute inset-0  bg-opacity-60"></div>
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    Trust Me to deliver the <span className="text-yellow-400">best solutions</span><br />tailored to your needs.
                </h2>
                <p className="text-gray-300 mb-6">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Temporibus, iusto, quia neque amet saepe?
                </p>
                <div className="flex gap-2 w-full max-w-md">
                    <input 
                        type="email" 
                        placeholder="Enter Your Email" 
                        className="p-3 rounded-md w-full bg-white text-black focus:outline-none" 
                    />
                    <button className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-md">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubscribeSection;
