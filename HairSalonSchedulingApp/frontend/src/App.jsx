import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Layout from "./components/Layout.jsx";
import About from "./pages/About.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Appointments from "./pages/Appointments.jsx";
import Appointment from "./pages/Appointment.jsx";
import Profile from "./pages/Profile.jsx";
import AppointmentCreate from "./pages/AppointmentCreate.jsx";
import AppointmentUser from "./pages/AppointmentUser.jsx";
import AppointmentEdit from "./pages/AppointmentEdit.jsx";
import ManageUsers from "./pages/ManageUsers.jsx";
import ManageAppointments from "./pages/ManageAppointments.jsx";
import ApiDocumentation from "./pages/ApiDocumentation.jsx";
import UserDetails from "./pages/UserDetails.jsx";
import ReportView from "./pages/ReportView.jsx";
import UserReportsList from "./pages/UserReportsList.jsx";
import ManageReports from "./pages/ManageReports.jsx";
import ManageLogs from "./pages/ManageLogs.jsx";

function App() {
  return (
    <AuthProvider>
      <div>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/appointments/user" element={<AppointmentUser />} />
            <Route
              path="/appointments/create"
              element={<AppointmentCreate />}
            />
            <Route
              path="/appointments/edit/:id"
              element={<AppointmentEdit />}
            />
            <Route path="/appointment/:id" element={<Appointment />} />
            <Route path="/api-docs" element={<ApiDocumentation />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/manage-logs" element={<ManageLogs />} />
            <Route
              path="/manage-appointments"
              element={<ManageAppointments />}
            />
            <Route path="/manage-reports" element={<ManageReports />} />
            <Route path="/user/:id" element={<UserDetails />} />
            <Route path="*" element={<PageNotFound />} />
            <Route
              path="/reports/appointments/:appointmentId/report"
              element={<ReportView />}
            />
            <Route path="/reports" element={<UserReportsList />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
