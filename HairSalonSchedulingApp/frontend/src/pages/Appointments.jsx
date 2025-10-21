import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext";

export default function Appointments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [professionalFilter, setProfessionalFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("/appointments/");
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAndSortedAppointments = React.useMemo(() => {
    let result = [...appointments];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    // Apply location filter
    if (locationFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.location === locationFilter
      );
    }

    // Apply service filter
    if (serviceFilter !== "all") {
      result = result.filter(
        (appointment) =>
          appointment.service?.service_id === parseInt(serviceFilter)
      );
    }

    // Apply professional filter
    if (professionalFilter !== "all") {
      result = result.filter(
        (appointment) =>
          appointment.professional?.user_id === parseInt(professionalFilter)
      );
    }

    // Apply client filter
    if (clientFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.client?.user_id === parseInt(clientFilter)
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
    locationFilter,
    serviceFilter,
    professionalFilter,
    clientFilter,
    sortOrder,
    sortBy,
  ]);

  const resetFilters = () => {
    setStatusFilter("all");
    setServiceFilter("all");
    setLocationFilter("all");
    setProfessionalFilter("all");
    setClientFilter("all");
    setSortOrder("newest");
    setSortBy("date");
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen bg-sky-800 p-1">
        {/* left side */}
        <div className="w-1/4 bg-sky-200 rounded-lg m-1 p-2 text-sky-950">
          <div className="text-xl font-bold text-sky mb-4">Appointments</div>
          <Logo
            className="w-25 h-25 hover:cursor-pointer mr-auto"
            onClick={() => navigate("/")}
            role="button"
          />

          {/* Filter and Sort Controls */}
          <div className="mt-8 space-y-4">
            <div>
              <label className="block mb-2">Filter by Status</label>
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
              <label className="block text-sky-950 mb-2">Filter by Service</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
              >
                <option value="all">All Services</option>
                {[
                  ...new Set(
                    appointments.map((apt) => apt.service?.service_id)
                  ),
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
              <label className="block text-sky-950 mb-2">
                Filter by Location
              </label>
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

            {user?.user_type === "professional" && (
              <div>
                <label className="block text-sky-950 mb-2">
                  Filter by Client
                </label>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="w-full p-2 rounded bg-sky-950 text-white border border-gray-600"
                >
                  <option value="all">All Clients</option>
                  {[
                    ...new Set(appointments.map((apt) => apt.client?.user_id)),
                  ].map((clientId) => {
                    const client = appointments.find(
                      (apt) => apt.client?.user_id === clientId
                    )?.client;
                    return client ? (
                      <option key={clientId} value={clientId}>
                        {client.first_name} {client.last_name}
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sky-950 mb-2">
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
              <label className="block text-sky-950 mb-2">Sort By</label>
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
              <label className="block text-sky-950 mb-2">Sort Order</label>
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
            {filteredAndSortedAppointments.length > 0 ? (
              filteredAndSortedAppointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className="bg-sky-700 rounded-lg p-4 hover:bg-sky-800 transition-colors cursor-pointer"
                  onClick={() =>
                    navigate(`/appointment/${appointment.appointment_id}`)
                  }
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {appointment.service?.name ||
                          "Service Name Not Available"}
                      </h3>
                      <p className="text-gray-200">
                        {new Date(appointment.start_time).toLocaleString()} -{" "}
                        {new Date(appointment.stop_time).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        appointment.status === "Completed"
                          ? "bg-green-500"
                          : appointment.status === "Scheduled"
                          ? "bg-blue-500"
                          : appointment.status === "Cancelled"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      } text-white`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="text-gray-200">
                      <p className="font-semibold">Client</p>
                      {appointment.client ? (
                        <div>
                          <p>
                            {appointment.client.first_name}{" "}
                            {appointment.client.last_name}
                          </p>
                          <p className="text-sm">{appointment.client.email}</p>
                        </div>
                      ) : (
                        <p>No client information</p>
                      )}
                    </div>

                    <div className="text-gray-200">
                      <p className="font-semibold">Professional</p>
                      {appointment.professional ? (
                        <div>
                          <p>
                            {appointment.professional.first_name}{" "}
                            {appointment.professional.last_name}
                          </p>
                          <p className="text-sm">
                            {appointment.professional.specialty}
                          </p>
                        </div>
                      ) : (
                        <p>No professional information</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-gray-200">
                      <p className="font-semibold">Location</p>
                      <p>{appointment.location}</p>
                    </div>
                    <div className="text-gray-200">
                      <p className="font-semibold">Cost</p>
                      <p>${appointment.cost}</p>
                    </div>
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
    </div>
  );
}
