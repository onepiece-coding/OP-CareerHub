// NotificationsList.js
import { TableBody, TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import NotificationItem from "./NotificationItem";

const NotificationsList = memo(
  ({ data, markNotificationAsRead, deleteNotification }) => {
    return (
      <TableBody className="divide-y">
        {data?.length > 0 ? (
          <>
            {data?.map((notification, index) => (
              <NotificationItem
                key={notification._id}
                index={index}
                notification={notification}
                markNotificationAsRead={markNotificationAsRead}
                deleteNotification={deleteNotification}
              />
            ))}
          </>
        ) : (
          <TableRow className="mt-4">
            <TableCell colSpan={5} className="text-center text-black p-4 text-lg font-bold">
              Aucun <span className="font-semibold">Notifications</span> à afficher
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    );
  }
);

export default NotificationsList;
