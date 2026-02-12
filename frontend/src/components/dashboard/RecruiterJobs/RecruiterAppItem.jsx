import { Badge, TableCell, TableRow } from "flowbite-react";
import { memo } from "react";

const RecruiterAppItem = memo(
  ({ index, application, relatedId, aiAnalysis, isEven }) => {
    return (
      <TableRow
        className={`
          ${relatedId === application?._id
            ? "bg-orange-50 dark:bg-orange-700"
            : isEven
              ? "bg-sky-100 dark:bg-sky-900"
              : "bg-white dark:bg-gray-800"
          }
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
        `}
      >
        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white w-12 text-center">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="truncate max-w-xs">
          {application?.applicant?.name}
        </TableCell>
        <TableCell className="truncate max-w-xs">
          {application?.applicant?.location}
        </TableCell>
        <TableCell className="capitalize w-24">
          {application?.status}
        </TableCell>
        <TableCell className="w-24">
          {application?.status === "pending" && (
            <Badge
              color={
                application?.score >= 75
                  ? "success"
                  : application?.score < 75 && application?.score >= 50
                  ? "warning"
                  : "failure"
              }
              className="cursor-pointer"
              onClick={() => {
                aiAnalysis(
                  application?.score,
                  application?.reasons,
                  application?.applicationId
                );
              }}
            >
              Score: {application?.score}
            </Badge>
          )}
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.application._id === next.application._id
);

export default RecruiterAppItem;