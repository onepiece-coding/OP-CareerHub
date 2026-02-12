import { memo } from "react";
import { Badge, TableCell, TableRow } from "flowbite-react";
import { useProfileContext } from "../../../hooks/useProfileContext";

const UserItem = memo(
  ({ index, user, updateUserRole, deleteUser }) => {
    const { user: loginUser } = useProfileContext();

    return (
      <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-blue-100/50 dark:hover:bg-blue-900/60 transition-colors">
        <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
          {index < 9 ? `0${index + 1}` : index + 1}
        </TableCell>
        <TableCell>{user?.username}</TableCell>
        <TableCell>{user?.email}</TableCell>
        <TableCell className="capitalize font-semibold text-blue-600 dark:text-blue-400">{user?.role}</TableCell>
        <TableCell className="flex flex-row justify-start items-center gap-x-4">
          {loginUser._id !== user?._id && (
            <>
              {user?.role === "recruiter" || user?.role === "user" ? (
                <Badge
                  color="warning"
                  className="cursor-pointer px-3 py-1 rounded-lg"
                  onClick={() => updateUserRole(user?._id, "admin")}
                >
                  Administrateur
                </Badge>
              ) : null}

              {user?.role === "admin" || user?.role === "user" ? (
                <Badge
                  color="info"
                  className="cursor-pointer px-3 py-1 rounded-lg"
                  onClick={() => updateUserRole(user?._id, "recruiter")}
                >
                  Recruteur
                </Badge>
              ) : null}

              {user?.role === "admin" || user?.role === "recruiter" ? (
                <Badge
                  color="success"
                  className="cursor-pointer px-3 py-1 rounded-lg"
                  onClick={() => updateUserRole(user?._id, "user")}
                >
                  Utilisateur
                </Badge>
              ) : null}

              <Badge
                color="failure"
                className="cursor-pointer px-3 py-1 rounded-lg"
                onClick={() => deleteUser(user?._id)}
              >
                Supprimer
              </Badge>
            </>
          )}
        </TableCell>
      </TableRow>
    );
  },
  (prev, next) => prev.user._id === next.user._id && prev.index === next.index
);

export default UserItem;