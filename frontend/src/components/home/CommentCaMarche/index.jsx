import { Heading } from "../../common";
import { FiSearch, FiUpload, FiUserCheck, FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

const CommentCaMarcheItems = [
  {
    title: "Recherchez un poste",
    desc: "Explorez nos offres disponibles maintenant",
    icon: <FiSearch className="w-8 h-8 text-white group-hover:text-blue-600" />,
  },
  {
    title: "Postulez en ligne",
    desc: "Remplissez votre candidature en quelques clics",
    icon: <FiUpload className="w-8 h-8 text-white group-hover:text-blue-600" />,
  },
  {
    title: "Passez un entretien",
    desc: "Si votre profil correspond, nous vous contacterons",
    icon: <FiUserCheck className="w-8 h-8 text-white group-hover:text-blue-600" />,
  },
  {
    title: "Rejoignez-nous!",
    desc: "Félicitations, vous faites partie de l'équipe",
    icon: <FiAward className="w-8 h-8 text-white group-hover:text-blue-600" />,
  },
];

const cardVariants = {
  offscreen: { y: 50, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", bounce: 0.4, duration: 0.8 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const CommentCaMarche = () => {
  return (
    <section className="py-16 px-6 bg-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section titre avec animation depuis la gauche */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", duration: 3}}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-blue-500">Comment</span>{" "}
            <span className="text-orange-500">Ça Marche?</span>
          </h2>
          <p className="font-medium text-gray-500 inline-flex items-center mt-4 mb-4">
            <svg className="w-5 h-5 mr-2 mt-1 fill-blue-600" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              ></path>
            </svg>
            Conseil : Mettez à jour votre CV avant de postuler !
          </p>
        </motion.div>

        {/* Grid des cartes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-4"
        >
          {CommentCaMarcheItems.map((item, index) => (
            <motion.div key={item.title} variants={cardVariants} className="h-full">
              <div className="group h-full bg-white rounded-2xl shadow-lg border border-blue-100 p-8 transition-all duration-500 ease-out relative overflow-hidden hover:shadow-xl mt-1">
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-200 transition-all duration-700 ease-in-out h-0 group-hover:h-full origin-bottom "></div>
                </div>

                <div className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-sm font-bold rounded-full bg-blue-600 text-white shadow-md z-10 group-hover:bg-white group-hover:text-blue-600">
                  {index + 1}
                </div>

                <div className="relative mb-8 w-20 h-20 rounded-full flex items-center justify-center bg-blue-600 shadow-md z-10 mx-auto group-hover:bg-white">
                  {item.icon}
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-blue-600 mb-3 transition-colors duration-300 group-hover:text-blue-800">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                    {item.desc}
                  </p>
                  <div className="mt-6 h-1 w-10 group-hover:w-full bg-blue-600 transition-all duration-500 rounded-full group-hover:bg-blue-800"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA bouton */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <a
            href="jobs"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Voir nos offres d'emploi
            <svg
              className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CommentCaMarche;
