import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import Spinner from "../components/Spinner";

export default function UserDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser, isAuthenticated } = useAuth();

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get("/admin/manage-users");
      const userData = response.data.find((u) => u.user_id === parseInt(id));
      if (userData) {
        setUser(userData);
      } else {
        toast.error("User not found");
        navigate("/manage-users");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
      navigate("/manage-users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (currentUser) {
      if (!["super_admin", "user_admin"].includes(currentUser.user_type)) {
        toast.error("You cannot manage users.");
        navigate("/profile");
      }
    }

    fetchUserDetails();
  }, [isAuthenticated, navigate, currentUser, id]);

  const handleBlockUser = async () => {
    if (
      window.confirm(`Are you sure you want to block user ${user?.username}?`)
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user.user_id}`,
          action: "block",
        });
        await fetchUserDetails();
        toast.success(`User ${user?.username} has been blocked successfully.`);
      } catch (error) {
        console.error("Error blocking user:", error);
        toast.error("Failed to block user. Please try again.");
      }
    }
  };

  const handleUnblockUser = async () => {
    if (
      window.confirm(
        `Are you sure you want to un-block user ${user?.username}?`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user.user_id}`,
          action: "unblock",
        });
        await fetchUserDetails();
        toast.success(
          `User ${user?.username} has been unblocked successfully.`
        );
      } catch (error) {
        console.error("Error unblocking user:", error);
        toast.error("Failed to unblock user. Please try again.");
      }
    }
  };

  const handleWarnUser = async () => {
    if (
      window.confirm(
        `Are you sure you want to add a warning to user ${user?.username}? If 3 warnings are reached, they will be blocked.`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user.user_id}`,
          action: "warn",
        });
        await fetchUserDetails();
        toast.success(`User ${user?.username} has been warned successfully.`);
      } catch (error) {
        console.error("Error warning user:", error);
        toast.error("Failed to warn user. Please try again.");
      }
    }
  };

  const handleUnWarnUser = async () => {
    if (
      window.confirm(
        `Are you sure you want to remove a warning from user ${user?.username}?`
      )
    ) {
      try {
        await axios.post("/admin/manage-users", {
          user_id: `${user.user_id}`,
          action: "unwarn",
        });
        await fetchUserDetails();
        toast.success(`User ${user?.username} has been unwarned successfully.`);
      } catch (error) {
        console.error("Error unwarning user:", error);
        toast.error("Failed to unwarn user. Please try again.");
      }
    }
  };

  const handleDeleteUser = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete user ${user?.username}? This action can NOT be reversed and all information about it will be deleted.`
      )
    ) {
      try {
        await axios.delete("/admin/delete-user", {
          data: { user_id: `${user.user_id}` },
        });
        toast.success(`User ${user?.username} has been deleted successfully.`);
        navigate("/manage-users");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user. Please try again.");
      }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-sky-800 rounded-lg m-1 p-1 flex justify-center">
      <div className="flex">

        {/* Main Content */}
        <div className="bg-sky-200 rounded-lg m-1 p-6">
          {user && (
            <div className="space-y-6">
              {/* User Header */}
              <div className="bg-sky-950 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {user.username}
                    </h1>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
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
                      <span className="px-4 py-2 rounded-full text-sm font-medium bg-gray-500 text-white">
                        Warnings: {user.num_of_warns}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.access_level === 0 ? (
                      <button
                        onClick={handleUnblockUser}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
                      >
                        Unblock User
                      </button>
                    ) : (
                      <button
                        onClick={handleBlockUser}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        Block User
                      </button>
                    )}
                    <button
                      onClick={handleWarnUser}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
                    >
                      Warn User
                    </button>
                    <button
                      onClick={handleUnWarnUser}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer"
                    >
                      Remove Warning
                    </button>
                    <button
                      onClick={handleDeleteUser}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      Delete User
                    </button>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="grid grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-sky-950 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Personal Information
                  </h2>
                  <div className="space-y-3 text-gray-200">
                    <p>
                      <span className="font-medium text-white">Name:</span>{" "}
                      {user.first_name} {user.last_name}
                    </p>
                    <p>
                      <span className="font-medium text-white">Email:</span>{" "}
                      {user.email}
                    </p>
                    <p>
                      <span className="font-medium text-white">Phone:</span>{" "}
                      {user.phone_number || "Not provided"}
                    </p>
                    <p>
                      <span className="font-medium text-white">Address:</span>{" "}
                      {user.address || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Account Information */}
                <div className="bg-sky-950 rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    Account Information
                  </h2>
                  <div className="space-y-3 text-gray-200">
                    <p>
                      <span className="font-medium text-white">User Type:</span>{" "}
                      {user.user_type}
                    </p>
                    <p>
                      <span className="font-medium text-white">
                        Access Level:
                      </span>{" "}
                      {user.access_level}
                    </p>
                    <p>
                      <span className="font-medium text-white">Warnings:</span>{" "}
                      {user.num_of_warns}
                    </p>
                    {user.user_type === "professional" && (
                      <>
                        <p>
                          <span className="font-medium text-white">
                            Specialty:
                          </span>{" "}
                          {user.specialty}
                        </p>
                        <p>
                          <span className="font-medium text-white">
                            Hourly Rate:
                          </span>{" "}
                          ${user.hourly_rate}
                        </p>
                        <p>
                          <span className="font-medium text-white">
                            Description:
                          </span>{" "}
                          {user.description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
