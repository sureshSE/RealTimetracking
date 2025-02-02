import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const WebSocketTest = () => {
  const [teamId, setTeamId] = useState("");
  const [fieldAgentId, setFieldAgentId] = useState("");
  const [logs, setLogs] = useState([]);
  
  const token = localStorage.getItem("token");
  const socketUrl = "https://uat-tracking.rmtec.in:4000/tracking-websocket"; // Replace with your WebSocket URL
  const bearerToken = `Bearer${token}`; // Your actual token
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create a socket connection
    const socketConnection = io(socketUrl, {
      transports: ["websocket"], // WebSocket transport
      query: { token: bearerToken }, // Sending token as query parameter
    });

    // Save the socket instance in state
    setSocket(socketConnection);

    // Handle events from the server (e.g., listening for messages)
    socketConnection.on("connect", () => {
      logMessage("Connected to Socket.io server");

      // Subscribe to team and field agent messages
      socketConnection.on("teamMessage", (message) => {
        logMessage("Team Message: " + message);
      });

      socketConnection.on("fieldAgentMessage", (message) => {
        logMessage("Field Agent Message: " + message);
      });
    });

    // Handle any errors
    socketConnection.on("connect_error", (error) => {
      logMessage("Connection error: " + error);
    });

    // Cleanup on component unmount
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  const logMessage = (message) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const sendTeamMessage = () => {
    if (!teamId) {
      alert("Please enter a Team ID");
      return;
    }

    const payload = {
      teamId: teamId,
      fieldAgent: null,
      payload: {
        message: `Test message for Team ID ${teamId}`,
      },
    };

    if (socket) {
      socket.emit("sendTeamMessage", payload);
      logMessage(`Sent Team Message: ${JSON.stringify(payload)}`);
    }
  };

  const sendFieldAgentMessage = () => {
    if (!fieldAgentId) {
      alert("Please enter a Field Agent ID");
      return;
    }

    const payload = {
      teamId: null,
      fieldAgent: fieldAgentId,
      payload: {
        message: `Test message for Field Agent ID ${fieldAgentId}`,
      },
    };

    if (socket) {
      socket.emit("sendFieldAgentMessage", payload);
      logMessage(`Sent Field Agent Message: ${JSON.stringify(payload)}`);
    }
  };

  return (
    <div>
      <h1>Socket.io WebSocket Test</h1>
      <div>
        <label htmlFor="teamId">Team ID:</label>
        <input
          type="text"
          id="teamId"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          placeholder="Enter Team ID"
        />
        <button onClick={sendTeamMessage}>Send Team Message</button>
      </div>

      <div>
        <label htmlFor="fieldAgentId">Field Agent ID:</label>
        <input
          type="text"
          id="fieldAgentId"
          value={fieldAgentId}
          onChange={(e) => setFieldAgentId(e.target.value)}
          placeholder="Enter Field Agent ID"
        />
        <button onClick={sendFieldAgentMessage}>Send Field Agent Message</button>
      </div>

      <h2>Logs</h2>
      <div
        id="log"
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "200px",
          overflowY: "scroll",
        }}
      >
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
  
};

export default WebSocketTest;
