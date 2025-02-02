import React, { useState, useContext, useEffect } from "react";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/AgentPrivileges.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const AgentPrivileges = () => {
  const { user } = useContext(AuthContext);

  const [formState, setFormState] = useState({
    userId: null,
    roleId: "",
    teamId: "",
    overview: "Inactive",
    realTimeTracking: "Inactive",
    analytics: "Inactive",
    timeSpent: "Inactive",
    reports: "Inactive",
    fieldAgent: "Inactive",
    fieldAgents: {
      fieldAgentAdd: "Inactive",
      fieldAgentLists: "Inactive",
      fieldAgentList: {
        view: "Inactive",
        edit: "Inactive",
        delete: "Inactive",
      },
      agentPrivileges: "Inactive",
      agentTeamPrivileges: "Inactive",
      agentTeamAdd: "Inactive",
      agentTeamLists: "Inactive",
      agentTeamList: {
        view: "Inactive",
        edit: "Inactive",
        delete: "Inactive",
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [roles, setRoles] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDropdownData(user);
    }
  }, [user]);

  const fetchDropdownData = async (user) => {
    try {
      const response = await axios.get(
        `https://uat-tracking.rmtec.in/api/fieldAgent/getAgentById/${user.fieldAgentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const teamData = response.data.data.teamIds;
      setTeams(teamData);

      if (teamData.length > 0) {
        setRoles(teamData[0]?.fieldAgentDtos || []);
      }
    } catch (error) {
      console.error("Error fetching roles or teams:", error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, checked, dataset } = event.target;

    const isCheckbox = event.target.type === "checkbox";

    if (dataset.main && dataset.subSection) {
      // Handle sub-section (e.g., view/edit/delete) toggles
      const main = dataset.main; // e.g., "agentTeamLists"
      const subSection = dataset.subSection; // e.g., "view", "edit", "delete"

      setFormState((prevState) => ({
        ...prevState,
        fieldAgents: {
          ...prevState.fieldAgents,
          [main]: {
            ...prevState.fieldAgents[main],
            [subSection]:  checked
                ? "Active"
                : "Inactive"
             ,
          },
        },
      }));
    } else if (dataset.section) {
      // Handle parent toggle updates (e.g., fieldAgentLists or agentTeamLists)
      const section = dataset.section; // e.g., "fieldAgentLists" or "agentTeamLists"
      const isActive = checked ? "Active" : "Inactive";

      setFormState((prevState) => {
        const updatedFieldAgents = {
          ...prevState.fieldAgents,
          [section]: isActive ,
        };

        // Only cascade deactivation if the parent section is turned OFF
        if (isActive === "Inactive") {
          if (section === "fieldAgentLists") {
            updatedFieldAgents.fieldAgentList = {
              view: "Inactive",
              edit: "Inactive",
              delete: "Inactive",
            };
          } else if (section === "agentTeamLists") {
            updatedFieldAgents.agentTeamList = {
              view: "Inactive",
              edit: "Inactive",
              delete: "Inactive",
            };
          }
        }

        return {
          ...prevState,
          fieldAgents: updatedFieldAgents,
        };
      });
    } else {
      // General updates for non-section fields
      setFormState((prevState) => ({
        ...prevState,
        [name]: isCheckbox
          ? checked
            ? "Active"
            : "Inactive"
          :value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      role: { roleId: user.role.roleId },
      team: { teamId: formState.teamId },
      userId: formState?.userId || 1,
      overview: formState.overview,
      realTimeTracking: formState.realTimeTracking,
      analytics: formState.analytics,
      timeSpent: formState.timeSpent,
      reports: formState.reports,
      fieldAgent: formState.fieldAgent,
      fieldAgents: formState.fieldAgents,
    };

    try {
      await axios.post(
        "https://uat-tracking.rmtec.in/api/privilege/addPrivilege",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setSuccessMessage("Agent Privileges created successfully!");
      resetFormState();
      setTimeout(() => {
        handleCloseMessage();
      }, 2000);
    } catch (error) {
      console.error("Error adding agent privileges:", error);
      setErrorMessage("Failed to create agent privileges.");
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = () => {
    setFormState({
      userId: "",
      roleId: "",
      teamId: "",
      overview: "Inactive",
      realTimeTracking: "Inactive",
      analytics: "Inactive",
      timeSpent: "Inactive",
      reports: "Inactive",
      fieldAgent: "Inactive",
      fieldAgents: {
        fieldAgentAdd: "Inactive",
        fieldAgentLists: "Inactive",
        fieldAgentList: {
          view: "Inactive",
          edit: "Inactive",
          delete: "Inactive",
        },
        agentPrivileges: "Inactive",
        agentTeamPrivileges: "Inactive",
        agentTeamAdd: "Inactive",
        agentTeamLists: "Inactive",
        agentTeamList: {
          view: "Inactive",
          edit: "Inactive",
          delete: "Inactive",
        },
      },
    });
  };

  const handleCloseMessage = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };
  console.log("------------formState----------->", formState);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Agent Team Privileges - RealTimeTracking</title>
        </Helmet>
      </HelmetProvider>
      <h3 className="title">Agent Privileges</h3>
      <div className="container agentprivileges">
        <span
          className="breadcrumb-allpage"
          style={{ borderBottom: "2px solid #0d6efd", display: "block" }}
        >
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/field-agent-management">
                  <i className="fa fa-home" style={{ marginRight: "5px" }}></i>
                  Field Agent Management
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                <i
                  className="fa fa-user-shield"
                  style={{ marginRight: "5px" }}
                ></i>
                Agent Privileges
              </li>
            </ol>
          </nav>
        </span>
        <form id="privilegesForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="teamId">Teams List</label>
            <select
              id="teamId"
              name="teamId"
              className="form-control"
              value={formState.teamId}
              onChange={(e) => {
                handleInputChange(e);

                const selectedTeam = teams.find(
                  (team) => team.teamId == e.target.value
                );

                setRoles(selectedTeam?.fieldAgentDtos || []);
              }}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.teamId} value={team.teamId}>
                  {team.teamName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="userId">User List</label>
            <select
              id="userId"
              name="userId"
              className="form-control"
              value={formState.userId}
              onChange={handleInputChange}
            >
              <option value="">Select User</option>
              {roles.map((users) => (
                <option key={users.fieldAgentId} value={users.fieldAgentId}>
                  {users.nickName}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <table className="table table-striped table-hover">
              <thead className="thead-dark">
                <tr>
                  <th>Menu</th>
                  <th>Submenu</th>
                  <th>Status</th>
                  <th>View</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "overview",
                  "realTimeTracking",
                  "analytics",
                  "timeSpent",
                  "reports",
                  "fieldAgent",
                ].map((field) => (
                  <tr key={field}>
                    <td>{field}</td>
                    <td></td>
                    <td>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name={field}
                          checked={formState[field] === "Active"}
                          onChange={handleInputChange}
                        />
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                ))}

                {/* Field Agent Privileges */}
                {formState.fieldAgent === "Active" &&
                  Object.keys(formState.fieldAgents).map((key) => {
                    if (
                      key === "fieldAgentLists" &&
                      formState.fieldAgents.fieldAgentLists === "Active"
                    ) {
                      return (
                        <tr key={key}>
                          <td></td>
                          <td>{key}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                data-section={key}
                                checked={
                                  formState.fieldAgents[key] === "Active"
                                }
                                onChange={handleInputChange}
                              />
                            </div>
                          </td>
                          {/* Independent toggles for view, edit, and delete */}
                          {["view", "edit", "delete"].map((subSection) => (
                            <td key={subSection}>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  data-main={"fieldAgentList"}
                                  data-sub-section={subSection}
                                  checked={
                                    formState.fieldAgents["fieldAgentList"]?.[
                                      subSection
                                    ] === "Active"
                                  }
                                  onChange={handleInputChange}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    }

                    // Handle agentTeamLists similarly
                    if (
                      key === "agentTeamLists" &&
                      formState.fieldAgents.agentTeamLists === "Active"
                    ) {
                      return (
                        <tr key={key}>
                          <td></td>
                          <td>{key}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                data-section={key}
                                checked={
                                  formState.fieldAgents[key] === "Active"
                                }
                                onChange={handleInputChange}
                              />
                            </div>
                          </td>
                          {["view", "edit", "delete"].map((subSection) => (
                            <td key={subSection}>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  data-main={"agentTeamList"}
                                  data-sub-section={subSection}
                                  checked={
                                    formState.fieldAgents["agentTeamList"]?.[
                                      subSection
                                    ] === "Active"
                                  }
                                  onChange={handleInputChange}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    }

                    // Handle other keys without sub-sections
                    if (key !== "agentTeamList" && key !== "fieldAgentList") {
                      return (
                        <tr key={key}>
                          <td></td>
                          <td>{key}</td>
                          <td>
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                data-section={key}
                                checked={
                                  formState.fieldAgents[key] === "Active"
                                }
                                onChange={handleInputChange}
                              />
                            </div>
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      );
                    }
                  })}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            className="btn btn-primary fieldadd-btn"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          {successMessage && (
            <div className="alert alert-success mt-3">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger mt-3">{errorMessage}</div>
          )}
        </form>
      </div>
    </>
  );
};

export default adminLayout(AgentPrivileges);
