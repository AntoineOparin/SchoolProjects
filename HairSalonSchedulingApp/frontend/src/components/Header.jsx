import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, userType, user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className={`${
        isScrolled ? "shadow-md bg-sky-950/80" : "shadow-none"
      } sticky top-0 z-50 flex flex-col justify-between items-stretch py-0.1 bg-sky-950 backdrop-blur-xs transition-all duration-300 pr-2`}
    >
      <div className="flex items-center">
        <Logo
          className="h-auto hover:cursor-pointer"
          onClick={() => navigate("/")}
          role="button"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between w-full px-4 py-1 rounded-2xl mt-4">
            {/*First Nav Bar */}
            <div className="bg-orange-300 rounded-2xl p-1">
              {/* Nav Links */}
              <nav className="flex items-center gap-2 text-sm text-gray-900 m-1">
                <p
                  className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                  onClick={() => navigate("/")}
                >
                  Home
                </p>
                <p
                  className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                  onClick={() => navigate("/appointments")}
                >
                  List Appointments
                </p>
                <p
                  className="cursor-pointer hovers:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                  onClick={() => navigate("/about")}
                >
                  About
                </p>
                <p
                  className="cursor-pointer hovers:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                  onClick={() => navigate("/api-docs")}
                >
                  API
                </p>
              </nav>
            </div>
            {/* Second Nav Bar */}
            {isAuthenticated && (
              <div className="bg-orange-300 rounded-2xl p-1">
                <nav className="flex items-center gap-2 text-sm text-gray-900 m-1">
                  <p
                    className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                    onClick={() => navigate("/appointments/create")}
                  >
                    Create Appointment
                  </p>
                  <p
                    className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                    onClick={() => navigate(`/reports`)}
                  >
                    My Reports
                  </p>
                  <p
                    className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                    onClick={() => navigate("/appointments/user")}
                  >
                    My Appointments
                  </p>
                </nav>
              </div>
            )}

            {/* Admin Navigation Bar */}
            {isAuthenticated &&
              userType != "client" &&
              userType != "professional" && (
                <div className="bg-orange-300 rounded-2xl p-1">
                  <nav className="flex items-center gap-2 text-sm text-gray-900 m-1">
                    {["super_admin", "appointment_admin"].includes(
                      userType
                    ) && (
                      <>
                        <p
                          className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                          onClick={() => navigate("/manage-appointments")}
                        >
                          Manage Appointments
                        </p>
                        <p
                          className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                          onClick={() => navigate("/manage-reports")}
                        >
                          Manage Reports
                        </p>
                      </>
                    )}
                    {["super_admin", "user_admin"].includes(userType) && (
                      <p
                        className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                        onClick={() => navigate("/manage-users")}
                      >
                        Manage Users
                      </p>
                    )}
                    {["super_admin"].includes(userType) && (
                      <p
                        className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                        onClick={() => navigate("/manage-logs")}
                      >
                        Manage Logs
                      </p>
                    )}
                  </nav>
                </div>
              )}

            {/* Third Nav Bar */}
            <div className="bg-orange-300 rounded-2xl p-1">
              <nav className="flex items-center gap-2 text-sm text-gray-900 m-1">
                {isAuthenticated ? (
                  <>
                    {" "}
                    <div
                      className="cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-110"
                      onClick={() => navigate("/profile")}
                    >
                      <img
                        src={`${
                          import.meta.env.VITE_API_URL
                        }/static/profile_pictures/${user?.profile_picture}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full border-2 border-orange-950 object-cover"
                        onError={(e) => {
                          e.target.src = `${
                            import.meta.env.VITE_API_URL
                          }/static/profile_pictures/default_pfp.jpg`;
                        }}
                      />
                    </div>
                    <p
                      className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                      onClick={handleLogout}
                    >
                      Logout
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </p>
                    <p
                      className="cursor-pointer hover:text-black bg-orange-400 rounded-lg py-1.5 px-2 border border-orange-950 transform transition-all duration-300 ease-in-out hover:scale-110"
                      onClick={() => navigate("/register")}
                    >
                      Register
                    </p>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* User type display */}
      <div className="flex justify-end mr-4 mb-2">
        {isAuthenticated && userType && (
          <p
            onClick={() => navigate("/profile")}
            className={`text-white text-xs font-semibold mt-1 p-1 rounded-lg cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-105 ${
              user.access_level === 0
                ? "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800"
                : userType === "super_admin"
                ? "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800"
                : userType === "appointment_admin"
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800"
                : userType === "user_admin"
                ? "bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800"
                : userType === "professional"
                ? "bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800"
                : "bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-700 hover:to-gray-800"
            }`}
          >
            {`${user.username}[${userType}]`}
          </p>
        )}
      </div>
    </div>
  );
};

export default Header;
