import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from "lucide-react";
import Header from "../components/header";
import { useTheme } from "../context/ThemeContext";
import { ORG, TEAL, bb, bc, ba } from "../utils/homeConstants";
import api from "../api/api";

const CONTACT_INFO = [
  { Icon: Phone,   title: "Phone",         detail: "+250 792 888 980",      link: "tel:+250792888980" },
  { Icon: Mail,    title: "Email",         detail: "info@abytechhub.com",   link: "mailto:info@abytechhub.com" },
  { Icon: MapPin,  title: "Location",      detail: "KN 3 Rd, Kigali",       link: "https://share.google/zMIUGhrORT3Knc0xA" },
  { Icon: Clock,   title: "Working Hours", detail: "24 / 7 Available",      link: null },
];

export default function ContactUs() {
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading]   = useState(false);

  /* colours */
  const bg      = isDark ? "#071418" : "#f5efe6";
  const bg2     = isDark ? "#0a1e28" : "#ede5da";
  const cardBg  = isDark ? "#0d3040" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC   = isDark ? "#fff"    : "#071418";
  const text2   = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3   = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";
  const inputBg = isDark ? "#071418" : "#f8f6f2";
  const inputBorder     = isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.12)";
  const inputBorderFocus= ORG;
  const labelColor      = isDark ? "rgba(255,255,255,.6)" : "rgba(7,20,24,.6)";

  useEffect(() => {
    document.documentElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/contact", formData);
      alert("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: bg }}>
      <Header title="Contact Us" path="Contact Us" />

      {/* ── INFO CARDS ─────────────────────────────────────── */}
      <div style={{ background: bg2 }}  >
        <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-20">

          {/* label + heading */}
          <div className="flex items-center gap-3 mb-4"
            style={{ ...bc(10, 700, { letterSpacing: 5, textTransform: "uppercase", color: ORG }) }}>
            <div className="w-6 h-[2px]" style={{ background: ORG }} />
            Get In Touch
          </div>
          <h2 className="at-reveal mb-12" style={{ ...bb("clamp(38px,6vw,66px)", { lineHeight: .9, letterSpacing: 2, color: textC }) }}>
            WE'D LOVE TO<br /><span style={{ color: ORG }}>HEAR FROM YOU</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5">
            {CONTACT_INFO.map(({ Icon, title, detail, link }, i) => (
              <div key={title}
                className={`at-reveal ${i > 0 ? `at-d${i}` : ""} group p-7 relative overflow-hidden transition-colors duration-200`}
                style={{ background: cardBg, border: `1px solid ${border}` }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? "#0f2636" : "#f5f5f5"}
                onMouseLeave={e => e.currentTarget.style.background = cardBg}
              >
                {/* top bar on hover via svc-bar pattern */}
                <div className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"
                  style={{ background: ORG }} />

                <div className="w-11 h-11 rounded flex items-center justify-center mb-5"
                  style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)" }}>
                  <Icon size={18} color={ORG} />
                </div>

                <div style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: "uppercase", color: text3, marginBottom: 6 }) }}>
                  {title}
                </div>

                {link ? (
                  <a href={link}
                    target={link.startsWith("http") ? "_blank" : undefined}
                    rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-1.5 no-underline group/link"
                    style={{ ...bc(15, 700, { color: textC, letterSpacing: .5 }) }}>
                    <span className="group-hover/link:text-[#e8621a] transition-colors">{detail}</span>
                    <ArrowRight size={13} color={ORG} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <div style={{ ...bc(15, 700, { color: textC, letterSpacing: .5 }) }}>{detail}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM + MAP ─────────────────────────────────────── */}
      <div style={{ background: bg }}>
        <div className="max-w-[1500px] mx-auto px-5 sm:px-10 lg:px-20 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0.5 items-stretch">

            {/* Map */}
            <div className="at-reveal relative overflow-hidden min-h-[340px]" style={{ border: `1px solid ${border}` }}>
              {/* label overlay */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2"
                style={{ background: cardBg, border: `1px solid ${border}` }}>
                <MapPin size={14} color={ORG} />
                <span style={{ ...bc(11, 700, { letterSpacing: 2, textTransform: "uppercase", color: textC }) }}>Our Location</span>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5327263231056!2d30.088148374487194!3d-1.9394623366878265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca6eb4b136305%3A0xfa7ecaf4c40f3383!2skLab!5e0!3m2!1sen!2srw!4v1766393500461!5m2!1sen!2srw"
                className="w-full h-full border-0 absolute inset-0"
                style={{ filter: isDark ? "invert(1) hue-rotate(180deg)" : "none" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Form */}
            <div className="at-reveal at-d1 p-8 sm:p-12 relative overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
              {/* decorative number */}
              <div className="absolute top-4 right-6 pointer-events-none select-none"
                style={{ ...bb(100, { color: ORG, opacity: .05, lineHeight: 1 }) }}>✉</div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)" }}>
                  <Send size={16} color={ORG} />
                </div>
                <h2 style={{ ...bb("clamp(28px,4vw,42px)", { letterSpacing: 2, color: textC, lineHeight: 1 }) }}>
                  SEND A MESSAGE
                </h2>
              </div>
              <p className="mb-8" style={{ ...ba(14, 300, { color: text2, lineHeight: 1.8 }) }}>
                Fill out the form below and we'll get back to you as soon as possible.
              </p>

              <form onSubmit={sendMessage} className="flex flex-col gap-5">

                {/* Full Name */}
                <div>
                  <label className="block mb-2" style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: "uppercase", color: labelColor }) }}>
                    Full Name
                  </label>
                  <input
                    type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="John Doe" required
                    className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={{
                      background: inputBg, border: `1px solid ${inputBorder}`,
                      color: textC, ...ba(14, 400, {}),
                    }}
                    onFocus={e => e.target.style.borderColor = inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2" style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: "uppercase", color: labelColor }) }}>
                    Email Address
                  </label>
                  <input
                    type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" required
                    className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={{
                      background: inputBg, border: `1px solid ${inputBorder}`,
                      color: textC, ...ba(14, 400, {}),
                    }}
                    onFocus={e => e.target.style.borderColor = inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block mb-2" style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: "uppercase", color: labelColor }) }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message} onChange={handleChange}
                    placeholder="Tell us about your project or inquiry…" required
                    rows={5}
                    className="w-full px-4 py-3 outline-none transition-colors duration-200 resize-none"
                    style={{
                      background: inputBg, border: `1px solid ${inputBorder}`,
                      color: textC, ...ba(14, 400, {}),
                    }}
                    onFocus={e => e.target.style.borderColor = inputBorderFocus}
                    onBlur={e => e.target.style.borderColor = inputBorder}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 mt-1 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: ORG, ...bb(16, { letterSpacing: 3, color: "#fff" }), borderRadius: 0 }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* ── CTA STRIP ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: TEAL }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: ORG, clipPath: "polygon(0 0,18% 0,6% 100%,0 100%)", opacity: .25 }} />
        <div className=" mx-auto px-5 sm:px-10 lg:px-20 py-14 relative z-[2]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 style={{ ...bb("clamp(28px,4vw,48px)", { letterSpacing: 2, color: "#fff", lineHeight: .9 }) }}>
                READY TO START A PROJECT?
              </h3>
              <p className="mt-3" style={{ ...ba(14, 300, { color: "rgba(255,255,255,.65)", lineHeight: 1.7 }) }}>
                Let's turn your idea into a powerful digital product.
              </p>
            </div>
            <a href="https://abytechhub.com/" target="_blank" rel="noreferrer"
              className="btn-white shrink-0 inline-block no-underline"
              style={{ ...bb(15, { letterSpacing: 2, color: "#071418" }), background: "#fff", padding: "13px 32px", borderRadius: 4 }}>
              Visit Our Website →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
