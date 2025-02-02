import React, { useEffect, useState, useContext } from "react";
import Select from "react-select";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import adminLayout from "../hoc/adminLayout";
import "../assets/css/AgentTeamAdd.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import useUserHasPermission from "../utils/permission/userAccess";
import { AuthContext } from "../context/AuthContext";

const schema = yup.object().shape({
  teamName: yup.string().required("Team name is required"),
  // fieldAgents: yup
  //   .array()
  //   .min(1, "Select at least one field agent")
  //   .required("Field agents are required"),
  // managers: yup
  //   .array()
  //   .min(1, "Select at least one manager")
  //   .required("Managers are required"),
  // deputyManagers: yup
  //   .array()
  //   .min(1, "Select at least one deputy manager")
  //   .required("Deputy managers are required"),
});

const AgentTeamAdd = () => {
  const { user } = useContext(AuthContext);
  const { render } = useUserHasPermission({
    data: user?.privilege?.fieldAgents,
    moduleName: "agentTeamAdd",
    userType: user?.role?.role,
  });

  const [fieldAgentOptions, setFieldAgentOptions] = useState([]);
  const [managerOptions, setManagerOptions] = useState([]);
  const [deputyManagerOptions, setDeputyManagerOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      handleRoleAgentUser(
        1,
        user.role.role === "SuperAdmin" ? user.fieldAgentId : user.createdBy
      );
      handleRoleManager(
        2,
        user.role.role === "SuperAdmin" ? user.fieldAgentId : user.createdBy
      );
      handleRoleDeputyManager(
        3,
        user.role.role === "SuperAdmin" ? user.fieldAgentId : user.createdBy
      );
    }
  }, [user]);

  const handleRoleAgentUser = async (roleId, userId) => {
    axios
      .get(
        `https://uat-tracking.rmtec.in/api/fieldAgent/getFieldAgentByRoleId/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        const agentsData = response.data.data || [];
        const options = agentsData.map((agent) => ({
          value: agent.fieldAgentId,
          label: agent.nickName,
        }));
        setFieldAgentOptions(options);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching field agent details", error);
        setErrorMessage("Failed to load agent details.");
        setLoading(false);
      });
  };

  const handleRoleManager = async (roleId, userId) => {
    axios
      .get(
        `https://uat-tracking.rmtec.in/api/fieldAgent/getFieldAgentByRoleId/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        const agentsData = response.data.data || [];
        const options = agentsData.map((agent) => ({
          value: agent.fieldAgentId,
          label: agent.nickName,
        }));
        setManagerOptions(options);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching field agent details", error);
        setErrorMessage("Failed to load agent details.");
        setLoading(false);
      });
  };
  const handleRoleDeputyManager = async (roleId, userId) => {
    axios
      .get(
        `https://uat-tracking.rmtec.in/api/fieldAgent/getFieldAgentByRoleId/${roleId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        const agentsData = response.data.data || [];
        const options = agentsData.map((agent) => ({
          value: agent.fieldAgentId,
          label: agent.nickName,
        }));

        setDeputyManagerOptions(options);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching field agent details", error);
        setErrorMessage("Failed to load agent details.");
        setLoading(false);
      });
  };

  const onSubmit = async (data) => {
    const Token = localStorage.getItem("token");

    const payload = {
      teamName: data.teamName,
      fieldAgents:
        user?.role?.role === "FieldAgent"
          ? []
          : (data.fieldAgents || []).map((option) => ({
              fieldAgentId: option.value,
            })),
      managers:
        user?.role?.role === "Deputy Manager" || user?.role?.role === "Manager"
          ? [{ fieldAgentId: user.fieldAgentId }]
          : (data.managers || []).map((option) => ({
              fieldAgentId: option.value,
            })),
      deputyManagers:
        user?.role?.role === "Deputy Manager"
          ? [{ fieldAgentId: user.fieldAgentId }]
          : (data.deputyManagers || []).map((option) => ({
              fieldAgentId: option.value,
            })),
      created_by: user.fieldAgentId,
    };

    try {
      const createData = await axios.post(
        "https://uat-tracking.rmtec.in/api/teams/addTeam",
        payload,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
          },
        }
      );

      setSuccessMessage("Team added successfully!");
      setErrorMessage("");
      reset();
      setTimeout(() => navigate("/field-agent/agent-team-list"), 1000);
    } catch (error) {
      console.error("There was an error adding the team!", error);
      setErrorMessage("Failed to add the team.");
      setSuccessMessage("");
    }
  };

  const handleCloseMessage = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Field Agent Add - RealTimeTracking</title>
          <meta
            name="description"
            content="Overview of employee performance and metrics."
          />
          <meta name="keywords" content="dashboard, employee, management" />
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">Agent Team Add</h3>
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
                    Agent Team Add
                  </li>
                </ol>
              </nav>
            </span>
            <div className="row mb-3">
              <div className="col-md-6">
                <label>Team Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Team Name"
                  {...register("teamName")}
                />
                {errors.teamName && (
                  <p className="text-danger">{errors.teamName.message}</p>
                )}
              </div>

              <div className="col-md-6">
                <label>Field Agents</label>
                <Controller
                  name="fieldAgents"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      options={fieldAgentOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select Field Agents"
                      isDisabled={
                        user?.role?.role === "FieldAgent" ? true : false
                      }
                      {...field}
                      onChange={(selected) => field.onChange(selected)}
                    />
                  )}
                />
                {/* {errors.fieldAgents && (
                  <p className="text-danger">{errors.fieldAgents.message}</p>
                )} */}
              </div>

              <div className="col-md-6">
                <label>Managers</label>
                <Controller
                  name="managers"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      options={managerOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select Managers"
                      isDisabled={
                        user?.role?.role === "Deputy Manager" ||
                        user?.role?.role === "Manager"
                          ? true
                          : false
                      }
                      {...field}
                      onChange={(selected) => field.onChange(selected)}
                    />
                  )}
                />
                {/* {errors.managers && (
                  <p className="text-danger">{errors.managers.message}</p>
                )} */}
              </div>

              <div className="col-md-6">
                <label>Deputy Managers</label>
                <Controller
                  name="deputyManagers"
                  control={control}
                  render={({ field }) => (
                    <Select
                      isMulti
                      options={deputyManagerOptions}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select Deputy Managers"
                      isDisabled={
                        user?.role?.role === "Deputy Manager" ? true : false
                      }
                      {...field}
                      onChange={(selected) => field.onChange(selected)}
                    />
                  )}
                />
                {/* {errors.deputyManagers && (
                  <p className="text-danger">{errors.deputyManagers.message}</p>
                )} */}
              </div>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary team-btn">
                Add Team
              </button>
            </div>

            {successMessage && (
              <div className="alert alert-success mt-3">
                {successMessage}
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseMessage}
                >
                  &times;
                </button>
              </div>
            )}
            {errorMessage && (
              <div className="alert alert-danger mt-3">
                {errorMessage}
                <button
                  type="button"
                  className="close"
                  onClick={handleCloseMessage}
                >
                  &times;
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </>
  );
};

export default adminLayout(AgentTeamAdd);
