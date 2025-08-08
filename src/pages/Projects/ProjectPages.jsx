import React from 'react';
import { ExternalLink, Github, Code } from 'lucide-react';
import Header from '../../components/header';
import ride from '../../assets/images/project/ride.png'
import chat from '../../assets/images/project/chat.png'
import rent from '../../assets/images/project/rent.png'
import inventory from '../../assets/images/project/inventory.png'

// Projects data
const projects = [
  {
    id: 1,
    title: "Abyride",
    imageUrl: ride,
    description: "A platform connecting users with reliable and affordable ride services.",
    techStack: ["React.js", "Vite", "Socket.io", "Node.js", "NestJS", "TailwindCSS", "MySQL", "Prisma"],
    liveDemo: "https://abyride.com/",
  },
  {
    id: 2,
    title: "Aby Inventory System",
    imageUrl: inventory,
    description: "Helps businesses manage stock and user permissions smoothly, online or offline.",
    techStack: ["React.js", "Vite PWA", "Vite", "TailwindCSS", "NestJS", "MySQL", "Prisma"],
    liveDemo: "https://abyinventory.com/",
},
{
    id: 3,
    title: "Hi Chat",
    imageUrl: chat,
    description: "Fast, real-time messaging platform for texts and file sharing across devices.",
    techStack: ["React.js", "Socket.io", "TailwindCSS", "Vite", "Node.js", "Express.js", "MongoDB", "Cloudinary"],
    liveDemo: "https://chatapppz.netlify.app/",
  },
  {
    id: 4,
    title: "Rent By Aby",
    imageUrl: rent,
    description: "Platform connecting renters and property owners for easy booking and management.",
    techStack: ["React.js", "Vite", "Node.js", "NestJS", "TailwindCSS", "MySQL", "Prisma", "Lucide-react"],
    liveDemo: "https://rentbyaby.com",
  },
];

// Project Card Component
const ProjectCard = ({ project }) => {
    return (
        <div className="group flex flex-col justify-between relative rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-600 hover:border-gray-500" style={{ backgroundColor: '#171B22' }}>
            {/* Project Image */}
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors duration-200">
                    {project.title}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {project.techStack.map((tech, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 text-xs font-medium bg-gray-500 text-white rounded-full"

                        >
                            {tech}
                        </span>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    {
                        project.liveDemo && (
                            <a
                                href={project.liveDemo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 justify-center ${project.repoLink ? 'flex-1' : 'w-full'
                                    }`}
                            >
                                <ExternalLink size={16} />
                                Live Demo
                            </a>

                        )
                    }
                    {project.repoLink && (
                        <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-800 text-sm font-medium rounded-lg transition-colors duration-200 flex-1 justify-center"
                        >
                            <Github size={16} />
                            Code
                        </a>
                    )}
                </div>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
};
// Main Projects Page Component
const ProjectsPage = () => {
    return (
        <div className="min-h-screen pb-7 bg-[#171B224D] pt-20" >
            <Header title={`Our Projects`} path={`Project`} />
            <div className="w-10/12 py-4 mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">

                    <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 mb-4">
                        Our Projects
                    </h1>
                    <p className="text-lg    text-gray-200 max-w-2xl mx-auto">
                        A collection of projects I've built using various technologies and frameworks.
                        Each project represents a unique challenge and learning experience.
                    </p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {/* Footer Section */}
                <div className="text-center mt-16">
                    <p className="text-gray-500 mb-4">
                        Want to see more projects or collaborate on something new?
                    </p>
                    <button className="px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors duration-200">
                        Get In Touch
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;