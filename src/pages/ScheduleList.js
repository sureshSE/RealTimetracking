import React, { useState, useEffect, useContext } from "react";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/FieldAgentList.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  FaEdit,
  FaEye,
  FaTrashAlt,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CuatomAutocomplete from "../components/filter/AutoComplete"

const ScheduleList = () => {
  const [employees, setEmployees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const { user } = useContext(AuthContext);


  // filter 
  const [name, setName] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [team, setTeam] = useState(null);
  const [filteredTeams, setFilteredTeams] = useState([]);


  //filter 

  useEffect(() => {
    const filterTeamData = async (user) => {

      const payload = {
        query: "",
        variables: {
          userId: ``,
          teamId: ``,
          assigner: `${user.fieldAgentId}`,
          roleId: ``,
          agentMail: "",
          startDate: "",
          endDate: "",
          search: "",
          page: 0,
          limit: 30,
        },
      };



      if (team) {
        payload.variables.taskStatus = team.taskStatus
      }
      if (fromDate) {
        payload.variables.startDate = fromDate.toString()
      }

      if (toDate) {
        payload.variables.endDate = toDate.toString()
      }

      if (name) {
        payload.variables.agentMail = name?.assignee
      }

      console.log("🚀 ~ filterTeamData ~ payload:", payload)
      // return


      const token = localStorage.getItem("token");

      await axios
        .post(
          "https://uat-tracking.rmtec.in/api/scheduledVisitTrackId/getAllScheduledVisitTrackId",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        .then((resp) => {
          const teamsData = resp ? resp?.data.data.content : [];
          setEmployees(teamsData);
          setFilteredTeams(teamsData);

        })
        .catch((error) => console.error("Error fetching data:", error));
    };

    filterTeamData(user);
  }, [name,
    fromDate,
    toDate,
    team]);



  useEffect(() => {
    if (user) {
      fetchEmployeeData(user);
    }
  }, [user]);

  const fetchEmployeeData = (user) => {
    const token = localStorage.getItem("token");
    axios
      .post(
        "https://uat-tracking.rmtec.in/api/scheduledVisitTrackId/getAllScheduledVisitTrackId",

        {
          query: "",
          variables: {
            userId: ``,
            teamId: ``,
            assigner: `${user.fieldAgentId}`,
            roleId: ``,
            agentMail: "",
            startDate: "",
            endDate: "",
            search: "",
            page: 0,
            limit: 30,
          },
        },
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      .then((response) => {
        if (response.data.data.content.length > 0) {
          setEmployees(response?.data?.data?.content);
        } else {
          console.error("Expected an array but received:", response.data);
          setEmployees([]);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) => {
    return (
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.fieldAgentEmail
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      employee.mobile?.toString().includes(searchTerm) ||
      employee.status?.toString().includes(searchTerm) ||
      (employee.isActive ? "Yes" : "No")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Sort employees based on selected field and order
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const aValue =
      a[sortField] != null
        ? typeof a[sortField] === "string"
          ? a[sortField].toLowerCase()
          : a[sortField]
        : "";
    const bValue =
      b[sortField] != null
        ? typeof b[sortField] === "string"
          ? b[sortField].toLowerCase()
          : b[sortField]
        : "";
    return sortOrder === "asc"
      ? aValue > bValue
        ? 1
        : -1
      : aValue < bValue
        ? 1
        : -1;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = sortedEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);


  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Schedule List - RealTimeTracking</title>
          <meta
            name="description"
            content="Overview of field agent performance and metrics."
          />
          <meta name="keywords" content="dashboard, field agent, management" />
        </Helmet>
      </HelmetProvider>

      <h3 className="title">Schedule List</h3>

      <div className="mt-5 fieldagentlist">

        <div className="row mb-4 bg-light p-3 rounded shadow-sm" style={{
          backgroundColor: "#0d6efd",
          padding: "20px",
          borderRadius: "10px",
        }}>
          <div className="col-md-3">
            <CuatomAutocomplete
              options={filteredTeams}
              value={name}
              label="Select Name"
              getOptionLabel={(option) => option.assignee}
              onChange={(event, newValue) => setName(newValue)}
              placeholder="Select name"
              sx={{ backgroundColor: "white" }}
            />

          </div>

          <div className="col-md-3">
            <TextField
              type="date"
              // label="From Date"
              name="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              variant="outlined"
              fullWidth
            />
          </div>

          <div className="col-md-3">
            <TextField
              type="date"
              // label="To Date"
              name="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              variant="outlined"
              fullWidth
            />
          </div>

          {/* Team Autocomplete */}
          <div className="col-md-3">
            <CuatomAutocomplete
              options={filteredTeams}
              value={team}
              label="Select Status"
              getOptionLabel={(option) => option.taskStatus}
              onChange={(event, newValue) => setTeam(newValue)}
              placeholder="Select name"
              sx={{ backgroundColor: "white" }}
            />
          </div>
        </div>
        {/* <div
          className="row mb-3"
          style={{
            backgroundColor: "#0d6efd",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <div className="col-md-2">
            <select className="form-control" required>
              <option value="">Select Name</option>
              <option value="role1">Name 1</option>
              <option value="role2">Name 2</option>
              <option value="role3">Name 3</option>
            </select>
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" required />
          </div>
          <div className="col-md-3">
            <input type="date" className="form-control" required />
          </div>
          <div className="col-md-2">
            <select className="form-control" required>
              <option value="">Select Team</option>
              <option value="team1">Team 1</option>
              <option value="team2">Team 2</option>
              <option value="team3">Team 3</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-control" required>
              <option value="">Select Manager</option>
              <option value="manager1">Manager 1</option>
              <option value="manager2">Manager 2</option>
              <option value="manager3">Manager 3</option>
            </select>
          </div>
        </div> */}
 <div className="table-responsive">
  <table className="table table-hover table-striped">
    <thead className="table-dark">
      <tr>
        <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
          Agent Name{" "}
          {sortField === "name" &&
            (sortOrder === "asc" ? (
              <FaSortUp className="ms-2" />
            ) : (
              <FaSortDown className="ms-2" />
            ))}
        </th>
        <th onClick={() => handleSort("fieldAgentEmail")} style={{ cursor: "pointer" }}>
          Schedule Date{" "}
          {sortField === "fieldAgentEmail" &&
            (sortOrder === "asc" ? (
              <FaSortUp className="ms-2" />
            ) : (
              <FaSortDown className="ms-2" />
            ))}
        </th>
        <th onClick={() => handleSort("mobile")} style={{ cursor: "pointer" }}>
          Address{" "}
          {sortField === "mobile" &&
            (sortOrder === "asc" ? (
              <FaSortUp className="ms-2" />
            ) : (
              <FaSortDown className="ms-2" />
            ))}
        </th>
        <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
          Status{" "}
          {sortField === "status" &&
            (sortOrder === "asc" ? (
              <FaSortUp className="ms-2" />
            ) : (
              <FaSortDown className="ms-2" />
            ))}
        </th>
        <th onClick={() => handleSort("isActive")} style={{ cursor: "pointer" }}>
          Note{" "}
          {sortField === "isActive" &&
            (sortOrder === "asc" ? (
              <FaSortUp className="ms-2" />
            ) : (
              <FaSortDown className="ms-2" />
            ))}
        </th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {employees.length > 0 ? (
        employees.map((employee) => (
          <tr key={employee.fieldAgentId}>
            <td>{employee.assignee}</td>
            <td>{employee.time}</td>
            <td>{employee.description}</td>
            <td>{employee.taskStatus}</td>
            <td>{employee.notes.replace(/\b\w/g, char => char.toUpperCase())}</td>
            <td>
              <FaEdit
                className="action-icon text-primary"
                title="Edit"
                style={{ cursor: "pointer", marginRight: "10px" }}
              />
              <FaEye
                className="action-icon text-success"
                title="View"
                style={{ cursor: "pointer", marginRight: "10px" }}
              />
              <FaTrashAlt
                className="action-icon text-danger"
                title="Delete"
                style={{ cursor: "pointer" }}
              />
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="6" className="text-center">
            No employees found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

        <nav aria-label="Page navigation">
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index + 1}
                className={`page-item ${index + 1 === currentPage ? "active" : ""
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
  );
};

export default adminLayout(ScheduleList);
