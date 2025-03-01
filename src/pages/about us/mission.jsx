import React from 'react';
import { IoIosRocket } from "react-icons/io";
import { ImTarget } from "react-icons/im";

const MissionVisionComponent = () => {
  return (
    <div className="bg-[#0E131F] py-16 flex justify-center">
      <div className="max-w-6xl flex">
        {/* Vision Section */}
        <div className="bg-[#151A28] p-8  flex flex-col items-center justify-center w-1/3">
          <ImTarget className="text-[#FF6B53] w-12 h-12 mb-4" />
          <h2 className="text-white text-2xl font-semibold mb-4">Our Vision</h2>
          <p className="text-gray-400 text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa cum sociis natoque.
          </p>
        </div>

        {/* Image Section */}
        <div className="w-1/3 flex items-center justify-center">
          <img
            src="../image/blog1.jpg"
            alt="Person working on laptop"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Mission Section */}
        <div className="bg-[#151A28] p-8  flex flex-col items-center justify-center w-1/3">
          <IoIosRocket className="text-[#FF6B53] w-12 h-12 mb-4" />
          <h2 className="text-white text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-400 text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa cum sociis natoque.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionVisionComponent;
