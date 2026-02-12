import { TableCell, TableRow } from "flowbite-react";
import { memo, useMemo } from "react";

const ApplicantItem = memo(
  ({ index, currentPage, application, relatedId }) => {
    const id = useMemo(
      () =>
        5 * (currentPage - 1) + (index + 1) < 10
          ? `0${5 * (currentPage - 1) + (index + 1)}`
          : 5 * (currentPage - 1) + (index + 1),
      [currentPage, index]
    );

    const isOddRow = index % 2 === 1;

    return (
      <TableRow
        className={`border-b-2 border-gray-300 dark:border-gray-700 ${
          isOddRow ? "bg-[#f5f6fa] dark:bg-gray-700" : "bg-white dark:bg-gray-800"
        } hover:bg-blue-200/60 dark:hover:bg-blue-300/50 transition-all duration-200 ${
          relatedId === application?._id ? "bg-gray-200 dark:bg-gray-500" : ""
        }`}
      >
        {/* Appliquer 'font-bold' ici */}
        <TableCell className="whitespace-nowrap font-bold text-black dark:text-gray-200 pl-6 pr-6 py-4 text-center">
          {id}
        </TableCell>
        <TableCell className="font-bold text-black dark:text-gray-200 pl-6 pr-6 py-4 text-center">
          {application?.jobId?.position}
        </TableCell>
        <TableCell className="font-bold text-black dark:text-gray-200 pl-6 pr-6 py-4 text-center">
          {application?.jobId?.company}
        </TableCell>
        <TableCell className="font-bold pl-6 pr-6 py-4 text-center">
          <button className="bg-blue-400/70 dark:bg-blue-500/60 text-white text-sm font-medium uppercase px-4 py-2 rounded-md hover:bg-blue-500/80 dark:hover:bg-blue-600/70 transition-all duration-200">
            {application?.status}
          </button>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.application._id === next.application._id
);

export default ApplicantItem;
