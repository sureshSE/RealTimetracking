import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import fieldAgentService from "../../services/fieldAgentService";
import CustomAutocomplete from "../../components/filter/AutoComplete";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import axios from "axios";

const RouteMap = () => {
  const { user } = useContext(AuthContext);
  const [mapInstance, setMapInstance] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [nameData, setNameData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [date, setDate] = useState(null);
  const [startDate, setstartDate] = useState(null);
  const [team, setTeam] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

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
          roleId: "",
          timeSpentDetail: "false",
          location: "",
          search: "",
          page: 0,
          limit: 200,
        },
      };

      if (selectedNames.length) {
        payload.userIds = selectedNames.map((user) => user.userId.toString());
        request.variables.userIds = selectedNames.map((user) =>
          user.userId.toString()
        );
      }
      if (team) {
        payload.teamId = team.teamId.toString();
        request.variables.teamId = team.teamId.toString();
      }

      if (fromDate) {
        request.variables.startDate = fromDate ? fromDate.toString() : "";
      }

      if (toDate) {
        request.variables.endDate = toDate ? toDate.toString() : "";
      }

      try {
        const liveTrackingResponse = await fieldAgentService.filterLivetracting(
          payload
        );
        if (!selectedNames.length) {
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
  }, [selectedNames, team, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const loadMap = (trackingData) => {
    if (!trackingData.length || !window.H) {
      console.error("HERE Maps library is not loaded or no tracking data.");
      return;
    }

    if (mapInstance) {
      mapInstance.dispose();
    }

    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0",
    });
    const defaultLayers = platform.createDefaultLayers();
    const mapContainer = document.getElementById("routeMap");

    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
      zoom: 10,
      center: { lat: 0, lng: 0 },
    });

    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    // const validPoints = trackingData
    //   .filter(
    //     (data) =>
    //       data.latitude &&
    //       data.longitude &&
    //       !isNaN(parseFloat(data.latitude)) &&
    //       !isNaN(parseFloat(data.longitude))
    //   )
    //   .map((data) => ({
    //     lat: parseFloat(data.latitude),
    //     lng: parseFloat(data.longitude),
    //     ...data,
    //   }));

    // if (!validPoints.length) {
    //   console.warn("No valid latitude/longitude found in data.");
    //   return;
    // }

    // const lineString = new H.geo.LineString();
    // validPoints.forEach((point) => lineString.pushPoint(point));

    // const polyline = new H.map.Polyline(lineString, {
    //   style: { strokeColor: "blue", lineWidth: 4 },
    // });
    // map.addObject(polyline);

    // const startPoint = validPoints[0];
    // const endPoint = validPoints[validPoints.length - 1];
    const userColors = {}; // To store assigned colors for each user ID
    const getUserColor = (userId) => {
      if (!userColors[userId]) {
        // Generate a random color for the user if not already assigned
        userColors[userId] = `#${Math.floor(Math.random() * 16777215).toString(
          16
        )}`;
      }
      return userColors[userId];
    };

    const usersData = trackingData.reduce((acc, data) => {
      if (data.userId) {
        acc[data.userId] = acc[data.userId] || [];
        if (
          data.latitude &&
          data.longitude &&
          !isNaN(parseFloat(data.latitude)) &&
          !isNaN(parseFloat(data.longitude))
        ) {
          acc[data.userId].push({
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude),
            ...data,
          });
        }
      }
      return acc;
    }, {});

    const allPoints = []; // To collect all points for setting bounds

    Object.keys(usersData).forEach((userId) => {
      const userPoints = usersData[userId];

      if (!userPoints.length) return;

      const lineString = new H.geo.LineString();
      userPoints.forEach((point) => {
        lineString.pushPoint({ lat: point.lat, lng: point.lng });
        allPoints.push({ lat: point.lat, lng: point.lng }); // Collect points for bounds
      });

      const polyline = new H.map.Polyline(lineString, {
        style: { strokeColor: getUserColor(userId), lineWidth: 4 },
      });
      map.addObject(polyline);

      const startPoint = userPoints[0];
      const endPoint = userPoints[userPoints.length - 1];

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
    });
  };

  // const loadMap = (trackingData) => {
  //   try {
  //     if (!trackingData.length || !window.H) {
  //       console.error("HERE Maps library is not loaded or no tracking data.");
  //       return;
  //     }

  //     if (mapInstance) {
  //       mapInstance.dispose();
  //     }

  //     const H = window.H;
  //     const platform = new H.service.Platform({
  //       apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0",
  //     });
  //     const defaultLayers = platform.createDefaultLayers();
  //     const mapContainer = document.getElementById("routeMap");

  //     if (!mapContainer) {
  //       console.error("Map container element not found.");
  //       return;
  //     }

  //     const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
  //       zoom: 10,
  //       center: { lat: 0, lng: 0 },
  //     });

  //     new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  //     H.ui.UI.createDefault(map, defaultLayers);

  //     const userColors = {}; // To store assigned colors for each user ID
  //     const getUserColor = (userId) => {
  //       if (!userColors[userId]) {
  //         // Generate a random color for the user if not already assigned
  //         userColors[userId] = `#${Math.floor(
  //           Math.random() * 16777215
  //         ).toString(16)}`;
  //       }
  //       return userColors[userId];
  //     };

  //     const usersData = trackingData.reduce((acc, data) => {
  //       if (data.userId) {
  //         acc[data.userId] = acc[data.userId] || [];
  //         if (
  //           data.latitude &&
  //           data.longitude &&
  //           !isNaN(parseFloat(data.latitude)) &&
  //           !isNaN(parseFloat(data.longitude))
  //         ) {
  //           acc[data.userId].push({
  //             lat: parseFloat(data.latitude),
  //             lng: parseFloat(data.longitude),
  //             ...data,
  //           });
  //         }
  //       }
  //       return acc;
  //     }, {});

  //     const allPoints = []; // To collect all points for setting bounds

  //     Object.keys(usersData).forEach((userId) => {
  //       const userPoints = usersData[userId];

  //       if (!userPoints.length) return;

  //       const lineString = new H.geo.LineString();
  //       userPoints.forEach((point) => {
  //         lineString.pushPoint({ lat: point.lat, lng: point.lng });
  //         allPoints.push({ lat: point.lat, lng: point.lng }); // Collect points for bounds
  //       });

  //       const polyline = new H.map.Polyline(lineString, {
  //         style: { strokeColor: getUserColor(userId), lineWidth: 4 },
  //       });
  //       map.addObject(polyline);

  //       const startPoint = userPoints[0];
  //       const endPoint = userPoints[userPoints.length - 1];

  //       const startIcon = new H.map.Icon(
  //         '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="green" stroke="black" stroke-width="1"><circle cx="12" cy="12" r="10"/></svg>'
  //       );
  //       const startMarker = new H.map.Marker(
  //         { lat: startPoint.lat, lng: startPoint.lng },
  //         { icon: startIcon }
  //       );
  //       map.addObject(startMarker);

  //       const endIcon = new H.map.Icon(
  //         '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="red" stroke="black" stroke-width="1"><circle cx="12" cy="12" r="10"/></svg>'
  //       );
  //       const endMarker = new H.map.Marker(
  //         { lat: endPoint.lat, lng: endPoint.lng },
  //         { icon: endIcon }
  //       );
  //       map.addObject(endMarker);

  //       startMarker.addEventListener("tap", () =>
  //         setModalData({
  //           name: startPoint.nickName || "Unknown",
  //           agentMailId: startPoint.agentMailId || "Not Provided",
  //           teamName: startPoint.teamName || "Not Available",
  //           fieldTag: startPoint.fieldTag || "No Tag",
  //           date: new Date(startPoint.startTime).toLocaleString(),
  //         })
  //       );

  //       endMarker.addEventListener("tap", () =>
  //         setModalData({
  //           name: endPoint.nickName || "Unknown",
  //           agentMailId: endPoint.agentMailId || "Not Provided",
  //           teamName: endPoint.teamName || "Not Available",
  //           fieldTag: endPoint.fieldTag || "No Tag",
  //           date: new Date(endPoint.startTime).toLocaleString(),
  //         })
  //       );
  //     });

  //     if (allPoints.length) {
  //       // Create bounding box from all points
  //       const boundingBox = allPoints.reduce(
  //         (bbox, point) => bbox.extend(new H.geo.Point(point.lat, point.lng)),
  //         H.geo.Rect.fromPoints(
  //           new H.geo.Point(allPoints[0].lat, allPoints[0].lng),
  //           new H.geo.Point(allPoints[0].lat, allPoints[0].lng)
  //         )
  //       );

  //       // Set map bounds to focus on the points
  //       map.getViewModel().setLookAtData({
  //         bounds: boundingBox,
  //         animate: true, // Smooth zoom to the bounding box
  //       });
  //     }

  //     setMapInstance(map);
  //   } catch (error) {
  //     console.error("Error in loadMap function:", error);
  //   }
  // };

  useEffect(() => {
    loadMap(trackingData);
  }, [trackingData]);

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
              setSelectedNames([]);
            }}
            placeholder="Select team"
            sx={{ backgroundColor: "white" }}
          />
        </div>
        <div className="col-md-3">
          <Autocomplete
            multiple
            options={nameData}
            value={selectedNames}
            getOptionLabel={(option) => option.name}
            onChange={(event, newValue) => setSelectedNames(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Names"
                placeholder="Select multiple names"
                sx={{ backgroundColor: "white" }}
              />
            )}
          />
        </div>
        <div className="col-md-3">
          <TextField
            type="date"
            name="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ backgroundColor: "white" }}
          />
        </div>
        <div className="col-md-3">
          <TextField
            type="date"
            name="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            variant="outlined"
            fullWidth
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
