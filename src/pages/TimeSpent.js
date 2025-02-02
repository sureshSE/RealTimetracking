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
import fieldAgentService from "../services/fieldAgentService";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CustomAutocomplete from "../components/filter/AutoComplete";

const TimeSpent = () => {
  const { render } = useHasPermission({
    moduleName: "timeSpent",
  });
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const { user } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [nameData, setNameData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const itemsPerPage = 5;

  const [name, setName] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [team, setTeam] = useState(user?.teamId[0] || null);

  const fetchData = async () => {
    const data = {
      query: "",
      variables: {
        fieldAgentId: user?.fieldAgentId ? `${user.fieldAgentId.toString()}` : "",
        teamId: "",
        search: "",
        page: 0,
        limit: 20,
      },
    };
    const branch = await fieldAgentService.getTeams(data);
    setTeamData(branch?.data?.data?.content || []);
    setTeam(branch?.data?.data?.content?.[0] || null);
  };

  useEffect(() => {
    const filterTeamData = async () => {
      const request = {};
      const payload = {
        query: "",
        variables: {
          agentMail: "",
          startDate: "",
          endDate: "",
          teamId: "",
          roleId: "",
          timeSpentDetail: "true",
          search: "",
          page: 0,
          limit: 20,
        },
      };

      if (team) {
        payload.variables.teamId = team.teamId ? team.teamId.toString() : "";
        request.teamId = team.teamId ? team.teamId.toString() : "";
      }
      if (fromDate) {
        payload.variables.startDate = fromDate.toString();
      }
      if (toDate) {
        payload.variables.endDate = toDate.toString();
      }
      if (name?.userId) {
        request.fieldAgent = name.userId.toString();
      }

      try {
        const response = await fieldAgentService.filterLivetracting(request);
        if (!name?.userId) {
          setNameData(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      try {
        const token = localStorage.getItem("token");
        const resp = await axios.post(
          "https://uat-tracking.rmtec.in:4000/api/liveTrackingId/getAllTotalTimeSpent",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const teamsData = resp?.data?.data?.content || [];
        setTeams(teamsData);
        setFilteredTeams(teamsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    filterTeamData();
  }, [name, fromDate, toDate, team]);

  useEffect(() => {
    if (user) {
      handleTimeSpent(user);
      fetchData();
    }
  }, [user]);

  const handleTimeSpent = async (user) => {
    const token = localStorage.getItem("token");

    await axios
      .post(
        "https://uat-tracking.rmtec.in:4000/api/liveTrackingId/getAllTotalTimeSpent",
        {
          query: "",
          variables: {
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

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeams = filteredTeams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredTeams);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TimeSpentData");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "TimeSpentReport.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const columns = [
      "Date",
      "Field Agents",
      "Team Name",
      "Place Name",
      "Start Time",
      "End Time",
      "Time Spent",
    ];

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US");
    };

    const rows = filteredTeams.map((team) => [
      formatDate(team.date),
      team.nickName || "",
      team.teamName || "",
      team.fieldTag || "",
      team.loginTime,
      team.logoutTime,
      team.totalTimeSpent,
    ]);

    doc.text("Time Spent Report", 14, 10);
    doc.autoTable({ startY: 20, head: [columns], body: rows });
    doc.save("TimeSpentReport.pdf");
  };

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Time Spent - RealTimeTracking</title>
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">Time Spent</h3>
          <div className="container mt-4 fieldagentmange">
            <div className="row mb-4 bg-light p-3 rounded shadow-sm">
              <div className="col-md-3">
                <CustomAutocomplete
                  options={nameData}
                  value={name}
                  label="Select Name"
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => setName(newValue)}
                  placeholder="Select name"
                  sx={{ backgroundColor: "white" }}
                />
              </div>

              <div className="col-md-2">
                <TextField
                  type="date"
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
                  name="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  variant="outlined"
                  fullWidth
                />
              </div>

              <div className="col-md-3">
                <CustomAutocomplete
                  options={teamData}
                  value={team}
                  label="Select team"
                  getOptionLabel={(option) => option?.teamName}
                  onChange={(event, newValue) => {
                    setTeam(newValue);
                    setName(null);
                  }}
                  placeholder="Select team"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
            </div>

            <div className="mb-3">
              <button className="btn me-2 fieldadd-btn" onClick={exportToExcel}>
                <FaFileExcel /> Export to Excel
              </button>
              <button className="btn fieldadd-btn" onClick={exportToPDF}>
                <FaFilePdf /> Export to PDF
              </button>
            </div>

            <table className="table table-striped">
              <thead className="table-dark">
                <tr>
                  <th>Date</th>
                  <th>Field Agents</th>
                  <th>Team Name</th>
                  <th>Place Name</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Time Spent</th>
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
                    <tr key={team.id || team.date}>
                      <td>{team.date ? new Date(team.date).toLocaleDateString() : ""}</td>
                      <td>{team.nickName ? team.nickName.replace(/\b\w/g, (char) => char.toUpperCase()) : ""}</td>
                      <td>{team.teamName ? team.teamName.replace(/\b\w/g, (char) => char.toUpperCase()) : ""}</td>
                      <td>{team.fieldTag ? team.fieldTag.replace(/\b\w/g, (char) => char.toUpperCase()) : ""}</td>
                      <td>{team.startTime || ""}</td>
                      <td>{team.endTime || ""}</td>
                      <td>{team.totalTimeSpent || ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

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

export default adminLayout(TimeSpent);
