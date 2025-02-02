import React, { useState, useEffect, useContext } from "react";
import { Card, ListGroup, Tab, Nav, Form } from "react-bootstrap";
import adminLayout from "../hoc/adminLayout";
import HotspotComponent from "../components/HotspotComponent";
import RealtimeComponent from "../components/RealtimeComponent";
import "../assets/css/RealTime.css";
// import '../assets/css/bootstrap.min.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
// import { Helmet } from "react-helmet";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons"; // Import the location icon
import useHasPermission from "../utils/permission/pageAccess";
import { AuthContext } from "../context/AuthContext";
import ScheduleComponent from "../components/ScheduleComponent";
import AgentComponent from "../components/AgentComponent";

const RealTimeTracking = () => {
  const { user } = useContext(AuthContext);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [teamData, setTeamData] = useState([]);
  const [agent, setAgentName] = useState("");
  const [userName, setUserName] = useState("");
  const { render } = useHasPermission({
    moduleName: "realTimeTracking",
  });
  const [fieldAgentData, SetFieldAgentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setAgentName(user);
      setUserName(user);
      handleTrakingUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (teamData.length > 0) {
      const firstTeam = teamData[0];
      setSearchTerm(firstTeam.teamName);
      SetFieldAgentData(firstTeam.agentUser);

      if (firstTeam.agentUser.length > 0) {
        const firstAgent = firstTeam.agentUser[0];
        handleAgentClick(firstAgent);
      }
    }
  }, [teamData]);

  const handleTrakingUser = async (user) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://uat-tracking.rmtec.in:4000/api/teams/getAllTeamDetails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Authorization header with Bearer token
          },
          body: JSON.stringify({
            fieldAgentId: `${user?.fieldAgentId}`,
          }),
        }
      );

      const data = await response.json();
      if (data.statusCode === 200) {
        setTeamData(data.data);
      } else {
        console.error("Error fetching tracking data:", data);
      }

      if (data.statusCode === 500) {
        setTeamData([]);
      }
    } catch (error) {
      console.error("Error fetching live tracking data:", error);
    } finally {
    }
  };

  const handleAgentClick = async (agent) => {
    if (agent) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `https://uat-tracking.rmtec.in:4000/api/fieldAgent/realTimeTrackingDetails/${agent.fieldAgentId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Authorization header with Bearer token
            },
          }
        );

        const data = await response.json();

        if (data.statusCode === 201) {
          setSelectedAgent(data.data); // Set the selected agent to show their details
        }
      } catch (error) {
        console.log("--error mesage-->", error);
      }
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredData(teamData); // Show all data when the search term is empty
    } else {
      const filtered = teamData.filter((item) =>
        item.teamName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const handleSelect = (item) => {
    setSearchTerm(item.teamName);
    SetFieldAgentData(item?.agentUser);
    setDropdownVisible(false);
  };

  const handleMouseEnter = () => {
    setFilteredData(teamData); // Show all data on mouse enter
    setDropdownVisible(true);
  };


  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>RealTime Tracking - RealTimeTracking</title>
          <meta
            name="description"
            content="Overview of employee performance and metrics."
          />
          <meta name="keywords" content="dashboard, employee, management" />
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">RealTime Tracking</h3>
          <div className="container py-4 fieldagentmange">
            <div className="row">
              {/* Left panel: 4-column grid for agent cards */}
              <div className="col-md-4 profile">
                <h4>Agent Profiles</h4>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  onMouseEnter={handleMouseEnter}
                  placeholder="Select a team name"
                  style={{
                    width: "100%",
                    padding: "8px",
                    boxSizing: "border-box",
                  }}
                />
                {dropdownVisible && (
                  <ul
                    style={{
                      position: "absolute",
                      width: "25%",
                      border: "1px solid #ccc",
                      maxHeight: "150px",
                      overflowY: "auto",
                      background: "#fff",
                      listStyleType: "none",
                      padding: "0",
                      margin: "0",
                      zIndex: 1000,
                    }}
                  >
                    {filteredData.map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleSelect(item)}
                        style={{
                          padding: "8px",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f1f1f1")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#fff")
                        }
                      >
                        {item.teamName}
                      </li>
                    ))}
                  </ul>
                )}
                {/* </div> */}
                <div className="agent-list">
                  {fieldAgentData.length > 0 &&
                    fieldAgentData.map((agent) => (
                      <Card
                        key={agent.id}
                        className="mb-3 agentcards"
                        onClick={() => handleAgentClick(agent)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Body className="">
                          <div className="d-flex ">
                            {/* <img
                              src={agent.image}
                              alt={agent.name}
                              className="rounded-circle me-3"
                              style={{ width: "50px", height: "50px" }}
                            /> */}
                            {agent.name ? (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  agent.name
                                )}&background=fff&color=007bff&size=150`}
                                className="rounded-circle me-3"
                                style={{ width: "50px", height: "50px" }}
                                alt={agent.name}
                                title={agent.name}
                              />
                            ) : (
                              <img
                                src=""
                                className="img-responsive profile-img-center"
                                alt="Default Avatar"
                              />
                            )}
                            <div>
                              {/* <Card.Title>{agent.name}</Card.Title> */}
                              <Card.Title>
                                {agent.name.replace(/\b\w/g, (char) =>
                                  char.toUpperCase()
                                )}
                              </Card.Title>

                              <Card.Text style={{ color: "#fff" }}>
                                {searchTerm} | {agent.role}
                              </Card.Text>
                              {/* <Card.Text
                                style={{
                                  backgroundColor: "#fff",
                                  padding: "5px",
                                  borderRadius: "5px",
                                  color: "#000000",
                                }}
                              >
                                <small>
                                  <FontAwesomeIcon icon={faMapMarkerAlt} />{" "}
                                 Location icon 
                                  {agent.location}
                                </small>
                              </Card.Text>*/}
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                </div>
              </div>

              {/* Right panel: 8-column grid for tabs and content */}
              <div className="col-md-8 details">
                {/* <h4>Agent Details</h4> */}
                {selectedAgent && (
                  <>
                    {/* Display agent details */}
                    <Card className="mb-3 agent-details-card">
                      <div className="d-flex align-items-center">
                        {/* <img
                          src={selectedAgent.image}
                          alt={selectedAgent.name}
                          className="agent-image"
                        /> */}
                        {selectedAgent.name ? (
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              selectedAgent.name
                            )}&background=007bff&color=fff&size=150`}
                            className="img-responsive profile-img-center"
                            alt={selectedAgent.name}
                            title={selectedAgent.name}
                          />
                        ) : (
                          <img
                            src=""
                            className="img-responsive profile-img-center"
                            alt="Default Avatar"
                          />
                        )}
                        <Card.Body className="ms-3">
                          {" "}
                          {/* Added margin start to give space from the image */}
                          <Card.Title>
                            {selectedAgent && selectedAgent.name}
                          </Card.Title>
                          <Card.Text>
                            <strong>Designation:</strong>{" "}
                            {selectedAgent.designation}
                          </Card.Text>
                          <Card.Text>
                            <strong>Team:</strong> {searchTerm}
                          </Card.Text>
                          {/* <Card.Text>
                            <strong>Profile:</strong> {selectedAgent.profile}
                          </Card.Text> */}
                        </Card.Body>
                      </div>
                    </Card>

                    {/* Tabs for additional content */}
                    <Tab.Container defaultActiveKey="mapView">
                      <Nav variant="tabs">
                        <Nav.Item>
                          <Nav.Link eventKey="mapView">Map View</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="agentStatus">
                            Agent Status
                          </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="schedule">Schedule</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="placeInterest">Hotspot</Nav.Link>
                        </Nav.Item>
                      </Nav>
                      <Tab.Content className="mt-3">
                        <Tab.Pane eventKey="mapView">
                          {/* Map component goes here */}
                          <div
                            className="map-container"
                            style={{ height: "300px", background: "#eaeaea" }}
                          >
                            {/* <p>Map view for {selectedAgent.name}</p> */}
                            <div className="overview-con">
                              <RealtimeComponent
                                AgentId={selectedAgent.userId}
                              />
                            </div>
                            <div
                              id="mapContainer"
                              style={{ width: "100%", height: "400px" }}
                            ></div>
                          </div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="agentStatus">
                          <AgentComponent formData={selectedAgent} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="schedule">
                          <ScheduleComponent formData={selectedAgent} />
                        </Tab.Pane>
                        <Tab.Pane eventKey="placeInterest">
                          <div className="overview-con">
                            <HotspotComponent formData={selectedAgent} />
                          </div>
                        </Tab.Pane>
                      </Tab.Content>
                    </Tab.Container>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default adminLayout(RealTimeTracking);
