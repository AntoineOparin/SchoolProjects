import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios"; // Use our custom axios instance
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

const Appointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState();
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const [canViewDetails, setViewDetails] = useState(false);
  const [error, setError] = useState("");
  const [hasReport, setHasReport] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/appointment/${id}` } });
      return;
    }

    const fetchAppointment = async () => {
      try {
        const response = await axios.get(`/appointments/${id}`);
        const appointmentData = response.data;

        // Only members can view appointment details
        if (!appointmentData.client?.user_id) {
          navigate("/", { state: { from: `/appointment/${id}` } });
          return;
        }

        setAppointment(appointmentData);

        // Check if user has permission to view details
        if (
          ["super_admin", "user_admin"].includes(user.user_type) ||
          user?.user_id === appointmentData.client?.user_id ||
          user?.user_id === appointmentData.professional?.user_id
        ) {
          setViewDetails(true);
        }

        // Check if appointment has a report
        try {
          const reportResponse = await axios.get(
            `/reports/appointments/${id}/report`
          );
          setHasReport(reportResponse.data.report !== null);
        } catch (error) {
          console.error("Error checking report:", error);
          setHasReport(false);
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        if (error.response?.status === 401) {
          navigate("/login", { state: { from: `/appointment/${id}` } });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id, isAuthenticated, navigate, setViewDetails, user]);

  const handleCancelAppointment = async () => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await axios.put(`/appointments/${id}`, {
          status: "Cancelled",
        });
        if (["appointment_admin", "super_admin"].includes(user.user_type)) {
          //log the admin's action
          await axios.post("/admin/manage-logs", {
            user_id: `${user.user_id}`,
            action: `Cancelled appointment ${id}`,
          });
        }
        // Refresh the appointment data
        window.location.reload();
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment. Please try again.");
      }
    }
  };

  const handleCreateReport = async (appointmentId) => {
    try {
      const response = await axios.post(
        `/reports/appointments/${appointmentId}/report`,
        {
          status: "Pending",
          date: new Date().toISOString().split("T")[0],
          professional_feedback: "",
          client_feedback: "",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        // Redirect to the report view page
        navigate(`/reports/appointments/${appointmentId}/report`);
      }
    } catch (error) {
      console.error("Error creating report:", error);
      setError(error.response?.data?.error || "Failed to create report");
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/reports/${reportId}`);
  };

  return (
    <div className="bg-sky-800 min-h-screen p-1">
      <div className="max-w-4xl mx-auto bg-sky-200 rounded-lg p-6">
        {loading ? (
          <Spinner />
        ) : appointment ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-sky-950 mb-2">
                  {appointment.service?.name || "Appointment Details"}
                </h1>
                <p className="text-sky-950">
                  Scheduled:{" "}
                  {new Date(appointment.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
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

            <div className="grid md:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="bg-sky-700 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Client Information
                </h2>
                {appointment.client && (
                  <div className="space-y-2 text-gray-200">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {appointment.client.first_name}{" "}
                      {appointment.client.last_name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {appointment.client.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {appointment.client.phone_number}
                    </p>
                    {appointment.client.address && (
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {appointment.client.address}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="bg-sky-700 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-white mb-3">
                  Professional Information
                </h2>
                {appointment.professional && (
                  <div className="space-y-2 text-gray-200">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {appointment.professional.first_name}{" "}
                      {appointment.professional.last_name}
                    </p>
                    <p>
                      <span className="font-medium">Specialty:</span>{" "}
                      {appointment.professional.specialty}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {appointment.professional.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {appointment.professional.phone_number}
                    </p>
                    <p>
                      <span className="font-medium">Hourly Rate:</span> $
                      {appointment.professional.hourly_rate}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service and Appointment Details */}
            <div className="bg-sky-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-white mb-3">
                Appointment Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-gray-200">
                <div>
                  <p>
                    <span className="font-medium">Service:</span>{" "}
                    {appointment.service?.name}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {appointment.service?.description}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{" "}
                    {appointment.service?.duration} minutes
                  </p>
                  <p>
                    <span className="font-medium">Cost:</span> $
                    {appointment.cost}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {appointment.location}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(appointment.start_time).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {new Date(appointment.start_time).toLocaleTimeString()} -{" "}
                    {new Date(appointment.stop_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              {/* Add any additional buttons or actions here */}
              {canViewDetails && (
                <div>
                  {/*Cancel appointment button*/}
                  <button
                    onClick={handleCancelAppointment}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer mr-2"
                  >
                    Cancel Appointment
                  </button>
                  <button
                    onClick={() => navigate(`/appointments/edit/${id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Edit Appointment
                  </button>
                </div>
              )}
              {/* REPORT BUTTONS HERE */}
              {hasReport ? (
                <button
                  onClick={() => navigate(`/reports/appointments/${id}/report`)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                  View Report
                </button>
              ) : (
                <button
                  onClick={() => handleCreateReport(appointment.appointment_id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                  Create Report
                </button>
              )}

              <button
                onClick={() => navigate("/appointments")}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
              >
                Back to Appointments
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-white">
            <p>Appointment not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
