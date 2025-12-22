import React from 'react';
import { ArrowRight } from 'lucide-react';

const InsightCard = ({ image, date, category, title, description, isNew }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isNew && (
          <div className="absolute top-4 right-4 bg-white px-4 py-1.5 rounded-full shadow-md">
            <span className="text-blue-600 font-semibold text-sm">New</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {/* Date and Category */}
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500">{date}</span>
          <span className="text-blue-600 font-semibold">{category}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

const DailyInsights = () => {
  const insights = [
    {
      image: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80',
      date: 'Nov 6, 2024',
      category: '#Technology',
      title: 'Africa Tech Forum 2024: Showcasing Innovation and Market Opportunities in Kigali',
      description: 'Exploring the latest innovations and market opportunities at the Africa Tech Forum 2024 held in Kigali.',
      isNew: false
    },
    {
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
      date: 'Oct 13, 2024',
      category: '#Healthcare',
      title: 'Africa HealthTech Summit 2024: Digital Transformation in Healthcare',
      description: 'Kigali Convention Center hosted this groundbreaking digital healthcare transformation summit.',
      isNew: false
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
      date: 'Sep 28, 2024',
      category: '#Technology',
      title: 'Tech Talks with Irembo: AI, Engineering, and Cybersecurity in Focus',
      description: 'Kigali tech community gathers to discuss cutting-edge AI solutions and cybersecurity challenges.',
      isNew: true
    }
  ];

  return (
    <div className="w-full py-10 px-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-8xl px-6 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="space-y-4">
            <p className="text-blue-600 uppercase tracking-widest text-xs md:text-sm font-semibold letter-spacing-wide">
              DAILY NEWS
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
              Read more about daily insights
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-3xl">
              In a fast-paced world where information shapes decisions, stay informed about the latest developments curated by our analysts.
            </p>
          </div>

          {/* Learn More Button */}
          <button className="bg-slate-800 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap self-start lg:self-auto">
            Learn More
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </div>
      </div>

      <style>{`
        .letter-spacing-wide {
          letter-spacing: 3px;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default DailyInsights;