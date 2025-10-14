import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FaQuoteRight, FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const testimonials = [
  {
    rating: 5,
    title: 'Software Engineer',
    emoji: '🚀',
    text: 'AbyTech has been a game-changer for my career. Their mentorship and resources helped me scale my skills to new heights!',
    name: 'Nsanzimana Fabrice',
    date: '15 March 2025',
  },
  {
    rating: 4,
    title: 'IT Manager',
    emoji: '💡',
    text: 'Working with AbyTech was an eye-opening experience. Their expertise and professional approach to IT solutions impressed me greatly.',
    name: 'Nkaka Jean Doumour',
    date: '5 Feb 2025',
  },
  {
    rating: 5,
    title: 'Data Analyst',
    emoji: '📊',
    text: 'AbyTech provided powerful tools and insights that helped optimize our data processing. Highly recommend their services!',
    name: 'Mihigo Guillaume',
    date: '28 Jan 2025',
  },
  {
    rating: 5,
    title: 'Full Stack Developer',
    emoji: '💻',
    text: 'AbyTech transformed my approach to web and backend development. Their hands-on guidance was invaluable.',
    name: 'Habineza Patrick',
    date: '10 March 2025',
  },
  {
    rating: 4,
    title: 'Cloud Engineer',
    emoji: '☁️',
    text: 'Their cloud solutions are top-notch! AbyTech helped us implement secure and scalable architectures.',
    name: 'Rugamba Eric',
    date: '3 Feb 2025',
  },
  {
    rating: 5,
    title: 'UX/UI Designer',
    emoji: '🎨',
    text: 'Amazing experience! The design team at AbyTech has a keen eye for user experience and creativity.',
    name: 'Umutoni Grace',
    date: '18 Feb 2025',
  },
];

export default function Testimonials() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
  }, []);

  return (
    <section className="bg-gradient-to-br from-white via-gray-50 to-blue-50 py-16 md:py-24 px-4 md:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our <span className="text-primary-500">Clients</span> Say
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Different customers sharing their real experience and success stories with AbyTech.
          </p>
        </div>

        {/* Testimonials Slider */}
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
            //  pagination={{ clickable: true }}
            className="mySwiper"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div
                  className="px-3 md:px-4"
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                >
                  <div className="h-full bg-white border-2 border-gray-200 rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl hover:border-primary-400 transition-all duration-300 group">
                    {/* Quote Icon */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center">
                        <FaQuoteRight className="text-primary-500 text-lg" />
                      </div>
                      <div className="text-2xl">{testimonial.emoji}</div>
                    </div>

                    {/* Star Ratings */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                      {[...Array(5 - testimonial.rating)].map((_, i) => (
                        <FaStar key={i + testimonial.rating} className="text-gray-300 text-sm" />
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-500 transition-colors">
                      {testimonial.title}
                    </h3>

                    {/* Testimonial Text */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 min-h-20 line-clamp-4">
                      "{testimonial.text}"
                    </p>

                    {/* Divider */}
                    <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full mb-4"></div>

                    {/* Author Info */}
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-900 text-sm md:text-base">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm">
                        {testimonial.date}
                      </p>
                    </div>
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