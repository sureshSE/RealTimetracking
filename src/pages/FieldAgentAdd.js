import React from "react";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import adminLayout from "../hoc/adminLayout";
import "../assets/css/FieldAgentAdd.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import useUserHasPermission from "../utils/permission/userAccess";
import { AuthContext } from "../context/AuthContext";
import { useSnackbar } from "../context/SnackbarContext";

const schema = yup.object().shape({
  name: yup.string().required("Agent name is required"),
  fieldAgentEmail: yup
    .string()
    .email("Invalid email")
    .required("Email is required"),
  mobile: yup
    .string()
    .min(10)
    .matches(/^[0-9]+$/, "Mobile number must be a number")
    .required("Mobile number is required"),
  nick_name: yup.string().required("Nick name is required"),

  status: yup.string().required("Status is required"),
  isActive: yup
    .string()
    .oneOf(["1", "0"], "Select Active or Inactive")
    .required("Active status is required"),
  role: yup
    .string()
    .required("Role is required")
    .notOneOf([""], "Please select a valid role"),
});

const FieldAgentAdd = () => {
  const { user } = useContext(AuthContext);
  const [roleData, setRoleData] = useState([]);
  const { render } = useUserHasPermission({
    data: user?.privilege?.fieldAgents,
    moduleName: "fieldAgentAdd",
    userType: user?.role?.role,
  });

  useEffect(() => {
    handleRoleData();
  }, [user]);

  const handleRoleData = async () => {
    try {
      const resp = await fetch(
        "https://uat-tracking.rmtec.in/api/role/getRoles",
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
        const response = result.data.filter(
          (data) => data.role !== "SuperAdmin"
        );
        setRoleData(response);
      } else {
        console.error("Unexpected data format:", result);
      }
    } catch (error) {
      console.error("Error fetching roles:", error.message);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: roleData.length > 0 ? roleData[0]?.roleId : "",
    },
  });
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const onSubmit = (data) => {
    console.log("----onsubmit----data---------->", data);

    const payload = {
      name: data.name,
      fieldAgentEmail: data.fieldAgentEmail,
      mobile: data.mobile,
      nickName: data.nick_name,
      isActive: data.isActive,
      status: data.status,
      role: {
        roleId: `${data.role}`,
      },
      createdBy: user.fieldAgentId,
    };

    fetch("https://uat-tracking.rmtec.in/api/fieldAgent/createAgent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Error saving the agent");
        return response.json();
      })
      .then((result) => {
        console.log("Agent saved successfully:", result);
        showSnackbar("Field Agent added successfully", "success");
        reset();
        navigate("/field-agent/field-agent-list");
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        showSnackbar("Field Agent add failed", "error");
      });
  };

  useEffect(() => {
    if (roleData.length > 0) {
      reset({ role: roleData[0]?.roleId });
    }
  }, [roleData, reset]);

  console.log("---------roleData------->", roleData);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Create Agent - RealTimeTracking</title>
          <meta
            name="description"
            content="Overview of employee performance and metrics."
          />
          <meta name="keywords" content="dashboard, employee, management" />
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">Create Agent </h3>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="container fieldagentmange"
          >
            <span
              className="breadcrumb-allpage"
              style={{ borderBottom: "2px solid #0d6efd", display: "block" }}
            >
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/field-agent-management">
                      <i
                        className="fa fa-home"
                        style={{ marginRight: "5px" }}
                      ></i>
                      Field Agent Management
                    </a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    <i
                      className="fa fa-user-shield"
                      style={{ marginRight: "5px" }}
                    ></i>
                    Create Agent
                  </li>
                </ol>
              </nav>
            </span>
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Agent Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter agent's name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-danger">{errors.name.message}</p>
                )}
              </div>
              <div className="col-md-4">
                <label>Agent Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter email"
                  {...register("fieldAgentEmail")}
                />
                {errors.fieldAgentEmail && (
                  <p className="text-danger">
                    {errors.fieldAgentEmail.message}
                  </p>
                )}
              </div>
              <div className="col-md-4">
                <label>Agent Mobile</label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter mobile number"
                  {...register("mobile")}
                />
                {errors.mobile && (
                  <p className="text-danger">{errors.mobile.message}</p>
                )}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Nick Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter nick name"
                  {...register("nick_name")}
                />
                {errors.userName && (
                  <p className="text-danger">{errors.nick_name.message}</p>
                )}
              </div>
              <div className="col-md-4">
                <label>Role</label>
                <select className="form-control" {...register("role")}>
                  {roleData.map((role) => (
                    <option key={role.roleId} value={role.roleId}>
                      {role.role}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-danger">{errors.role.message}</p>
                )}
              </div>

              <div className="col-md-4">
                <label>Status</label>
                <select className="form-control" {...register("status")}>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
                {/* <inpuPending
                  type="text"
                  className="form-control"
                  placeholder="Enter status"
                  {...register("status")}
                /> */}
                {errors.status && (
                  <p className="text-danger">{errors.status.message}</p>
                )}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <label>Is Active</label>
                <select className="form-control" {...register("isActive")}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                {errors.isActive && (
                  <p className="text-danger">{errors.isActive.message}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm fieldadd-btn"
            >
              Add Employee
            </button>
          </form>
        </>
      )}
    </>
  );
};

export default adminLayout(FieldAgentAdd);
