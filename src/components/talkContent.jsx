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

          {/* Features List */}
          <ul className="mt-6 space-y-3">
            <li className="flex items-center">
              <FaRegCheckCircle className="text-yellow-400 mr-3 text-xl" /> We Create High-Quality Content.
            </li>
            <li className="flex items-center">
              <FaRegCheckCircle className="text-yellow-400 mr-3 text-xl" /> We Focus on Quantity & Well-Organized Content.
            </li>
            <li className="flex items-center">
              <FaRegCheckCircle className="text-yellow-400 mr-3 text-xl" /> We Deliver On Time.
            </li>
          </ul>

          {/* Call-to-Action Button */}
          <button className="mt-6 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white py-3 px-6 rounded-lg shadow-md">
            Get Your Free Sample Content
          </button>

          {/* Statistics Section */}
          <div className="mt-8 flex space-x-10">
            <div className="text-center">
              <p className="text-yellow-400 text-3xl font-bold">150+</p>
              <p className="text-gray-400 text-sm">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-3xl font-bold">64</p>
              <p className="text-gray-400 text-sm">Countries Served</p>
            </div>
            <div className="text-center">
              <p className="text-yellow-400 text-3xl font-bold">98%</p>
              <p className="text-gray-400 text-sm">Satisfaction Rate</p>
            </div>
          </div>

        </div>
      </div>

      {/* Additional Feature Components */}
      <div className="max-w-6xl mt-16 grid md:grid-cols-3 gap-8">
        
        {/* Get Started */}
        <div className="flex items-start gap-4 bg-gray-800 p-6 rounded-lg shadow-lg">
          <FaRocket className="text-orange-400 text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Get Started</h3>
            <p className="text-gray-400 text-base">
              Launch your project with our expert-driven development process.
            </p>
          </div>
        </div>

        {/* Requirement Gathering */}
        <div className="flex items-start gap-4 bg-gray-800 p-6 rounded-lg shadow-lg">
          <FaClipboardList className="text-orange-400 text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Requirement Gathering</h3>
            <p className="text-gray-400 text-base">
              We gather and analyze all project requirements to ensure clarity and precision.
            </p>
          </div>
        </div>

        {/* Final Approval */}
        <div className="flex items-start gap-4 bg-gray-800 p-6 rounded-lg shadow-lg">
          <FaCheckCircle className="text-orange-400 text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Final Approval</h3>
            <p className="text-gray-400 text-base">
              Review and approve project details before execution begins.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
