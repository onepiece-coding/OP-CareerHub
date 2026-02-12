import { Table, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Loading } from "../../../feedback";
import { memo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PdfViewerContextProvider from "../../../../contexts/PdfViewerContextProvider";
import useRecruiter from "./useRecruiter";
import RecruiterList from "./RecruiterList";
import { FaBusinessTime } from "react-icons/fa";

const Recruiter = memo(() => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const { state, updateApplicationStatus } = useRecruiter(jobId);

  return (
    <PdfViewerContextProvider>
      <Loading loading={state.loading} error={state.error}>
        {/* Background for the whole page */}
        <div className="bg-gray-200 min-h-screen">
          <section className="py-6 px-4 sm:px-8 flex justify-center mr-5">
            {/* Background gray around the table */}
            <div className="bg-gray-100 w-full max-w-[1600px] p-6 rounded-lg shadow-lg">
              {/* Title with icon */}
              <h2 className="flex items-center text-3xl font-bold text-blue-900 mb-8 text-center">
                <FaBusinessTime className="mr-3 w-6 h-6 text-blue-500" />
                Liste des Candidatures
              </h2>

              {/* Table */}
              <div className="overflow-x-auto">
                <Table className="text-base w-full">
                  <TableHead className="bg-blue-900 text-black font-bold">
                    <TableRow>
                      <TableHeadCell className="whitespace-nowrap text-black font-bold bg-blue-300 w-[12%]">#</TableHeadCell>
                      <TableHeadCell className="text-black font-bold bg-blue-300 w-[20%]">Poste</TableHeadCell>
                      <TableHeadCell className="text-black font-bold bg-blue-300 w-[20%]">Entreprise</TableHeadCell>
                      <TableHeadCell className="text-black font-bold bg-blue-300 w-[20%]">Statut</TableHeadCell>
                      <TableHeadCell className="text-black font-bold bg-blue-300 w-[28%]">Actes</TableHeadCell>
                    </TableRow>
                  </TableHead>
                  <RecruiterList
                    data={state.data}
                    updateApplicationStatus={updateApplicationStatus}
                    relatedId={searchParams.get("relatedId")}
                  />
                </Table>
              </div>
            </div>
          </section>
        </div>
      </Loading>
    </PdfViewerContextProvider>
  );
});

export default Recruiter;
