import { TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import { usePdfViewerContext } from "../../../../hooks/usePdfViewerContext";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";

const RecruiterItem = memo(
  ({ index, application, updateApplicationStatus, relatedId, isEven }) => {
    const { setShowPreview } = usePdfViewerContext();
    const bgColor = isEven ? "bg-sky-50" : "bg-white";

    return (
      <TableRow
        className={`${
          relatedId === application?._id
            ? "bg-white-100 text-gray-900"
            : `${bgColor} text-gray-700`
        }`}
      >
        <TableCell className="text-center py-4">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="font-medium text-gray-900 p-4 mx-2 w-[20%]">
          {application?.jobId?.position}
        </TableCell>
        <TableCell className="font-medium text-gray-900 p-4 mx-2 w-[20%]">
          {application?.jobId?.company}
        </TableCell>
        <TableCell className="capitalize font-medium text-gray-900 p-4 mx-2 w-[20%]">
          {application?.status}
        </TableCell>
        <TableCell className="flex items-center gap-1.5 p-4 mx-2 w-[28%]">
          {/* CV Preview */}
          <button
            aria-label="Preview candidate CV"
            className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 rounded-xl px-4 py-2.5 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
            onClick={() => setShowPreview(true, application?.resume?.url)}
          >
            <FaEye className="w-4.5 h-4.5 transition-opacity duration-300 hover:opacity-80" />
            Aperçu
          </button>

          {/* Accept Button */}
          {application?.status !== "accepter" && (
            <button
              aria-label="Accept candidate application"
              className="flex items-center gap-2 text-sm font-semibold text-white bg-green-500 hover:bg-gradient-to-r hover:from-green-700 hover:to-green-800 rounded-xl px-4 py-2.5 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
              onClick={() => {
                updateApplicationStatus(
                  application._id,
                  "accepter",
                  application?.jobId?._id
                );
              }}
            >
              <FaCheck className="w-4.5 h-4.5 transition-opacity duration-300 hover:opacity-80" />
              Accepter
            </button>
          )}

          {/* Reject Button */}
          {application?.status !== "refuser" && (
            <button
              aria-label="Reject candidate application"
              className="flex items-center gap-2 text-sm font-semibold text-white bg-red-500 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-800 rounded-xl px-4 py-2.5 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
              onClick={() => {
                updateApplicationStatus(
                  application._id,
                  "refuser",
                  application?.jobId?._id
                );
              }}
            >
              <FaTimes className="w-4.5 h-4.5 transition-opacity duration-300 hover:opacity-80" />
              Rejeter
            </button>
          )}
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.application._id === next.application._id
);

export default RecruiterItem;
