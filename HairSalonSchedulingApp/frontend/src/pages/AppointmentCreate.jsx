import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import Spinner from "../components/Spinner";

export default function AppointmentCreate() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    professional_id: "",
    service_id: "",
    location: "Lachine",
    start_time: new Date()
      .toLocaleString("sv-SE", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(" ", "T"),
    status: "Scheduled",
    client_id: user?.user_id || "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      client_id: user?.user_id,
    }));

    const fetchServices = async () => {
      try {
        const serviceResponse = await axios.get("/api/services");
        setServices(serviceResponse.data);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Failed to load services");
      }
    };

    fetchServices();
  }, [isAuthenticated, navigate, user]);

  const fetchAvailableProfessionals = async () => {
    if (!formData.start_time || !formData.service_id || !formData.location) {
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
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

      // Create a local date object and adjust for timezone offset
      const startTime = new Date(formData.start_time);
      const tzOffset = startTime.getTimezoneOffset() * 60000; // offset in milliseconds
      const localStartTime = new Date(startTime.getTime() - tzOffset);

      // Calculate stop time based on service duration
      const stopTime = new Date(
        localStartTime.getTime() + (selectedService?.duration || 60) * 60000
      );

      const appointmentData = {
        ...formData,
        start_time: localStartTime.toISOString().slice(0, 19),
        stop_time: stopTime.toISOString().slice(0, 19),
        cost: selectedService?.cost || 0,
        service_id: parseInt(formData.service_id),
        professional_id: parseInt(formData.professional_id),
        client_id: parseInt(formData.client_id),
      };

      const response = await axios.post(
        "/appointments/create",
        appointmentData
      );

      if (response.data.appointment) {
        toast.success("Appointment created successfully!");
        navigate("/appointments/user");
      } else {
        throw new Error("No appointment data in response");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to create appointment";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex justify-center min-h-screen bg-sky-800 p-1">
      <div className="bg-sky-200 rounded-lg m-1 p-5 text-sky-100">
        <div className="text-sky-950 text-xl font-bold mb-4">
          Create Appointment
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sky-950 block mb-2">Appointment Time</label>
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
              <label className="text-sky-950 block mb-2">Service</label>
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
              <label className="text-sky-950 block mb-2">Location</label>
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
              <label className="text-sky-950 block mb-2">Professional</label>
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
              onClick={() => navigate("/appointments")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
              disabled={loading || !formData.professional_id}
            >
              {loading ? "Creating..." : "Create Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
