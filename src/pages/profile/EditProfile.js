import React, { useState, useEffect } from "react";
import axios from "axios";

const EditProfileModal = ({ showProfileModal, toggleProfileModal, user }) => {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user ? user.name : "",
    mobile: user ? user.mobile : "",
  });

  // Reset messages when modal state changes
  useEffect(() => {
    if (!showProfileModal) {
      setSuccessMessage("");
      setErrorMessage("");
    }
  }, [showProfileModal]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // Validate input fields
  const validateForm = () => {
    if (!profileData.name || !profileData.mobile) {
      setErrorMessage("All fields are required.");
      return false;
    }
    if (!/^\d{10}$/.test(profileData.mobile)) {
      setErrorMessage("Mobile number must be a valid 10-digit number.");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await axios.put(
        `https://uat-tracking.rmtec.in/api/fieldAgent/updateFieldAgentDetails`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccessMessage("Edit Profile Updated successfully!");
      console.log("Updated Profile Data:", profileData);

      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload(); // Refresh the page
      }, 1000);
    } catch (error) {
      console.error("Error editing profile:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to edit profile."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showProfileModal && (
        <div className="modal show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Profile</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleProfileModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={profileData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mobile</label>
                    <input
                      type="text"
                      className="form-control"
                      name="mobile"
                      value={profileData.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
                        if (value.length <= 10) {
                          // Restrict to 10 digits
                          setProfileData({ ...profileData, mobile: value });
                        }
                      }}
                      maxLength="10" // Prevent more than 10 digits at the input level
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fieldAgentEmail"
                      value={user.fieldAgentEmail}
                      disabled
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary cancel-btn"
                      onClick={toggleProfileModal}
                      disabled={isLoading}
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary fieldadd-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                  {successMessage && (
                    <div className="alert alert-success mt-3">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="alert alert-danger mt-3">
                      {errorMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfileModal;