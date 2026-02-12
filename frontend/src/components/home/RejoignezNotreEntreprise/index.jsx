import { useState, useEffect, useRef } from "react";

const RejoignezNotreEntreprise = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const sectionRef = useRef(null);
  
  useEffect(() => {
    // Utilisation de Intersection Observer pour détecter quand la section devient visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Si l'élément est visible à au moins 20%
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          // Déclencher l'animation
          setTitleVisible(true);
          // Arrêter d'observer une fois visible
          observer.unobserve(entry.target);
        }
      },
      {
        // Options: déclencher quand au moins 20% de l'élément est visible
        threshold: 0.2,
        rootMargin: "0px"
      }
    );
    
    // Observer la section
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    // Nettoyage à la suppression du composant
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section 
      ref={sectionRef}
      className="py-12 px-4 bg-gray-100 min-h-screen flex items-center justify-center -mt-20"
    >
      <div className="max-w-4xl w-full mx-auto">
        <div 
          className={`bg-white rounded-lg overflow-hidden border border-gray-200 transition-all duration-500 ${
            cardHovered 
              ? "shadow-2xl transform scale-[1.02] border-blue-200" 
              : "shadow-lg"
          }`}
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
        >
          <div className={`p-8 text-center overflow-hidden transition-all duration-500 ${
            cardHovered ? "bg-blue-50" : ""
          }`}>
            <h5 
              className={`text-2xl font-bold tracking-tight text-blue-700 mb-6 transition-all duration-1600 transform ${
                titleVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
              }`}
            >
              Rejoignez Notre Entreprise Dès Aujourd'hui!
            </h5>
            {/* Ligne orange supprimée comme demandé */}
            <p className={`font-normal text-gray-700 mb-8 max-w-lg mx-auto transition-all duration-1200 delay-800 transform ${
                titleVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
              }`}>
              Nous recrutons des talents comme vous! Consultez nos offres et
              faites le premier pas vers une carrière enrichissante.
            </p>
            <a
            href="jobs"
  className={`inline-flex items-center px-6 py-3 rounded-full bg-orange-500 text-white font-medium transition-all duration-1200 ${
    isHovered ? "bg-orange-600 transform scale-105" : ""
  } ${
    titleVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
  }`}
  style={{ transitionDelay: "1200ms" }}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  Voir les Offres
  <svg
    className={`ml-2 h-5 w-5 transform transition-transform duration-300 ${
      isHovered ? "translate-x-1" : ""
    }`}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
</a>

          </div>
          <div className={`bg-blue-50 py-4 px-8 border-t border-gray-200 overflow-hidden transition-all duration-500 ${
            cardHovered ? "bg-blue-100 border-blue-300" : "bg-blue-50 border-gray-200"
          }`}>
            <p className={`text-blue-500 text-sm text-center transition-all duration-1200 delay-1500 transform ${
                titleVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}>
              Une équipe dynamique vous attend pour réaliser de grands projets ensemble
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RejoignezNotreEntreprise;