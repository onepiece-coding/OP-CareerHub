import { useState, useEffect } from 'react';

const PremiereImpression = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const slides = [
    {
      title: `Bienvenue sur <span class="text-blue-400">Job Search</span>`,
      subtitle: "Rejoignez Notre Équipe et Faites Évoluer Votre Carrière",
      description: "Découvrez nos opportunités d'emploi et postulez en quelques clics.",
      image: "https://images.pexels.com/photos/5439153/pexels-photo-5439153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      buttonText: "Postuler Maintenant"
    },
    {
      title: `<span class="text-blue-500">Trouvez Votre Emploi Idéal</span>`,
      subtitle: "Des Milliers d'Opportunités Vous Attendent",
      description: "Parcourez notre base de données d'offres d'emploi et trouvez celle qui correspond à vos compétences.",
      image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      buttonText: "Découvrir les Offres"
    },
    {
      title: `<span class="text-blue-400">Votre Futur Commence Ici</span>`,
      subtitle: "Opportunités pour Tous les Profils",
      description: "Que vous soyez débutant ou expert, trouvez l'emploi qui vous correspond.",
      image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      buttonText: "Commencer Maintenant"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-screen overflow-hidden bg-gray-900">
      <style jsx>{`
        @keyframes slideUpOut {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes slideInUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          0% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .animate-slideUpOut { animation: slideUpOut 0.5s ease-out forwards; }
        .animate-slideInUp { animation: slideInUp 0.5s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-zoomIn { animation: zoomIn 1.2s ease-out forwards; }
        .dot-pulse.active { animation: pulse 1.5s infinite; }
      `}</style>

      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ease-in-out ${
            currentSlide === index ? 'opacity-100 animate-zoomIn' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url('${slide.image}')`
          }}
        ></div>
      ))}

      <div className="relative h-full flex items-center justify-center pt-12 z-10">
        <div className="px-4 mx-auto max-w-5xl text-center w-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 ease-in-out ${
                currentSlide === index ? 'opacity-100' : 'opacity-0 absolute'
              }`}
            >
              <h1
                className={`mb-4 text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg text-center ${
                  currentSlide === index ? 'animate-slideInUp' : 'animate-slideUpOut'
                }`}
                style={{ animationDelay: '0s' }}
                dangerouslySetInnerHTML={{ __html: slide.title }}
              />
              <h2
                className="mb-6 text-xl md:text-2xl lg:text-3xl font-semibold text-orange-400 drop-shadow-md animate-fadeInUp text-center"
                style={{ animationDelay: '0.2s' }}
              >
                {slide.subtitle}
              </h2>
              <p
                className="mb-8 text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl mx-auto drop-shadow-sm animate-fadeInUp"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.description}
              </p>
              <div className="flex justify-center animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                <p className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-orange-500 rounded-lg cursor-default">
                  {slide.buttonText}
                </p>
              </div>
            </div>
          ))}

          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? 'bg-orange-500 w-8 dot-pulse active'
                    : 'bg-gray-400 hover:bg-gray-300'
                }`}
                aria-label={`Aller à la slide ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiereImpression;
