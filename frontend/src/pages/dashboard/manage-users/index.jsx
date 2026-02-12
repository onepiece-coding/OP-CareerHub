import { Loading } from "../../../components/feedback";
import {
  Button,
  Spinner,
  Table,
  TableHead,
  TableHeadCell,
  TableRow,
  TableBody,
  TableCell,
  Dropdown,
  DropdownItem,
} from "flowbite-react";
import { HiTrash, HiUser, HiUserCircle, HiShieldCheck } from "react-icons/hi";
import useManageUsers from "./useManageUsers";

const ManageUsers = () => {
  const {
    state: { loading, error, data },
    deleteLoading,
    updateUserRole,
    deleteUser,
    deleteAllUsers,
  } = useManageUsers();

  const handleDeleteUser = (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      deleteUser(userId);
    }
  };

  const handleDeleteAllUsers = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer tous les utilisateurs ?")) {
      deleteAllUsers();
    }
  };

  return (
    <Loading loading={loading} error={error}>
      <div className="min-h-screen bg-gray-200 dark:bg-gray-900 p-9">
        <section className="mx-auto">
          <div className="flex justify-end mb-6">
            <Button
              color="failure"
              onClick={handleDeleteAllUsers}
              disabled={deleteLoading}
              className="flex items-center gap-2 rounded-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-sm hover:shadow-md transition-all duration-200 text-white"
              aria-label="Supprimer tous les utilisateurs"
            >
              {deleteLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" aria-label="Chargement..." />
                  Chargement...
                </>
              ) : (
                <>
                  <HiTrash className="w-4 h-4" />
                  Supprimer tous
                </>
              )}
            </Button>
          </div>
          <div className="rounded-xl shadow-xl bg-white dark:bg-gray-800">
            <Table className="w-full text-sm text-gray-700 dark:text-gray-200 min-w-[1000px]">
              <TableHead className="bg-blue-400 dark:bg-blue-700 text-white dark:text-gray-100">
                <TableRow>
                  <TableHeadCell className="text-center p-3 w-16 bg-transparent">#</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-2/12 bg-transparent">Nom d'utilisateur</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-4/12 bg-transparent">E-mail</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-1/6 bg-transparent">Rôle</TableHeadCell>
                  <TableHeadCell className="text-center p-3 w-3/12 bg-transparent">Actions</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((user, index) => (
                  <TableRow
                    key={user._id}
                    className="hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <TableCell className="text-center p-3">{index + 1}</TableCell>
                    <TableCell className="text-center p-3 font-medium">{user.username}</TableCell>
                    <TableCell className="text-center p-3">{user.email}</TableCell>
                    <TableCell className="text-center p-3 capitalize font-semibold text-blue-600 dark:text-blue-400">
                      {user.role}
                    </TableCell>
                    <TableCell className="text-center p-3">
                      <div className="hidden md:flex justify-center gap-2">
                        {user.role !== "admin" && (
                          <Button
                            size="sm"
                            className="flex items-center gap-1 rounded-md bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200"
                            onClick={() => updateUserRole(user._id, "admin")}
                            aria-label="Définir comme administrateur"
                          >
                            <HiShieldCheck className="w-4 h-4" />
                            Admin
                          </Button>
                        )}
                        {user.role !== "recruiter" && (
                          <Button
                            size="sm"
                            className="flex items-center gap-1 rounded-md bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200"
                            onClick={() => updateUserRole(user._id, "recruiter")}
                            aria-label="Définir comme recruteur"
                          >
                            <HiUserCircle className="w-4 h-4" />
                            Recruteur
                          </Button>
                        )}
                        {user.role !== "user" && (
                          <Button
                            size="sm"
                            className="flex items-center gap-1 rounded-md bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200"
                            onClick={() => updateUserRole(user._id, "user")}
                            aria-label="Définir comme utilisateur"
                          >
                            <HiUser className="w-4 h-4" />
                            Utilisateur
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex items-center gap-1 rounded-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200"
                          onClick={() => handleDeleteUser(user._id)}
                          aria-label="Supprimer l'utilisateur"
                        >
                          <HiTrash className="w-4 h-4" />
                          Supprimer
                        </Button>
                      </div>
                      {/* Dropdown pour mobile */}
                      <div className="md:hidden">
                        <Dropdown
                          label="Actions"
                          inline
                          className="bg-white dark:bg-gray-800 rounded-md shadow-md"
                          renderTrigger={() => (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-md shadow-sm hover:shadow-md hover:scale-102 transition-all duration-200"
                            >
                              Actions
                            </Button>
                          )}
                        >
                          {user.role !== "admin" && (
                            <DropdownItem
                              onClick={() => updateUserRole(user._id, "admin")}
                              className="flex items-center gap-1 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-sm"
                            >
                              <HiShieldCheck className="w-4 h-4" />
                              Admin
                            </DropdownItem>
                          )}
                          {user.role !== "recruiter" && (
                            <DropdownItem
                              onClick={() => updateUserRole(user._id, "recruiter")}
                              className="flex items-center gap-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-sm"
                            >
                              <HiUserCircle className="w-4 h-4" />
                              Recruteur
                            </DropdownItem>
                          )}
                          {user.role !== "user" && (
                            <DropdownItem
                              onClick={() => updateUserRole(user._id, "user")}
                              className="flex items-center gap-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 text-sm"
                            >
                              <HiUser className="w-4 h-4" />
                              Utilisateur
                            </DropdownItem>
                          )}
                          <DropdownItem
                            onClick={() => handleDeleteUser(user._id)}
                            className="flex items-center gap-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm"
                          >
                            <HiTrash className="w-4 h-4" />
                            Supprimer
                          </DropdownItem>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </Loading>
  );
};

export default ManageUsers;
