import React, { useState, useEffect, useContext } from "react";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/FieldAgentList.css";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { FaEdit, FaEye, FaTrashAlt } from "react-icons/fa";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import useUserHasPermission from "../utils/permission/userAccess";
import fieldAgentService from "../services/fieldAgentService";
import EditAgent from "../common/EditAgent";
import { useSnackbar } from "../context/SnackbarContext";
import { AuthContext } from "../context/AuthContext";
import { ButtonAccess } from "../utils/permission/buttonAccess";
import CustomAutocomplete from "../components/filter/AutoComplete"


const FieldAgentList = () => {
  const [employees, setEmployees] = useState([]);
  console.log("🚀 ~ FieldAgentList ~ employees:", employees)
  const [employeeData, setEmployeeData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [teamData, setTeamData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [getEmployee, setGetEmployee] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  // filter purpose
  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);
  const [mobile, setMobile] = useState(null);
  const [role, setRole] = useState(null);
  const [team, setTeam] = useState(null);



  const { user } = useContext(AuthContext);
  const { render } = useUserHasPermission({
    data: user?.privilege?.fieldAgents,
    moduleName: "fieldAgentLists",
    userType: user?.role?.role,
  });
  const { showSnackbar } = useSnackbar();
  const permissionButton = ButtonAccess(
    user?.privilege?.fieldAgents,
    "fieldAgentList",
    user?.role?.role
  );

  // filter 

  const fetchData = async () => {
    const role = await fieldAgentService.getRole();
    setRoleData(role.data.data);
    const data = {
      "query": "",
      "variables": {
        "fieldAgentId": "",
        "teamId": "",
        "search": "",
        "page": 0,
        "limit": 20
      }
    }
    const branch = await fieldAgentService.getTeams(data);
    console.log("🚀 ~ fetchData ~ branch:", branch.data)

    setTeamData(branch?.data?.data?.content);

    // const country_id = await countryService.getCountry();
    // setCountryrole(country_id.data);
    // const depart = await departmentService.departmentDropdown();
    // setDepartmentData(depart?.data?.Active_Data);
    // const device = await DeviceService.deviceDropdown();
    // setDeviceList(device.data.Unauthorized_devices);
    // setProductiveDevices(device.data.Unproductivity_devices);

  }
  useEffect(() => {
    fetchData()
    const filterEmployeeData = async (user) => {

      const payload = {
        query: "",
        variables: {
          userId: `${user?.role?.role === "SuperAdmin" ? "" : user.userId}`,
          roleId: "",
          fieldAgentEmail: "",
          page: 0,
          limit: 20,
        },
      };

      if (name) {
        console.log("🚀 ~ filterEmployeeData ~ name:", name)
        payload.variables.userId = name?.fieldAgentId.toString()
      }
      if (email) {
        payload.variables.fieldAgentEmail = email?.fieldAgentEmail
      }

      if (mobile) {
        payload.variables.mobile = mobile?.mobile
      }

      if (role) {
        payload.variables.roleId = role?.roleId.toString()
      }

      if (team) {
        payload.variables.teamId = team.teamId.toString()
      }

      await fieldAgentService
        .getFieldList(payload)
        .then((response) => {
          // const result = response.data.data.content[0].teamIds.map(data => {
          //   setEmployees(response.data.data.content);
          // }
          // )
          setEmployees(response?.data?.data?.content);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    filterEmployeeData(user);
  }, [name,
    email,
    mobile,
    role,
    team]);


  // getRoles



  useEffect(() => {
    if (user) {
      fetchEmployeeData(user);
    }
  }, [user]);

  const fetchEmployeeData = async (user) => {

    const payload = {
      query: "",
      variables: {
        userId: `${user?.role?.role === "SuperAdmin" ? "" : user.userId}`,
        // fieldAgentId: `${user.fieldAgentId}`,
        // userId: "103",
        // teamId: `${user.teamId}`,
        // createdBy: `${user && user?.userId}`,
        roleId: `${user.role.roleId}`,
        // roleId: "3",
        fieldAgentEmail: "",
        page: 0,
        limit: 20,
      },
    };

    await fieldAgentService
      .getFieldList(payload)
      .then((response) => {
        // const result = response.data.data.content[0].teamIds.map(data => {
        setEmployees(response.data.data.content);
        setEmployeeData(response.data.data.content)
      }
      )
      // setEmployees(response?.data?.data?.content[0]?.teamIds[0]?.fieldAgentDtos);

      // setEmployeeData(response?.data?.data?.content[0]?.teamIds[0]?.fieldAgentDtos)
      // })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
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

  const handleEditClick = async (employeeId) => {
    if (permissionButton?.edit !== "1") {
      showSnackbar(
        "You don't have the permission to access the action",
        "error"
      );
      return;
    }
    try {
      let response = await fieldAgentService.getSingleFieldAgent(employeeId);
      setShowEditModal(true);
      setGetEmployee(response?.data?.data);
    } catch (e) {
      console.log("🚀 ~ handleEditClick ~ e:", e);
    }
  };

  const handleDeleteClick = async (employeeId) => {
    if (permissionButton?.delete !== "1") {
      showSnackbar(
        "You don't have the permission to access the action",
        "error"
      );
      return;
    }
    try {
      const response = await fieldAgentService.deleteFieldAgent(employeeId);
      showSnackbar("Field Agent deleted successfully", "success");
      fetchEmployeeData(user);
    } catch (e) {
      showSnackbar("Field Agent deleted Failed", "error");
      console.log("🚀 ~ handleEditClick ~ e:", e);
    }
  };

  const handleViewClick = async (employeeId) => {
    if (permissionButton?.view !== "1") {
      showSnackbar(
        "You don't have the permission to access the action",
        "error"
      );
      return;
    }
    try {
      let response = await fieldAgentService.getSingleFieldAgent(employeeId);
      setShowViewModal(true);
      setGetEmployee(response?.data?.data);
    } catch (e) {
      console.log("🚀 ~ handleEditClick ~ e:", e);
    }
  };

  const handleEditSubmit = async (values) => {

    const payload = {
      name: values.name,
      fieldAgentEmail: values.fieldAgentEmail,
      mobile: values.mobile,
      nickName: values.nickName,
      isActive: values.inActive,
      status: values.status,
      role: {
        roleId: `${values.role}`,
      },
      createdBy: user && user.fieldAgentId,
    };
    await fieldAgentService
      .updateFieldAgent(values?.fieldAgentId, payload)
      .then((response) => {
        console.log("Employee updated:", response?.data);
        setShowEditModal(false);
        showSnackbar("Field Agent updated successfully", "success");
        fetchEmployeeData(user)
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
      });
  };

  // Filter and sort employees
  const filteredEmployees = (employees || []).filter((employee) => {
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


  console.log(filteredEmployees);

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
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmployees = sortedEmployees.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);

  function getTeamNamesAsString(teamDetails) {
    if (!Array.isArray(teamDetails)) {
      return "";
    }
    return teamDetails.map(team => team["teamName:"]).join(", ");
  }

  function getNamesAsString(role) {
    if (!Array.isArray(role)) {
      return "";
    }
    return role.map(team => team["roleName:"]).join(", ");
  }

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Agent Details - RealTimeTracking</title>
          <meta
            name="description"
            content="Overview of field agent performance and metrics."
          />
          <meta name="keywords" content="dashboard, field agent, management" />
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">Agent Details</h3>

          <div className="mt-5 fieldagentlist">
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
                    Agent Details
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
              <div className="col-md-2">
                <CustomAutocomplete
                  options={employeeData}
                  value={name}
                  label="Select Name"
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => setName(newValue)}
                  placeholder="Select name"
                  sx={{ backgroundColor: "white" }}
                />
              </div>

              <div className="col-md-3">

                <CustomAutocomplete
                  options={employeeData}
                  value={email}
                  label="Select email"
                  getOptionLabel={(option) => option.fieldAgentEmail}
                  onChange={(event, newValue) => setEmail(newValue)}
                  placeholder="Select email"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
              <div className="col-md-3">
                <CustomAutocomplete
                  options={employeeData}
                  value={mobile}
                  label="Select mobile"
                  getOptionLabel={(option) => option.mobile}
                  onChange={(event, newValue) => setMobile(newValue)}
                  placeholder="Select mobile"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
              <div className="col-md-2">
                <CustomAutocomplete
                  options={roleData}
                  value={role}
                  label="Select role"
                  getOptionLabel={(option) => option.role}
                  onChange={(event, newValue) => setRole(newValue)}
                  placeholder="Select role"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
              <div className="col-md-2">
                <CustomAutocomplete
                  options={teamData}
                  value={team}
                  label="Select team"
                  getOptionLabel={(option) => option?.teamName}
                  onChange={(event, newValue) => setTeam(newValue)}
                  placeholder="Select team"
                  sx={{ backgroundColor: "white" }}
                />
              </div>
            </div>

            {/* Table */}
            <table className="table table-striped">
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    Agent Name{" "}
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <FaSortUp style={{ color: "white" }} />
                      ) : (
                        <FaSortDown style={{ color: "white" }} />
                      ))}
                  </th>
                  <th onClick={() => handleSort("name")}>
                    Nick Name{" "}
                    {sortField === "name" &&
                      (sortOrder === "asc" ? (
                        <FaSortUp style={{ color: "white" }} />
                      ) : (
                        <FaSortDown style={{ color: "white" }} />
                      ))}
                  </th>
                  <th onClick={() => handleSort("fieldAgentEmail")}>
                    Email{" "}
                    {sortField === "fieldAgentEmail" &&
                      (sortOrder === "asc" ? (
                        <FaSortUp style={{ color: "white" }} />
                      ) : (
                        <FaSortDown style={{ color: "white" }} />
                      ))}
                  </th>
                  <th onClick={() => handleSort("mobile")}>
                    Mobile{" "}
                    {sortField === "mobile" &&
                      (sortOrder === "asc" ? (
                        <FaSortUp style={{ color: "white" }} />
                      ) : (
                        <FaSortDown style={{ color: "white" }} />
                      ))}
                  </th>
                  <th onClick={() => handleSort("status")}>
                    Role{" "}
                    {sortField === "status" &&
                      (sortOrder === "asc" ? (
                        <FaSortUp style={{ color: "white" }} />
                      ) : (
                        <FaSortDown style={{ color: "white" }} />
                      ))}
                  </th>

                  <th onClick={() => handleSort("status")}>
                    Team{" "}
                    {sortField === "status" &&
                      (sortOrder === "asc" ? (
                        <FaSortUp style={{ color: "white" }} />
                      ) : (
                        <FaSortDown style={{ color: "white" }} />
                      ))}
                  </th>
                  {/* <th onClick={() => handleSort("isActive")}>
                                        Active {sortField === "isActive" && (sortOrder === "asc" ? <FaSortUp style={{ color: "white" }} /> : <FaSortDown style={{ color: "white" }} />)}
                                    </th> */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee) => (
                    <tr key={employee.fieldAgentId}>
                    <td>{employee.name.replace(/\b\w/g, char => char.toUpperCase())}</td>
                    <td>{employee.nickName.replace(/\b\w/g, char => char.toUpperCase())}</td>
                      <td>{employee.fieldAgentEmail}</td>
                      <td>{employee.mobile}</td>
                      <td>{getNamesAsString(employee?.roleDetails).replace(/\b\w/g, char => char.toUpperCase())}</td>
                      <td>{getTeamNamesAsString(employee?.teamDetails).replace(/\b\w/g, char => char.toUpperCase())}</td>
                      <td>
                        <FaEdit
                          className="action-icon"
                          title="Edit"
                          style={{ cursor: "pointer", marginRight: "10px" }}
                          onClick={() => handleEditClick(employee.fieldAgentId)}
                        />
                        <FaEye
                          className="action-icon"
                          title="View"
                          style={{ cursor: "pointer", marginRight: "10px" }}
                          onClick={() => handleViewClick(employee.fieldAgentId)}
                        />
                        <FaTrashAlt
                          className="action-icon"
                          title="Delete"
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() =>
                            handleDeleteClick(employee.fieldAgentId)
                          }
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

            {/* Pagination */}
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

          {/* Edit Modal */}
          {showEditModal && (
            <EditAgent
              getEmployee={getEmployee}
              setShowEditModal={setShowEditModal}
              handleEditSubmit={handleEditSubmit}
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
                    <h5 className="modal-title">View Field Agent</h5>
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
                      <strong>Name:</strong> {getEmployee?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {getEmployee?.fieldAgentEmail}
                    </p>
                    <p>
                      <strong>Mobile:</strong> {getEmployee?.mobile}
                    </p>
                    <p>
                      <strong>Status:</strong> {getEmployee?.status}
                    </p>
                    <p>
                      <strong>Is Active:</strong>{" "}
                      {getEmployee?.isActive ? "Active" : "Inactive"}
                    </p>
                    <p>
                      <strong>Role:</strong> {getEmployee?.role?.role}
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
      )
      }
    </>
  );
};

export default adminLayout(FieldAgentList);
