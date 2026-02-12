import { Alert } from "flowbite-react";

import { useState } from "react";
import { useJobsContext } from "../../../hooks/useJobsContext";
import { Loading } from "../../feedback";
import JobItem from "../JobItem";

const JobsList = () => {
  const { loading, error, total, data } = useJobsContext();
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  const indexOfLastJob = currentPage * postsPerPage;
  const indexOfFirstJob = indexOfLastJob - postsPerPage;
  const currentJobs = data.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(total / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Loading loading={loading} error={error}>
      {total > 0 ? (
        <div className="mt-10 px-6 sm:px-10 py-10 bg-gray-50 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900 uppercase tracking-wider">
            Opportunités d'emploi
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentJobs.map((job) => (
              <JobItem key={job._id} job={job} />
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <nav>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    ← Précédent
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, index) => (
                  <li key={index}>
                    <button
                      onClick={() => paginate(index + 1)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        currentPage === index + 1
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 border border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}

                <li>
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    Suivant →
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        <Alert color="info" className="mt-6 max-w-lg mx-auto text-center">
          Aucun <span className="font-semibold">emploi</span> disponible pour le moment.
        </Alert>
      )}
    </Loading>
  );
};

export default JobsList;
