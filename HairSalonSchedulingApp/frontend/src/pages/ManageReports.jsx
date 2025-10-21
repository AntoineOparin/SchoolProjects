import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ManageReports = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "all",
    searchTerm: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Check if user has admin privileges
    if (!["super_admin", "appointment_admin"].includes(user.user_type)) {
      navigate("/");
      toast.error("You don't have permission to access this page");
      return;
    }

    fetchReports();
  }, [isAuthenticated, navigate, user]);

  const fetchReports = async () => {
    try {
      // Get all reports for the current user
      const response = await axios.get(
        `/reports/admin/user/${user.user_id}/reports`
      );
      setReports(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch reports");
      setLoading(false);
      toast.error("Failed to load reports");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "Pending":
        return "bg-yellow-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: "",
      dateRange: "all",
      searchTerm: "",
    });
  };

  const filterReports = (reports) => {
    return reports.filter((report) => {
      // Filter by status
      if (filters.status && report.status !== filters.status) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange !== "all") {
        const reportDate = new Date(report.date);
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        if (filters.dateRange === "last30" && reportDate < thirtyDaysAgo) {
          return false;
        }
      }

      return true;
    });
  };

  const sortReports = (reports) => {
    return [...reports].sort((a, b) => {
      if (sortConfig.key === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortConfig.key === "status") {
        return sortConfig.direction === "asc"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
  };

  const truncateText = (text, maxLength = 10) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const filteredAndSortedReports = sortReports(filterReports(reports));

  if (loading) return <Spinner />;

  return (
    <div className="bg-sky-800 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-sky-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sky-950">Manage Reports</h1>
            <div className="flex gap-4">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="p-2 rounded bg-white border border-sky-300"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="p-2 rounded bg-white border border-sky-300"
              >
                <option value="all">All Time</option>
                <option value="last30">Last 30 Days</option>
              </select>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-sky-700 text-white">
                <tr>
                  <th
                    className="px-6 py-3 text-left cursor-pointer hover:bg-sky-600"
                    onClick={() => handleSort("date")}
                  >
                    Date{" "}
                    {sortConfig.key === "date" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    className="px-6 py-3 text-left cursor-pointer hover:bg-sky-600"
                    onClick={() => handleSort("status")}
                  >
                    Status{" "}
                    {sortConfig.key === "status" &&
                      (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="px-6 py-3 text-left">Professional Feedback</th>
                  <th className="px-6 py-3 text-left">Client Feedback</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedReports.length > 0 ? (
                  filteredAndSortedReports.map((report) => (
                    <tr key={report.report_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="truncate">
                          {truncateText(report.professional_feedback) ||
                            "No feedback yet"}
                        </p>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="truncate">
                          {truncateText(report.client_feedback) ||
                            "No feedback yet"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/reports/appointments/${report.appointment_id}/report`
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 bg-sky-200 rounded-md px-2 py-1 cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageReports;
