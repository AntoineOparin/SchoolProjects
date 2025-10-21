import React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import Logo from "../components/Logo.jsx";
import Spinner from "../components/Spinner.jsx";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/auth/login", formData);
      if (response.data.access_token) {
        await login(response.data.access_token, response.data.refresh_token);
        toast.success("Successfully logged in!");
        navigate("/profile");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
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
    <div className="flex min-h-screen bg-sky-800 p-1 justify-center">
      {/* right side */}
      <div className="w-3/4 bg-sky-200 rounded-lg m-1 p-2">
        <div className="text-xl font-bold text-sky-950 m-4 text-center mb-8">Account Login</div>
        <form onSubmit={handleSubmit} className="h-full space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="p-2 rounded bg-sky-950 placeholder:text-white text-white"
              required
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
            {loading ? "Logging in..." : "Login"}
          </button>
          <p className="text-center text-sky-950">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-400 hover:text-blue-500 cursor-pointer"
            >
              Register here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
