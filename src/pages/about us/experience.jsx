import React from 'react';

export default function ExperienceComponent() {
  const skills = [
    { name: 'Product Content', level: '80%' },
    { name: 'Website Content', level: '70%' },
    { name: 'Social Media Content', level: '75%' },
  ];

  return (
    <section className="bg-[#0d0f15] py-16 px-34 flex flex-col md:flex-row items-center justify-between w-full text-white">
      <div className="md:w-1/2 md:pr-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-yellow-400">10 Years</span> Of Experience in <br /> Content Writing
        </h2>
        <p className="text-gray-400 mb-8">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iusto blanditiis aliquam et modi amet eius perspiciatis ab magni atque nesciunt?
        </p>

        {skills.map((skill, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between mb-1">
              <span>{skill.name}</span>
              <span>{skill.level}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-400 h-2 rounded-full"
                style={{ width: skill.level }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="md:w-1/2 mt-8 md:mt-0">
        <img
          src="../image/blog5.png"
          alt="Experience"
          className="w-full rounded-2xl shadow-lg object-cover"
        />
      </div>
    </section>
  );
}
