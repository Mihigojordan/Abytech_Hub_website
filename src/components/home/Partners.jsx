import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import abyride from "../../assets/images/abyride.png";
import rentbyaby from "../../assets/images/rentbyaby.png";
import abyinventory from "../../assets/images/abyinventory.png";

const partners = [
  { name: "AbyRide", logo: abyride },
  { name: "Rent By Aby", logo: rentbyaby },
  { name: "Aby Inventory", logo: abyinventory },
];

export default function Partners() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section className="py-16 px-4 text-white w-[80%] mx-auto text-center relative">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold mb-4" data-aos="fade-up">
        Our <span className="text-yellow-400">Partners</span>
      </h2>
      <p className="text-gray-400 mb-12">
        Working together with trusted brands to bring value and innovation.
      </p>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {partners.map((p, i) => (
          <div
            key={i}
            className="bg-[#13151b] p-6 rounded-lg shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-500"
            data-aos="zoom-in"
          >
            <div className="flex items-center justify-center h-28">
              <img
                src={p.logo}
                alt={p.name}
                className="max-h-20 object-contain"
              />
            </div>
            <h3 className="mt-4 font-semibold text-lg text-yellow-400">
              {p.name}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
}
