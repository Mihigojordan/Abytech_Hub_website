import React, { useEffect } from "react";
import Header from "../components/header";
import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    from_name: "",
    user_email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const form = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

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
          setFormData({
            from_name: "",
            user_email: "",
            subject: "",
            message: "",
          });
        },
        (error) => {
          console.log("Error:", error.text);
          alert("Failed to send message.");
        }
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="w-full flex flex-col pb-16 items-center gap-12 bg-white">
      {/* Header */}
      <Header title="Contact Us" path="contact us" />

      {/* Form & Map Section */}
      <div className="flex flex-col lg:flex-row justify-center gap-12 w-full px-4 lg:px-0 max-w-7xl mx-auto">
        {/* Google Map */}
        <div className="w-full lg:w-1/2 flex items-center">
          <div className="w-full rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2922.2939038340305!2d-85.6696030232607!3d42.90884217114711!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8819b394c0d8cd01%3A0x24e9c42fcca37dc!2sAbyRide%20taxi%20service!5e0!3m2!1sen!2srw!4v1740779811412!5m2!1sen!2srw"
              className="w-full border-0 aspect-[16/9] lg:aspect-square"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 lg:p-10 rounded-2xl shadow-lg">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Get in Touch
            </h2>

            <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-6">
              {/* Name Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="from_name"
                  value={formData.from_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:bg-white transition duration-200"
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="user_email"
                  value={formData.user_email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:bg-white transition duration-200"
                />
              </div>

              {/* Subject Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:bg-white transition duration-200"
                />
              </div>

              {/* Message Field */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more about your inquiry..."
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-600 focus:bg-white transition duration-200 resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-primary-600 text-white font-bold text-lg rounded-lg hover:bg-primary-700 transition duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;