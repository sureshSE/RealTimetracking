import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import fieldAgentService from "../../services/fieldAgentService";
import CustomAutocomplete from "../../components/filter/AutoComplete";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const FrequentlyVisitedMap = () => {
  const [mapInstance, setMapInstance] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const { user } = useContext(AuthContext);

  const [nameData, setNameData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [name, setName] = useState(null);
  const [team, setTeam] = useState(null);
  const [count, setCount] = useState(null);

  const countData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

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
          agentMail: "",
          startDate: "",
          teamId: "",
          endDate: "",
          roleId: "",
          frequentlyVisitedCount: count || null, // Set count if provided
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

        const frequentResponse = await fieldAgentService.getFrequent(request);
        setTrackingData(frequentResponse.data.data.content);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    filterEmployeeData();
  }, [name, team, count]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const initializeHEREMaps = async () => {
    const scriptUrls = [
      "https://js.api.here.com/v3/3.1/mapsjs-core.js",
      "https://js.api.here.com/v3/3.1/mapsjs-service.js",
      "https://js.api.here.com/v3/3.1/mapsjs-ui.js",
      "https://js.api.here.com/v3/3.1/mapsjs-mapevents.js",
    ];

    for (const src of scriptUrls) {
      if (!document.querySelector(`script[src="${src}"]`)) {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }
    }
  };

  const initRouteMap = (data) => {
    const mapContainer = document.getElementById("FrequentlyVisitedMap");
    if (!mapContainer) {
      console.error("Map container not found!");
      return;
    }

    if (mapInstance) {
      mapInstance.dispose(); // Dispose of the existing map instance
    }

    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0", // Replace with your HERE Maps API key
    });

    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
      zoom: 14,
      center: { lat: 11.08, lng: 76.995 },
    });

    // Enable interactions
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    H.ui.UI.createDefault(map, defaultLayers);

    // Add markers to the map
    data.forEach((item) => {
      const marker = new H.map.Marker(
        new H.geo.Point(item.latitude, item.longitude)
      );

      map.addObject(marker);

      marker.addEventListener("tap", () => {
        setModalData({
          teamName: item.teamName,
          name: item.nickName,
          agentMailId: item.agentMail,
          description: item.description,
          fieldTag: item.fieldTag,
        });
      });
    });

    setMapInstance(map); // Set the new map instance
  };

  useEffect(() => {
    if (!isLoading && trackingData.length > 0) {
      (async () => {
        try {
          await initializeHEREMaps();
          initRouteMap(trackingData);
        } catch (error) {
          console.error("Error initializing HERE Maps:", error);
        }
      })();
    }
    return () => {
      if (mapInstance) mapInstance.dispose();
    };
  }, [isLoading, trackingData]);

  return (
    <>
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
        <div className="col-md-3">
          <Autocomplete
            options={countData}
            value={count}
            onChange={(event, newValue) => setCount(newValue || "")}
            sx={{
              width: "100%",
              backgroundColor: "white",
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Filter by Count"
                placeholder="Enter count"
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>
      </div>
      <div
        id="FrequentlyVisitedMap"
        style={{
          width: "100%",
          height: "500px",
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
            <strong>Team Name:</strong> {modalData.teamName}
          </p>
          <p>
            <strong>Agent Email:</strong> {modalData.agentMailId}
          </p>
          <p>
            <strong>Name:</strong> {modalData.name}
          </p>
          <p>
            <strong>Field Tag:</strong> {modalData.fieldTag}
          </p>
          <p>
            <strong>Description:</strong> {modalData.description}
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

export default FrequentlyVisitedMap;
