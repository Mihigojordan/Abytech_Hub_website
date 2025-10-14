
import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import image1 from '../assets/images/sadiki.jpg';
import image2 from '../assets/mihi.jpg';
import image3 from '../assets/serge.jpg';
import image4 from '../assets/honore.jpg';
import { Mail, MapPin } from 'lucide-react';
import Header from '../components/header';

const teamMembers = [
  {
    id: 1,
    name: 'Sadiki Rukara',
    position: 'C.E.O && FOUNDER',
    department: 'Development',
    image: image1,
    bio: 'With 8+ years of expertise in full-stack development, Sarah leads our development initiatives and mentors junior developers.',
    email: 'rukara2095@gmail.com',
    phone: '+250 791 812 389',
    location: 'United State Of America',
    joinDate: 'March 2020',
    linkedin: 'sarah-johnson',
    twitter: 'sarahdev',
    github: 'sarah-codes',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    rating: 4.9,
    projects: 23,
    certifications: ['AWS Solutions Architect', 'React Specialist'],
  },
  {
    id: 2,
    name: 'Mihigo Prince Jordan',
    position: 'Senior Full Stack Software Developer',
    department: 'Development',
    image: image2,
    bio: 'With 8+ years of expertise in full-stack development, Sarah leads our development initiatives and mentors junior developers.',
    email: 'mihigojordan8@gmail.com',
    phone: '+250 791 812 389',
    location: 'Kigali, Rwanda',
    joinDate: 'March 2020',
    linkedin: 'sarah-johnson',
    twitter: 'sarahdev',
    github: 'sarah-codes',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'MongoDB'],
    rating: 4.9,
    projects: 23,
    certifications: ['AWS Solutions Architect', 'React Specialist'],
  },
  {
    id: 3,
    name: 'Ishimwe Serge',
    position: 'UI/UX Designer and frontend developer',
    department: 'Design',
    image: image3,
    bio: 'Creative UI/UX designer with 6+ years of experience crafting user-centered digital experiences.',
    email: 'ishiweserge07@gmail.com',
    phone: '+250 796 130 187',
    location: 'Kigali, Rwanda',
    joinDate: 'January 2021',
    linkedin: 'michael-chen-design',
    twitter: 'mikedesigns',
    github: 'mike-ui',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'HTML/CSS'],
    rating: 4.8,
    projects: 18,
    certifications: ['Google UX Design', 'Adobe Certified Expert'],
  },
  {
    id: 4,
    name: 'Hirwa Mihigo Honore',
    position: 'Devops && backend developer',
    department: 'backend',
    image: image4,
    bio: 'Skilled DevOps engineer ensuring applications run smoothly and scale efficiently across multiple environments.',
    email: 'mihigohonore@gmail.com',
    phone: '+1 (555) 345-6789',
    location: 'Kamonyi, Rwanda',
    joinDate: 'September 2019',
    linkedin: 'emily-rodriguez-devops',
    twitter: 'emilyops',
    github: 'emily-infra',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Jenkins'],
    rating: 4.9,
    projects: 31,
    certifications: ['AWS DevOps Professional', 'Kubernetes Administrator'],
  },
];

const TeamMemberCard = ({ member }) => (
  <div
    className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:border-primary-400 transition-all duration-300 group"
    data-aos="zoom-in"
    data-aos-delay={Math.floor(Math.random() * 400)}
  >
    {/* Profile Image & Basic Info */}
    <div className="text-center mb-8">
      <div className="relative mb-6">
        <img
          src={member.image}
          alt={member.name}
          className="w-40 h-40 rounded-full mx-auto border-4 border-gray-200 group-hover:border-primary-400 transition-colors duration-300 object-cover"
        />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-500 transition-colors">
        {member.name}
      </h3>
      <p className="text-primary-500 font-medium text-sm mb-2">
        {member.position}
      </p>
    </div>

    {/* Contact Info */}
    <div className="space-y-4 mb-8">
      <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
        <MapPin className="w-4 h-4 text-primary-500 mr-3" />
        {member.location}
      </div>
      <div className="flex items-center text-gray-600 text-sm bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
        <Mail className="w-4 h-4 text-primary-500 mr-3" />
        <span className="truncate">{member.email}</span>
      </div>
    </div>

    {/* Divider */}
    <div className="w-12 h-1 bg-gradient-to-r from-primary-400 to-primary-300 rounded-full mx-auto"></div>
  </div>
);

export default function TeamMembersPage() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true, easing: 'ease-in-out' });
    document.documentElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'start',
    });
  }, []);

  return (
    <div className="w-full flex flex-col pb-16 items-center gap-12 bg-gradient-to-br from-white via-gray-50 to-blue-50 min-h-screen">
      <Header title="Our Team" path="team-member" />

      {/* Hero Section */}
      <div className="text-center max-w-8xl mx-auto px-6 mt-8" data-aos="fade-up">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Meet Our <span className="text-primary-500">Exceptional Team</span>
        </h1>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
          Discover the talented professionals who drive our success. Each member brings unique expertise, creativity, and dedication to deliver outstanding results.
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
}
