import React from 'react';
import Header from '../components/header';

const ContactUs = () => {
  return (
    <div className="w-full flex flex-col pb-7 items-center gap-6 mt-25">
      {/* Header */}
      <Header title="Contact Us" path="contact us" />

      {/* Form & Map Section */}
      <div className="flex flex-col md:flex-row justify-center pt-14 py-7 gap-10 w-11/12 max-w-6xl">
       {/* Google Map */}
       <div className="w-full md:w-1/2">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2922.2939038340305!2d-85.6696030232607!3d42.90884217114711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8819b394c0d8cd01%3A0x24e9c42fcca37dc!2sAbyRide%20taxi%20service!5e0!3m2!1sen!2srw!4v1740779811412!5m2!1sen!2srw"
            className="w-full border-0 aspect-[16/9] md:aspect-[4/3] min-h-[40vh]"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        
        {/* Contact Form */}
        <form className="w-full md:w-1/2 flex flex-col gap-4">
          <input
            type="text"
            placeholder="Name*"
            className="w-full border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          />
          <input
            type="email"
            placeholder="Email*"
            className="w-full border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          />
          <input
            type="text"
            placeholder="Subject*"
            className="w-full border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          />
          <textarea
            placeholder="Messages*"
            className="w-full min-h-28 border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          ></textarea>

            <div className="flex justify-center flex-wrap pt-14 py-7 gap-7 w-full p-3  lg:w-10/12 xl:w-9/12 items-start ">

              
                <form action="" className='w-full lg:w-5/12 gap-2 flex flex-col '>
                <input type="text" placeholder='Name*' className='w-full  border-b-2 outline-none border-neutral-600  *: text-lg py-2 focus:border-b-[#ff6f6f] ' />
                <input type="email" placeholder='Email*' className='w-full  border-b-2 outline-none border-neutral-600  *: text-lg py-2 focus:border-b-[#ff6f6f] ' />
                <input type="text" placeholder='Subject*' className='w-full  border-b-2 outline-none border-neutral-600  *: text-lg py-2 focus:border-b-[#ff6f6f] ' />
                <textarea placeholder='Messages*' className='w-full min-h-28  border-b-2 outline-none border-neutral-600  *: text-lg py-2 focus:border-b-[#ff6f6f] ' ></textarea>
                <div className='flex justify-center items-center gap-6'><input type="checkbox" className='w-4 h-4 cursor-pointer'  /> <span>I agree that my submitted data is being collected and stored.*</span></div>
                <button className='p-4 cursor-pointer bg-[#FF9078] w-52 text-xl'>Submit Now</button>
                </form>

                <div className="flex w-full lg:w-5/12">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2922.2939038340305!2d-85.6696030232607!3d42.90884217114711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8819b394c0d8cd01%3A0x24e9c42fcca37dc!2sAbyRide%20taxi%20service!5e0!3m2!1sen!2srw!4v1740779811412!5m2!1sen!2srw" className='w-full border-0 min-h-[40vh]'  allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>

            </div>


          {/* Submit Button */}
          <button className="p-4 cursor-pointer bg-[#FF9078] w-52 text-xl text-white rounded-md hover:bg-[#ff6f6f] transition">
            Submit Now
          </button>
        </form>

       
      </div>
    </div>
  );
};

export default ContactUs;
