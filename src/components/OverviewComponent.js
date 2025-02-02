import React, { useEffect, useState, useRef, useContext } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import "../assets/css/charts.css";
import fieldAgentService from "../services/fieldAgentService";
import CustomAutocomplete from "../components/filter/AutoComplete";

// import 'https://js.api.here.com/v3/3.1/mapsjs-ui.css'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { AuthContext } from "../context/AuthContext";

// Register the necessary components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const OverviewComponent = () => {
  const [counter, setCounter] = useState(0);
  const [numberValue, setNumberValue] = useState(100); // Initialize with some value
  const [userData, setUserData] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [trackingData, setTrackingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState(null); // State for modal data
  const { user } = useContext(AuthContext);
  const [overViewCount, setOverViewCount] = useState(null);
  const [nameData, setNameData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [name, setName] = useState(null);
  const [team, setTeam] = useState(null);

  const fetchData = async () => {
    const data = {
      query: "",
      variables: {
        fieldAgentId: `${user?.fieldAgentId.toString()}`,
        teamId: "",
        search: "",
        page: 0,
        limit: 20,
      },
    };
    const branch = await fieldAgentService.getTeams(data);
    setTeamData(branch?.data?.data?.content);
    setTeam(branch?.data?.data?.content[0]);
  };

  useEffect(() => {
    const filterEmployeeData = async (user) => {
      const payload = {};

      if (name) {
        payload.fieldAgent = name?.userId.toString();
      }
      if (team) {
        payload.teamId = team.teamId.toString();
      }

      await fieldAgentService
        .filterLivetracting(payload)
        .then((response) => {
          setTrackingData(response.data.data);
          if (!name?.userId) {
            setNameData(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    filterEmployeeData(user);
  }, [name, team]);

  useEffect(() => {
    fetchData();
    if (user) {
      setUserData(user);
      // fetchTrackingData(user);
      handleOverViewCount();
    }
  }, [user]);

  const handleOverViewCount = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `https://uat-tracking.rmtec.in/api/teams/count/${user.fieldAgentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Authorization header with Bearer token
          },
        }
      );

      const data = await response.json();

      if (data) {
        setOverViewCount(data);
        console.log("Tracking data fetched:", data);
      } else {
        console.error("Error fetching tracking data:", data);
      }
    } catch (error) {
      console.error("Error fetching live tracking data:", error);
    } finally {
      setIsLoading(false); // Set loading to false once data is fetched
    }
  };

  const [routeMap, setRouteMap] = useState(null);

  // Function to dynamically load HERE Maps scripts
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => {
        console.log(`Script loaded: ${src}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject();
      };
      document.head.appendChild(script);
    });
  };

  // Function to initialize HERE Maps scripts
  const initializeHEREMaps = async () => {
    await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
    await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
    await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
    await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");
  };

  const initRouteMap = (trackingData) => {
    const H = window.H;

    // Check if map already exists and dispose of it
    if (routeMap) {
      routeMap.dispose();
      setRouteMap(null);
    }

    if (trackingData.length > 0) {
      const platform = new H.service.Platform({
        apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0", // Replace with your API key
      });

      const defaultLayers = platform.createDefaultLayers();
      const map = new H.Map(
        document.getElementById("routeMap"),
        defaultLayers.vector.normal.map,
        { zoom: 14, center: { lat: 11.08, lng: 76.995 } }
      );

      new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      H.ui.UI.createDefault(map, defaultLayers);

      // Add markers
      for (const data of trackingData) {
        const marker = new H.map.Marker({
          lat: data.lat,
          lng: data.lon,
        });
        map.addObject(marker);
        marker.addEventListener("tap", (evt) => {
          setModalData({
            mobile: data.mobile,
            name: data.nickName,
            agentMailId: data.emailId,
          });
        });
      }

      // Update the routeMap state
      setRouteMap(map);
    }
  };

  // useEffect to initialize maps and clean up
  useEffect(() => {
    (async () => {
      try {
        console.log("Initializing HERE Maps...");
        await initializeHEREMaps();
        console.log("HERE Maps scripts loaded.");
        initRouteMap(trackingData);
      } catch (error) {
        console.error("Error initializing HERE Maps:", error);
      }
    })();

    return () => {
      console.log("Cleaning up HERE Maps...");
      document
        .querySelectorAll('script[src^="https://js.api.here.com"]')
        .forEach((script) => document.head.removeChild(script));
      if (routeMap) routeMap.dispose();
    };
  }, [trackingData]);


  return (
    <div className="container mt-5">
      {/* <h2>Dashboard</h2> */}

      {/* Cards Section */}
      <div className="row mb-4">
        <div className="col-xl-3 col-sm-6 mb-3">
          <div className="card text-white  o-hidden h-100">
            <div className="card-body">
              <div
                style={{
                  fontWeight: "400",
                  fontSize: "18px",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                Active field Agents
              </div>
              <div
                className="mr-5"
                style={{
                  fontWeight: "600",
                  fontSize: "30px",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                {overViewCount?.fieldAgentCount}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 mb-3">
          <div className="card text-white  o-hidden h-100">
            <div className="card-body">
              <div
                style={{
                  fontWeight: "400",
                  fontSize: "18px",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                Total Routes Today
              </div>
              <div
                className="mr-5"
                style={{
                  fontWeight: "600",
                  fontSize: "30px",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                {0}
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-sm-6 mb-3">
          <div className="card text-white  o-hidden h-100">
            <div className="card-body">
              <div
                style={{
                  fontWeight: "400",
                  fontSize: "18px",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                SOS Alerts
              </div>
              <div
                className="mr-5"
                style={{
                  fontWeight: "600",
                  fontSize: "30px",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                {overViewCount?.sosCount}
              </div>
            </div>
          </div>
        </div>
        {user.role.role !== "FieldAgent" && (
          <div className="col-xl-3 col-sm-6 mb-3">
            <div className="card text-white bg-success o-hidden h-100">
              <div className="card-body">
                <div
                  className="mr-5"
                  style={{ fontWeight: "600", fontSize: "20px" }}
                >
                  FieldAgent Schedule
                </div>
              </div>
              <div className="card-footer text-white clearfix small z-1">
                <button
                  type="button"
                  className="btn btn-light float-left mr-2"
                  style={{
                    fontWeight: "600",
                    fontSize: "10px",
                    marginRight: "10px",
                  }}
                  onClick={() => (window.location.href = "/schedule-list")}
                >
                  Schedule List
                </button>
                <button
                  type="button"
                  className="btn btn-light float-left"
                  style={{ fontWeight: "600", fontSize: "10px" }}
                  onClick={() => (window.location.href = "/schedule-add")}
                >
                  Add a New Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div
        className="row mb-6"
        style={{
          backgroundColor: "#0d6efd",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
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
      </div>

      {/* Charts Section */}
      <div className="row">
        <div>
          {/* <h1>Live Tracking Map</h1> */}
          <div
            id="routeMap"
            style={{
              width: "100%",
              height: "500px",
              border: "1px solid #ccc",
              marginTop: "20px",
            }}
          ></div>

          {isLoading && <p>Loading tracking data...</p>}

          {/* Modal for marker details */}
          {modalData && (
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                zIndex: 1000,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3>Agent Details</h3>
              <p>
                <strong>Agent Email:</strong> {modalData.agentMailId}
              </p>
              <p>
                <strong>Name:</strong> {modalData.name}
              </p>
              <p>
                <strong>Mobile:</strong> {modalData.mobile}
              </p>
              <button
                style={{
                  marginTop: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setModalData(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        {/* <h2>Overview Component</h2>
      <div id="map" style={{ width: '100%', height: '500px' }}></div>
      {isLoading ? (
        <p>Loading tracking data...</p>
      ) : (
        <p>Showing {trackingData.length} live locations on the map.</p>
      )}
    </div> */}
      </div>
    </div>
  );
};

export default OverviewComponent;
