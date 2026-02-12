import { Table, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Loading } from "../../../feedback";
import { Pagination } from "../../../common";
import { memo } from "react";
import { useSearchParams } from "react-router-dom";
import ApplicantList from "./ApplicantList";
import useApplicant from "./useApplicant";

const Applicant = memo(() => {
  const [searchParams] = useSearchParams();
  const { state, getCandidateAppliedJobs } = useApplicant();

  return (
    <Loading loading={state.loading} error={state.error}>
<section className="py-10 px-6 min-h-screen bg-gray-200 dark:bg-gray-800">
<div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-300 dark:border-gray-700 p-10">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-600 dark:text-blue-400">
            Décision - Candidatures
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
            <TableHead>
  <TableRow className="border-b-2 border-gray-300 dark:border-gray-600">
    <TableHeadCell className="border-r border-gray-300 dark:border-gray-600 text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
      #
    </TableHeadCell>
    <TableHeadCell className="border-r border-gray-300 dark:border-gray-600 text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
      Poste
    </TableHeadCell>
    <TableHeadCell className="border-r border-gray-300 dark:border-gray-600 text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
      Entreprise
    </TableHeadCell>
    <TableHeadCell className="text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
      Décision
    </TableHeadCell>
  </TableRow>
</TableHead>


              <ApplicantList
                total={state.total}
                data={state.data}
                currentPage={state.currentPage}
                relatedId={searchParams.get("relatedId")}
              />
            </Table>

          </div>

          <div className="mt-8">
            <Pagination
              totalPages={state.pagination.totalPages}
              currentPage={state.currentPage}
              fetchMethod={getCandidateAppliedJobs}
            />
          </div>
        </div>
      </section>
    </Loading>
  );
});

export default Applicant;
