/**
 * @file src/pages/dashboard/admin/manage-users/index.tsx
 */

import { Button, Card, Spinner, Table, type Column } from "@/components/ui";
import { clearUpdateUserRoleState } from "@/store/admin/admin-slice";
import { selectCurrentUser } from "@/store/auth/auth-selectors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Pagination, Search } from "@/components/common";
import { useEffect, useRef, useState } from "react";
import { Role, type User } from "@/lib/types";
import {
  selectUpdateUserRoleError,
  selectUpdateUserRoleStatus,
} from "@/store/admin/admin-selectors";
import {
  selectDeleteAllUsersError,
  selectDeleteAllUsersStatus,
  selectDeleteUserError,
  selectDeleteUserStatus,
  selectGetAllUsersError,
  selectGetAllUsersRecords,
  selectGetAllUsersStatus,
  selectGetAllUsersTotalPages,
} from "@/store/users/users-selectors";
import {
  clearDeleteAllUsersState,
  clearDeleteUserState,
  clearGetAllUsersState,
  getAllUsers,
  setCurrentQuery,
} from "@/store/users/users-slice";

import UpdateUserRole from "./update-user-role.component";
import DeleteAllUsers from "./delete-all-users.component";
import DeleteUser from "./delete-user.component";
import styles from "./styles.module.css";

const ManageUsers = () => {
  const currentUser = useAppSelector(selectCurrentUser);
  const updateUserRoleErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const deleteAllUsersErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const getAllUsersErrorHeadingRef = useRef<HTMLHeadingElement>(null);
  const deleteUserErrorHeadingRef = useRef<HTMLHeadingElement>(null);

  const [retry, setRetry] = useState(0);

  const [pageNumber, setPageNumber] = useState(1);
  const [username, setUserName] = useState("");

  const updateUserRoleStatus = useAppSelector(selectUpdateUserRoleStatus);
  const deleteAllUsersStatus = useAppSelector(selectDeleteAllUsersStatus);
  const deleteAllUsersError = useAppSelector(selectDeleteAllUsersError);
  const updateUserRoleError = useAppSelector(selectUpdateUserRoleError);
  const getAllUsersStatus = useAppSelector(selectGetAllUsersStatus);
  const getAllUsersError = useAppSelector(selectGetAllUsersError);
  const totalPages = useAppSelector(selectGetAllUsersTotalPages);
  const deleteUserStatus = useAppSelector(selectDeleteUserStatus);
  const deleteUserError = useAppSelector(selectDeleteUserError);
  const users = useAppSelector(selectGetAllUsersRecords);
  const dispatch = useAppDispatch();

  const columns: Column<User>[] = [
    {
      key: "profilePhoto.url",
      header: "#",
      render: (value) => (
        <img
          src={value}
          alt="Profile"
          width={40}
          height={40}
          style={{
            maxWidth: "initial",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ),
    },
    {
      header: "Username",
      key: "username",
    },
    {
      header: "Email",
      key: "email",
    },
    {
      header: "Role",
      key: "role",
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "12px" }}>
          {record._id !== currentUser?._id ? (
            <>
              {[Role.Admin, Role.Recruiter, Role.User]
                .filter((role) => record.role !== role)
                .map((role) => (
                  <UpdateUserRole key={role} userId={record._id} role={role} />
                ))}
              <DeleteUser
                username={record.username}
                userId={record._id}
                onDeleteSuccess={() => {
                  if (users.length === 1 && pageNumber > 1) {
                    // If we deleted the last user on the page, step back.
                    // Changing the state here will automatically trigger your
                    // useEffect to fetch the previous page from the backend.
                    setPageNumber((prev) => prev - 1);
                  } else {
                    // Otherwise, we are staying on the same page.
                    // Because we just cleared the cache in the slice,
                    // we must explicitly ask the backend for the fresh page.
                    dispatch(getAllUsers({ pageNumber, username }));
                  }
                }}
              />
            </>
          ) : (
            "You can't modify or delete your own administrator account."
          )}
        </div>
      ),
    },
  ];

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleUsernameChange = (username: string) => {
    setPageNumber(1);
    setUserName(username);
  };

  useEffect(() => {
    // 1. Tell Redux what the active query is (sync)
    // If cached, this instantly sets status to "succeeded"
    dispatch(setCurrentQuery({ pageNumber, username }));

    // 2. Dispatch thunk (will automatically abort if data is already cached)
    const promise = dispatch(getAllUsers({ pageNumber, username }));
    return () => {
      promise.abort();
      // dispatch(clearGetAllUsersState());
      dispatch(clearUpdateUserRoleState());
    };
  }, [dispatch, pageNumber, username, retry]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (updateUserRoleStatus === "failed" && updateUserRoleError)
      updateUserRoleErrorHeadingRef.current?.focus();
  }, [updateUserRoleStatus, updateUserRoleError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (deleteUserStatus === "failed" && deleteUserError)
      deleteUserErrorHeadingRef.current?.focus();
  }, [deleteUserStatus, deleteUserError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (deleteAllUsersStatus === "failed" && deleteAllUsersError)
      deleteAllUsersErrorHeadingRef.current?.focus();
  }, [deleteAllUsersStatus, deleteAllUsersError]);

  // ✅ Shift focus to the new heading when state transitions
  useEffect(() => {
    if (getAllUsersStatus === "failed" && getAllUsersError)
      getAllUsersErrorHeadingRef.current?.focus();
  }, [getAllUsersStatus, getAllUsersError]);

  if (updateUserRoleStatus === "failed" && updateUserRoleError) {
    return (
      <>
        <title>CareerHub | Manage Users | Update User Role Failed</title>
        <Card>
          <Card.Header>
            <h1
              ref={updateUserRoleErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Update user role failed
            </h1>
            <p className="card-header--subheading">{updateUserRoleError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearUpdateUserRoleState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (deleteUserStatus === "failed" && deleteUserError) {
    return (
      <>
        <title>CareerHub | Manage Users | Delete User Failed</title>
        <Card>
          <Card.Header>
            <h1
              ref={deleteUserErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Delete user failed
            </h1>
            <p className="card-header--subheading">{deleteUserError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearDeleteUserState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (deleteAllUsersStatus === "failed" && deleteAllUsersError) {
    return (
      <>
        <title>CareerHub | Manage Users | Delete All Users Failed</title>
        <Card>
          <Card.Header>
            <h1
              ref={deleteAllUsersErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              Delete all users failed
            </h1>
            <p className="card-header--subheading">{deleteAllUsersError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearDeleteAllUsersState());
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getAllUsersStatus === "idle" || getAllUsersStatus === "pending") {
    return (
      <>
        <title>CareerHub | Manage Users | Loading State</title>

        <Card className={`state`}>
          <Card.Body>
            <Spinner className={"state-spinner"} />
            <h2 className={"state-title"}>Get all users</h2>
            <p className={"state-desc"} style={{ marginBottom: 0 }}>
              Please wait while we get all users.
            </p>
          </Card.Body>
        </Card>
      </>
    );
  }

  if (getAllUsersStatus === "succeeded") {
    return (
      <>
        <title>CareerHub | Manage Users</title>
        <div className="container">
          <Card style={{ width: "100%", maxWidth: "initial" }}>
            <Card.Header>
              <h1 className="card-header-heading">Manage Users</h1>
              <p className="card-header--subheading">
                View, organize, and manage all registered users efficiently.
              </p>
            </Card.Header>
            <Card.Body>
              <Search
                handleSearchChange={handleUsernameChange}
                initialValue={username}
                label={"Username"}
              />

              <Table columns={columns} data={users} rowKey="_id" />

              {users.length > 0 && (
                <div className={styles.row}>
                  <Pagination
                    handlePageChange={handlePageChange}
                    totalPages={totalPages}
                    pageNumber={pageNumber}
                  />
                  <DeleteAllUsers
                    onDeleteSuccess={() => {
                      setPageNumber(1);
                      setUserName("");
                      dispatch(getAllUsers({ pageNumber: 1, username: "" }));
                    }}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </>
    );
  }

  if (getAllUsersStatus === "failed" && getAllUsersError) {
    return (
      <>
        <title>CareerHub | Manage Users | Get All Users Failed</title>

        <Card>
          <Card.Header>
            <h1
              ref={getAllUsersErrorHeadingRef}
              className="card-header-heading"
              tabIndex={-1}
            >
              get all users failed
            </h1>
            <p className="card-header--subheading">{getAllUsersError}</p>
          </Card.Header>
          <Card.Body>
            <Button
              onClick={() => {
                dispatch(clearGetAllUsersState());
                setRetry((prev) => prev + 1);
              }}
            >
              Try Again
            </Button>
          </Card.Body>
        </Card>
      </>
    );
  }
};

export default ManageUsers;
