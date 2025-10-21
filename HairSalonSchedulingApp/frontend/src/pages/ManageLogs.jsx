import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Spinner from "../components/Spinner.jsx";

export default function ManageLogs() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [adminFilter, setAdminFilter] = useState("all");
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
        } else if (user) {
            if (!["super_admin"].includes(user.user_type)) {
                toast.error("You cannot manage admin logs.");
                navigate("/profile");
            }
        }

        const fetchLogs = async () => {
            try {
                const response = await axios.get("/admin/manage-logs");
                setLogs(response.data);
            } catch (error) {
                console.error("Error fetching logs:", error);
                setError("Failed to load logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [isAuthenticated, navigate, user]);

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return "";
        const date = new Date(dateTimeStr);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/New_York",
        }).format(date);
    };

    const filteredAndSortedLogs = React.useMemo(() => {
        let result = [...logs];

        // Apply admin type filter
        if (adminFilter !== "all") {
            result = result.filter(
                (log) => log.admin.user_type === adminFilter
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [
        logs,
        adminFilter,
        sortOrder,
    ]);

    const resetFilters = () => {
        setAdminFilter("all");
        setSortOrder("newest");
    };

    if (!isAuthenticated) return null;
    if (loading) return <Spinner />;

    return (
        <div className="flex min-h-screen bg-sky-800 p-1">
            {/* left side */}
            <div className="w-1/4 bg-sky-200 rounded-lg m-1 p-2 text-sky-950">
                <div className="text-xl font-bold mb-4">
                    Manage Logs
                </div>
                <Logo
                    className="w-25 h-25 hover:cursor-pointer mr-auto"
                    onClick={() => navigate("/")}
                    role="button"
                />

                {/* Filter and Sort Controls */}
                <div className="mt-8 space-y-4">
                    <div>
                        <label className="block  mb-2">Filter by Admin Type</label>
                        <select
                            value={adminFilter}
                            onChange={(e) => setAdminFilter(e.target.value)}
                            className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
                        >
                            <option value="all">All Admins</option>
                            <option value="user_admin">User Admin</option>
                            <option value="appointment_admin">Appointment Admin</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block  mb-2">Sort Order</label>
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

            {/* right side */}
            <div className="w-3/4 bg-sky-200 rounded-lg m-1 p-2">
                <div className="space-y-4">
                    {error && (
                        <div className="text-red-500 bg-red-100 p-2 rounded text-center">
                            {error}
                        </div>
                    )}

                    {filteredAndSortedLogs.length > 0 ? (
                        filteredAndSortedLogs.map((log) => (
                            <div
                                key={log.log_id}
                                className="bg-sky-700 rounded-lg p-3 hover:bg-sky-800 transition-colors text-white flex"
                            >

                                <div className="">
                                    <p className="font-semibold text-xl">Admin {log.admin.username}</p>
                                    <div>
                                        <p>
                                            {log.admin.first_name}{" "}
                                            {log.admin.last_name}
                                        </p>
                                        <p className="text-xs">
                                            {log.admin.user_type}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl">Action</p>
                                    <p>{log.action}</p>
                                </div>
                                <div>
                                    <p className="text-xl">Date</p>
                                    <p>{formatDateTime(log.created_at)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-white text-center py-8">
                            <p>No logs found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
