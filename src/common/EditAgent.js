import React, { useState, useEffect, useContext } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AuthContext } from "../context/AuthContext";

const EditFieldAgentModal = ({
  getEmployee,
  setShowEditModal,
  handleEditSubmit,
}) => {
  const { user } = useContext(AuthContext);
  const [roleData, setRoleData] = useState([]);
  // Validation Schema using Yup
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Agent Name is required")
      .min(3, "Name should be at least 3 characters"),
    fieldAgentEmail: Yup.string()
      .required("Email is required")
      .email("Invalid email address"),
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
    status: Yup.string()
      .required("Status is required")
      .min(2, "Status should be at least 2 characters"),
    isActive: Yup.string().required("Status is required"),
    nickName: Yup.string()
      .required("nickName is required")
      .min(5, "nickName should be at least 5 characters"),
    role: Yup.string().required("Role is required"),
  });

  useEffect(() => {
    handleRoleData();
  }, [user]);

  const handleRoleData = async () => {
    try {
      const resp = await fetch(
        "https://uat-tracking.rmtec.in:4000/api/role/getRoles",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!resp.ok) {
        throw new Error(`Error fetching roles: ${resp.status}`);
      }

      const result = await resp.json();
      console.log("Roles fetched successfully:", result);

      // Assuming the API returns an array of roles
      if (result) {
        setRoleData(result.data);
      } else {
        console.error("Unexpected data format:", result);
      }
    } catch (error) {
      console.error("Error fetching roles:", error.message);
    }
  };

  // Formik hook to manage form state and validation
  const formik = useFormik({
    initialValues: {
      fieldAgentId: getEmployee?.fieldAgentId,
      name: getEmployee?.name || "",
      fieldAgentEmail: getEmployee?.fieldAgentEmail || "",
      mobile: getEmployee?.mobile || "",
      status: getEmployee?.status || "",
      isActive: getEmployee?.isActive || "Inactive",
      nickName: getEmployee?.nickName || "",
      role: getEmployee?.role ? getEmployee.role.roleId : "", // Check if role exists before accessing role.role
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      handleEditSubmit(values);
    },
  });

  return (
    <div
    className="modal fade show"
    style={{ display: "block" }}
    tabIndex="-1"
    role="dialog"
  >
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <form onSubmit={formik.handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Edit Field Agent</h5>
            <button
              type="button"
              className="close new"
              onClick={() => setShowEditModal(false)}
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Agent Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter agent's name"
                      {...formik.getFieldProps("name")}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-danger">{formik.errors.name}</p>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Field Agent Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter email"
                      {...formik.getFieldProps("fieldAgentEmail")}
                    />
                    {formik.touched.fieldAgentEmail &&
                      formik.errors.fieldAgentEmail && (
                        <p className="text-danger">
                          {formik.errors.fieldAgentEmail}
                        </p>
                      )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Mobile</label>
                    <input
                      type="text"
                      maxLength={10}
                      className="form-control"
                      placeholder="Enter mobile number"
                      {...formik.getFieldProps("mobile")}
                    />
                    {formik.touched.mobile && formik.errors.mobile && (
                      <p className="text-danger">{formik.errors.mobile}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>NickName</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter nickName"
                      {...formik.getFieldProps("nickName")}
                    />
                    {formik.touched.nickName && formik.errors.nickName && (
                      <p className="text-danger">{formik.errors.nickName}</p>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      {...formik.getFieldProps("status")}
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                    </select>
                    {formik.touched.status && formik.errors.status && (
                      <p className="text-danger">{formik.errors.status}</p>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Is Active</label>
                    <select
                      className="form-control"
                      {...formik.getFieldProps("isActive")}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {formik.touched.isActive && formik.errors.isActive && (
                      <p className="text-danger">{formik.errors.isActive}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      className="form-control"
                      {...formik.getFieldProps("role")}
                    >
                      {roleData.map((role) => (
                        <option key={role.roleId} value={role.roleId}>
                          {role.role}
                        </option>
                      ))}
                    </select>
                    {formik.touched.role && formik.errors.role && (
                      <p className="text-danger">{formik.errors.role}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowEditModal(false)}
            >
              Close
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm fieldadd-btn"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  );
};

export default EditFieldAgentModal;
