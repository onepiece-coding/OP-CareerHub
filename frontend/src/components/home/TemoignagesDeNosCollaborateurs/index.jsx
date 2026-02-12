import { Heading } from "../../common";
import { motion } from "framer-motion";

const TemoignagesDeNosCollaborateurs = () => {
  return (
    <section className="pt-4 pb-12 px-6 bg-gray-100">
      {/* Titre principal avec animation */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          <span className="text-blue-600">Qui peut</span>{" "}
          <span className="text-orange-500">s'inscrire ?</span>
        </h1>
      </motion.div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-10">
        {/* Bloc 1 : Jeunes diplômés */}
        <div className="flex flex-col items-center text-center w-full lg:w-1/3 px-4">
          <img
            src="src/assets/7QaGYnB5Tyi0Mzih4vrUSQ.webp"
            alt="Jeunes diplômés"
            className="w-80 h-80 object-cover rounded-lg mb-6 transform transition duration-300 hover:scale-105 shadow-md"
          />
          <h2 className="font-bold text-2xl mb-3 text-blue-800 tracking-wide">Jeunes diplômés</h2>
          <p className="text-base text-gray-800 leading-relaxed max-w-xs">
            Diplômés en informatique ? Découvrez des offres pour lancer votre carrière.
          </p>
        </div>

        {/* Bloc 2 : Sans-emplois */}
        <div className="flex flex-col items-center text-center w-full lg:w-1/3 px-4">
          <img
            src="src/assets/pic3.jpeg"
            alt="Sans-emplois"
            className="w-80 h-80 object-cover rounded-lg mb-6 transform transition duration-300 hover:scale-105 shadow-md"
          />
          <h2 className="font-bold text-2xl mb-3 text-blue-800 tracking-wide">Sans-emplois</h2>
          <p className="text-base text-gray-800 leading-relaxed max-w-xs">
            Accédez à des opportunités en informatique avec notre réseau d'entreprises partenaires.
          </p>
        </div>

        {/* Bloc 3 : Stagiaires */}
        <div className="flex flex-col items-center text-center w-full lg:w-1/3 px-4">
          <img
            src="src/assets/part1.webp"
            alt="Stagiaires"
            className="w-80 h-80 object-cover rounded-lg mb-6 transform transition duration-300 hover:scale-105 shadow-md"
          />
          <h2 className="font-bold text-2xl mb-3 text-blue-800 tracking-wide">Stagiaires</h2>
          <p className="text-base text-gray-800 leading-relaxed max-w-xs">
            Étudiants en informatique, trouvez le stage idéal pour valider vos compétences.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TemoignagesDeNosCollaborateurs;
