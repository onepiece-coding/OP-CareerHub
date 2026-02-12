import { TableBody, TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import RecruiterJobItem from "./RecruiterJobItem";

const RecruiterJobsList = memo(({ recruiterJobs, deleteHandler }) => {
  return (
    <TableBody className="divide-y">
      {recruiterJobs.length > 0 ? (
        recruiterJobs.map((recruiterJob, index) => (
          <RecruiterJobItem
            key={recruiterJob?._id}
            index={index}
            recruiterJob={recruiterJob}
            deleteHandler={deleteHandler}
          />
        ))
      ) : (
        <TableRow className="bg-yellow-50 text-center">
          <TableCell
            colSpan={5}
            className="text-center py-6 text-black dark:text-black"
          >
            Aucun <span className="font-medium">emploi</span> à afficher
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
});

export default RecruiterJobsList;