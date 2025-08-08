import React, { useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Github,
  MapPin,
  Star,
  Award,
  Users,
  Code,
  Database,
  Smartphone,
  Globe,
  Filter,
  Search,
} from "lucide-react";
import Header from "../components/header";
import { div } from "framer-motion/m";

const TeamMembersPage = () => {

  const teamMembers = [
    {
      id: 1,
      name: "Mihigo Prince jordan",
      position: "Senior Developer",
      department: "Development",
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b607?w=400&h=400&fit=crop&crop=face",
      bio: "With 8+ years of expertise in full-stack development, Sarah leads our development initiatives and mentors junior developers.",
      email: "mihigojordan8@gmail.com",
      phone: "+250 791 812 389",
      location: "kigali, rwanda",
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
      name: "ishimwe serge",
      position: "UI/UX Designer and frontend developer",
      department: "Design",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Creative UI/UX designer with 6+ years of experience crafting user-centered digital experiences.",
      email: "ishiweserge07@gmail.com",
      phone: "+250 796 130 187",
      location: "kigali, rwanda",
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
      id: 3,
      name: "hirwa mihigo honore",
      position: "backend developer",
      department: "backend",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "Skilled DevOps engineer ensuring applications run smoothly and scale efficiently across multiple environments.",
      email: "mihigohonore@gmail.com",
      phone: "+1 (555) 345-6789",
      location: "bishenyi, kamonyi",
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
    <div className="bg-gray-800 rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 hover:bg-gray-750 group shadow-lg">
      {/* Profile Image & Basic Info */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <img
            src={member.image}
            alt={member.name}
            className="w-28 h-28 rounded-full mx-auto border-4 border-gray-700 group-hover:border-yellow-400 transition-colors duration-300 object-cover"
          />
        </div>
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-yellow-400 transition-colors">
          {member.name}
        </h3>
        <p className="text-yellow-400 font-medium text-sm mb-2">
          {member.position}
        </p>
        <p className="text-gray-400 text-xs bg-gray-700 px-3 py-1 rounded-full inline-block">
          {member.department}
        </p>
      </div>

      {/* Contact Info */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center text-gray-300 text-sm bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
          <MapPin className="w-4 h-4 text-yellow-400 mr-3" />
          {member.location}
        </div>
        <div className="flex items-center text-gray-300 text-sm bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
          <Mail className="w-4 h-4 text-yellow-400 mr-3" />
          <span className="truncate">{member.email}</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex space-x-3 justify-center pt-4 border-t border-gray-700">
        <a
          href="#"
          className="p-2 bg-gray-700 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
        </a>
        <a
          href="#"
          className="p-2 bg-gray-700 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-colors"
        >
          <Github className="w-4 h-4" />
        </a>
        <a
          href="#"
          className="p-2 bg-gray-700 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-colors"
        >
          <Mail className="w-4 h-4" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col pb-16 items-center gap-12 mt-8 bg-gray-900 min-h-screen">
      <Header title="Our Team" path="team-member" />
      
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto px-6 mt-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
          Meet Our <span className="text-yellow-400">Exceptional Team</span>
        </h1>
        <p className="text-gray-300 text-xl leading-relaxed mb-12">
          Discover the talented professionals who drive our success. Each member brings unique expertise, 
          creativity, and dedication to deliver outstanding results.
        </p>
        
        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{teamMembers.length}</div>
            <div className="text-gray-300 font-medium">Team Members</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">6</div>
            <div className="text-gray-300 font-medium">Departments</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">150+</div>
            <div className="text-gray-300 font-medium">Projects Delivered</div>
          </div>
        </div> */}
      </div>

      {/* Team Grid */}
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMembersPage;