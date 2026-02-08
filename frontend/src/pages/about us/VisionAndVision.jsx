import React, { useState, useEffect } from 'react'
import Header from '../../components/header'
import Image1 from '../../assets/images/project/must.jpg'
import Image2 from '../../assets/images/project/musts.jpg'
import Image3 from '../../assets/images/project/mu.jpg'

function MissionVisionPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
     <Header title="Vision & Mission " path="vision & mission " />

      {/* Mission Section with Parallax */}
      <section className="relative py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div 
                className="absolute -top-12 -left-12 w-64 h-64 bg-[#ff5a00] rounded-full opacity-10"
                style={{
                  transform: `translateY(${(scrollY - 600) * 0.1}px)`,
                }}
              ></div>
              <div className="relative z-10">
                <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
                  Our Mission
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8">
                  Empowering Rwanda Through Technology
                </h2>
                <div className="w-24 h-1 bg-[#ff5a00] mb-8"></div>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    Our mission is to become a leading catalyst for technological and economic transformation in Rwanda. We bridge the gap between international markets and local expertise, creating a robust ecosystem where innovation flourishes, businesses thrive, and communities prosper.
                  </p>
                  <p>
                    We are committed to developing world-class technology solutions while simultaneously nurturing the next generation of Rwandan tech talent. Through rigorous training, real-world project experience, and continuous mentorship, we ensure that our workforce remains at the forefront of technological advancements.
                  </p>
                  <p>
                    By 2030, we envision Abytech as a cornerstone of Rwanda's digital economy—a company that not only delivers exceptional technology services but also serves as a launchpad for hundreds of successful tech careers.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div 
                className="overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  transform: `translateY(${(scrollY - 700) * 0.15}px)`,
                }}
              >
                <img 
                src={Image2}
                alt="Team collaboration"
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div 
                className="absolute -bottom-8 -right-8 w-48 h-48 bg-[#ff5a00]/20 rounded-lg"
                style={{
                  transform: `translateY(${(scrollY - 700) * -0.1}px)`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider 1 */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 1200) * 0.5}px)`,
          }}
        >
          <img 
          src={Image1}
          alt="Modern office"
            className="w-full h-[150%] object-cover"
          />
          <div className="absolute inset-0 bg-[#ff5a00]/80"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              "Technology is best when it brings people together"
            </h3>
            <p className="text-xl opacity-90">- Matt Mullenweg</p>
          </div>
        </div>
      </section>

      {/* Vision Section with Parallax */}
      <section className="relative py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div 
                className="overflow-hidden rounded-2xl shadow-2xl"
                style={{
                  transform: `translateY(${(scrollY - 1800) * 0.15}px)`,
                }}
              >
                <img 
                 src={Image3}
                 alt="Vision for the future"
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div 
                className="absolute -top-8 -left-8 w-48 h-48 bg-[#ff5a00]/20 rounded-lg"
                style={{
                  transform: `translateY(${(scrollY - 1800) * -0.1}px)`,
                }}
              ></div>
            </div>

            <div className="relative order-1 md:order-2">
              <div 
                className="absolute -top-12 -right-12 w-64 h-64 bg-[#ff5a00] rounded-full opacity-10"
                style={{
                  transform: `translateY(${(scrollY - 1800) * 0.1}px)`,
                }}
              ></div>
              <div className="relative z-10">
                <div className="inline-block bg-[#ff5a00] text-white px-6 py-2 rounded-full font-semibold mb-6">
                  Our Vision
                </div>
                <h2 className="text-5xl font-bold text-gray-900 mb-8">
                  Leading Rwanda's Digital Renaissance
                </h2>
                <div className="w-24 h-1 bg-[#ff5a00] mb-8"></div>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    We envision a future where Rwanda stands as a beacon of technological innovation in Africa—a nation where local talent competes on the global stage, where world-class digital solutions are created daily, and where technology drives sustainable economic growth.
                  </p>
                  <p>
                    Abytech aspires to be at the heart of this transformation. We see ourselves as more than a technology company; we are architects of opportunity, builders of careers, and partners in Rwanda's journey toward becoming a knowledge-based economy.
                  </p>
                  <p>
                    Our vision extends beyond business success. We dream of a Rwanda where every young person with talent and ambition has access to quality tech education, where innovation hubs thrive in every city, and where "Made in Rwanda" is synonymous with technological excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider 2 */}
      <section className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            transform: `translateY(${(scrollY - 2600) * 0.5}px)`,
          }}
        >
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80" 
            alt="Kigali skyline"
            className="w-full h-[150%] object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-white px-6">
          <div className="text-center max-w-4xl">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Building Tomorrow's Technology Leaders Today
            </h3>
          </div>
        </div>
      </section>

          </div>
  )
}

export default MissionVisionPage