import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import fieldAgentService from "../../services/fieldAgentService";
import CustomAutocomplete from "../../components/filter/AutoComplete";

const RouteMap = () => {
  const { user } = useContext(AuthContext);
  const [mapInstance, setMapInstance] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
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
    const filterEmployeeData = async () => {
      const payload = {};
      const request = {
        query: "",
        variables: {
          userId: "",
          startDate: "",
          roleId: "",
          timeSpentDetail: "",
          location: "",
          search: "",
          page: 0,
          limit: 20,
        },
      };

      if (name) {
        payload.fieldAgent = name?.userId.toString();
        request.variables.fieldAgent = name?.userId.toString();
      }
      if (team) {
        payload.teamId = team.teamId.toString();
        request.variables.teamId = team.teamId.toString();
      }

      try {
        const liveTrackingResponse = await fieldAgentService.filterLivetracting(
          payload
        );
        if (!name?.userId) {
          setNameData(liveTrackingResponse.data.data);
        }

        const routeAnalysisResponse = await fieldAgentService.getRouteAnalysis(
          request
        );
        setTrackingData(routeAnalysisResponse.data.data.content);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    filterEmployeeData();
  }, [name, team]);

  useEffect(() => {
    if (user) fetchTrackingData(user);
    fetchData();
  }, [user]);

  const loadMap = (trackingData) => {
    if (!trackingData.length || !window.H) {
      console.error("HERE Maps library is not loaded or no tracking data.");
      return;
    }

    // Dispose of the previous map instance if it exists
    if (mapInstance) {
      mapInstance.dispose();
    }

    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0", // Replace with your API key
    });
    const defaultLayers = platform.createDefaultLayers();
    const mapContainer = document.getElementById("routeMap");

    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
      zoom: 10,
      center: { lat: 0, lng: 0 },
    });

    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    const validPoints = trackingData
      .filter(
        (data) =>
          data.latitude &&
          data.longitude &&
          !isNaN(parseFloat(data.latitude)) &&
          !isNaN(parseFloat(data.longitude))
      )
      .map((data) => ({
        lat: parseFloat(data.latitude),
        lng: parseFloat(data.longitude),
        ...data,
      }));

    if (!validPoints.length) {
      console.warn("No valid latitude/longitude found in data.");
      return;
    }

    const lineString = new H.geo.LineString();
    validPoints.forEach((point) => lineString.pushPoint(point));

    const polyline = new H.map.Polyline(lineString, {
      style: { strokeColor: "blue", lineWidth: 4 },
    });
    map.addObject(polyline);

    const startPoint = validPoints[0];
    const endPoint = validPoints[validPoints.length - 1];

    const startIcon = new H.map.Icon(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="green" stroke="black" stroke-width="1"><circle cx="12" cy="12" r="10"/></svg>'
    );
    const startMarker = new H.map.Marker(
      { lat: startPoint.lat, lng: startPoint.lng },
      { icon: startIcon }
    );
    map.addObject(startMarker);

    const endIcon = new H.map.Icon(
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" stroke="black" stroke-width="1"><circle cx="12" cy="12" r="10"/></svg>'
    );
    const endMarker = new H.map.Marker(
      { lat: endPoint.lat, lng: endPoint.lng },
      { icon: endIcon }
    );
    map.addObject(endMarker);

    startMarker.addEventListener("tap", () =>
      setModalData({
        name: startPoint.nickName || "Unknown",
        agentMailId: startPoint.agentMailId || "Not Provided",
        teamName: startPoint.teamName || "Not Available",
        fieldTag: startPoint.fieldTag || "No Tag",
        date: new Date(startPoint.startTime).toLocaleString(),
      })
    );

    endMarker.addEventListener("tap", () =>
      setModalData({
        name: endPoint.nickName || "Unknown",
        agentMailId: endPoint.agentMailId || "Not Provided",
        teamName: endPoint.teamName || "Not Available",
        fieldTag: endPoint.fieldTag || "No Tag",
        date: new Date(endPoint.startTime).toLocaleString(),
      })
    );

    map.getViewModel().setLookAtData({ bounds: polyline.getBoundingBox() });
    setMapInstance(map);
  };

  useEffect(() => {
    loadMap(trackingData);
  }, [trackingData]);

  const fetchTrackingData = async (user) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://uat-tracking.rmtec.in/api/liveTrackingId/getAllLiveTrackingIdDetails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: "",
            variables: {
              userId: "203",
              startDate: "",
              teamId: "52",
              roleId: "",
              timeSpentDetail: "false",
              location: "",
              search: "",
              page: 0,
              limit: 20,
            },
          }),
        }
      );
      const data = await response.json();
      if (data.statusCode === 200) {
        setTrackingData(data.data.content);
      } else {
        console.error("Error fetching tracking data:", data);
      }
    } catch (error) {
      console.error("Error fetching live tracking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
      <div
        id="routeMap"
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#ddd",
        }}
      ></div>

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
            <strong>Team Name:</strong> {modalData.teamName}
          </p>
          <p>
            <strong>Field Tag:</strong> {modalData.fieldTag}
          </p>
          <p>
            <strong>Date and time:</strong> {modalData.date}
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
    </>
  );
};

export default RouteMap;
