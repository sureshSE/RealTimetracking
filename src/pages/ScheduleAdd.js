/* global google */
import React, { useEffect, useState, useRef, useContext } from "react";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete,
} from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const ScheduleAdd = () => {
  const { user } = useContext(AuthContext);
  const [sendTo, setSendTo] = useState("");
  const [date, setDate] = useState("");
  const [fieldtag, setFieldTag] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [polygonList, setPolygonList] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [polyline, setPolyline] = useState("");
  const [markers, setMarkers] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const [markerPosition, setMarkerPosition] = useState({
    lat: 40.7128,
    lng: -74.006, // Default to New York City
  });
  const navigate = useNavigate();
  const autocompleteRef = useRef(null);

  const GOOGLE_MAPS_API_KEY = "AIzaSyBVjU4ub-tClWBbtg70ebUhZ_t3UNecsTc"; // Replace with your API key

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"], // Load the Places library
  });

  useEffect(() => {
    if (user) {
      handlePolygonesDetails(user);
      handleUserDetails();
    }
  }, [user]);

  const handleMapClick = (event) => {
    const { latLng } = event;
    setMarkerPosition({
      lat: latLng.lat(),
      lng: latLng.lng(),
    });

    // Reverse geocode to get the address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: latLng.lat(), lng: latLng.lng() } },
      (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        }
      }
    );
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const newPosition = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setMarkerPosition(newPosition);
        setAddress(place.formatted_address || "");
      }
    }
  };

  const handlePolygonesDetails = async (user) => {
    try {
      const token = localStorage.getItem("token");

      await axios
        .post(
          "https://uat-tracking.rmtec.in/api/scheduledVisitTrackId/getAllPolygons",
          {
            query: "",
            variables: {
              polygonId: "",
              place: "",
              page: 0,
              limit: 30,
            },
          },

          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          if (res.statusCode !== 500) {
            setPolygonList(res.data.data.content);
          } else {
            setPolygonList([]);
          }
        });
    } catch (error) {
      console.log("-----error----->", error);
    }
  };

  const handleUserDetails = async (user) => {
    try {
      const token = localStorage.getItem("token");

      await axios
        .get(
          "https://uat-tracking.rmtec.in/api/fieldAgent/getFieldAgentByRoleId/1",

          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          setUserDetails(res.data.data);
        });
    } catch (error) {
      console.log("------error------->", error);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate required fields
    if (!sendTo || !date || !address || !note) {
      alert("Please fill out all required fields.");
      return;
    }

    const formData = {
      sendTo,
      date,
      address,
      note,
      markerPosition,
      fieldtag,
    };

    // Ensure user is available
    if (!user || !user.name) {
      alert("User information is missing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    axios
      .post(
        "https://uat-tracking.rmtec.in/api/scheduledVisitTrackId/createScheduleForWeb",
        {
          assignee: sendTo,
          assigner: user.fieldAgentId,
          timeToVisit: "10:30 AM",
          date: date,
          time: "2024-11-28T10:30:00Z",
          fieldTag: fieldtag,
          latitude: `${markerPosition.lat}`,
          longitude: `${markerPosition.lng}`,
          teamId: 1, // You might want to replace this with an actual team ID
          description: address,
          notes: note,
          taskStatus: "Pending", // default
          visitedStatus: "Not Visited",
          polygonIds: [52], // Ensure the polygonId is correct
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          // Successfully submitted
          navigate("/schedule-list");
        } else {
          alert("Something went wrong, please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error submitting data:", error);
        alert(
          "An error occurred while submitting your data. Please try again."
        );
      });

    console.log("Submitted Data:", formData);

    // Optional: Show a loading spinner while the request is in progress
  };

  const handleDropdownChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const polygon = polygonList.find((item) => item.polygonId === selectedId);
    setSelectedPolygon(polygon);

    // Generate polyline and place markers at polygon points
    if (polygon && polygon.polygons) {
      // Update the polyline string
      const polylineString = polygon.polygons
        .map((point) => `${point.lat},${point.lon}`)
        .join(" | ");
      setPolyline(polylineString);

      // Set markers at polygon points
      const newMarkers = polygon.polygons.map((point) => ({
        lat: point.lat,
        lng: point.lon,
      }));

      for (const newMarker of newMarkers) {
        setMarkerPosition(newMarker);
      }
    } else {
      setPolyline("");
      setMarkers([]);
      setMarkerPosition([]);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h3 className="mb-4 title">Schedule</h3>
      <div className="container mt-4 fieldagentmange">
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="sendTo" className="form-label">
                Send To
              </label>
              <select
                id="sendTo"
                className="form-control"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                required
              >
                <option value="">Select Recipient</option>
                {userDetails.map((user) => (
                  <option key={user.fieldAgentId} value={user.fieldAgentEmail}>
                    {user.nickName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="date" className="form-label">
                Date
              </label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="note" className="form-label">
                Note
              </label>
              <textarea
                id="note"
                className="form-control"
                rows="3"
                placeholder="Add any notes here"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>
            <div className="col-md-6">
              <label htmlFor="address" className="form-label">
                Address
              </label>
              <textarea
                rows="3"
                type="text"
                id="address"
                className="form-control"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>
            <div className="col-md-6">
            <label htmlFor="polygonDropdown" className="form-label">
                Select Polygon
              </label>
              <select
                id="polygonDropdown"
                className="form-select"
                onChange={handleDropdownChange}
              >
                <option value="">Select a Polygon</option>
                {polygonList.map((item) => (
                  <option key={item.polygonId} value={item.polygonId}>
                    {item.place || `Polygon ${item.polygonId}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="address" className="form-label">
                Schedule Name
              </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Enter Schdule Name"
                  value={fieldtag}
                onChange={(e) => setFieldTag(e.target.value)}
                required
                />
            </div>
          </div>
          <div className="row mb-3">

            <div className="col-md-6">
              <label htmlFor="search" className="form-label">
                Search Location
              </label>
              <Autocomplete
                onLoad={(autocomplete) =>
                  (autocompleteRef.current = autocomplete)
                }
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  type="text"
                  id="search"
                  className="form-control"
                  placeholder="Search for a location"
                />
              </Autocomplete>
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-12">
              <label htmlFor="map" className="form-label">
                Map (Optional)
              </label>
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ccc",
                }}
                center={markerPosition}
                zoom={14}
                onClick={handleMapClick}
              >
                <Marker position={markerPosition} />
                {markers.map((marker, index) => (
                  <Marker key={index} position={marker} />
                ))}
              </GoogleMap>
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-primary btn-sm fieldadd-btn"
              >
                Submit
              </button>
              <button
                type="cancel"
                className="btn btn-primary btn-sm cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default adminLayout(ScheduleAdd);
