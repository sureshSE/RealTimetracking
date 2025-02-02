import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";

const AnalyticsComponent = ({ AgentId }) => {
  const [logs, setLogs] = useState([]);
  const [currentAgentMarkers, setCurrentAgentMarkers] = useState([]);
  const mapRef = useRef(null);
  const uiRef = useRef(null);
  const stompClientRef = useRef(null);
  const currentSubscriptionRef = useRef(null);
  const socketUrl = "https://uat-tracking.rmtec.in:4000/tracking-websocket";
  const token = localStorage.getItem("token");

  const bearerToken = `Bearer ${token}`;

  const logMessage = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const initializeMap = () => {
    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0", // Replace with your API key
    });

    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(
      document.getElementById("mapContainer"),
      defaultLayers.vector.normal.map,
      { zoom: 5, center: { lat: 20.5937, lng: 78.9629 } } // Center on India
    );

    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
    const ui = H.ui.UI.createDefault(map, defaultLayers);

    mapRef.current = map;
    uiRef.current = ui;
  };

  const clearCurrentMarkers = () => {
    if (mapRef.current && currentAgentMarkers.length > 0) {
      currentAgentMarkers.forEach((marker) => {
        mapRef.current.removeObject(marker);
      });
      setCurrentAgentMarkers([]);
    }
  };

  const addMarkerToMap = (lat, lng, label) => {
    if (!mapRef.current || !uiRef.current) return;

    const H = window.H;

    const marker = new H.map.Marker({ lat, lng });
    marker.setData(label);

    marker.addEventListener("tap", (evt) => {
      const bubble = new H.ui.InfoBubble(evt.target.getGeometry(), {
        content: evt.target.getData(),
      });
      uiRef.current.addBubble(bubble);
    });

    mapRef.current.addObject(marker);

    setCurrentAgentMarkers((prev) => [...prev, marker]);
  };

  useEffect(() => {
    const loadHereMapsScripts = async () => {
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };

      try {
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-core.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-service.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-ui.js");
        await loadScript("https://js.api.here.com/v3/3.1/mapsjs-mapevents.js");

        initializeMap();
      } catch (error) {
        console.error("Error loading HERE Maps scripts:", error);
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

  useEffect(() => {
    const socket = new SockJS(socketUrl);
    const stompClient = Stomp.over(socket);
    stompClientRef.current = stompClient;

    const headers = {
      Authorization: bearerToken,
    };

    stompClient.connect(
      headers,
      () => {
        logMessage("Connected to WebSocket server");
        subscribeToFieldAgent(AgentId); // Subscribe to the initial AgentId
      },
      (error) => {
        logMessage("WebSocket connection failed: " + JSON.stringify(error));
      }
    );

    return () => {
      if (stompClient) {
        stompClient.disconnect(() =>
          logMessage("Disconnected from WebSocket server")
        );
      }
    };
  }, [socketUrl]);

  useEffect(() => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      subscribeToFieldAgent(AgentId);
    }
  }, [AgentId]);

  const subscribeToFieldAgent = (agentId) => {
    console.log("------agentId------>", agentId);

    if (currentSubscriptionRef.current) {
      currentSubscriptionRef.current.unsubscribe();
      logMessage("Unsubscribed from previous agent");
    }

    const subscriptionPath = `/queue/agent/${agentId}`;
    logMessage(`Subscribing to: ${subscriptionPath}`);

    currentSubscriptionRef.current = stompClientRef.current.subscribe(
      subscriptionPath,
      (message) => {
        logMessage(`Received message: ${message.body}`);
        try {
          const data = JSON.parse(message.body);

          if (Array.isArray(data)) {
            clearCurrentMarkers();
            data.forEach((agent) => {
              const lat = parseFloat(agent.lat);
              const lng = parseFloat(agent.lon);
              if (!isNaN(lat) && !isNaN(lng)) {
                addMarkerToMap(lat, lng, `Agent: ${agent.name || "Unknown"}`);
              } else {
                logMessage(
                  `Invalid coordinates for agent: ${JSON.stringify(agent)}`
                );
              }
            });
          } else {
            logMessage("Unexpected response format");
          }
        } catch (error) {
          logMessage("Error parsing message: " + error.message);
        }
      }
    );

    sendFieldAgentMessage(agentId); // Send message for the new agent ID
  };

  const sendFieldAgentMessage = (agentId) => {
    if (!stompClientRef.current || !stompClientRef.current.connected) {
      logMessage("WebSocket client not connected yet.");
      return;
    }

    const payload = {
      teamId: null,
      fieldAgent: agentId,
      payload: { message: `Test message for Agent ID ${agentId}` },
    };

    console.log("Sending payload:", payload);
    stompClientRef.current.send("/app/message", {}, JSON.stringify(payload));
    logMessage("Sent message: " + JSON.stringify(payload));
  };

  return (
    <div>
      <div id="mapContainer" style={{ width: "100%", height: "300px" }}></div>
    </div>
  );
};

export default AnalyticsComponent;
