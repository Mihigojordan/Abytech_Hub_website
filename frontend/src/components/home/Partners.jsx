

import Logo1 from '../../assets/partner/par1.png';
import Logo2 from '../../assets/partner/par2.png';
import Logo3 from '../../assets/partner/par3.png';
import Logo4 from '../../assets/partner/par4.png';
import Logo5 from '../../assets/partner/par5.png';
import Logo6 from '../../assets/partner/par6.png';
import Logo7 from '../../assets/partner/par7.png';
import Logo8 from '../../assets/partner/par8.png';
import Logo9 from '../../assets/partner/par9.png';
import Logo10 from '../../assets/partner/par10.png';
import Logo11 from '../../assets/partner/par11.png';
import Logo12 from '../../assets/partner/par12.png';
import Logo13 from '../../assets/partner/par13.png';
import Logo14 from '../../assets/partner/par14.png';
import Logo15 from '../../assets/partner/tran.png';


function Partner() {
const partners = [
  { name: 'Shopify', logo: Logo1 },
  { name: 'Shopify', logo: Logo2 },
  { name: 'Shopify', logo: Logo3 },
  { name: 'Shopify', logo: Logo4 },
  { name: 'Shopify', logo: Logo5 },
  { name: 'Shopify', logo: Logo6 },
  { name: 'Shopify', logo: Logo7 },
  { name: 'Shopify', logo: Logo8 },
  { name: 'Shopify', logo: Logo9 },
  { name: 'Shopify', logo: Logo10 },
  { name: 'Shopify', logo: Logo11 },
  { name: 'Shopify', logo: Logo12 },
  { name: 'Shopify', logo: Logo13 },
  { name: 'Shopify', logo: Logo14 },
  { name: 'Shopify', logo: Logo15 },
];


  // Duplicate the partners array for seamless loop
  const allPartners = [...partners, ...partners];

  return (
    <div className="w-full py-8 px-4" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <p className="text-gray-400 uppercase tracking-widest text-xs md:text-sm font-semibold letter-spacing-wide">
            TRUSTED PARTNERS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            ABYTECH HUB is trusted by{' '}
            <span className="text-gray-900 font-extrabold">10+ companies</span>{' '}
            across the world
          </h2>
        </div>

        {/* Logos Slider */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 overflow-hidden">
          <div className="relative">
            <div className="slider-container">
              <div className="slider-track">
                {allPartners.map((partner, index) => (
                  <div
                    key={index}
                    className="slider-item"
                  >
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="max-h-12 max-w-40 object-contain  transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
          </div>
        </div>
      </div>

      <style>{`
        .letter-spacing-wide {
          letter-spacing: 3px;
        }

        .slider-container {
          overflow: hidden;
          width: 100%;
        }

        .slider-track {
          display: flex;
          width: fit-content;
          animation: scroll 30s linear infinite;
        }

        .slider-track:hover {
          animation-play-state: paused;
        }

        .slider-item {
          flex: 0 0 auto;
          width: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 40px;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .slider-item {
            width: 150px;
            padding: 0 30px;
          }
        }
      `}</style>
    </div>
  );
}

export default Partner;