import { TableBody, TableRow, TableCell } from "flowbite-react";
import { memo } from "react";
import ApplicantItem from "./ApplicantItem";

const ApplicantList = memo(({ total, data, currentPage, relatedId }) => {
  return (
    <TableBody>
      {total > 0 ? (
        <>
          {data?.map((application, index) => (
            <ApplicantItem
              key={application._id}
              index={index}
              currentPage={currentPage}
              application={application}
              relatedId={relatedId}
            />
          ))}
        </>
      ) : (
        <TableRow className="bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-600">
          <TableCell colSpan={4} className="text-center py-6 text-black dark:text-gray-200 font-medium">
            Aucun <span className="font-semibold">emploi</span> à afficher
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
});

export default ApplicantList;
