import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "../utils/axios";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const ReportView = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [state, setState] = useState({
    report: null,
    appointment: null,
    formData: {
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
      professional_feedback: "",
      client_feedback: "",
    },
    loading: true,
    isEditing: false,
    submitting: false,
    error: null,
    errors: {},
    permissions: null,
    userRole: null,
  });

  const canEditReport = () => {
    return state.permissions?.can_edit || false;
  };

  const canDeleteReport = () => {
    return state.permissions?.can_delete || false;
  };

  const canAddClientFeedback = () => {
    return state.permissions?.can_add_client_feedback || false;
  };

  const canAddProfessionalFeedback = () => {
    return state.permissions?.can_add_professional_feedback || false;
  };

  const validateForm = () => {
    const errors = {};
    if (
      canAddProfessionalFeedback() &&
      !state.formData.professional_feedback.trim()
    ) {
      errors.professional_feedback = "Professional feedback is required";
    }
    if (canAddClientFeedback() && !state.formData.client_feedback.trim()) {
      errors.client_feedback = "Your feedback is required";
    }
    return errors;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    const fetchData = async () => {
      try {
        // First get the appointment
        const appointmentRes = await axios.get(
          `/appointments/${appointmentId}`
        );
        const appointment = appointmentRes.data;
        if (!appointment) {
          throw new Error("Appointment not found");
        }
        setState((prev) => ({ ...prev, appointment }));

        // Then try to get the report
        try {
          const reportRes = await axios.get(
            `/reports/appointments/${appointmentId}/report`
          );
          setState((prev) => ({
            ...prev,
            report: reportRes.data.report,
            permissions: reportRes.data.permissions,
            userRole: reportRes.data.user_role,
            formData: reportRes.data.report
              ? {
                  status: reportRes.data.report.status,
                  date: reportRes.data.report.date,
                  professional_feedback:
                    reportRes.data.report.professional_feedback,
                  client_feedback: reportRes.data.report.client_feedback || "",
                }
              : prev.formData,
            loading: false,
          }));
        } catch (error) {
          if (error.response?.status === 403) {
            navigate("/unauthorized");
          } else {
            throw error;
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.error || "Failed to load report data",
          loading: false,
        }));
      }
    };
    fetchData();
  }, [appointmentId, isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [name]: value },
      errors: { ...prev.errors, [name]: null },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }));
      return;
    }
    setState((prev) => ({ ...prev, submitting: true, error: null }));
    try {
      const payload = {
        status: state.formData.status,
        date: state.formData.date,
        professional_feedback: state.formData.professional_feedback,
        client_feedback: state.formData.client_feedback,
      };
      let response;
      if (!state.report) {
        response = await axios.post(
          `/reports/appointments/${appointmentId}/report`,
          payload
        );
        toast.success("Report created successfully!");
      } else {
        response = await axios.put(
          `/reports/appointments/${appointmentId}/report`,
          payload
        );
        toast.success("Report updated successfully!");
      }
      // Refresh the data
      const reportRes = await axios.get(
        `/reports/appointments/${appointmentId}/report`
      );
      setState((prev) => ({
        ...prev,
        report: reportRes.data.report,
        isEditing: false,
        formData: {
          status: reportRes.data.report.status,
          date: reportRes.data.report.date,
          professional_feedback: reportRes.data.report.professional_feedback,
          client_feedback: reportRes.data.report.client_feedback || "",
        },
        submitting: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error.response?.data?.error ||
          "Failed to save report. Please try again.",
        submitting: false,
      }));
      toast.error(error.response?.data?.error || "Failed to save report");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await axios.delete(`/reports/${state.report.report_id}`);
        toast.success("Report deleted successfully!");
        navigate(`/manage-reports`);
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.response?.data?.error || "Failed to delete report",
        }));
        toast.error(error.response?.data?.error || "Failed to delete report");
      }
    }
  };

  if (!isAuthenticated || state.loading) return <Spinner />;

  return (
    <div className="bg-sky-800 min-h-screen p-1">
      <div className="max-w-4xl mx-auto bg-sky-200 rounded-lg p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-sky-950 mb-2">
              {state.report ? "Appointment Report" : "Create Report"}
            </h1>
            {state.report && !state.isEditing && (
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  state.report.status === "Completed"
                    ? "bg-green-500"
                    : state.report.status === "Pending"
                    ? "bg-yellow-500"
                    : state.report.status === "Cancelled"
                    ? "bg-red-500"
                    : "bg-gray-500"
                } text-white`}
              >
                {state.report.status}
              </span>
            )}
          </div>

          {state.error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              {state.error}
            </div>
          )}

          {state.isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {state.userRole?.is_admin && (
                <div>
                  <label className="block text-sky-950 mb-1">Status</label>
                  <select
                    name="status"
                    value={state.formData.status}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-sky-300"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sky-950 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={state.formData.date}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-white border border-sky-300"
                  disabled={!state.userRole?.is_admin}
                />
              </div>

              {state.userRole?.is_professional && (
                <div>
                  <label className="block text-sky-950 mb-1">
                    Professional Feedback*
                  </label>
                  <textarea
                    name="professional_feedback"
                    value={state.formData.professional_feedback}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-sky-300 h-32"
                    required={canAddProfessionalFeedback()}
                  />
                  {state.errors.professional_feedback && (
                    <p className="text-red-500 text-sm">
                      {state.errors.professional_feedback}
                    </p>
                  )}
                </div>
              )}

              {state.userRole?.is_client && (
                <div>
                  <label className="block text-sky-950 mb-1">
                    Your Feedback*
                  </label>
                  <textarea
                    name="client_feedback"
                    value={state.formData.client_feedback}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-white border border-sky-300 h-32"
                    required={canAddClientFeedback()}
                  />
                  {state.errors.client_feedback && (
                    <p className="text-red-500 text-sm">
                      {state.errors.client_feedback}
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, isEditing: false }))
                  }
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {state.submitting ? "Saving..." : "Save Report"}
                </button>
              </div>
            </form>
          ) : state.report ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sky-950 font-medium">Status</p>
                  <p className="text-sky-700">{state.report.status}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sky-950 font-medium">Date</p>
                  <p className="text-sky-700">
                    {new Date(state.report.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sky-950 font-medium">
                  Professional Feedback
                </p>
                <p className="text-sky-700 whitespace-pre-wrap break-words max-w-full">
                  {state.report.professional_feedback ||
                    "No professional feedback provided yet."}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sky-950 font-medium">Client Feedback</p>
                <p className="text-sky-700 whitespace-pre-wrap break-words max-w-full">
                  {state.report.client_feedback ||
                    "No client feedback provided yet."}
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => navigate(`/appointment/${appointmentId}`)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
                >
                  Back to Appointment
                </button>
                {(canEditReport() ||
                  canAddClientFeedback() ||
                  canAddProfessionalFeedback()) && (
                  <button
                    onClick={() =>
                      setState((prev) => ({ ...prev, isEditing: true }))
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                  >
                    Modify Report
                  </button>
                )}
                {canDeleteReport() && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                  >
                    Delete Report
                  </button>
                )}
                {canDeleteReport() ? (
                  <button
                    onClick={() => navigate(`/manage-reports`)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Back to Reports
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/reports`)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
                  >
                    Back to Reports
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sky-950">
                No report exists for this appointment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
