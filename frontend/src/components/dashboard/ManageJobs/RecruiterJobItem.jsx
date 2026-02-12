import { memo } from "react";
import { Link } from "react-router-dom";
import { TableCell, TableRow } from "flowbite-react";
import { FaEye, FaRegEdit, FaTrash, FaBusinessTime } from "react-icons/fa";

const RecruiterJobItem = memo(
  ({ recruiterJob, index, deleteHandler }) => {
    const rowClassName = `transition-all duration-300 ${
      index % 2 === 0
        ? "bg-white dark:bg-gray-800"
        : "bg-blue-50 dark:bg-gray-700"
    } hover:bg-blue-100 dark:hover:bg-gray-600`;

    return (
      <TableRow className={rowClassName}>
        <TableCell className="text-center font-semibold text-black border-b border-gray-300 dark:border-gray-600 py-4 w-[12%]">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="text-center text-black border-b border-gray-300 dark:border-gray-600 py-4 w-[20%]">
          {recruiterJob?.position}
        </TableCell>
        <TableCell className="text-center text-black border-b border-gray-300 dark:border-gray-600 py-4 w-[20%]">
          {recruiterJob?.company}
        </TableCell>
        <TableCell className="text-center text-black border-b border-gray-300 dark:border-gray-600 py-4 w-[20%]">
          {recruiterJob?.createdBy?.username}
        </TableCell>
        <TableCell className="text-center border-b border-gray-300 dark:border-gray-600 py-4 w-[28%]">
          <div className="flex justify-center gap-x-3">
            <Link to={`/job-details/${recruiterJob?._id}`} title="Voir">
              <FaEye className="w-5 h-5 text-green-500 hover:scale-110 transition" />
            </Link>
            <Link to={`/dashboard/edit-job/${recruiterJob?._id}`} title="Modifier">
              <FaRegEdit className="w-5 h-5 text-yellow-500 hover:scale-110 transition" />
            </Link>
            <Link to={`/dashboard/recruiter-jobs/${recruiterJob?._id}`} title="Candidats">
              <FaBusinessTime className="w-5 h-5 text-blue-500 hover:scale-110 transition" />
            </Link>
            <button
              onClick={() => deleteHandler(recruiterJob?._id)}
              title="Supprimer"
            >
              <FaTrash className="w-5 h-5 text-red-500 hover:scale-110 transition" />
            </button>
          </div>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.recruiterJob._id === next.recruiterJob._id
);

export default RecruiterJobItem;