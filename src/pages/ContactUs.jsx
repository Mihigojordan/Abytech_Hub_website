import React from 'react';
import Header from '../components/header';
import { useRef } from "react";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_kwzng64", 
        "template_bz2mb97",
        form.current,
        "GbB192kAFStZjdFfT" 
      )
      .then(
        (result) => {
          console.log("Success:", result.text);
          alert("Message sent successfully!");
        },
        (error) => {
          console.log("Error:", error.text);
          alert("Failed to send message.");
        }
      );
  };
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
            style={{borderRadius:"10px"}}
          ></iframe>
        </div>
        
        {/* Contact Form */}
        <form ref={form} onSubmit={sendEmail} className="w-full md:w-1/2 flex flex-col" style={{height:"100%", gap:"1.7rem"}}>
          <input
            type="text"
            name="from_name"
            placeholder="Name*"
            className="w-full border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          />
          <input
            type="email"
            name="user_email"
            placeholder="Email*"
            className="w-full border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject*"
            className="w-full border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          />
          <textarea
            name="message"
            placeholder="Messages*"
            className="w-full min-h-28 border-b-2 outline-none border-neutral-600 text-lg py-2 focus:border-[#ff6f6f]"
          ></textarea>

               


          {/* Submit Button */}
          <button 
          type="submit"
          className="p-4 cursor-pointer bg-[#FF9078] w-52 text-xl text-white rounded-md hover:bg-[#ff6f6f] transition">
            Submit Now
          </button>
        </form>

       
      </div>
    </div>
  );
};

export default ContactUs;
