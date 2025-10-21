import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import Logo from "../components/Logo.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext";

// Validation function
const validatePhoneNumber = (phone) => {
  // Strict format: 123-456-7890
  const re = /^\d{3}-\d{3}-\d{4}$/;
  return re.test(phone);
};

export default function Register() {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    address: "",
    user_type: "client",
    specialty: "",
    hourly_rate: 0,
    description: "",
    profile_picture: "",
  });

  // Check if user is admin
  const isAdmin =
    user?.user_type === "user_admin" || user?.user_type === "super_admin";

  useEffect(() => {
    // Only redirect if user is authenticated but not an admin
    if (isAuthenticated && !isAdmin) {
      navigate("/profile");
    }
  }, [isAdmin, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Real-time phone validation
    if (name === "phone_number") {
      if (value && !validatePhoneNumber(value)) {
        setPhoneError("Phone number must be in format: 123-456-7890");
      } else {
        setPhoneError("");
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate phone number if provided
    if (formData.phone_number && !validatePhoneNumber(formData.phone_number)) {
      setError("Phone number must be in format: 123-456-7890");
      setLoading(false);
      return;
    }

    try {
      const registerResponse = await axios.post("/auth/register", formData);

      if (isAdmin) {
        // If admin created the user, show success and stay on page
        toast.success("User created successfully!");
        // Reset form
        setFormData({
          username: "",
          email: "",
          first_name: "",
          last_name: "",
          password: "",
          confirm_password: "",
          phone_number: "",
          address: "",
          user_type: "client",
          specialty: "",
          hourly_rate: 0,
          description: "",
          profile_picture: "",
        });
      } else {
        // If self-registration, log in and redirect to profile
        if (registerResponse.data.access_token) {
          await login(
            registerResponse.data.access_token,
            registerResponse.data.refresh_token
          );
          toast.success("Registration successful!");
          navigate("/profile");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex min-h-screen justify-center bg-sky-800 p-1">
      {/* right side */}
      <div className="w-3/4 min-h-screen bg-sky-200 rounded-lg m-1 p-2">
        <div className="text-xl font-bold text-sky-950 m-4 text-center mb-8">Register new account</div>
        <form onSubmit={handleSubmit} className="h-full space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
              required
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
              required
            />
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
            />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
              required
            />
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
              required
            />
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Phone Number (123-456-7890)"
              className={"p-2 rounded  bg-sky-950 placeholder:text-white w-full text-white"}
            />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
            />
            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="p-2 rounded  bg-sky-950 text-white"
              required
            >
              <option value="client">Client</option>
              <option value="professional">Professional</option>
              {isAdmin && (
                <>
                  <option value="user_admin">User Admin</option>
                  {user?.user_type === "super_admin" && (
                    <>
                      <option value="appointment_admin">
                        Appointment Admin
                      </option>
                      <option value="super_admin">Super Admin</option>
                    </>
                  )}
                </>
              )}
            </select>
            {formData.user_type === "professional" && (
              <>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="Specialty"
                  className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
                />
                <input
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  placeholder="Hourly Rate"
                  className="p-2 rounded  bg-sky-950 placeholder:text-white text-white"
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="p-2 rounded col-span-2  bg-sky-950 placeholder:text-white text-white"
                />
              </>
            )}
          </div>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-4">
              <p className="font-medium">{error}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating..." : isAdmin ? "Create User" : "Register"}
          </button>
          {!isAdmin && (
            <p className="text-center text-sky-950">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-blue-400 hover:text-blue-500 cursor-pointer"
              >
                Login here
              </span>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
