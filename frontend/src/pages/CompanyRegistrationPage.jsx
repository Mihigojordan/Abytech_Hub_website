import { useEffect, useState } from "react";
import {
  Building2, User, Mail, Phone, MapPin, Globe, Users,
  FileText, Send, CheckCircle2, ArrowRight, Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import { useTheme } from "../context/ThemeContext";
import { ORG, TEAL, bb, bc, ba } from "../utils/homeConstants";
import companyRegistrationService, {
  BUSINESS_TYPES, EMPLOYEE_RANGES, HEAR_ABOUT_OPTIONS, MODULES,
} from "../services/companyRegistrationService";

const INITIAL_FORM = {
  businessName: "", businessType: "", businessTypeOther: "",
  address: "", city: "", country: "Rwanda",
  numberOfBranches: "", numberOfEmployees: "", website: "",
  contactName: "", contactRole: "", email: "", phone: "",
  interestedModules: [], currentSystem: "", reasonForInterest: "",
  hearAboutUs: "", additionalNotes: "",
};

export default function CompanyRegistrationPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState("");

  const bg      = isDark ? "#071418" : "#f5efe6";
  const bg2     = isDark ? "#0a1e28" : "#ede5da";
  const cardBg  = isDark ? "#0d3040" : "#ffffff";
  const border  = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)";
  const textC   = isDark ? "#fff"    : "#071418";
  const text2   = isDark ? "rgba(255,255,255,.55)" : "rgba(7,20,24,.6)";
  const text3   = isDark ? "rgba(255,255,255,.25)" : "rgba(7,20,24,.3)";
  const inputBg = isDark ? "#071418" : "#f8f6f2";
  const inputBorder      = isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.12)";
  const inputBorderFocus = ORG;
  const labelColor       = isDark ? "rgba(255,255,255,.6)" : "rgba(7,20,24,.6)";

  useEffect(() => {
    document.documentElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleModule = (key) => {
    setFormData((prev) => ({
      ...prev,
      interestedModules: prev.interestedModules.includes(key)
        ? prev.interestedModules.filter((m) => m !== key)
        : [...prev.interestedModules, key],
    }));
  };

  const validate = () => {
    const next = {};
    if (!formData.businessName.trim()) next.businessName = "Business name is required";
    if (!formData.businessType) next.businessType = "Select a business type";
    if (formData.businessType === "Other" && !formData.businessTypeOther.trim())
      next.businessTypeOther = "Please specify your business type";
    if (!formData.address.trim()) next.address = "Address is required";
    if (!formData.city.trim()) next.city = "City is required";
    if (!formData.country.trim()) next.country = "Country is required";
    if (!formData.contactName.trim()) next.contactName = "Contact name is required";
    if (!formData.contactRole.trim()) next.contactRole = "Your role is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) next.email = "Enter a valid email";
    if (!formData.phone.trim()) next.phone = "Phone number is required";
    if (!formData.reasonForInterest.trim()) next.reasonForInterest = "Tell us why you want to use Abydash";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    try {
      const record = await companyRegistrationService.submitRegistration(formData);
      setReferenceId(record.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    background: inputBg,
    border: `1px solid ${errors[field] ? "#e84040" : inputBorder}`,
    color: textC,
    ...ba(14, 400, {}),
  });

  const Label = ({ children, required }) => (
    <label className="block mb-2" style={{ ...bc(10, 700, { letterSpacing: 3, textTransform: "uppercase", color: labelColor }) }}>
      {children}{required && <span style={{ color: ORG }}> *</span>}
    </label>
  );

  const FieldError = ({ field }) =>
    errors[field] ? (
      <p data-error="true" style={{ ...ba(11, 500, { color: "#e84040", marginTop: 4 }) }}>{errors[field]}</p>
    ) : null;

  const focusHandlers = (field) => ({
    onFocus: (e) => { e.target.style.borderColor = inputBorderFocus; },
    onBlur: (e) => { e.target.style.borderColor = errors[field] ? "#e84040" : inputBorder; },
  });

  if (submitted) {
    return (
      <div style={{ background: bg }}>
        <Header title="Register Your Business" path="Register" />
        <div style={{ background: bg }}>
          <div className="max-w-[720px] mx-auto px-5 sm:px-10 py-16 lg:py-24">
            <div className="p-8 sm:p-12 text-center relative overflow-hidden" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: ORG }} />
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: "rgba(74,222,128,.12)", border: "1px solid rgba(74,222,128,.3)" }}>
                <CheckCircle2 size={30} color="#4ade80" />
              </div>
              <h2 style={{ ...bb("clamp(28px,4vw,42px)", { letterSpacing: 2, color: textC, lineHeight: 1 }) }}>
                REGISTRATION SUBMITTED
              </h2>
              <p className="mt-4 max-w-[480px] mx-auto" style={{ ...ba(14, 400, { color: text2, lineHeight: 1.8 }) }}>
                Thank you, <strong style={{ color: textC }}>{formData.contactName}</strong>. We've received the registration
                for <strong style={{ color: textC }}>{formData.businessName}</strong>. Our team will review your
                application and get back to you within 1-2 business days at{" "}
                <strong style={{ color: textC }}>{formData.email}</strong>.
              </p>
              <div className="mt-6 inline-block px-4 py-2" style={{ background: bg2, border: `1px solid ${border}` }}>
                <span style={{ ...bc(10, 700, { letterSpacing: 2, textTransform: "uppercase", color: text3 }) }}>Reference ID </span>
                <span style={{ ...bc(13, 700, { color: ORG, letterSpacing: 1 }) }}>{referenceId.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => { setSubmitted(false); setFormData(INITIAL_FORM); }}
                  className="px-6 py-3 cursor-pointer"
                  style={{ background: bg2, border: `1px solid ${border}`, color: textC, ...ba(13, 600, {}) }}
                >
                  Submit Another Registration
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="btn-primary px-6 py-3 border-none cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: ORG, ...bb(14, { letterSpacing: 2, color: "#fff" }) }}
                >
                  Back to Home <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: bg }}>
      <Header title="Register Your Business" path="Register" />

      {/* Intro strip */}
      <div style={{ background: bg2 }}>
        <div className="mx-auto px-5 sm:px-10 lg:px-20 py-14">
          <div className="flex items-center gap-3 mb-4"
            style={{ ...bc(10, 700, { letterSpacing: 5, textTransform: "uppercase", color: ORG }) }}>
            <div className="w-6 h-[2px]" style={{ background: ORG }} />
            Get Started With Abydash
          </div>
          <h2 style={{ ...bb("clamp(32px,5vw,52px)", { lineHeight: .95, letterSpacing: 2, color: textC }) }}>
            TELL US ABOUT<br /><span style={{ color: ORG }}>YOUR BUSINESS</span>
          </h2>
          <p className="mt-4 max-w-[620px]" style={{ ...ba(14, 300, { color: text2, lineHeight: 1.8 }) }}>
            Register your restaurant, shop, hotel, bar or supermarket to get access to Abydash — our
            all-in-one operations platform. Submit the form below and our team will review and reach
            out to activate your account.
          </p>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: bg }}>
        <div className="px-5 sm:px-10 lg:px-20 py-16 lg:py-20">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-0.5">
 {/* Section: Contact Person */}
            <div className="p-8 sm:p-10 lg:col-span-2" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: "rgba(26,92,120,.12)", border: "1px solid rgba(26,92,120,.3)" }}>
                  <User size={16} color={TEAL} />
                </div>
                <h3 style={{ ...bb(26, { letterSpacing: 1, color: textC, lineHeight: 1 }) }}>CONTACT PERSON</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label required>Full Name</Label>
                  <input type="text" name="contactName" value={formData.contactName} onChange={handleChange}
                    placeholder="John Doe" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("contactName")} {...focusHandlers("contactName")} />
                  <FieldError field="contactName" />
                </div>

                <div>
                  <Label required>Your Role</Label>
                  <input type="text" name="contactRole" value={formData.contactRole} onChange={handleChange}
                    placeholder="e.g. Owner, Manager" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("contactRole")} {...focusHandlers("contactRole")} />
                  <FieldError field="contactRole" />
                </div>

                <div>
                  <Label required>Email Address</Label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="you@example.com" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("email")} {...focusHandlers("email")} />
                  <FieldError field="email" />
                </div>

                <div>
                  <Label required>Phone Number</Label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+250 7__ ___ ___" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("phone")} {...focusHandlers("phone")} />
                  <FieldError field="phone" />
                </div>
              </div>
            </div>
            
            {/* Section: Business Details */}
            <div className="p-8 sm:p-10 relative" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)" }}>
                  <Building2 size={16} color={ORG} />
                </div>
                <h3 style={{ ...bb(26, { letterSpacing: 1, color: textC, lineHeight: 1 }) }}>BUSINESS DETAILS</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <Label required>Business Name</Label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange}
                    placeholder="e.g. Kigali Bites Restaurant" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("businessName")} {...focusHandlers("businessName")} />
                  <FieldError field="businessName" />
                </div>

                <div>
                  <Label required>Business Type</Label>
                  <select name="businessType" value={formData.businessType} onChange={handleChange}
                    className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("businessType")} {...focusHandlers("businessType")}>
                    <option value="">Select type…</option>
                    {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <FieldError field="businessType" />
                </div>

                {formData.businessType === "Other" ? (
                  <div>
                    <Label required>Specify Business Type</Label>
                    <input type="text" name="businessTypeOther" value={formData.businessTypeOther} onChange={handleChange}
                      placeholder="e.g. Bakery" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                      style={inputStyle("businessTypeOther")} {...focusHandlers("businessTypeOther")} />
                    <FieldError field="businessTypeOther" />
                  </div>
                ) : (
                  <div>
                    <Label>Number of Employees</Label>
                    <select name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleChange}
                      className="w-full px-4 py-3 outline-none transition-colors duration-200"
                      style={inputStyle("numberOfEmployees")} {...focusHandlers("numberOfEmployees")}>
                      <option value="">Select range…</option>
                      {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <Label required>Business Address</Label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange}
                    placeholder="Street, sector" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("address")} {...focusHandlers("address")} />
                  <FieldError field="address" />
                </div>

                <div>
                  <Label required>City</Label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange}
                    placeholder="e.g. Kigali" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("city")} {...focusHandlers("city")} />
                  <FieldError field="city" />
                </div>

                <div>
                  <Label required>Country</Label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange}
                    placeholder="e.g. Rwanda" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("country")} {...focusHandlers("country")} />
                  <FieldError field="country" />
                </div>

                {formData.businessType && formData.businessType !== "Other" && (
                  <div>
                    <Label>Number of Branches</Label>
                    <input type="number" min="1" name="numberOfBranches" value={formData.numberOfBranches} onChange={handleChange}
                      placeholder="1" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                      style={inputStyle("numberOfBranches")} {...focusHandlers("numberOfBranches")} />
                  </div>
                )}

                <div>
                  <Label>Website (optional)</Label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange}
                    placeholder="https://…" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("website")} {...focusHandlers("website")} />
                </div>
              </div>
            </div>

           

            {/* Section: About your needs */}
            <div className=" p-8 sm:p-10" style={{ background: cardBg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ background: "rgba(232,98,26,.1)", border: "1px solid rgba(232,98,26,.25)" }}>
                  <FileText size={16} color={ORG} />
                </div>
                <h3 style={{ ...bb(26, { letterSpacing: 1, color: textC, lineHeight: 1 }) }}>TELL US MORE</h3>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <Label>Which modules are you interested in?</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {MODULES.map(({ key, label }) => {
                      const active = formData.interestedModules.includes(key);
                      return (
                        <button
                          type="button" key={key} onClick={() => toggleModule(key)}
                          className="cursor-pointer transition-colors duration-150"
                          style={{
                            padding: "8px 14px", border: `1px solid ${active ? ORG : inputBorder}`,
                            background: active ? "rgba(232,98,26,.12)" : inputBg,
                            color: active ? ORG : text2,
                            ...bc(12, 600, { letterSpacing: .5 }),
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label>What are you currently using to manage your business?</Label>
                  <input type="text" name="currentSystem" value={formData.currentSystem} onChange={handleChange}
                    placeholder="e.g. Excel, paper records, another POS…" className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={inputStyle("currentSystem")} {...focusHandlers("currentSystem")} />
                </div>

                <div>
                  <Label required>Why do you want to use Abydash?</Label>
                  <textarea name="reasonForInterest" value={formData.reasonForInterest} onChange={handleChange}
                    placeholder="Tell us about the problems you're trying to solve…" rows={4}
                    className="w-full px-4 py-3 outline-none transition-colors duration-200 resize-none"
                    style={inputStyle("reasonForInterest")} {...focusHandlers("reasonForInterest")} />
                  <FieldError field="reasonForInterest" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <Label>How did you hear about us?</Label>
                    <select name="hearAboutUs" value={formData.hearAboutUs} onChange={handleChange}
                      className="w-full px-4 py-3 outline-none transition-colors duration-200"
                      style={inputStyle("hearAboutUs")} {...focusHandlers("hearAboutUs")}>
                      <option value="">Select…</option>
                      {HEAR_ABOUT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Anything else we should know? (optional)</Label>
                  <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange}
                    placeholder="Optional notes for our onboarding team…" rows={3}
                    className="w-full px-4 py-3 outline-none transition-colors duration-200 resize-none"
                    style={inputStyle("additionalNotes")} {...focusHandlers("additionalNotes")} />
                </div>
              </div>
            </div>

            

            {/* Submit */}
            <div className="lg:col-span-2 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ background: cardBg, border: `1px solid ${border}` }}>
              <p className="flex items-center gap-2" style={{ ...ba(12, 400, { color: text3 }) }}>
                <Store size={14} /> Your application is reviewed manually by our team.
              </p>
              <button
                type="submit" disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 px-8 py-4 border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                style={{ background: ORG, ...bb(16, { letterSpacing: 3, color: "#fff" }) }}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Registration
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
