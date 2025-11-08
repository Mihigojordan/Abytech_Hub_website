import React, { useEffect } from "react";
import { Mail, MapPin, Star } from "lucide-react";
import Header from "../components/header";
import Image1 from '../assets/mihi.jpg';
import Image2 from '../assets/honore.jpg';
import Image3 from '../assets/serge.jpg';
import Image4 from '../assets/sadiki.jpg';

const TeamMembersPage = () => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: "Sadiki Rukara",
      position: "C.E.O & FOUNDER",
      department: "Development",
      image: Image4,
      bio: "With 8+ years of expertise in full-stack development, leading our development initiatives and mentoring junior developers.",
      email: "rukara2095@gmail.com",
      phone: "+250 791 812 389",
      location: "United State Of America",
      joinDate: "March 2020",
      linkedin: "sarah-johnson",
      twitter: "sarahdev",
      github: "sarah-codes",
      skills: ["React", "Node.js", "Python", "AWS", "MongoDB"],
      rating: 4.9,
      projects: 23,
      certifications: ["AWS Solutions Architect", "React Specialist"],
    },
    {
      id: 2,
      name: "Mihigo Prince Jordan",
      position: "Senior Full Stack Software Developer",
      department: "Development",
      image: Image1,
      bio: "With 8+ years of expertise in full-stack development, leading our development initiatives and mentoring junior developers.",
      email: "mihigojordan8@gmail.com",
      phone: "+250 791 812 389",
      location: "Kigali, Rwanda",
      joinDate: "March 2020",
      linkedin: "sarah-johnson",
      twitter: "sarahdev",
      github: "sarah-codes",
      skills: ["React", "Node.js", "Python", "AWS", "MongoDB"],
      rating: 4.9,
      projects: 23,
      certifications: ["AWS Solutions Architect", "React Specialist"],
    },
    {
      id: 3,
      name: "Ishimwe Serge",
      position: "UI/UX Designer & Frontend Developer",
      department: "Design",
      image: Image3,
      bio: "Creative UI/UX designer with 6+ years of experience crafting user-centered digital experiences.",
      email: "ishiweserge07@gmail.com",
      phone: "+250 796 130 187",
      location: "Kigali, Rwanda",
      joinDate: "January 2021",
      linkedin: "michael-chen-design",
      twitter: "mikedesigns",
      github: "mike-ui",
      skills: ["Figma", "Adobe XD", "Prototyping", "User Research", "HTML/CSS"],
      rating: 4.8,
      projects: 18,
      certifications: ["Google UX Design", "Adobe Certified Expert"],
    },
    {
      id: 4,
      name: "Hirwa Mihigo Honore",
      position: "DevOps & Backend Developer",
      department: "Backend",
      image: Image2,
      bio: "Skilled DevOps engineer ensuring applications run smoothly and scale efficiently across multiple environments.",
      email: "mihigohonore@gmail.com",
      phone: "+1 (555) 345-6789",
      location: "Kamonyi, Rwanda",
      joinDate: "September 2019",
      linkedin: "emily-rodriguez-devops",
      twitter: "emilyops",
      github: "emily-infra",
      skills: ["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins"],
      rating: 4.9,
      projects: 31,
      certifications: ["AWS DevOps Professional", "Kubernetes Administrator"],
    },
  ];

  const TeamMemberCard = ({ member }) => (
    <div className="group relative bg-white rounded-3xl p-8 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl overflow-hidden border border-[#37517e]/10">
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-[#37517e] opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl"></div>

      {/* Profile Image */}
      <div className="relative text-center mb-6">
        <div className="relative inline-block mb-6">
          {/* Solid ring glow on hover */}
          <div className="absolute inset-0 bg-[#37517e] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500 scale-110"></div>

          <img
            src={member.image}
            alt={member.name}
            className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg group-hover:border-[#37517e] transition-all duration-300 object-cover"
          />

          {/* Star Badge */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#37517e] rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#37517e] mb-2 group-hover:scale-105 transition-transform duration-300">
          {member.name}
        </h3>
        <p className="text-[#37517e] font-semibold text-sm">
          {member.position}
        </p>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-700 text-sm bg-[#37517e]/5 p-3 rounded-xl hover:shadow-md transition-all duration-300 group/item">
          <div className="w-8 h-8 bg-[#37517e] rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-300">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs">{member.location}</span>
        </div>

        <div className="flex items-center text-gray-700 text-sm bg-[#37517e]/5 p-3 rounded-xl hover:shadow-md transition-all duration-300 group/item">
          <div className="w-8 h-8 bg-[#37517e] rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-300">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="truncate text-xs">{member.email}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col pb-12 items-center gap-12 bg-white min-h-screen">
      <Header title="Our Team" path="Our Team" />

      {/* Hero Section */}
      <div className="text-center max-w-8xl mx-auto px-6">
        <div className="inline-block mb-6 px-6 py-2 bg-[#37517e]/10 rounded-full">
          <span className="text-sm font-semibold text-[#37517e]">
            Meet Our Team
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Our{" "}
          <span className="text-[#37517e]">
            Exceptional Team
          </span>
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
          Discover the talented professionals who drive our success. Each member brings unique expertise, 
          creativity, and dedication to deliver outstanding results.
        </p>
      </div>

      {/* Team Grid */}
      <div className="w-full max-w-8xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMembersPage;