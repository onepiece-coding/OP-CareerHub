import { TableBody, TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import RecruiterItem from "./RecruiterItem";
import { FaBriefcase } from "react-icons/fa";  // Job Icon

const RecruiterList = memo(({ data, updateApplicationStatus, relatedId }) => {
  return (
    <TableBody className="divide-y">
      {data?.length > 0 ? (
        data.map((application, index) => (
          <RecruiterItem
            key={application._id}
            index={index}
            application={application}
            updateApplicationStatus={updateApplicationStatus}
            relatedId={relatedId}
            isEven={index % 2 === 0}
          />
        ))
      ) : (
        <TableRow className="bg-gray-200 text-center">
          <TableCell colSpan={5} className="py-9">
            Aucun <span className="font-medium">emploi</span> à afficher
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
});

export default RecruiterList;
