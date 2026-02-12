import { Loading } from "../../../components/feedback";
import { Table, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { RecruiterJobsList } from "../../../components/dashboard";
import useManageJobs from "./useManageJobs";
import { FaTrash, FaEdit, FaEye, FaUserPlus, FaThList, FaBriefcase } from "react-icons/fa";

const ManageJobs_Recruiter = () => {
  const {
    state: { loading, error, data },
    deleteSingleJob,
  } = useManageJobs();

  // Custom action buttons renderer with updated icons and colors
  const renderActionButtons = (job) => {
    return (
      <div className="flex items-center justify-center space-x-3 w-full">
        <button
          onClick={() => deleteSingleJob(job.id)}
          className="flex items-center justify-center rounded-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:ring-2 hover:ring-red-300 dark:hover:ring-red-800 p-3 text-white"
          title="Supprimer"
        >
          <FaTrash className="w-5 h-5 transform transition duration-200 hover:scale-110 hover:text-white" />
        </button>
        
        <button
          className="flex items-center justify-center rounded-md bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-800 p-3 text-white"
          title="Modifier"
        >
          <FaEdit className="w-5 h-5 transform transition duration-200 hover:scale-110 hover:text-white" />
        </button>
        
        <button
          className="flex items-center justify-center rounded-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:ring-2 hover:ring-green-300 dark:hover:ring-green-800 p-3 text-white"
          title="Voir les détails"
        >
          <FaEye className="w-5 h-5 transform transition duration-200 hover:scale-110 hover:text-white" />
        </button>
        
        <button
          className="flex items-center justify-center rounded-md bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-lg hover:scale-105 transition-all duration-300 hover:ring-2 hover:ring-purple-300 dark:hover:ring-purple-800 p-3 text-white"
          title="Ajouter un candidat"
        >
          <FaUserPlus className="w-5 h-5 transform transition duration-200 hover:scale-110 hover:text-white" />
        </button>
      </div>
    );
  };

  return (
    <Loading loading={loading} error={error}>
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 p-9">
        <section className="mx-auto">
          <div className="rounded-xl shadow-xl bg-white dark:bg-gray-800 p-6">
            {/* Title Section with Icon */}
            <div className="flex items-center justify-start gap-2 mb-6">
              <FaBriefcase className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Gérer les emplois</h2>
            </div>

            <Table className="w-full text-sm text-gray-700 dark:text-gray-200 min-w-[1000px]">
              <TableHead className="bg-blue-300 dark:bg-blue-500 text-white dark:text-gray-100">
                <TableRow>
                  <TableHeadCell className="text-center p-3 w-16 bg-transparent">#</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-3/12 bg-transparent">poste d'emploi </TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-3/12 bg-transparent">Entreprise</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-2/12 bg-transparent">Créé par</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-2/12 bg-transparent">
                    <div className="flex justify-center items-center gap-2">
                      <FaThList className="text-white" /> Actions
                    </div>
                  </TableHeadCell>
                </TableRow>
              </TableHead>
              <RecruiterJobsList
                recruiterJobs={data}
                deleteHandler={deleteSingleJob}
                rowClasses="hover:bg-blue-50/70 dark:hover:bg-blue-900/20 hover:shadow-md transition-all duration-300"
                cellClasses="group relative overflow-hidden hover:bg-blue-200/60 dark:hover:bg-blue-700/40 hover:scale-[1.02] hover:border hover:border-blue-400 dark:hover:border-blue-500 border border-transparent transition-all duration-300 before:absolute before:inset-0 before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-blue-300/20 before:to-transparent before:transform before:-translate-x-full group-hover:before:animate-shimmer text-center"
                buttonClasses="flex items-center gap-1 rounded-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-110 transition-all duration-300 hover:ring-2 hover:ring-red-300 dark:hover:ring-red-800"
                renderActionButtons={renderActionButtons}
              />
            </Table>
          </div>
        </section>
      </div>
    </Loading>
  );
};

export default ManageJobs_Recruiter;
