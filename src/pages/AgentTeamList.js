import React, { useState, useEffect, useContext } from "react";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/FieldAgentList.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import useUserHasPermission from "../utils/permission/userAccess";
import agentTeamService from "../services/agentTeamService";
import { AuthContext } from "../context/AuthContext";
import { useSnackbar } from "../context/SnackbarContext";
import { ButtonAccess } from "../utils/permission/buttonAccess";
import EditAgentTeam from "../common/EditAgentTeam";
import CustomAutocomplete from "../components/filter/AutoComplete"

const AgentTeamList = () => {
  const [teams, setTeams] = useState([]); // State for teams data
  const [teamsData, setTeamsData] = useState([]); // State for teams data
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [error, setError] = useState(null); // State for error handling
  const { user } = useContext(AuthContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [teamData, setTeamData] = useState("");
  const { render } = useUserHasPermission({
    data: user?.privilege?.fieldAgents,
    moduleName: "agentTeamLists",
    userType: user?.role?.role,
  });

  const { showSnackbar } = useSnackbar();
  const permissionButton = ButtonAccess(
    user?.privilege?.agentTeamList,
    "agentTeamList",
    user?.role?.role
  );

  // filter
  const [teamName, setTeamName] = useState(null);
  const [fieldAgent, setFieldAgent] = useState(null);
  const [manager, setManager] = useState(null);
  const [deputyManager, setDeputyManager] = useState(null);

  useEffect(() => {
    const filterTeamData = async (user) => {

      const payload = {
        query: "",
        variables: {
          userId: `${user?.role?.role === "SuperAdmin" ? "" : user.userId}`,
          fieldAgentId: `${user?.role.role === "SuperAdmin" ? "" : user.fieldAgentId}`,
          // fieldAgentId: `${user.fieldAgentId}`,
          // teamId: `${user.teamId}`,
          // createdBy: user.role.roleId == 4 ? "" : user.createdBy,
          search: "",
          page: 0,
          limit: 20,
        },
      };



      if (teamName) {
        payload.variables.teamId = teamName?.teamId.toString()
      }
      if (fieldAgent) {
        payload.variables.fieldAgentId = fieldAgent?.fieldAgentId?.toString()
      }

      if (manager) {
        payload.variables.fieldAgentId = manager?.fieldAgentId?.toString()
      }

      if (deputyManager) {
        payload.variables.fieldAgentId = deputyManager?.fieldAgentId?.toString()
      }

      console.log("🚀 ~ filterTeamData ~ payload:", payload)
      // return


      await agentTeamService.getTeamList(payload).then((response) => {
        setTeams(response?.data?.data?.content);
      })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    filterTeamData(user);
  }, [teamName,
    fieldAgent,
    manager,
    deputyManager]);


  // Fetch employee data
  const fetchEmployeeData = async () => {
    try {
      // const payload = { fieldAgentId: user?.createdBy };
      const payload = {
        query: "",
        variables: {
          // userId: `${user?.role?.role === "SuperAdmin" ? "" : user.userId}`,
          fieldAgentId: `${user?.role.role !== "SuperAdmin" ? user.fieldAgentId : ""}`,
          // fieldAgentId: `${user.fieldAgentId}`,
          // teamId: `${user.teamId}`,
          // createdBy: user.role.roleId == 4 ? "" : user.createdBy,
          search: "",
          page: 0,
          limit: 20,
        },
      };

      const response = await agentTeamService.getTeamList(payload);
      const data = Array.isArray(response?.data?.data.content)
        ? response.data.data.content
        : []
      setTeams(data);
      setTeamsData(data)
    } catch (error) {
      console.error("Error fetching team data:", error);
      setTeams([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployeeData();
    }
  }, [user]);

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeams = teams?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((teams?.length || 0) / itemsPerPage);

  // Utility functions for displaying agent names and roles
  function getNames(agentUser = []) {
    return (
      agentUser
        ?.map((user) => user?.name)
        .filter(Boolean)
        .join(", ") || "N/A"
    );
  }

  function getNamesByRole(agentUser = [], roleName) {
    return (
      agentUser
        ?.filter((user) => user.role === roleName)
        .map((user) => user?.name)
        .join(", ") || "N/A"
    );
  }

  const handleViewClick = async (teamId) => {
    if (permissionButton?.view !== "1") {
      showSnackbar("You don't have permission to view this action", "error");
      return;
    }
    try {
      const response = await agentTeamService.getByIdTeam(teamId);
      setShowViewModal(true);
      setTeamData(response?.data?.data || {});
    } catch (error) {
      console.error("Error viewing team:", error);
    }
  };

  const handleDeleteClick = async (teamId) => {
    if (permissionButton?.delete !== "1") {
      showSnackbar("You don't have permission to delete this action", "error");
      return;
    }
    try {
      await agentTeamService.deleteTeamAgent(teamId);
      showSnackbar("Field Agent deleted successfully", "success");
      fetchEmployeeData(user);
    } catch (error) {
      showSnackbar("Failed to delete Field Agent", "error");
      console.error("Error deleting team:", error);
    }
  };

  const handleEditClick = async (teamId) => {
    if (permissionButton?.edit !== "1") {
      showSnackbar("You don't have permission to edit this action", "error");
      return;
    }
    try {
      const response = await agentTeamService.getByIdTeam(teamId);
      setShowEditModal(true);
      setTeamData(response?.data?.data || {});
    } catch (error) {
      console.error("Error editing team:", error);
    }
  };


  const getUniqueFieldAgents = (data, role) => {
    const allFieldAgents = data.flatMap((team) => team.fieldAgents);
    const uniqueFieldAgents = Array.from(
      new Map(allFieldAgents.map((agent) => [agent.fieldAgentId, agent])).values()
    );
    if (role) {
      return uniqueFieldAgents.filter((agent) => agent.role === role);
    }
    return uniqueFieldAgents;
  };





  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Agent Team List - RealTimeTracking</title>
          <meta name="description" content="Overview of agent teams." />
          <meta name="keywords" content="dashboard, team management" />
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">Agent Team List</h3>
          <div className="mt-5 fieldagentlist">
            {/* Filtering Section */}
            <div className="row mb-3">{/* Filters */}</div>

            {error && <div className="alert alert-danger">{error}</div>}

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
                    Agent Team List
                  </li>
                </ol>
              </nav>
            </span>

            {/* Filters and Search */}
            <div
              className="row mb-3"
              style={{
                backgroundColor: "#0d6efd",
                padding: "20px",
                borderRadius: "10px",
              }}
            >
              <div className="col-md-3">
                <CustomAutocomplete
                  options={teamsData}
                  value={teamName}
                  label="Select Name"
                  getOptionLabel={(option) => option.teamName}
                  onChange={(event, newValue) => setTeamName(newValue)}
                  placeholder="Select name"
                  sx={{ backgroundColor: "white" }}
                />
              </div>

              <div className="col-md-3">

                <CustomAutocomplete
                  options={getUniqueFieldAgents(teamsData, 'FieldAgent')}
                  value={fieldAgent}
                  label="Select fieldAgent"
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => setFieldAgent(newValue)}
                  placeholder="Select fieldAgent"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
              <div className="col-md-3">
                <CustomAutocomplete
                  options={getUniqueFieldAgents(teamsData, 'Manager')}
                  value={manager}
                  label="Select Manager"
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => setManager(newValue)}
                  placeholder="Select mobile"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
              <div className="col-md-3">
                <CustomAutocomplete
                  options={getUniqueFieldAgents(teamsData, 'Deputy Manager')}
                  value={deputyManager}
                  label="Select deputyManager"
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => setDeputyManager(newValue)}
                  placeholder="Select role"
                  sx={{ backgroundColor: "white" }}
                />
              </div>

            </div>


            {/* Table */}
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Field Agents</th>
                  <th>Managers</th>
                  <th>Deputy Managers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No teams available
                    </td>
                  </tr>
                ) : (
                  currentTeams.map((team) => (
                    <tr key={team?.teamId}>
                      <td>{team?.teamName}</td>
                      <td>{getNamesByRole(team?.fieldAgents, "FieldAgent")}</td>
                      <td>{getNamesByRole(team?.fieldAgents, "Manager")}</td>
                      <td>
                        {getNamesByRole(team?.fieldAgents, "Deputy Manager")}
                      </td>
                      <td>
                        <FaEdit onClick={() => handleEditClick(team?.teamId)} />
                        <FaEye onClick={() => handleViewClick(team?.teamId)} />
                        <FaTrashAlt
                          onClick={() => handleDeleteClick(team?.teamId)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <nav>
              <ul className="pagination">
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${currentPage === index + 1 ? "active" : ""
                      }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditAgentTeam
          getEmployee={teamData}
          setShowEditModal={setShowEditModal}
        // handleEditSubmit={handleEditSubmit}
        />
      )}

      {/* View Modal */}
      {showViewModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Field Agent Team</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowViewModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Team Name:</strong> {teamData?.teamName}
                </p>
                <p>
                  <strong>Field Agents:</strong>{" "}
                  {getNamesByRole(teamData?.fieldAgents, "FieldAgent")}
                </p>
                <p>
                  <strong>Managers:</strong>{" "}
                  {getNamesByRole(teamData?.fieldAgents, "Manager")}
                </p>
                <p>
                  <strong>Deputy Managers:</strong>{" "}
                  {getNamesByRole(teamData?.fieldAgents, "Deputy Manager")}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default adminLayout(AgentTeamList);
