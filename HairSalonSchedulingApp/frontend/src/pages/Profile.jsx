import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo.jsx";
import Spinner from "../components/Spinner.jsx";

// Validation function
const validatePhoneNumber = (phone) => {
  // Strict format: 123-456-7890
  const re = /^\d{3}-\d{3}-\d{4}$/;
  return re.test(phone);
};

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    phone_number: "",
    specialty: "",
    description: "",
    hourly_rate: 0,
    password: "",
    confirm_password: "",
  });
  const [updateError, setUpdateError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      // Initialize form data with current user data
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        address: user.address || "",
        phone_number: user.phone_number || "",
        specialty: user.specialty || "",
        description: user.description || "",
        hourly_rate: user.hourly_rate || 0,
      });
    }
  }, [isAuthenticated, navigate, user]);

  if (!isAuthenticated) {
    return null;
  }

  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) {
      return;
    }
    setLoading(true);
    try {
      await axios.delete("/auth/profile");
      logout();
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to delete account");
      console.error("Error deleting account:", error);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size should be less than 5MB");
      return;
    }

    setSelectedFile(file);
    await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await axios.post(
        "/auth/upload-profile-picture",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.profile_picture) {
        toast.success("Profile picture updated successfully");
        window.location.reload();
      }
      setUploadError("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to upload profile picture";
      toast.error(errorMessage);
      setUploadError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Validate phone number if provided
      if (
        formData.phone_number &&
        !validatePhoneNumber(formData.phone_number)
      ) {
        throw new Error("Phone number must be in format: 123-456-7890");
      }

      // Validate passwords match if changing password
      if (
        formData.password &&
        formData.password !== formData.confirm_password
      ) {
        throw new Error("Passwords do not match");
      }

      const response = await axios.put("/auth/profile", formData);
      if (response.data.user) {
        toast.success("Profile updated successfully");
        window.location.reload();
        setIsEditing(false);
      }
    } catch (error) {
      const errorMessage =
        error.message ||
        error.response?.data?.error ||
        "Failed to update profile";
      toast.error(errorMessage);
      setUpdateError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      [name]: name === "hourly_rate" ? parseFloat(value) || 0 : value,
    }));
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex min-h-screen bg-sky-800 p-1 justify-center text-sky-950">
      <div className="w-3/4 bg-sky-200 rounded-lg m-1 p-2">
        <div className="space-y-4">
          <h2 className="flex justify-center text-2xl font-bold mb-4">
            Profile Information
          </h2>
          <div className="flex flex-col items-center mb-4">
            {user?.profile_picture && (
              <div className="flex flex-col items-center">
                {" "}
                <img
                  src={`${
                    import.meta.env.VITE_API_URL
                  }/static/profile_pictures/${user.profile_picture}`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4"
                  onError={(e) => {
                    e.target.src = `${
                      import.meta.env.VITE_API_URL
                    }/static/profile_pictures/default_pfp.jpg`;
                  }}
                />
                <button
                  onClick={() =>
                    document.getElementById("profile-picture-input").click()
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Change Profile Picture
                </button>
                {user.num_of_warns > 0 && (
                  <div className="mt-2 text-yellow-500 text-sm">
                    <div className="flex justify-center items-center font-medium">
                      <b className="text-md">{user.num_of_warns}</b>{" "}
                      <span className="ml-1 text-md">Warning(s)</span>
                    </div>
                    <div>
                      {user.num_of_warns >= 2
                        ? "One more warning will result in your account being blocked."
                        : "If you reach 3 warnings, your account will be blocked."}
                    </div>
                  </div>
                )}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="profile-picture-input"
              onChange={handleFileSelect}
            />
            {uploadError && (
              <p className="text-red-500 text-sm mt-2">{uploadError}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-sky-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Username</h3>
              <p>{user?.username}</p>
            </div>
            <div className="bg-sky-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Email</h3>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{user?.email}</p>
              )}
            </div>
            <div className="bg-sky-100 p-4 rounded">
              <h3 className="font-semibold mb-2">First Name</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{user?.first_name}</p>
              )}
            </div>
            <div className="bg-sky-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Last Name</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{user?.last_name}</p>
              )}
            </div>
            <div className="bg-sky-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Phone</h3>
              {isEditing ? (
                <div className="relative">
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="123-456-7890"
                    className={`w-full p-2 border rounded ${
                      phoneError ? "border-2 border-red-500" : ""
                    }`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm absolute -bottom-5 left-0">
                      {phoneError}
                    </p>
                  )}
                </div>
              ) : (
                <p>{user?.phone_number}</p>
              )}
            </div>
            <div className="bg-sky-100 p-4 rounded">
              <h3 className="font-semibold mb-2">Address</h3>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              ) : (
                <p>{user?.address}</p>
              )}
            </div>
            {user?.user_type === "professional" && (
              <>
                <div className="bg-sky-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Specialty</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  ) : (
                    <p>{user?.specialty}</p>
                  )}
                </div>
                <div className="bg-sky-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Hourly Rate</h3>
                  {isEditing ? (
                    <input
                      type="number"
                      name="hourly_rate"
                      value={formData.hourly_rate}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <p>${user?.hourly_rate}/hr</p>
                  )}
                </div>
                <div className="bg-sky-100 p-4 rounded col-span-2">
                  <h3 className="font-semibold mb-2">Description</h3>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                  ) : (
                    <p>{user?.description}</p>
                  )}
                </div>
              </>
            )}
            {isEditing && (
              <>
                <div className="bg-sky-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">New Password</h3>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div className="bg-sky-100 p-4 rounded">
                  <h3 className="font-semibold mb-2">Confirm New Password</h3>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}
            {updateError && (
              <div className="col-span-2 text-red-500 text-center">
                {updateError}
              </div>
            )}
            {/* Action buttons */}
            <div className="col-span-2 flex justify-end">
              {isEditing ? (
                <>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer mx-3"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
                    onClick={handleUpdateProfile}
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer mx-3"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
                    onClick={deleteAccount}
                  >
                    Delete Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
