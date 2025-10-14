
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { cards } from '../../stores/Blogdata';
import { useNavigate } from 'react-router-dom';

const BlogCard = ({ image, title, description, id }) => {
  const navigate = useNavigate();

  return (
    <div
      className="h-full bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:border-primary-400 transition-all duration-300 group cursor-pointer"
      onClick={() => navigate(`/blog/${id}`)}
    >
      {/* Image Section */}
      <div className="relative w-full h-48 mb-4">
        <img
          src={image}
          className="w-full h-full object-cover rounded-lg"
          alt={title}
        />
        <button className="absolute top-2 left-2 px-3 py-1.5 capitalize text-white font-medium text-xs bg-primary-400 group-hover:bg-primary-500 transition duration-200 ease-in-out rounded-md">
          Content Tips
        </button>
      </div>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 min-h-16 line-clamp-3">
        {description}
      </p>

      {/* Divider */}
      <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full"></div>
    </div>
  );
};

const BlogLatest = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
  }, []);

  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-blue-50 py-16 md:py-24 px-4 md:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest <span className="text-primary-500">News & Blogs</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Explore our latest insights, tips, and updates from the world of technology and innovation.
          </p>
        </div>

        {/* Blog Slider */}
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
            {cards.slice(0, 3).map((card, index) => (
              <SwiperSlide key={index}>
                <div
                  className="px-3 md:px-4"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <BlogCard {...card} id={index + 1} />
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
};

export default BlogLatest;