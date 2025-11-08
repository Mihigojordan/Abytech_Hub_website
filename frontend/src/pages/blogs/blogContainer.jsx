import React from 'react';

const NewsAndBlogs = () => {
  const posts = [
    {
      title: 'How do you improve your content writing skills?',
      description: 'Amet a est nisi nisl blandit. Ullamcorper odio eu dui lectus tellus ultricies pellentesque.',
      image: '../assets/images/blog/blog3.png',
    },
    {
      title: 'Do you want to become a professional writer?',
      description: 'Lacinia justo nulla id elit. Vel mi tellus vitae nulla viverra tellus a nulla nam sit tincidunt.',
      image: '../assets/images/blog/blog1.png',
    },
    {
      title: 'Strengthen the foundations to scale to your skills',
      description: 'Euismod suspendisse elit eu iaculis tincidunt aliquam in rutrum arcu et faucibus.',
      image: '../assets/images/blog/blog2.png',
    }
  ];

  return (
    <section className="bg-[#37517e] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-white mb-8">
          News & Blogs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#37517e]/10 group"
            >
              <div className="relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <span className="absolute top-2 left-2 bg-[#37517e] text-white px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                  Content Tips
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-gray-900 text-xl font-bold mb-2 group-hover:text-[#37517e] transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {post.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-[#37517e] text-white p-3 rounded-full shadow-lg hover:bg-[#2c4166] hover:shadow-xl transition-all duration-300 z-50"
        aria-label="Scroll to top"
      >
        <span className="text-xl">Up</span>
      </button>
    </section>
  );
};

export default NewsAndBlogs;