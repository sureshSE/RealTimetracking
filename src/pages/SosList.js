import React, { useState, useEffect, useContext } from "react";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/TimeSpent.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
  FaEdit,
  FaEye,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useHasPermission from "../utils/permission/pageAccess";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import teamDetailsService from "../services/TeamDetailsService";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CustomAutocomplete from "../components/filter/AutoComplete";

const SosList = () => {
  const { render } = useHasPermission({
    moduleName: "timeSpent",
  });
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamData, setTeamData] = useState(null);
  const itemsPerPage = 5;

  // filter
  const [name, setName] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [team, setTeam] = useState(user?.teamId[0] || null);

  //filter

  useEffect(() => {
    const filterTeamData = async (user) => {
      const payload = {
        query: "",
        variables: {
          userId: "",
          agentMail: "",
          startDate: "",
          endDate: "",
          teamId: "52",
          roleId: "",
          timeSpentDetail: "true",
          search: "",
          page: 0,
          limit: 20,
        },
      };

      if (team) {
        payload.variables.teamId = team.toString();
      }
      if (fromDate) {
        payload.variables.startDate = fromDate.toString();
      }

      if (toDate) {
        payload.variables.endDate = toDate.toString();
      }

      if (name) {
        payload.variables.nickName = name?.nickName;
      }


      const token = localStorage.getItem("token");

      await axios
        .post(
          "",
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
          setTeams(teamsData);
          // setFilteredTeams(teamsData);
        })
        .catch((error) => console.error("Error fetching data:", error));
    };

    filterTeamData(user);
  }, [name, fromDate, toDate, team]);

  useEffect(() => {
    if (user) {
      handleTimeSpent(user);
      // handleTeamDetails(user?.fieldAgentId);
    }
  }, [user]);

 

  const handleTimeSpent = async (user) => {
    const token = localStorage.getItem("token");

    await axios
      .post(
        "",
        {
          query: "",
          variables: {
            // userId: `${user && user?.fieldAgentId}`,
            teamId: `${team}`,
            roleId: ``,
            startDate: "",
            endDate: "",
            agentMail: "",
            timeSpentDetail: "true",
            search: "",
            page: 0,
            limit: 20,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )

      .then((resp) => {
        const teamsData = resp ? resp?.data.data.content : [];
        setTeams(teamsData);
        setFilteredTeams(teamsData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  // Pagination
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>SOS Alert List - RealTimeTracking</title>
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">SOS Alert List</h3>
          <div className="container mt-4 fieldagentmange">
            {/* Filters */}
            <div className="row mb-4 bg-light p-3 rounded shadow-sm">
              <div className="col-md-3">
                <CustomAutocomplete
                  options={filteredTeams}
                  value={name}
                  label="Select Name"
                  getOptionLabel={(option) => option.nickName}
                  onChange={(event, newValue) => setName(newValue)}
                  placeholder="Select name"
                  sx={{ backgroundColor: "white" }}
                />
              </div>

              <div className="col-md-2">
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

              <div className="col-md-2">
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
                <Autocomplete
                  options={user?.teamId}
                  value={team}
                  onChange={(event, newValue) => setTeam(newValue || "")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter by Team"
                      placeholder="Enter Team"
                      variant="outlined"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>

           

            {/* Table */}
            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Field Agents</th>
                  <th>Team Name</th>
                  <th>SOS Alert Time</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {currentTeams.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No data available
                    </td>
                  </tr>
                ) : (
                  currentTeams.map((team) => (
                    <tr key={team.teamId}>
                      <td>{new Date(team.date).toLocaleDateString()}</td>
                      <td>{team.nickName.replace(/\b\w/g, char => char.toUpperCase())}</td>
                      <td>{team.teamName.replace(/\b\w/g, char => char.toUpperCase())}</td>
                      <td>{team.fieldTag.replace(/\b\w/g, char => char.toUpperCase())}</td>
                      <td>
                        <FaEye className="action-icon me-2" title="View" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center">
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
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
    </>
  );
};

export default adminLayout(SosList);
