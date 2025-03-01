
import React from "react";
import { FaRegCheckCircle } from "react-icons/fa";

export default function ContentSection() {
  return (
    <section className="bg-gray-900 text-white py-16 px-8 flex items-center justify-center">
      <div className="max-w-6xl flex flex-col md:flex-row items-center">
        <div className="relative w-full md:w-1/2 flex justify-center">
          <img src="/woman-laptop.png" alt="Woman with Laptop" className="w-[80%] md:w-[90%]" />
          <div className="absolute bottom-6 left-6 bg-gray-800 p-4 rounded-lg shadow-lg flex items-center space-x-3">
            <div>
              <p className="text-sm text-gray-400">Worked with more than 100 people</p>
              <div className="flex items-center mt-2">
                <div className="flex -space-x-2">
                  <img src="/user1.jpg" className="w-8 h-8 rounded-full border-2 border-gray-900" />
                  <img src="/user2.jpg" className="w-8 h-8 rounded-full border-2 border-gray-900" />
                  <img src="/user3.jpg" className="w-8 h-8 rounded-full border-2 border-gray-900" />
                </div>
                <p className="ml-4 text-white font-bold">100+ Clients</p>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 text-left mt-10 md:mt-0 md:ml-16">
          <h2 className="text-4xl font-bold">
            Content <span className="text-yellow-400">That Walks</span>, Talks & Sells For You.
          </h2>
          <p className="mt-4 text-gray-300">
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
