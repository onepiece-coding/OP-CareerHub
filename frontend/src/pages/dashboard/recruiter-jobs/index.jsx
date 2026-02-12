import { Table, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Loading } from "../../../components/feedback";
import { memo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  AiAnalysisModal,
  RecruiterAppsList,
} from "../../../components/dashboard";
import useRecruiterJobs from "./useRecruiterJobs";
import { FaUserTie } from "react-icons/fa";

const RecruiterJobs = memo(() => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, updateApplicationStatus, aiAnalysis, closeModal } =
    useRecruiterJobs(jobId);

  return (
    <Loading loading={state.loading} error={state.error}>
      <AiAnalysisModal
        open={state.open}
        score={state.score}
        reasons={state.reasons}
        closeModal={closeModal}
        updateApplicationStatus={updateApplicationStatus}
      />
      <section className="py-8 px-4 sm:px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto mb-6 ml-4">
  <h2 className="text-2xl sm:text-3xl font-bold text-blue-800 flex items-center gap-2">
    <FaUserTie className="text-blue-600 text-2xl" />
    Liste des candidatures
  </h2>
</div>


        <div className="w-full mx-auto overflow-x-auto shadow-lg shadow-black/30 rounded-lg bg-white">
          <Table className="border-collapse w-full table-auto text-base min-w-[1200px]">
            <TableHead>
              <TableRow>
                <TableHeadCell className="bg-blue-200 text-blue-800 font-bold w-20 py-4">
                  #
                </TableHeadCell>
                <TableHeadCell className="bg-blue-200 text-blue-800 font-bold py-4 w-2/5">
                  Nom du candidat
                </TableHeadCell>
                <TableHeadCell className="bg-blue-200 text-blue-800 font-bold py-4 w-1/4">
                  Emplacement
                </TableHeadCell>
                <TableHeadCell className="bg-blue-200 text-blue-800 font-bold w-40 py-4">
                  Statut
                </TableHeadCell>
                <TableHeadCell className="bg-blue-200 text-blue-800 font-bold w-48 py-4">
                  Actions
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <RecruiterAppsList
              data={state.data}
              updateApplicationStatus={updateApplicationStatus}
              relatedId={searchParams.get("relatedId")}
              aiAnalysis={aiAnalysis}
            />
          </Table>
        </div>
      </section>
    </Loading>
  );
});

export default RecruiterJobs;
