import React from "react";
import { Tab, Nav } from "react-bootstrap";
import RouteMap from "./RouteMap";
import FrequentlyVisitedMap from "./FrequentlyVisitedMap";
import PlaceOfInterestMap from "./PlaceOfInterestMap";

const AnalyticsComponent = () => {
  return (
    <div className="container mt-5">
      <Tab.Container defaultActiveKey="routeAnalysis">
        {/* Navigation Tabs */}
        <Nav variant="tabs">
          <Nav.Item>
            <Nav.Link eventKey="routeAnalysis">Route Analysis</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="frequentlyVisited">
              Frequently Visited Locations
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="placeInterest">Place of Interest</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Tab Content */}
        <Tab.Content className="mt-3">
          <Tab.Pane eventKey="routeAnalysis" mountOnEnter unmountOnExit>
            <RouteMap />
          </Tab.Pane>
          <Tab.Pane eventKey="frequentlyVisited" mountOnEnter unmountOnExit>
            <FrequentlyVisitedMap />
          </Tab.Pane>
          <Tab.Pane eventKey="placeInterest" mountOnEnter unmountOnExit>
            <PlaceOfInterestMap />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default AnalyticsComponent;
