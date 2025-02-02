import React from "react";
import adminLayout from "../hoc/adminLayout";
import OverviewComponent from "../components/OverviewComponent"; // Adjust the path according to your file structure
import '../assets/css/Overview.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import useHasPermission from "../utils/permission/pageAccess";
import { Helmet, HelmetProvider } from 'react-helmet-async';
const Dashboard = () => {
  const { render } = useHasPermission({
    moduleName: "overview",
  });
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Overview - RealTimeTracking</title>
          <meta name="description" content="Overview of employee performance and metrics." />
          <meta name="keywords" content="dashboard, employee, management" />
        </Helmet>
      </HelmetProvider>
      {render && (
        <>
          <h3 className="title">Overview</h3>
          <div className="overview-con">

            <OverviewComponent />
          </div>
        </>
      )}
    </>
  );
};

export default adminLayout(Dashboard);
