import React from "react";
import Logo from "../components/Logo.jsx";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner.jsx";

export default function AppointmentComponent(appt) {
  const navigate = useNavigate();
  let appointment = appt.appointment
  return (
    <div
      className="bg-[#57747C] rounded-lg p-4 hover:bg-[#4A636B] transition-colors cursor-pointer"
      key={appointment.appointment_id}
      onClick={() =>
        navigate(`/appointment/${appointment.appointment_id}`)
      }
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {appointment.service?.name ||
              "Service Name Not Available"}
              {console.log(appointment.service.name)}
          </h3>
          <p className="text-gray-200">
            {new Date(appointment.start_time).toLocaleString()} -{" "}
            {console.log(appointment)}
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
          {console.log(appointment.status)}
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
    
  );
}