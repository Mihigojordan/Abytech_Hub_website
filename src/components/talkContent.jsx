
import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";
import BlogImage1 from '../assets/images/blog/blog2.jpg'

export default function ContentSection() {
  return (
    <section className="bg-gray-900 w-full  text-white py-16 px-8 flex items-center justify-center">
      <div className="  w-full flex gap-2 flex-col-reverse justify-between  lg:flex-row-reverse  items-center">
        <div className="relative w-full lg:w-1/2 flex justify-center">
        <img src={BlogImage1} className=" rounded-xl w-full" alt="" />
        </div>
        <div className="w-full lg:w-1/2 text-left mt-10 md:mt-0 md:ml-16">
          <h2 className="text-4xl font-bold">
            Content <span className="text-yellow-400">That Walks</span>, Talks & Sells For You.
          </h2>
          <p className="mt-4 text-gray-300 w-full text-base md:text-lg md:w-10/12">
            Sed faucibus velit arcu in quis a. Sit ornare et dignissim in sit enim. 
            Cras eget vitae aenean dolor orci sagittis proin porttitor.
          </p>
          <ul className="mt-6 space-y-3">
            <li className="flex items-center"><FaRegCheckCircle className="text-yellow-400 mr-2" /> We Create High Quality Content.</li>
            <li className="flex items-center"><FaRegCheckCircle className="text-yellow-400 mr-2" /> We Focus on Quantity & Well Organize Content.</li>
            <li className="flex items-center"><FaRegCheckCircle className="text-yellow-400 mr-2" /> We Deliver On Time.</li>
          </ul>
          <button className="mt-6 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg">
            Get Your Free Sample Content
          </button>
          <div className="mt-8 flex space-x-10">
            <div className="text-center">
              <p className="text-yellow-400 text-2xl font-bold">150</p>
              <p className="text-gray-400 text-sm">Clients</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-2xl font-bold">64</p>
              <p className="text-gray-400 text-sm">Country</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-2xl font-bold">98%</p>
              <p className="text-gray-400 text-sm">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
