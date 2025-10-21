import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import Spinner from "../components/Spinner.jsx";

export default function ManageAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortBy, setSortBy] = useState("date");
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      if (!["super_admin", "appointment_admin"].includes(user.user_type)) {
        toast.error("You cannot manage appointments.");
        navigate("/profile");
      }
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get("/admin/manage-appointments");
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, navigate, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500";
      case "Scheduled":
        return "bg-blue-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

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

  const filteredAndSortedAppointments = React.useMemo(() => {
    let result = [...appointments];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    // Apply service filter
    if (serviceFilter !== "all") {
      result = result.filter(
        (appointment) =>
          appointment.service?.service_id === parseInt(serviceFilter)
      );
    }

    // Apply location filter
    if (locationFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.location === locationFilter
      );
    }

    // Apply professional filter
    if (professionalFilter !== "all") {
      result = result.filter(
        (appointment) =>
          appointment.professional?.user_id === parseInt(professionalFilter)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = new Date(a.start_time);
          const dateB = new Date(b.start_time);
          return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
        case "status":
          return sortOrder === "newest"
            ? b.status.localeCompare(a.status)
            : a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [
    appointments,
    statusFilter,
    serviceFilter,
    locationFilter,
    professionalFilter,
    sortOrder,
    sortBy,
  ]);

  const resetFilters = () => {
    setStatusFilter("all");
    setServiceFilter("all");
    setLocationFilter("all");
    setProfessionalFilter("all");
    setSortOrder("newest");
    setSortBy("date");
  };

  const handleDeleteAppointment = async (appointment_id) => {
    if (
      window.confirm(
        `Are you sure you want to delete appointment #${appointment_id}? This action cannot be undone.`
      )
    ) {
      try {
        await axios.post("/admin/manage-appointments", {
          appointment_id: `${appointment_id}`,
          action: "delete",
        });
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Deleted appointment ${appointment_id}`,
        });
        // Remove the deleted appointment from the state
        setAppointments(
          appointments.filter((apt) => apt.appointment_id !== appointment_id)
        );
        toast.success(
          `Appointment #${appointment_id} has been deleted successfully.`
        );
      } catch (error) {
        console.error("Error deleting appointment:", error);
        toast.error("Failed to delete appointment. Please try again.");
      }
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <Spinner />;

  return (
    <div className="flex min-h-screen bg-sky-800 p-1">
      {/* left side */}
      <div className="w-1/4 bg-sky-200 rounded-lg m-1 p-2 text-sky-950">
        <div className="text-xl font-bold mb-4">
          Manage Appointments
        </div>
        <Logo
          className="w-25 h-25 hover:cursor-pointer mr-auto"
          onClick={() => navigate("/")}
          role="button"
        />

        {/* Filter and Sort Controls */}
        <div className="mt-8 space-y-4">
          <div>
            <label className="block  mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block  mb-2">Filter by Service</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
            >
              <option value="all">All Services</option>
              {[
                ...new Set(appointments.map((apt) => apt.service?.service_id)),
              ].map((serviceId) => {
                const service = appointments.find(
                  (apt) => apt.service?.service_id === serviceId
                )?.service;
                return service ? (
                  <option key={serviceId} value={serviceId}>
                    {service.name}
                  </option>
                ) : null;
              })}
            </select>
          </div>

          <div>
            <label className="block  mb-2">Filter by Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
            >
              <option value="all">All Locations</option>
              <option value="Lachine">Lachine</option>
              <option value="LaSalle">LaSalle</option>
              <option value="Dorval">Dorval</option>
            </select>
          </div>

          <div>
            <label className="block  mb-2">
              Filter by Professional
            </label>
            <select
              value={professionalFilter}
              onChange={(e) => setProfessionalFilter(e.target.value)}
              className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
            >
              <option value="all">All Professionals</option>
              {[
                ...new Set(
                  appointments.map((apt) => apt.professional?.user_id)
                ),
              ].map((profId) => {
                const professional = appointments.find(
                  (apt) => apt.professional?.user_id === profId
                )?.professional;
                return professional ? (
                  <option key={profId} value={profId}>
                    {professional.first_name} {professional.last_name}
                  </option>
                ) : null;
              })}
            </select>
          </div>

          <div>
            <label className="block  mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
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

          {filteredAndSortedAppointments.length > 0 ? (
            filteredAndSortedAppointments.map((appointment) => (
              <div
                key={appointment.appointment_id}
                className="bg-sky-700 rounded-lg p-3 hover:bg-sky-800 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <div
                    className="flex-grow cursor-pointer"
                    onClick={() =>
                      navigate(`/appointment/${appointment.appointment_id}`)
                    }
                  >
                    <h3 className="text-base font-semibold text-white">
                      {appointment.service?.name ||
                        "Service Name Not Available"}
                    </h3>
                    <p className="text-sm text-gray-200">
                      {formatDateTime(appointment.start_time)} -{" "}
                      {formatDateTime(appointment.stop_time)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      appointment.status
                    )} text-white ml-2`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="text-gray-200 text-sm">
                    <p className="font-semibold">Client</p>
                    {appointment.client ? (
                      <div>
                        <p>
                          {appointment.client.first_name}{" "}
                          {appointment.client.last_name}
                        </p>
                        <p className="text-xs">{appointment.client.email}</p>
                      </div>
                    ) : (
                      <p>No client information</p>
                    )}
                  </div>

                  <div className="text-gray-200 text-sm">
                    <p className="font-semibold">Professional</p>
                    {appointment.professional ? (
                      <div>
                        <p>
                          {appointment.professional.first_name}{" "}
                          {appointment.professional.last_name}
                        </p>
                        <p className="text-xs">
                          {appointment.professional.specialty}
                        </p>
                      </div>
                    ) : (
                      <p>No professional information</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex justify-between items-center text-sm">
                  <div className="text-gray-200">
                    <span className="font-semibold">Location: </span>
                    {appointment.location}
                  </div>
                  <div className="text-gray-200">
                    <span className="font-semibold">Cost: </span>$
                    {appointment.cost}
                  </div>
                </div>

                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/appointments/edit/${appointment.appointment_id}`
                      )
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteAppointment(appointment.appointment_id)
                    }
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white text-center py-8">
              <p>No appointments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
