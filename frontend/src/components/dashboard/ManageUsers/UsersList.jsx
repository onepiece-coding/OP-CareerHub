import { TableBody, TableCell, TableRow } from "flowbite-react";
import { memo } from "react";
import UserItem from "./UserItem";

const UsersList = memo(({ users, updateUserRole, deleteUser }) => {
  return (
    <TableBody className="divide-y divide-gray-200 dark:divide-gray-900">
      {users.length > 0 ? (
        <>
          {users?.map((user, index) => (
            <UserItem
              key={user?._id}
              index={index}
              user={user}
              deleteUser={deleteUser}
              updateUserRole={updateUserRole}
            />
          ))}
        </>
      ) : (
        <TableRow className="bg-white dark:bg-gray-900">
          <TableCell colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">
            Aucun <span className="font-medium">utilisateur</span> à afficher
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
});

export default UsersList;