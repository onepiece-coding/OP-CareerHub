import { useParams, useNavigate } from "react-router-dom";
import { dateFormatter, DATE_FORMATS } from "../../utils/dateFormatter";
import Loading from "../../components/feedback/Loading";
import useJobDetails from "./useJobDetails";
import {
  FaArrowLeft,
  FaBriefcase,
  FaClipboardList,
  FaTools,
  FaRegBuilding,
  FaRegMoneyBillAlt,
  FaRegClock,
} from "react-icons/fa";

const JobDetails = () => {
  const { id: jobId } = useParams();
  const { loading, error, jobDetails } = useJobDetails(jobId);
  const navigate = useNavigate();

  return (
    <Loading loading={loading} error={error}>
      <section className="overflow-hidden min-h-screen bg-gray-100 text-white">
        <div className="max-w-screen-xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-blue-400 p-3 text-white hover:bg-orange-500 mb-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux offres
          </button>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden text-black hover:shadow-2xl transition-shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h1 className="text-3xl font-bold text-blue-400">
                  {jobDetails?.position}
                </h1>
                <p className="text-xl font-bold text-blue-400">
                  {jobDetails?.company}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6">
              <div className="col-span-1">
                <Section icon={<FaBriefcase />} title="Description du poste">
                  {jobDetails?.jobDescription || "Non spécifié"}
                </Section>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <Section icon={<FaClipboardList />} title="Détails de l'offre">
                    {jobDetails?.jobVacancy || "Non spécifié"}
                  </Section>
                </div>

                <div className="col-span-1">
                  <Section icon={<FaTools />} title="Compétences requises">
                    <ul className="list-disc pl-5">
                      {jobDetails?.jobSkills?.map((skill, i) => (
                        <li key={i}>{skill}</li>
                      ))}
                    </ul>
                  </Section>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <Section icon={<FaRegBuilding />} title="Avantages">
                    <div className="flex flex-wrap gap-4">
                      {jobDetails?.jobFacilities?.map((item, i) => (
                        <div
                          key={i}
                          className="border border-blue-200 p-2 rounded-xl text-black bg-blue-50"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>

                <div className="col-span-1">
                  <Section icon={<FaRegMoneyBillAlt />} title="Salaire">
                    {jobDetails?.jobSalary
                      ? `${jobDetails.jobSalary} DH`
                      : "Non spécifié"}
                  </Section>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-3 text-center text-sm text-white rounded-b-lg">
              <FaRegClock className="inline mr-2" />
              Publié le {dateFormatter(jobDetails?.createdAt, DATE_FORMATS.FULL_DATE)}
            </div>
          </div>
        </div>
      </section>
    </Loading>
  );
};

const Section = ({ icon, title, children }) => (
  <div className="relative p-6 rounded-lg border border-gray-200 overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 group">
    {/* Fond animé en bleu transparent */}
    <div className="absolute inset-0 bg-gradient-to-t from-blue-200/20 to-blue-300/40 opacity-0 scale-y-0 group-hover:opacity-200 group-hover:scale-y-100 transition-all duration-500 ease-in-out origin-bottom z-0" />
    
    <div className="relative z-10">
      <h3 className="font-bold text-blue-700 flex items-center">
        <span className="text-blue-500 mr-2">{icon}</span>
        {title}
      </h3>
      <div className="mt-2 text-gray-800">{children}</div>
    </div>
  </div>
);

export default JobDetails;
