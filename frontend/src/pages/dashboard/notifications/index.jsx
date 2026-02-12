import { Table, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Loading } from "../../../components/feedback";
import { NotificationsList } from "../../../components/dashboard";
import useNotifications from "./useNotifications";
import { FiBell } from "react-icons/fi"; // ✅ Icône de cloche

const Notifications = () => {
  const { state, markNotificationAsRead, deleteNotification } = useNotifications();

  return (
    <Loading loading={state.loading} error={state.error}>
      <section className="py-10 px-6 min-h-screen bg-gray-200 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto bg-gray-100 dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-300 dark:border-gray-700 p-10">
          {/* Titre avec icône */}
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-600 dark:text-blue-400 flex items-center justify-center gap-3">
            <FiBell className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Notifications
          </h2>

          {/* Tableau des notifications */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
              <TableHead>
                <TableRow className="border-b-2 border-gray-300 dark:border-gray-600">
                  <TableHeadCell className="border-r border-gray-300 dark:border-gray-600 text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
                    #
                  </TableHeadCell>
                  <TableHeadCell className="border-r border-gray-300 dark:border-gray-600 text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
                    Type
                  </TableHeadCell>
                  <TableHeadCell className="border-r border-gray-300 dark:border-gray-600 text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
                    Message
                  </TableHeadCell>
                  <TableHeadCell className="text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
                    Créé à
                  </TableHeadCell>
                  <TableHeadCell className="text-xs font-extrabold pl-6 pr-6 py-4 text-black dark:text-gray-200 uppercase bg-blue-500/30 dark:bg-blue-700/30 text-center">
                    Actions
                  </TableHeadCell>
                </TableRow>
              </TableHead>

              {/* Liste des notifications */}
              <NotificationsList
                data={state.data}
                markNotificationAsRead={markNotificationAsRead}
                deleteNotification={deleteNotification}
              />
            </Table>
          </div>
        </div>
      </section>
    </Loading>
  );
};

export default Notifications;
