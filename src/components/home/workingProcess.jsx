import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaRocket, FaClipboardList, FaCheckCircle } from "react-icons/fa";

export default function WorkProcess() {
 

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="bg-gray-900 text-white p-10 flex flex-col md:flex-row items-center" data-aos="fade-down">
      {/* Left Section */}
      <div className="w-full md:w-2/5">
        <h2 className="text-3xl font-semibold">
          Our <span className="text-yellow-400">Working</span> Process
        </h2>
        <p className="text-gray-400 mt-3">
          Hendrerit facilisi habitasse arcu urna bibendum. Cursus in mattis nunc pretium amet dignissim.
        </p>
        <div className="mt-5 space-y-6">
          <div className="flex items-start gap-3">
            <FaRocket className="text-orange-400 text-2xl" />
            <div>
              <h3 className="font-semibold">Get Started</h3>
              <p className="text-gray-400 text-sm">Start To Boost Your Business With Softwares.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaClipboardList className="text-orange-400 text-2xl" />
            <div>
              <h3 className="font-semibold">Requirement Gathering</h3>
              <p className="text-gray-400 text-sm">Software Requirement Gathering To Be Done.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-orange-400 text-2xl" />
            <div>
              <h3 className="font-semibold">Final Approval</h3>
              <p className="text-gray-400 text-sm">Approve What We Are Committed to Focus On.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="w-full md:w-1/2 p-6 rounded-lg flex justify-center mt-10 md:mt-0" >
        <img src="../image/bg1.png" className="w-full max-w-sm md:max-w-md rounded-lg shadow-lg" alt="Process" />
      </div>
    </div>
  );
}
