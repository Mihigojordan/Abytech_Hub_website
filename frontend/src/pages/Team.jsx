import React, { useEffect } from "react";
import { Mail, Star } from "lucide-react";
import Header from "../components/header";
import Image1 from '../assets/mihi.jpg';
import Image2 from '../assets/honore.jpg';
import Image3 from '../assets/serge.jpg';
import Image4 from '../assets/sadiki.jpg';
import Image5 from '../assets/kibasha.jpeg';
import Image6 from '../assets/fabrice.jpg';
import Image7 from '../assets/david.jpeg';
import Image8 from '../assets/sadiki.jpg';

const TeamMembersPage = () => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);

  const generateEmail = (name) => {
    return name.toLowerCase().replace(/\s+/g, '') + "@abytechhub.com";
  };

  const teamMembers = [
    {
      id: 1,
      name: "Sadiki Rukara",
      position: "C.E.O & FOUNDER",
      image: Image4,
      email: generateEmail("Sadiki Rukara"),
    },
    {
      id: 2,
      name: "Mihigo Prince Jordan",
      position: "Visionary Leader",
      image: Image1,
      email: generateEmail("Mihigo Prince Jordan"),
    },
    {
      id: 5,
      name: "Kibasha Nsinzi Francois",
      position: "Senior Software Engineer",
      image: Image5,
      email: generateEmail("Kibasha Nsinzi Francois"),
    },
    {
      id: 3,
      name: "Ishimwe Serge",
      position: "UI/UX Designer & Frontend Developer",
      image: Image3,
      email: generateEmail("Ishimwe Serge"),
    },
    {
      id: 4,
      name: "Hirwa Mihigo Honore",
      position: "DevOps & Backend Developer",
      image: Image2,
      email: generateEmail("Hirwa Mihigo Honore"),
    },
    
    {
      id: 6,
      name: "Niyigena Egina",
      position: "Frontend Developer",
      image: Image6,
      email: generateEmail("Niyigena Egina"),
    },
    {
      id: 7,
      name: "Nsanzimana Fabrice",
      position: "UI/UX Designer",
      image: Image7,
      email: generateEmail("Nsanzimana Fabrice"),
    },
    {
      id: 8,
      name: "Ndayiringiye David",
      position: "Full Stack Developer",
      image: Image8,
      email: generateEmail("Ndayiringiye David"),
    },
  ];

  const TeamMemberCard = ({ member }) => (
    <div className="group relative bg-white rounded-3xl p-8 hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl overflow-hidden border border-[#101828]/10">
      <div className="absolute inset-0 bg-[#101828] opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl"></div>

      <div className="relative text-center mb-6">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#101828] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500 scale-110"></div>

          <img
            src={member.image}
            alt={member.name}
            className="relative w-60 h-60 rounded-full border-4 border-white shadow-lg group-hover:border-[#101828] transition-all duration-300 object-cover"
          />

          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#101828] rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-[#101828] mb-2 group-hover:scale-105 transition-transform duration-300">
          {member.name}
        </h3>
        <p className="text-[#101828] font-semibold text-sm">
          {member.position}
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-gray-700 text-sm bg-[#101828]/5 p-3 rounded-xl hover:shadow-md transition-all duration-300 group/item">
          <div className="w-8 h-8 bg-[#101828] rounded-lg flex items-center justify-center mr-3 group-hover/item:scale-110 transition-transform duration-300">
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

      <div className="text-center max-w-8xl mx-auto px-6">
        <div className="inline-block mb-6 px-6 py-2 bg-[#101828]/10 rounded-full">
          <span className="text-sm font-semibold text-[#101828]">
            Meet Our Team
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Our{" "}
          <span className="text-[#101828]">
            Exceptional Team
          </span>
        </h1>

        <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
          Discover the talented professionals who drive our success. Each member brings unique expertise, 
          creativity, and dedication to deliver outstanding results.
        </p>
      </div>

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
