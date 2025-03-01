import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { FaRocket, FaClipboardList, FaCheckCircle } from "react-icons/fa";
import Process from '../../assets/images/data.png'
export default function WorkProcess() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="bg-gray-900 text-white px-10 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between" data-aos="fade-down">
      
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-semibold">
          Our <span className="text-yellow-400">Working</span> Process
        </h2>
     

        <div className="mt-6 space-y-6">
        <div className="mt-6 space-y-6">
  
  {/* Step 1: Get Started */}
  <div className="flex items-start gap-4">
    <FaRocket className="text-orange-400 text-3xl" />
    <div>
      <h3 className="text-lg font-semibold">Get Started</h3>
      <p className="text-gray-400 text-base">
        Begin your journey with our expert-driven development process, ensuring a smooth onboarding experience.
      </p>
    </div>
  </div>

  {/* Step 2: Requirement Gathering */}
  <div className="flex items-start gap-4">
    <FaClipboardList className="text-orange-400 text-3xl" />
    <div>
      <h3 className="text-lg font-semibold">Requirement Gathering</h3>
      <p className="text-gray-400 text-base">
        We gather and analyze all project requirements, aligning business goals with technical needs for precision and efficiency.
      </p>
    </div>
  </div>

  {/* Step 3: Planning & Strategy */}
  <div className="flex items-start gap-4">
    <FaClipboardList className="text-blue-400 text-3xl" />
    <div>
      <h3 className="text-lg font-semibold">Planning & Strategy</h3>
      <p className="text-gray-400 text-base">
        We outline a clear roadmap, define milestones, and strategize the best approach to ensure seamless execution.
      </p>
    </div>
  </div>

  {/* Step 4: Development & Execution */}
  <div className="flex items-start gap-4">
    <FaRocket className="text-green-400 text-3xl" />
    <div>
      <h3 className="text-lg font-semibold">Development & Execution</h3>
      <p className="text-gray-400 text-base">
        Our expert developers bring the vision to life, coding and building a scalable, secure, and high-performance solution.
      </p>
    </div>
  </div>



  {/* Step 7: Deployment & Support */}
  <div className="flex items-start gap-4">
    <FaRocket className="text-red-400 text-3xl" />
    <div>
      <h3 className="text-lg font-semibold">Deployment & Support</h3>
      <p className="text-gray-400 text-base">
        We launch your project successfully and provide ongoing maintenance, support, and updates for long-term success.
      </p>
    </div>
  </div>

</div>

        </div>
      </div>
      
      {/* Right Section */}
      <div className="w-full md:w-[50%] flex justify-center mt-10 md:mt-0">
        <img src={Process} className="w-[90%] h-[80%] object-cover rounded-lg shadow-lg" alt="Process" />
      </div>

    </div>
  );
}
