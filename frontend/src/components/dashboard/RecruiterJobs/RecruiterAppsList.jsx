import { TableBody, TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import RecruiterAppItem from "./RecruiterAppItem";

const RecruiterAppsList = memo(
  ({ data, updateApplicationStatus, relatedId, aiAnalysis }) => {
    return (
      <TableBody className="divide-y">
        {data?.length > 0 ? (
          <>
            {data?.map((application, index) => (
              <RecruiterAppItem
                key={index}
                index={index}
                application={application}
                updateApplicationStatus={updateApplicationStatus}
                relatedId={relatedId}
                aiAnalysis={aiAnalysis}
                isEven={index % 2 === 0}
              />
            ))}
          </>
        ) : (
          <TableRow color="info" className="mt-4 max-w-sm mx-auto">
            <TableCell colSpan={5} className="text-center">
              Aucun <span className="font-medium">emploi</span> à afficher
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    );
  }
);

export default RecruiterAppsList;