import React, { useState, useEffect, useContext } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import "../assets/css/charts.css";
import { Card, ListGroup, Tab, Nav, Form } from "react-bootstrap";

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

const AnalyticsComponent = () => {
  const [userData, setUserData] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, []);

  useEffect(() => {
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error) => {
          console.error(`Failed to load script: ${src}`, error);
          reject(new Error(`Failed to load ${src}`));
        };
        document.head.appendChild(script);
      });
    };

    const loadHereMapsScripts = async () => {
      try {
        console.log("Loading HERE Maps Scripts...");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");

        const H = window.H;
        if (!H) {
          throw new Error("HERE Maps API is not available");
        }

        const platform = new H.service.Platform({
          apikey: "pQRBSzF1TdNTk2W6Z5pCNpDtmGAYH624qC7LU0cf6Xw", // Replace with your API key
        });

        const defaultLayers = platform.createDefaultLayers();
        const map = new H.Map(
          document.getElementById("mapContainer"),
          defaultLayers.vector.normal.map,
          {
            zoom: 15,
            center: { lat: 11.08, lng: 76.995 },
          }
        );

        const behavior = new H.mapevents.Behavior(
          new H.mapevents.MapEvents(map)
        );
        const ui = H.ui.UI.createDefault(map, defaultLayers);

        // Function to fetch live tracking data dynamically
        const fetchLiveTrackingData = async (map, ui) => {
          try {
            const response = await fetch(
              "https://uat-tracking.rmtec.in/api/liveTrackingId/getAllLiveTrackingIdDetails",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  query: "",
                  variables: {
                    fieldAgentId: userData?.fieldAgentId,
                    roleId: userData.role.userId,
                    agentMail: "",
                    startDate: "2024-11-29",
                    endDate: "2024-11-29",
                    teamId: "2054",
                    search: "",
                    page: 0,
                    limit: 20,
                  },
                }),
              }
            );

            const data = await response.json();

            if (data && data.data && data.data.content) {
              return data.data.content; // Return the live tracking details
            } else {
              console.error("No live tracking data found.");
              return [];
            }
          } catch (error) {
            console.error("Error fetching live tracking data:", error);
            return [];
          }
        };

        // Fetch dynamic tracking data and process
        const liveTrackingDetails = await fetchLiveTrackingData();
        console.log("Live Tracking Details:", liveTrackingDetails);

        const lineColors = ["blue", "red", "green", "purple", "orange"];
        const userIcons = [
          "https://img.icons8.com/color/48/000000/marker.png", // Icon for User 1
          "https://img.icons8.com/office/48/000000/marker.png", // Icon for User 2
          "https://img.icons8.com/ios/48/000000/marker.png", // Icon for User 3
          "https://img.icons8.com/plasticine/48/000000/marker.png", // Icon for User 4
          "https://img.icons8.com/color/48/000000/marker.png", // Icon for User 5
        ];

        // Group the live tracking data by field agent (or another identifier if necessary)
        const agentsData = {};

        liveTrackingDetails.forEach((detail) => {
          const agentId = detail.fieldAgentId;
          if (!agentsData[agentId]) {
            agentsData[agentId] = [];
          }
          agentsData[agentId].push({
            lat: parseFloat(detail.latitude),
            lng: parseFloat(detail.longitude),
          });
        });

        // Add markers and routes for each agent
        let userIndex = 0;
        Object.keys(agentsData).forEach((agentId) => {
          const points = agentsData[agentId];

          // Add a marker for each point (location)
          points.forEach((point, index) => {
            const marker = new H.map.Marker(point, {
              icon: new H.map.Icon(userIcons[userIndex % userIcons.length]), // Use icon based on user index
            });

            marker.setData(
              index === 0
                ? `Agent ${agentId} Start`
                : index === points.length - 1
                  ? `Agent ${agentId} End`
                  : `Agent ${agentId} Point ${index}`
            );
            map.addObject(marker);
          });

          // Create and add polylines for the route between points
          for (let i = 0; i < points.length - 1; i++) {
            const origin = points[i];
            const destination = points[i + 1];

            const routeRequest = `https://router.hereapi.com/v8/routes?apikey=pQRBSzF1TdNTk2W6Z5pCNpDtmGAYH624qC7LU0cf6Xw&transportMode=car&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&return=polyline`;

            fetch(routeRequest)
              .then((response) => response.json())
              .then((data) => {
                if (data.routes && data.routes[0]) {
                  const route = data.routes[0];
                  const routeShape = route.sections[0].polyline;
                  const routeLineString =
                    H.geo.LineString.fromFlexiblePolyline(routeShape);

                  const routePolyline = new H.map.Polyline(routeLineString, {
                    style: {
                      lineWidth: 6,
                      strokeColor: lineColors[userIndex % lineColors.length],
                    },
                  });

                  map.addObject(routePolyline);
                  map.getViewModel().setLookAtData({
                    bounds: routePolyline.getBoundingBox(),
                  });
                } else {
                  console.error(
                    `No route found for segment from ${origin.lat},${origin.lng} to ${destination.lat},${destination.lng}`
                  );
                }
              })
              .catch((error) => {
                console.error("Error fetching route:", error);
              });
          }

          userIndex++; // Increment userIndex for each agent
        });
      } catch (error) {
        console.error(
          "Error loading HERE Maps or processing live tracking data:",
          error
        );
      }
    };

    loadHereMapsScripts();

    return () => {
      document
        .querySelectorAll('script[src^="https://js.api.here.com"]')
        .forEach((script) => {
          document.head.removeChild(script);
        });
    };
  }, []);





  return (
    <div
      id="mapContainer"
      style={{ width: "100%", height: "300px" }}
    ></div>
  );
};

export default AnalyticsComponent;


// import React, { useState, useEffect } from "react";
// import { Client } from "@stomp/stompjs";
// import SockJS from "sockjs-client";

// const AlertForm = () => {
//   const [formData, setFormData] = useState({
//     teamId: "",
//     userId: "",
//     lat: "",
//     lng: "",
//     priorityLevel: "LOW",
//   });
//   const [log, setLog] = useState([]);

//   const BEARER_TOKEN =
//     "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdXRob3JpdGllcyI6WyJGaWVsZEFnZW50SWRfMiIsIkFnZW50TWFpbF9kaGFybWF0aXJ1cHVyMjM1QGdtYWlsLmNvbSIsIkFnZW50TmFtZV9odSIsIlRlYW1JRF8yIiwiVGVhbU5hbWVfVGVhbSBBbHBoYSIsIlVzZXJJZF8yIiwiUm9sZUlkXzIiLCJSb2xlTmFtZV9NYW5hZ2VyIl0sInN1YiI6ImRoYXJtYXRpcnVwdXIyMzVAZ21haWwuY29tIiwiaWF0IjoxNzMzMTM5NTAzLCJleHAiOjE3NjQ2NzU1MDN9.poTZcbioRqPXYuCDt4oyC8Mx2iaGZlNsOs-U8H-vap8";

//   useEffect(() => {
//     const client = new Client({
//       webSocketFactory: () => new SockJS("http://uat-tracking.rmtech.in/tracking-websocket"),
//       connectHeaders: {
//         Authorization: BEARER_TOKEN,
//       },
//       debug: (str) => console.log(str),
//       onConnect: () => {
//         logMessage("Connected to WebSocket server");

//         // Subscribe to the alerts topic
//         client.subscribe("/emergency/alerts/**", (message) => {
//           logMessage("Alert Message: " + message.body);
//         });
//       },
//       onStompError: (frame) => {
//         logMessage("Error: " + frame.headers["message"]);
//       },
//       onWebSocketClose: () => logMessage("WebSocket connection closed"),
//     });

//     client.activate();

//     return () => {
//       client.deactivate();
//       logMessage("WebSocket connection deactivated");
//     };
//   }, []);

//   const handleInputChange = (e) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [id]: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     const alertPayload = {
//       teamId: formData.teamId,
//       userId: formData.userId,
//       lat: parseFloat(formData.lat),
//       lng: parseFloat(formData.lng),
//       priorityLevel: formData.priorityLevel,
//     };

//     logMessage("Sending Alert: " + JSON.stringify(alertPayload));
//   };

//   const logMessage = (message) => {
//     setLog((prevLog) => [...prevLog, message]);
//   };

//   return (
//     <div>
//       <h1>Send Alert to Team</h1>
//       <form onSubmit={handleSubmit}>
//         <label htmlFor="teamId">Team ID:</label>
//         <br />
//         <input
//           type="text"
//           id="teamId"
//           value={formData.teamId}
//           onChange={handleInputChange}
//           required
//         />
//         <br />
//         <br />

//         <label htmlFor="userId">User ID:</label>
//         <br />
//         <input
//           type="text"
//           id="userId"
//           value={formData.userId}
//           onChange={handleInputChange}
//           required
//         />
//         <br />
//         <br />

//         <label htmlFor="lat">Latitude:</label>
//         <br />
//         <input
//           type="number"
//           id="lat"
//           value={formData.lat}
//           onChange={handleInputChange}
//           step="any"
//           required
//         />
//         <br />
//         <br />

//         <label htmlFor="lng">Longitude:</label>
//         <br />
//         <input
//           type="number"
//           id="lng"
//           value={formData.lng}
//           onChange={handleInputChange}
//           step="any"
//           required
//         />
//         <br />
//         <br />

//         <label htmlFor="priorityLevel">Priority Level:</label>
//         <br />
//         <select
//           id="priorityLevel"
//           value={formData.priorityLevel}
//           onChange={handleInputChange}
//         >
//           <option value="LOW">Low</option>
//           <option value="MEDIUM">Medium</option>
//           <option value="HIGH">High</option>
//         </select>
//         <br />
//         <br />

//         <button type="submit">Send Alert</button>
//       </form>

//       <div
//         style={{
//           border: "1px solid #ccc",
//           padding: "10px",
//           height: "200px",
//           overflowY: "scroll",
//           marginTop: "20px",
//         }}
//       >
//         {log.map((message, index) => (
//           <div key={index}>{message}</div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AlertForm;

