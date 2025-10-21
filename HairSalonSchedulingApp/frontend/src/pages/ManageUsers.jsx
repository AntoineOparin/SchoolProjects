import React from "react";
import { toast } from "react-toastify";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Spinner from "../components/Spinner.jsx";

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("username");

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/admin/manage-users");
      console.log("Fetched users:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      if (!["super_admin", "user_admin"].includes(user.user_type)) {
        toast.error("You cannot manage users.");
        navigate("/profile");
      }
    }

    fetchUsers();
  }, [isAuthenticated, navigate, user]);

  const handleBlockUser = async (user_id) => {
    const userToBlock = users.find((u) => u.user_id === user_id);
    if (
      window.confirm(
        `Are you sure you want to block user ${
          userToBlock?.username || user_id
        }?`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user_id}`,
          action: "block",
        });
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Blocked user ${user_id}`,
        });
        // Refresh the user data
        await fetchUsers();
        toast.success(
          `User ${
            userToBlock?.username || user_id
          } has been blocked successfully.`
        );
      } catch (error) {
        console.error("Error blocking user:", error);
        toast.error("Failed to block user. Please try again.");
      }
    }
  };

  const handleUnblockUser = async (user_id) => {
    const userToUnblock = users.find((u) => u.user_id === user_id);
    if (
      window.confirm(
        `Are you sure you want to un-block user ${
          userToUnblock?.username || user_id
        }?`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user_id}`,
          action: "unblock",
        });
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Unblocked user ${user_id}`,
        });
        // Refresh the user data
        await fetchUsers();
        toast.success(
          `User ${
            userToUnblock?.username || user_id
          } has been unblocked successfully.`
        );
      } catch (error) {
        console.error("Error unblocking user:", error);
        toast.error("Failed to unblock user. Please try again.");
      }
    }
  };

  const handleWarnUser = async (user_id) => {
    const userToWarn = users.find((u) => u.user_id === user_id);
    if (
      window.confirm(
        `Are you sure you want to add a warning to user ${
          userToWarn?.username || user_id
        }? If 3 warnings are reached, they will be blocked.`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user_id}`,
          action: "warn",
        });
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Warned user ${user_id}`,
        });
        // Refresh the user data
        await fetchUsers();
        toast.success(
          `User ${
            userToWarn?.username || user_id
          } has been warned successfully.`
        );
      } catch (error) {
        console.error("Error warning user:", error);
        toast.error("Failed to warn user. Please try again.");
      }
    }
  };

  const handleUnWarnUser = async (user_id) => {
    const userToUnwarn = users.find((u) => u.user_id === user_id);
    if (
      window.confirm(
        `Are you sure you want to remove a warning from user ${
          userToUnwarn?.username || user_id
        }?`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user_id}`,
          action: "unwarn",
        });
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Unwarned user ${user_id}`,
        });
        // Refresh the user data
        await fetchUsers();
        toast.success(
          `User ${
            userToUnwarn?.username || user_id
          } has been unwarned successfully.`
        );
      } catch (error) {
        console.error("Error unwarning user:", error);
        toast.error("Failed to unwarn user. Please try again.");
      }
    }
  };

  const handleDeleteUser = async (user_id) => {
    const userToDelete = users.find((u) => u.user_id === user_id);
    if (
      window.confirm(
        `Are you sure you want to delete user ${
          userToDelete?.username || user_id
        }? This action can NOT be reversed and all information about it will be deleted.`
      )
    ) {
      try {
        await axios.delete("/admin/delete-user", {
          data: { user_id: `${user_id}` },
        });
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Deleted user ${user_id}`,
        });
        // Refresh the user data
        await fetchUsers();
        toast.success(
          `User ${
            userToDelete?.username || user_id
          } has been deleted successfully.`
        );
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user. Please try again.");
      }
    }
  };

  const filteredAndSortedUsers = React.useMemo(() => {
    let result = [...users];

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((user) => user.user_type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case "username":
          return a.username.localeCompare(b.username);
        case "name":
          return `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
        case "type":
          return a.user_type.localeCompare(b.user_type);
        case "warnings":
          return b.num_of_warns - a.num_of_warns;
        default:
          return 0;
      }
    });

    return result;
  }, [users, typeFilter, sortOrder]);

  const resetFilters = () => {
    setTypeFilter("all");
    setSortOrder("username");
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) return <Spinner />;
  else
    return (
      <div className="min-h-screen">
        <div className="flex bg-sky-800 p-1 min-h-screen">
          <div className="w-1/4 bg-sky-200 rounded-lg m-1 p-2 text-sky-950">
            <div className="text-xl font-bold mb-4">
              User Management
            </div>

            <Logo
              className="w-25 h-25 hover:cursor-pointer mr-auto"
              onClick={() => navigate("/")}
              role="button"
            />

            {/* Filter and Sort Controls */}
            <div className="mt-8 space-y-4">
              <div>
                <label className="block  mb-2">
                  Filter by User Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
                >
                  <option value="all">All User Types</option>
                  <option value="client">Client</option>
                  <option value="professional">Professional</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="appointment_admin">Appointment Admin</option>
                  <option value="user_admin">User Admin</option>
                </select>
              </div>

              <div>
                <label className="block  mb-2">
                  Sort by Registration Date
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full px-3 py-1.5 bg-sky-600 text-white rounded hover:bg-sky-800 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          <div className="w-3/4 bg-sky-200 rounded-lg m-1 p-2">
            <div className="flex justify-center mb-4">
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-1.5 bg-green-500 text-sm text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center gap-2"
              >
                Create New User
              </button>
            </div>

            {filteredAndSortedUsers.length > 0 ? (
              filteredAndSortedUsers.map((user) => (
                <div
                  key={user.user_id}
                  className="bg-sky-700 rounded-lg p-3 hover:bg-sky-800 transition-colors mb-4"
                >
                  <div className="flex justify-between items-start">
                    <div
                      className="flex-grow cursor-pointer"
                      onClick={() => navigate(`/user/${user.user_id}`)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {user.username}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.access_level === 0
                              ? "bg-red-500"
                              : user.user_type === "super_admin"
                              ? "bg-purple-500"
                              : user.user_type === "appointment_admin"
                              ? "bg-blue-500"
                              : user.user_type === "user_admin"
                              ? "bg-yellow-500"
                              : user.user_type === "professional"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          } text-white`}
                        >
                          {user.access_level === 0 ? "Blocked" : user.user_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-base text-gray-200">
                        <div>
                          <p className="font-medium text-white">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm mt-1">
                            {user.email || "No email"}
                          </p>
                          <p className="text-sm">
                            {user.phone_number || "No phone"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium text-white">
                              Access Level:
                            </span>{" "}
                            {user.access_level}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-white">
                              Warnings:
                            </span>{" "}
                            {user.num_of_warns}
                          </p>
                          {user.specialty && (
                            <p className="text-sm">
                              <span className="font-medium text-white">
                                Specialty:
                              </span>{" "}
                              {user.specialty}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {parseInt(user.access_level) === 0 ? (
                        <button
                          onClick={() => handleUnblockUser(user.user_id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer text-sm"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user.user_id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer text-sm"
                        >
                          Block
                        </button>
                      )}
                      <button
                        onClick={() => handleWarnUser(user.user_id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors cursor-pointer text-sm"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleUnWarnUser(user.user_id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors cursor-pointer text-sm"
                      >
                        Remove Warning
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-white text-center py-8">No users found</p>
            )}
          </div>
        </div>
      </div>
    );
}
