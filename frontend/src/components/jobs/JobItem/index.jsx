import { Button, Card, Spinner } from "flowbite-react";
import { memo } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdBusinessCenter } from "react-icons/md";
import { Link } from "react-router-dom";
import { useProfileContext } from "../../../hooks/useProfileContext";
import { dateFormatter, DATE_FORMATS } from "../../../utils/dateFormatter";
import useJobItem from "./useJobItem";

const JobItem = memo(
  ({ job }) => {
    const { userStatus } = useProfileContext();
    const { handleApplyJob, loading } = useJobItem(userStatus.status, job._id);

    return (
      <div className="w-full max-w-sm mx-auto mb-6">
        <Card
          theme={{
            root: {
              children: "p-0",
              base: "border border-gray-200 bg-transparent rounded-lg shadow-lg transition-all hover:scale-105 transform hover:shadow-xl",
            },
          }}
          className="w-full h-full bg-transparent p-6"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-blue-600">{job.position}</div>
              <span className="bg-transparent border-2 border-orange-500 text-orange-500 text-xs rounded-full px-3 py-1 hover:bg-orange-500 hover:text-white transition-all">{job.jobType}</span>
            </div>

            {/* Job Title */}
            <div className="px-5 mt-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{job.company}</h3>
            </div>

            {/* Details Section */}
            <div className="mt-2 px-5">
              <div className="flex items-center text-gray-600 mb-2">
                <FaRegCalendarAlt className="mr-2 text-lg text-blue-600" />
                <span className="text-sm">{dateFormatter(job?.jobDeadline, DATE_FORMATS.pretty)}</span>
              </div>
              <div className="flex items-center text-gray-600 mb-2">
                <IoLocationOutline className="mr-2 text-lg text-blue-600" />
                <span className="text-sm">{job.jobLocation}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MdBusinessCenter className="mr-2 text-lg text-blue-600" />
                <span className="text-sm">{job.jobType}</span>
              </div>
            </div>

            {/* Apply Section */}
            <div className="mt-auto px-5 pt-4 pb-2">
              <Button
                as={Link}
                to={`/job-details/${job._id}`}
                color="light"
                className="w-full mb-3 border-2 border-blue-300 text-blue-600 bg-transparent hover:bg-blue-500 hover:text-white transition-all"
              >
                Détails
              </Button>
              <Button
                className="w-full border-2 border-orange-300 text-orange-500 bg-transparent hover:bg-orange-500 hover:text-white transition-all"
                onClick={handleApplyJob}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" color="white" className="me-2" aria-label="Applying Job..." />
                    Chargement...
                  </>
                ) : (
                  "Postuler"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  },
  (prev, next) => prev.job._id === next.job._id
);

export default JobItem;
