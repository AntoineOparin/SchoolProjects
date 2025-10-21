import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import Spinner from "../components/Spinner";

export default function AppointmentEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    professional_id: "",
    service_id: "",
    location: "",
    start_time: "",
    client_id: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchAppointmentData = async () => {
      try {
        const appointmentResponse = await axios.get(`/appointments/${id}`);
        const appointment = appointmentResponse.data;

        // Format the date-time for the input
        const startTime = new Date(appointment.start_time)
          .toISOString()
          .slice(0, 16);

        setFormData({
          professional_id: appointment.professional?.user_id.toString(),
          service_id: appointment.service?.service_id.toString(),
          location: appointment.location,
          start_time: startTime,
          client_id: appointment.client?.user_id.toString(),
        });

        // Fetch services
        const serviceResponse = await axios.get("/api/services");
        setServices(serviceResponse.data);

        // Check if user is authorized to edit this appointment
        // Can also be an admin
        if (
          user.user_id !== appointment.client?.user_id &&
          !["super_admin", "appointment_admin"].includes(user.user_type)
        ) {
          navigate("/appointments");
          return;
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
        setError("Failed to load appointment details");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentData();
  }, [id, isAuthenticated, navigate, user]);

  const fetchAvailableProfessionals = async () => {
    if (!formData.start_time || !formData.service_id || !formData.location) {
      return;
    }

    try {
      const response = await axios.get(
        "/appointments/available-professionals",
        {
          params: {
            start_time: formData.start_time,
            service_id: formData.service_id,
            location: formData.location,
          },
        }
      );
      setProfessionals(response.data);
      if (response.data.length === 0) {
        setError(
          "No professionals available at this time. Please try another time slot."
        );
      }
    } catch (error) {
      console.error("Error fetching available professionals:", error);
      setError("Failed to check professional availability");
    }
  };

  useEffect(() => {
    // Fetch available professionals whenever date, service, or location changes
    fetchAvailableProfessionals();
  }, [formData.start_time, formData.service_id, formData.location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Reset professional selection when changing time/service/location
      ...(name !== "professional_id" && { professional_id: "" }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const selectedService = services.find(
        (service) => service.service_id === parseInt(formData.service_id)
      );

      // Calculate stop time based on service duration
      const startTime = new Date(formData.start_time);
      const stopTime = new Date(
        startTime.getTime() + (selectedService?.duration || 60) * 60000
      );

      const appointmentData = {
        ...formData,
        stop_time: stopTime.toISOString(),
        cost: selectedService?.cost || 0,
        service_id: parseInt(formData.service_id),
        professional_id: parseInt(formData.professional_id),
        client_id: parseInt(formData.client_id),
      };

      console.log("Sending appointment data:", appointmentData); // Debug log
      await axios.put(`/appointments/${id}`, appointmentData);
      if (["appointment_admin", "super_admin"].includes(user.user_type)) {
        //log the admin's action
        await axios.post("/admin/manage-logs", {
          user_id: `${user.user_id}`,
          action: `Edited appointment ${id}`,
        });
      }
      toast.success("Appointment updated successfully!");
      navigate(`/appointment/${id}`);
    } catch (error) {
      console.error("Error details:", error.response?.data); // Debug log
      const errorMessage =
        error.response?.data?.error || "Failed to update appointment";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex min-h-screen bg-sky-700 p-1 justify-center">
      <div className="w-3/4 bg-sky-200 rounded-lg m-1 p-2">
        <div className="text-2xl font-bold text-sky-950 m-4 text-center">
          Edit Appointment
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <label className="block text-sky-950 mb-2">
                Appointment Time
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full p-2 rounded bg-sky-700"
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <label className="block text-sky-950 mb-2">Service</label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                className="w-full p-2 rounded bg-sky-700"
                required
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.name} - ${service.cost} ({service.duration} min)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sky-950 mb-2">Location</label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 rounded bg-sky-700"
                required
              >
                <option value="Lachine">Lachine</option>
                <option value="LaSalle">LaSalle</option>
                <option value="Dorval">Dorval</option>
              </select>
            </div>

            <div>
              <label className="block text-sky-950 mb-2">Professional</label>
              <select
                name="professional_id"
                value={formData.professional_id}
                onChange={handleChange}
                className="w-full p-2 rounded bg-sky-700"
                required
                disabled={
                  !formData.start_time ||
                  !formData.service_id ||
                  !formData.location
                }
              >
                <option value="">
                  {!formData.start_time ||
                  !formData.service_id ||
                  !formData.location
                    ? "Please select time, service, and location first"
                    : professionals.length === 0
                    ? "No professionals available"
                    : "Select Professional"}
                </option>
                {professionals.map((professional) => (
                  <option
                    key={professional.user_id}
                    value={professional.user_id}
                  >
                    {professional.first_name} {professional.last_name} -{" "}
                    {professional.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 bg-red-100 p-2 rounded text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/appointment/${id}`)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
