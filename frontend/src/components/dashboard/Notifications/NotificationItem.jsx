import { TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import { dateFormatter } from "../../../utils/dateFormatter";
import { FaCheckCircle, FaEye, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const NotificationItem = memo(
  ({ index, notification, markNotificationAsRead, deleteNotification }) => {
    return (
      <TableRow
        className={`dark:border-gray-700 ${
          !notification?.read
            ? "bg-white dark:bg-gray-800 text-black"
            : "bg-white dark:bg-gray-800 text-black"
        } border-b border-gray-300 hover:bg-blue-100 dark:hover:bg-blue-600 transition-all duration-200`}
      >
        <TableCell className="text-lg text-black dark:text-white border-r border-gray-300 p-4 min-w-[100px]">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell className="text-lg text-black dark:text-white border-r border-gray-300 p-4 min-w-[150px]">
          {notification?.type}
        </TableCell>
        <TableCell className="text-lg text-black dark:text-white border-r border-gray-300 p-4 min-w-[250px]">
          {notification?.message}
        </TableCell>
        <TableCell className="text-lg text-black dark:text-white border-r border-gray-300 p-4 min-w-[200px]">
          <time dateTime={notification?.createdAt}>
            {dateFormatter(notification?.createdAt)}
          </time>
        </TableCell>
        <TableCell className="flex flex-row justify-start items-center gap-x-6 p-4 min-w-[200px]">
          <Link
            className="cursor-pointer"
            to={
              notification?.type === "job_status_update"
                ? "/jobs"
                : `/dashboard/my-jobs?relatedId=${notification?.relatedId}`
            }
          >
            <FaEye className="w-6 h-6 text-yellow-500 hover:scale-110 transition" />
          </Link>
          {!notification?.read && (
            <button
              className="cursor-pointer"
              onClick={() => {
                markNotificationAsRead(notification?._id);
              }}
            >
              <FaCheckCircle className="w-6 h-6 text-green-500 hover:scale-110 transition" />
            </button>
          )}
          <button
            className="cursor-pointer"
            onClick={() => {
              deleteNotification(notification?._id);
            }}
          >
            <FaTrash className="w-6 h-6 text-red-500 hover:scale-110 transition" />
          </button>
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.notification._id === next.notification._id
);

export default NotificationItem;
