
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import abyride from '../../assets/images/abyride.png';
import rentbyaby from '../../assets/images/rentbyaby.png';
import abyinventory from '../../assets/images/abyinventory.png';

const partners = [
  { name: 'AbyRide', logo: abyride },
  { name: 'Rent By Aby', logo: rentbyaby },
  { name: 'Aby Inventory', logo: abyinventory },
];

export default function Partners() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
  }, []);

  return (
    <section className=" py-16 md:py-24 px-4 md:px-8">
      <div className="mx-auto w-[80%]">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-primary-500">Partners</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Working together with trusted brands to bring value and innovation.
          </p>
        </div>

        {/* Partners Slider */}
        <div className="relative">
          <Swiper
            modules={[Pagination, Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{
              el: '.swiper-pagination',
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active',
            }}
            className="mySwiper"
          >
            {partners.map((p, index) => (
              <SwiperSlide key={index}>
                <div
                  className="px-3 md:px-4"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <div className="h-full bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-primary-400 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-center h-28 mb-4">
                      <img
                        src={p.logo}
                        alt={p.name}
                        className="max-h-20 object-contain"
                      />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-500 transition-colors text-center">
                      {p.name}
                    </h3>
                    {/* Divider */}
                    <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full mx-auto mt-4"></div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Pagination Dots */}
          <div className="swiper-pagination flex justify-center gap-2 mt-8 md:mt-12"></div>
        </div>
      </div>
    </section>
  );
}
