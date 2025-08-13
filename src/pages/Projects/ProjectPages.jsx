import React, { useEffect } from "react";
import { ExternalLink, Github, Code } from "lucide-react";
import Header from "../../components/header";
import ride from "../../assets/images/project/ride.png";
import chat from "../../assets/images/project/chat.png";
import rent from "../../assets/images/project/rent.png";
import inventory from "../../assets/images/project/inventory.png";
import frexi from "../../assets/images/project/flex.png"
import kalinga from "../../assets/images/project/kalinga.png"
import abyhr from "../../assets/images/project/abyhr.png"

// Projects data
const projects = [
  {
    id: 1,
    title: "Abyride",
    imageUrl: ride,
    description:
      "A platform connecting users with reliable and affordable ride services.",
    techStack: [
      "React.js",
      "Vite",
      "Socket.io",
      "Node.js",
      "NestJS",
      "TailwindCSS",
      "MySQL",
      "Prisma",
    ],
    liveDemo: "https://abyride.com/",
  },
  {
    id: 2,
    title: "Aby Inventory System",
    imageUrl: inventory,
    description:
      "Helps businesses manage stock and user permissions smoothly, online or offline.",
    techStack: [
      "React.js",
      "Vite PWA",
      "Vite",
      "TailwindCSS",
      "NestJS",
      "MySQL",
      "Prisma",
    ],
    liveDemo: "https://abyinventory.com/",
  },
  {
    id: 3,
    title: "Hi Chat",
    imageUrl: chat,
    description:
      "Fast, real-time messaging platform for texts and file sharing across devices.",
    techStack: [
      "React.js",
      "Socket.io",
      "TailwindCSS",
      "Vite",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Cloudinary",
    ],
    liveDemo: "https://chatapppz.netlify.app/",
  },
  {
    id: 4,
    title: "Rent By Aby",
    imageUrl: rent,
    description:
      "Platform connecting renters and property owners for easy booking and management.",
    techStack: [
      "React.js",
      "Vite",
      "Node.js",
      "NestJS",
      "TailwindCSS",
      "MySQL",
      "Prisma",
      "Lucide-react",
    ],
    liveDemo: "https://rentbyaby.com",
  },
  {
    id: 5,
    title: "frexi",
    imageUrl: frexi,
    description:
      "Frexi Travel & Tours is a dynamic platform connecting travelers with the breathtaking beauty, diverse wildlife, and rich cultural heritage of East Africa.",
    techStack: [
      "React.js",
      "Vite",
      "Node.js",
      "NestJS",
      "TailwindCSS",
      "MySQL",
      "Prisma",
      "Lucide-react",
    ],
    liveDemo: "https://frexi.rw/",
  },
  {
    id: 6,
    title: "kalinga technology",
    imageUrl: kalinga,
    description:
      "Kalinga Technology is a leading platform for comprehensive technology solutions, offering expert repairs, premium tech products, and unmatched customer service",
    techStack: [
      "React.js",
      "Vite",
      "Node.js",
      "NestJS",
      "TailwindCSS",
      "MySQL",
      "Prisma",
      "Lucide-react",
    ],
    liveDemo: "https://kalingatech.netlify.app/",
  },
  {
    id: 6,
    title: "aby hr management system",
    imageUrl: abyhr,
    description:
      "ABY HR Management is a powerful platform built to empower businesses with world-class HR technology  simplifying workforce management, streamlining processes, and driving organizational success.",
    techStack: [
      "React.js",
      "Vite",
      "Node.js",
      "NestJS",
      "TailwindCSS",
      "MySQL",
      "Prisma",
      "Lucide-react",
    ],
    liveDemo: "https://aby-hr.netlify.app/",
  },
];

// Project Card Component
const ProjectCard = ({ project }) => {
  useEffect(() => {
    document.documentElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  }, []);
  return (
    <div className="bg-gray-800 rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 hover:bg-gray-750 group shadow-lg border border-gray-700">
      {/* Project Image & Basic Info */}
      <div className="text-center mb-8">
        <div className="relative mb-6">
          <div className="w-full h-60 mx-auto rounded-2xl overflow-hidden border-4 border-gray-700 group-hover:border-yellow-400 transition-colors duration-300">
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>

        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">
          {project.title}
        </h3>

        <p className="text-gray-300 text-sm leading-relaxed mb-4 min-h-[3rem]">
          {project.description}
        </p>
      </div>

      {/* Tech Stack
      <div className="mb-6">
        <h4 className="text-yellow-400 font-medium text-sm mb-3 flex items-center">
          <Code className="w-4 h-4 mr-2" />
          Technologies
        </h4>
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div> */}

      {/* Project Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors text-center">
          <div className="text-yellow-400 font-bold text-lg">Live</div>
          <div className="text-gray-300 text-xs">Status</div>
        </div>
        <div className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors text-center">
          <div className="text-yellow-400 font-bold text-lg">
            {project.techStack.length}
          </div>
          <div className="text-gray-300 text-xs">Technologies</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 justify-center pt-4 border-t border-gray-700">
        {project.liveDemo && (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-700 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-colors group/btn"
            title="Live Demo"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}

        {project.repoLink && (
          <a
            href={project.repoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-700 rounded-lg hover:bg-yellow-400 hover:text-gray-900 transition-colors group/btn"
            title="View Code"
          >
            <Github className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );
};
// Main Projects Page Component
const ProjectsPage = () => {
  return (
    <div className="w-full flex flex-col pb-16 items-center gap-12 mt-8 bg-gray-900 min-h-screen">
      <Header title="Our Projects" path="Project" />

      {/* Hero Section */}
      <div className="text-center  mx-auto px-6 mt-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
          Our <span className="text-yellow-400">Amazing Projects</span>
        </h1>
        <p className="text-gray-300 text-xl leading-relaxed mb-12">
          Discover our portfolio of innovative solutions. Each project
          represents our commitment to excellence, creativity, and cutting-edge
          technology implementation.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {projects.length}
            </div>
            <div className="text-gray-300 font-medium">Live Projects</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">
              {[...new Set(projects.flatMap((p) => p.techStack))].length}
            </div>
            <div className="text-gray-300 font-medium">Technologies Used</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-700">
            <div className="text-4xl font-bold text-yellow-400 mb-2">100%</div>
            <div className="text-gray-300 font-medium">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className=" w-full md:w-10/12 mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <div className="text-center mt-16 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Start Your Project?
        </h2>
        <p className="text-gray-300 text-lg mb-8">
          Want to see more projects or collaborate on something new? Let's
          discuss how we can bring your ideas to life.
        </p>
        <button className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl">
          Get In Touch
        </button>
      </div>
    </div>
  );
};

export default ProjectsPage;
