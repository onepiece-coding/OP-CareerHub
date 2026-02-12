import { useState, useEffect, useRef } from 'react';
import { FaBusinessTime } from "react-icons/fa";
import { MdOutlineCastForEducation } from "react-icons/md";
import { GoGoal } from "react-icons/go";
import { GiTeamIdea } from "react-icons/gi";
import { Heading } from "../../common";

const PourquoiNousRejoindreItems = [
  {
    icon: "FaBusinessTime",
    title: "Opportunités de croissance",
    desc: "Développez vos compétences et évoluez avec nous.",
  },
  {
    icon: "MdOutlineCastForEducation",
    title: "Formation continue",
    desc: "Accédez à des formations et certifications.",
  },
  {
    icon: "GoGoal",
    title: "Valeurs d'entreprise",
    desc: "Nous prônons l'innovation, le respect et l'excellence.",
  },
  {
    icon: "GiTeamIdea",
    title: "Équipe dynamique",
    desc: "Travaillez avec des experts passionnés.",
  },
];

const iconComponents = {
  FaBusinessTime,
  MdOutlineCastForEducation,
  GoGoal,
  GiTeamIdea,
};

const PourquoiNousRejoindre = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const currentSection = sectionRef.current;
    if (currentSection) observer.observe(currentSection);

    return () => currentSection && observer.unobserve(currentSection);
  }, []);

  return (
    <section ref={sectionRef} className="px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
      <div className={`text-center ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'} transition-all duration-700 ease-out`}>
  <h2 className="text-4xl md:text-5xl font-extrabold mt-9 mb-2">
    <span className="text-blue-500">Pourquoi</span>{" "}
    <span className="text-orange-500">Nous Rejoindre ?</span>
  </h2>
  <p className="font-medium inline-flex items-center">
    <svg className="w-5 h-5 mr-2 mt-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <span className="text-gray-500 mt-6 ">Nous offrons bien plus qu'un emploi, nous offrons une carrière !</span>
  </p>
</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-11">
          {PourquoiNousRejoindreItems.map((item, index) => {
            const Icon = iconComponents[item.icon];
            return (
              <div
                key={index}
                className={`relative rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  height: "220px"
                }}
              >
                {/* Partie supérieure (blanc) */}
                <div className="h-1/2 bg-white"></div>
                {/* Partie inférieure (bleu) */}
                <div className="h-1/2 bg-blue-500"></div>
                
                {/* Icône en haut */}
                <div className="absolute top-5 left-0 right-0 flex justify-center z-20">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <Icon className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                {/* Effet de vague bleue avec hover */}
                <div className="absolute bottom-0 left-0 right-0 h-25 bg-blue-500 transition-all duration-500 ease-in-out group-hover:h-full z-10">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 1440 320" 
                    className="absolute bottom-full w-full"
                    preserveAspectRatio="none"
                  >
                    <path 
                      fill="#3b82f6"
                      fillOpacity="1" 
                      d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    />
                  </svg>
                </div>
                
                {/* Texte constant en bas */}
                <div className="absolute bottom-0 left-0 right-5 p-6 pt-6 text-white text-center z-20">
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                  <p className="text-sm mt-2">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PourquoiNousRejoindre;