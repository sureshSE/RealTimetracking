/* global H */
import React, { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import adminLayout from "../hoc/adminLayout";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Helmet, HelmetProvider } from "react-helmet-async";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const mapRef = useRef(null);
  const platformRef = useRef(null);
  const uiRef = useRef(null);

  const [markerPosition, setMarkerPosition] = useState({
    lat: 40.7128,
    lng: -74.006, // Default to New York City
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      handlePolygonesDetails(user);
      handleUserDetails();
    }
  }, [user]);

  useEffect(() => {
    initializeMap();
  }, [markerPosition, markers]);

  const initializeMap = () => {
    if (!mapRef.current) {
      const platform = new H.service.Platform({
        apikey: "KRRMt1-LeUW4XhK6v3m9hJYmY0wp0Q3CswNQc4ThGH0", // Replace with your HERE Maps API key
      });
      platformRef.current = platform;

      const defaultLayers = platform.createDefaultLayers();

      const map = new H.Map(
        document.getElementById("hereMap"),
        defaultLayers.vector.normal.map,
        {
          center: markerPosition,
          zoom: 14,
        }
      );

      // Enable map events and UI
      const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
      const ui = H.ui.UI.createDefault(map, defaultLayers);
      uiRef.current = ui;

      mapRef.current = map;
    } else {
      const map = mapRef.current;
      map.setCenter(markerPosition);

      // Clear existing markers
      map.getObjects().forEach((obj) => map.removeObject(obj));

      // Add marker for the current position
      const marker = new H.map.Marker(markerPosition);
      map.addObject(marker);

      // Add polygon markers
      markers.forEach((markerPos) => {
        const polygonMarker = new H.map.Marker(markerPos);
        map.addObject(polygonMarker);
      });
    }
  };

  const handleMapClick = (evt) => {
    if (!evt || !evt.currentPointer) {
      console.error("Invalid map event:", evt);
      return;
    }

    const map = mapRef.current;
    map.addEventListener("tap", handleMapClick);

    const coord = map.screenToGeo(
      evt.currentPointer.viewportX,
      evt.currentPointer.viewportY
    );

    if (coord) {
      setMarkerPosition({ lat: coord.lat, lng: coord.lng });

      // Add marker to map
      const marker = new H.map.Marker({ lat: coord.lat, lng: coord.lng });
      map.addObject(marker);
    }
  };

  const reverseGeocode = (lat, lng) => {
    const platform = platformRef.current;
    const geocoder = platform.getSearchService();

    geocoder.reverseGeocode(
      {
        at: `${lat},${lng}`,
      },
      (result) => {
        if (result && result.items.length > 0) {
          setAddress(result.items[0].address.label);
        }
      },
      (error) => {
        console.error("Reverse geocoding failed:", error);
      }
    );
  };

  // const searchLocation = (query) => {
  //   if (!query) {
  //     setSuggestions([]);
  //     return;
  //   }

  //   const platform = platformRef.current;
  //   const autosuggestService = platform.getSearchService();

  //   autosuggestService.autosuggest(
  //     {
  //       q: query,
  //       at: `${markerPosition.lat},${markerPosition.lng}`,
  //     },
  //     (result) => {
  //       if (result && result.items) {
  //         setSuggestions(result.items);
  //       }
  //     },
  //     (error) => {
  //       console.error("Autosuggest failed:", error);
  //     }
  //   );
  // };

  // const handleSuggestionClick = (suggestion) => {
  //   if (suggestion.position) {
  //     setMarkerPosition({
  //       lat: suggestion.position.lat,
  //       lng: suggestion.position.lng,
  //     });
  //     setAddress(suggestion.address.label);
  //     setSuggestions([]);
  //     setSearchQuery(suggestion.address.label);
  //   }
  // };

  const handlePolygonesDetails = async (user) => {
    try {
      const token = localStorage.getItem("token");

      await axios
        .post(
          "https://uat-tracking.rmtec.in:4000/api/scheduledVisitTrackId/getAllPolygons",
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
          "https://uat-tracking.rmtec.in:4000/api/fieldAgent/getFieldAgentByRoleId/1",

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

    if (!sendTo || !date || !address || !note) {
      alert("Please fill out all required fields.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("User is not authenticated.");
      return;
    }

    axios
      .post(
        "https://uat-tracking.rmtec.in:4000/api/scheduledVisitTrackId/createScheduleForWeb",
        {
          assignee: sendTo,
          assigner: user.fieldAgentId,
          timeToVisit: "10:30 AM",
          date: date,
          time: "2024-11-28T10:30:00Z",
          fieldTag: fieldtag,
          latitude: `${markerPosition.lat}`,
          longitude: `${markerPosition.lng}`,
          teamId: 1,
          description: address,
          notes: note,
          taskStatus: "Pending",
          visitedStatus: "Not Visited",
          polygonIds: [52],
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
  };

  const handleDropdownChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const polygon = polygonList.find((item) => item.polygonId === selectedId);
    setSelectedPolygon(polygon);

    if (polygon && polygon.polygons) {
      const polylineString = polygon.polygons
        .map((point) => `${point.lat},${point.lon}`)
        .join(" | ");
      setPolyline(polylineString);

      const newMarkers = polygon.polygons.map((point) => ({
        lat: point.lat,
        lng: point.lon,
      }));

      setMarkers(newMarkers);
    } else {
      setPolyline("");
      setMarkers([]);
    }
  };

  const searchLocation = (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const platform = platformRef.current;
    const autosuggestService = platform.getSearchService();

    autosuggestService.autosuggest(
      {
        q: query,
        at: `${markerPosition.lat},${markerPosition.lng}`,
      },
      (result) => {
        if (result && result.items) {
          setSuggestions(result.items);
        }
      },
      (error) => {
        console.error("Autosuggest failed:", error);
      }
    );
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion?.position && suggestion?.address?.label) {
      setMarkerPosition({
        lat: suggestion.position.lat,
        lng: suggestion.position.lng,
      });
      setAddress(suggestion.address.label);
      setSuggestions([]);
      setSearchQuery(suggestion.address.label);
    }
  };

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Schedule - RealTimeTracking</title>
          <meta
            name="description"
            content="Overview of field agent performance and metrics."
          />
          <meta name="keywords" content="dashboard, field agent, management" />
        </Helmet>
      </HelmetProvider>
      <h3 className="mb-4 title">Create Schedule</h3>
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
              <label htmlFor="fieldtag" className="form-label">
                Schedule Name
              </label>
              <input
                type="text"
                id="fieldtag"
                className="form-control"
                placeholder="Enter Schedule Name"
                value={fieldtag}
                onChange={(e) => setFieldTag(e.target.value)}
                required
              />
            </div>
            {/* <div className="col-md-6">
              <label htmlFor="searchQuery" className="form-label">
                Search Location
              </label>
              <input
                type="text"
                id="searchQuery"
                className="form-control"
                placeholder="Search for a location"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchLocation(e.target.value);
                }}
              />
              {suggestions.length > 0 && (
                <ul className="list-group mt-2">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.address.label}
                    </li>
                  ))}
                </ul>
              )}
            </div> */}

            <div className="col-md-6">
              <label htmlFor="searchQuery" className="form-label">
                Search Location
              </label>
              <input
                type="text"
                id="searchQuery"
                className="form-control"
                placeholder="Search for a location"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchLocation(e.target.value);
                }}
              />
              {suggestions.length > 0 && (
                <ul className="list-group mt-2">
                  {suggestions
                    .filter((suggestion) => suggestion?.address?.label)
                    .map((suggestion, index) => (
                      <li
                        key={index}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.address.label}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-12">
              <label htmlFor="hereMap" className="form-label">
                Map
              </label>
              <div
                id="hereMap"
                style={{
                  width: "100%",
                  height: "300px",
                  border: "1px solid #ccc",
                }}
                onClick={handleMapClick}
              ></div>
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
